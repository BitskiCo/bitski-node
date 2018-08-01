import XMLHttpRequest from 'xhr2';
import { AccessToken } from './access-token';

/**
 * A class that extends Web3's HTTPProvider by adding OAuth to JSON-RPC calls.
 */
export class OAuthHttpProvider {
  /**
   * The access token for the current logged in user
   */
  accessToken?: AccessToken = undefined;

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
  constructor(host: string, timeout?: number, additionalHeaders?: [any]) {
    this.host = host;
    this.timeout = timeout || 0;
    this.headers = additionalHeaders;
  }

  public setAccessToken(accessToken?: AccessToken): void {
    this.accessToken = accessToken;
  }

  public getAccessToken(): Promise<AccessToken> {
    if (this.accessToken) {
      return Promise.resolve(this.accessToken);
    }
    return Promise.reject(new Error('Access token could not be found'));
  }

  /**
   * Prepares a new XMLHttpRequest with the proper headers
   * @returns Request object that is ready for a payload.
   */
  private prepareRequest(): Promise<XMLHttpRequest> {
    const request = new XMLHttpRequest();
    request.open('POST', this.host, true);
    request.setRequestHeader('Content-Type', 'application/json');

    const headers = this.headers;
    if (headers) {
      headers.forEach((header) => {
        request.setRequestHeader(header.name, header.value);
      });
    }

    return this.getAccessToken().then(accessToken => {
      request.setRequestHeader('Authorization', `Bearer ${accessToken.token}`);
      return request;
    });
  }

  public send(payload: any, callback: any): void {
    this.prepareRequest().then(request => {
      console.log(payload);
      request.onreadystatechange = () => {
          if (request.readyState === 4 && request.timeout !== 1) {
              var result = request.responseText;
              var error;

              try {
                  result = JSON.parse(result);
              } catch(e) {
                  error = new Error(`Could not parse response: ${request.responseText}`);
              }
              callback(error, result);
          }
      };

      request.ontimeout = () => {
          callback(new Error(`Connection timed out: ${this.timeout}`));
      };

      try {
          request.send(JSON.stringify(payload));
      } catch(error) {
          callback(new Error(`Could not connect to host ${this.host}`));
      }

    }).catch(err => {
      callback(err);
    });
  }

  /**
   * Send a web3 / JSON-RPC request asynchronously.
   * @param payload The JSON-RPC request object to send
   * @param callback Handler function invoked when the request has completed.
   */
  public sendAsync(payload: any, callback: any): void {
    return this.send(payload, callback);
  }

  /**
   * Check whether we are connected to the server.
   * @returns boolean if we are connected.
   */
  public connected(): boolean {
    return true;
  }
}
