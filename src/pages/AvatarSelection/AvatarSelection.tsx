import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import ButtonGroup from '@mui/material/ButtonGroup';
import Typography from '@mui/material/Typography';
import LoadingScreen from 'pages/LoadingScreen/LoadingScreen';
import 'pages/LoadingScreen/LoadingScreen.css';
import {ControlButtonWide, RetryButton} from 'pages/GuiElements';
import {AvatarDisplay} from './AvatarDisplay';


export const AvatarSelection = props => {

    const avatars = [
        'm_1', 'f_1', 
        'm_2', 'f_2', 
        'm_3', 'f_3', 
        'm_4', 'f_4', 
        'm_5', 'f_5', 
        'm_6', 'f_6',
        'm_7', 'f_7',
        'm_8', 
        'm_9', 'f_9',
        'm_10', 'f_10',
        'm_11', 
        'm_12', 'f_12',
        'm_13', 

        // faulty 'f_8', 'f_11',
    ];
    const divRef = useRef(null)
    const [loading, showLoading] = useState(true);
    const [failed, setFailed] = useState(false);
    const [progress, setProgress] = useState(0);
    const [avatar, setAvatar] = useState(0);
    const [searchParams, setSearchParams] = useSearchParams(); 

    let accessToken: string = null

    let app:AvatarDisplay;


    const showLoadingCallback = useCallback((progress) => {
      if(progress>=100){
        showLoading(false);
      }
      setProgress(progress);
    }, []);

    const handleChangeAvatar = useCallback((newAvatar) =>{
        showLoading(true);
        if(newAvatar==-1){
            newAvatar=avatars.length-1;
        }else if(newAvatar==avatars.length){
            newAvatar=0;
        }
        setAvatar(newAvatar);
        app.UpdateState(avatars[newAvatar]);
    },[]);

    const handleSelectAvatar = useCallback((avatar) =>{
        // navigate to meta after setting avatar; call anroid.
        showLoading(true);
        setFailed(false);
        console.log("Using token", accessToken)

        fetch('https://young-stream-43548.herokuapp.com/v1/users/me',{
            method: 'PATCH',
            body: JSON.stringify({
              characterId: avatars[avatar]
            }),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            }
          }
        ).then(async (res) => {
          showLoading(false);
          const response = await res.json()
          console.log("response", response);
          console.log("avatar saved");
          //@ts-ignore
          Android.avatarSaved()
        })
        .catch(error => {
          showLoading(false);
          setFailed(true);
          console.error('Error:', error)

          //@ts-ignore
          Android.avatarSaveError()
        })
        
    },[]);

    useEffect(() => {  
        console.log('useEffect-avatar',avatar);
        const div = divRef.current
        if(div){
            if(!app){
                app = new AvatarDisplay(div, showLoadingCallback);
            }
            app.UpdateState(avatars[avatar]);
          
        }

        const tokenFromUrl = searchParams.get('token')
        updateToken(tokenFromUrl);
    }, []);

    const updateToken = (newToken: string) => {
      accessToken = newToken
    }

  return (
  <div>
    <Grid 
      container 
      spacing={0}
      direction="column"
      justifyContent="flex-end"
      sx={{
        height:'100vh',
        backgroundColor: '#FFE61B'
      }}
    >     
      <Grid item 
        sx={{
          zIndex:999,
          paddingBottom:10
        }}
      > 
        <Stack  
          direction="row"
          justifyContent="center"
          alignItems="center"
          spacing={2}
        >
          <ButtonGroup variant="contained" aria-label="outlined primary button group">
            <ControlButtonWide  variant="contained"  onClick={()=>handleChangeAvatar(avatar-1)}>&#60;</ControlButtonWide>
            <ControlButtonWide  variant="contained" onClick={()=>handleSelectAvatar(avatar)}>Select</ControlButtonWide>
            <ControlButtonWide  variant="contained"  onClick={()=>handleChangeAvatar(avatar+1)}>&#62;</ControlButtonWide>
          </ButtonGroup>
        </Stack>
      </Grid>
    </Grid>

    {failed && (<div
      style={{
          position: 'fixed',
          bottom:0,
          left:0,
          zIndex:9999,
          backgroundColor:'#fff',
          width:'100%',
          height:'160px',
          padding:20
      }}>
        <Stack
          direction="column"
          justifyContent="center"
          alignItems="center"
          spacing={2}
        >
          <Typography variant="body1" align="center">
            Ah! server can't be reached. Please check your internet connectivity and retry.
          </Typography>
          <RetryButton  variant="contained"  onClick={()=>handleSelectAvatar(avatar)}>Retry</RetryButton>
        </Stack>
    </div>)}
    
    <div 
      style={{
          position: 'relative',
          marginTop:'-100vh',
          left:0,
          width:'100%',
          height:'100vh',
      }}
      ref={divRef} />
      <LoadingScreen 
        type='loader'
        loading={loading} 
        progress={progress} 
        backgroundColor='#261F004C'/>
  </div>);
}