import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { loginFormSchema } from '../components/schemas/loginFormSchema';
import type { LoginFormSchema } from '../components/schemas/loginFormSchema';

export const useLoginForm = () => {
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
