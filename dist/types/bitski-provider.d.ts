import { AccessToken } from './access-token';
import { OAuthHttpProvider } from './oauth-http-provider';
/**
 * A Web3 provider that connects to the Bitski service
 */
export declare class BitskiProvider extends OAuthHttpProvider {
    private networkName;
    private settings;
    private oauthClient;
    /**
     * @param networkName Network name
     * @param opts Options
     */
    constructor(networkName: string | undefined, opts: object);
    getAccessToken(): Promise<AccessToken>;
}
