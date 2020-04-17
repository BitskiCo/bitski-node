import { AccessTokenProvider, BitskiEngine } from 'bitski-provider';
import fetch from 'node-fetch';

interface TransactionOperatorResult {
  transaction: {
    id: string;
    params: object;
    status: string;
    hash: string;
    lastError: string;
  };
}

export default class TransactionOperator {
  private tokenProvider: AccessTokenProvider;
  private chainId: number;

  constructor(tokenProvider: AccessTokenProvider, chainId: number) {
    this.tokenProvider = tokenProvider;
    this.chainId = chainId;
  }

  public async sendTransaction(id: string, params: object): Promise<TransactionOperatorResult> {
    const accessToken = await this.tokenProvider.getAccessToken();
    const result = await fetch(`https://api.bitski.com/v1/eth/chains/${this.chainId}/transactions`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        transaction: {
          id,
          params,
        },
      }),
    });
    return await result.json();
  }
}
