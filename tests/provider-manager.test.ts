import { ProviderManager } from '../src/index';

test('it successfully creates a provider', () => {
  expect.assertions(2);
  const manager = new ProviderManager('foo', 'bar');
  const provider = manager.getProvider('test');
  expect(provider).toBeDefined();
  expect(provider.clientId).toBe('foo');
});

test('it can pass additional headers', () => {
  expect.assertions(2);
  const manager = new ProviderManager('foo', 'bar');
  const provider = manager.getProvider('test', { 'x-foo': 'bar' });
  expect(provider).toBeDefined();
  // @ts-ignore
  expect(provider.headers['x-foo']).toBe('bar');
});

test('it returns a provider from the cache when one exists', () => {
  expect.assertions(2);
  const manager = new ProviderManager('foo', 'bar');
  const dummyProvider = {};
  // @ts-ignore
  manager.cachedProviders.set('dummy', dummyProvider);
  const provider = manager.getProvider('dummy');
  expect(provider).toBeDefined();
  expect(provider).toBe(dummyProvider);
});
