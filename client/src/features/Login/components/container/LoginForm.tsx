import type { FC } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Box,
  Button,
  FormControl,
  TextField,
  FormHelperText,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';
import { LOGIN_URL } from 'domains/internal/constants/apiUrls';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { alertSlice } from 'stores/alert';
import type { AppDispatch } from 'stores/store';
import { AuthToken } from 'utils/AuthToken';
import { loginFormSchema } from '../schemas/loginFormSchema';
import type { LoginFormSchema } from '../schemas/loginFormSchema';

const LoginForm: FC = () => {
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
          message: 'ログインが成功したで',
          severity: 'success',
        }),
      );
      console.log('Response:', response.data);
    } catch (error) {
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
    <Box padding={3}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box display="flex" flexDirection="column" sx={{ gap: 2 }}>
          <FormControl error={errors.email !== undefined}>
            <TextField label="メールアドレス" {...register('email')} />
            <FormHelperText>{errors.email?.message}</FormHelperText>
          </FormControl>
          <FormControl error={errors.password !== undefined}>
            <TextField
              label="パスワード"
              {...register('password')}
              type="password"
            />
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
