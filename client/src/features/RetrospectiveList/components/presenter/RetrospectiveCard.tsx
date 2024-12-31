import type React from 'react';
import { Typography, Paper } from '@mui/material';

interface RetrospectiveCardProps {
  title: string;
  description: string;
}

const RetrospectiveCard: React.FC<RetrospectiveCardProps> = ({
  title,
  description,
}) => {
  return (
    <Paper
      sx={{
        p: 3.5,
        borderRadius: 4,
        border: '2px solid rgba(117, 200, 172, 1)',
        height: '100%',
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
        {title}
      </Typography>

      <Typography
        sx={{
          mt: 2,
          fontSize: 16,
          lineHeight: 1.5,
          letterSpacing: 1.12,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
        }}
      >
        {description}
      </Typography>
    </Paper>
  );
};

export default RetrospectiveCard;
