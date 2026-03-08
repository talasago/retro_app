import type { FC } from 'react';
import React from 'react';
import { Box, Toolbar, AppBar, Button, CircularProgress, Tooltip } from '@mui/material';
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
          <Box sx={{ display: isLogined ? 'none' : 'flex', gap: 2 }}>
            <Tooltip title="サービス終了のため利用できません">
              <span>
                <Button
                  color="inherit"
                  startIcon={<PersonIcon />}
                  disabled
                >
                  ログイン
                </Button>
              </span>
            </Tooltip>
            <Tooltip title="サービス終了のため利用できません">
              <span>
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: BUTTON_ACCENT_COLOR,
                    '&:hover': {
                      bgcolor: BUTTON_ACCENT_HOVER_COLOR,
                    },
                  }}
                  disabled
                >
                  ユーザー登録
                </Button>
              </span>
            </Tooltip>
          </Box>
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
