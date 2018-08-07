(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('xhr2'), require('simple-oauth2')) :
    typeof define === 'function' && define.amd ? define(['exports', 'xhr2', 'simple-oauth2'], factory) :
    (factory((global['bitski-node'] = {}),global.XMLHttpRequest,global.OAuth2));
}(this, (function (exports,XMLHttpRequest,OAuth2) { 'use strict';

    XMLHttpRequest = XMLHttpRequest && XMLHttpRequest.hasOwnProperty('default') ? XMLHttpRequest['default'] : XMLHttpRequest;
    OAuth2 = OAuth2 && OAuth2.hasOwnProperty('default') ? OAuth2['default'] : OAuth2;

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    /**
     * A token that provides access to Bitski on behalf of a user.
     */
    var AccessToken = /** @class */ (function () {
        function AccessToken(token, expiresIn) {
            this.expiresAt = undefined;
            this.token = token;
            if (expiresIn && expiresIn > 0) {
                var now = Math.floor(Date.now() / 1000);
                this.expiresAt = now + expiresIn;
            }
        }
        Object.defineProperty(AccessToken.prototype, "expired", {
            get: function () {
                if (this.expiresAt) {
                    var now = Math.floor(Date.now() / 1000);
                    var expiresIn = this.expiresAt - now;
                    return expiresIn <= 0;
                }
                return false;
            },
            enumerable: true,
            configurable: true
        });
        return AccessToken;
    }());

    /**
     * A class that extends Web3's HTTPProvider by adding OAuth to JSON-RPC calls.
     */
    var OAuthHttpProvider = /** @class */ (function () {
        /**
         * @param host JSON-RPC endpoint
         * @param timeout Timeout in seconds
         * @param additionalHeaders Optional headers to include with every request
         */
        function OAuthHttpProvider(host, timeout, additionalHeaders) {
            /**
             * The access token for the current logged in user
             */
            this.accessToken = undefined;
            this.host = host;
            this.timeout = timeout || 0;
            this.headers = additionalHeaders;
        }
        OAuthHttpProvider.prototype.setAccessToken = function (accessToken) {
            this.accessToken = accessToken;
        };
        OAuthHttpProvider.prototype.getAccessToken = function () {
            if (this.accessToken) {
                return Promise.resolve(this.accessToken);
            }
            return Promise.reject(new Error('Access token could not be found'));
        };
        /**
         * Prepares a new XMLHttpRequest with the proper headers
         * @returns Request object that is ready for a payload.
         */
        OAuthHttpProvider.prototype.prepareRequest = function () {
            var request = new XMLHttpRequest();
            request.open('POST', this.host, true);
            request.setRequestHeader('Content-Type', 'application/json');
            var headers = this.headers;
            if (headers) {
                headers.forEach(function (header) {
                    request.setRequestHeader(header.name, header.value);
                });
            }
            return this.getAccessToken().then(function (accessToken) {
                request.setRequestHeader('Authorization', "Bearer " + accessToken.token);
                return request;
            });
        };
        OAuthHttpProvider.prototype.send = function (payload, callback) {
            var _this = this;
            this.prepareRequest().then(function (request) {
                console.log(payload);
                request.onreadystatechange = function () {
                    if (request.readyState === 4 && request.timeout !== 1) {
                        var result = request.responseText;
                        var error;
                        try {
                            result = JSON.parse(result);
                        }
                        catch (e) {
                            error = new Error("Could not parse response: " + request.responseText);
                        }
                        callback(error, result);
                    }
                };
                request.ontimeout = function () {
                    callback(new Error("Connection timed out: " + _this.timeout));
                };
                try {
                    request.send(JSON.stringify(payload));
                }
                catch (error) {
                    callback(new Error("Could not connect to host " + _this.host));
                }
            }).catch(function (err) {
                callback(err);
            });
        };
        /**
         * Send a web3 / JSON-RPC request asynchronously.
         * @param payload The JSON-RPC request object to send
         * @param callback Handler function invoked when the request has completed.
         */
        OAuthHttpProvider.prototype.sendAsync = function (payload, callback) {
            return this.send(payload, callback);
        };
        /**
         * Check whether we are connected to the server.
         * @returns boolean if we are connected.
         */
        OAuthHttpProvider.prototype.connected = function () {
            return true;
        };
        return OAuthHttpProvider;
    }());

    var BITSKI_API_V1_HOST = 'https://api.bitski.com/v1';
    /**
     * A Web3 provider that connects to the Bitski service
     */
    var BitskiProvider = /** @class */ (function (_super) {
        __extends(BitskiProvider, _super);
        /**
         * @param networkName Network name
         * @param opts Options
         */
        function BitskiProvider(networkName, opts) {
            if (networkName === void 0) { networkName = 'mainnet'; }
            var _this = this;
            var settings = {
                client: {
                    id: null,
                    secret: null
                },
                auth: {
                    tokenHost: 'https://account.bitski.com',
                    tokenPath: '/oauth2/token'
                },
                tokenConfig: {
                    scope: 'eth_sign'
                }
            };
            Object.assign(settings, opts);
            if (settings.client.id && settings.additionalHeaders) {
                settings.additionalHeaders.push({ name: 'X-Client-Id' });
            }
            else if (settings.client.id) {
                settings.additionalHeaders = [{ name: 'X-Client-Id', value: settings.client.id }];
            }
            var rpcURL = BITSKI_API_V1_HOST + "/web3/" + networkName;
            _this = _super.call(this, rpcURL, 0, settings.additionalHeaders) || this;
            _this.oauthClient = OAuth2.create({ client: settings.client, auth: settings.auth });
            _this.networkName = networkName;
            _this.settings = settings;
            return _this;
        }
        BitskiProvider.prototype.getAccessToken = function () {
            var _this = this;
            if (this.accessToken && this.accessToken.expired === false) {
                return Promise.resolve(this.accessToken);
            }
            return this.oauthClient.clientCredentials.getToken(this.settings.tokenConfig).then(function (accessTokenResult) {
                var token = _this.oauthClient.accessToken.create(accessTokenResult).token;
                var accessToken = new AccessToken(token.access_token, parseInt(token.expires_in));
                _this.setAccessToken(accessToken);
                return accessToken;
            });
        };
        return BitskiProvider;
    }(OAuthHttpProvider));

    exports.BitskiProvider = BitskiProvider;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=index.js.map
