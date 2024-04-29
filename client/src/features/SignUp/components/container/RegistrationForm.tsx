import type { FC } from 'react';
import {
  Box,
  Button,
  FormControl,
  TextField,
  FormHelperText,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';
import { SIGN_UP_URL } from 'domains/internal/constants/apiUrls';
import type { SubmitHandler } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { alertSlice } from 'stores/alert';
import type { AppDispatch } from 'stores/store';
import { useRegistrationForm } from '../../hooks/useRegistrationForm';
import type { RegistrationFormSchema } from '../schemas/registrationFormSchema';

const RegistrationForm: FC = () => {
  const { setAlert } = alertSlice.actions;
  const dispatch = useDispatch<AppDispatch>();

  const { register, handleSubmit, errors, isSubmitting } =
    useRegistrationForm();
  // MEMO: ほんとは戻り値を使ってresetとかclearErrorsの実装した方が良さげ

  const onSubmit: SubmitHandler<RegistrationFormSchema> = async (data) => {
    try {
      const response = await registUser(data);
      dispatch(
        setAlert({
          open: true,
          message: 'ユーザー登録が成功しました。ログイン画面でログインしてください。',
          severity: 'success',
        }),
      );
      console.log('Response:', response.data);
    } catch (error) {
      dispatch(
        setAlert({
          open: true,
          message: 'ユーザー登録APIがエラーになってるで',
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
          <FormControl error={errors.name !== undefined}>
            <TextField label="名前" {...register('name')} />
            <FormHelperText>{errors.name?.message}</FormHelperText>
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
            {isSubmitting ? <CircularProgress size={24} /> : '登録する'}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default RegistrationForm;

const registUser = async (data: RegistrationFormSchema) => {
  return await axios.post(SIGN_UP_URL, data, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
