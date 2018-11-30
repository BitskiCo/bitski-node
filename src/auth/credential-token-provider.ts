import { AccessToken, AccessTokenProvider } from "bitski-provider";
import { create as OAuth2 } from 'simple-oauth2';

const DEFAULT_TOKEN_OPTIONS = { scope: 'eth_sign' };
const DEFAULT_AUTH_OPTIONS = {
  auth: {
    tokenHost: 'https://account.bitski.com',
    tokenPath: '/oauth2/token'
  }
};
/**
 * An AccessTokenProvider that uses OAuth2 client credentials to get Bitski access tokens.
 */
export default class CredentialTokenProvider implements AccessTokenProvider {

  private oauthClient: OAuth2;
  private accessToken?: AccessToken;
  private options: any;

  constructor(credentials: any, options: any) {
    const oauthSettings = Object.assign({ client: credentials }, DEFAULT_AUTH_OPTIONS);
    this.oauthClient = OAuth2(oauthSettings);
    this.options = Object.assign({}, DEFAULT_TOKEN_OPTIONS, options);
  }

  private requestNewAccessToken(): Promise<AccessToken> {
    return this.oauthClient.clientCredentials.getToken(this.options).then(result => {
      const token = new AccessToken(result.access_token, result.expires_in);
      this.accessToken = token;
      return token;
    });
  }

  public getAccessToken(): Promise<string> {
    if (this.accessToken && !this.accessToken.expired) {
      return Promise.resolve(this.accessToken.token);
    }
    return this.requestNewAccessToken().then(accessToken => {
      return accessToken.token;
    });
  }

}
