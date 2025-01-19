import { memo } from 'react';
import { Button } from '@mui/material';
import {
  BASE_COLOR,
  BUTTON_BASE_HOVER_COLOR,
} from 'domains/internal/constants/colors';

interface SearchButtonProps {
  icon: React.ReactNode;
  buttonName: string;
  onClick: () => void;
}

const RetrospectiveMethodSearchButton: React.FC<SearchButtonProps> = memo(
  ({ icon, buttonName, onClick }) => {
    return (
      <Button
        variant="contained"
        startIcon={icon}
        sx={{
          mt: 3,
          borderRadius: 100,
          height: 50,
          minWidth: 300,
          bgcolor: BASE_COLOR,
          '&:hover': {
            bgcolor: BUTTON_BASE_HOVER_COLOR,
          },
        }}
        onClick={onClick}
      >
        {buttonName}
      </Button>
    );
  },
);

export default RetrospectiveMethodSearchButton;
