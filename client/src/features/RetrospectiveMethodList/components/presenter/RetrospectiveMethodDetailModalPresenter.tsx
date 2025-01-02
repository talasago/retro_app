import { memo } from 'react';
import { Box, Modal, Container, Paper } from '@mui/material';
import type { RetrospectiveMethod } from 'domains/internal/retrospectiveJsonType';

interface RetrospectiveMethodDetailModalPresenterProps {
  isOpen: boolean;
  onCloseModal: () => void;
  retrospectiveMethod: RetrospectiveMethod;
}

const RetrospectiveMethodDetailModalPresenter: React.FC<
  RetrospectiveMethodDetailModalPresenterProps
> = ({ isOpen, onCloseModal, retrospectiveMethod }) => {
  return (
    <Box>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={isOpen}
        onClose={onCloseModal}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Container
          maxWidth="xl"
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Paper
            elevation={3}
            sx={{ width: 400, padding: 4, borderRadius: 2 }}
            onClick={(e) => {
              // ContainerでonClick={onClose}を入れている。
              // モーダルの横をクリックしたらクローズするようにしているため
              // そのクリックイベントが伝播すると、モーダル内でもクローズしてしまうため
              // この処理を追加した
              e.stopPropagation();
            }}
          >
            {retrospectiveMethod.title}
            {retrospectiveMethod.wayOfProceeding}
          </Paper>
        </Container>
      </Modal>
    </Box>
  );
};

export default memo(RetrospectiveMethodDetailModalPresenter);
