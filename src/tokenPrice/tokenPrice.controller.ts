import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { TokenPriceService } from './tokenPrice.service';
import { TokenService } from 'src/tokens/tokens.service';
import { ApiTags } from '@nestjs/swagger';
import { SwapRateDto } from './tokenPrice.dto';
import { ResponseData } from 'src/common/types';
import { MoralisService } from 'src/moralis/moralis.service';

@ApiTags('Token price')
@Controller()
export class TokenPriceController {
  constructor(
    private readonly tokenPriceService: TokenPriceService,
    private tokenService: TokenService,
    private moralisService: MoralisService,
  ) {}

  @Get('token-price/24h/:chain')
  async getLast24hPrices(@Param('chain') chain: string): Promise<ResponseData> {
    const tokenDetails = await this.tokenService.getTokenDetailsForName(chain);
    if (!tokenDetails) {
      throw new NotFoundException('Token for given name not found.');
    }
    const data = await this.tokenPriceService.getTokenPriceOfLast24h(
      tokenDetails.id,
    );
    return {
      success: true,
      data,
    };
  }

  @Post('/swap-rate/eth-btc')
  async getSwapRate(@Body() swapRateDto: SwapRateDto): Promise<ResponseData> {
    const btcReceivedAmount =
      await this.moralisService.getQuoteForSwapingEthForBtc(
        swapRateDto.swapAmount,
      );
    return {
      success: true,
      data: {
        btcAmount: btcReceivedAmount,
        fee: '0.3%',
      },
    };
  }
}
