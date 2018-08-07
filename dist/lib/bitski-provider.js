import { AccessToken } from './access-token';
import { OAuthHttpProvider } from './oauth-http-provider';
import OAuth2 from 'simple-oauth2';
const BITSKI_API_V1_HOST = 'https://api.bitski.com/v1';
/**
 * A Web3 provider that connects to the Bitski service
 */
export class BitskiProvider extends OAuthHttpProvider {
    /**
     * @param networkName Network name
     * @param opts Options
     */
    constructor(networkName = 'mainnet', opts) {
        let settings = {
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
        if (settings.client.id && settings.additionalHeaders) {
            settings.additionalHeaders.push({ name: 'X-Client-Id' });
        }
        else if (settings.client.id) {
            settings.additionalHeaders = [{ name: 'X-Client-Id', value: settings.client.id }];
        }
        const rpcURL = `${BITSKI_API_V1_HOST}/web3/${networkName}`;
        super(rpcURL, 0, settings.additionalHeaders);
        this.oauthClient = OAuth2.create({ client: settings.client, auth: settings.auth });
        this.networkName = networkName;
        this.settings = settings;
    }
    getAccessToken() {
        if (this.accessToken && this.accessToken.expired === false) {
            return Promise.resolve(this.accessToken);
        }
        return this.oauthClient.clientCredentials.getToken(this.settings.tokenConfig).then(accessTokenResult => {
            const token = this.oauthClient.accessToken.create(accessTokenResult).token;
            const accessToken = new AccessToken(token.access_token, parseInt(token.expires_in));
            this.setAccessToken(accessToken);
            return accessToken;
        });
    }
}
//# sourceMappingURL=bitski-provider.js.map