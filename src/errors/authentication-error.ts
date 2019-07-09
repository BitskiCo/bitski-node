export enum AuthenticationErrorCode {
  // Attempted to take an action that requires an access token, when none was available.
  NoAccessToken = 1000,
  // The credentials provided are invalid.
  InvalidCredentials = 1001,
  // Authentication using the credentials provided failed.
  AuthenticationFailed = 1002,
}

export class AuthenticationError extends Error {

  public static NoAccessToken(): AuthenticationError {
    return new AuthenticationError('This request requires an app wallet.', AuthenticationErrorCode.NoAccessToken);
  }

  public static InvalidCredentials(underlyingError?: Error): AuthenticationError {
    const err = new AuthenticationError('The credentials provided are not valid.', AuthenticationErrorCode.InvalidCredentials);
    err.underlyingError = underlyingError;
    return err;
  }

  public static AuthenticationFailed(underlyingError?: Error): AuthenticationError {
    const err = new AuthenticationError('Authentication failed. Please verify your credentials and try again.', AuthenticationErrorCode.AuthenticationFailed);
    err.underlyingError = underlyingError;
    return err;
  }

  public name: string = 'AuthenticationError';
  public code: AuthenticationErrorCode;

  // Underlying error, if available
  public underlyingError?: Error;

  constructor(message: string, code: AuthenticationErrorCode) {
    super(message);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AuthenticationError);
    }
    this.code = code;
  }

}
