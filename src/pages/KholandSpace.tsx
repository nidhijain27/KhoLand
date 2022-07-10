
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Grid from '@mui/material/Grid';

import {KLSpace} from 'KholandMeta/KLSpace';
import {GameControl} from "pages/GameControl/GameControl";
import LoadingScreen from 'pages/LoadingScreen/LoadingScreen';

const trimAddress = (address:string):string =>{
  const prefix = address.substring(0, 4);
  const suffix = address.substring(address.length-2, address.length);
  return `${prefix}...${suffix}`;
}

export const KholandSpace = props => {
  const metaRef = useRef(null)
  const [message, setMessage] = useState("");
  const [teleporting, setTeleport] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(null);

  const [loading, showLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams(); 

  let _APP:KLSpace;
  let timer

  const onIntendCancel=()=>{
    _APP.IntendCancel();
  } 

  // Type:
  // 1: showIntend
  // 2: hideIntend
  // 3: showTeleport
  // 4: dismissTeleport
  const handleIntent = (messageId, messageData) => {

    switch(messageId){
      case 1:
        if(messageData.status){
          setMessage(`Do you want to play ${messageData.status} with ${trimAddress(messageData.receiver)}?`);
        }else{
          setMessage(null);
        }
        setTeleport(false);
        break;
      case 2:
        setMessage(null);
        setTeleport(false);
        break;
      case 3:
        if(messageData.status){
          setMessage(`Teleporting you to ${messageData.status} with ${trimAddress(messageData.receiver)}`);
          setTeleport(true);
        }else{
          setMessage(null);
          setTeleport(false);
        }
        timer = setTimeout(teleportTimerCallback, 5000);
        break;
      case 4:
        setMessage(null);
        setTeleport(false);
        clearTimeout(timer);
        break;
    }
  }

  const syncStatus = (status) => {
    console.log("Got status" ,status)
    setCurrentStatus(status);
  }

  const showLoadingCallback = useCallback((mainCharacterLoaded, progress) => {
    if(mainCharacterLoaded && progress>=100){
      setTimeout(()=>{
        if(mainCharacterLoaded && progress>=100){
          showLoading(false);
          //@ts-ignore
          Android.metaLoadingFinished()
        }
      },500);
    }
    setProgress(progress);
  }, []);

  const teleportTimerCallback = useCallback(() => {
    console.log("teleporting");
    //@ts-ignore
    Android.travelToGame("channel-id-xxx");
  }, [])

  const onWalletAction = useCallback(()=>{
    //@ts-ignore
    Android.openWallet();
  },[]);

  const onGameControlMove = (moves)=>{
    console.log("APP MOVE", _APP)
    _APP.move(moves);
  }

  const onGameControlAction = useCallback((action)=>{
    /* 1-yes, 2-no, 3-teleport-cancel */

    if(action==1){
      // setMessage("Teleporing you to game");
      _APP.IntendYes();
    }
    else if(action == 2){
      setMessage(null);
      setTeleport(false)
    }
    else if(action == 3){
      setMessage(null);
      setTeleport(false)
      clearTimeout(timer);
      _APP.IntendCancel();
    }
  }, [])



  const onStatusAction = useCallback((action, newStatus)=>{
    /* 1-Status Updated, 2-Status Removed */

    if(action==1){
      console.log("TSX status updated", newStatus)
      setCurrentStatus(newStatus);
      _APP.StatusUpdated(newStatus);
    }
    else if(action == 2){
      setCurrentStatus(null);
      _APP.StatusRemoved()
    }
  }, [])

  useEffect(() => {  
    const div = metaRef.current
    const tokenFromUrl = searchParams.get('token')
    _APP = new KLSpace(div, tokenFromUrl, handleIntent, syncStatus, showLoadingCallback);

    let animationFrameId
    //Our draw came here
    const render = () => {
      animationFrameId = window.requestAnimationFrame(render)
    }
    render()

    setCurrentStatus(_APP.MyStatus())

    return () => {
      window.cancelAnimationFrame(animationFrameId)
    }
  }, []);
  
  return (<div>
    <Grid 
      container 
      spacing={0}
      direction="column"
      justifyContent="flex-end"
      sx={{
        height:'100vh',
      }}
    >     
      <Grid item 
        sx={{
          zIndex:999
        }}
      >
        <GameControl
          message={message}
          teleporting={teleporting}
          onMove = {onGameControlMove}
          onAction = {onGameControlAction}
          onStatus = {onStatusAction}
          onWallet = {onWalletAction}
          status = {currentStatus}
        />
      </Grid>
    </Grid>
    <div 
      style={{
        position: 'relative',
        marginTop:'-100vh',
        left:0,
        width:'100%',
        height:'100vh',
      }}
      ref={metaRef} />
    <LoadingScreen 
      type='progress'
      loading={loading} 
      progress={progress}
      backgroundColor='#FFFC00'
    />
  </div>);
  
}