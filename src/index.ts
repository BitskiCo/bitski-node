import CredentialTokenProvider from './auth/credential-token-provider';
import BitskiNodeProvider from './provider';

/**
 * Represents a credential for authenticated requests
 */
export interface Credential {
  id: string; // Your App Wallet's credential id
  secret: string; // Your App Wallet's credential secret
}

/**
 * Additional options to create a provider with
 */
export interface ProviderOptions {
  // Ethereum network to use (mainnet, rinkeby, kovan). default: mainnet
  networkName?: string;
  // deprecated - use networkName instead
  network?: string;
  // Your App Wallet credentials (required to use eth_accounts, or signing)
  credentials?: Credential;
  // Additional headers to include with your http requests to bitski
  additionalHeaders?: object;
  // Additional oauth settings. You shouldn't need to use this in most cases.
  oauth?: any;
}

/**
 * Get a Bitski web3 provider for Node
 * @param clientId Your Bitski client id
 * @param options Additional options to configure your provider
 */
export function getProvider(clientId: string, options?: ProviderOptions): BitskiNodeProvider {
  const opts = options || {};
  const tokenProvider = new CredentialTokenProvider(opts.credentials || {}, opts.oauth);
  // Check opts.network as well for backwards compatibility
  const network = opts.networkName || opts.network;
  const provider = new BitskiNodeProvider(clientId, tokenProvider, network, opts);
  provider.start();
  return provider;
}
