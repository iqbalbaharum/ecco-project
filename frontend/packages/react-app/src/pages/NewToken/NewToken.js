import React, { useRef, useContext } from 'react'
import AppContext from '../../store/app'
import { Container, Card, CardContent, Grid, Typography, TextField, Button, Box } from '@material-ui/core'
import classes from './newtoken.module.css'
import { generateNewSuperToken, generateNewToken } from  '../../utils/token'

function NewTokenPage (props) {

  const appContext = useContext(AppContext)

  const data = {
    nameRef: useRef(),
    symbolRef: useRef(),
    maxSupplyRef: useRef()
  }

  async function handleCreateToken(e) {
    e.preventDefault()

    await generateNewToken(
      data.nameRef.current.value,
      data.symbolRef.current.value,
      data.maxSupplyRef.current.value,
      props.creator,
      appContext.provider
    )
  }
  
  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom align="center">
        Create your Creator Token
      </Typography>
      <Card className={classes.root}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item md={12}>
              <TextField
                required
                variant="outlined"
                label="Your Token Name"
                fullWidth
                inputRef={data.nameRef}
              />
            </Grid>
            <Grid item md={12}>
              <TextField
                required
                variant="outlined"
                label="Token Symbol"
                fullWidth
                helperText="Choose a symbol for your token (usually 3-5 chars)."
                inputRef={data.symbolRef}
              />
            </Grid>
            <Grid item md={12}>
              <TextField
                required
                variant="outlined"
                label="Send Token To"
                fullWidth
                helperText="To change value, change wallet."
                defaultValue={props.creator}
                InputProps={{
                  readOnly: true,
                }}
               />
            </Grid>
            <Grid item md={12}>
              <TextField
                variant="outlined"
                label="Decimal"
                fullWidth
                defaultValue="18"
                helperText="Insert the decimal precision of your token. If you don't know what to insert, use 18." 
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>
            <Grid item md={12}>
              <TextField
                required
                variant="outlined"
                label="Total Supply"
                fullWidth helperText="Insert the max number of tokens available. Will be put in your account."
                inputRef={data.maxSupplyRef}
              />
            </Grid>
            <Grid item xs={12}>
              <Box align="right">
                <Button variant="contained" color="primary" onClick={handleCreateToken}>Create Token</Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  )
}

export default NewTokenPage