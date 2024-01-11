import type { FC } from 'react';
import { Box, Button, TextField } from '@mui/material';
// これ実はpresentasion componentだったりするかも
interface FormData {
  email: string;
  name: string;
  password: string;
}

const RegistrationForm: FC = () => {
  // TODO:アプリ名を入れる
  return (
    <Box padding={3}>
      <form action="/hoge">
        <Box display="flex" flexDirection="column" sx={{ gap: 2 }}>
          <TextField label="Email" />
          <TextField label="Name" />
          <TextField label="Password" />
          <Button variant="contained">登録する</Button>
        </Box>
      </form>
    </Box>
  );
};

export default RegistrationForm;
