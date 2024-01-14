import { registrationFormSchema } from '../components/schemas/registrationFormSchema';
import type { RegistrationFormSchema } from '../components/schemas/registrationFormSchema';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

export const useRegistrationForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationFormSchema>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    shouldFocusError: true,
    resolver: yupResolver(registrationFormSchema),
  });

  return { register, handleSubmit, errors, isSubmitting };
};
