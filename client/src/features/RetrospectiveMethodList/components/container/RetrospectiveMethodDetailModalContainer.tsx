import { memo } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import axios, { type AxiosResponse } from 'axios';
import { type apiSchemas } from 'domains/internal/apiSchema';
import { COMMENT_URL } from 'domains/internal/constants/apiUrls';
import type { RetrospectiveMethod } from 'domains/internal/retrospectiveJsonType';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import {
  type CommentFormSchema,
  commentFormSchema,
} from '../Schema/commentFormSchema';
import RetrospectiveMethodDetailModalPresenter from '../presenter/RetrospectiveMethodDetailModalPresenter';

interface RetrospectiveMethodDetailModalContainerProps {
  isOpen: boolean;
  retrospectiveMethod: RetrospectiveMethod;
  onCloseModal: () => void;
}

const RetroMethodDetailModalContainer: React.FC<
  RetrospectiveMethodDetailModalContainerProps
> = ({ isOpen, retrospectiveMethod, onCloseModal }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CommentFormSchema>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    shouldFocusError: true,
    resolver: yupResolver(commentFormSchema),
  });

  const onSubmit: SubmitHandler<CommentFormSchema> = (commentFormSchema) => {
    console.log('commentFormSchema', commentFormSchema);
    reset();
  };

  return (
    <RetrospectiveMethodDetailModalPresenter
      isOpen={isOpen}
      onCloseModal={onCloseModal}
      retrospectiveMethod={retrospectiveMethod}
      fetchComments={fetchComments}
      register={register}
      handleSubmit={handleSubmit}
      onSubmit={onSubmit}
      errors={errors}
      isSubmitting={isSubmitting}
    />
  );
};

export default memo(RetroMethodDetailModalContainer);

const fetchComments = async (
  retrospectiveMethodId: number,
): Promise<
  AxiosResponse<apiSchemas['schemas']['GetCommentApiResponseBody']>
> => {
  return await axios.get(COMMENT_URL(retrospectiveMethodId));
};
