import type { FC } from 'react';
import { Typography, Button, Container, Box, Grid } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
// eslint-disable-next-line import/extensions
import backgroundImage from 'assets/background_image.svg';
// eslint-disable-next-line import/extensions
import home_icon from 'assets/home_icon.svg';
import {
  BUTTON_ACCENT_COLOR,
  BUTTON_ACCENT_HOVER_COLOR,
  BASE_COLOR,
  BUTTON_BASE_HOVER_COLOR,
} from 'domains/internal/constants/colors';
import { Link } from 'react-router-dom';

interface FeatureSectionProps {
  title: string;
  description: string;
  fileName: string;
}

const FeatureSection: FC<FeatureSectionProps> = ({
  title,
  description,
  fileName,
}) => (
  <Grid container spacing={3} alignItems="center">
    <Grid item>
      <img
        src={`/src/assets/${fileName}`}
        alt="Feature Section"
        style={{ width: 110, height: 110 }}
      />
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ width: '100%' }}>
      <Container>
        <Box
          sx={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'flex-start' : 'center',
            justifyContent: 'center',
          }}
        >
          <Box
            sx={{
              mx: isMobile ? 'auto' : 0,
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: 'cover',
              padding: isMobile ? 0 : 5,
            }}
          >
            <Typography sx={{ fontSize: isMobile ? '28px' : '33px' }}>
              今のチームにふさわしい
              <br />
              ふりかえり手法を
              <br />
              見つけよう
            </Typography>
            {!isMobile && <LetsTryButton />}
          </Box>
          <Box>
            <img
              src={home_icon}
              alt="Home"
              style={{ width: '100%', maxWidth: '100%', height: 'auto' }}
            />
          </Box>
          {isMobile && <LetsTryButton />}
        </Box>
      </Container>

      <Box
        sx={{
          backgroundImage: `url(${backgroundImage}), url(${backgroundImage})`,
          backgroundPosition: 'top right, bottom left',
          backgroundRepeat: 'no-repeat, no-repeat',
        }}
      >
        <Container sx={{ pt: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            グリーンレンズ
            <Typography variant="h6" component="span">
              とは
            </Typography>
          </Typography>

          <FeatureSection
            title="「ふりかえり」をサポート"
            description="過去の活動を見直して、よりよい未来の活動を行うために検討するためのプロセス「ふりかえり」。
            グリーンレンズは、「ふりかえり」をサポートするためのアプリケーションです。"
            fileName="featureSection1.svg"
          />
          <Box sx={{ my: 2, borderBottom: 1, borderColor: 'divider' }} />
          <FeatureSection
            title="ランダム表示で、毎日新しい発見を"
            description="異なるふりかえり手法を試すことで、マンネリ化を防ぎ、新たな視点を得ることができます。"
            fileName="featureSection2.svg"
          />
          <Box sx={{ my: 2, borderBottom: 1, borderColor: 'divider' }} />
          <FeatureSection
            title="感想をみんなとシェアしよう"
            description="みんなの感想コメントを参考にすることで、チームやあなた自身にとって、最適なふりかえり手法の選択が可能に。
            ※感想コメントの登録はユーザー登録が必要です。"
            fileName="featureSection3.svg"
          />
        </Container>
      </Box>

      <Box sx={{ textAlign: 'center', py: 5 }}>
        <Button
          variant="contained"
          onClick={onOpenSignUpModal}
          sx={{
            bgcolor: BUTTON_ACCENT_COLOR,
            '&:hover': { bgcolor: BUTTON_ACCENT_HOVER_COLOR },
          }}
        >
          ユーザー登録してはじめる
        </Button>
      </Box>
    </Box>
  );
};

export default HomePresenter;

const LetsTryButton: React.FC = () => (
  <Button
    variant="contained"
    sx={{
      mt: 2,
      bgcolor: BASE_COLOR,
      '&:hover': { bgcolor: BUTTON_BASE_HOVER_COLOR },
      borderRadius: '100px',
      px: 10,
      mx: 'auto',
    }}
    size="large"
    component={Link}
    to="/retrospective_list"
  >
    試してみる
  </Button>
);
