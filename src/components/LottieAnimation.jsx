// src/components/LottieAnimation.jsx
'use client'

import React from "react";
import dynamic from 'next/dynamic';

// Dynamically import Lottie with SSR disabled
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

const LottieAnimation = ({ animationData, style, className, autoplay = true, loop = true, speed = 1 }) => {
  return (
    <div className={`lottie-container ${className || ''}`} style={style}>
      <Lottie 
        animationData={animationData} 
        loop={loop} 
        autoplay={autoplay}
        speed={speed}
      />
    </div>
  );
};

export default LottieAnimation;
