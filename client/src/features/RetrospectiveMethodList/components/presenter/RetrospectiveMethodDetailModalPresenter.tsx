import React, { memo, useEffect } from 'react';
import {
  Box,
  Modal,
  Container,
  Paper,
  IconButton,
  Typography,
  Divider,
  TextField,
  Link,
  FormControl,
  FormHelperText,
  Button,
} from '@mui/material';
import { type AxiosError, type AxiosResponse } from 'axios';

import { type apiSchemas } from 'domains/internal/apiSchema';
import { DEFAULT_ERROR_MESSAGE } from 'domains/internal/constants/errorMessage';
import type { RetrospectiveMethod } from 'domains/internal/retrospectiveJsonType';
import {
  type FieldErrors,
  type UseFormRegister,
  type UseFormHandleSubmit,
  type SubmitHandler,
} from 'react-hook-form';
import useSWR from 'swr';
import CloseIcon from '@mui/icons-material/Close';
import LinkIcon from '@mui/icons-material/Link';
import SendIcon from '@mui/icons-material/Send';
import CircularProgress from '@mui/material/CircularProgress';
import { useAuthTokenObserver } from 'domains/AuthToken';
import { UserInfo } from 'domains/UserInfo';
// eslint-disable-next-line import/extensions
import retrospectiveSceneName from '../../../../assets/retrospectiveSceneName.json';
import { type CommentFormSchema } from '../Schema/commentFormSchema';
import { type commentsType } from '../container/RetrospectiveMethodDetailModalContainer';
import RetrospectiveMethodCategoryChip from './RetrospectiveMethodCategoryChip';
import RetrospectiveMethodCommentItem from './RetrospectiveMethodCommentItem';

interface RetrospectiveMethodDetailModalPresenterProps {
  isOpen: boolean;
  onCloseModal: () => void;
  retrospectiveMethod: RetrospectiveMethod;
  fetchComments: (retrospectiveMethodId: number) => Promise<AxiosResponse>;
  register: UseFormRegister<CommentFormSchema>;
  handleSubmit: UseFormHandleSubmit<CommentFormSchema>;
  onSubmit: SubmitHandler<CommentFormSchema>;
  errors: FieldErrors<CommentFormSchema>;
  isSubmitting: boolean;
  comments: commentsType['comments'];
  setComments: React.Dispatch<React.SetStateAction<commentsType['comments']>>;
  onDeleteCommentButtonClick: (commentId: number) => void;
  onNavigateLoginButtonClick: () => void;
}

const RetrospectiveMethodDetailModalPresenter: React.FC<
  RetrospectiveMethodDetailModalPresenterProps
> = ({
  isOpen,
  onCloseModal,
  retrospectiveMethod,
  fetchComments,
  register,
  handleSubmit,
  onSubmit,
  errors,
  isSubmitting,
  comments,
  setComments,
  onDeleteCommentButtonClick,
  onNavigateLoginButtonClick,
}) => {
  const isLogined: boolean = useAuthTokenObserver() as boolean;
  const [isGetApiError, setIsGetApiError] = React.useState<boolean>(false);

  return (
    <Modal
      open={isOpen}
      onClose={onCloseModal}
      slotProps={{
        backdrop: {
          timeout: 500,
        },
      }}
      sx={{
        display: 'flex',
      }}
    >
      <Container
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        onClick={onCloseModal}
      >
        <Paper
          sx={{
            width: 700,
            padding: 3,
            borderRadius: 5,
            overflowY: 'auto',
            minHeight: '350px',
            maxHeight: { xs: '600px', sm: '900px' },
          }}
          onClick={(e) => {
            // モーダルの横をクリックしたらクローズするようにしているため、ContainerでonClick={onClose}を入れている。
            // ここでe.stopPropagation()を入れないと、そのクリックイベントが伝播すると、モーダル内でもクローズしてしまう。
            e.stopPropagation();
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <IconButton
              onClick={onCloseModal}
              sx={{
                p: 0.5,
                // 見た目のサイズはそのまま
                // 当たり判定だけ広げる
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '-10px',
                  left: '-10px',
                  right: '-10px',
                  bottom: '-10px',
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          <RetrospectiveMethodArea retrospectiveMethod={retrospectiveMethod} />
          <Divider sx={{ my: 2 }} />
          <CommentListArea
            retrospectiveMethodId={retrospectiveMethod.id}
            fetchComments={fetchComments}
            comments={comments}
            setComments={setComments}
            setIsGetApiError={setIsGetApiError}
            onDeleteCommentButtonClick={onDeleteCommentButtonClick}
          />
          {!isGetApiError ? (
            isLogined ? (
              <EnteringCommentArea
                register={register}
                handleSubmit={handleSubmit}
                onSubmit={onSubmit}
                errors={errors}
                isSubmitting={isSubmitting}
                isGetApiError={isGetApiError}
              />
            ) : (
              <NavigateLoginArea
                onNavigateLoginButtonClick={onNavigateLoginButtonClick}
              />
            )
          ) : null}
        </Paper>
      </Container>
    </Modal>
  );
};

export default memo(RetrospectiveMethodDetailModalPresenter);

interface RetrospectiveMethodAreaProps {
  retrospectiveMethod: RetrospectiveMethod;
}

const RetrospectiveMethodArea: React.FC<RetrospectiveMethodAreaProps> = memo(
  ({ retrospectiveMethod }) => {
    // IDを元に文言のtipに変換
    const categoryChips = retrospectiveMethod.easyToUseScenes.map((sceneId) => {
      return (
        <RetrospectiveMethodCategoryChip
          key={sceneId}
          sceneId={sceneId}
          retrospectiveSceneNames={retrospectiveSceneName}
        />
      );
    });

    const displayWayOfProceedings = retrospectiveMethod.wayOfProceeding
      .split('\n')
      .map((val, idx) => {
        return <li key={idx}>{val}</li>;
      });

    return (
      <>
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {categoryChips}
        </Box>

        <Typography
          variant="h1"
          sx={{
            color: 'rgba(19, 171, 121, 1)',
            fontSize: 24,
            fontWeight: 700,
            mt: 2.5,
          }}
        >
          {retrospectiveMethod.title}
        </Typography>

        <Typography variant="h6" sx={{ mt: 1, letterSpacing: '1.12px' }}>
          進め方
        </Typography>

        <Box
          sx={{
            fontSize: 16,
            fontWeight: 500,
            letterSpacing: '1.12px',
            mt: -2,
          }}
        >
          <ul>{displayWayOfProceedings}</ul>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <LinkIcon sx={{ width: 14, height: 14 }} />
          <Link
            href={retrospectiveMethod.reference}
            rel="noopener"
            target="_blank"
            sx={{
              color: 'rgba(19, 171, 121, 1)',
              fontSize: 14,
              fontWeight: 500,
              textDecoration: 'none',
              ml: 0.5,
            }}
          >
            参照元リンク
          </Link>
        </Box>
      </>
    );
  },
);

interface CommentListAreaProps {
  retrospectiveMethodId: number;
  fetchComments: (retrospectiveMethodId: number) => Promise<AxiosResponse>;
  comments: RetrospectiveMethodDetailModalPresenterProps['comments'];
  setComments: RetrospectiveMethodDetailModalPresenterProps['setComments'];
  setIsGetApiError: React.Dispatch<React.SetStateAction<boolean>>;
  onDeleteCommentButtonClick: (commentId: number) => void;
}

const CommentListArea: React.FC<CommentListAreaProps> = memo(
  ({
    retrospectiveMethodId,
    fetchComments,
    comments,
    setComments,
    setIsGetApiError,
    onDeleteCommentButtonClick,
  }) => {
    const { data, error, isLoading } = useSWR<
      AxiosResponse<apiSchemas['schemas']['GetCommentApiResponseBody']>,
      AxiosError
    >(
      `retrospectiveMethodId/${retrospectiveMethodId}`,
      async () => await fetchComments(retrospectiveMethodId),
      { revalidateIfStale: false },
    );

    useEffect(() => {
      setComments(data ? data.data.comments : []);
    }, [data, setComments]);

    useEffect(() => {
      error ? setIsGetApiError(true) : setIsGetApiError(false);
    }, [error, setIsGetApiError]);

    let displayComments;
    if (!data || error) {
      displayComments = <>{'コメント取得時に' + DEFAULT_ERROR_MESSAGE}</>;
    } else if (comments.length > 0) {
      displayComments = comments.map((comment, idx) => (
        <RetrospectiveMethodCommentItem
          key={idx}
          commentData={comment}
          isDisplayDeleteButton={
            comment.user_uuid === UserInfo.getUserInfo().userUuid &&
            comment.id !== null // 登録後に再レンダリングされていないもの
            // MEMO: idが特定できないので削除APIを呼び出せないため、削除ボタンを非表示にする
            // 本来なら、「登録した後にすぐに削除したいユースケース」を優先すべきだが、
            // それを満たせるような処理が浮かばなかったためこのような実装になっている
          }
          onDeleteCommentButtonClick={onDeleteCommentButtonClick}
        />
      ));
    } else {
      displayComments = <div>コメントはまだ登録されていません。</div>;
    }

    return (
      <>
        <Typography variant="h2" sx={{ fontSize: 18, fontWeight: 700 }}>
          コメント一覧
        </Typography>
        <Box
          sx={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '5px' }}
        >
          {isLoading ? <CircularProgress /> : displayComments}
        </Box>
      </>
    );
  },
);

interface EnteringCommentAreaProps {
  register: UseFormRegister<CommentFormSchema>;
  handleSubmit: UseFormHandleSubmit<CommentFormSchema>;
  onSubmit: SubmitHandler<CommentFormSchema>;
  errors: FieldErrors<CommentFormSchema>;
  isSubmitting: boolean;
  isGetApiError: boolean;
}

const EnteringCommentArea: React.FC<EnteringCommentAreaProps> = memo(
  ({
    register,
    handleSubmit,
    onSubmit,
    errors,
    isSubmitting,
    isGetApiError,
  }) => {
    return isGetApiError ? (
      <></>
    ) : (
      <Box
        component="form"
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          mt: 2,
        }}
        onSubmit={handleSubmit(onSubmit)}
      >
        <FormControl fullWidth error={errors.comment !== undefined}>
          <TextField
            {...register('comment')}
            fullWidth
            variant="outlined"
            label="コメントする"
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgb(216, 216, 216)',
                borderRadius: '100px',
                '&.Mui-focused fieldset': {
                  borderColor: 'gray',
                },
              },
            }}
          />
          <FormHelperText>{errors.comment?.message}</FormHelperText>
        </FormControl>
        <IconButton
          type="submit"
          sx={{
            width: '48px',
            height: '48px',
            backgroundColor: 'rgb(234, 255, 248)',
            ml: 1,
            '&:hover': {
              backgroundColor: 'rgb(234, 255, 248)',
            },
            mb: errors.comment ? 2.5 : 0,
          }}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <CircularProgress />
          ) : (
            <SendIcon
              fontSize="medium"
              style={{ color: 'rgba(19, 171, 121, 1)' }}
            />
          )}
        </IconButton>
      </Box>
    );
  },
);

interface NavigateLoginAreaProps {
  onNavigateLoginButtonClick: () => void;
}

const NavigateLoginArea: React.FC<NavigateLoginAreaProps> = memo(
  ({ onNavigateLoginButtonClick }) => {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          sx={{
            bgcolor: '#FE6D36',
            '&:hover': {
              bgcolor: '#FF5733',
            },
            height: 50,
          }}
          onClick={onNavigateLoginButtonClick}
        >
          ログインしてコメントする
        </Button>
      </Box>
    );
  },
);
