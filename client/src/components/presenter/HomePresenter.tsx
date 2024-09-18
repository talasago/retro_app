import type { FC } from 'react';
import { Typography, Button, Container, Box, Grid } from '@mui/material';
import { styled } from '@mui/system';
import { Link } from 'react-router-dom';
import CircleIcon from '@mui/icons-material/Circle';
interface FeatureSectionProps {
  title: string;
  description: string;
}

const FeatureSection: FC<FeatureSectionProps> = ({ title, description }) => (
  <Grid container spacing={3} alignItems="center">
    <Grid item>
      <CircleIcon color="disabled" sx={{ width: 110, height: 110 }} />
    </Grid>
    <Grid item>
      <Typography variant="h5" fontWeight="bold">
        {title}
      </Typography>
      <Typography variant="body1" sx={{ pt: 2 }}>
        {description}
      </Typography>
    </Grid>
  </Grid>
);

const Footer = styled(Box)({
  backgroundColor: '#aaaaaa',
  height: '80px',
  display: 'flex',
  alignItems: 'center',
});

interface HomePresenterProps {
  onOpenSignUpModal: () => void;
}

const HomePresenter: FC<HomePresenterProps> = ({ onOpenSignUpModal }) => {
  return (
    <Box sx={{ width: '100%', bgcolor: 'white' }}>
      <Box sx={{ bgcolor: '#aaaaaa', py: 11 }}>
        <Container>
          <Typography variant="h4" gutterBottom>
            アプリのキャッチコピー
          </Typography>
          <Typography variant="h4" gutterBottom>
            すてきなテキストが入るエリア
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 4, bgcolor: '#454545', borderRadius: '100px', px: 10 }}
            size="large"
          >
            試してみる
          </Button>
        </Container>
      </Box>

      <Container sx={{ pt: 8 }}>
        <Typography variant="h4" align="center" gutterBottom>
          グリーンレンズ
          <Typography variant="h6" component="span">
            とは
          </Typography>
        </Typography>

        <FeatureSection
          title="特徴1"
          description="特徴1の説明が入ります。特徴1の説明が入ります。特徴1の説明が入ります。特徴1の説明が入ります。"
        />
        <Box sx={{ my: 2, borderBottom: 1, borderColor: 'divider' }} />
        <FeatureSection
          title="特徴2"
          description="特徴2の説明が入ります。特徴2の説明が入ります。特徴2の説明が入ります。特徴2の説明が入ります。"
        />
        <Box sx={{ my: 2, borderBottom: 1, borderColor: 'divider' }} />
        <FeatureSection
          title="特徴3"
          description="さらにユーザー登録をすることで、様々なメリットがうんたらかんたら～～ 特徴3でユーザー登録へ誘導するテキスト"
        />
      </Container>

      <Box sx={{ textAlign: 'center', py: 5 }}>
        <Button variant="contained" onClick={onOpenSignUpModal}>
          ユーザー登録してはじめる
        </Button>
      </Box>

      <Footer>
        <Grid
          container
          justifyContent="space-between"
          alignItems="center"
          sx={{ px: { xs: 0.5, sm: 5, md: 20 } }}
        >
          <Grid item xs={4} sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
            <Typography variant="body2">© Copyright __sakopon 2024</Typography>
          </Grid>
          <Grid
            item
            xs={2}
            container
            sx={{ textAlign: { xs: 'center', sm: 'right' } }}
          >
            <Typography variant="body2" sx={{ mx: 1 }}>
              <Link
                to="/service_term"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                利用規約
              </Link>
            </Typography>
          </Grid>
        </Grid>
      </Footer>
    </Box>
  );
};

export default HomePresenter;
