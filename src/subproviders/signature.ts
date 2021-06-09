import { Subprovider } from '@bitski/provider-engine';
import { AccessTokenProvider, JSONRPCRequestPayload, JSONRPCResponsePayload } from 'bitski-provider';
import { access } from 'fs';
import JsonRpcError from 'json-rpc-error';
import { ProviderOptions } from 'src';
import { NodeFetchSubprovider } from './fetch';

export const BITSKI_RPC_BASE_URL = 'https://api.bitski.com/v1/web3';

const DEFAULT_SIGNATURE_METHODS = [
  'eth_sendTransaction',
  'eth_signTransaction',
  'eth_sign',
  'personal_sign',
  'eth_signTypedData',
]

type JSONRPCResponseHandler = (error?: JsonRpcError, result?: any) => void;


/**
 * A Subprovider that manages the interface between JSON-RPC and Bitski's proprietary transaction signing flow.
 * This class is responsible for transforming the JSON-RPC request into a Transaction object that the Bitski signer understands.
 * Also responsible for submitting the transaction to the network, and converting the response back into an RPC response.
 *
 * Important: this class assumes the transaction has all the necessary fields populated. The TransactionValidatorSubprovider
 * should be placed in front of this subprovider.
 */
export class SignatureSubprovider extends Subprovider {
  protected chainId: number;
  protected sidechainSubprovider: Subprovider;
  protected clientId: string;
  protected tokenProvider: AccessTokenProvider;
  protected providerOptions?: ProviderOptions;
  protected signatureMethods: string[];

  constructor(chainId: number, sidechainSubprovider: Subprovider, clientId: string, tokenProvider: AccessTokenProvider, options?: ProviderOptions, signatureMethods?: string[]) {
    super();
    this.chainId = chainId;
    this.sidechainSubprovider = sidechainSubprovider;
    this.clientId = clientId;
    this.tokenProvider = tokenProvider;
    this.providerOptions = options;
    this.signatureMethods = signatureMethods || DEFAULT_SIGNATURE_METHODS;
  }

  /**
   * Handle RPC request from engine (called by)
   * @param payload RPC request payload
   * @param next Callback to skip handling this request
   * @param end Completion handler
   */
  public handleRequest(payload: JSONRPCRequestPayload, next: () => void, end: JSONRPCResponseHandler): void {
    if (this.requiresSignature(payload.method)) {
      this.handleSignatureRequest(payload, next, end);
      return;
    }
    next();
  }

  /**
   * Called when a payload is received that needs a signature
   * @param payload The JSON-RPC request
   * @param callback The callback to call when the request has been handled
   */
  public async handleSignatureRequest(payload: JSONRPCRequestPayload, next: () => void, callback: JSONRPCResponseHandler) {
    try {
      const signPayload = {
        id: payload.id,
        jsonrpc: payload.jsonrpc,
        method: payload.method === 'eth_sendTransaction' ? 'eth_signTransaction' : payload.method,
        params: payload.params,
      };
      const signatureResult = await this.signTransaction(signPayload);
      if (payload.method === 'eth_sendTransaction') {
        const sendPayload = {
          id: payload.id,
          jsonrpc: payload.jsonrpc,
          method: 'eth_sendRawTransaction',
          params: [signatureResult],
        };
        this.sidechainSubprovider.handleRequest(sendPayload, next, callback);
      } else {
        callback(undefined, signatureResult);
      }
    } catch (error) {
      // Call with the error if any of the steps fail
      callback(error, undefined);
    }
  }

  protected async signTransaction(payload: JSONRPCRequestPayload): Promise<JSONRPCResponsePayload> {
    const url = `${BITSKI_RPC_BASE_URL}/chains/${this.chainId}`;
    const headers = {
      'X-API-KEY': this.clientId,
      'X-CLIENT-ID': this.clientId,
    };
    const fetchSubprovider = new NodeFetchSubprovider(url, true, this.tokenProvider, headers);
    return new Promise((accept, reject) => {
      fetchSubprovider.handleRequest(payload, () => {}, (error, result) => {
        console.log('fetchSubprovider result', error, result);
        if (error) {
          reject(error);
        } else {
          accept(result);
        }
      })
    })
  }

  /** Should this subprovider handle the request?
   * @param method The RPC method of the request
   */
  protected requiresSignature(method: string): boolean {
    return this.signatureMethods.includes(method);
  }
}