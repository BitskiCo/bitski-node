import Web3ProviderEngine from '@bitski/provider-engine';
import { AccessTokenProvider } from 'bitski-provider';
import { NodeFetchSubprovider } from './fetch';

const APP_WALLET_METHODS = [
  'eth_accounts',
  'eth_signTransaction',
  'eth_sendTransaction',
  'eth_sign',
  'personal_sign',
  'eth_signTypedData',
  'eth_signTypedData_v3',
];

const BITSKI_BASE_URL = 'https://api.bitski.com/v1/web3/chains';

/**
 * This class will ensure we hit Bitski's endpoints for requests that require it,
 * while the default fetch provider will use the configured network.
 */
export class AppWalletSubprovider extends NodeFetchSubprovider {

  constructor(tokenProvider: AccessTokenProvider, chainId: number = 0) {
    const rpcUrl = `${BITSKI_BASE_URL}/${chainId}/`;
    super(rpcUrl, false, tokenProvider);
  }

  public handleRequest(payload, next, end) {
    if (!APP_WALLET_METHODS.includes(payload.method)) {
      // Fallthrough to regular RPC provider
      next();
      return;
    }
    // To properly handle sidechains, we need to convert eth_sendTransaction into two requests
    // eth_signTransaction and eth_sendRawTransaction. This is because our nodes cannot
    // always forward the transaction to the right place.
    if (payload.method === 'eth_sendTransaction') {
      this.signAndSubmitTransaction(payload).then((transactionHash) => {
        end(undefined, transactionHash);
      }).catch((error) => {
        end(error);
      });
    } else {
      // Submit request without modification to Bitski's endpoint
      super.handleRequest(payload, next, end);
    }
  }

  protected signAndSubmitTransaction(payload): Promise<any> {
    if (!this.engine) {
      // The only reason this would ever happen currently is if you tried to send requests
      // before this subprovider was added to an engine.
      return Promise.reject(new Error('Configuration error. Could not find engine in AppWalletSubprovider.'));
    }
    const engine = this.engine;
    // First, sign the transaction without sending - this should be handled by this same subprovider
    return this.signTransaction(engine, payload).then((signedValue) => {
      // Then, send signed data to the network. This should be handled by the underlying rpc provider.
      return this.sendRawTransaction(engine, signedValue);
    });
  }

  protected signTransaction(engine: Web3ProviderEngine, payload): Promise<any> {
    return engine.send('eth_signTransaction', payload.params);
  }

  protected sendRawTransaction(engine: Web3ProviderEngine, rawTransaction: string): Promise<any> {
    return engine.send('eth_sendRawTransaction', [rawTransaction]);
  }

}
