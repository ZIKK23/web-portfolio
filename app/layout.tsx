import type { Metadata } from "next";
import "../styles/main.css";
import Nav from "../components/Nav";

export const metadata: Metadata = {
  title: "Hilmi Zikri - Engineering, Developer, and Design Portfolio",
  description: "Hilmi Zikri's engineering, development, and design portfolio.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;800&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://use.typekit.net/nnb5nol.css" />
      </head>
      <body>
        <Nav />
        {children}
      </body>
    </html>
  );
}
