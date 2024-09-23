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
) => Promise<AxiosResponse>) => {
  const navigate = useNavigate();

  const callProtectedApi = async (
    url: string,
    method: Method,
    data = '',
  ): Promise<AxiosResponse> => {
    // HACK: 結構複雑なので、何とかしたい...
    const { accessToken, refreshToken } = AuthToken.getTokens();
    let updatedAccessToken: string = '';

    if (!AuthToken.isLoginedCheck()) {
      throw new Error(ERROR_MESSAGES.NOT_LOGINED);
    }
    // ここからは、ログイン済みの場合の処理

    if (AuthToken.isExistAccessToken()) {
      // callProtectedApiWithAccessToken
      try {
        const response = await callProtectedApiWithAxios(
          url,
          method,
          data,
          accessToken,
        );

        return response;
      } catch (error) {
        if (isTokenExpired(error)) {
          // no-op: トークンが期限切れ場合は何もしない
        } else {
          throw error;
        }
      }
    }

    // ここからは、アクセストークンが期限切れの場合の処理
    updatedAccessToken = await updateTokenUseRefreshToken(
      refreshToken,
      navigate,
    );

    const response = await callProtectedApiWithAxios(
      url,
      method,
      data,
      updatedAccessToken,
    );

    return response;
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

// HACK:名前変えたい。もう少し具体的な名前にしたい
const callProtectedApiWithAxios = async (
  url: string,
  method: Method,
  data: string,
  accessToken: string,
): Promise<AxiosResponse> => {
  // MEMO:モックするためにrequestとpostに分けている
  return await axios.request({
    method,
    url,
    data,
    headers: apiHeaders(accessToken),
  });
};
