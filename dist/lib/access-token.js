/**
 * A token that provides access to Bitski on behalf of a user.
 */
export class AccessToken {
    constructor(token, expiresAt) {
        this.expiresAt = undefined;
        this.token = token;
        this.expiresAt = expiresAt;
    }
    get expired() {
        if (this.expiresAt) {
            const now = Math.floor(Date.now() / 1000);
            const expiresIn = this.expiresAt - now;
            return expiresIn <= 0;
        }
        return false;
    }
}
//# sourceMappingURL=access-token.js.map