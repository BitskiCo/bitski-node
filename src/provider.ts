import { AccessTokenProvider, BitskiEngine, Network } from 'bitski-provider';
import { ProviderOptions } from './index';
import { AppWalletSubprovider } from './subproviders/app-wallet';
import { NodeFetchSubprovider } from './subproviders/fetch';

/**
 * A Bitski powered web3 provider that is designed for use in Node
 */
export default class BitskiNodeProvider extends BitskiEngine {
  public network: Network;
  public clientId: string;
  private tokenProvider: AccessTokenProvider;
  private headers: object;

  /**
   * Creates a new BitskiNodeProvider
   * @param clientId Client id
   * @param tokenProvider An AccessTokenProvider instance for getting access tokens
   * @param networkName Ethereum network to use. Default: mainnet
   * @param options Additional options
   */
  constructor(clientId: string, tokenProvider: AccessTokenProvider, network: Network, options?: ProviderOptions) {
    super(options);
    this.clientId = clientId;
    this.network = network;
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
  }

  protected addSubproviders() {
    // Handle app wallet related requests
    const appWalletSubprovider = new AppWalletSubprovider(this.tokenProvider, this.network.chainId);
    this.addProvider(appWalletSubprovider);

    // Handle all other requests
    const fetchSubprovider = new NodeFetchSubprovider(
      this.network.rpcUrl,
      false,
      this.tokenProvider,
      this.headers,
    );
    this.addProvider(fetchSubprovider);
  }

}
