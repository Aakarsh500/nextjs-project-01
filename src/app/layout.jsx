import { ClerkProvider } from "@clerk/nextjs";

import "./globals.css";

export function metadata() {
  return {
    title: "Mental Health Tracking App",
    description: "Your mental health tracking assistant",
  };
}

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
