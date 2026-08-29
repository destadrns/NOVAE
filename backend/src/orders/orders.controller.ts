import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/order-requests.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, LanguageCode } from '@prisma/client';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Place a new order',
    description:
      'Creates a new order from the customer active cart, validates inventory, reserves stock, creates snapshots, and converts cart in an atomic transaction.',
  })
  @ApiQuery({ name: 'lang', enum: LanguageCode, required: false, description: 'Language code (default: id)' })
  @ApiResponse({ status: 201, description: 'Order successfully created', type: OrderResponseDto })
  @ApiResponse({ status: 400, description: 'Cart is empty or invalid data provided' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Insufficient stock or inactive item' })
  async createOrder(
    @CurrentUser() user: User,
    @Body() dto: CreateOrderDto,
    @Query('lang') lang?: LanguageCode,
  ): Promise<OrderResponseDto> {
    return this.ordersService.createOrder(user, dto, lang);
  }

  @Get()
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current customer order history' })
  @ApiQuery({ name: 'lang', enum: LanguageCode, required: false, description: 'Language code (default: id)' })
  @ApiResponse({ status: 200, description: 'List of customer orders', type: [OrderResponseDto] })
  async getUserOrders(
    @CurrentUser() user: User,
    @Query('lang') lang?: LanguageCode,
  ): Promise<OrderResponseDto[]> {
    return this.ordersService.getUserOrders(user, lang);
  }

  @Get(':id')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get order details by UUID' })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiQuery({ name: 'lang', enum: LanguageCode, required: false, description: 'Language code (default: id)' })
  @ApiResponse({ status: 200, description: 'Order details', type: OrderResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden access to non-owned order' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async getOrderById(
    @CurrentUser() user: User,
    @Param('id') orderId: string,
    @Query('lang') lang?: LanguageCode,
  ): Promise<OrderResponseDto> {
    return this.ordersService.getOrderById(user, orderId, lang);
  }
}
