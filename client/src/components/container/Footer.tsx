import type { FC } from 'react';
import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { styled } from '@mui/system';
import { Link } from 'react-router-dom';

const FooterStyle = styled(Box)({
  backgroundColor: '#B2E9DA',
  height: '80px',
  display: 'flex',
  alignItems: 'center',
});

const Footer: FC = () => {
  return (
    <FooterStyle>
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
    </FooterStyle>
  );
};

export default React.memo(Footer);
