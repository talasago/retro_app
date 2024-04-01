import type { FC } from 'react';
import axios from 'axios';
import { LOGOUT_URL } from 'domains/internal/constants/apiUrls';
import { useDispatch } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import { ROUTES_LISTS } from 'routes';
import { alertSlice } from 'stores/alert';
import type { AppDispatch } from 'stores/store';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Toolbar from '@mui/material/Toolbar';

const Header: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { setAlert } = alertSlice.actions;

  const handleLogout = async (event: React.MouseEvent<HTMLAnchorElement>) => {
    // TODO:POSTするときのデータは後で実装

    event.preventDefault(); // リンクをクリックするとページの最上部にスクロールしないようにする

    try {
      // ヘッダーデータは後で対応
      const response = await axios.post(LOGOUT_URL, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      dispatch(
        setAlert({
          open: true,
          message: 'ログアウトが成功したで',
          severity: 'success',
        }),
      );
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
          >
            ユーザー登録
          </Link>
          <Link
            component={RouterLink}
            to={ROUTES_LISTS.LOGIN}
            color="inherit"
            sx={{ margin: '10px' }}
          >
            ログイン
          </Link>
          <Link
            component={RouterLink}
            to="#" // ダミーのリンク
            color="inherit"
            onClick={handleLogout}
            sx={{ margin: '10px' }}
          >
            ログアウト
          </Link>
        </Toolbar>
      </AppBar>
    </Box>
  );
};
// TODO:ログイン済みかどうかでヘッダー表示を変更する

export default Header;
