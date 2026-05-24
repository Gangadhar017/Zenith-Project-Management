import React from 'react';
import './globals.css';

export const metadata = {
  title: 'Zenith - AI-Powered Enterprise Project Management Platform',
  description: 'A premium, high-velocity Silicon Valley style agile project management platform supercharged by Gemini AI.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="https://api.dicebear.com/7.x/shapes/svg?seed=Zenith" />
      </head>
      <body className="bg-background text-foreground antialiased min-h-screen relative">
        {children}
      </body>
    </html>
  );
}
