import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ShippingAddressDto {
  @ApiProperty({ description: 'Full name of recipient', example: 'Aria Wirasasmita' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ description: 'Contact email address', example: 'client@novae.atelier' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Contact phone / WhatsApp number', example: '+62 812-3456-7890' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ description: 'Full street address and unit', example: 'Jl. Senopati No. 42, Kebayoran Baru' })
  @IsString()
  @IsNotEmpty()
  street: string;

  @ApiProperty({ description: 'City or regency', example: 'Jakarta Selatan' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ description: 'Province or state', example: 'DKI Jakarta' })
  @IsString()
  @IsNotEmpty()
  province: string;

  @ApiProperty({ description: 'Postal code', example: '12190' })
  @IsString()
  @IsNotEmpty()
  postalCode: string;

  @ApiPropertyOptional({ description: 'Country name', example: 'Indonesia', default: 'Indonesia' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({ description: 'Special delivery instructions', example: 'Drop at concierge desk' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ description: 'Save address to customer profile', example: true, default: false })
  @IsBoolean()
  @IsOptional()
  saveAddress?: boolean;
}

export class CreateOrderDto {
  @ApiProperty({ description: 'Shipping and contact destination address', type: ShippingAddressDto })
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  @IsNotEmpty()
  shippingAddress: ShippingAddressDto;

  @ApiProperty({
    description: 'Selected shipping courier method',
    enum: ['standard', 'express', 'concierge'],
    example: 'standard',
  })
  @IsString()
  @IsNotEmpty()
  shippingMethod: string;

  @ApiPropertyOptional({
    description: 'Selected simulated payment method',
    enum: ['bca_va', 'mandiri_va', 'qris', 'credit_card', 'manual_transfer'],
    example: 'bca_va',
    default: 'bca_va',
  })
  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @ApiPropertyOptional({ description: 'Customer notes or special requests', example: 'Gift packaging requested' })
  @IsString()
  @IsOptional()
  customerNotes?: string;
}
