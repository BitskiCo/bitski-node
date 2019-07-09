import { AccessToken, AccessTokenProvider } from 'bitski-provider';
import { create as OAuth2 } from 'simple-oauth2';
import { AuthenticationError } from '../errors/authentication-error';
import { Credential } from '../index';

const DEFAULT_TOKEN_OPTIONS = { scope: 'eth_sign' };
const DEFAULT_AUTH_OPTIONS = {
  auth: {
    tokenHost: 'https://account.bitski.com',
    tokenPath: '/oauth2/token',
  },
};
/**
 * An AccessTokenProvider that uses OAuth2 client credentials to get Bitski access tokens.
 */
export default class CredentialTokenProvider implements AccessTokenProvider {

  protected oauthClient: OAuth2;
  protected accessToken?: AccessToken;
  protected options: any;

  constructor(credentials: Credential, options: any) {
    this.options = Object.assign({}, DEFAULT_TOKEN_OPTIONS, options);
    const oauthSettings = Object.assign({ client: credentials }, DEFAULT_AUTH_OPTIONS);
    try {
      this.oauthClient = OAuth2(oauthSettings);
    } catch (e) {
      throw AuthenticationError.InvalidCredentials(e);
    }
  }

  public getAccessToken(): Promise<string> {
    if (this.accessToken && !this.accessToken.expired) {
      return Promise.resolve(this.accessToken.token);
    }
    return this.requestNewAccessToken().then((accessToken) => {
      return accessToken.token;
    });
  }

  public invalidateToken(): Promise<void> {
    this.accessToken = undefined;
    return Promise.resolve();
  }

  private requestNewAccessToken(): Promise<AccessToken> {
    return this.oauthClient.clientCredentials.getToken(this.options).then((result) => {
      const token = new AccessToken(result.access_token, result.expires_in);
      this.accessToken = token;
      return token;
    }).catch((error) => {
      throw AuthenticationError.AuthenticationFailed(error);
    });
  }

}
