import { memo, useState, useCallback } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import axios, { type AxiosResponse } from 'axios';
import { isClientErrorResponseBody } from 'domains/internal/apiErrorUtil';
import { type apiSchemas } from 'domains/internal/apiSchema';
import { COMMENT_URL } from 'domains/internal/constants/apiUrls';
import { DEFAULT_ERROR_MESSAGE } from 'domains/internal/constants/errorMessage';
import type { RetrospectiveMethod } from 'domains/internal/retrospectiveJsonType';
import { useProtectedApi } from 'hooks/useProtectedApi';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { alertSlice } from 'stores/alert';
import type { AppDispatch } from 'stores/store';
import { UserInfo } from 'domains/UserInfo';
import {
  type CommentFormSchema,
  commentFormSchema,
} from '../Schema/commentFormSchema';
import RetrospectiveMethodDetailModalPresenter from '../presenter/RetrospectiveMethodDetailModalPresenter';

interface RetrospectiveMethodDetailModalContainerProps {
  isOpen: boolean;
  retrospectiveMethod: RetrospectiveMethod;
  onCloseModal: () => void;
  setIsNextMutate: React.Dispatch<React.SetStateAction<boolean>>;
}

export type commentsType = {
  comments: Array<{
    comment: string;
    id: number | null;
    created_at: string;
    retrospective_method_id: number;
    updated_at: string | null;
    user_uuid: string;
    user_name: string;
  }>;
};

const RetroMethodDetailModalContainer: React.FC<
  RetrospectiveMethodDetailModalContainerProps
> = ({ isOpen, retrospectiveMethod, onCloseModal, setIsNextMutate }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { setAlert } = alertSlice.actions;
  const callProtectedApi = useProtectedApi();

  const [comments, setComments] = useState<commentsType['comments']>([]);

  const callCommentAddApi = async (
    retrospectiveMethodId: number,
    comment: string,
  ): Promise<
    AxiosResponse<apiSchemas['schemas']['AddCommentApiResponseBody']>
  > => {
    return await callProtectedApi({
      url: COMMENT_URL(retrospectiveMethodId),
      method: 'POST',
      data: { comment },
    });
  };

  const callCommentDeleteApi = async (
    retrospectiveMethodId: number,
    commentId: number,
  ): Promise<
    AxiosResponse<apiSchemas['schemas']['DeleteCommentApiResponseBody']>
  > => {
    return await callProtectedApi({
      url: `${COMMENT_URL(retrospectiveMethodId)}/${commentId}`,
      method: 'DELETE',
    });
  };

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

  const onSubmit: SubmitHandler<CommentFormSchema> = async (
    commentFormSchema,
  ) => {
    let message: string = '';
    try {
      const response = await callCommentAddApi(
        retrospectiveMethod.id,
        commentFormSchema.comment,
      );
      message = response.data.message;
    } catch (error) {
      let errorMessage: string = DEFAULT_ERROR_MESSAGE;
      if (isClientErrorResponseBody(error)) {
        // refreshTokenapiでエラーの場合にこのエラーレスポンスが返ってくる
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        errorMessage = error.response!.data.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      dispatch(
        setAlert({
          open: true,
          message: errorMessage,
          severity: 'error',
        }),
      );

      return;
    }

    dispatch(
      setAlert({
        open: true,
        message,
        severity: 'success',
      }),
    );

    const { userName, userUuid } = UserInfo.getUserInfo();
    setComments((prevComments) => [
      ...prevComments,
      {
        comment: commentFormSchema.comment,
        retrospective_method_id: retrospectiveMethod.id,
        created_at: new Date().toISOString(),
        updated_at: null,
        user_uuid: userUuid,
        user_name: userName,
        id: null,
      },
    ]);

    setIsNextMutate(true);
    reset();
  };

  const handleDeleteCommentButtonClick = useCallback(
    async (commentId: number) => {
      if (!window.confirm('コメントを削除しますか？')) return;

      let message: string = '';
      try {
        const response = await callCommentDeleteApi(
          retrospectiveMethod.id,
          commentId,
        );
        message = response.data.message;
      } catch (error) {
        let errorMessage: string = DEFAULT_ERROR_MESSAGE;
        if (isClientErrorResponseBody(error)) {
          // refreshTokenapiでエラーの場合にこのエラーレスポンスが返ってくる
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          errorMessage = error.response!.data.message;
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }

        dispatch(
          setAlert({
            open: true,
            message: errorMessage,
            severity: 'error',
          }),
        );

        return;
      }

      dispatch(
        setAlert({
          open: true,
          message,
          severity: 'success',
        }),
      );

      setComments((prevComments) =>
        prevComments.filter((comment) => comment.id !== commentId),
      );
      setIsNextMutate(true);
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
      onDeleteCommentButtonClick={handleDeleteCommentButtonClick}
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
