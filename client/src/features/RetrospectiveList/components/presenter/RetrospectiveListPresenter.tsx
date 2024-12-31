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
    <Box>
      <Box sx={{ bgcolor: 'rgba(239, 249, 246, 1)', py: 10 }}>
        <Container maxWidth="md">
          <Grid>
            <Grid xs={12}>
              <Box
                display="flex"
                justifyContent="space-between"
                flexWrap="wrap"
              >
                <Box
                  display="flex"
                  alignItems="center"
                  gap={1}
                  sx={{ width: '33%' }}
                >
                  <Checkbox />
                  <Typography>ふりかえりの場をつくる</Typography>
                </Box>
                <Box
                  display="flex"
                  alignItems="center"
                  gap={1}
                  sx={{ width: '33%' }}
                >
                  <Checkbox />
                  <Typography>出来事を思い出す</Typography>
                </Box>
                <Box
                  display="flex"
                  alignItems="center"
                  gap={1}
                  sx={{ width: '33%' }}
                >
                  <Checkbox />
                  <Typography>アイデアを出し合う</Typography>
                </Box>
                <Box
                  display="flex"
                  alignItems="center"
                  gap={1}
                  sx={{ width: '33%' }}
                >
                  <Checkbox />
                  <Typography>ふりかえりを改善する</Typography>
                </Box>
                <Box
                  display="flex"
                  alignItems="center"
                  gap={1}
                  sx={{ width: '33%' }}
                >
                  <Checkbox />
                  <Typography>アクションを決める</Typography>
                </Box>
                <Box
                  display="flex"
                  alignItems="center"
                  gap={1}
                  sx={{ width: '33%' }}
                ></Box>
              </Box>
            </Grid>

            <Box display="flex" flexDirection="column" alignItems="center">
              <Button
                variant="contained"
                sx={{
                  mt: 3,
                  borderRadius: 100,
                  px: 4,
                }}
              >
                ランダム表示
              </Button>
            </Box>
          </Grid>
        </Container>
      </Box>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {Array.from({ length: 12 }).map((_, index) => (
            <Grid item xs={12} sm={6} md={3} key={index} sx={{ mb: 8 }}>
              <RetrospectiveCard />
            </Grid>
          ))}
        </Grid>
      </Container>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 4 }}>
        <Button
          style={{
            width: 74,
            height: 74,
            borderRadius: 100,
            fontSize: 40,
            backgroundColor: 'rgb(234, 255, 248)',
            color: 'rgba(19, 171, 121, 1)',
          }}
        >
          ↑
        </Button>
      </Box>
    </Box>
  );
};

export default React.memo(RetrospectiveListPresenter);
