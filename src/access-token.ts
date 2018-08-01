/**
 * A token that provides access to Bitski on behalf of a user.
 */
export class AccessToken {
  public token: string;
  public expiresAt?: number = undefined;

  get expired(): boolean {
    if (this.expiresAt) {
      const now = Math.floor(Date.now() / 1000);
      const expiresIn = this.expiresAt - now;
      return expiresIn <= 0;
    }
    return false;
  }

  constructor(token: string, expiresAt?: number) {
    this.token = token;
    this.expiresAt = expiresAt;
  }
}
