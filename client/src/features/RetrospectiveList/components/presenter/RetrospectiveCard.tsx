import type React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

const RetrospectiveCard: React.FC = () => {
  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 4,
        border: '2px solid rgba(117, 200, 172, 1)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Typography
        variant="h6"
        sx={{
          color: 'rgba(19, 171, 121, 1)',
          fontWeight: 700,
          letterSpacing: 1.4,
        }}
      >
        手法名
      </Typography>

      <Typography
        sx={{
          mt: 2,
          fontSize: 16,
          lineHeight: 1.5,
          letterSpacing: 1.12,
          flex: 1,
        }}
      >
        ふりかえりの詳細テキストが入ります。3行以上は3点リーダ…
      </Typography>

      <Box
        display="flex"
        alignItems="center"
        justifyContent="flex-end"
        gap={0.5}
        mt={2}
      >
        <ChatBubbleOutlineIcon sx={{ fontSize: 18 }} />
        <Typography variant="body2">コメント(n)</Typography>
      </Box>
    </Paper>
  );
};

export default RetrospectiveCard;
