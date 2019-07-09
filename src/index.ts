import { AccessTokenProvider, BitskiEngineOptions } from 'bitski-provider';
import { AnonymousTokenProvider } from './auth/anonymous-token-provider';
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
export interface ProviderOptions extends BitskiEngineOptions {
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
  let tokenProvider: AccessTokenProvider;
  if (opts.credentials) {
    // Create a credential token provider if using app wallet.
    tokenProvider = new CredentialTokenProvider(opts.credentials, opts.oauth);
  } else {
    // Create a logged out token provider if not using app wallet.
    tokenProvider = new AnonymousTokenProvider();
  }
  // Check opts.network as well for backwards compatibility
  const network = opts.networkName || opts.network;
  // Create the provider
  const provider = new BitskiNodeProvider(clientId, tokenProvider, network, opts);
  provider.start();
  return provider;
}

export { ProviderManager } from './provider-manager';
