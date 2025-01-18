import type { FC } from 'react';
import React from 'react';
import { Box, Toolbar, AppBar, Button } from '@mui/material';
// eslint-disable-next-line import/extensions
import logo from 'assets/logo.svg';
import { Link } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';

interface HeaderPresenterProps {
  isLogined: boolean;
  onLogout: () => void;
  onOpenLoginModal: () => void;
  onOpenSignUpModal: () => void;
}

const HeaderPresenter: FC<HeaderPresenterProps> = ({
  isLogined,
  onLogout,
  onOpenLoginModal,
  onOpenSignUpModal,
}) => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar sx={{ justifyContent: 'flex-end' }}>
          <Box sx={{ flexGrow: 1 }}>
            <Link to="/">
              <img src={logo} alt="Logo" />
            </Link>
          </Box>
          <Button
            color="inherit"
            startIcon={<PersonIcon />}
            sx={{ display: isLogined ? 'none' : 'inherit' }}
            onClick={onOpenLoginModal}
          >
            ログイン
          </Button>
          <Button
            variant="contained"
            sx={{
              ml: 2,
              bgcolor: '#d9d9d9', // この色でいいのか？
              display: isLogined ? 'none' : 'inherit',
            }}
            onClick={onOpenSignUpModal}
          >
            ユーザー登録
          </Button>
          <Button
            color="inherit"
            sx={{ display: !isLogined ? 'none' : 'inherit' }}
            onClick={onLogout}
          >
            ログアウト
          </Button>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default React.memo(HeaderPresenter);
