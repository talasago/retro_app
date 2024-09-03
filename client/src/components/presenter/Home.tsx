// TODO:カラーの3色の定義はどこか外だしした方が良いかも
// TODO:各コンポーネントに分ける
// TODO: CSSファイルに分けるかどうか。
// TODO: ヘッダーコンポーネントの修正

import type { FC } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  Grid,
  Avatar,
} from '@mui/material';
import { styled } from '@mui/system';

// TODO: Footerは別コンポーネントにする
const Footer = styled(Box)({
  backgroundColor: '#aaaaaa',
  height: '80px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

const FeatureSection = ({ title, description }) => (
  <Grid container spacing={2} alignItems="center">
    <Grid item>
      <Avatar sx={{ width: 110, height: 110, bgcolor: '#d9d9d9' }} />
    </Grid>
    <Grid item xs>
      <Typography variant="h6" component="div" fontWeight="bold">
        {title}
      </Typography>
      <Typography variant="body1">{description}</Typography>
    </Grid>
  </Grid>
);

const Home: FC = () => {
  return (
    <Box sx={{ width: '100%', bgcolor: 'white' }}>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar>
          <Typography variant="h4" sx={{ flexGrow: 1, ml: 3 }}>
            LOGO
          </Typography>
          <Button
            color="inherit"
            startIcon={<img src="user-icon.png" alt="User icon" />}
          >
            ログイン
          </Button>
          <Button variant="contained" sx={{ ml: 2, bgcolor: '#d9d9d9' }}>
            ユーザー登録
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ bgcolor: '#aaaaaa', py: 7 }}>
        <Container>
          <Typography variant="h3" gutterBottom>
            アプリのキャッチコピー
          </Typography>
          <Typography variant="h3" gutterBottom>
            すてきなテキストが入るエリア
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 4, bgcolor: '#454545', borderRadius: '50px' }}
          >
            試してみる
          </Button>
        </Container>
      </Box>

      <Container sx={{ py: 5 }}>
        <Typography variant="h4" align="center" gutterBottom>
          アプリ名が入ります{' '}
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
        <Button
          variant="contained"
          sx={{ bgcolor: '#d9d9d9', borderRadius: '8px' }}
        >
          ユーザー登録してはじめる
        </Button>
      </Box>

      <Footer>
        <Typography variant="body2" sx={{ mx: 2 }}>
          © Copyright 2024
        </Typography>
        <Typography variant="body2" sx={{ mx: 2 }}>
          プライバシーポリシー
        </Typography>
        <Typography variant="body2" sx={{ mx: 2 }}>
          利用規約
        </Typography>
      </Footer>
    </Box>
  );
};

export default Home;
