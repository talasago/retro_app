import type { ActionCreatorWithPayload } from '@reduxjs/toolkit';
import axios, { type Method, type AxiosResponse } from 'axios';
import { REFRESH_TOKEN_URL } from 'domains/internal/constants/apiUrls';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { AuthState } from 'stores/auth';
import { authSlice } from 'stores/auth';
import type { RootState, AppDispatch } from 'stores/store';

// TODO: レスポンス定義のinterfaceを作成する
// swaggerからうまく連動できないものかなあ

const GENERIC_ERROR_MESSAGE =
  'エラーが発生しました。時間をおいて再実行してください。';
const EXPIRED_TOKEN_MESSAGE =
  'ログイン有効期間を過ぎています。再度ログインしてください。';

export const useProtectedApi = (): ((
  url: string,
  method: Method,
  data?: string,
) => Promise<[AxiosResponse | null, Error | null]>) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const auth: AuthState = useSelector((state: RootState) => state.auth);
  const { resetToken, setToken } = authSlice.actions;

  const callProtectedApi = async (
    url: string,
    method: Method,
    data = '',
  ): Promise<[AxiosResponse | null, Error | null]> => {
    // HACK: try/catchが多すぎて、何とかしたい...
    // 先にテスト書いておいた方が良さげ

    try {
      const response = await axios({
        method,
        url,
        data,
        headers: apiHeaders(auth.accessToken),
      });

      return [response, null];
    } catch (error) {
      if (!isTokenExpired(error)) {
        return [null, new Error(GENERIC_ERROR_MESSAGE, error as Error)];
      }

      let updatedAccessToken: string = '';
      try {
        updatedAccessToken = await updateTokenUseRefreshToken(
          auth.refreshToken,
          dispatch,
          setToken,
        );
      } catch (error) {
        if (!isTokenExpired(error)) {
          return [null, new Error(GENERIC_ERROR_MESSAGE, error as Error)];
        }

        dispatch(resetToken());
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
  dispatch: AppDispatch,
  setToken: ActionCreatorWithPayload<AuthState, 'auth/setToken'>,
): Promise<string> => {
  let updatedAccessToken = '';

  const responseRefToken = await axios.post(REFRESH_TOKEN_URL, '', {
    headers: apiHeaders(refreshToken),
  });
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  updatedAccessToken = responseRefToken.data.access_token;

  dispatch(
    setToken({
      isLogined: true,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      accessToken: responseRefToken.data.access_token,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      refreshToken: responseRefToken.data.refresh_token,
    }),
  );

  return updatedAccessToken;
};
