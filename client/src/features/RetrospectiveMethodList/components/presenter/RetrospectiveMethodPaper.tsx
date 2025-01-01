import { memo } from 'react';
import { Typography, Paper, ButtonBase } from '@mui/material';
import type { RetrospectiveMethod } from './RetrospectiveMethodListPresenter';

interface RetrospectiveMethodPaperProps {
  retrospectiveMethod: RetrospectiveMethod;
  onClick: () => void;
}

const RetrospectiveMethodPaper: React.FC<RetrospectiveMethodPaperProps> = ({
  retrospectiveMethod,
  onClick,
}) => {
  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        width: '100%',
        height: '100%',
        textAlign: 'left',
      }}
    >
      <Paper
        sx={{
          p: 3.5,
          borderRadius: 4,
          border: '2px solid rgba(117, 200, 172, 1)',
          height: '100%',
          '&:hover': {
            backgroundColor: 'rgba(239, 249, 246, 1)',
          },
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
          {retrospectiveMethod.title}
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
          {retrospectiveMethod.wayOfProceeding}
        </Typography>
      </Paper>
    </ButtonBase>
  );
};

export default memo(RetrospectiveMethodPaper);
