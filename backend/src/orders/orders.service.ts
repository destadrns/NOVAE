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
import { SimulatePaymentDto, PaymentScenario } from './dto/simulate-payment.dto';
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
  ShipmentStatus,
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

    const payments = (order.payments || []).map((p: any) => ({
      id: p.id,
      provider: p.provider,
      method: p.method,
      amountIdr: Number(p.amountIdr),
      status: p.status,
      paidAt: p.paidAt,
    }));

    const shipment = order.shipment
      ? {
          id: order.shipment.id,
          courier: order.shipment.courier,
          service: order.shipment.service,
          trackingNumber: order.shipment.trackingNumber,
          status: order.shipment.status,
          shippedAt: order.shipment.shippedAt,
          deliveredAt: order.shipment.deliveredAt,
        }
      : null;

    const statusHistory = (order.statusHistory || []).map((h: any) => ({
      id: h.id,
      fromStatus: h.fromStatus,
      toStatus: h.toStatus,
      note: h.note,
      createdAt: h.createdAt,
    }));

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
      payments: payments.length > 0 ? payments : undefined,
      shipment,
      statusHistory: statusHistory.length > 0 ? statusHistory : undefined,
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

    let activeCart = cart;
    if (!activeCart || !activeCart.items || activeCart.items.length === 0) {
      const fallbackCart = await this.prisma.cart.findFirst({
        where: {
          status: CartStatus.active,
          items: { some: {} },
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
        orderBy: { updatedAt: 'desc' },
      });

      if (fallbackCart && fallbackCart.items.length > 0) {
        await this.prisma.cart.update({
          where: { id: fallbackCart.id },
          data: { userId: user.id },
        });
        activeCart = fallbackCart;
      }
    }

    if (!activeCart || !activeCart.items || activeCart.items.length === 0) {
      throw new BadRequestException('Cart is empty. Cannot place an order without cart items.');
    }

    // 2. Pre-transaction integrity and availability validation
    let subtotalBigInt = 0n;

    for (const item of activeCart.items) {
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
      for (const item of activeCart.items) {
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
      for (const item of activeCart.items) {
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
          method: dto.paymentMethod || 'bca_va',
        },
      });

      // f) Reserve inventory & record audit movements
      for (const item of activeCart.items) {
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

      // g) Finalize and convert customer's cart atomically with concurrency check
      const convertedCart = await tx.cart.updateMany({
        where: { id: activeCart.id, status: CartStatus.active },
        data: {
          status: CartStatus.converted,
        },
      });

      if (convertedCart.count === 0) {
        throw new ConflictException('Cart was already processed or is no longer active');
      }

      // Clear cart items from converted cart
      await tx.cartItem.deleteMany({
        where: { cartId: activeCart.id },
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
          payments: true,
          shipment: true,
          statusHistory: { orderBy: { createdAt: 'asc' } },
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
        payments: true,
        shipment: true,
        statusHistory: { orderBy: { createdAt: 'asc' } },
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
        payments: true,
        shipment: true,
        statusHistory: { orderBy: { createdAt: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((o) => this.formatOrder(o, language));
  }

  /**
   * Simulates customer payment transaction outcome (Success, Failed, Cancel)
   */
  async simulatePayment(
    user: User,
    orderId: string,
    dto: SimulatePaymentDto,
    language: LanguageCode = LanguageCode.id,
  ): Promise<OrderResponseDto> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        payments: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    if (order.userId !== user.id && user.role !== UserRole.admin) {
      throw new ForbiddenException('You do not have permission to pay for this order');
    }

    if (order.status === OrderStatus.paid) {
      throw new BadRequestException('Order is already paid');
    }
    if (order.status === OrderStatus.cancelled) {
      throw new BadRequestException('Cannot process payment for a cancelled order');
    }
    if (order.status !== OrderStatus.pending) {
      throw new BadRequestException(`Cannot process payment for order in "${order.status}" status`);
    }

    const updatedOrder = await this.prisma.$transaction(async (tx) => {
      const selectedMethod = dto.method || order.payments?.[0]?.method || 'bca_va';

      if (dto.scenario === PaymentScenario.SUCCESS) {
        if (order.payments && order.payments.length > 0) {
          await tx.payment.updateMany({
            where: { orderId: order.id },
            data: {
              status: PaymentStatus.paid,
              method: selectedMethod,
              paidAt: new Date(),
            },
          });
        } else {
          await tx.payment.create({
            data: {
              orderId: order.id,
              provider: 'manual',
              method: selectedMethod,
              amountIdr: order.totalIdr,
              status: PaymentStatus.paid,
              paidAt: new Date(),
            },
          });
        }

        await tx.order.update({
          where: { id: order.id },
          data: {
            status: OrderStatus.paid,
            paymentStatus: PaymentStatus.paid,
          },
        });

        await tx.orderStatusHistory.create({
          data: {
            orderId: order.id,
            fromStatus: order.status,
            toStatus: OrderStatus.paid,
            note: `Simulated payment successful via ${selectedMethod}`,
            changedBy: user.id,
          },
        });
      } else if (dto.scenario === PaymentScenario.FAILED) {
        if (order.payments && order.payments.length > 0) {
          await tx.payment.updateMany({
            where: { orderId: order.id },
            data: {
              status: PaymentStatus.failed,
              method: selectedMethod,
            },
          });
        }

        await tx.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: PaymentStatus.failed,
          },
        });

        await tx.orderStatusHistory.create({
          data: {
            orderId: order.id,
            fromStatus: order.status,
            toStatus: order.status,
            note: `Simulated payment failed (declined/insufficient balance) via ${selectedMethod}`,
            changedBy: user.id,
          },
        });
      } else if (dto.scenario === PaymentScenario.CANCEL) {
        if (order.payments && order.payments.length > 0) {
          await tx.payment.updateMany({
            where: { orderId: order.id },
            data: {
              status: PaymentStatus.failed,
              method: selectedMethod,
            },
          });
        }

        await tx.order.update({
          where: { id: order.id },
          data: {
            status: OrderStatus.cancelled,
            paymentStatus: PaymentStatus.failed,
            fulfillmentStatus: FulfillmentStatus.cancelled,
          },
        });

        for (const item of order.items) {
          await tx.inventory.update({
            where: { variantId: item.variantId },
            data: { reservedQuantity: { decrement: item.quantity } },
          });

          await tx.inventoryMovement.create({
            data: {
              variantId: item.variantId,
              movementType: InventoryMovementType.release,
              quantityDelta: -item.quantity,
              referenceType: 'order',
              referenceId: order.id,
              note: `Released ${item.quantity} pieces — order ${order.orderNumber} payment cancelled by customer`,
              createdBy: user.id,
            },
          });
        }

        await tx.orderStatusHistory.create({
          data: {
            orderId: order.id,
            fromStatus: order.status,
            toStatus: OrderStatus.cancelled,
            note: 'Payment cancelled by customer during checkout simulation',
            changedBy: user.id,
          },
        });
      }

      return tx.order.findUnique({
        where: { id: order.id },
        include: {
          items: {
            include: {
              product: { include: { images: true } },
              variant: { include: { images: true } },
            },
          },
          payments: true,
          shipment: true,
          statusHistory: { orderBy: { createdAt: 'asc' } },
        },
      });
    });

    this.logger.log(
      `Simulated payment for order ${updatedOrder?.orderNumber}: scenario=${dto.scenario} (User: ${user.email})`,
    );

    return this.formatOrder(updatedOrder, language);
  }

  // ==================================================================
  // ADMIN ORDER MANAGEMENT
  // ==================================================================

  /** Valid status transitions enforced server-side */
  private static readonly ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.pending]: [OrderStatus.paid, OrderStatus.cancelled],
    [OrderStatus.paid]: [OrderStatus.processing, OrderStatus.cancelled],
    [OrderStatus.processing]: [OrderStatus.shipped, OrderStatus.cancelled],
    [OrderStatus.shipped]: [OrderStatus.delivered],
    [OrderStatus.delivered]: [],
    [OrderStatus.cancelled]: [],
  };

  /**
   * Get all orders for admin dashboard with optional filters
   */
  async adminGetAllOrders(query: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    data: any[];
    meta: { page: number; limit: number; totalItems: number; totalPages: number };
  }> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.status && query.status !== 'ALL') {
      where.status = query.status.toLowerCase();
    }

    if (query.search) {
      const s = query.search.trim();
      where.OR = [
        { orderNumber: { contains: s, mode: 'insensitive' } },
        { customerEmail: { contains: s, mode: 'insensitive' } },
        { user: { fullName: { contains: s, mode: 'insensitive' } } },
      ];
    }

    const [orders, totalItems] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          user: { select: { id: true, fullName: true, email: true } },
          items: {
            include: {
              product: { include: { images: true } },
              variant: { include: { images: true } },
            },
          },
          statusHistory: { orderBy: { createdAt: 'asc' } },
          payments: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    const data = orders.map((o) => this.formatAdminOrder(o));

    return {
      data,
      meta: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  }

  /**
   * Get single order detail for admin (no ownership check)
   */
  async adminGetOrderById(orderId: string): Promise<any> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        items: {
          include: {
            product: { include: { images: true } },
            variant: { include: { images: true, inventory: true } },
          },
        },
        statusHistory: {
          include: { user: { select: { fullName: true, email: true } } },
          orderBy: { createdAt: 'asc' },
        },
        payments: true,
        shipment: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    return this.formatAdminOrder(order);
  }

  /**
   * Admin status update with transition validation and audit history
   */
  async adminUpdateOrderStatus(
    orderId: string,
    targetStatus: OrderStatus,
    adminUser: User,
    note?: string,
    trackingNumber?: string,
  ): Promise<any> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        user: { select: { id: true, fullName: true, email: true } },
        statusHistory: { orderBy: { createdAt: 'asc' } },
        payments: true,
        shipment: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    const currentStatus = order.status;
    const allowed = OrdersService.ALLOWED_TRANSITIONS[currentStatus] || [];

    if (!allowed.includes(targetStatus)) {
      throw new BadRequestException(
        `Cannot transition from "${currentStatus}" to "${targetStatus}". Allowed: [${allowed.join(', ')}]`,
      );
    }

    const updatedOrder = await this.prisma.$transaction(async (tx) => {
      // Update order status
      const updateData: any = { status: targetStatus };

      // Handle transitions
      if (targetStatus === OrderStatus.paid) {
        updateData.paymentStatus = PaymentStatus.paid;
        await tx.payment.updateMany({
          where: { orderId: order.id, status: PaymentStatus.pending },
          data: {
            status: PaymentStatus.paid,
            paidAt: new Date(),
          },
        });
      } else if (targetStatus === OrderStatus.processing) {
        updateData.fulfillmentStatus = FulfillmentStatus.processing;
      } else if (targetStatus === OrderStatus.shipped) {
        updateData.fulfillmentStatus = FulfillmentStatus.processing;
        const finalTracking = trackingNumber || `NV-JNE-${order.orderNumber.replace(/[^0-9]/g, '')}`;
        if (order.shipment) {
          await tx.shipment.update({
            where: { id: order.shipment.id },
            data: {
              trackingNumber: finalTracking,
              courier: order.shipment.courier || 'JNE Express',
              status: ShipmentStatus.shipped,
              shippedAt: new Date(),
            },
          });
        } else {
          await tx.shipment.create({
            data: {
              orderId: order.id,
              trackingNumber: finalTracking,
              courier: 'JNE Express',
              service: 'REG',
              status: ShipmentStatus.shipped,
              shippedAt: new Date(),
            },
          });
        }
      } else if (targetStatus === OrderStatus.delivered) {
        updateData.fulfillmentStatus = FulfillmentStatus.fulfilled;
        if (order.shipment) {
          await tx.shipment.update({
            where: { id: order.shipment.id },
            data: {
              status: ShipmentStatus.delivered,
              deliveredAt: new Date(),
            },
          });
        }
      } else if (targetStatus === OrderStatus.cancelled) {
        updateData.fulfillmentStatus = FulfillmentStatus.cancelled;
        if (order.paymentStatus === PaymentStatus.pending) {
          updateData.paymentStatus = PaymentStatus.failed;
          await tx.payment.updateMany({
            where: { orderId: order.id, status: PaymentStatus.pending },
            data: { status: PaymentStatus.failed },
          });
        }

        // Release reserved inventory
        for (const item of order.items) {
          await tx.inventory.update({
            where: { variantId: item.variantId },
            data: { reservedQuantity: { decrement: item.quantity } },
          });
          await tx.inventoryMovement.create({
            data: {
              variantId: item.variantId,
              movementType: InventoryMovementType.release,
              quantityDelta: -item.quantity,
              referenceType: 'order',
              referenceId: order.id,
              note: `Released ${item.quantity} pieces — order ${order.orderNumber} cancelled`,
              createdBy: adminUser.id,
            },
          });
        }
      }

      await tx.order.update({
        where: { id: orderId },
        data: updateData,
      });

      // Record status history
      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          fromStatus: currentStatus,
          toStatus: targetStatus,
          note: note || `Status changed by admin`,
          changedBy: adminUser.id,
        },
      });

      return tx.order.findUnique({
        where: { id: orderId },
        include: {
          user: { select: { id: true, fullName: true, email: true } },
          items: {
            include: {
              product: { include: { images: true } },
              variant: { include: { images: true, inventory: true } },
            },
          },
          statusHistory: {
            include: { user: { select: { fullName: true, email: true } } },
            orderBy: { createdAt: 'asc' },
          },
          payments: true,
          shipment: true,
        },
      });
    });

    this.logger.log(
      `Order ${order.orderNumber}: ${currentStatus} → ${targetStatus} (Admin: ${adminUser.email})`,
    );

    return this.formatAdminOrder(updatedOrder);
  }

  /**
   * Format order for admin consumption (richer than customer format)
   */
  private formatAdminOrder(order: any): any {
    const items = (order.items || []).map((item: any) => {
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
        inventory: item.variant?.inventory
          ? {
              quantityOnHand: item.variant.inventory.quantityOnHand,
              reservedQuantity: item.variant.inventory.reservedQuantity,
              available: item.variant.inventory.quantityOnHand - item.variant.inventory.reservedQuantity,
            }
          : null,
      };
    });

    const statusHistory = (order.statusHistory || []).map((h: any) => ({
      id: h.id,
      fromStatus: h.fromStatus,
      toStatus: h.toStatus,
      note: h.note,
      changedBy: h.user?.fullName || h.user?.email || null,
      createdAt: h.createdAt,
    }));

    const payments = (order.payments || []).map((p: any) => ({
      id: p.id,
      provider: p.provider,
      method: p.method,
      amountIdr: Number(p.amountIdr),
      status: p.status,
      paidAt: p.paidAt,
    }));

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
      customerName: order.user?.fullName || order.customerEmail,
      customerId: order.userId,
      shippingAddress: order.shippingAddressSnapshot,
      items,
      itemCount: items.reduce((s: number, i: any) => s + i.quantity, 0),
      statusHistory,
      payments,
      shipment: order.shipment
        ? {
            id: order.shipment.id,
            trackingNumber: order.shipment.trackingNumber,
            courier: order.shipment.courier,
            status: order.shipment.status,
            shippedAt: order.shipment.shippedAt,
            deliveredAt: order.shipment.deliveredAt,
          }
        : null,
      allowedTransitions: OrdersService.ALLOWED_TRANSITIONS[order.status as OrderStatus] || [],
      placedAt: order.placedAt,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}
