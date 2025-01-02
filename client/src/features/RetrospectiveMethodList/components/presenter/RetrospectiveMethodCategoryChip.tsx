import { memo } from 'react';
import { Chip } from '@mui/material';
import type { RetrospectiveSceneNames } from 'domains/internal/retrospectiveJsonType';
const sceneIdTocolors: Record<number, string> = {
  1: 'rgba(254, 101, 128, 1)',
  2: 'rgba(255, 163, 55, 1)',
  3: 'rgba(17, 201, 226, 1)',
  4: 'rgba(38, 95, 243, 1)',
  5: 'rgba(115, 53, 248, 1)',
};
interface RetrospectiveMethodCategoryChipProps {
  retrospectiveSceneNames: RetrospectiveSceneNames;
  sceneId: number;
}
const RetrospectiveMethodCategoryChip: React.FC<
  RetrospectiveMethodCategoryChipProps
> = ({ retrospectiveSceneNames, sceneId }) => {
  return (
    <Chip
      label={retrospectiveSceneNames[sceneId.toString()]}
      sx={{
        backgroundColor: sceneIdTocolors[sceneId],
        color: 'white',
        letterSpacing: 1.4,
        borderRadius: 4,
        fontSize: 14,
      }}
    />
  );
};

export default memo(RetrospectiveMethodCategoryChip);
