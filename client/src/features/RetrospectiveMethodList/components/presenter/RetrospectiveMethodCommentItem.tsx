import { memo } from 'react';
import { Avatar, Box, Typography } from '@mui/material';

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
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        mt: 3,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Avatar sx={{ width: 14, height: 14 }} />
        <Typography variant="body2" fontWeight={500}>
          {comment.userName}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {comment.date}
        </Typography>
      </Box>
      <Box
        sx={{
          borderRadius: 14,
          backgroundColor: 'rgba(233, 250, 245, 1)',
          mt: 2,
          p: 3,
        }}
      >
        <Typography
          variant="body2"
          fontWeight={500}
          letterSpacing="0.98px"
          lineHeight="27px"
        >
          {comment.comment}
        </Typography>
      </Box>
    </Box>
  );
};

export default memo(RetrospectiveMethodCommentItem);
