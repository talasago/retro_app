import type { FC } from 'react';
import { Box, Typography, Toolbar, AppBar, Button } from '@mui/material';
import { LOGOUT_URL } from 'domains/internal/constants/apiUrls';
import { useProtectedApi } from 'hooks/useProtectedApi';
import { useDispatch } from 'react-redux';
import { alertSlice } from 'stores/alert';
import type { AppDispatch } from 'stores/store';
import PersonIcon from '@mui/icons-material/Person';

import { AuthToken, useAuthTokenObserver } from 'domains/AuthToken';

const Header: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { setAlert } = alertSlice.actions;
  const callProtectedApi = useProtectedApi();
  const isLogined: boolean = useAuthTokenObserver() as boolean;

  const handleLogout = async () => {
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
    AuthToken.resetTokens();
    console.log('Response:', response?.data);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar sx={{ justifyContent: 'flex-end' }}>
          {/* 右寄せにしている */}
          <Typography variant="h4" sx={{ flexGrow: 1, ml: 3 }}>
            LOGO
          </Typography>
          {/* TODO: モーダルを開く処理の追加が必要 */}
          <Button
            color="inherit"
            startIcon={<PersonIcon />}
            sx={{ display: isLogined ? 'none' : 'inhelit' }}
          >
            ログイン
          </Button>
          <Button
            variant="contained"
            sx={{
              ml: 2,
              bgcolor: '#d9d9d9', // この色でいいのか？
              display: isLogined ? 'none' : 'inhelit',
            }}
          >
            ユーザー登録
          </Button>
          <Button
            color="inherit"
            sx={{ display: !isLogined ? 'none' : 'inhelit' }}
            onClick={handleLogout}
          >
            ログアウト
          </Button>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default Header;
