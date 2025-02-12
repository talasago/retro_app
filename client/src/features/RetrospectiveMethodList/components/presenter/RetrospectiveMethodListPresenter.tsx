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
  useMediaQuery,
  useTheme,
} from '@mui/material';
// eslint-disable-next-line import/extensions
import backgroundImage from 'assets/background_image.svg';
import { BASE_COLOR } from 'domains/internal/constants/colors';
import type {
  RetrospectiveMethod,
  RetrospectiveSceneNames,
} from 'domains/internal/retrospectiveJsonType';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import VerticalAlignTopIcon from '@mui/icons-material/VerticalAlignTop';
import RetrospectiveMethodCategoryChip from './RetrospectiveMethodCategoryChip';
import RetrospectiveMethodPaper from './RetrospectiveMethodPaper';
import RetrospectiveMethodSearchButton from './RetrospectiveMethodSearchButton';

interface retrospectiveMethodListPresenterProps {
  retrospectiveMethods: RetrospectiveMethod[];
  retrospectiveSceneNames: RetrospectiveSceneNames;
  isShowScrollToTop: boolean;
  isShowRetrospectiveMethodList: boolean;
  onClickScrollToButton: () => void;
  onClickRetrospectiveMethodPaper: (method: RetrospectiveMethod) => void;
  onClickRetroMethodListShowButton: () => void;
  onClickRandomButton: () => void;
  onChangeScenesCheckbox: (event: React.ChangeEvent<HTMLInputElement>) => void;
}
const RetrospectiveMethodListPresenter: React.FC<
  retrospectiveMethodListPresenterProps
> = ({
  retrospectiveMethods,
  retrospectiveSceneNames,
  isShowScrollToTop,
  isShowRetrospectiveMethodList,
  onClickScrollToButton,
  onClickRetrospectiveMethodPaper,
  onClickRetroMethodListShowButton,
  onClickRandomButton,
  onChangeScenesCheckbox,
}) => {
  return (
    <Box>
      <SearchArea
        retrospectiveSceneName={retrospectiveSceneNames}
        onClickRetroMethodListShowButton={onClickRetroMethodListShowButton}
        onClickRandomButton={onClickRandomButton}
        onChangeScenesCheckbox={onChangeScenesCheckbox}
      />
      {isShowRetrospectiveMethodList && (
        <RetrospectiveMethodPaperArea
          retrospectiveMethods={retrospectiveMethods}
          onClickRetrospectiveMethodPaper={onClickRetrospectiveMethodPaper}
        />
      )}
      <ScrollToTop isShow={isShowScrollToTop} onClick={onClickScrollToButton} />
    </Box>
  );
};

export default memo(RetrospectiveMethodListPresenter);

interface SearchAreaProps {
  retrospectiveSceneName: RetrospectiveSceneNames;
  onClickRetroMethodListShowButton: () => void;
  onClickRandomButton: () => void;
  onChangeScenesCheckbox: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const SearchArea: React.FC<SearchAreaProps> = memo(
  ({
    retrospectiveSceneName,
    onClickRetroMethodListShowButton,
    onClickRandomButton,
    onChangeScenesCheckbox,
  }) => {
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    return (
      <Box
        sx={{
          bgcolor: '#EFF9F6',
          py: 8,
          backgroundImage: `url(${backgroundImage})`,
          backgroundPosition: 'top left, bottom right',
          backgroundRepeat: 'no-repeat, no-repeat',
        }}
      >
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
                {Object.entries(retrospectiveSceneName).map(
                  ([id, sceneNames]) => (
                    <Box
                      key={id}
                      display="flex"
                      alignItems="center"
                      sx={{ width: '33%' }}
                    >
                      <FormControlLabel
                        control={
                          <Checkbox
                            sx={{
                              '&.Mui-checked': {
                                color: BASE_COLOR,
                              },
                            }}
                            onChange={onChangeScenesCheckbox}
                          />
                        }
                        label={sceneNames}
                        value={id}
                      />
                    </Box>
                  ),
                )}
                <Box sx={{ width: '33%' }}></Box>
              </Box>
            </Grid>

            <Box
              display="flex"
              justifyContent="space-around"
              flexDirection={isSmallScreen ? 'column' : 'row'}
            >
              <RetrospectiveMethodSearchButton
                icon={<ListAltIcon />}
                buttonName="検索して一覧表示"
                onClick={onClickRetroMethodListShowButton}
              />
              <RetrospectiveMethodSearchButton
                icon={<ShuffleIcon />}
                buttonName="検索してランダムに1つ抽選"
                onClick={onClickRandomButton}
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
  onClickRetrospectiveMethodPaper: (method: RetrospectiveMethod) => void;
}

const RetrospectiveMethodPaperArea: React.FC<RetrospectiveMethodPaperAreaProps> =
  memo(({ retrospectiveMethods, onClickRetrospectiveMethodPaper }) => {
    const displayRetrospectivePapers = retrospectiveMethods.map(
      (method, index) => {
        // IDを元に文言のtipに変換
        const categoryChips = method.easyToUseScenes.map((sceneId) => {
          return (
            <RetrospectiveMethodCategoryChip key={sceneId} sceneId={sceneId} />
          );
        });

        return (
          <Grid item xs={12} sm={6} md={3} key={index} sx={{ mb: 8 }}>
            <RetrospectiveMethodPaper
              retrospectiveMethod={method}
              onClick={() => {
                onClickRetrospectiveMethodPaper(method);
              }}
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
  });

interface ScrollToTopProps {
  onClick: () => void;
  isShow: boolean;
}

const ScrollToTop: React.FC<ScrollToTopProps> = memo(({ onClick, isShow }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 80,
        right: isSmallScreen ? 20 : 80,
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
