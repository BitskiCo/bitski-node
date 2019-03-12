import { getProvider } from '../src/index';

test('it creates a provider', () => {
  expect.assertions(2);
  const provider = getProvider('test-client-id');
  expect(provider).toBeDefined();
  expect(provider.clientId).toBe('test-client-id');
});

test('it accepts options when creating a provider', () => {
  expect.assertions(3);
  const provider = getProvider('test-client-id', { network: 'rinkeby' });
  expect(provider).toBeDefined();
  expect(provider.clientId).toBe('test-client-id');
  expect(provider.rpcUrl.includes('rinkeby')).toBe(true);
});

test('it does not show secrets in the console', () => {
  try {
    // Intentionally passing invalid extra data to trigger error
    getProvider('test', { credentials: { secret: 'super-secret-value', network: 'mainnet' }});
  } catch (e) {
    // Error message should be generic to protect sensitive data from being logged.
    expect(e.message).not.toMatch(/super-secret-value/);
  }
});
