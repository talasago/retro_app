import { loginFormSchema } from '../components/schemas/loginFormSchema';
import type { LoginFormSchema } from '../components/schemas/loginFormSchema';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

export const useRegistrationForm = () => {
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

  return { register, handleSubmit, errors, isSubmitting };
};
