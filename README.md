# Bitski Node Provider

[![npm](https://img.shields.io/npm/v/bitski-node.svg)](https://www.npmjs.com/package/bitski-node)

A Bitski powered Web3 provider for Node environments, and App Wallet.

## Installation

```
npm install --save bitski-node
```

## Basic Usage

Start by importing the SDK, as well as Web3. Then, create the provider by calling `getProvider()` and pass it to Web3. The only required parameter is a client id.

```javascript
const Bitski = require("bitski-node");
const Web3 = require("web3");

// Create bitski provider
const provider = Bitski.getProvider("YOUR CLIENT ID");

// Create web3 instance
const web3 = new Web3(provider);
```

## Usage with App Wallet

If you have an App Wallet, or want to use anything that requires an account you need to pass in your client credentials. You can create these from the [developer portal](https://developer.bitski.com).

```javascript
const Bitski = require("bitski-node");
const Web3 = require("web3");

// Configure options
const options = {
  credentials: {
    id: 'YOUR CREDENTIAL ID',
    secret: 'YOUR CREDENTIAL SECRET'
  }
};

// Pass options with the provider
const provider = Bitski.getProvider("YOUR CLIENT ID", options);
const web3 = new Web3(provider);
```

## Using other networks

Bitski is compatible with several test networks and sidechains. To use a chain other than mainnet, pass in a network in your options.

```javascript
const Bitski = require("bitski-node");
const Web3 = require("web3");

// Configure options
const options = {
  network: 'rinkeby'
};

// Pass options with the provider
const provider = Bitski.getProvider("YOUR CLIENT ID", options);
const web3 = new Web3(provider);
```

## Usage with Truffle

As of truffle v5, you can easily deploy contracts using your Bitski App Wallet. Configure your `truffle.js` to supply a provider like this:

```javascript
//truffle.js
const { ProviderManager } = require('bitski-node');

const manager = new ProviderManager('YOUR-CREDENTIAL-ID', 'YOUR-CREDENTIAL-SECRET');

module.exports = {
  networks: {
    live: {
      network_id: '1',
      provider: () => {
        return manager.getProvider('mainnet');
      }
    },
    rinkeby: {
      network_id: '4',
      provider: () => {
        return manager.getProvider('rinkeby');
      }
    }
  }
};
```

## Report Vulnerabilities
Bitski provides a “bug bounty” to engage with the security researchers in the community. If you have found a vulnerability in our product or service, please [submit a vulnerability report](https://www.bitski.com/bounty) to the Bitski security team.
