import * as React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Checkbox,
  Grid,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import RetroCard from './RetroCard';
import RetroHeader from './RetroHeader';
import RetroFooter from './RetroFooter';

const RetroList: React.FC = () => {
  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <RetroHeader />

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
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" justifyContent="space-between" mt={4}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Checkbox />
                  <Typography>ふりかえりを改善する</Typography>
                </Box>
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="flex-end"
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    <Checkbox />
                    <Typography>アクションを決める</Typography>
                  </Box>
                  <Button
                    variant="contained"
                    sx={{
                      mt: 4,
                      borderRadius: 50,
                      bgcolor: 'rgba(19, 171, 121, 1)',
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
              <RetroCard />
            </Grid>
          ))}
        </Grid>
      </Container>

      <Box display="flex" justifyContent="center" my={4}>
        <Box
          component="img"
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/242d3d3be378691d2114a03788e3f0a3056de2793a05b0be4159c7c3307033d2?placeholderIfAbsent=true&apiKey=adcdaa0e1cd24da697f74d33e1bb3e3d"
          sx={{ width: 74, height: 74 }}
        />
      </Box>

      <RetroFooter />
    </Box>
  );
};

export default RetroList;
