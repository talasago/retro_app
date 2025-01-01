import { memo } from 'react';
import {
  Box,
  Container,
  Checkbox,
  Grid,
  FormControlLabel,
  Fade,
  IconButton,
  Typography,
} from '@mui/material';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import VerticalAlignTopIcon from '@mui/icons-material/VerticalAlignTop';
import RetrospectiveMethodPaper from './RetrospectiveMethodPaper';
import RetrospectiveMethodSearchButton from './RetrospectiveMethodSearchButton';

// TODO:データ型は別のところで定義したい。ここで全てのデータが必要ないこと、jsonデータの定義は別でした方が良いため
type RetrospectiveMethods = Array<{
  title: string;
  easyToUseScenes: number[];
  wayOfProceeding: string;
  reference: string;
  id: number;
}>;
type RetrospectiveSceneNames = Record<string, string>;

interface retrospectiveMethodListPresenterProps {
  retrospectiveMethods: RetrospectiveMethods;
  retrospectiveSceneName: RetrospectiveSceneNames;
  isShowScrollToTop: boolean;
  onScrollToButtonClick: () => void;
  onRetrospectiveMethodPaperClick: () => void;
}

const RetrospectiveMethodListPresenter: React.FC<
  retrospectiveMethodListPresenterProps
> = ({
  retrospectiveMethods,
  retrospectiveSceneName,
  isShowScrollToTop,
  onScrollToButtonClick,
  onRetrospectiveMethodPaperClick,
}) => {
  return (
    <Box>
      <SearchArea retrospectiveSceneName={retrospectiveSceneName} />
      <RetrospectiveMethodPaperArea
        retrospectiveMethods={retrospectiveMethods}
        onRetrospectiveMethodPaperClick={onRetrospectiveMethodPaperClick}
      />
      <ScrollToTop isShow={isShowScrollToTop} onClick={onScrollToButtonClick} />
    </Box>
  );
};

export default memo(RetrospectiveMethodListPresenter);

interface SearchAreaProps {
  retrospectiveSceneName: RetrospectiveSceneNames;
}

const SearchArea: React.FC<SearchAreaProps> = memo(
  ({ retrospectiveSceneName }) => {
    return (
      <Box sx={{ bgcolor: 'rgba(239, 249, 246, 1)', py: 8 }}>
        <Container maxWidth="md">
          <Typography
            variant="h6"
            sx={{
              color: 'rgba(19, 171, 121, 1)',
              letterSpacing: 1.4,
              mb: 3,
            }}
          >
            場面ごとで使いやすいふりかえり手法
          </Typography>
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

            <Box display="flex" justifyContent="space-around">
              <RetrospectiveMethodSearchButton
                icon={<ListAltIcon />}
                buttonName="一覧表示"
              />
              <RetrospectiveMethodSearchButton
                icon={<ShuffleIcon />}
                buttonName="ランダムに1つ抽選"
              />
            </Box>
          </Grid>
        </Container>
      </Box>
    );
  },
);

interface RetrospectiveMethodPaperAreaProps {
  retrospectiveMethods: RetrospectiveMethods;
  onRetrospectiveMethodPaperClick: () => void;
}

const RetrospectiveMethodPaperArea: React.FC<RetrospectiveMethodPaperAreaProps> =
  memo(({ retrospectiveMethods, onRetrospectiveMethodPaperClick }) => {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {retrospectiveMethods.map((method, index) => (
            <Grid item xs={12} sm={6} md={3} key={index} sx={{ mb: 8 }}>
              <RetrospectiveMethodPaper
                title={method.title}
                description={method.wayOfProceeding}
                onClick={onRetrospectiveMethodPaperClick}
              />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  });

interface ScrollToTopProps {
  onClick: () => void;
  isShow: boolean;
}

const ScrollToTop: React.FC<ScrollToTopProps> = memo(({ onClick, isShow }) => {
  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 80,
        right: 80,
      }}
    >
      <Fade in={isShow}>
        <IconButton
          onClick={onClick}
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
});
