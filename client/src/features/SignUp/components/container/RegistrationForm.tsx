import type { FC } from 'react';
import { useState } from 'react';
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
import { SIGN_UP_URL } from 'domains/internal/constants/apiUrls';
import type { SubmitHandler } from 'react-hook-form';
import { useRegistrationForm } from '../../hooks/useRegistrationForm';
import type { RegistrationFormSchema } from '../schemas/registrationFormSchema';

const RegistrationForm: FC = () => {
  const [alert, setAlert] = useState<{
    message: string | null;
    type: AlertColor;
  }>({ message: null, type: 'success' });

  const { register, handleSubmit, errors, isSubmitting } =
    useRegistrationForm();
  // MEMO: ほんとは戻り値を使ってresetとかclearErrorsの実装した方が良さげ

  const onSubmit: SubmitHandler<RegistrationFormSchema> = async (data) => {
    try {
      const response = await registUser(data);

      setAlert({ message: 'ユーザー登録が成功したで', type: 'success' });
      console.log('Response:', response.data);
    } catch (error) {
      setAlert({ message: 'ユーザー登録APIエラーになってるで', type: 'error' });
      console.error('Error:', error);
    }
  };

  return (
    <Box padding={3}>
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
          <FormControl error={errors.name !== undefined}>
            <TextField label="名前" {...register('name')} />
            <FormHelperText>{errors.name?.message}</FormHelperText>
          </FormControl>
          <FormControl error={errors.password !== undefined}>
            <TextField label="パスワード" {...register('password')} />
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
