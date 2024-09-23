import axios, { type Method, type AxiosResponse } from 'axios';
import { REFRESH_TOKEN_URL } from 'domains/internal/constants/apiUrls';
import { useNavigate, type NavigateFunction } from 'react-router-dom';
import { AuthToken } from 'domains/AuthToken';

const ERROR_MESSAGES = {
  GENERIC: 'エラーが発生しました。時間をおいて再実行してください。',
  EXPIRED_TOKEN: 'ログイン有効期間を過ぎています。再度ログインしてください。',
  NOT_LOGINED: 'ログインしてください。',
};

export interface ApiRequest {
  url: string;
  method: Method;
  data?: string;
}

export const useProtectedApi = (): ((
  requestParams: ApiRequest,
) => Promise<AxiosResponse>) => {
  const navigate = useNavigate();

  const callProtectedApi = async (
    requestParams: ApiRequest,
  ): Promise<AxiosResponse> => {
    const { accessToken, refreshToken } = AuthToken.getTokens();

    if (!AuthToken.isLoginedCheck()) {
      throw new Error(ERROR_MESSAGES.NOT_LOGINED);
    }

    // ここからは、ログイン済みの場合の処理
    if (AuthToken.isExistAccessToken()) {
      return await callProtectedApiWithAccessToken(
        requestParams,
        accessToken,
        refreshToken,
        navigate,
      );
    }

    return await callProtectedApiWithRefreshToken(
      requestParams,
      refreshToken,
      navigate,
    );
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

const apiHeaders = (token: string): Record<string, string> => {
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
      // TODO:これどんなときに発生する？422?
      throw new Error(ERROR_MESSAGES.GENERIC);
    }

    AuthToken.resetTokens(); // 副作用なので、useEffect使うべきなのかもしれない
    navigate('/login');

    throw new Error(ERROR_MESSAGES.EXPIRED_TOKEN);
  }
};

// HACK:名前変えたい。もう少し具体的な名前にしたい
const callProtectedApiWithAxios = async (
  requestParams: ApiRequest,
  accessToken: string,
): Promise<AxiosResponse> => {
  const { url, method, data = '' } = requestParams;

  // MEMO:モックするためにrequestとpostに分けている
  return await axios.request({
    method,
    url,
    data,
    headers: apiHeaders(accessToken),
  });
};

const callProtectedApiWithAccessToken = async (
  requestParams: ApiRequest,
  accessToken: string,
  refreshToken: string,
  navigate: NavigateFunction,
): Promise<AxiosResponse> => {
  try {
    return await callProtectedApiWithAxios(requestParams, accessToken);
  } catch (error) {
    if (isTokenExpired(error)) {
      return await callProtectedApiWithRefreshToken(
        requestParams,
        refreshToken,
        navigate,
      );
    } else {
      throw error;
    }
  }
};

const callProtectedApiWithRefreshToken = async (
  requestParams: ApiRequest,
  refreshToken: string,
  navigate: NavigateFunction,
): Promise<AxiosResponse> => {
  const updatedAccessToken = await updateTokenUseRefreshToken(
    refreshToken,
    navigate,
  );

  return await callProtectedApiWithAxios(requestParams, updatedAccessToken);
};
