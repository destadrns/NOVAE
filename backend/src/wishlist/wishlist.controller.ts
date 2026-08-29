import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';
import { AddToWishlistDto, WishlistResponseDto } from './dto/wishlist.dto';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { LanguageCode } from '@prisma/client';

@ApiTags('Customer Wishlist')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  @ApiOperation({
    summary: 'Retrieve authenticated customer wishlist with garment details and availability',
  })
  @ApiResponse({
    status: 200,
    description: 'User wishlist items and count',
    type: WishlistResponseDto,
  })
  async getWishlist(
    @CurrentUser() user: any,
    @Query('lang') lang?: LanguageCode,
  ): Promise<WishlistResponseDto> {
    return this.wishlistService.getWishlist(user.id, lang);
  }

  @Post('items')
  @ApiOperation({
    summary: 'Add a garment to customer wishlist',
  })
  @ApiResponse({
    status: 200,
    description: 'Product added to wishlist successfully',
    type: WishlistResponseDto,
  })
  async addItem(
    @Body() dto: AddToWishlistDto,
    @CurrentUser() user: any,
    @Query('lang') lang?: LanguageCode,
  ): Promise<WishlistResponseDto> {
    return this.wishlistService.addItem(user.id, dto.productId, lang);
  }

  @Delete('items/:productId')
  @ApiOperation({
    summary: 'Remove a garment from customer wishlist by product ID or item ID',
  })
  @ApiParam({ name: 'productId', description: 'Product UUID or Wishlist Item UUID' })
  @ApiResponse({
    status: 200,
    description: 'Product removed from wishlist successfully',
    type: WishlistResponseDto,
  })
  async removeItem(
    @Param('productId') productId: string,
    @CurrentUser() user: any,
    @Query('lang') lang?: LanguageCode,
  ): Promise<WishlistResponseDto> {
    return this.wishlistService.removeItem(user.id, productId, lang);
  }

  @Delete()
  @ApiOperation({
    summary: 'Clear all garments from customer wishlist',
  })
  @ApiResponse({
    status: 200,
    description: 'Wishlist cleared successfully',
    type: WishlistResponseDto,
  })
  async clearWishlist(
    @CurrentUser() user: any,
    @Query('lang') lang?: LanguageCode,
  ): Promise<WishlistResponseDto> {
    return this.wishlistService.clearWishlist(user.id, lang);
  }
}
