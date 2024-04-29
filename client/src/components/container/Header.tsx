import type { FC } from 'react';
import {
  type ActionCreatorWithPayload,
  type ActionCreatorWithoutPayload,
} from '@reduxjs/toolkit';
import axios from 'axios';
import type { AxiosResponse, Method } from 'axios';
import {
  LOGOUT_URL,
  REFRESH_TOKEN_URL,
} from 'domains/internal/constants/apiUrls';
import { useDispatch, useSelector } from 'react-redux';
import {
  NavigateFunction,
  Link as RouterLink,
  useNavigate,
} from 'react-router-dom';
import { ROUTES_LISTS } from 'routes';
import { alertSlice } from 'stores/alert';
import { authSlice } from 'stores/auth';
import type { AuthState } from 'stores/auth';
import type { RootState, AppDispatch } from 'stores/store';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Toolbar from '@mui/material/Toolbar';

const Header: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { setAlert } = alertSlice.actions;
  const auth: AuthState = useSelector((state: RootState) => state.auth);
  const { resetToken, setToken } = authSlice.actions;
  const navigate = useNavigate();

  const handleLogout = async (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault(); // リンクをクリックするとページの最上部にスクロールしないようにする

    const [response, error] = await callProtectedApi(
      LOGOUT_URL,
      'POST',
      '',
      auth,
      dispatch,
      setToken,
      resetToken,
      navigate,
    );

    if (error) {
      dispatch(
        setAlert({
          open: true,
          message: error.message,
          severity: 'error',
        }),
      );
      console.error('Error:', error);

      return;
    }
    dispatch(
      setAlert({
        open: true,
        message: 'ログアウトが成功したで',
        severity: 'success',
      }),
    );
    dispatch(resetToken());
    console.log('Response:', response?.data);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar sx={{ justifyContent: 'flex-end' }}>
          {/* 右寄せにしている */}
          <Link
            component={RouterLink}
            to={ROUTES_LISTS.SIGN_UP}
            color="inherit"
            sx={{ margin: '10px' }}
            hidden={auth.isLogined}
          >
            ユーザー登録
          </Link>
          <Link
            component={RouterLink}
            to={ROUTES_LISTS.LOGIN}
            color="inherit"
            sx={{ margin: '10px' }}
            hidden={auth.isLogined}
          >
            ログイン
          </Link>
          <Link
            component={RouterLink}
            to="#" // ダミーのリンク
            color="inherit"
            onClick={handleLogout}
            sx={{ margin: '10px' }}
            // hidden={!auth.isLogined}
          >
            ログアウト
          </Link>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default Header;

// ほんとはauthとかdispachとかsetTokenとかresetTokenを受け取りたくない。呼び出し先でやってほしい気持ち。
const callProtectedApi = async (
  url: string,
  method: Method,
  data = '',
  auth: AuthState,
  dispatch: AppDispatch,
  setToken: ActionCreatorWithPayload<AuthState, 'auth/setToken'>,
  resetToken: ActionCreatorWithoutPayload<'auth/resetToken'>,
  navigate: NavigateFunction,
): Promise<[AxiosResponse<any, any> | null, Error | null]> => {
  // await/catchの方が良いかもなあ。それかthenとかcatchの方が居良いかも
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
      return [
        null,
        new Error(
          'エラーが発生しました。時間をおいて再実行してください。',
          error as Error,
        ),
      ];
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
        return [
          null,
          new Error(
            'エラーが発生しました。時間をおいて再実行してください。',
            error as Error,
          ),
        ];
      }

      dispatch(resetToken());
      navigate('/login');

      return [
        null,
        new Error(
          'ログイン有効期間を過ぎています。再度ログインしてください。',
          error as Error,
        ),
      ];
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
      return [
        null,
        new Error(
          'エラーが発生しました。時間をおいて再実行してください。',
          error as Error,
        ),
      ];
    }
  }
};

const isTokenExpired = (error: unknown): boolean => {
  return (
    axios.isAxiosError(error) &&
    error.response?.status === 401 &&
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    error.response?.data?.detail ===
      'ログイン有効期間を過ぎています。再度ログインしてください。'
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
