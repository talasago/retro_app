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
import RetrospectiveMethodCategoryChip from './RetrospectiveMethodCategoryChip';
import RetrospectiveMethodPaper from './RetrospectiveMethodPaper';
import RetrospectiveMethodSearchButton from './RetrospectiveMethodSearchButton';

// TODO:データ型は別のところで定義したい。ここで全てのデータが必要ないこと、jsonデータの定義は別でした方が良いため
export type RetrospectiveMethod = {
  title: string;
  easyToUseScenes: number[];
  wayOfProceeding: string;
  reference: string;
  id: number;
};
export type RetrospectiveSceneNames = Record<string, string>;

interface retrospectiveMethodListPresenterProps {
  retrospectiveMethods: RetrospectiveMethod[];
  retrospectiveSceneNames: RetrospectiveSceneNames;
  isShowScrollToTop: boolean;
  isShowRetrospectiveMethodList: boolean;
  onScrollToButtonClick: () => void;
  onRetrospectiveMethodPaperClick: () => void;
  onRetroMethodListShowButtonClick: () => void;
}

const RetrospectiveMethodListPresenter: React.FC<
  retrospectiveMethodListPresenterProps
> = ({
  retrospectiveMethods,
  retrospectiveSceneNames,
  isShowScrollToTop,
  isShowRetrospectiveMethodList,
  onScrollToButtonClick,
  onRetrospectiveMethodPaperClick,
  onRetroMethodListShowButtonClick,
}) => {
  return (
    <Box>
      <SearchArea
        retrospectiveSceneName={retrospectiveSceneNames}
        onRetroMethodListShowButtonClick={onRetroMethodListShowButtonClick}
      />
      {isShowRetrospectiveMethodList && (
        <RetrospectiveMethodPaperArea
          retrospectiveMethods={retrospectiveMethods}
          onRetrospectiveMethodPaperClick={onRetrospectiveMethodPaperClick}
          retrospectiveSceneNames={retrospectiveSceneNames}
        />
      )}
      <ScrollToTop isShow={isShowScrollToTop} onClick={onScrollToButtonClick} />
    </Box>
  );
};

export default memo(RetrospectiveMethodListPresenter);

interface SearchAreaProps {
  retrospectiveSceneName: RetrospectiveSceneNames;
  onRetroMethodListShowButtonClick: () => void;
}

const SearchArea: React.FC<SearchAreaProps> = memo(
  ({ retrospectiveSceneName, onRetroMethodListShowButtonClick }) => {
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
                onClick={onRetroMethodListShowButtonClick}
              />
              <RetrospectiveMethodSearchButton
                icon={<ShuffleIcon />}
                buttonName="ランダムに1つ抽選"
                onClick={() => {
                  console.log('[tmp]random button clicked');
                }}
              />
            </Box>
          </Grid>
        </Container>
      </Box>
    );
  },
);

interface RetrospectiveMethodPaperAreaProps {
  retrospectiveMethods: RetrospectiveMethod[];
  onRetrospectiveMethodPaperClick: () => void;
  retrospectiveSceneNames: RetrospectiveSceneNames;
}

const RetrospectiveMethodPaperArea: React.FC<RetrospectiveMethodPaperAreaProps> =
  memo(
    ({
      retrospectiveMethods,
      onRetrospectiveMethodPaperClick,
      retrospectiveSceneNames,
    }) => {
      const displayRetrospectivePapers = retrospectiveMethods.map(
        (method, index) => {
          // IDを元に文言のtipに変換
          const categoryChips = method.easyToUseScenes.map((sceneId) => {
            return (
              <RetrospectiveMethodCategoryChip
                key={sceneId}
                sceneId={sceneId}
                retrospectiveSceneNames={retrospectiveSceneNames}
              />
            );
          });

          return (
            <Grid item xs={12} sm={6} md={3} key={index} sx={{ mb: 8 }}>
              <RetrospectiveMethodPaper
                retrospectiveMethod={method}
                onClick={onRetrospectiveMethodPaperClick}
                categoryChips={categoryChips}
              />
            </Grid>
          );
        },
      );

      return (
        <Container maxWidth="lg" sx={{ py: 10 }}>
          <Grid container spacing={3}>
            {displayRetrospectivePapers}
          </Grid>
        </Container>
      );
    },
  );

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
