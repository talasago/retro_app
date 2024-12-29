import {
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import LinkIcon from '@mui/icons-material/Link';
import { CommentItem } from './CommentItem';
import type { RetroMethodType } from './types';

interface RetroModalProps {
  retroMethod: RetroMethodType;
  onClose: () => void;
}

const ModalWrapper = styled(Container)({
  maxWidth: 730,
  fontFamily: 'Noto Sans, sans-serif',
});

const ModalContent = styled(Box)(({ theme }) => ({
  borderRadius: 20,
  backgroundColor: 'white',
  boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
  padding: theme.spacing(3.75, 0, 8.75),
  width: '100%',
}));

const CategoryTag = styled(Box)({
  borderRadius: 60,
  backgroundColor: 'rgba(254, 101, 128, 1)',
  color: 'white',
  fontSize: 11,
  fontWeight: 700,
  padding: '2px 14px',
  display: 'inline-block',
  letterSpacing: '0.77px',
  lineHeight: '20px',
});

const LoginButton = styled(Button)(({ theme }) => ({
  backgroundColor: 'rgba(254, 109, 54, 1)',
  color: 'white',
  borderRadius: 4,
  padding: theme.spacing(1.875, 3.75),
  fontWeight: 700,
  fontSize: 14,
  marginTop: theme.spacing(6.25),
  alignSelf: 'center',
  '&:hover': {
    backgroundColor: 'rgba(254, 109, 54, 0.9)',
  },
}));

export function RetroModal({ retroMethod, onClose }: RetroModalProps) {
  return (
    <ModalWrapper>
      <ModalContent>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 3.75 }}>
          <IconButton onClick={onClose} aria-label="Close modal">
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ px: { xs: 2.5, md: 7.5 }, mt: 3.25 }}>
          <CategoryTag>{retroMethod.category}</CategoryTag>

          <Typography
            variant="h1"
            sx={{
              color: 'rgba(19, 171, 121, 1)',
              fontSize: 24,
              fontWeight: 700,
              mt: 2.5,
            }}
          >
            {retroMethod.title}
          </Typography>

          <Typography
            sx={{
              mt: 3.75,
              fontSize: 16,
              fontWeight: 500,
              lineHeight: '30px',
              letterSpacing: '1.12px',
            }}
          >
            {retroMethod.description}
          </Typography>

          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 5.375 }}
          >
            <LinkIcon sx={{ width: 14, height: 14 }} />
            <Typography
              component="a"
              href={retroMethod.link}
              sx={{
                color: 'rgba(19, 171, 121, 1)',
                fontSize: 14,
                fontWeight: 500,
                textDecoration: 'none',
                letterSpacing: '0.98px',
                lineHeight: '25px',
              }}
            >
              {retroMethod.link}
            </Typography>
          </Box>

          <Divider sx={{ my: 6 }} />

          <Typography
            variant="h2"
            sx={{
              fontSize: 18,
              fontWeight: 700,
              lineHeight: '34px',
            }}
          >
            コメント一覧
          </Typography>

          {retroMethod.comments.map((comment) => (
            <CommentItem
              key={comment.id}
              userName={comment.userName}
              date={comment.date}
              comment={comment.comment}
              avatarUrl={comment.avatarUrl}
            />
          ))}

          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <LoginButton variant="contained" disableElevation>
              ログインしてコメントする
            </LoginButton>
          </Box>
        </Box>
      </ModalContent>
    </ModalWrapper>
  );
}
