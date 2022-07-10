
import React, { useRef, useEffect, useState } from 'react'
import nipplejs from 'nipplejs';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Dialog from '@mui/material/Dialog';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';

import {
  IntendBox, 
  ControlButton, 
  YesButton,
  NoButton, 
  CancelButton
} from 'pages/GuiElements';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: '#faebd7',
  ...theme.typography.subtitle1,
  fontSize:17,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: '#2d0f51',
}));

export const GameControl = props => {

  const [open, setOpen] = React.useState(false);
  const [touched, setTouched] = React.useState(false);

  const handleClickOpen = () => {
    console.log("Open clicked")
    setOpen(true);
  };

  const handleClickOpenWallet = () => {
    console.log("handleClickOpenWallet")
    props.onWallet();
  };

  const handleSaveClicked = (status) => {
    props.onStatus(1,status)
    setOpen(false);
  };

  const handleRemoveClicked = () => {
    props.onStatus(2)
    setOpen(false);
  };

  const handleClose = () => {
    console.log("Close clicked")
    setOpen(false);
  };
  
  const joyStickRef = useRef(null)

  let joystick;

  const handleJoystickEnd = (evt, data) => {
    const keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      space: false,
      shift: false,
    };
    setTouched(true);
    props.onMove(keys);
  }

  const handleJoystickMove = (evt, data) => {
    console.log(data);
    const {x,y} = data.vector;
    const keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      space: false,
      shift: false,
    };
    if(y>0.9){
      keys.forward=true;
      keys.shift = true;
    }
    else if(y > 0.7){
      keys.forward=true;
    }
    else if(y < -0.9){
      keys.backward=true;
      keys.shift = true;
    }
    else if(y < -0.7){
      keys.backward=true;
    }

    if(x>0.4){
      keys.right=true;
    }else if(x < -0.4){
      keys.left=true;
    }
    props.onMove(keys);
  }

  const handleYesAction = () => {
    props.onAction(1);
  }

  const handleNoAction = () => {
    props.onAction(2);
  }

  const handleCancelTeleportAction = () => {
    props.onAction(3);
  }

  useEffect(() => {  
    if(joyStickRef && joyStickRef.current){
      joystick = nipplejs.create({
        zone: joyStickRef.current,
        color: '#faebd7',
        size: 100,
        mode: "dynamic"
      });
      if(joystick){
        joystick.on('end', handleJoystickEnd);
        joystick.on('move', handleJoystickMove);
      }
    }

    return () => {
      if(joystick){
        console.log("joystick", joystick);
        joystick.destroy();
      }
    }
  }, [])
  
  const renderIntend = (
    <Stack
    direction="column"
    justifyContent="center"
    alignItems="center"
    spacing={1}
  >
      {props.message && !props.teleporting && (<> 
        <IntendBox>{props.message}</IntendBox>
        <Stack
          direction="row"
          justifyContent="center"
          alignItems="center"
          spacing={2}
        >
          <YesButton onClick={handleYesAction}>YES!</YesButton>
          <NoButton onClick={handleNoAction}>X</NoButton>
        </Stack>
      </>)}
      {props.message && props.teleporting && (<> 
        <IntendBox>{props.message}</IntendBox>
        <CancelButton onClick={handleCancelTeleportAction}>Cancel</CancelButton>
      </>
    )}
    </Stack>);

  const renderJoystick = (
    <div 
      style={{
        zIndex:10,
        width:'100%', 
        height:'100%', 
        position:'fixed', 
        top:0, 
        left:0
      }}
      ref={joyStickRef}
    />);

  const renderControl = (
    <Stack
      direction="row"
      justifyContent="center"
      alignItems="center"
      spacing={2}
      sx={{margin:2, height:'100px' }}
    >
      <ControlButton onClick={handleClickOpen}>👋 Wassup</ControlButton>
      <ControlButton onClick={handleClickOpenWallet}>💰 Wallet</ControlButton>
    </Stack>);

const statusDialog = (
  <Dialog
    onClose={handleClose}
    open={open}
  >
    <Stack 
      sx={{
        padding:4,
        backgroundColor:'#ccc',
      }}
      spacing={2}
      direction="row"
      justifyContent="center"
    >   
      <ControlButton 
        onClick={(event) => {
          handleSaveClicked('chess')
        }}
      >
        Chess
      </ControlButton>
      <ControlButton 
        onClick={(event) => {
          handleSaveClicked('ludo')
        }}
      >
        Ludo
      </ControlButton>
      <ControlButton 
        onClick={(event) => {
          handleRemoveClicked()
        }}
      >
        Clear
      </ControlButton>
    </Stack>
  </Dialog>);

  return (    
  <Grid 
    container 
    spacing={0}
    direction="row"
    justifyContent="flex-end"
  >   
    { !touched && (<Grid item xs={12} md={12} >
      <Grid
        container
        direction="row"
        justifyContent="center"
        alignItems="center"
        sx={{
          height:'100vh',
          zIndex:1,
          opacity:0.7,
        }}
      > 
      <Item>
      Touch and drag to move around. </Item>
      </Grid>
    </Grid>)}
    <Grid item xs={8} md={8} sx={{zIndex:99}}>
      {renderIntend}
    </Grid>
    <Grid item xs={12} md={12} >
      <Grid
        container
        direction="row"
        justifyContent="center"
        alignItems="center"
      > 
        <Grid item xs={12} md={12} sx={{zIndex:99}}>
          {renderControl}
        </Grid>
      </Grid>
    </Grid>
    {statusDialog}
    {renderJoystick}
  </Grid>
  
  
  );
}

export default GameControl