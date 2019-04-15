import { AccessToken } from 'bitski-provider';
import CredentialTokenProvider from '../src/auth/credential-token-provider';

test('it uses existing access tokens when available', async () => {
  expect.assertions(2);
  const provider = new CredentialTokenProvider({ id: 'test-id', secret: 'test-secret' }, {});
  const token = new AccessToken('test-access-token', 3600);
  // @ts-ignore
  provider.accessToken = token;
  // @ts-ignore
  const spy = jest.spyOn(provider, 'requestNewAccessToken');
  const accessToken = await provider.getAccessToken();
  expect(accessToken).toBe(token.token);
  expect(spy).not.toBeCalled();
});

test('it requests access tokens with client credentials', async () => {
  expect.assertions(2);
  const provider = new CredentialTokenProvider({ id: 'test-id', secret: 'test-secret' }, { scope: 'eth_sign openid' });
  // @ts-ignore
  const mock = jest.spyOn(provider.oauthClient.clientCredentials, 'getToken');
  mock.mockResolvedValue({ access_token: 'mocked-access-token', expires_in: 3600 });
  const accessToken = await provider.getAccessToken();
  expect(accessToken).toBe('mocked-access-token');
  expect(mock).toBeCalledWith({ scope: 'eth_sign openid' });
});

test('it clears access tokens when requested', async () => {
  expect.assertions(1);
  const provider = new CredentialTokenProvider({ id: 'test-id', secret: 'test-secret' }, {});
  // @ts-ignore
  provider.accessToken = new AccessToken('test-access-token', 3600);
  await provider.invalidateToken();
  // @ts-ignore
  expect(provider.accessToken).toBeUndefined();
});
