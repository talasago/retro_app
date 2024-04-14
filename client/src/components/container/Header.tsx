import type { FC } from 'react';
import axios from 'axios';
import { LOGOUT_URL } from 'domains/internal/constants/apiUrls';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
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
  const { resetToken } = authSlice.actions;

  const handleLogout = async (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault(); // リンクをクリックするとページの最上部にスクロールしないようにする

    try {
      const response = await axios.post(LOGOUT_URL, '', {
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${auth.accessToken}`,
        },
      });
      dispatch(
        setAlert({
          open: true,
          message: 'ログアウトが成功したで',
          severity: 'success',
        }),
      );
      dispatch(resetToken());
      console.log('Response:', response.data);
    } catch (error) {
      dispatch(
        setAlert({
          open: true,
          message: 'ログアウトAPIエラーになってるで',
          severity: 'error',
        }),
      );
      console.error('Error:', error);
    }
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
            hidden={!auth.isLogined}
          >
            ログアウト
          </Link>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default Header;
