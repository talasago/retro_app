import type { FC } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Box,
  Button,
  FormControl,
  TextField,
  FormHelperText,
} from '@mui/material';
import axios from 'axios';
import { SIGN_UP_URL } from 'domains/internal/constants/apiUrls';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { registrationFormSchema } from '../schemas/registrationFormSchema';
import type { RegistrationFormSchema } from '../schemas/registrationFormSchema';

const RegistrationForm: FC = () => {
  // TODO:アプリ名を入れる

  // hooks/に移動した方が良いのかな...よくわかってない
  // MEMO: formStateのisSubmittingとか使えば二重送信防止とかできるかも
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistrationFormSchema>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    shouldFocusError: true,
    resolver: yupResolver(registrationFormSchema),
  });
  // MEMO: ほんとは戻り値を使ってresetとかclearErrorsの実装した方が良さげ

  const onSubmit: SubmitHandler<RegistrationFormSchema> = async (data) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_API_URL}${SIGN_UP_URL}`,
        data,
        {
          headers: {
            'Content-Type': 'application/json', // ヘッダーにapplication/jsonを追加
          },
        },
      );
      window.alert('ユーザー登録API正常終了したで');
      console.log('Response:', response.data);
    } catch (error) {
      window.alert('ユーザー登録APIエラーになってるで');
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
            <TextField label="パスワード" {...register('password')} />
            <FormHelperText>{errors.password?.message}</FormHelperText>
          </FormControl>
          <Button variant="contained" type="submit">
            登録する
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default RegistrationForm;
