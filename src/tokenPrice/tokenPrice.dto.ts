import { ApiProperty } from '@nestjs/swagger';
export class SwapRateDto {
  @ApiProperty({
    type: Number,
    description: 'Amount of eth to be swapped',
  })
  swapAmount: number;
}
