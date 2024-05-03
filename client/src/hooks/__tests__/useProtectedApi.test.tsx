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
//
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
        let mockResponseError404: AxiosError;

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

          mockResponseError404 = {
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
        });

        describe('When protected API call success', () => {
          beforeAll(() => {
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
          it.skip('何か書く', async () => {});
        });

        describe('When protected API call failed for reasons other than accessToken expired', () => {
          beforeAll(() => {
            jest
              .spyOn(axios, 'request')
              .mockRejectedValue(mockResponseError404);
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
          let mockResponseError401TokenExpired: AxiosError;

          beforeAll(() => {
            mockResponseError401TokenExpired = {
              name: 'Error',
              message: 'API call failed',
              // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
              config: {} as InternalAxiosRequestConfig,
              response: {
                status: 401,
                statusText: 'Unauthorized',
                headers: {},
                data: {
                  detail:
                    'ログイン有効期間を過ぎています。再度ログインしてください。',
                },
                // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                config: {} as InternalAxiosRequestConfig,
              },
              isAxiosError: true,
              toJSON: () => ({}),
            };

            // 1回目のAPIコールは401エラーを返す
            jest
              .spyOn(axios, 'request')
              .mockRejectedValue(mockResponseError401TokenExpired);
          });

          describe('When refresh_token API call failed for reasons other refreshToken is expired', () => {
            beforeAll(() => {
              // リフレッシュトークンAPIはエラー。トークン以外で間違っている場合を想定。
              jest.spyOn(axios, 'post').mockRejectedValue(mockResponseError404);
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

          describe('When refresh_token API call failed for reasons refreshToken is expired', () => {
            let mockResetTokens: jest.SpyInstance;

            beforeAll(() => {
              // リフレッシュトークンAPIはエラー。トークンが期限切れを想定。
              jest
                .spyOn(axios, 'post')
                .mockRejectedValue(mockResponseError401TokenExpired);

              mockResetTokens = jest.spyOn(AuthToken, 'resetTokens');
            });

            it('Error must have a message and go to login page', async () => {
              const [response, error] = await callProtectedApi(
                'https://api.example.com',
                'POST',
              );

              expect(response).toBeNull();
              expect(error).toEqual(
                new Error(
                  'ログイン有効期間を過ぎています。再度ログインしてください。',
                ),
              );
              expect(mockResetTokens).toHaveBeenCalled();
              // TODO: ログインページに遷移しているか確認
              // locationとか使えばいいかも
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
              // TODO:mockRejectedValueOnceとか使える？2回目のAPIコールは成功させないといけない。

              it.skip('トークンを更新していることそして、', async () => {
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
              it('Token is updated and error must have a message', async () => {
                const [response, error] = await callProtectedApi(
                  'https://api.example.com',
                  'POST',
                );

                expect(mockSetTokens).toHaveBeenCalled();
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
          });
        });
      });
    });
  });
});

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
