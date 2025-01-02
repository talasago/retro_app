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
      <Typography variant="body1" sx={{ pt: 2, whiteSpace: 'pre-line' }}>
        {description}
      </Typography>
    </Grid>
  </Grid>
);

interface HomePresenterProps {
  onOpenSignUpModal: () => void;
}

const HomePresenter: FC<HomePresenterProps> = ({ onOpenSignUpModal }) => {
  return (
    <Box sx={{ width: '100%', bgcolor: 'white' }}>
      <Box sx={{ bgcolor: '#aaaaaa', py: 11 }}>
        <Container>
          <Typography variant="h4" gutterBottom>
            自分に似合うふりかえり手法を、見つけよう
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 4, bgcolor: '#454545', borderRadius: '100px', px: 10 }}
            size="large"
            component={Link}
            to="/retrospective_list"
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
          title="ふりかえり手法のランダム抽選で、毎日新しい発見を"
          description="毎回異なる振り返り手法を試すことで、マンネリ化を防ぎ、新鮮な視点を得ることができます。"
        />
        <Box sx={{ my: 2, borderBottom: 1, borderColor: 'divider' }} />
        <FeatureSection
          title="試したふりかえり手法の感想を、みんなとシェアしよう。"
          description="同じ手法を試した人の感想を見ることで、より効果的に振り返り手法を決めることができます。
          あなたの経験を共有することで、誰かの役に立つかも。
          ※感想コメントを登録するには、ユーザー登録が必要です。"
        />
        <Box sx={{ my: 2, borderBottom: 1, borderColor: 'divider' }} />
        <FeatureSection
          title="アプリ名の由来"
          description="ふりかえり→ふりかえる→カエルの目を通して世界を見る→緑色のレンズを通して世界を見よう
          という意味を込めています。"
        />
      </Container>

      <Box sx={{ textAlign: 'center', py: 5 }}>
        <Button variant="contained" onClick={onOpenSignUpModal}>
          ユーザー登録してはじめる
        </Button>
      </Box>
    </Box>
  );
};

export default HomePresenter;
