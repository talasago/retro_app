import { Avatar, Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

interface CommentItemProps {
  userName: string;
  date: string;
  comment: string;
  avatarUrl: string;
}

const CommentContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  marginTop: theme.spacing(3),
}));

const UserInfo = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
});

const CommentText = styled(Box)(({ theme }) => ({
  borderRadius: 14,
  backgroundColor: 'rgba(233, 250, 245, 1)',
  marginTop: theme.spacing(2),
  padding: theme.spacing(2.5, 3.75, 4),
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(2.5),
  },
}));

export function CommentItem({
  userName,
  date,
  comment,
  avatarUrl,
}: CommentItemProps) {
  return (
    <CommentContainer>
      <UserInfo>
        <Avatar
          src={avatarUrl}
          alt={`${userName}'s avatar`}
          sx={{ width: 14, height: 14 }}
        />
        <Typography variant="body2" fontWeight={500}>
          {userName}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {date}
        </Typography>
      </UserInfo>
      <CommentText>
        <Typography
          variant="body2"
          fontWeight={500}
          letterSpacing="0.98px"
          lineHeight="27px"
        >
          {comment}
        </Typography>
      </CommentText>
    </CommentContainer>
  );
}
