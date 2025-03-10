"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaBars, FaTimes, FaUser } from "react-icons/fa";
import { UserButton, useUser, useClerk } from "@clerk/nextjs";

const LeftSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isSignedIn, user } = useUser();
  const { openSignIn, openSignUp } = useClerk();

  const toggleSidebar = () => setIsOpen(!isOpen);

  useEffect(() => {
    if (isSignedIn && user) {
      console.log(
        "Attempting to log in user:",
        user.primaryEmailAddress.emailAddress
      );
      fetch("/api/user-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: {
            email: user.primaryEmailAddress.emailAddress,
            fullName: user.fullName,
            imageUrl: user.imageUrl,
          },
        }),
      })
        .then(async (response) => {
          if (!response.ok) {
            const err = await response.json();
            throw new Error(`${err.error}: ${err.details}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log("Login process complete:", data);

          // Store the bearer token in localStorage
          if (data.bearerToken) {
            localStorage.setItem("bearerToken", data.bearerToken);
            console.log("Bearer token stored in localStorage");
          }

          if (data.isNewUser) {
            console.log("New user registered with backend");
          } else {
            console.log("Existing user logged in");
          }

          // You can also store chat logs if needed
          if (data.chatLogs) {
            localStorage.setItem("chatLogs", JSON.stringify(data.chatLogs));
          }
        })
        .catch((error) => console.error("Detailed login error:", error));
    }
  }, [isSignedIn, user]);

  return (
    <>
      <motion.div
        className="sidebar-toggle"
        onClick={toggleSidebar}
        initial={false}
        animate={{ x: isOpen ? 240 : 0 }}
        transition={{ duration: 0.3 }}
      >
        {isOpen ? <FaTimes /> : <FaBars />}
      </motion.div>
      <motion.div
        className="left-sidebar"
        initial={{ x: -240 }}
        animate={{ x: isOpen ? 0 : -240 }}
        transition={{ duration: 0.3 }}
      >
        <div className="sidebar-content">
          <div className="user-section">
            {isSignedIn ? (
              <>
                <UserButton afterSignOutUrl="/" />
                <h3>{user.fullName}</h3>
              </>
            ) : (
              <>
                <FaUser className="user-icon" />
                <h3>Guest User</h3>
              </>
            )}
          </div>
          <div className="message-history">
            <h4>Message History</h4>
            <p>No message history</p>
          </div>
          {!isSignedIn && (
            <div className="auth-buttons">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="register-btn"
                onClick={() =>
                  openSignUp({ redirectUrl: window.location.href })
                }
              >
                Register
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="login-btn"
                onClick={() =>
                  openSignIn({ redirectUrl: window.location.href })
                }
              >
                Log In
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
};

export default LeftSidebar;
