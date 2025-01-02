import { memo } from 'react';
import { Typography, Paper, ButtonBase, Box } from '@mui/material';
import type { RetrospectiveMethod } from './RetrospectiveMethodListPresenter';

interface RetrospectiveMethodPaperProps {
  retrospectiveMethod: RetrospectiveMethod;
  onClick: () => void;
  categoryChips: React.ReactElement[];
}

const RetrospectiveMethodPaper: React.FC<RetrospectiveMethodPaperProps> = ({
  retrospectiveMethod,
  onClick,
  categoryChips,
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
          height: '89%',
          '&:hover': {
            backgroundColor: 'rgba(239, 249, 246, 1)',
          },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: 'rgba(19, 171, 121, 1)',
            fontWeight: 700,
            letterSpacing: 1.4,
            marginBottom: 0.5, // 間隔を詰めるために追加
          }}
        >
          {retrospectiveMethod.title}
        </Typography>
        <Typography
          sx={{
            fontSize: 16,
            lineHeight: 1.5,
            letterSpacing: 1.12,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {retrospectiveMethod.wayOfProceeding}
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'flex-end',
            gap: 0.5,
            marginTop: 'auto', // 下に配置するために追加
          }}
        >
          {categoryChips.map((chip, index) => (
            <Box key={index}>{chip}</Box>
          ))}
        </Box>
      </Paper>
    </ButtonBase>
  );
};

export default memo(RetrospectiveMethodPaper);
