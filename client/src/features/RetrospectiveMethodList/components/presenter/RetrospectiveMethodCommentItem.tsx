import { memo, Fragment } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
interface RetrospectiveMethodCommentProps {
  comment: {
    id: number;
    userName: string;
    date: string;
    comment: string;
  };
}

const RetrospectiveMethodCommentItem: React.FC<
  RetrospectiveMethodCommentProps
> = ({ comment }) => {
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
          {comment.userName}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {formatDate(comment.date)}
        </Typography>
        <IconButton>
          <DeleteIcon sx={{ color: 'rgb(162, 162, 162)}}' }} fontSize="small" />
        </IconButton>
      </Box>
      <Box
        sx={{
          borderRadius: 4,
          backgroundColor: 'rgba(233, 250, 245, 1)',
          p: 3,
        }}
      >
        <Typography
          variant="body2"
          fontWeight={500}
          letterSpacing="0.98px"
          lineHeight="27px"
        >
          {formatText(comment.comment)}
        </Typography>
      </Box>
    </Box>
  );
};

export default memo(RetrospectiveMethodCommentItem);
