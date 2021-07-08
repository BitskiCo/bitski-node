import { AuthenticatedFetchSubprovider, AccessTokenProvider, BitskiEngine, BitskiEngineOptions, Kovan, Mainnet, Network, Rinkeby  } from 'bitski-provider';
import { ProviderOptions } from './index';
import TransactionOperator from './transaction-operator';
import { FetchSubprovider } from '@bitski/provider-engine';
import { SignatureSubprovider } from './subproviders/signature';
import { networkFromName } from './utils/networkFromName';
import { NodeFetchSubprovider } from './subproviders/fetch';

export const BITSKI_RPC_BASE_URL = 'https://api.bitski.com/v1/web3';

function networkFromProviderOptions(options: ProviderOptions | string | undefined): Network {
  if (!options) {
    return Mainnet;
  }
  if (typeof options === 'string') {
    return networkFromName(options);
  }
  if (options.network) {
    if (typeof options.network === 'string') {
      return networkFromName(options.network);
    }
    return options.network;
  }
  if (options.networkName) {
    return networkFromName(options.networkName);
  }
  return Mainnet;
}

// A subprovider that loads accounts from a custom rpc endpoint.
// This is necessary because to guarantee that account related calls go through Bitski
export class RemoteAccountSubprovider extends AuthenticatedFetchSubprovider {

  public handleRequest(payload, next, end) {
    if (payload.method === 'eth_accounts') {
      this.handleAuthenticatedRequest(payload, next, end);
    } else {
      next();
    }
  }

}

/**
 * A Bitski powered web3 provider that is designed for use in Node
 */
export default class BitskiNodeProvider extends BitskiEngine {
  public network: Network;
  public clientId: string;
  public transactionOperator: TransactionOperator;
  private tokenProvider: AccessTokenProvider;
  private headers: object;

  /**
   * Creates a new BitskiNodeProvider
   * @param clientId Client id
   * @param tokenProvider An AccessTokenProvider instance for getting access tokens
   * @param options Any configuration options including custom network configuration
   */
  constructor(clientId: string, tokenProvider: AccessTokenProvider, options?: ProviderOptions) {
    super(options);
    this.clientId = clientId;
    this.network = networkFromProviderOptions(options)
    this.tokenProvider = tokenProvider;

    // Assign defaults
    this.headers = {
      'X-API-KEY': this.clientId,
      'X-CLIENT-ID': this.clientId,
    };

    // Allow for adding additional headers without overriding defaults
    if (options && options.additionalHeaders) {
      this.headers = Object.assign({}, options.additionalHeaders, this.headers);
    }

    this.addSubproviders();

    this.transactionOperator = new TransactionOperator(tokenProvider, this.network.chainId);
  }

  public getAccessToken(): Promise<string> {
    return this.tokenProvider.getAccessToken();
  }

  protected isBitskiNode(): boolean {
    return this.network.rpcUrl.includes(BITSKI_RPC_BASE_URL)
  }

  protected addSubproviders() {
    // Used for eth_accounts calls
    const accountsProvider = new RemoteAccountSubprovider(
      `${BITSKI_RPC_BASE_URL}/mainnet`,
      false,
      this.tokenProvider,
      this.headers,
    );
    this.addProvider(accountsProvider);

    // Respond to requests for sidechans that need to be signed
    const signatureSubprovider = new SignatureSubprovider(
      this.network.chainId,
      this.clientId,
      this.tokenProvider,
    );
    this.addProvider(signatureSubprovider);
      
    const fetchSubprovider = this.isBitskiNode() ? new NodeFetchSubprovider(this.network.rpcUrl, false, this.tokenProvider, this.headers) : new FetchSubprovider(this.network);
    this.addProvider(fetchSubprovider);
  }

}
