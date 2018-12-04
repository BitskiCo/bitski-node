import CredentialTokenProvider from './auth/credential-token-provider';
import BitskiNodeProvider from './provider';

/**
 * Get a Bitski web3 provider for Node
 * @param clientId Your Bitski client id
 * @param options.network Ethereum network to use (mainnet, rinkeby, kovan). default: mainnet
 * @param options.credentials Your App Wallet credentials (required to use eth_accounts, or signing)
 * @param options.credentials.id Your App Wallet's credential id
 * @param options.credentials.secret Your App Wallet's credential secret
 * @param options.oauth Additional oauth settings. You shouldn't need to use this in most cases.
 */
export function getProvider(clientId: string, options?: any): BitskiNodeProvider {
  const opts = options || {};
  const tokenProvider = new CredentialTokenProvider(opts.credentials || {}, {});
  const provider = new BitskiNodeProvider(clientId, tokenProvider, opts.network, opts.oauth);
  provider.start();
  return provider;
}
