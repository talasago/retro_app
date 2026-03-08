import React, { memo } from 'react';
import {
  Box,
  Modal,
  Container,
  Paper,
  IconButton,
  Typography,
  Divider,
  Link,
} from '@mui/material';
import type { RetrospectiveMethod } from 'domains/internal/retrospectiveJsonType';
import CloseIcon from '@mui/icons-material/Close';
import LinkIcon from '@mui/icons-material/Link';
import RetrospectiveMethodCategoryChip from './RetrospectiveMethodCategoryChip';

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
            width: 700,
            padding: 3,
            borderRadius: 5,
            overflowY: 'auto',
            minHeight: '350px',
            maxHeight: { xs: '600px', sm: '900px' },
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <IconButton
              onClick={onCloseModal}
              sx={{
                p: 0.5,
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
    const categoryChips = retrospectiveMethod.easyToUseScenes.map((sceneId) => {
      return (
        <RetrospectiveMethodCategoryChip key={sceneId} sceneId={sceneId} />
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
  return (
    <>
      <Typography variant="h2" sx={{ fontSize: 18, fontWeight: 700 }}>
        コメント一覧
      </Typography>
      <Box sx={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '5px' }}>
        <div>コメント機能は終了しました。</div>
      </Box>
    </>
  );
});
