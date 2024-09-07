// TODO:各パラメータの調整確認
// TODO:デザインとの差異確認
// TODO:モーダル閉じない時があるもんだい
// TODO:ログインフォームの削除
// presenterとcontainerの分離

import type { FC } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Box,
  Button,
  Container,
  Paper,
  FormControl,
  TextField,
  Avatar,
  Modal,
  FormHelperText,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';
import { LOGIN_URL } from 'domains/internal/constants/apiUrls';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { alertSlice } from 'stores/alert';
import type { AppDispatch } from 'stores/store';
import LockIcon from '@mui/icons-material/Lock';
import { AuthToken } from 'domains/AuthToken';
import { loginFormSchema } from '../schemas/loginFormSchema';
import type { LoginFormSchema } from '../schemas/loginFormSchema';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const loginUser = async (requestBody: LoginFormSchema) => {
  const params = new URLSearchParams();
  params.append('username', requestBody.name);
  params.append('password', requestBody.password);

  return await axios.post(LOGIN_URL, params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
};

// TODO: ヘッダーとこれはuseMemoを使ってもいいかも
const LoginModal: FC<LoginModalProps> = ({ isOpen, onClose }): JSX.Element => {
  const dispatch = useDispatch<AppDispatch>();
  const { setAlert } = alertSlice.actions;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormSchema>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    shouldFocusError: true,
    resolver: yupResolver(loginFormSchema),
  });
  // MEMO: ほんとは戻り値を使ってresetとかclearErrorsの実装した方が良さげ

  const onSubmit: SubmitHandler<LoginFormSchema> = async (loginFormData) => {
    try {
      const response = await loginUser(loginFormData);

      AuthToken.setTokens(
        response.data.access_token,
        response.data.refresh_token,
      );

      dispatch(
        setAlert({
          open: true,
          message: 'ログインしました',
          severity: 'success',
        }),
      );
      console.log('Response:', response.data);
    } catch (error) {
      // TODO:500エラーと400エラーでメッセージを変える
      dispatch(
        setAlert({
          open: true,
          message: 'ログインAPIがエラーになってるで',
          severity: 'error',
        }),
      );
      console.error('Error:', error);
    }
  };

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
            <form onSubmit={handleSubmit(onSubmit)}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                <Avatar sx={{ bgcolor: 'grey.800', width: 90, height: 90 }}>
                  <LockIcon sx={{ fontSize: 50 }} />
                </Avatar>
              </Box>
              <FormControl fullWidth error={errors.name !== undefined}>
                <TextField
                  {...register('name')}
                  fullWidth
                  variant="filled"
                  label="ユーザー名"
                  sx={{
                    mb: 2,
                    bgcolor: 'grey.200',
                    borderRadius: 1,
                  }}
                />
                <FormHelperText>{errors.name?.message}</FormHelperText>
              </FormControl>
              <FormControl fullWidth error={errors.password !== undefined}>
                <TextField
                  {...register('password')}
                  variant="filled"
                  label="パスワード"
                  type="password"
                  sx={{
                    mb: 2,
                    bgcolor: 'grey.200',
                    borderRadius: 1,
                    width: '100%',
                  }}
                />
                <FormHelperText>{errors.password?.message}</FormHelperText>
              </FormControl>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                sx={{ mb: 2, bgcolor: 'grey.800', height: 50 }}
                disabled={isSubmitting}
              >
                {isSubmitting ? <CircularProgress size={24} /> : 'ログインする'}
              </Button>
              <Button
                fullWidth
                variant="outlined"
                sx={{ height: 50, borderColor: 'grey.600', color: 'grey.600' }}
                // TODO: ユーザー登録モーダルを開く
              >
                ユーザー登録はこちら
              </Button>
            </form>
          </Paper>
        </Container>
      </Modal>
    </div>
  );
};

export default LoginModal;
