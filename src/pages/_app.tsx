import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { RealtimeProvider } from "../provider/realtime";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <RealtimeProvider />
      <Component {...pageProps} />
    </>
  );
}
