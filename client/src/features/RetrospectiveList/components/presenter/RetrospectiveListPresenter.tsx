import React, { useState, useLayoutEffect } from 'react';
import {
  Box,
  Container,
  Button,
  Checkbox,
  Grid,
  FormControlLabel,
  Fade,
  IconButton,
} from '@mui/material';
import VerticalAlignTopIcon from '@mui/icons-material/VerticalAlignTop';
import RetrospectiveCard from './RetrospectiveCard';

// TODO:データ型は別のところで定義したい。全てのデータが必要ないこと、jsonデータの定義は別でした方が良いため
interface RetrospectiveListPresenterProps {
  retrospectiveMethods: Array<{
    title: string;
    easyToUseScenes: number[];
    wayOfProceeding: string;
    reference: string;
    id: number;
  }>;
  retrospectiveSceneName: Record<string, string>;
}

interface ScrollToTopProps {
  scrollY: number;
}

const ScrollToTop: React.FC<ScrollToTopProps> = ({ scrollY }) => {
  const handleClick = (): void => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 80,
        right: 80,
      }}
    >
      <Fade in={scrollY > 0}>
        <IconButton
          onClick={handleClick}
          style={{
            width: 120,
            height: 120,
            borderRadius: 100,
            color: 'rgba(19, 171, 121, 1)',
            backgroundColor: 'rgb(234, 255, 248)',
          }}
        >
          <VerticalAlignTopIcon style={{ fontSize: 60 }} />
        </IconButton>
      </Fade>
    </Box>
  );
};

const RetrospectiveListPresenter: React.FC<RetrospectiveListPresenterProps> = ({
  retrospectiveMethods,
  retrospectiveSceneName,
}) => {
  const [scrollY, setScrollY] = useState<number>(0);

  const determineButtonPosition = (): void => {
    setScrollY(window.scrollY);
  };

  useLayoutEffect(() => {
    window.addEventListener('resize', determineButtonPosition);
    window.addEventListener('scroll', determineButtonPosition);

    return () => {
      window.removeEventListener('resize', determineButtonPosition);
      window.removeEventListener('scroll', determineButtonPosition);
    };
  });

  return (
    <Box>
      <Box sx={{ bgcolor: 'rgba(239, 249, 246, 1)', py: 10 }}>
        <Container maxWidth="md">
          <Grid>
            <Grid item xs={12}>
              <Box
                display="flex"
                justifyContent="space-between"
                flexWrap="wrap"
              >
                {Object.entries(retrospectiveSceneName).map((SceneNames, _) => (
                  <Box
                    key={SceneNames[0]}
                    display="flex"
                    alignItems="center"
                    sx={{ width: '33%' }}
                  >
                    <FormControlLabel
                      control={<Checkbox />}
                      label={SceneNames[1]}
                    />
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
          {retrospectiveMethods.map((method, index) => (
            <Grid item xs={12} sm={6} md={3} key={index} sx={{ mb: 8 }}>
              <RetrospectiveCard
                title={method.title}
                description={method.wayOfProceeding}
              />
            </Grid>
          ))}
        </Grid>
      </Container>

      <ScrollToTop scrollY={scrollY} />
    </Box>
  );
};

export default React.memo(RetrospectiveListPresenter);
