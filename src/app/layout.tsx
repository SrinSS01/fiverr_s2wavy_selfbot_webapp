import "./globals.css";

import { ReactNode } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>Self Bot</title>
      </head>
      <body className={"flex justify-center items-center font-mono m-20"}>{children}</body>
    </html>
  );
}
