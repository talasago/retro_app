import type { FC } from 'react';
import { useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Box,
  Button,
  FormControl,
  TextField,
  FormHelperText,
  Alert,
  CircularProgress,
} from '@mui/material';
import type { AlertColor } from '@mui/material';
import axios from 'axios';
import { LOGIN_URL } from 'domains/internal/constants/apiUrls';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { authSlice } from 'stores/auth';
import type { AppDispatch } from 'stores/store';
import { loginFormSchema } from '../schemas/loginFormSchema';
import type { LoginFormSchema } from '../schemas/loginFormSchema';

const LoginForm: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { setToken } = authSlice.actions;

  const [alert, setAlert] = useState<{
    message: string | null;
    type: AlertColor;
  }>({ message: null, type: 'success' });

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

      dispatch(
        setToken({
          isLogined: true,
          accessToken: response.data.access_token,
          refreshToken: response.data.refresh_token,
        }),
      );
      setAlert({ message: 'ログインが成功したで', type: 'success' });
      console.log('Response:', response.data);
    } catch (error) {
      setAlert({ message: 'ログインAPIエラーになってるで', type: 'error' });
      console.error('Error:', error);
    }
  };

  return (
    <Box padding={3}>
      {
        // アラートはformではなくもっと上位のコンポーネントに実装してもいいかも。共通的に使うものだし。
      }
      {alert.message !== null && !isSubmitting && (
        <Alert severity={alert.type} sx={{ mb: 3 }}>
          {alert.message}
        </Alert>
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box display="flex" flexDirection="column" sx={{ gap: 2 }}>
          <FormControl error={errors.email !== undefined}>
            <TextField label="メールアドレス" {...register('email')} />
            <FormHelperText>{errors.email?.message}</FormHelperText>
          </FormControl>
          <FormControl error={errors.password !== undefined}>
            <TextField label="パスワード" {...register('password')} />
            <FormHelperText>{errors.password?.message}</FormHelperText>
          </FormControl>
          {
            // このボタンは共通化しても良さそう
          }
          <Button variant="contained" type="submit" disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={24} /> : 'ログインする'}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default LoginForm;

const loginUser = async (requestBody: LoginFormSchema) => {
  const params = new URLSearchParams();
  params.append('username', requestBody.email);
  params.append('password', requestBody.password);

  return await axios.post(LOGIN_URL, params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
};
