import { memo, Fragment } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { type apiSchemas } from 'domains/internal/apiSchema';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';

interface RetrospectiveMethodCommentProps {
  commentData: apiSchemas['schemas']['GetCommentApiResponseBody']['comments'][0];
}

const RetrospectiveMethodCommentItem: React.FC<
  RetrospectiveMethodCommentProps
> = ({ commentData }) => {
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
          {commentData.user_id}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {formatDate(commentData.created_at)}
        </Typography>
        <IconButton>
          <DeleteIcon sx={{ color: 'rgb(162, 162, 162)}}' }} fontSize="small" />
        </IconButton>
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
