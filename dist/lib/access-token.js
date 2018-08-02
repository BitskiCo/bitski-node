/**
 * A token that provides access to Bitski on behalf of a user.
 */
export class AccessToken {
    constructor(token, expiresIn) {
        this.expiresAt = undefined;
        this.token = token;
        if (expiresIn && expiresIn > 0) {
            let now = Math.floor(Date.now() / 1000);
            this.expiresAt = now + expiresIn;
        }
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