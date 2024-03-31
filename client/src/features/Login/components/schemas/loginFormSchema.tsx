import * as yup from 'yup';
import type { InferType } from 'yup';

export const loginFormSchema = yup.object({
  // TODO: 必須項目以外のバリデーションを追加する
  email: yup.string().required('必須項目です'),
  password: yup.string().required('必須項目です'),
});

export type LoginFormSchema = InferType<typeof loginFormSchema>;
