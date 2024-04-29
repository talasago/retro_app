import axios, { type Method, type AxiosResponse } from 'axios';
import { REFRESH_TOKEN_URL } from 'domains/internal/constants/apiUrls';
import { useNavigate } from 'react-router-dom';
import { setTokens, isLoginedCheck, resetTokens, getTokens } from 'utils/auth';
// TODO: レスポンス定義のinterfaceを作成する
// swaggerからうまく連動できないものかなあ

const GENERIC_ERROR_MESSAGE =
  'エラーが発生しました。時間をおいて再実行してください。';
const EXPIRED_TOKEN_MESSAGE =
  'ログイン有効期間を過ぎています。再度ログインしてください。';
const NOT_LOGINED_MESSAGE = 'ログインしてください。';

export const useProtectedApi = (): ((
  url: string,
  method: Method,
  data?: string,
) => Promise<[AxiosResponse | null, Error | null]>) => {
  const navigate = useNavigate();

  const callProtectedApi = async (
    url: string,
    method: Method,
    data = '',
  ): Promise<[AxiosResponse | null, Error | null]> => {
    // HACK: try/catchが多すぎて、何とかしたい...
    // 先にテスト書いておいた方が良さげ

    if (!isLoginedCheck()) {
      return [null, new Error(NOT_LOGINED_MESSAGE)];
    }

    const tokens = getTokens();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const accessToken = tokens.accessToken!;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const refreshToken = tokens.refreshToken!;

    try {
      const response = await axios({
        method,
        url,
        data,
        headers: apiHeaders(accessToken),
      });

      return [response, null];
    } catch (error) {
      if (!isTokenExpired(error)) {
        return [null, new Error(GENERIC_ERROR_MESSAGE, error as Error)];
      }

      let updatedAccessToken: string = '';
      try {
        updatedAccessToken = await updateTokenUseRefreshToken(refreshToken);
      } catch (error) {
        if (!isTokenExpired(error)) {
          return [null, new Error(GENERIC_ERROR_MESSAGE, error as Error)];
        }

        resetTokens();
        navigate('/login');

        return [null, new Error(EXPIRED_TOKEN_MESSAGE, error as Error)];
      }

      try {
        const response = await axios({
          method,
          url,
          data,
          headers: apiHeaders(updatedAccessToken),
        });

        return [response, null];
      } catch (error) {
        return [null, new Error(GENERIC_ERROR_MESSAGE, error as Error)];
      }
    }
  };

  return callProtectedApi;
};

const isTokenExpired = (error: unknown): boolean => {
  return (
    axios.isAxiosError(error) &&
    error.response?.status === 401 &&
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    error.response?.data?.detail === EXPIRED_TOKEN_MESSAGE
  );
};

const apiHeaders = (token: string) => {
  return {
    accept: 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

const updateTokenUseRefreshToken = async (
  refreshToken: string,
): Promise<string> => {
  const responseRefToken = await axios.post(REFRESH_TOKEN_URL, '', {
    headers: apiHeaders(refreshToken),
  });
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const updatedAccessToken: string = responseRefToken.data.access_token;

  setTokens(updatedAccessToken, refreshToken);

  return updatedAccessToken;
};
