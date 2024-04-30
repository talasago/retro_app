import { type ReactNode } from 'react';
import { renderHook } from '@testing-library/react';
import axios, {
  type AxiosResponse,
  type Method,
  type InternalAxiosRequestConfig,
  type AxiosResponseHeaders,
  type AxiosError,
} from 'axios';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthToken } from 'domains/AuthToken';
import { useProtectedApi } from '../useProtectedApi';

describe('#useProtectedApi', () => {
  const mockIsLoginedCheck = jest.fn();
  const mockGetTokens = jest.fn();
  const mockResetTokens = jest.fn();
  const mockUpdateTokenUseRefreshToken = jest.fn();

  const mockAccessToken = 'mockAccessToken';
  const mockRefreshToken = 'mockRefreshToken';

  const NOT_LOGINED_MESSAGE = 'Not logged in';
  const GENERIC_ERROR_MESSAGE = 'Generic error';
  const EXPIRED_TOKEN_MESSAGE = 'Expired token';

  let callProtectedApi: (
    url: string,
    method: Method,
    data?: string | undefined,
  ) => Promise<[AxiosResponse | null, Error | null]>;

  // beforeAll(() => {
  //   jest.spyOn(window, 'alert').mockImplementation(() => {});
  //   jest.spyOn(console, 'error').mockImplementation(() => {});
  // });

  beforeAll(() => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <Router>{children}</Router>
    );
    // eslint-enable @typescript-eslint/no-unsafe-assignment @typescript-eslint/no-unsafe-call
    const { result } = renderHook(() => useProtectedApi(), { wrapper });
    callProtectedApi = result.current;
  });

  describe('When user is not logged in', () => {
    beforeEach(() => {
      jest.spyOn(AuthToken, 'isLoginedCheck').mockImplementation(() => false);
    });

    it('Response must be null and error must have a message', async () => {
      const [resultResponse, resultError] = await callProtectedApi(
        'https://api.example.com',
        'POST',
      );

      expect(resultResponse).toBeNull();
      expect(resultError).toEqual(new Error('ログインしてください。'));
    });
  });

  describe('When user is logged in', () => {
    beforeAll(() => {
      jest.spyOn(AuthToken, 'isLoginedCheck').mockImplementation(() => true);
    });

    describe('When accessToken exist in cookies(accessToken in cookie is not expired)', () => {
      describe('When protected API call success', () => {
        let mockSuccessResponse: AxiosResponse;

        beforeAll(() => {
          mockSuccessResponse = {
            data: {},
            status: 200,
            statusText: 'OK',
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            headers: {} as AxiosResponseHeaders,
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            config: {} as InternalAxiosRequestConfig,
          };

          jest
            .spyOn(axios, 'request')
            .mockImplementation(
              async () => await Promise.resolve(mockSuccessResponse),
            );
        });

        it('Response have result and error must be null', async () => {
          const [response, error] = await callProtectedApi(
            'https://api.example.com',
            'POST',
          );

          expect(response).toEqual(mockSuccessResponse);
          expect(error).toBeNull();
        });
      });

      describe('When accessToken do not exist in cookies(accessToken in cookie is expired)', () => {
        describe('When refresh_token API call failed for reasons other than accessToken', () => {
          it.skip('WIP', async () => {});
        });
      });

      describe('When protected API call failed for reasons other than accessToken expired', () => {
        let mockResponseError: AxiosError;

        beforeAll(() => {
          mockResponseError = {
            name: 'Error',
            message: 'API call failed',
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            config: {} as InternalAxiosRequestConfig,
            response: {
              status: 404,
              statusText: 'Not found',
              headers: {},
              data: {},
              // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
              config: {} as InternalAxiosRequestConfig,
            },
            isAxiosError: true,
            toJSON: () => ({}),
          };

          jest.spyOn(axios, 'request').mockRejectedValue(mockResponseError);
        });

        it('Response must be null and error must have a message', async () => {
          const [response, error] = await callProtectedApi(
            'https://api.example.com',
            'POST',
          );

          expect(response).toBeNull();
          expect(error).toEqual(
            new Error(
              'エラーが発生しました。時間をおいて再実行してください。',
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              error!,
            ),
          );
        });
      });

      describe('When protected API call failed for reason accessToken is expired', () => {
        it.skip('エラーになって..', async () => {});
      });
    });
  });
});

//  it.skip('should return error when API call fails with expired token and token refresh fails', async () => {
//    const mockError = new Error('API call failed');
//
//    mockIsLoginedCheck.mockReturnValue(true);
//    mockGetTokens.mockReturnValue({
//      accessToken: mockAccessToken,
//      refreshToken: mockRefreshToken,
//    });
//    axios.mockRejectedValueOnce({ response: { status: 401 } });
//    mockUpdateTokenUseRefreshToken.mockRejectedValue(mockError);
//
//    const { result } = renderHook(() => useProtectedApi());
//
//    const [response, error] = await result.current(
//      'https://api.example.com',
//      'GET',
//    );
//
//    expect(response).toBeNull();
//    expect(error).toEqual(new Error(EXPIRED_TOKEN_MESSAGE));
//    expect(mockResetTokens).toHaveBeenCalled();
//    expect(mockNavigate).toHaveBeenCalledWith('/login');
//  });
//
//  it.skip('should return response and error when API call fails with expired token and token refresh succeeds', async () => {
//    const mockResponse: AxiosResponse = {
//      data: {},
//      status: 200,
//      statusText: 'OK',
//      headers: {},
//      config: {},
//    };
//
//    mockIsLoginedCheck.mockReturnValue(true);
//    mockGetTokens.mockReturnValue({
//      accessToken: mockAccessToken,
//      refreshToken: mockRefreshToken,
//    });
//    axios.mockRejectedValueOnce({ response: { status: 401 } });
//    mockUpdateTokenUseRefreshToken.mockResolvedValue(mockAccessToken);
//    axios.mockResolvedValue(mockResponse);
//
//    const { result } = renderHook(() => useProtectedApi());
//
//    const [response, error] = await result.current(
//      'https://api.example.com',
//      'GET',
//    );
//
//    expect(response).toEqual(mockResponse);
//    expect(error).toBeNull();
//  });
