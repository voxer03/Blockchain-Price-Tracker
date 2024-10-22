import { Body, Controller, Get, NotFoundException, Post } from '@nestjs/common';
import { PriceAlertService } from './priceAlert.service';
import { CreatePriceAlertDto } from './priceAlert.dto';
import { TokenService } from 'src/tokens/tokens.service';
import { ApiNotFoundResponse, ApiTags } from '@nestjs/swagger';
import { ResponseData } from 'src/common/types';

@ApiTags('Price Alert')
@Controller()
export class PriceAlertController {
  constructor(
    private readonly priceAlertService: PriceAlertService,
    private tokenService: TokenService,
  ) {}

  @Post('/price-alert/create')
  @ApiNotFoundResponse({ description: 'Unsupported chain' })
  async createPriceAlert(
    @Body() createPriceAlertDto: CreatePriceAlertDto,
  ): Promise<ResponseData> {
    const tokenDetails = await this.tokenService.getTokenDetailsForName(
      createPriceAlertDto.chain,
    );
    if (!tokenDetails) {
      throw new NotFoundException('Token for given name not found.');
    }
    await this.priceAlertService.createPriceAlert({
      tokenId: tokenDetails.id,
      email: createPriceAlertDto.email,
      price: createPriceAlertDto.priceInDollar,
    });
    return {
      success: true,
      message: 'Price alert created successfully',
    };
  }
}
