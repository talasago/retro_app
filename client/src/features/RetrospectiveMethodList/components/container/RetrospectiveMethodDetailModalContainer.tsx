import { memo, useState, useEffect, useCallback } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { PermDeviceInformation } from '@mui/icons-material';
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

export type commentsType = {
  comments: Array<{
    comment: string;
    comment_id: number | null;
    created_at: string;
    retrospective_method_id: number;
    updated_at: string | null;
    user_uuid: string;
    user_name: string;
  }>;
};

const RetroMethodDetailModalContainer: React.FC<
  RetrospectiveMethodDetailModalContainerProps
> = ({ isOpen, retrospectiveMethod, onCloseModal }) => {
  const [comments, setComments] = useState<commentsType['comments']>([]);

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

  //  const handleDeleteComment = useCallback((commentId: number) => {
  //    setComments((prevComments) =>
  //      prevComments.filter((comment) => comment.comment_id !== commentId),
  //    );
  //  }, []);
  //

  // まだ未使用
  const handleAddComment = useCallback(
    (comment: string) => {
      setComments((prevComments) => [
        ...prevComments,
        {
          comment,
          retrospective_method_id: retrospectiveMethod.id,
          created_at: new Date().toISOString(),
          updated_at: null,
          user_uuid: 'user_uuid',
          user_name: 'user_name',
          comment_id: null,
        },
      ]);
    },
    [retrospectiveMethod],
  );

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
      comments={comments}
      setComments={setComments}
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
