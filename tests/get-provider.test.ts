import { getProvider } from '../src/index';

test('it creates a provider', () => {
  expect.assertions(2);
  const provider = getProvider('test-client-id');
  expect(provider).toBeDefined();
  expect(provider.clientId).toBe('test-client-id');
});

test('it accepts options when creating a provider', () => {
  expect.assertions(3);
  const provider = getProvider('test-client-id', { networkName: 'rinkeby' });
  expect(provider).toBeDefined();
  expect(provider.clientId).toBe('test-client-id');
  expect(provider.rpcUrl.includes('rinkeby')).toBe(true);
});

test('it does not show secrets in the console', () => {
  try {
    // Intentionally passing invalid extra data to trigger error
    // @ts-ignore
    getProvider('test', { credentials: { secret: 'super-secret-value', network: 'mainnet' }});
  } catch (e) {
    // Error message should be generic to protect sensitive data from being logged.
    expect(e.message).not.toMatch(/super-secret-value/);
  }
});

test('it accepts network in options for backwards compatibility', () => {
  expect.assertions(3);
  const provider = getProvider('test-client-id', { network: 'rinkeby' });
  expect(provider).toBeDefined();
  expect(provider.clientId).toBe('test-client-id');
  expect(provider.rpcUrl.includes('rinkeby')).toBe(true);
});

test('it accepts additional headers in options', () => {
  expect.assertions(5);
  const provider = getProvider('test-client-id', {
    additionalHeaders: {
      'X-API-KEY': 'FOO',
      'X-FOO-FEATURE': 'ENABLED',
    },
    networkName: 'rinkeby',
  });
  expect(provider).toBeDefined();
  expect(provider.clientId).toBe('test-client-id');
  // @ts-ignore
  expect(provider.headers['X-FOO-FEATURE']).toBe('ENABLED');
  // @ts-ignore Assert that the original headers are also available
  expect(provider.headers['X-API-KEY']).toBe('test-client-id');
  // @ts-ignore
  expect(provider.headers['X-CLIENT-ID']).toBe('test-client-id');
});
