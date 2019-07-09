import { AccessTokenProvider } from 'bitski-provider';
import { AuthenticationError } from '../errors/authentication-error';

/**
 * A token provider for clients that do not use App Wallet.
 * Public requests will work fine, but logged in requests will always fail.
 */
export class AnonymousTokenProvider implements AccessTokenProvider {

  public getAccessToken(): Promise<string> {
    throw AuthenticationError.NoAccessToken();
  }

  public invalidateToken(): Promise<void> {
    return Promise.resolve();
  }

}
