import type { AppProps } from "next/app";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "../components/Navbar";
import "../styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ClerkProvider {...pageProps}>
      <div className="mx-auto max-w-7xl p-4">
        <Navbar />
        <Component {...pageProps} />
      </div>
    </ClerkProvider>
  );
}

export default MyApp;
