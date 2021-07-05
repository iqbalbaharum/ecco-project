import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Container, Typography, Card, CardContent, Grid, TextField, Box, Button } from '@material-ui/core'
import classes from './create.module.css'
import { createCreator } from '../../utils/stream-payment'
import { getOwnerToken, getTokenDetail } from '../../utils/token'

function CreateCreatorPage (props) {
  
  const [superTokenAddress, setSuperTokenAddress] = useState('')
  const [stName, setStName] = useState('')
  const [stSymbol, setStSymbol] = useState('')

  const data = {
    creatorAddress: useRef(),
    paymentTokenAddress: useRef(),
    rewardTokenAddress: useRef(),
    paymentRate: useRef(),
    rewardRate: useRef()
  }

  async function handleCreateToken (event) {
    event.preventDefault()
    await createCreator(
      data.creatorAddress.current.value,
      data.paymentTokenAddress.current.value,
      superTokenAddress,
      data.paymentRate.current.value,
      data.rewardRate.current.value
    )
  }

  const getRewardToken = useCallback(async () => {
    const result = await getOwnerToken(props.creator)
    if(!result) { return }
    setSuperTokenAddress(result[1])
    const token = await getTokenDetail(result[1])
    setStName(token.name)
    setStSymbol(token.symbol)
  }, [props.creator, getOwnerToken])

  useEffect(() => {
    if(props.creator) {
      getRewardToken()
    }
  }, [props, getRewardToken])

  if (!(superTokenAddress && stName && stSymbol)) {
    return <div />
  }
  
  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom align="center">
        Create your 1st Stream
      </Typography>
      <Card className={classes.root}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item md={12}>
              <TextField
                autoFocus
                margin="dense"
                id="name"
                label="Creator Address"
                type="text"
                fullWidth
                defaultValue={props.creator}
                helperText="To change this address, please reconnect to correct address"
                InputProps={{
                  readOnly: true,
                }}
                variant="outlined"
                inputRef={data.creatorAddress}
              />
            </Grid>
            <Grid item md={12}>
              <TextField
                autoFocus
                margin="dense"
                id="name"
                label="Accepted Payment Address"
                type="text"
                fullWidth
                variant="outlined"
                defaultValue="0xBF6201a6c48B56d8577eDD079b84716BB4918E8A"
                inputRef={data.paymentTokenAddress}
              />
            </Grid>
            <Grid item md={12}>
              <TextField
                autoFocus
                margin="dense"
                id="name"
                label="ERC20 Social Token Address"
                type="text"
                fullWidth
                variant="outlined"
                defaultValue={`${stName} (${stSymbol})`}
                InputProps={{
                  readOnly: true,
                }}
                inputRef={data.rewardTokenAddress}
              />
            </Grid>
            <Grid item md={12}>
              <TextField
                autoFocus
                margin="dense"
                id="name"
                label="Payment Rate"
                type="text"
                variant="outlined"
                defaultValue="0.00000008"
                inputRef={data.paymentRate}
              />
            </Grid>
            <Grid item md={12}>
              <TextField
                autoFocus
                margin="dense"
                id="name"
                label="Social Token Rate"
                type="text"
                variant="outlined"
                defaultValue="0.00000008"
                inputRef={data.rewardRate}
              />
            </Grid>
            <Grid item xs={12}>
              <Box align="right">
                <Button variant="contained" color="primary" onClick={handleCreateToken}>Create Stream</Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  )
}

export default CreateCreatorPage