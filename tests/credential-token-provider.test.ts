import CredentialTokenProvider from '../src/auth/credential-token-provider';
import { AccessToken } from 'bitski-provider';

test('it uses existing access tokens when available', () => {
  expect.assertions(2);
  const provider = new CredentialTokenProvider({ id: 'test-id', secret: 'test-secret' }, {});
  const token = new AccessToken('test-access-token', 3600);
  provider['accessToken'] = token;
  const spy = jest.spyOn(provider, 'requestNewAccessToken');
  return provider.getAccessToken().then(accessToken => {
    expect(accessToken).toBe(token.token);
    expect(spy).not.toBeCalled();
  });
});

test('it requests access tokens with client credentials', () => {
  expect.assertions(2);
  const provider = new CredentialTokenProvider({ id: 'test-id', secret: 'test-secret' }, { scope: 'eth_sign openid' });
  const mock = jest.spyOn(provider.oauthClient.clientCredentials, 'getToken');
  mock.mockResolvedValue({ access_token: 'mocked-access-token', expires_in: 3600 });
  return provider.getAccessToken().then(accessToken => {
    expect(accessToken).toBe('mocked-access-token');
    expect(mock).toBeCalledWith({ scope: 'eth_sign openid' });
  });
});

test('it clears access tokens when requested', () => {
  expect.assertions(1);
  const provider = new CredentialTokenProvider({ id: 'test-id', secret: 'test-secret' }, {});
  // @ts-ignore
  provider.accessToken = new AccessToken('test-access-token', 3600);
  return provider.invalidateToken().then(() => {
    // @ts-ignore
    expect(provider.accessToken).toBeUndefined();
  });
});
