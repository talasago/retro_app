import * as yup from 'yup';
import type { InferType } from 'yup';

export const registrationFormSchema = yup.object({
  // TODO: 必須項目以外のバリデーションを追加する
  name: yup.string().required('必須項目です'),
  password: yup.string().required('必須項目です'),
});

export type RegistrationFormSchema = InferType<typeof registrationFormSchema>;
