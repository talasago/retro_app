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
  IconButton,
} from '@mui/material';
import {
  BUTTON_ACCENT_COLOR,
  BUTTON_ACCENT_HOVER_COLOR,
  BASE_COLOR,
} from 'domains/internal/constants/colors';
import {
  type FieldErrors,
  type UseFormRegister,
  type UseFormHandleSubmit,
  type SubmitHandler,
} from 'react-hook-form';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import CloseIcon from '@mui/icons-material/Close';
import { type RegistrationFormSchema } from '../schemas/registrationFormSchema';

interface SignUpModalPresenterProps {
  isOpen: boolean;
  onClose: () => void;
  register: UseFormRegister<RegistrationFormSchema>;
  handleSubmit: UseFormHandleSubmit<RegistrationFormSchema>;
  onSubmit: SubmitHandler<RegistrationFormSchema>;
  errors: FieldErrors<RegistrationFormSchema>;
  isSubmitting: boolean;
}

const SignUpModalPresenter: FC<SignUpModalPresenterProps> = ({
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
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Container
          maxWidth="xl"
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onClick={onClose}
        >
          <Paper
            elevation={3}
            sx={{ width: 400, padding: 4, borderRadius: 2 }}
            onClick={(e) => {
              // ContainerでonClick={onClose}を入れている。
              // モーダルの横をクリックしたらクローズするようにしているため
              // そのクリックイベントが伝播すると、モーダル内でもクローズしてしまうため
              // この処理を追加した
              e.stopPropagation();
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
              }}
            >
              <IconButton onClick={onClose}>
                <CloseIcon />
              </IconButton>
            </Box>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                <Avatar sx={{ bgcolor: BASE_COLOR, width: 90, height: 90 }}>
                  <AssignmentIndIcon sx={{ fontSize: 50 }} />
                </Avatar>
              </Box>
              <FormControl
                fullWidth
                error={errors.name !== undefined}
                sx={{ mb: 2 }}
              >
                <TextField
                  {...register('name')}
                  fullWidth
                  variant="filled"
                  label="ユーザー名"
                  sx={{
                    bgcolor: 'grey.200',
                    borderRadius: 1,
                  }}
                />
                <FormHelperText>{errors.name?.message}</FormHelperText>
              </FormControl>
              <FormControl
                fullWidth
                error={errors.password !== undefined}
                sx={{ mb: 2 }}
              >
                <TextField
                  {...register('password')}
                  variant="filled"
                  label="パスワード"
                  type="password"
                  sx={{
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
                sx={{
                  mb: 2,
                  height: 50,
                  bgcolor: BUTTON_ACCENT_COLOR,
                  '&:hover': { bgcolor: BUTTON_ACCENT_HOVER_COLOR },
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? <CircularProgress size={24} /> : '登録する'}
              </Button>
            </form>
          </Paper>
        </Container>
      </Modal>
    </div>
  );
};

export default SignUpModalPresenter;
