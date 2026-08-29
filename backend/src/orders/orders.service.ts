import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateOrderDto } from './dto/order-requests.dto';
import { OrderResponseDto, OrderItemResponseDto } from './dto/order-response.dto';
import {
  User,
  UserRole,
  LanguageCode,
  ProductStatus,
  VariantStatus,
  OrderStatus,
  PaymentStatus,
  FulfillmentStatus,
  CartStatus,
  InventoryMovementType,
} from '@prisma/client';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calculates shipping rate based on method and order subtotal in IDR
   */
  private calculateShipping(method: string, subtotalIdr: bigint): bigint {
    const normalizedMethod = (method || 'standard').toLowerCase().trim();
    if (normalizedMethod === 'express') {
      return 120000n;
    }
    if (normalizedMethod === 'concierge') {
      return 250000n;
    }
    // Standard shipping: Free if subtotal >= 1.500.000 IDR, else 50.000 IDR
    return subtotalIdr >= 1500000n ? 0n : 50000n;
  }

  /**
   * Generates a unique sequential order number in format NOV-YYYY-XXXX
   */
  private async generateOrderNumber(year: number): Promise<string> {
    const yearPrefix = `NOV-${year}-`;
    const count = await this.prisma.order.count({
      where: {
        orderNumber: { startsWith: yearPrefix },
      },
    });
    // Seed dataset has 5 orders (0104 to 0108), so next sequential order is 104 + count (e.g. 109)
    const nextSeq = 104 + count;
    return `${yearPrefix}${String(nextSeq).padStart(4, '0')}`;
  }

  /**
   * Formats raw Prisma order into customer-safe OrderResponseDto
   */
  private formatOrder(order: any, language: LanguageCode = LanguageCode.id): OrderResponseDto {
    const items: OrderItemResponseDto[] = (order.items || []).map((item: any) => {
      const primaryImage =
        item.variant?.images?.find((img: any) => img.isPrimary)?.imageUrl ||
        item.variant?.images?.[0]?.imageUrl ||
        item.product?.images?.find((img: any) => img.isPrimary)?.imageUrl ||
        item.product?.images?.[0]?.imageUrl ||
        null;

      return {
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        productName: item.productNameSnapshot,
        sku: item.skuSnapshot,
        colorName: item.colorSnapshot,
        size: item.sizeSnapshot,
        unitPriceIdr: Number(item.unitPriceIdr),
        quantity: item.quantity,
        lineTotalIdr: Number(item.lineTotalIdr),
        imageUrl: primaryImage,
      };
    });

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      fulfillmentStatus: order.fulfillmentStatus,
      subtotalIdr: Number(order.subtotalIdr),
      shippingIdr: Number(order.shippingIdr),
      taxIdr: Number(order.taxIdr),
      discountIdr: Number(order.discountIdr),
      totalIdr: Number(order.totalIdr),
      currency: order.currency || 'IDR',
      customerEmail: order.customerEmail,
      shippingAddress: order.shippingAddressSnapshot,
      items,
      placedAt: order.placedAt,
      createdAt: order.createdAt,
    };
  }

  /**
   * Places a new order from the customer's authoritative cart inside a robust atomic transaction
   */
  async createOrder(
    user: User,
    dto: CreateOrderDto,
    language: LanguageCode = LanguageCode.id,
  ): Promise<OrderResponseDto> {
    // 1. Fetch customer's active cart
    const cart = await this.prisma.cart.findFirst({
      where: {
        userId: user.id,
        status: CartStatus.active,
      },
      include: {
        items: {
          include: {
            variant: {
              include: {
                inventory: true,
                images: true,
                product: {
                  include: {
                    translations: true,
                    images: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!cart || !cart.items || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty. Cannot place an order without cart items.');
    }

    // 2. Pre-transaction integrity and availability validation
    let subtotalBigInt = 0n;

    for (const item of cart.items) {
      const variant = item.variant;
      if (!variant || !variant.product) {
        throw new BadRequestException(`Invalid product variant in cart (${item.variantId})`);
      }

      if (variant.product.status !== ProductStatus.active) {
        throw new ConflictException(`Product "${variant.product.skuRoot}" is no longer active`);
      }

      if (variant.status !== VariantStatus.active) {
        throw new ConflictException(`Variant "${variant.sku}" is no longer active`);
      }

      const inv = variant.inventory;
      if (!inv) {
        throw new ConflictException(`Inventory not found for variant "${variant.sku}"`);
      }

      const availableQty = inv.quantityOnHand - inv.reservedQuantity;
      if (availableQty < item.quantity) {
        throw new ConflictException(
          `Insufficient stock for SKU ${variant.sku}. Available: ${availableQty}, Requested: ${item.quantity}`,
        );
      }

      // Revalidate server-authoritative price
      const unitPrice = variant.priceOverrideIdr ?? variant.product.basePriceIdr;
      const lineTotal = BigInt(unitPrice) * BigInt(item.quantity);
      subtotalBigInt += lineTotal;
    }

    // 3. Calculate authoritative shipping & total
    const shippingBigInt = this.calculateShipping(dto.shippingMethod, subtotalBigInt);
    const totalBigInt = subtotalBigInt + shippingBigInt;
    const currentYear = new Date().getFullYear();
    const orderNumber = await this.generateOrderNumber(currentYear);

    // 4. Execute atomic database transaction
    const createdOrder = await this.prisma.$transaction(async (tx) => {
      // a) Re-verify and lock inventory inside transaction
      for (const item of cart.items) {
        const freshInv = await tx.inventory.findUnique({
          where: { variantId: item.variantId },
        });

        if (!freshInv) {
          throw new ConflictException(`Inventory record missing for SKU ${item.variant.sku}`);
        }

        const freshAvailable = freshInv.quantityOnHand - freshInv.reservedQuantity;
        if (freshAvailable < item.quantity) {
          throw new ConflictException(
            `Insufficient stock for SKU ${item.variant.sku}. Available: ${freshAvailable}, Requested: ${item.quantity}`,
          );
        }
      }

      // b) Create Order record
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: user.id,
          customerEmail: dto.shippingAddress.email || user.email,
          status: OrderStatus.pending,
          paymentStatus: PaymentStatus.pending,
          fulfillmentStatus: FulfillmentStatus.unfulfilled,
          subtotalIdr: subtotalBigInt,
          discountIdr: 0n,
          shippingIdr: shippingBigInt,
          taxIdr: 0n,
          totalIdr: totalBigInt,
          currency: 'IDR',
          shippingAddressSnapshot: {
            recipientName: dto.shippingAddress.fullName,
            phone: dto.shippingAddress.phone,
            email: dto.shippingAddress.email,
            addressLine1: dto.shippingAddress.street,
            city: dto.shippingAddress.city,
            province: dto.shippingAddress.province,
            postalCode: dto.shippingAddress.postalCode,
            country: dto.shippingAddress.country || 'Indonesia',
            notes: dto.shippingAddress.notes || null,
            shippingMethod: dto.shippingMethod,
          },
          billingAddressSnapshot: {
            recipientName: dto.shippingAddress.fullName,
            addressLine1: dto.shippingAddress.street,
            city: dto.shippingAddress.city,
            province: dto.shippingAddress.province,
            postalCode: dto.shippingAddress.postalCode,
            country: dto.shippingAddress.country || 'Indonesia',
          },
          placedAt: new Date(),
        },
      });

      // c) Create Order Items historical snapshots
      for (const item of cart.items) {
        const variant = item.variant;
        const product = variant.product;
        const translation =
          product.translations?.find((t) => t.language === language) ||
          product.translations?.find((t) => t.language === LanguageCode.id) ||
          product.translations?.[0];

        const unitPrice = variant.priceOverrideIdr ?? product.basePriceIdr;
        const lineTotal = BigInt(unitPrice) * BigInt(item.quantity);

        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: product.id,
            variantId: variant.id,
            productNameSnapshot: translation?.name || product.skuRoot,
            skuSnapshot: variant.sku,
            colorSnapshot: variant.colorName,
            sizeSnapshot: variant.size,
            unitPriceIdr: BigInt(unitPrice),
            quantity: item.quantity,
            lineTotalIdr: lineTotal,
          },
        });
      }

      // d) Create Order Status History initial transition
      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          fromStatus: null,
          toStatus: OrderStatus.pending,
          note: 'Order created by customer via checkout',
          changedBy: user.id,
        },
      });

      // e) Create initial Payment record with pending status
      await tx.payment.create({
        data: {
          orderId: order.id,
          provider: 'manual',
          amountIdr: totalBigInt,
          status: PaymentStatus.pending,
          method: 'PENDING_SELECTION',
        },
      });

      // f) Reserve inventory & record audit movements
      for (const item of cart.items) {
        await tx.inventory.update({
          where: { variantId: item.variantId },
          data: {
            reservedQuantity: { increment: item.quantity },
          },
        });

        await tx.inventoryMovement.create({
          data: {
            variantId: item.variantId,
            movementType: InventoryMovementType.reservation,
            quantityDelta: item.quantity,
            referenceType: 'order',
            referenceId: order.id,
            note: `Reserved ${item.quantity} pieces for order ${orderNumber}`,
            createdBy: user.id,
          },
        });
      }

      // g) Finalize and convert customer's cart
      await tx.cart.update({
        where: { id: cart.id },
        data: {
          status: CartStatus.converted,
        },
      });

      // Clear cart items from converted cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      // h) Save customer address if requested
      if (dto.shippingAddress.saveAddress) {
        await tx.address.create({
          data: {
            userId: user.id,
            label: 'Utama',
            recipientName: dto.shippingAddress.fullName,
            phone: dto.shippingAddress.phone,
            addressLine1: dto.shippingAddress.street,
            city: dto.shippingAddress.city,
            province: dto.shippingAddress.province,
            postalCode: dto.shippingAddress.postalCode,
            countryCode: 'ID',
            isDefault: true,
          },
        });
      }

      // Return newly created order with relations
      return tx.order.findUnique({
        where: { id: order.id },
        include: {
          items: {
            include: {
              product: { include: { images: true } },
              variant: { include: { images: true } },
            },
          },
        },
      });
    });

    this.logger.log(`Order successfully placed: ${createdOrder?.orderNumber} (User: ${user.id})`);
    return this.formatOrder(createdOrder, language);
  }

  /**
   * Retrieves an order by ID with customer ownership protection
   */
  async getOrderById(
    user: User,
    orderId: string,
    language: LanguageCode = LanguageCode.id,
  ): Promise<OrderResponseDto> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: { include: { images: true } },
            variant: { include: { images: true } },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    if (order.userId !== user.id && user.role !== UserRole.admin) {
      throw new ForbiddenException('You do not have permission to view this order');
    }

    return this.formatOrder(order, language);
  }

  /**
   * Retrieves all orders for the authenticated customer
   */
  async getUserOrders(
    user: User,
    language: LanguageCode = LanguageCode.id,
  ): Promise<OrderResponseDto[]> {
    const orders = await this.prisma.order.findMany({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            product: { include: { images: true } },
            variant: { include: { images: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((o) => this.formatOrder(o, language));
  }
}
