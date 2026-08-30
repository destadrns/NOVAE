import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PaymentScenario {
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCEL = 'cancel',
}

export class SimulatePaymentDto {
  @ApiProperty({
    description: 'Simulated payment outcome scenario',
    enum: PaymentScenario,
    example: PaymentScenario.SUCCESS,
  })
  @IsEnum(PaymentScenario)
  @IsNotEmpty()
  scenario: PaymentScenario;

  @ApiPropertyOptional({
    description: 'Payment method name or code (e.g. bca_va, mandiri_va, qris, credit_card)',
    example: 'bca_va',
  })
  @IsString()
  @IsOptional()
  method?: string;
}
