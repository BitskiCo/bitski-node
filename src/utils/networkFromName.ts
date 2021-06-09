import { Kovan, Mainnet, Network, Rinkeby } from 'bitski-provider';
import { BitskiError } from '../errors/bitski-error';

// Get a standard network object from a given name
export function networkFromName(name?: string): Network {
  switch (name) {
    case undefined:
    case null:
    case 'mainnet':
      return Mainnet;
    case 'rinkeby':
      return Rinkeby;
    case 'kovan':
      return Kovan;
    default:
      throw BitskiError.InvalidNetworkName(name);
  }
}
