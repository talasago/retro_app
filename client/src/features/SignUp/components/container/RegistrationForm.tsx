import type { FC } from 'react';
import { Box, Button, TextField } from '@mui/material';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';

// これ実はpresentasion componentだったりするかも
interface FormData {
  email: string;
  name: string;
  password: string;
}

const RegistrationForm: FC = () => {
  // TODO:アプリ名を入れる

  // MEMO: formStateのisSubmittingとか使えば二重送信防止とかできるかも
  const { register, handleSubmit } = useForm<FormData>({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    shouldFocusError: true,
  });
  // TODO: ほんとは戻り値3つ目を使ってresetとかclearErrorsの実装した方が良さげ

  const onSubmit: SubmitHandler<FormData> = (data) => {
    // TODO: APIを叩くようにする
    console.log(data);
  };

  return (
    <Box padding={3}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box display="flex" flexDirection="column" sx={{ gap: 2 }}>
          <TextField label="Email" {...register('email')} />
          <TextField label="Name" {...register('name')} />
          <TextField label="Password" {...register('password')} />
          <Button variant="contained" type="submit">
            登録する
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default RegistrationForm;
