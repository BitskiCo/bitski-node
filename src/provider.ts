import { AuthenticatedFetchSubprovider } from 'bitski-provider';
import { BitskiEngine } from 'bitski-provider';
import CredentialTokenProvider from './auth/credential-token-provider';

/**
 * A Bitski powered web3 provider that is designed for use in Node
 */
export default class BitskiNodeProvider extends BitskiEngine {
  private rpcUrl: string;
  private clientId: string;
  private tokenProvider: CredentialTokenProvider;

  /**
   * Creates a new BitskiNodeProvider
   * @param clientId Client id
   * @param tokenProvider A CredentialTokenProvider for getting access tokens
   * @param networkName Ethereum network to use. Default: mainnet
   * @param options Additional options
   */
  constructor(clientId: string, tokenProvider: CredentialTokenProvider, networkName?: string, options?: any) {
    super(options);
    this.clientId = clientId;
    this.rpcUrl = `https://api.bitski.com/v1/web3/${networkName || 'mainnet'}`;
    this.tokenProvider = tokenProvider;
    this.addSubproviders();
  }

  protected addSubproviders() {
    const fetchSubprovider = new AuthenticatedFetchSubprovider(
      this.rpcUrl,
      false,
      this.tokenProvider,
      {'X-API-KEY': this.clientId, 'X-CLIENT-ID': this.clientId},
    );
    this.addProvider(fetchSubprovider);
  }

}
