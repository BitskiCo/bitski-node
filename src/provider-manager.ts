import CredentialTokenProvider from './auth/credential-token-provider';
import BitskiNodeProvider from './provider';

/**
 * A wrapper around Bitski providers for convenient use with Truffle.
 *
 * Background:
 * This is very useful because when you pass a custom provider to Truffle via a
 * function in the config, it executes that function many times during execution,
 * which will cause you to create a brand new provider for every request.
 * This caches a single provider for every network, which reduces the memory
 * footprint, and vastly speeds up execution. It also shares an access token provider
 * amongst all providers, which means that if you switch networks, it should also be
 * very quick.
 */
export class ProviderManager {
  private credential: string;
  private cachedProviders: Map<string, BitskiNodeProvider> = new Map();
  private tokenProvider: CredentialTokenProvider;

  constructor(credential: string, secret: string) {
    this.credential = credential;
    this.tokenProvider = new CredentialTokenProvider({ id: credential, secret }, {});
  }

  public getProvider(networkName: string = 'mainnet', additionalHeaders?: object): BitskiNodeProvider {
    // Check for existing provider
    const existingProvider = this.cachedProviders.get(networkName);
    if (existingProvider) {
      // Return existing provider
      return existingProvider;
    }

    // ** No existing provider, create one **
    const newProvider = new BitskiNodeProvider(this.credential, this.tokenProvider, networkName, { additionalHeaders });
    // Start the provider
    newProvider.start();
    // Cache
    this.cachedProviders.set(networkName, newProvider);
    // Return newly created provider
    return newProvider;
  }
}
