import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Headers,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiHeader,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CartService, CartIdentity } from './cart.service';
import { AddToCartDto, MergeCartDto, UpdateCartItemDto } from './dto/cart-requests.dto';
import { CartResponseDto } from './dto/cart-response.dto';
import { OptionalAuthGuard } from '../auth/guards/optional-auth.guard';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { LanguageCode } from '@prisma/client';

@ApiTags('Customer Cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  private extractIdentity(user: any, sessionKeyHeader?: string, sessionKeyQuery?: string): CartIdentity {
    if (user?.id) {
      return { userId: user.id };
    }
    return { sessionKey: sessionKeyHeader || sessionKeyQuery };
  }

  @Get()
  @UseGuards(OptionalAuthGuard)
  @ApiBearerAuth()
  @ApiHeader({
    name: 'x-session-key',
    required: false,
    description: 'Guest shopping session key if unauthenticated',
  })
  @ApiOperation({
    summary: 'Retrieve active shopping bag with live pricing and real-time inventory validation',
  })
  @ApiResponse({
    status: 200,
    description: 'Active shopping bag details',
    type: CartResponseDto,
  })
  async getCart(
    @CurrentUser() user: any,
    @Headers('x-session-key') sessionKeyHeader?: string,
    @Query('session_key') sessionKeyQuery?: string,
    @Query('lang') lang?: LanguageCode,
  ): Promise<CartResponseDto> {
    const identity = this.extractIdentity(user, sessionKeyHeader, sessionKeyQuery);
    return this.cartService.getCart(identity, lang);
  }

  @Post('items')
  @UseGuards(OptionalAuthGuard)
  @ApiBearerAuth()
  @ApiHeader({
    name: 'x-session-key',
    required: false,
    description: 'Guest shopping session key if unauthenticated',
  })
  @ApiOperation({
    summary: 'Add a garment variant to active shopping bag with stock availability verification',
  })
  @ApiResponse({
    status: 200,
    description: 'Item added successfully, returns updated shopping bag',
    type: CartResponseDto,
  })
  async addItem(
    @Body() dto: AddToCartDto,
    @CurrentUser() user: any,
    @Headers('x-session-key') sessionKeyHeader?: string,
    @Query('session_key') sessionKeyQuery?: string,
    @Query('lang') lang?: LanguageCode,
  ): Promise<CartResponseDto> {
    const identity = this.extractIdentity(user, sessionKeyHeader, sessionKeyQuery);
    return this.cartService.addItem(identity, dto, lang);
  }

  @Patch('items/:itemId')
  @UseGuards(OptionalAuthGuard)
  @ApiBearerAuth()
  @ApiHeader({
    name: 'x-session-key',
    required: false,
    description: 'Guest shopping session key if unauthenticated',
  })
  @ApiOperation({
    summary: 'Update item quantity in active shopping bag (0 removes item)',
  })
  @ApiParam({ name: 'itemId', description: 'Cart item UUID' })
  @ApiResponse({
    status: 200,
    description: 'Quantity updated successfully, returns updated shopping bag',
    type: CartResponseDto,
  })
  async updateItem(
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
    @CurrentUser() user: any,
    @Headers('x-session-key') sessionKeyHeader?: string,
    @Query('session_key') sessionKeyQuery?: string,
    @Query('lang') lang?: LanguageCode,
  ): Promise<CartResponseDto> {
    const identity = this.extractIdentity(user, sessionKeyHeader, sessionKeyQuery);
    return this.cartService.updateItem(identity, itemId, dto, lang);
  }

  @Delete('items/:itemId')
  @UseGuards(OptionalAuthGuard)
  @ApiBearerAuth()
  @ApiHeader({
    name: 'x-session-key',
    required: false,
    description: 'Guest shopping session key if unauthenticated',
  })
  @ApiOperation({
    summary: 'Remove an item from active shopping bag',
  })
  @ApiParam({ name: 'itemId', description: 'Cart item UUID' })
  @ApiResponse({
    status: 200,
    description: 'Item removed successfully, returns updated shopping bag',
    type: CartResponseDto,
  })
  async removeItem(
    @Param('itemId') itemId: string,
    @CurrentUser() user: any,
    @Headers('x-session-key') sessionKeyHeader?: string,
    @Query('session_key') sessionKeyQuery?: string,
    @Query('lang') lang?: LanguageCode,
  ): Promise<CartResponseDto> {
    const identity = this.extractIdentity(user, sessionKeyHeader, sessionKeyQuery);
    return this.cartService.removeItem(identity, itemId, lang);
  }

  @Delete()
  @UseGuards(OptionalAuthGuard)
  @ApiBearerAuth()
  @ApiHeader({
    name: 'x-session-key',
    required: false,
    description: 'Guest shopping session key if unauthenticated',
  })
  @ApiOperation({
    summary: 'Clear all items from active shopping bag',
  })
  @ApiResponse({
    status: 200,
    description: 'Shopping bag cleared successfully',
    type: CartResponseDto,
  })
  async clearCart(
    @CurrentUser() user: any,
    @Headers('x-session-key') sessionKeyHeader?: string,
    @Query('session_key') sessionKeyQuery?: string,
    @Query('lang') lang?: LanguageCode,
  ): Promise<CartResponseDto> {
    const identity = this.extractIdentity(user, sessionKeyHeader, sessionKeyQuery);
    return this.cartService.clearCart(identity, lang);
  }

  @Post('merge')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Merge anonymous guest cart into authenticated customer profile on sign-in',
  })
  @ApiResponse({
    status: 200,
    description: 'Cart merged successfully, returns consolidated shopping bag',
    type: CartResponseDto,
  })
  async mergeCart(
    @Body() dto: MergeCartDto,
    @CurrentUser() user: any,
    @Query('lang') lang?: LanguageCode,
  ): Promise<CartResponseDto> {
    return this.cartService.mergeCart(user.id, dto, lang);
  }
}
