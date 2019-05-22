import { getProvider as createProvider } from './index';
import BitskiNodeProvider from './provider';

/**
 * A wrapper around Bitski providers for convenient use with Truffle
 */
export class ProviderManager {
  private credential: string;
  private secret: string;
  private cachedProviders: Map<string, BitskiNodeProvider> = new Map();

  constructor(credential, secret) {
    this.credential = credential;
    this.secret = secret;
  }

  public getProvider(networkName: string = 'mainnet', additionalHeaders?: object): BitskiNodeProvider {
    // Check for existing provider
    const existingProvider = this.cachedProviders.get(networkName);
    if (existingProvider) {
      // Return existing provider
      return existingProvider;
    }
    // Generate options
    const options = {
      networkName,
      additionalHeaders,
      credentials: {
        id: this.credential,
        secret: this.secret,
      },
    };
    // Create provider
    const newProvider = createProvider(this.credential, options);
    // Cache
    this.cachedProviders.set(networkName, newProvider);
    // Return newly created provider
    return newProvider;
  }
}
