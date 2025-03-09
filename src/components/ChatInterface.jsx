"use client";

import { useEffect, useState, useRef, act } from "react";
import parse from "html-react-parser";
import DOMPurify from "dompurify";
import LottieAnimation from "./LottieAnimation";
import LeftSidebar from "./LeftSidebar";

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
  const [activeGlow, setActiveGlow] = useState(false);
  const [showLoadingAnimation, setShowLoadingAnimation] = useState(false);
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
  const [visibleQuestionResponses, setVisibleQuestionResponses] = useState({});
  const chatContainerRef = useRef(null);
  

  // lottie animations:
  const [animationData, setAnimationData] = useState(null);
  const [rippleAnimation, setRippleAnimation] = useState(null);
  const [aiGlowAnimation1, setAiGlowAnimation1] = useState(null);
  const [aiGlowAnimation2, setAiGlowAnimation2] = useState(null);
  const [aiGlowAnimation3, setAiGlowAnimation3] = useState(null);
  const [glowingStarAnimation, setGlowingStarAnimation] = useState(null);
  const [imagePreloadAnimation, setImagePreloadAnimation] = useState(null);
  const [questionLottie, setQuestionLottie] = useState(null);
  const [activeMessages, setActiveMessages] = useState([]);

  useEffect(() => {
    console.log(finalMessages);
  }, [finalMessages]);

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
          questionData,
        ] = await Promise.all([
          fetch("/lottie/bg-small-blur.json").then((res) => res.json()),
          fetch("/lottie/ripple.json").then((res) => res.json()),
          fetch("/lottie/1.json").then((res) => res.json()),
          fetch("/lottie/2.json").then((res) => res.json()),
          fetch("/lottie/3.json").then((res) => res.json()),
          fetch("/lottie/glowing-star.json").then((res) => res.json()),
          fetch("/lottie/image-preload-gradient.json").then((res) =>
            res.json()
          ),
          fetch("/lottie/question-lottie-2.json").then((res) => res.json()),
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
      // Get bearer token from localStorage
      const bearerToken = localStorage.getItem("bearerToken");

      if (!bearerToken) {
        console.error("No bearer token found. User may need to log in");
        return null;
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${bearerToken}`,
        },
        body: JSON.stringify({
          message_type: "text",
          message: userPrompt,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate response");

      return {
        stream: response.body,
        isPhotoResponse: userPrompt.toLowerCase().includes("photo"),
      };
    } catch (error) {
      console.error("Error generating AI response:", error);
      return null;
    }
  };

  const refineAIResponse = (chunk, isFirstChunk) => {
    // Ignore the first chunk as it contains metadata (IDs)
    if (isFirstChunk) {
      return "";
    }

    return chunk.replace(/data: /g, "");
  };

  const photographerImage = "/images/photographer.png";

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

  const getLottieHeight = (lottieData) => {
    try {
      // Lottie files typically store dimensions in the root object
      return lottieData?.h || 0;
    } catch (error) {
      console.error("Error getting Lottie height:", error);
      return 0;
    }
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
      await new Promise((resolve) => setTimeout(resolve, 0));
      setShowLoadingAnimation(false);
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

      setAiResponses((prev) => [
        ...prev,
        {
          text: "",
          isPhotoResponse: containsPhoto,
          isAnimated: false,
          isQuestion: isQuestion,
          isStreaming: true,
        },
      ]);

      const aiResponse = await generateAIResponse(message.trim());
      if (!aiResponse) return;
      const reader = aiResponse.stream.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";
      let isFirstChunk = true;
      let hasReceivedContentChunks = false;

      console.log("---START OF AI STREAM---");
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log("---END OF AI STREAM---");
          console.log("Final combined response:", fullResponse);
          if (!hasReceivedContentChunks) {
            fullResponse =
              "Sorry, there was a problem with serving this request. Please try again later!";
            setAiResponses((prev) => {
              const lastIndex = prev.length - 1;
              const updated = [...prev];
              updated[lastIndex] = {
                ...updated[lastIndex],
                text: fullResponse,
              };
              return updated;
            });
          }
          break;
        }
        const chunk = decoder.decode(value);
        console.log("Raw chunk received:", chunk);
        const refinedChunk = refineAIResponse(chunk, isFirstChunk);
        if (isFirstChunk) {
          isFirstChunk = false;
        } else if (refinedChunk.trim()) {
          // If we get a non-empty chunk after the first one, mark that we've received content
          hasReceivedContentChunks = true;
          setShowLoadingAnimation(false);
        }
        isFirstChunk = false;
        if (refinedChunk) {
          fullResponse += refinedChunk;
          console.log("Current accumulated response:", fullResponse);

          // Update the latest AI response with streaming content
          setAiResponses((prev) => {
            const lastIndex = prev.length - 1;
            const updated = [...prev];
            updated[lastIndex] = {
              ...updated[lastIndex],
              text: fullResponse,
            };
            return updated;
          });
        }
      }

      setAiResponses((prev) => {
        const lastIndex = prev.length - 1;
        const updated = [...prev];
        updated[lastIndex] = {
          ...updated[lastIndex],
          isStreaming: false,
          isAnimated: true,
        };
        return updated;
      });
      setShowLoadingAnimation(false);
    }
  };

  const renderAIResponse = (text) => {
    return parse(DOMPurify.sanitize(`<p>${text}</p>`));
  };

  useEffect(() => {
    if (questionLottie) {
      const lottieHeight = getLottieHeight(questionLottie);
      console.log("Question Lottie height:", lottieHeight);
    }
  }, [questionLottie]);

  useEffect(() => {
    if (finalMessages.length > 1) {
      //Trigger scroll only after the first message
      const container = chatContainerRef.current;
      if (container) {
        container.scrollTop = container.scrollHeight - 200; //Scroll to bottom minus 200px
      }
    }
  }, [finalMessages]);

  useEffect(() => {
    //Check if any question response has just become visible
    const visibleResponses = Object.values(visibleQuestionResponses);
    if (visibleResponses.some((visible) => visible)) {
      const container = chatContainerRef.current;
      if (container) {
        //Scroll to bottom when a question response becomes visible
        container.scrollTop = container.scrollHeight - 200; //Scroll to bottom minus 200px
      }
    }
  }, [visibleQuestionResponses]);

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
      const isQuestionResponse = isQuestion;

      // Update the AI response to mark as a question if needed
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

      // Timer for showing question animation
      const timer = setTimeout(() => {
        if (isQuestion) {
          // Show question lottie after ensuring space
          setShowQuestionLottie(true);
        }
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [finalMessages, isQuestion]);

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

          setShowLoadingAnimation(true);

          setTimeout(() => setShowInput(true), 800);
        }, 800);
      }, animationDuration);
      return () => clearTimeout(timer);
    }
  }, [animatedWords]);

  // Add this useEffect to manage the response timing for questions
  useEffect(() => {
    if (isQuestion && showQuestionLottie) {
      setTimeout(() => {
        const lastIndex = aiResponses.length - 1;

        // Initially hide this specific question response
        setVisibleQuestionResponses((prev) => ({
          ...prev,
          [lastIndex]: false,
        }));

        const questionResponseTimer = setTimeout(() => {
          // Show the response after 5 seconds
          setVisibleQuestionResponses((prev) => ({
            ...prev,
            [lastIndex]: true,
          }));

          // Set the AI response to animate
          setAiResponses((prev) =>
            prev.map((response, index) =>
              index === lastIndex
                ? { ...response, shouldAnimate: true, isAnimated: true }
                : response
            )
          );

          // Animate the words in the AI response
          const aiBoxes = document.querySelectorAll(".ai-response-box");
          const lastAiBox = aiBoxes[aiBoxes.length - 1];
          if (lastAiBox) {
            lastAiBox.classList.add("question-response");
            setTimeout(() => {
              const aiWords = lastAiBox.querySelectorAll(".ai-word");
              aiWords.forEach((word, index) => {
                setTimeout(() => {
                  word.classList.add("active");
                }, index * 100);
              });
            }, 750);
          }
        }, 5000); // 5-second delay before showing the response

        return () => clearTimeout(questionResponseTimer);
      }, 0);
    }
  }, [isQuestion, showQuestionLottie, aiResponses.length]);

  useEffect(() => {
    if (activeGlow) {
      // No need to set showAIGlow anymore
      const glowTimer = setTimeout(() => {
        setActiveGlow(false);
      }, 5000); // Match AI response delay
      return () => clearTimeout(glowTimer);
    }
  }, [activeGlow]);

  useEffect(() => {
    if (finalMessages.length > 0) {
      // Get the index of the new message
      const newIndex = finalMessages.length - 1;

      // Add active class to the new message after a short delay
      const timer = setTimeout(() => {
        setActiveMessages((prev) => [...prev, true]);
      }, 50);

      const removeNewTimer = setTimeout(() => {
        const messages = document.querySelectorAll(".final-message");
        messages[newIndex]?.classList.remove("new");
      }, 600);

      return () => {
        clearTimeout(timer);
        clearTimeout(removeNewTimer);
      };
    }
  }, [finalMessages]);

  useEffect(() => {
    if (aiResponses.length > 0 && !isQuestion) {
      const responseIndex = aiResponses.length - 1;

      // Animate AI response after a delay
      const timer = setTimeout(() => {
        // Mark the response as animated
        setAiResponses((prev) =>
          prev.map((response, index) =>
            index === responseIndex
              ? { ...response, isAnimated: true }
              : response
          )
        );

        // Find the AI response box
        const aiBoxes = document.querySelectorAll(".ai-response-box");
        const lastAiBox = aiBoxes[aiBoxes.length - 1];

        if (lastAiBox) {
          lastAiBox.classList.add("active");

          // Animate words
          setTimeout(() => {
            const aiWords = lastAiBox.querySelectorAll(".ai-word");
            const totalWords = aiWords.length;

            aiWords.forEach((word, index) => {
              setTimeout(() => {
                word.classList.add("active");

                // If this is the last word and we need to show a photo
                if (
                  index === totalWords - 1 &&
                  aiResponses[responseIndex]?.isPhotoResponse
                ) {
                  setTimeout(() => {
                    setShowPhotoContainers((prev) => {
                      const updated = [...prev];
                      updated[responseIndex] = true;
                      return updated;
                    });
                  }, 500);
                }
              }, index * 100);
            });

            // Animate list items if not a photo response
            if (!aiResponses[responseIndex]?.isPhotoResponse) {
              const mainTextAnimationDuration = totalWords * 100 + 800;
              setTimeout(() => {
                const listItems = lastAiBox.querySelectorAll(".ai-list-item");
                listItems.forEach((item, index) => {
                  setTimeout(() => {
                    item.classList.add("active");
                  }, index * 150);
                });
              }, mainTextAnimationDuration);
            }
          }, 50);
        }
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [aiResponses, isQuestion]);

  useEffect(() => {
    console.log(isQuestion);
  }, [isQuestion]);

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
              opacity: "1!important", // Force opacity
              visibility: "visible!important",
            }}
            className={`bg-glow-animation ${activeGlow ? "visible" : ""}`}
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
              opacity: "1!important", // Force opacity
              visibility: "visible!important",
            }}
            className={`bg-glow-animation ${activeGlow ? "visible" : ""}`}
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
              opacity: "1!important", // Force opacity
              visibility: "visible!important",
            }}
            className={`bg-glow-animation ${activeGlow ? "visible" : ""}`}
            autoplay={true}
            loop={false}
            speed={1}
          />
        </>
      )}
      <div className={`chat-container ${bgLoaded ? "loaded" : ""}`}>
        <LeftSidebar />
        <div
          className={`background-layer question-bg ${
            isQuestion ? "question-active" : ""
          }`}
        />
        <div
          className={`background-layer chat-bg ${isQuestion ? "fade-out" : ""}`}
        />

        {/* This is the main container with scrolling capabilities */}
        <div className="chat-messages" ref={chatContainerRef}>
          {!enterPressed && (
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
                      transform: "translate(-50%,-40%)",
                    }}
                    className={isExiting ? "exiting" : ""}
                  />
                )}
              </div>
            </div>
          )}

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

          {/* Words animation container */}
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

          {/* Conversation container - main change for scroll fix */}
          <div className="conversation-flow">
            {finalMessages.map((msg, index) => (
              <div
                key={`message-group-${index}`}
                className="message-group-flow"
              >
                <div className="user-message-flow">
                  <div
                    className={`final-message ${
                      activeMessages[index] ? "active" : ""
                    } ${index === finalMessages.length - 1 ? "new" : ""}`}
                  >
                    {msg}
                  </div>
                </div>

                {/* AI response or loading animation */}
                {aiResponses[index] && (
                  <div className="ai-response-flow">
                    {index === aiResponses.length - 1 &&
                    showLoadingAnimation &&
                    !aiResponses[index].isQuestion ? (
                      // Loading animation
                      <LottieAnimation
                        animationData={glowingStarAnimation}
                        style={{
                          width: "100%",
                          height: "80px",
                          pointerEvents: "none",
                          zIndex: 2001,
                          opacity: 1,
                          animation: "fadeIn 0.5s forwards",
                        }}
                        className="loading-animation"
                        autoplay={true}
                        loop={true}
                      />
                    ) : (
                      // Only show question responses when they're marked as visible
                      (index < aiResponses.length - 1 ||
                        !aiResponses[index].isQuestion ||
                        visibleQuestionResponses[index]) && (
                        <div
                          className={`ai-response-box ${
                            aiResponses[index].isAnimated ? "active" : ""
                          } ${
                            aiResponses[index].isQuestion
                              ? "question-response"
                              : ""
                          }`}
                        >
                          <div className="ai-message-content">
                            {renderAIResponse(aiResponses[index].text)}
                            {/* Rest of the content remains the same */}
                            {aiResponses[index].isPhotoResponse &&
                              showPhotoContainers[index] && (
                                <div className="nested-photo-container">
                                  <div
                                    className={`photo-overlay ${
                                      showPhoto[index] ? "visible" : ""
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
                      )
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          {showQuestionLottie && (
            <LottieAnimation
              className="question-lottie"
              animationData={questionLottie}
              style={{
                width: "100%",
                height: "90%",
                opacity: isQuestionLottieFadingOut
                  ? 0
                  : isQuestionLottieFadingIn
                  ? 1
                  : 0,
                transition: `opacity ${
                  isQuestionLottieFadingIn ? "0.5s ease-out" : "0.5s ease-in"
                }`,
                pointerEvents: "none",
                zIndex: 1000, // Ensure it appears above other elements
              }}
              autoplay={true}
              loop={false}
              setSpeed={1}
            />
          )}
        </div>

        {/* Input container */}
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
      </div>
    </>
  );
};

export default ChatInterface;
