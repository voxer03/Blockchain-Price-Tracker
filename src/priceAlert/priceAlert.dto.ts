import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class CreatePriceAlertDto {
  @ApiProperty({
    type: String,
    description: 'chain name either Ethereum or Polygon',
  })
  chain: string;
  @ApiProperty({
    type: String,
    description: 'Price in dollar to set alert for',
  })
  priceInDollar: string;
  @ApiProperty({
    type: String,
    description: 'Email to send alert to',
  })
  email: string;
}
