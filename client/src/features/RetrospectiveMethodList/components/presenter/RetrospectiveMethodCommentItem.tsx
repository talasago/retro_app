import { memo, Fragment } from 'react';
import { Box, Typography, IconButton, CircularProgress } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import { type commentsType } from '../container/RetrospectiveMethodDetailModalContainer';

interface RetrospectiveMethodCommentProps {
  commentData: commentsType['comments'][0];
  isDisplayDeleteButton: boolean;
  onDeleteCommentButtonClick: (commentId: number) => void;
  isSubmittingDelete: boolean;
}

const RetrospectiveMethodCommentItem: React.FC<
  RetrospectiveMethodCommentProps
> = ({
  commentData,
  isDisplayDeleteButton,
  onDeleteCommentButtonClick,
  isSubmittingDelete,
}) => {
  const formatDate = (dateString: string): string => {
    return new Date(dateString)
      .toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
      .replace(/\//g, '/');
  };

  const formatText = (text: string): JSX.Element[] => {
    return text.split('\n').map((line, idx) => (
      <Fragment key={idx}>
        {line}
        <br />
      </Fragment>
    ));
  };

  // ユーザー名の文字数が長い場合のレイアウト崩れは考慮してない
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        mt: 2,
        mb: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <PersonIcon sx={{ color: 'rgb(162, 162, 162)}}' }} fontSize="small" />
        <Typography variant="body2" fontWeight={500}>
          {commentData.user_name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {formatDate(commentData.created_at)}
        </Typography>
        {isDisplayDeleteButton && (
          <IconButton
            onClick={() => {
              commentData.id !== null &&
                onDeleteCommentButtonClick(commentData.id);
            }}
          >
            {isSubmittingDelete ? (
              <CircularProgress size={24} />
            ) : (
              <DeleteIcon
                sx={{ color: 'rgb(162, 162, 162)' }}
                fontSize="small"
              />
            )}
          </IconButton>
        )}
      </Box>
      <Box
        sx={{
          borderRadius: 4,
          backgroundColor: 'rgba(233, 250, 245, 1)',
          p: 2,
        }}
      >
        <Typography
          variant="body2"
          fontWeight={500}
          letterSpacing="0.98px"
          lineHeight="27px"
        >
          {formatText(commentData.comment)}
        </Typography>
      </Box>
    </Box>
  );
};

export default memo(RetrospectiveMethodCommentItem);
