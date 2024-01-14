// これ実はpresentasion componentだったりするかも
import type { FC } from 'react';
import {
  Box,
  Button,
  FormControl,
  TextField,
  FormHelperText,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { registrationFormSchema } from '../schemas/registrationFormSchema';
import type { RegistrationFormSchema } from '../schemas/registrationFormSchema';

const RegistrationForm: FC = () => {
  // TODO:アプリ名を入れる

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
  // TODO: ほんとは戻り値を使ってresetとかclearErrorsの実装した方が良さげ

  const onSubmit: SubmitHandler<RegistrationFormSchema> = (data) => {
    // TODO: APIを叩くようにする
    console.log(data);
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
