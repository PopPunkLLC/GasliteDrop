import React, { useEffect } from "react";
import type { AppProps } from "next/app";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { WagmiConfig } from "wagmi";
import { client, chains } from "@/wagmi";
import Layout from "@/components/ui/Layout";
import "@/styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";

interface BigInt {
  /** Convert to BigInt to string form in JSON.stringify */
  toJSON: () => string;
}

/// Fix BigInt serialization
BigInt.prototype.toJSON = function () {
  return this.toString();
};

export default function App({ Component, pageProps }: AppProps) {
  // This is gross but it solves the autoconnect issues with Wagmi
  // See more here: https://github.com/wagmi-dev/wagmi/issues/542#issuecomment-1643848731
  useEffect(() => {
    client.autoConnect();
  }, []);

  return (
    <WagmiConfig config={client}>
      <RainbowKitProvider chains={chains} theme={darkTheme()}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
