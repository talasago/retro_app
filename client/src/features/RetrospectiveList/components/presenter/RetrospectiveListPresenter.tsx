import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Checkbox,
  Grid,
} from '@mui/material';
import RetrospectiveCard from './RetrospectiveCard';

// TODO: checkboxのやつコンポーネント化できないか？文字列の配列だけ外だししたい。
const RetrospectiveListPresenter: React.FC = () => {
  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Box sx={{ bgcolor: 'rgba(239, 249, 246, 1)', py: 8 }}>
        <Container maxWidth="md">
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box
                display="flex"
                justifyContent="space-between"
                flexWrap="wrap"
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <Checkbox />
                  <Typography>ふりかえりの場をつくる</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Checkbox />
                  <Typography>出来事を思い出す</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Checkbox />
                  <Typography>アイデアを出し合う</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Checkbox />
                  <Typography>ふりかえりを改善する</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Checkbox />
                  <Typography>アクションを決める</Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" justifyContent="space-between">
                <Box display="flex" flexDirection="column" alignItems="center">
                  <Button
                    variant="contained"
                    sx={{
                      mt: 4,
                      borderRadius: 50,
                      px: 4,
                    }}
                  >
                    ランダム表示
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {Array.from({ length: 12 }).map((_, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <RetrospectiveCard />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default React.memo(RetrospectiveListPresenter);
