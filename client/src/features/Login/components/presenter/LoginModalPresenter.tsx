import { type FC } from 'react';
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
import {
  type FieldErrors,
  type UseFormRegister,
  type UseFormHandleSubmit,
  type SubmitHandler,
} from 'react-hook-form';
import LockIcon from '@mui/icons-material/Lock';
import { type LoginFormSchema } from '../schemas/loginFormSchema';

interface LoginModalPresenterProps {
  isOpen: boolean;
  onClose: () => void;
  register: UseFormRegister<LoginFormSchema>;
  handleSubmit: UseFormHandleSubmit<LoginFormSchema>;
  onSubmit: SubmitHandler<LoginFormSchema>;
  errors: FieldErrors<LoginFormSchema>;
  isSubmitting: boolean;
}

const LoginModalPresenter: FC<LoginModalPresenterProps> = ({
  isOpen,
  onClose,
  register,
  handleSubmit,
  onSubmit,
  errors,
  isSubmitting,
}) => {
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
                sx={{
                  height: 50,
                  borderColor: 'grey.600',
                  color: 'grey.600',
                }}
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

export default LoginModalPresenter;
