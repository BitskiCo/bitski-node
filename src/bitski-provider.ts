import { AccessToken } from './access-token';
import { OAuthHttpProvider } from './oauth-http-provider';
import OAuth2 from 'simple-oauth2';

const BITSKI_API_V1_HOST = 'https://api.bitski.com/v1';

/**
 * A Web3 provider that connects to the Bitski service
 */
export class BitskiProvider extends OAuthHttpProvider {

  private networkName: string;
  private settings: any;
  private oauthClient: any;

  /**
   * @param networkName Network name
   * @param opts Options
   */
  constructor(networkName: string = 'mainnet', opts: object) {
    let settings = {
      additionalHeaders: undefined,
      client: {
        id: null,
        secret: null
      },
      auth: {
        tokenHost: 'https://account.bitski.com',
        tokenPath: '/oauth2/token'
      },
      tokenConfig: {
        scope: 'eth_sign'
      }
    };
    Object.assign(settings, opts);
    const rpcURL = `${BITSKI_API_V1_HOST}/web3/${networkName}`;
    super(rpcURL, 0, settings.additionalHeaders);
    this.oauthClient = OAuth2.create({ client: settings.client, auth: settings.auth });
    this.networkName = networkName;
    this.settings = settings;
  }

  public getAccessToken(): Promise<AccessToken> {
    if (this.accessToken && this.accessToken.expired === false) {
      return Promise.resolve(this.accessToken);
    }
    return this.oauthClient.clientCredentials.getToken(this.settings.tokenConfig).then(accessTokenResult => {
      const token = this.oauthClient.accessToken.create(accessTokenResult).token;
      const accessToken = new AccessToken(token.access_token, token.expires_at);
      this.setAccessToken(accessToken);
      return accessToken;
    });
  }
}
