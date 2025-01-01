import { memo } from 'react';
import { Button } from '@mui/material';

interface SearchButtonProps {
  icon: React.ReactNode;
  buttonName: string;
}

const RetrospectiveMethodSearchButton: React.FC<SearchButtonProps> = memo(
  ({ icon, buttonName }) => {
    return (
      <Button
        variant="contained"
        startIcon={icon}
        sx={{
          mt: 3,
          borderRadius: 100,
          height: 50,
          minWidth: 350,
        }}
      >
        {buttonName}
      </Button>
    );
  },
);

export default RetrospectiveMethodSearchButton;
