import React, { useRef, useEffect, useState } from 'react'
import './LoadingScreen.css';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';


export const LoadingScreen = props => {
  
    return (
      <div> { props.loading && 
      (<Stack  
        spacing={0}
        direction="column"
        justifyContent="center"
        sx={{
          height:'100vh',
          width:'100%',
          background: props.backgroundColor,
          position: 'fixed',
          top:0,
          left:0,
          zIndex:999999,
          color:'#2d0f51'
        }}
      >  
        {props.type == 'progress' && (<Stack  
          spacing={0}
          direction="row"
          justifyContent="center"
        >
          Loading...
        </Stack>)}
        <Stack  
          spacing={0}
          direction="row"
          justifyContent="center"
        >
          {props.type == 'loader' && (
            <div className="loader"/>
          )}
          {props.type == 'progress' && (
            <div className="progress">
              <div className="bar shadow clouds"
                style={{
                  width: props.progress+'%'
                }}
              />
            </div>
          )}
        </Stack>
      </Stack>)}
    </div>
    )
  }
  
  export default LoadingScreen