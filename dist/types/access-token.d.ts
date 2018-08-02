/**
 * A token that provides access to Bitski on behalf of a user.
 */
export declare class AccessToken {
    token: string;
    expiresAt?: number;
    readonly expired: boolean;
    constructor(token: string, expiresIn?: number);
}
