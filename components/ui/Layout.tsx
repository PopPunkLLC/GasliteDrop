import React from "react";
import Head from "next/head";
import Link from "next/link";
import { useAccount } from "wagmi";
import { Toaster } from "sonner";
import DisconnectedView from "@/components/ui/DisconnectedView";
import Footer from "@/components/ui/Footer";
import Navbar from "@/components/ui/Navbar";

const SEO = ({ title }) => {
  return (
    <Head>
      <title>{`Gaslite Drop | ${title}`}</title>
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/apple-touch-icon.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/favicon-16x16.png"
      />
      <link rel="manifest" href="/site.webmanifest" />
    </Head>
  );
};

const MobileMenu = () => (
  <div className="flex flex-col items-center w-full space-y-6">
    <div className="lg:hidden">
      <Navbar />
    </div>
    <div className="flex flex-col lg:mt-0">
      <h1 className="text-5xl font-alarm uppercase text-markPink-900">
        <Link href="/">Gaslite Drop</Link>
      </h1>
      <h2 className="text-grey text-base lg:text-xl">
        The most efficient airdrop tool
      </h2>
    </div>
  </div>
);

const DesktopMenu = () => (
  <div className="hidden lg:flex w-full">
    <Navbar />
  </div>
);

const Layout = ({ children, title = "The most efficient airdrop tool" }) => {
  const { isConnected } = useAccount();
  return (
    <>
      <SEO title={title} />
      <main className="flex flex-col min-h-[100dvh] w-full">
        <Toaster theme="dark" />
        <div className="flex flex-col lg:flex-row border-b-2 border-grey/[0.1]">
          <div className="lg:w-5/12 pt-4 pb-12 lg:py-24 px-4 text-center lg:text-left lg:px-12 items-center text-black bg-blue-100 border-right border-black flex justify-center">
            <MobileMenu />
          </div>
          <div className="lg:w-7/12 mx-auto">
            <DesktopMenu />
            <div className="flex flex-col justify-center min-h-[calc(100vh-100px)] overflow-auto py-6 md:py-0 px-6 lg:px-12 xl:px-24">
              {!isConnected ? <DisconnectedView /> : children}
            </div>
          </div>
        </div>
        <Footer />
      </main>
    </>
  );
};

export default Layout;
