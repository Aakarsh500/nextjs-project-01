"use client";
import { useEffect, useState, useRef } from "react";
import LottieAnimation from "./LottieAnimation";
import LeftSidebar from "./LeftSidebar";

// DEVELOPER DEBUG FUNCTION - REMOVE BEFORE PRODUCTION
const debugLogChunk = (chunk, cleanedChunk, index) => {
  console.group(`[DEBUG] Chunk #${index} Received`);
  console.log("Raw chunk:", chunk);
  console.log("Cleaned chunk:", cleanedChunk);
  console.groupEnd();
};

// Question detection array
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

const ChatInterface = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [enterPressed, setEnterPressed] = useState(false);
  const [bgLoaded, setBgLoaded] = useState(false);
  const [animationLoaded, setAnimationLoaded] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const chatMessagesRef = useRef(null);
  const latestMessageRef = useRef(null);
  

  // Input-related states
  const [message, setMessage] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [animatedWords, setAnimatedWords] = useState([]);
  const [showRipple, setShowRipple] = useState(false);

  // Messages state
  const [finalMessages, setFinalMessages] = useState([]);
  const [isPreloadedMessage, setIsPreloadedMessage] = useState({});

  // AI response states
  const [aiResponses, setAiResponses] = useState({});
  const [isAiResponding, setIsAiResponding] = useState({});
  const [isQuestionMessage, setIsQuestionMessage] = useState({});

  // Animation data states
  const [animationData, setAnimationData] = useState(null);
  const [rippleAnimation, setRippleAnimation] = useState(null);
  const [glowingStarAnimation, setGlowingStarAnimation] = useState(null);
  const [questionAnimation, setQuestionAnimation] = useState(null);
  const [questionModeActive, setQuestionModeActive] = useState(false);

  // Function to check if a message is a question
  const isQuestion = (text) => {
    const lowerText = text.toLowerCase();
    return question_phrases_terms.some((phrase) => lowerText.includes(phrase));
  };

  const scrollToLatestMessage = () => {
    if (latestMessageRef.current) {
      latestMessageRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  };

  useEffect(() => {
    if (finalMessages.length > 0) {
      // Short delay to ensure DOM has updated
      setTimeout(scrollToLatestMessage, 100);
    }
  }, [finalMessages]);

  useEffect(() => {
    const responseKeys = Object.keys(aiResponses);
    if (responseKeys.length > 0) {
      setTimeout(scrollToLatestMessage, 100);
    }
  }, [aiResponses]);

  useEffect(() => {
    // Load animations
    const loadAnimations = async () => {
      try {
        const [bgData, rippleData, starData, questionData] = await Promise.all([
          fetch("/lottie/bg-small-blur.json").then((res) => res.json()),
          fetch("/lottie/ripple.json").then((res) => res.json()),
          fetch("/lottie/glowing-star.json").then((res) => res.json()),
          fetch("/lottie/question-lottie-2.json").then((res) => res.json()), // Load the question animation
        ]);
        setAnimationData(bgData);
        setRippleAnimation(rippleData);
        setGlowingStarAnimation(starData);
        setQuestionAnimation(questionData); // Store the question animation
      } catch (error) {
        console.error("Error loading animations:", error);
      }
    };
    loadAnimations();
  }, []);

  useEffect(() => {
    window.processChatLogsFromAPI = processChatLogsFromAPI;
    return () => {
      window.processChatLogsFromAPI = undefined;
    };
  }, []);

  useEffect(() => {
    const loadImages = async () => {
      const imageUrls = ["/assets/chat-bg.jpg", "/assets/question-bg.jpg"];

      try {
        await Promise.all(
          imageUrls.map((url) => {
            return new Promise((resolve, reject) => {
              const img = new Image();
              img.src = url;
              img.onload = resolve;
              img.onerror = reject;
            });
          })
        );

        setBgLoaded(true);
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
      setEnterPressed(true);
      const words = message.trim().split(" ");
      setAnimatedWords(words);
      setMessage("");
      setShowInput(false);
      setShowRipple(true);
      setShowPrompt(false);
    }
  };

  // Modified function to handle streaming AI responses with filtering
  const fetchAiResponse = async (userMessage, messageIndex) => {
    const messageIsQuestion = isQuestion(userMessage);
    setQuestionModeActive(messageIsQuestion);
    setIsAiResponding((prev) => ({ ...prev, [messageIndex]: true }));
    setAiResponses((prev) => ({ ...prev, [messageIndex]: "" }));

    try {
      const token = localStorage.getItem("bearerToken"); // Replace with your actual token

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message_type: "text",
          message: userMessage,
        }),
      });

      if (!response.ok) {
        throw new Error(`API responded with ${response.status}`);
      }

      // Handle streaming response with filtering
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let isFirstChunk = true;
      let chunkIndex = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        // Skip the first chunk as it contains message IDs
        if (isFirstChunk) {
          // Log the first chunk that we're skipping
          debugLogChunk(chunk, "SKIPPED (First Chunk)", chunkIndex++);
          isFirstChunk = false;
          continue;
        }

        // Process subsequent chunks - remove "data:" prefix
        const cleanedChunk = chunk.replace(/^data:/gm, "").trim();

        // Log each chunk for debugging
        debugLogChunk(chunk, cleanedChunk, chunkIndex++);

        if (cleanedChunk) {
          setAiResponses((prev) => ({
            ...prev,
            [messageIndex]: prev[messageIndex]
              ? prev[messageIndex] + " " + cleanedChunk
              : cleanedChunk,
          }));
          setTimeout(scrollToLatestMessage, 50);
        }
      }
    } catch (error) {
      console.error("Error streaming AI response:", error);
      setAiResponses((prev) => ({
        ...prev,
        [messageIndex]:
          (prev[messageIndex] || "") +
          "Sorry, there was an error generating a response.",
      }));
    } finally {
      setIsAiResponding((prev) => ({ ...prev, [messageIndex]: false }));
      setTimeout(scrollToLatestMessage, 100);
    }
  };

  // DEVELOPER DEBUG FUNCTION - REMOVE BEFORE PRODUCTION
  const processChatLogsFromAPI = (chatData) => {
    if (!chatData || !chatData.messages || !Array.isArray(chatData.messages)) {
      console.error("Invalid chat data structure:", chatData);
      return;
    }

    console.group("Debug: Processing Chat Logs");
    console.log(`Processing chat logs, limiting to last 3 user exchanges`);

    // Get only the last 6 messages (3 user messages + 3 AI responses)
    const limitedMessages = [...chatData.messages].slice(-6);

    // Create arrays to hold processed messages
    const newMessages = [...finalMessages];
    const newAiResponses = { ...aiResponses };
    const newQuestionFlags = { ...isQuestionMessage };
    const newPreloadedFlags = { ...isPreloadedMessage };

    // Process messages in sequence
    limitedMessages.forEach((msg) => {
      if (msg.is_user) {
        // Add user message
        const messageIndex = newMessages.length;
        newMessages.push(msg.message);
        newQuestionFlags[messageIndex] = isQuestion(msg.message);
        newPreloadedFlags[messageIndex] = true; // Mark as preloaded
      } else {
        // Add AI response for the previous user message
        if (newMessages.length > 0) {
          const messageIndex = newMessages.length - 1;
          newAiResponses[messageIndex] = msg.message;
        }
      }
    });

    // Update state with the loaded messages and preloaded flags
    setFinalMessages(newMessages);
    setAiResponses(newAiResponses);
    setIsQuestionMessage(newQuestionFlags);
    setIsPreloadedMessage(newPreloadedFlags);
    setShowPrompt(false);

    console.log("Updated message state with:", {
      messageCount: newMessages.length,
      responseCount: Object.keys(newAiResponses).length,
    });
    console.groupEnd();
  };

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

          // Add the message to finalMessages and start the AI response
          const userMessage = animatedWords.join(" ");

          // Check if message is a question
          const messageIsQuestion = isQuestion(userMessage);

          setFinalMessages((prev) => {
            const newMessages = [...prev, userMessage];
            // Store whether this message is a question
            setIsQuestionMessage((prevState) => ({
              ...prevState,
              [newMessages.length - 1]: messageIsQuestion,
            }));
            // Fetch AI response for the new message
            fetchAiResponse(userMessage, newMessages.length - 1);
            return newMessages;
          });

          // Reset the UI to allow new input
          setTimeout(() => setShowInput(true), 800);
        }, 800);
      }, animationDuration);

      return () => clearTimeout(timer);
    }
  }, [animatedWords]);

  return (
    <>
      <LeftSidebar />
      <div
        className={`chat-container${bgLoaded ? " loaded" : ""}${
          questionModeActive ? " question-mode" : ""
        }`}
      >
        <div className="question-bg"></div>
        <div className="chat-bg"></div>

        <div className="chat-messages" ref={chatMessagesRef}>
          {!enterPressed && (
            <div className={`prompt-container ${showPrompt ? "visible" : ""}`}>
              <div className="prompt-background">
                <span className="prompt-text">What's on your mind?</span>
                {animationLoaded && (
                  <LottieAnimation
                    animationData={animationData}
                    style={{
                      position: "absolute",
                      width: "350px",
                      height: "100px",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -150%)",
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

          <div className="message-flow-container">
            {finalMessages.map((msg, index) => (
              <div
                key={`message-group-${index}`}
                className="message-group"
                ref={
                  index === finalMessages.length - 1 ? latestMessageRef : null
                }
              >
                {/* User message on the right */}
                <div className="user-message-wrapper">
                  <div
                    className={`user-message ${
                      isPreloadedMessage[index] ? "preloaded-message" : ""
                    }`}
                  >
                    {msg}
                  </div>
                </div>

                {/* AI response on the left */}
                <div className="ai-message-wrapper">
                  {/* Show regular animation for non-question messages */}
                  {isAiResponding[index] &&
                    !aiResponses[index] &&
                    !isQuestionMessage[index] &&
                    !isPreloadedMessage[index] && (
                      <div className="ai-loading-animation">
                        <LottieAnimation
                          animationData={glowingStarAnimation}
                          style={{ width: "500px", height: "200px" }}
                        />
                      </div>
                    )}

                  {/* Show question animation for question messages */}
                  {isAiResponding[index] &&
                    !aiResponses[index] &&
                    isQuestionMessage[index] &&
                    questionAnimation &&
                    !isPreloadedMessage[index] && (
                      <div className="ai-loading-animation">
                        <LottieAnimation
                          animationData={questionAnimation}
                          style={{ width: "500px", height: "200px" }}
                        />
                      </div>
                    )}

                  <div
                    className={`ai-message ${
                      isPreloadedMessage[index] ? "preloaded-message" : ""
                    }`}
                  >
                    {aiResponses[index] ? (
                      <p>{aiResponses[index]}</p>
                    ) : isAiResponding[index] && !isPreloadedMessage[index] ? (
                      "Working on the response..."
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
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
