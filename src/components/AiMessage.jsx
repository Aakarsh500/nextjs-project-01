import { useState, useEffect } from "react";

const AiMessage = () => {
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
      // After 5 seconds, switch from loading to response
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }, []);
    
    return (
      <div className="ai-message-wrapper">
        {isLoading ? (
          <div className="ai-loading">
            {glowingStarAnimation && (
              <LottieAnimation
                animationData={glowingStarAnimation}
                style={{
                  width: "60px",
                  height: "60px",
                }}
              />
            )}
          </div>
        ) : (
          <div className="ai-message fade-in">
            Working on the endpoint...
          </div>
        )}
      </div>
    );
  };

export default AiMessage;
  