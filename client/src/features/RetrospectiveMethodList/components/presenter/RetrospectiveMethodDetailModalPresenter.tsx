import type React from 'react';
import { memo } from 'react';
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
} from '@mui/material';
import axios, { type AxiosError, type AxiosResponse } from 'axios';

import { type apiSchemas } from 'domains/internal/apiSchema';
import { COMMENT_URL } from 'domains/internal/constants/apiUrls';
import { DEFAULT_ERROR_MESSAGE } from 'domains/internal/constants/errorMessage';
import type { RetrospectiveMethod } from 'domains/internal/retrospectiveJsonType';
import useSWR from 'swr';
import CloseIcon from '@mui/icons-material/Close';
import LinkIcon from '@mui/icons-material/Link';
import SendIcon from '@mui/icons-material/Send';

// eslint-disable-next-line import/extensions
import retrospectiveSceneName from '../../../../assets/retrospectiveSceneName.json';
import RetrospectiveMethodCategoryChip from './RetrospectiveMethodCategoryChip';
import RetrospectiveMethodCommentItem from './RetrospectiveMethodCommentItem';

interface RetrospectiveMethodDetailModalPresenterProps {
  isOpen: boolean;
  onCloseModal: () => void;
  retrospectiveMethod: RetrospectiveMethod;
}

const RetrospectiveMethodDetailModalPresenter: React.FC<
  RetrospectiveMethodDetailModalPresenterProps
> = ({ isOpen, onCloseModal, retrospectiveMethod }) => {
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
            height: 700,
            width: 700,
            padding: 3,
            borderRadius: 5,
            overflowY: 'auto',
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
          <CommentListArea />
          <EnteringCommentArea />
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

const CommentListArea: React.FC = memo(() => {
  const fetchComments = async (
    retrospectiveMethodId: number,
  ): Promise<
    AxiosResponse<apiSchemas['schemas']['GetCommentApiResponseBody']>
  > => {
    return await axios.get(COMMENT_URL(retrospectiveMethodId));
  };

  const CommentItems: React.FC<{ retrospectiveMethodId: number }> = ({
    retrospectiveMethodId,
  }) => {
    const { data, error, isLoading, isValidating } = useSWR<
      AxiosResponse<apiSchemas['schemas']['GetCommentApiResponseBody']>,
      AxiosError
    >(
      `retrospectiveMethodId/${retrospectiveMethodId}`,
      async () => await fetchComments(retrospectiveMethodId),
      // { suspense: true },
    );

    console.log(data, error, isLoading, isValidating);

    if (!data || error)
      return <>{'コメント取得時に' + DEFAULT_ERROR_MESSAGE}</>;

    return (
      <Box sx={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '5px' }}>
        {data.data.comments.length > 0 ? (
          data.data.comments.map((comment) => (
            <RetrospectiveMethodCommentItem
              key={comment.comment_id}
              commentData={comment}
            />
          ))
        ) : (
          <div>コメントはまだ登録されていません。</div>
        )}
      </Box>
    );
  };

  return (
    <>
      <Typography variant="h2" sx={{ fontSize: 18, fontWeight: 700 }}>
        コメント一覧
      </Typography>
      <CommentItems retrospectiveMethodId={1} />
    </>
  );
});

const EnteringCommentArea: React.FC = memo(() => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        mt: 2,
      }}
    >
      <TextField
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
      <IconButton
        sx={{
          width: '48px',
          height: '48px',
          backgroundColor: 'rgb(234, 255, 248)',
          ml: 1,
          '&:hover': {
            backgroundColor: 'rgb(234, 255, 248)',
          },
        }}
      >
        <SendIcon
          fontSize="medium"
          style={{ color: 'rgba(19, 171, 121, 1)' }}
        />
      </IconButton>
    </Box>
  );
});
