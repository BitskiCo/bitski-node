export enum BitskiErrorCode {
  // Passed an invalid client id when configuring the SDK
  InvalidClientId = 2000,
  // Requested an unsupported network name
  InvalidNetworkName = 2001,
}

export class BitskiError extends Error {

  public static InvalidClientId(clientId): BitskiError {
    return new BitskiError(`Invalid client id: ${clientId}.`, BitskiErrorCode.InvalidClientId);
  }

  public static InvalidNetworkName(name): BitskiError {
    return new BitskiError(`Invalid network name: ${name}. Check the documentation for supported values.`, BitskiErrorCode.InvalidNetworkName);
  }

  public name: string = 'BitskiError';
  public code: BitskiErrorCode;

  constructor(message: string, code: BitskiErrorCode) {
    super(message);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, BitskiError);
    }
    this.code = code;
  }

}
