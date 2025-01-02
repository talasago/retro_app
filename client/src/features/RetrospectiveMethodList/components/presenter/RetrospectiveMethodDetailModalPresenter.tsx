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
import type { RetrospectiveMethod } from 'domains/internal/retrospectiveJsonType';
import CloseIcon from '@mui/icons-material/Close';
import LinkIcon from '@mui/icons-material/Link';
import SendIcon from '@mui/icons-material/Send';
// eslint-disable-next-line import/extensions
import retrospectiveSceneName from '../../../../assets/retrospectiveSceneName.json';
import RetrospectiveMethodCategoryChip from './RetrospectiveMethodCategoryChip';
import RetrospectiveMethodCommentItem from './RetrospectiveMethodCommentItem';
const dummyComments = {
  comment: [
    {
      id: 1,
      userName: 'User1',
      date: '2021-10-01',
      comment: 'This is a comment',
    },
    {
      id: 2,
      userName: 'User2',
      date: '2021-10-02',
      comment: '2222',
    },
  ],
};

interface RetrospectiveMethodDetailModalPresenterProps {
  isOpen: boolean;
  onCloseModal: () => void;
  retrospectiveMethod: RetrospectiveMethod;
}

const RetrospectiveMethodDetailModalPresenter: React.FC<
  RetrospectiveMethodDetailModalPresenterProps
> = ({ isOpen, onCloseModal, retrospectiveMethod }) => {
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
    <Box
      sx={{
        maxWidth: 730,
        padding: '3.75, 0, 8.75',
        width: '100%',
      }}
    >
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
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Container
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Paper
            sx={{ height: 700, width: 700, padding: 4, borderRadius: 5 }}
            onClick={(e) => {
              // ContainerでonClick={onClose}を入れている。
              // モーダルの横をクリックしたらクローズするようにしているため
              // そのクリックイベントが伝播すると、モーダル内でもクローズしてしまうため
              // この処理を追加した
              e.stopPropagation();
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <IconButton onClick={onCloseModal} aria-label="Close modal">
                <CloseIcon />
              </IconButton>
            </Box>

            {categoryChips}
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
            <Typography
              variant="h6"
              sx={{
                mt: 3,
                letterSpacing: '1.12px',
              }}
            >
              進め方
            </Typography>
            <Typography
              sx={{
                fontSize: 16,
                fontWeight: 500,
                letterSpacing: '1.12px',
              }}
            >
              <ul>{displayWayOfProceedings}</ul>
            </Typography>

            <Box sx={{ alignItems: 'center', gap: 1 }}>
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
                }}
              >
                {' '}
                参照元リンク
              </Link>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography
              variant="h2"
              sx={{
                fontSize: 18,
                fontWeight: 700,
                color: 'rgba(19, 171, 121, 1)',
              }}
            >
              コメント一覧
            </Typography>

            {dummyComments.comment.map((comment) => (
              <RetrospectiveMethodCommentItem
                key={comment.id}
                comment={comment}
              />
            ))}

            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <TextField
                fullWidth
                variant="filled"
                label="コメントする"
                sx={{
                  bgcolor: 'grey.200',
                  borderRadius: 1,
                }}
              />
              <IconButton>
                <SendIcon
                  style={{
                    width: 35,
                    height: 35,
                    borderRadius: 100,
                    color: 'rgba(19, 171, 121, 1)',
                    backgroundColor: 'rgb(234, 255, 248)',
                  }}
                />
              </IconButton>
            </Box>
          </Paper>
        </Container>
      </Modal>
    </Box>
  );
};

export default memo(RetrospectiveMethodDetailModalPresenter);
