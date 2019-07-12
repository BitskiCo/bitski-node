// tslint:disable max-classes-per-file
import Web3ProviderEngine, { Subprovider } from '@bitski/provider-engine';
import { AccessTokenProvider } from 'bitski-provider';
import { AppWalletSubprovider } from '../src/subproviders/app-wallet';

class MockProvider extends Subprovider {
  public handler: (payload, completion) => void;

  constructor(handler) {
    super();
    this.handler = handler;
  }

  public handleRequest(payload, next, end) {
    this.handler(payload, end);
  }
}

class MockTokenProvider implements AccessTokenProvider {
  public accessToken?: string;

  public getAccessToken(): Promise<string> {
    if (this.accessToken) {
      return Promise.resolve(this.accessToken);
    } else {
      return Promise.reject(new Error('Not signed in.'));
    }
  }

  public invalidateToken(): Promise<void> {
    this.accessToken = undefined;
    return Promise.resolve();
  }

}

function createProvider() {
  const tokenProvider = new MockTokenProvider();
  tokenProvider.accessToken = 'test-access-token';
  return new AppWalletSubprovider(tokenProvider, 0);
}

test('it handles wallet requests', (done) => {
  expect.assertions(4);
  const provider = createProvider();
  const payload = {
    jsonrpc: '2.0',
    id: 0,
    method: 'eth_accounts',
    params: [],
  };
  const next = jest.fn();
  // @ts-ignore
  const spy = jest.spyOn(provider, 'sendRequest').mockImplementation((p, n, end) => {
    // simply call the callback.
    end(undefined, 'foo');
  });
  provider.handleRequest(payload, next, (err, response) => {
    expect(err).toBeUndefined();
    expect(next).not.toHaveBeenCalled();
    expect(spy).toHaveBeenCalled();
    expect(response).toBe('foo');
    done();
  });
});

test('it ignores non-wallet requests', (done) => {
  expect.assertions(2);
  const provider = createProvider();
  const payload = {
    jsonrpc: '2.0',
    id: 0,
    method: 'eth_blockNumber',
    params: [],
  };
  const next = jest.fn();
  const end = jest.fn();
  provider.handleRequest(payload, next, end);
  expect(next).toBeCalled();
  expect(end).not.toBeCalled();
  done();
});

test('it handles send transaction with multiple requests', (done) => {
  expect.assertions(5);
  const engine = new Web3ProviderEngine();
  const walletProvider = createProvider();
  // @ts-ignore
  const spy = jest.spyOn(walletProvider, 'sendRequest').mockImplementation((payload, next, end) => {
    const body = JSON.parse(payload.body);
    expect(body.method).toBe('eth_signTransaction');
    // simply call the callback.
    end(undefined, '0x555555555');
  });
  const handler = jest.fn().mockImplementation((payload, completion) => {
    if (payload.method === 'eth_blockNumber' || payload.method === 'eth_getBlockByNumber') {
      return completion(undefined, '0x0');
    }
    expect(payload.method).toBe('eth_sendRawTransaction');
    expect(payload.params[0]).toBe('0x555555555');
    completion(undefined, '0xf00');
  });
  const dummyProvider = new MockProvider(handler);
  engine.addProvider(walletProvider);
  engine.addProvider(dummyProvider);
  engine.start();
  engine.send('eth_sendTransaction', [{}]).then((result) => {
    expect(result).toBe('0xf00');
    expect(spy).toBeCalledTimes(1);
    done();
  });
});
