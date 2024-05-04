import axios, { type Method, type AxiosResponse } from 'axios';
import { REFRESH_TOKEN_URL } from 'domains/internal/constants/apiUrls';
import { useNavigate, type NavigateFunction } from 'react-router-dom';
import { AuthToken } from 'domains/AuthToken';

// TODO: レスポンス定義のinterfaceを作成する
// swaggerからうまく連動できないものかなあ

const ERROR_MESSAGES = {
  GENERIC: 'エラーが発生しました。時間をおいて再実行してください。',
  EXPIRED_TOKEN: 'ログイン有効期間を過ぎています。再度ログインしてください。',
  NOT_LOGINED: 'ログインしてください。',
};

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
    const { accessToken, refreshToken } = AuthToken.getTokens();
    let updatedAccessToken: string = '';

    if (!AuthToken.isLoginedCheck()) {
      return [null, new Error(ERROR_MESSAGES.NOT_LOGINED)];
    }

    if (AuthToken.isExistAccessToken()) {
      const [response, error] = await callProtectedApiWithAxios(
        url,
        method,
        data,
        accessToken,
      );

      if (error === null) {
        return [response, null];
      } else if (error !== null && !isTokenExpired(error)) {
        return [null, new Error(ERROR_MESSAGES.GENERIC, error)];
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

    return [null, new Error(ERROR_MESSAGES.GENERIC, error)];
  };

  return callProtectedApi;
};

const isTokenExpired = (error: unknown): boolean => {
  return (
    axios.isAxiosError(error) &&
    error.response?.status === 401 &&
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    error.response?.data?.detail === ERROR_MESSAGES.EXPIRED_TOKEN
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
      throw new Error(ERROR_MESSAGES.GENERIC);
    }

    AuthToken.resetTokens(); // 副作用なので、useEffect使うべきなのかもしれない
    navigate('/login');

    throw new Error(ERROR_MESSAGES.EXPIRED_TOKEN);
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
