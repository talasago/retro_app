// TODO:各パラメータの調整確認
// TODO:デザインとの差異確認
// TODO:モーダル閉じない時があるもんだ

import type { FC } from 'react';
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Avatar,
  Modal,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: FC<LoginModalProps> = ({ isOpen, onClose }): JSX.Element => {
  return (
    <div>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={isOpen}
        onClose={onClose}
        // closeAfterTransition
        // slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Container
          maxWidth="xl"
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            // height: '100vh', これあるとモーダルが閉じなくなる
          }}
        >
          <Paper elevation={3} sx={{ width: 400, padding: 4, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
              <Avatar sx={{ bgcolor: 'grey.800', width: 90, height: 90 }}>
                <LockIcon sx={{ fontSize: 50 }} />
              </Avatar>
            </Box>
            <TextField
              fullWidth
              variant="filled"
              label="ユーザーネーム"
              sx={{ mb: 2, bgcolor: 'grey.200', borderRadius: 1 }}
            />
            <TextField
              fullWidth
              variant="filled"
              label="パスワード"
              type="password"
              sx={{ mb: 2, bgcolor: 'grey.200', borderRadius: 1 }}
            />
            <Button
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mb: 2, bgcolor: 'grey.800', height: 50 }}
            >
              ログイン
            </Button>
            <Button
              fullWidth
              variant="outlined"
              sx={{ height: 50, borderColor: 'grey.600', color: 'grey.600' }}
            >
              ユーザー登録はこちら
            </Button>
          </Paper>
        </Container>
      </Modal>
    </div>
  );
};

export default LoginModal;
