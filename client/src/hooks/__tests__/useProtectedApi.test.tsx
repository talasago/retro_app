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

const mockSuccessResponse: AxiosResponse = {
  data: {},
  status: 200,
  statusText: 'OK',
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  headers: {} as AxiosResponseHeaders,
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  config: {} as InternalAxiosRequestConfig,
};

const mockResponseError401TokenExpired: AxiosError = {
  name: 'Error',
  message: 'API call failed',
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  config: {} as InternalAxiosRequestConfig,
  response: {
    status: 401,
    statusText: 'Unauthorized',
    headers: {},
    data: {
      detail: 'ログイン有効期間を過ぎています。再度ログインしてください。',
    },
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    config: {} as InternalAxiosRequestConfig,
  },
  isAxiosError: true,
  toJSON: () => ({}),
};

const mockResponseError404: AxiosError = {
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

// FIXME: BeforeAllとか、モックのクリアとかを見直す。テストケース間に依存があるので、それをなくすようにする。

describe('#useProtectedApi', () => {
  let callProtectedApi: (
    url: string,
    method: Method,
    data?: string | undefined,
  ) => Promise<[AxiosResponse | null, Error | null]>;

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

    it('error must have', async () => {
      await expect(async () => {
        await callProtectedApi('https://api.example.com', 'POST');
      }).rejects.toThrow(new Error('ログインしてください。'));
    });
  });

  describe('When user is logged in', () => {
    beforeAll(() => {
      jest.spyOn(AuthToken, 'isLoginedCheck').mockImplementation(() => true);
    });

    describe('When accessToken exist in cookies(accessToken in cookie is not expired)', () => {
      const mockGetTokens = jest.spyOn(AuthToken, 'getTokens');

      beforeEach(() => {
        mockGetTokens.mockImplementationOnce(() => {
          return {
            accessToken: 'accessToken',
            refreshToken: 'refreshToken',
          };
        });

        jest
          .spyOn(AuthToken, 'isExistAccessToken')
          .mockImplementation(() => true);
      });

      describe('When protected API call success', () => {
        beforeEach(() => {
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

      describe('When protected API call failed for reasons other than accessToken expired', () => {
        beforeAll(() => {
          jest.spyOn(axios, 'request').mockRejectedValue(mockResponseError404);
        });

        it('error must have', async () => {
          let actualError;
          try {
            await callProtectedApi('https://api.example.com', 'POST');
          } catch (err) {
            actualError = err;
          }
          expect(actualError).toEqual(mockResponseError404);
        });
      });
    });

    describe('When accessToken do not exist in cookies(accessToken in cookie is expired)', () => {
      const mockGetTokens = jest.spyOn(AuthToken, 'getTokens');

      beforeEach(() => {
        mockGetTokens.mockImplementation(() => {
          return {
            accessToken: '',
            refreshToken: 'refreshToken',
          };
        });

        jest
          .spyOn(AuthToken, 'isExistAccessToken')
          .mockImplementation(() => false);
      });

      describe('When refresh_token API call failed for reasons other refreshToken is expired', () => {
        beforeAll(() => {
          jest.spyOn(axios, 'post').mockRejectedValue(mockResponseError404);
        });

        it('Error must have a message', async () => {
          const mockAxiosForProtectedApiCall = jest.spyOn(axios, 'request');
          mockAxiosForProtectedApiCall.mockReset();

          await expect(async () => {
            await callProtectedApi('https://api.example.com', 'POST');
          }).rejects.toThrow(
            new Error('エラーが発生しました。時間をおいて再実行してください。'),
          );

          expect(mockAxiosForProtectedApiCall).not.toHaveBeenCalled();
        });
      });

      describe('When refresh_token API call failed for reasons refreshToken is expired', () => {
        let mockResetTokens: jest.SpyInstance;

        beforeAll(() => {
          // リフレッシュトークンAPIはエラー。トークンが期限切れを想定。
          jest
            .spyOn(axios, 'post')
            .mockRejectedValue(mockResponseError401TokenExpired);

          mockResetTokens = jest.spyOn(AuthToken, 'resetTokens');
        });

        it('Error must have and go to login page', async () => {
          await expect(async () => {
            await callProtectedApi('https://api.example.com', 'POST');
          }).rejects.toThrow(
            new Error(
              'ログイン有効期間を過ぎています。再度ログインしてください。',
            ),
          );
          expect(mockResetTokens).toHaveBeenCalled();
          expect(window.location.pathname).toBe('/login');
        });
      });

      describe('When refresh_token API call successed', () => {
        let mockSetTokens: jest.SpyInstance;
        beforeAll(() => {
          // リフレッシュトークンAPIは成功
          jest
            .spyOn(axios, 'post')
            .mockImplementation(
              async () => await Promise.resolve(mockSuccessResponse),
            );
          mockSetTokens = jest.spyOn(AuthToken, 'setTokens');
        });

        describe('When protected API call success with updatedAccessToken', () => {
          beforeAll(() => {
            // 1回目のAPIコールは成功
            jest.spyOn(axios, 'request').mockResolvedValue(mockSuccessResponse);
          });

          it('Token is updated and response must have result', async () => {
            const [response, error] = await callProtectedApi(
              'https://api.example.com',
              'POST',
            );

            expect(mockSetTokens).toHaveBeenCalled();
            expect(response).toEqual(mockSuccessResponse);
            expect(error).toBeNull();
          });
        });

        describe('When protected API call failed with updatedAccessToken', () => {
          beforeAll(() => {
            jest
              .spyOn(axios, 'request')
              .mockRejectedValue(mockResponseError404);
          });
          it('Token is updated and error must have', async () => {
            let actualError;
            try {
              await callProtectedApi('https://api.example.com', 'POST');
            } catch (err) {
              actualError = err;
            }
            expect(actualError).toEqual(mockResponseError404);
            expect(mockSetTokens).toHaveBeenCalled();
          });
        });
      });
    });

    describe('When protected API call failed for reason accessToken is expired', () => {
      beforeAll(() => {
        // 1回目のAPIコールは401エラーを返す
        jest
          .spyOn(axios, 'request')
          .mockRejectedValue(mockResponseError401TokenExpired);

        jest.spyOn(AuthToken, 'getTokens').mockImplementation(() => {
          return {
            accessToken: 'accessToken',
            refreshToken: 'refreshToken',
          };
        });
        jest
          .spyOn(AuthToken, 'isExistAccessToken')
          .mockImplementation(() => true);
      });

      describe('When refresh_token API call failed for reasons other refreshToken is expired', () => {
        beforeAll(() => {
          // リフレッシュトークンAPIはエラー。トークン以外で間違っている場合を想定。
          jest.spyOn(axios, 'post').mockRejectedValue(mockResponseError404);
        });

        it('Error must have', async () => {
          await expect(async () => {
            await callProtectedApi('https://api.example.com', 'POST');
          }).rejects.toThrow(
            new Error('エラーが発生しました。時間をおいて再実行してください。'),
          );
        });
      });

      describe('When refresh_token API call failed for reasons refreshToken is expired', () => {
        let mockResetTokens: jest.SpyInstance;

        beforeAll(() => {
          // リフレッシュトークンAPIはエラー。トークンが期限切れを想定。
          jest
            .spyOn(axios, 'post')
            .mockRejectedValue(mockResponseError401TokenExpired);

          mockResetTokens = jest.spyOn(AuthToken, 'resetTokens');
        });

        it('Error must have and go to login page', async () => {
          await expect(async () => {
            await callProtectedApi('https://api.example.com', 'POST');
          }).rejects.toThrow(
            new Error(
              'ログイン有効期間を過ぎています。再度ログインしてください。',
            ),
          );
          expect(mockResetTokens).toHaveBeenCalled();
          expect(window.location.pathname).toBe('/login');
        });
      });

      describe('When refresh_token API call successed', () => {
        let mockSetTokens: jest.SpyInstance;
        beforeAll(() => {
          // リフレッシュトークンAPIは成功
          jest
            .spyOn(axios, 'post')
            .mockImplementation(
              async () => await Promise.resolve(mockSuccessResponse),
            );
          mockSetTokens = jest.spyOn(AuthToken, 'setTokens');
        });
        // FIXME:トークンを更新していることは、下のit内どちらも確認することなので共通化したい

        describe('When protected API call success with updatedAccessToken', () => {
          beforeAll(() => {
            // 2回目のAPIコールは成功
            jest
              .spyOn(axios, 'request')
              .mockRejectedValueOnce(mockResponseError401TokenExpired)
              .mockResolvedValueOnce(mockSuccessResponse);
          });

          it('Token is updated and response must have result', async () => {
            const [response, error] = await callProtectedApi(
              'https://api.example.com',
              'POST',
            );

            expect(mockSetTokens).toHaveBeenCalled();
            expect(response).toEqual(mockSuccessResponse);
            expect(error).toBeNull();
          });
        });

        describe('When protected API call failed with updatedAccessToken', () => {
          beforeAll(() => {
            jest
              .spyOn(axios, 'request')
              .mockRejectedValueOnce(mockResponseError401TokenExpired)
              .mockRejectedValue(mockResponseError404);
          });
          it('Error must have', async () => {
            let actualError;
            try {
              await callProtectedApi('https://api.example.com', 'POST');
            } catch (err) {
              actualError = err;
            }
            expect(actualError).toEqual(mockResponseError404);

            expect(mockSetTokens).toHaveBeenCalled();
          });
        });
      });
    });
  });
});
