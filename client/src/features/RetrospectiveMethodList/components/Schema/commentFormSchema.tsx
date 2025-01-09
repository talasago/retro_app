import * as yup from 'yup';
import type { InferType } from 'yup';

export const commentFormSchema = yup.object({
  comment: yup
    .string()
    .required('必須項目です')
    .max(100, '100文字以内で入力してください'), // サロゲートペアとかの細かい制御は考慮しない
});

export type CommentFormSchema = InferType<typeof commentFormSchema>;
