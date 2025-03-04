import "@/styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import {
  darkTheme,
  RainbowKitProvider,
  type Locale,
} from "@rainbow-me/rainbowkit";
import { config, chains } from "@/lib/wagmi";
import Layout from "@/components/ui/Layout";

interface BigInt {
  /** Convert to BigInt to string form in JSON.stringify */
  toJSON: () => string;
}

/// Fix BigInt serialization
BigInt.prototype.toJSON = function () {
  return this.toString();
};

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  const { locale } = useRouter() as { locale: Locale };
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider chains={chains} theme={darkTheme()} locale={locale}>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
