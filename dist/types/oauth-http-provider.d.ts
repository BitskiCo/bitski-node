import { AccessToken } from './access-token';
/**
 * A class that extends Web3's HTTPProvider by adding OAuth to JSON-RPC calls.
 */
export declare class OAuthHttpProvider {
    /**
     * The access token for the current logged in user
     */
    accessToken?: AccessToken;
    /**
     * The JSON-RPC endpoint
     */
    host: string;
    timeout: number;
    headers?: [any];
    /**
     * @param host JSON-RPC endpoint
     * @param timeout Timeout in seconds
     * @param additionalHeaders Optional headers to include with every request
     */
    constructor(host: string, timeout?: number, additionalHeaders?: [any]);
    setAccessToken(accessToken?: AccessToken): void;
    getAccessToken(): Promise<AccessToken>;
    /**
     * Prepares a new XMLHttpRequest with the proper headers
     * @returns Request object that is ready for a payload.
     */
    private prepareRequest;
    send(payload: any, callback: any): void;
    /**
     * Send a web3 / JSON-RPC request asynchronously.
     * @param payload The JSON-RPC request object to send
     * @param callback Handler function invoked when the request has completed.
     */
    sendAsync(payload: any, callback: any): void;
    /**
     * Check whether we are connected to the server.
     * @returns boolean if we are connected.
     */
    connected(): boolean;
}
