import axios, { type Method, type AxiosResponse } from 'axios';
import { REFRESH_TOKEN_URL } from 'domains/internal/constants/apiUrls';
import { useNavigate } from 'react-router-dom';
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
    // HACK: try/catchが多すぎて、何とかしたい...
    // 先にテスト書いておいた方が良さげ

    if (!AuthToken.isLoginedCheck()) {
      return [null, new Error(NOT_LOGINED_MESSAGE)];
    }

    const tokens = AuthToken.getTokens();

    // TODO:accessTokenが無かったら(アクセストークンの有効期限が切れていたら削除されるので)、
    // リフレッシュトークンでリクエストする。

    // 理想的には、アクセストークンの有効期限切れでリクエストが失敗した場合は、リフレッシュトークンでリクエストした方が良い。
    // しかし、アクセストークンの有効期限＞クッキーの有効期限とすることで、「アクセストークンの有効期限切れでリクエストが失敗した場合」という
    // 可能性が減る。
    // なので、この場合の処理はエラーにだけして、リフレッシュトークンでアクセストークン更新→保護されているAPIを叩くようにはしない。
    // どういうエラーにするかは要検討。最低限、ログアウト出来ずに「ログインしてください」といった詰み状態にはしないようにする。

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const accessToken = tokens.accessToken!;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const refreshToken = tokens.refreshToken!;

    try {
      const response = await axios.request({
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

        AuthToken.resetTokens();
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

  AuthToken.setTokens(updatedAccessToken, refreshToken);

  return updatedAccessToken;
};
