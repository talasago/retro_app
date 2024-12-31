import React from 'react';
import {
  Box,
  Container,
  Button,
  Checkbox,
  Grid,
  FormControlLabel,
} from '@mui/material';
import RetrospectiveCard from './RetrospectiveCard';

const checkboxLabels = [
  'ふりかえりの場をつくる',
  '出来事を思い出す',
  'アイデアを出し合う',
  'ふりかえりを改善する',
  'アクションを決める',
];

// TODO:受け取るデータは仮の型
interface RetrospectiveListPresenterProps {
  RetrospectiveMethods: Array<{
    title: string;
    easyToUseScenes: number[];
    wayOfProceeding: string;
    reference: string;
    id: number;
  }>;
}

const RetrospectiveListPresenter: React.FC<RetrospectiveListPresenterProps> = ({
  RetrospectiveMethods,
}) => {
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
                {checkboxLabels.map((label, index) => (
                  <Box
                    key={index}
                    display="flex"
                    alignItems="center"
                    sx={{ width: '33%' }}
                  >
                    <FormControlLabel control={<Checkbox />} label={label} />
                  </Box>
                ))}
                <Box sx={{ width: '33%' }}></Box>
              </Box>
            </Grid>

            <Box display="flex" flexDirection="column" alignItems="center">
              <Button
                variant="contained"
                sx={{
                  mt: 3,
                  borderRadius: 100,
                  px: 10,
                  height: 50,
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
          {RetrospectiveMethods.map((method, index) => (
            <Grid item xs={12} sm={6} md={3} key={index} sx={{ mb: 8 }}>
              <RetrospectiveCard
                title={method.title}
                description={method.wayOfProceeding}
              />
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
