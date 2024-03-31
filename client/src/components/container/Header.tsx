import type { FC } from 'react';
import axios from 'axios';
import { LOGOUT_URL } from 'domains/internal/constants/apiUrls';
import { Link as RouterLink } from 'react-router-dom';
import { ROUTES_LISTS } from 'routes';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Toolbar from '@mui/material/Toolbar';

const Header: FC = () => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar sx={{ justifyContent: 'flex-end' }}>
          {/* 右寄せにしている */}
          <Link
            component={RouterLink}
            to={ROUTES_LISTS.SIGN_UP}
            color="inherit"
            sx={{ marginRight: '20px' }}
          >
            ユーザー登録
          </Link>
          <Link component={RouterLink} to={ROUTES_LISTS.LOGIN} color="inherit">
            ログイン
          </Link>
          <Link color="inherit" onClick={handleLogout}>
            ログアウト
          </Link>
        </Toolbar>
      </AppBar>
    </Box>
  );
};
// TODO:ログイン済みかどうかでヘッダー表示を変更する

export default Header;

const handleLogout = async () => {
  return await axios.post(LOGOUT_URL);
  // TODO:POSTするときのデータは後で実装
  // return await axios.post(LOGOUT_URL, data, {
  //  headers: {
  //    'Content-Type': 'application/json',
  //  },
  // });
};
