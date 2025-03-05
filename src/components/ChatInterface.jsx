'use client'

import { useEffect, useState, useRef } from "react";
import parse from "html-react-parser";
import DOMPurify from "dompurify";
import LottieAnimation from "./LottieAnimation";
import LeftSidebar from './LeftSidebar';

const ChatInterface = () => {
    const [showPrompt, setShowPrompt] = useState(false);
    const [enterPressed, setEnterPressed] = useState(false);
    const [bgLoaded, setBgLoaded] = useState(false);
    const [animationLoaded, setAnimationLoaded] = useState(false);
    const [message, setMessage] = useState("");
    const [showInput, setShowInput] = useState(false);
    const [animatedWords, setAnimatedWords] = useState([]);
    const [showRipple, setShowRipple] = useState(false);
    const [isExiting, setIsExiting] = useState(false);
    const [finalMessages, setFinalMessages] = useState([]);
    const [showAIGlow, setShowAIGlow] = useState(false);
    const [messagePositions, setMessagePositions] = useState([]);
    const [aiMessagePositions, setAiMessagePositions] = useState([]);
    const [containerHeight, setContainerHeight] = useState(20);
    const messageRefs = useRef([]);
    const [loadingPositions, setLoadingPositions] = useState([]);
    const [activeGlow, setActiveGlow] = useState(false);
    const [aiResponses, setAiResponses] = useState([]);
    const [showPhotoContainers, setShowPhotoContainers] = useState([]);
    const [showPhoto, setShowPhoto] = useState([]);
    const [showPreloadAnimation, setShowPreloadAnimation] = useState([]);
    const [isQuestion, setIsQuestion] = useState(false);
    const [showQuestionLottie, setShowQuestionLottie] = useState(false);
    const [isQuestionLottieFadingIn, setIsQuestionLottieFadingIn] =
      useState(false);
    const [isQuestionLottieFadingOut, setIsQuestionLottieFadingOut] =
      useState(false);
  
    const scrollRef = useRef();

    
    
    

    // MODIFICATION #1: Change how Lottie animations are loaded
  // Instead of importing JSON files directly, we'll load them from the public folder
  const [animationData, setAnimationData] = useState(null);
  const [rippleAnimation, setRippleAnimation] = useState(null);
  const [aiGlowAnimation1, setAiGlowAnimation1] = useState(null);
  const [aiGlowAnimation2, setAiGlowAnimation2] = useState(null);
  const [aiGlowAnimation3, setAiGlowAnimation3] = useState(null);
  const [glowingStarAnimation, setGlowingStarAnimation] = useState(null);
  const [imagePreloadAnimation, setImagePreloadAnimation] = useState(null);
  const [questionLottie, setQuestionLottie] = useState(null);

  useEffect(() => {
    // Load all Lottie animations
    const loadAnimations = async () => {
      try {
        const [
          bgData, 
          rippleData, 
          glow1Data, 
          glow2Data, 
          glow3Data, 
          starData, 
          preloadData, 
          questionData
        ] = await Promise.all([
          fetch('/lottie/bg-small-blur.json').then(res => res.json()),
          fetch('/lottie/ripple.json').then(res => res.json()),
          fetch('/lottie/1.json').then(res => res.json()),
          fetch('/lottie/2.json').then(res => res.json()),
          fetch('/lottie/3.json').then(res => res.json()),
          fetch('/lottie/glowing-star.json').then(res => res.json()),
          fetch('/lottie/image-preload-gradient.json').then(res => res.json()),
          fetch('/lottie/question-lottie-2.json').then(res => res.json()),
        ]);
        
        setAnimationData(bgData);
        setRippleAnimation(rippleData);
        setAiGlowAnimation1(glow1Data);
        setAiGlowAnimation2(glow2Data);
        setAiGlowAnimation3(glow3Data);
        setGlowingStarAnimation(starData);
        setImagePreloadAnimation(preloadData);
        setQuestionLottie(questionData);
      } catch (error) {
        console.error("Error loading animations:", error);
      }
    };
    
    loadAnimations();
  }, []);

  const generateAIResponse = async (userPrompt) => {
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: userPrompt }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate response');
      }
      
      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error("Error generating AI response:", error);
      return null;
    }
  };

  const photographerImage = "/images/photographer.png";

  useEffect(() => {
    if (isQuestion && showQuestionLottie) {
      const lastIndex = aiMessagePositions.length - 1;
      const position = aiMessagePositions[lastIndex];

      const questionResponseTimer = setTimeout(() => {
        setAiResponses((prev) =>
          prev.map((response, index) =>
            index === lastIndex
              ? { ...response, shouldAnimate: true }
              : response
          )
        );

        const aiBoxes = document.querySelectorAll(".ai-response-box");
        const lastAiBox = aiBoxes[aiBoxes.length - 1];

        if (lastAiBox) {
          lastAiBox.classList.add("question-response");
          console.log("Triggering question response animation after 4s delay");
          // Add the question-response class to trigger our animation
          lastAiBox.classList.add("question-response");

          // Set the AI response to animated state
          const responseIndex = aiMessagePositions.length - 1;
          setAiResponses((prev) =>
            prev.map((response, index) =>
              index === responseIndex
                ? { ...response, isAnimated: true }
                : response
            )
          );

          // Animate the text content after the box animation starts
          setTimeout(() => {
            const aiWords = lastAiBox.querySelectorAll(".ai-word");
            aiWords.forEach((word, index) => {
              setTimeout(() => {
                word.classList.add("active");
              }, index * 100);
            });
          }, 750);
        }
      }, 4500);

      return () => clearTimeout(questionResponseTimer);
    }
  }, [isQuestion, showQuestionLottie, aiMessagePositions]);

  const question_phrases_terms = [
    "what",
    "where",
    "why",
    "how",
    "explain",
    "some tips",
    "give",
    "any",
    "advise me",
    "brief me",
    "share",
    "list",
    "can you",
    "can we",
    "could you",
    "could we",
    "do you",
    "i need",
    "suggest",
    "is it",
    "are we",
    "are you",
    "do you",
    "does anyone",
    "should i",
    "should we",
    "gonna",
    "wanna",
    "shall we",
    "shouldn't we",
    "wouldn't it",
    "haven't you",
    "hasn't she",
    "hasn't he",
    "hasn't it",
    "didn't she",
    "didn't he",
    "aren't",
    "would you",
    "will that work",
  ];

  const checkForQuestionPhrases = (message) => {
    const lowercaseMessage = message.toLowerCase();
    return question_phrases_terms.some((phrase) =>
      lowercaseMessage.includes(phrase.toLowerCase())
    );
  };

  const recalculateMessagePositions = () => {
    let currentPosition = 20;
    let newMessagePositions = [];
    let newAiMessagePositions = [];

    finalMessages.forEach((_, index) => {
      const userMessage = messageRefs.current[index];
      if (userMessage) {
        // Add user message position
        newMessagePositions.push(currentPosition);

        // Calculate height and add spacing
        const userHeight = userMessage.getBoundingClientRect().height;
        currentPosition += userHeight + 10;

        // Add AI message position
        newAiMessagePositions.push(currentPosition);

        // Get the corresponding AI response element
        // This is the key fix - we need to find the right element regardless of styling
        const aiResponse = aiResponses[index];
        const isQuestionResponse = aiResponse?.isQuestion;

        // Find the element using a more reliable selector
        const aiBoxes = document.querySelectorAll(".ai-response-box");
        const aiBox = aiBoxes[index];

        // Get the actual rendered height
        const aiHeight = aiBox ? aiBox.getBoundingClientRect().height : 80;

        // Update position for next message
        currentPosition += aiHeight + 20;
      }
    });

    // Update state with new positions
    setMessagePositions(newMessagePositions);
    setAiMessagePositions(newAiMessagePositions);
    setContainerHeight(currentPosition);
  };

  const getLottieHeight = (lottieData) => {
    try {
      // Lottie files typically store dimensions in the root object
      return lottieData?.h || 0;
    } catch (error) {
      console.error("Error getting Lottie height:", error);
      return 0;
    }
  };

  useEffect(() => {
    if (finalMessages.length >= 2 && scrollRef.current) {
      const container = scrollRef.current;
      container.scrollTop = container.scrollHeight - container.clientHeight;
    }
  }, [containerHeight, finalMessages, aiResponses]);

  const renderStaggeredContent = (
    html,
    isQuestion = false,
    limitWords = false
  ) => {
    let wordCount = 0;
    const FIRST_PHASE_WORDS = 15;
    const FIRST_PHASE_DURATION = 1.7;
    const MAX_INITIAL_WORDS = 10; // Limit for initial display

    return parse(DOMPurify.sanitize(html), {
      replace: (domNode) => {
        if (domNode.type === "text") {
          const words = domNode.data.split(/(\s+)/).map((word, index) => {
            if (word.match(/^\s+$/)) {
              return (
                <span key={index} className="">
                  {word}
                </span>
              );
            }

            // If limiting words and we've reached the limit, hide the rest
            if (limitWords && wordCount >= MAX_INITIAL_WORDS) {
              return (
                <span key={index} className="question-word2hidden-word">
                  {word}
                </span>
              );
            }

            // Different animation classes for question responses
            if (isQuestion) {
              wordCount++;
              return (
                <span
                  key={index}
                  className="question-word2"
                  style={{
                    opacity: 1,
                  }}
                >
                  {word}
                </span>
              );
            }

            const isFirstPhase = wordCount < FIRST_PHASE_WORDS;
            wordCount++;

            return (
              <span
                key={index}
                className={`ai-word ${
                  isFirstPhase ? "animate-from-bottom" : "fade-in"
                }`}
                style={{
                  transitionDelay: isFirstPhase
                    ? `${(wordCount - 1) * 0.1}s`
                    : `${
                        FIRST_PHASE_DURATION +
                        (wordCount - FIRST_PHASE_WORDS - 1) * 0.1
                      }s`,
                }}
              >
                {word}
              </span>
            );
          });

          return <>{words}</>;
        }
        return domNode;
      },
    });
  };

  const handleMessageChange = (e) => {
    const newMessage = e.target.value;
    setMessage(newMessage);

    if (newMessage.length === 0 && !enterPressed) {
      setTimeout(() => {
        setShowPrompt(true);
        setAnimationLoaded(true);
      }, 150);
    } else if (showPrompt) {
      setShowPrompt(false);
      setAnimationLoaded(false);
    }
  };

  const handleKeyPress = async (e) => {
    if (e.key === "Enter" && message.trim()) {
      setShowQuestionLottie(false);
      setIsQuestionLottieFadingOut(false);
      setIsQuestionLottieFadingIn(false);
      if (checkForQuestionPhrases(message.trim())) {
        setIsQuestion(true);
      } else {
        setIsQuestion(false);
      }
      setEnterPressed(true);

      const containsPhoto = message.toLowerCase().includes("photo");
      setShowPhotoContainers((prev) => [...prev, false]);
      const words = message.trim().split(" ");
      setAnimatedWords(words);
      setMessage("");
      setShowInput(false);
      setShowRipple(true);
      setShowPrompt(false);

      const aiResponse = await generateAIResponse(message.trim());
      const responseText = containsPhoto
        ? "Sure, let me show you the photo for it."
        : aiResponse || "I couldn't generate a response. Please try again.";

      setAiResponses((prev) => [
        ...prev,
        {
          text: responseText,
          isPhotoResponse: containsPhoto,
          words: responseText.split(""),
          isAnimated: false,
          isQuestion: isQuestion,
        },
      ]);

      if (finalMessages.length >= 2 && scrollRef.current) {
        const container = scrollRef.current;
        container.scrollTop = container.scrollHeight - container.clientHeight;
      }
    }
  };

  useEffect(() => {
    if (questionLottie) {
      const lottieHeight = getLottieHeight(questionLottie);
      console.log("Question Lottie height:", lottieHeight);
    }
  }, [questionLottie]);

  // Modify the photo handling useEffect
  useEffect(() => {
    // Find all active photo container indexes
    const activeIndexes = showPhotoContainers
      .map((show, index) => (show ? index : -1))
      .filter((i) => i !== -1);

    activeIndexes.forEach((newIndex) => {
      // Activate preload animation for this container
      setShowPreloadAnimation((prev) => {
        const updated = [...prev];
        if (updated[newIndex] !== true) {
          updated[newIndex] = true;
        }
        return updated;
      });

      // Start photo fade-in after 1.5 seconds
      const photoTimer = setTimeout(() => {
        setShowPhoto((prev) => {
          const updated = [...prev];
          updated[newIndex] = true;
          return updated;
        });
      }, 1500);

      // Remove preload after 4 seconds
      const lottieTimer = setTimeout(() => {
        setShowPreloadAnimation((prev) => {
          const updated = [...prev];
          updated[newIndex] = false;
          return updated;
        });
      }, 4500);

      return () => {
        clearTimeout(photoTimer);
        clearTimeout(lottieTimer);
      };
    });
  }, [showPhotoContainers]);

  useEffect(() => {
    if (finalMessages.length > 0) {
      const lastIndex = finalMessages.length - 1;
      const lastMessage = messageRefs.current[lastIndex];
      if (lastMessage) {
        const userTop = messagePositions[lastIndex] || containerHeight;
        const userHeight = lastMessage.getBoundingClientRect().height;
        const aiTop = userTop + userHeight + 10;

        // Use the actual isQuestion state from the current message
        const isQuestionResponse = isQuestion;

        // Store this state in the aiResponses array
        setAiResponses((prev) => {
          const updated = [...prev];
          if (updated[lastIndex]) {
            updated[lastIndex] = {
              ...updated[lastIndex],
              isQuestion: isQuestionResponse,
            };
          }
          return updated;
        });

        // Rest of your positioning code...
        setMessagePositions((prev) => [...prev, userTop]);
        setAiMessagePositions((prev) => [...prev, aiTop]);

        // Call recalculateMessagePositions after state updates
        setTimeout(recalculateMessagePositions, 0);
        const timer = setTimeout(() => {
          if (isQuestion) {
            setShowQuestionLottie(true);
          } else {
            setLoadingPositions((prev) => [...prev, aiTop]);
            const removeTimer = setTimeout(() => {
              setLoadingPositions((prev) =>
                prev.filter((pos) => pos !== aiTop)
              );
            }, 5000);
            return () => clearTimeout(removeTimer);
          }
        }, 1200);
        return () => clearTimeout(timer);
      }
    }
  }, [finalMessages]);

  useEffect(() => {
    if (showQuestionLottie) {
      // Trigger fade-in immediately
      setIsQuestionLottieFadingIn(true);

      // Calculate animation duration from Lottie JSON data
      const animationDuration =
        (questionLottie.op - questionLottie.ip) / questionLottie.fr;

      // Start fade-out 0.5 seconds before the animation ends
      const fadeOutTimeout = (animationDuration - 0.5) * 1000;

      const timer = setTimeout(() => {
        // Start fade-out
        setIsQuestionLottieFadingOut(true);

        // Fully remove after fade-out transition
        setTimeout(() => {
          setShowQuestionLottie(false);
          setIsQuestionLottieFadingOut(false);
          setIsQuestionLottieFadingIn(false);
        }, 500); // Match the fade-out duration
      }, fadeOutTimeout);

      return () => clearTimeout(timer);
    }
  }, [showQuestionLottie]);

  useEffect(() => {
    const loadImages = async () => {
      const imageUrls = ["/assets/chat-bg.jpg", "/assets/question-bg.jpg"];
  
      try {
        await Promise.all(
          imageUrls.map((url) => {
            return new Promise((resolve, reject) => {
              const img = new Image();
              img.src = url; // In Next.js, paths start from the public folder
              img.onload = resolve;
              img.onerror = reject;
            });
          })
        );
  
        setBgLoaded(true);
        setTimeout(() => {
          setShowPrompt(true);
          setAnimationLoaded(true);
          setTimeout(() => setShowInput(true), 500);
        }, 500);
      } catch (error) {
        console.error("Error loading background images:", error);
      }
    };
  
    loadImages();
  }, []);

  useEffect(() => {
    if (animatedWords.length > 0) {
      requestAnimationFrame(() => {
        const words = document.querySelectorAll(".word");
        words.forEach((word) => word.classList.add("active"));
      });

      const animationDuration = (animatedWords.length - 1) * 200 + 1000;
      const timer = setTimeout(() => {
        setShowRipple(false);
        setIsExiting(true);

        setTimeout(() => {
          setShowPrompt(false);
          setAnimationLoaded(false);
          setIsExiting(false);
          setAnimatedWords([]);
          setFinalMessages((prev) => [...prev, animatedWords.join(" ")]);
          setActiveGlow(true);
          setTimeout(() => setShowInput(true), 800);
        }, 800);
      }, animationDuration);

      return () => clearTimeout(timer);
    }
  }, [animatedWords]);

  useEffect(() => {
    if (activeGlow) {
        setShowAIGlow(true);
      const glowTimer = setTimeout(() => {
        setActiveGlow(false);
        setShowAIGlow(false);
      }, 5000); // Match AI response delay

      return () => clearTimeout(glowTimer);
    }
  }, [activeGlow]);

  useEffect(() => {
    if (finalMessages.length > 0) {
      const messages = document.querySelectorAll(".final-message");
      const lastMessage = messages[messages.length - 1];

      setTimeout(() => {
        lastMessage.classList.add("active");
      }, 50);

      setTimeout(() => {
        lastMessage.classList.remove("new");
      }, 600);
    }
  }, [finalMessages]);

  useEffect(() => {
    if (aiMessagePositions.length > 0) {
      const newPosition = aiMessagePositions[aiMessagePositions.length - 1];
      const responseIndex = aiMessagePositions.length - 1;

      if (!isQuestion) {
        const timer = setTimeout(() => {
          setLoadingPositions((prev) =>
            prev.filter((pos) => pos !== newPosition)
          );

          const aiBoxes = document.querySelectorAll(".ai-response-box");
          const lastAiBox = aiBoxes[aiBoxes.length - 1];

          setAiResponses((prev) =>
            prev.map((response, index) =>
              index === responseIndex
                ? { ...response, isAnimated: true }
                : response
            )
          );

          setTimeout(() => {
            // Animate main text words
            const aiBox = aiBoxes[responseIndex];
            if (aiBox) {
              const aiWords = aiBox.querySelectorAll(".ai-word");
              const totalWords = aiWords.length;

              aiWords.forEach((word, index) => {
                setTimeout(() => {
                  word.classList.add("active");

                  // If this is a photo response and we're on the last word,
                  // trigger the photo container animation after a delay
                  if (
                    index === totalWords - 1 &&
                    aiResponses[responseIndex]?.isPhotoResponse
                  ) {
                    setTimeout(() => {
                      setShowPhotoContainers((prev) =>
                        prev.map((show, i) =>
                          i === responseIndex ? true : show
                        )
                      );
                    }, 500); // Wait 500ms after last word animates
                  }
                }, index * 100);
              });

              // Handle non-photo responses as before
              if (!aiResponses[responseIndex]?.isPhotoResponse) {
                const mainTextAnimationDuration =
                  aiResponses[responseIndex]?.words.length * 100 + 800;

                setTimeout(() => {
                  const listItems = aiBox.querySelectorAll(".ai-list-item");
                  listItems.forEach((item, index) => {
                    setTimeout(() => {
                      item.classList.add("active");
                    }, index * 150);
                  });
                }, mainTextAnimationDuration);
              }
            }

            // Update container height considering the photo container
            if (lastAiBox) {
              const aiHeight = lastAiBox.getBoundingClientRect().height;
              const extraHeight = aiResponses[responseIndex]?.isPhotoResponse
                ? 200
                : 0;
              setContainerHeight(newPosition + aiHeight + extraHeight + 10);
            }
          }, 50);

          if (lastAiBox) {
            lastAiBox.classList.add("active");
          }
        }, 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [aiMessagePositions]);

  useEffect(() => {
    console.log(isQuestion);
  }, [isQuestion]);

  useEffect(() => {
    if (activeGlow) {
      console.log("Glow activated");
      // Check if any CSS is affecting visibility
      const glowElements = document.querySelectorAll('.bg-glow-animation');
      glowElements.forEach(el => {
        console.log("Glow element computed style:", 
          window.getComputedStyle(el).opacity,
          window.getComputedStyle(el).visibility
        );
      });
    }
  }, [activeGlow]);

  return (
    <>
      {activeGlow && !isQuestion && (
        <>
          <LottieAnimation
            animationData={aiGlowAnimation1}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              zIndex: 5,
              pointerEvents: "none",
              mixBlendMode: "normal",
              opacity: "1 !important", // Force opacity
              visibility: "visible !important",
            }}
            className={`bg-glow-animation ${showAIGlow ? "visible" : ""}`}
            autoplay={true}
            loop={false}
            speed={1}
          />
          <LottieAnimation
            animationData={aiGlowAnimation2}
            style={{
              position: "fixed",
              bottom: 0,
              width: "100%",
              height: "100%",
              right: 0,
              zIndex: 5,
              pointerEvents: "none",
              mixBlendMode: "normal",
              opacity: "1 !important", // Force opacity
              visibility: "visible !important",
            }}
            className={`bg-glow-animation ${showAIGlow ? "visible" : ""}`}
            autoplay={true}
            loop={false}
            speed={1}
          />
          <LottieAnimation
            animationData={aiGlowAnimation3}
            style={{
              position: "fixed",
              bottom: 0,
              right: 0,
              width: "100%",
              height: "100%",
              zIndex: 5,
              pointerEvents: "none",
              mixBlendMode: "normal",
              opacity: "1 !important", // Force opacity
              visibility: "visible !important",
            }}
            className={`bg-glow-animation ${showAIGlow ? "visible" : ""}`}
            autoplay={true}
            loop={false}
            speed={1}
          />
        </>
      )}
      <div className={`chat-container ${bgLoaded ? "loaded" : ""}`}>
      <LeftSidebar />
        <div className="background-layer question-bg" />
        <div
          className={`background-layer chat-bg ${isQuestion ? "fade-out" : ""}`}
        />
        <div className="chat-messages" ref={scrollRef}>
          <div className={`prompt-container ${showPrompt ? "visible" : ""}`}>
            <div className="prompt-background">
              <span className="prompt-text">What's on your mind?</span>
              {animationLoaded && (
                <LottieAnimation
                  animationData={animationData}
                  style={{
                    position: "absolute",
                    width: "500px",
                    height: "500px",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -40%)",
                  }}
                  className={isExiting ? "exiting" : ""}
                />
              )}
            </div>
          </div>
          {showRipple && (
            <LottieAnimation
              animationData={rippleAnimation}
              style={{
                position: "fixed",
                bottom: "0",
                left: "50%",
                transform: "translateX(-50%)",
                width: "100vw",
                height: "200px",
                zIndex: 1001,
                pointerEvents: "none",
                opacity: 1,
                filter: "brightness(1.5)",
              }}
            />
          )}
          <div className="words-container">
            {animatedWords.map((word, index) => (
              <span
                key={index}
                className="word"
                style={{ transitionDelay: `${index * 0.1}s` }}
              >
                {word}
              </span>
            ))}
          </div>
          <div className={`input-container ${showInput ? "visible" : ""}`}>
            <input
              type="text"
              value={message}
              onChange={handleMessageChange}
              onKeyPress={handleKeyPress}
              placeholder="Message"
              className="message-input"
            />
          </div>
          <div className="final-messages-container">
            {finalMessages.map((msg, index) => {
              const targetTop = messagePositions[index] || 20;

              return (
                <div
                  key={index}
                  className="final-message"
                  ref={(el) => (messageRefs.current[index] = el)}
                  style={{
                    "--target-top": `${targetTop}px`,
                  }}
                >
                  {msg}
                </div>
              );
            })}
          </div>
          <div className="ai-response-container">
            {aiMessagePositions.map((position, index) => {
              const response = aiResponses[index];
              if (!response) return null;
              return (
                <div
                  key={index}
                  className={`ai-response-box ${
                    response.shouldAnimate ? "question-response" : ""
                  }`}
                  style={{
                    "--ai-target-top": `${position}px`,
                    position: "absolute",
                  }}
                >
                  <div className="ai-message-content">
                    {renderStaggeredContent(response.text, response.isQuestion)}
                    {response.isPhotoResponse && showPhotoContainers[index] && (
                      <div className="nested-photo-container">
                        <div
                          className={`photo-overlay${
                            showPhoto[index] ? " visible" : ""
                          }`}
                        >
                          <img
                            src={photographerImage}
                            alt="Photography"
                            className="photo-content"
                          />
                        </div>
                        {showPreloadAnimation[index] && (
                          <LottieAnimation
                            animationData={imagePreloadAnimation}
                            style={{
                              position: "absolute",
                              width: "100%",
                              height: "100%",
                              top: 0,
                              left: 0,
                              zIndex: 1,
                            }}
                            autoplay={true}
                            loop={false}
                            speed={1}
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {!isQuestion &&
              loadingPositions.map((position) => (
                <LottieAnimation
                  key={`loading-${position}`}
                  animationData={glowingStarAnimation}
                  style={{
                    position: "absolute",
                    left: "20px",
                    top: `${position}px`,
                    width: "100%",
                    height: "80px",
                    pointerEvents: "none",
                    zIndex: 2001,
                    opacity: 0,
                    animation: "fadeIn 0.5s forwards",
                  }}
                  className="loading-animation"
                  autoplay={true}
                  loop={true}
                />
              ))}

            {isQuestion && showQuestionLottie && (
              <LottieAnimation
                className="question-lottie"
                animationData={questionLottie}
                style={{
                  position: "fixed",
                  left: "50%",
                  transform: "translateX(-50%)",
                  top:
                    finalMessages.length > 0 &&
                    messageRefs.current[finalMessages.length - 1]
                      ? messageRefs.current[finalMessages.length - 1]
                          .offsetTop +
                        messageRefs.current[finalMessages.length - 1]
                          .offsetHeight
                      : 0,
                  width: "100%",
                  height: "100%",
                  zIndex: 3000,
                  opacity: isQuestionLottieFadingOut
                    ? 0
                    : isQuestionLottieFadingIn
                    ? 1
                    : 0,
                  transition: `
        opacity ${isQuestionLottieFadingIn ? "0.5s ease-out" : "0.5s ease-in"}
      `,
                  pointerEvents: "none",
                }}
                autoplay={true}
                loop={false}
                setSpeed={1}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatInterface;
