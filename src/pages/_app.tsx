import { type AppType } from "next/app";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "../components/Navbar";
import "../styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ClerkProvider {...pageProps}>
      <main>
        <div className="mx-auto max-w-7xl p-4">
          <Navbar />
          <Component {...pageProps} />
        </div>
      </main>
    </ClerkProvider>
  );
};

export default MyApp;
