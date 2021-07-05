import React from 'react'
import { Container, Button, Grid, Typography, Box } from "@material-ui/core";
import classes from './main.module.css'

function MainPage() {
  return (
    <Container maxWidth="md">
      <Grid container>
        <Grid item xs={12}>
          <Box align="center" className={classes.heading}>ecco</Box>
        </Grid>
        <Grid item xs={12}>
          <Box padding={5} align="center" className={classes.headingjumbo}>monetize your streams and reward fans from one place</Box>
        </Grid>
        <Grid item xs={12}>
          <Box align="center"><Button variant="contained" color="primary" size="large" href="/new">LAUNCH APP</Button></Box>
        </Grid>
        <Grid item xs={12}>
          <Box margin={4}>
            <ul>
              <li><Box padding={1} className={classes.pink}><Typography variant="h4">create streamed payment systems for your digital media</Typography></Box></li>
              <li><Box padding={1} className={classes.green}><Typography variant="h4">reward fans and build community with social tokens</Typography></Box></li>
              <li><Box padding={1} className={classes.darkgreen}><Typography variant="h4">airdrop NFTs to your most loyal fans</Typography></Box></li>
              <li><Box padding={1} className={classes.purple}><Typography variant="h4">earn interest on your income with defi</Typography></Box></li>
            </ul>
          </Box>
        </Grid>
      </Grid>
    </Container>
  )
}

export default MainPage