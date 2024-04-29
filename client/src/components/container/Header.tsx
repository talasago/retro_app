import type { FC } from 'react';
import { LOGOUT_URL } from 'domains/internal/constants/apiUrls';
import { useProtectedApi } from 'hooks/useProtectedApi';
import { useDispatch } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import { ROUTES_LISTS } from 'routes';
import { alertSlice } from 'stores/alert';
import type { AppDispatch } from 'stores/store';
import { resetTokens, useAuthTokenObserver } from 'utils/auth';

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Toolbar from '@mui/material/Toolbar';

const Header: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { setAlert } = alertSlice.actions;
  const callProtectedApi = useProtectedApi();
  const isLogined: boolean = useAuthTokenObserver() as boolean;

  const handleLogout = async (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault(); // リンクをクリックするとページの最上部にスクロールしないようにする

    const [response, error] = await callProtectedApi(LOGOUT_URL, 'POST');

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
    resetTokens();
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
            hidden={isLogined}
          >
            ユーザー登録
          </Link>
          <Link
            component={RouterLink}
            to={ROUTES_LISTS.LOGIN}
            color="inherit"
            sx={{ margin: '10px' }}
            hidden={isLogined}
          >
            ログイン
          </Link>
          <Link
            component={RouterLink}
            to="#" // ダミーのリンク
            color="inherit"
            onClick={handleLogout}
            sx={{ margin: '10px' }}
            hidden={!isLogined}
          >
            ログアウト
          </Link>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default Header;
