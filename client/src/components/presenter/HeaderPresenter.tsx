import type { FC } from 'react';
import React from 'react';
import { Box, Toolbar, AppBar, Button, CircularProgress } from '@mui/material';
// eslint-disable-next-line import/extensions
import logo from 'assets/logo.svg';
import {
  BUTTON_ACCENT_COLOR,
  BUTTON_ACCENT_HOVER_COLOR,
} from 'domains/internal/constants/colors';
import { Link } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';

interface HeaderPresenterProps {
  isLogined: boolean;
  onLogout: () => void;
  onOpenLoginModal: () => void;
  onOpenSignUpModal: () => void;
  isSubmitting: boolean;
}

const HeaderPresenter: FC<HeaderPresenterProps> = ({
  isLogined,
  onLogout,
  onOpenLoginModal,
  onOpenSignUpModal,
  isSubmitting,
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
              bgcolor: BUTTON_ACCENT_COLOR,
              '&:hover': {
                bgcolor: BUTTON_ACCENT_HOVER_COLOR,
              },
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
            {isSubmitting ? <CircularProgress size={24} /> : 'ログアウト'}
          </Button>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default React.memo(HeaderPresenter);
