import type { FC } from 'react';
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
        </Toolbar>
      </AppBar>
    </Box>
  );
};
// TODO:ログイン済みかどうかでヘッダー表示を変更する

export default Header;
