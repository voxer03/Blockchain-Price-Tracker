import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { Token, Prisma } from '@prisma/client';

@Injectable()
export class TokenService {
  /**
   * Default Constructor.
   *
   * */
  constructor(private readonly db: DatabaseService) {}

  /**
   * Function to retrieve token details based on the token's name.
   *
   * @param name - The name of the token to search for.
   *
   * @returns A Promise that resolves to the token details
   *          if found, or `null` if no matching token exists.
   */
  async getTokenDetailsForName(name: string): Promise<Token> {
    return this.db.token.findFirst({
      where: {
        name,
      },
    });
  }

  /**
   * Function to retrieve a list of tokens based on specific filtering criteria.
   *
   *
   * @param userWhereUniqueInput - The filtering criteria for retrieving tokens
   *
   * @returns A Promise that resolves to an array of tokens matching the specified criteria,
   *          or an empty array if no tokens are found.
   */
  async getTokensList(
    userWhereUniqueInput: Prisma.TokenWhereInput,
  ): Promise<Token[] | []> {
    return this.db.token.findMany({ where: userWhereUniqueInput });
  }
}
