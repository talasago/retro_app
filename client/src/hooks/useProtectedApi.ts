import axios, { type Method, type AxiosResponse } from 'axios';
import { REFRESH_TOKEN_URL } from 'domains/internal/constants/apiUrls';
import { useNavigate, type NavigateFunction } from 'react-router-dom';
import { AuthToken } from 'domains/AuthToken';

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
    // HACK: 結構複雑なので、何とかしたい...

    if (!AuthToken.isLoginedCheck()) {
      return [null, new Error(NOT_LOGINED_MESSAGE)];
    }

    const tokens = AuthToken.getTokens();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const accessToken = tokens.accessToken!;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const refreshToken = tokens.refreshToken!;

    let updatedAccessToken: string = '';
    // FIXME:リフレッシュトークンの条件は違和感を感じる...そして、実際にはisLoginedCheckで判定しているので、この条件は不要な気がする。

    if (AuthToken.isExistAccessToken() || !AuthToken.isExistRefreshToken()) {
      const [response, error] = await callProtectedApiWithAxios(
        url,
        method,
        data,
        accessToken,
      );

      if (error === null) {
        return [response, null];
      } else if (error !== null && !isTokenExpired(error)) {
        return [null, new Error(GENERIC_ERROR_MESSAGE, error)];
      }
    }

    try {
      updatedAccessToken = await updateTokenUseRefreshToken(
        refreshToken,
        navigate,
      );
    } catch (error) {
      return [null, error as Error];
    }

    const [response, error] = await callProtectedApiWithAxios(
      url,
      method,
      data,
      updatedAccessToken,
    );

    if (error === null) {
      return [response, null];
    }

    return [null, new Error(GENERIC_ERROR_MESSAGE, error)];
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
  navigate: NavigateFunction,
): Promise<string> => {
  try {
    const responseRefToken = await axios.post(REFRESH_TOKEN_URL, '', {
      headers: apiHeaders(refreshToken),
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const updatedAccessToken: string = responseRefToken.data.access_token;
    AuthToken.setTokens(updatedAccessToken, refreshToken);

    return updatedAccessToken;
  } catch (error) {
    if (!isTokenExpired(error)) {
      throw new Error(GENERIC_ERROR_MESSAGE);
    }

    AuthToken.resetTokens();
    navigate('/login');

    throw new Error(EXPIRED_TOKEN_MESSAGE);
  }
};

const callProtectedApiWithAxios = async (
  url: string,
  method: Method,
  data: string,
  accessToken: string,
): Promise<[AxiosResponse | null, Error | null]> => {
  try {
    const response = await axios.request({
      method,
      url,
      data,
      headers: apiHeaders(accessToken),
    });

    return [response, null];
  } catch (error) {
    return [null, error as Error];
  }
};
