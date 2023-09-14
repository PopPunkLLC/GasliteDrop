import Head from 'next/head';
import Link from 'next/link';
import React, { useEffect, useState, useCallback } from 'react';
import { Toaster } from 'sonner';
import { useAccount } from 'wagmi';
import { AirdropType, AirdropTypeEnum } from '../components/types/airdrop';
import DisconnectedView from '@/components/ui/DisconnectedView';
import ERC20Provider from '@/components/providers/ERC20Provider';
import ERC721Provider from '@/components/providers/ERC721Provider';
import ETHProvider from '@/components/providers/ETHProvider';
import FriendtechProvider from '@/components/providers/FriendtechProvider';
import Footer from '@/components/ui/Footer';
import Navbar from '@/components/ui/Navbar';
import NewProvider from '@/components/providers/NewProvider';
import { client } from '../wagmi';

const Home = () => {
  const { address, isConnected } = useAccount();

  const [airdropType, setAirdropType] = useState<AirdropTypeEnum>(
    AirdropType.unset
  );
  const [balance, setBalance] = useState<bigint>(BigInt(0));
  const [contractAddress, setContractAddress] = useState<string | null>(null);

  const resetForm = () => {
    setAirdropType(AirdropType.unset);
    setContractAddress(null);
  };

  const accountBalance = useCallback(async (): Promise<bigint> => {
    if (!isConnected) return BigInt(0);

    return client.publicClient.getBalance({
      address: address!,
    });
  }, [address, isConnected]);

  // TODO: memoize?
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const fetchedBalance = await accountBalance();
        setBalance(fetchedBalance);
      } catch (error) {
        console.error('Error fetching balance:', error);
      }
    };

    fetchBalance();
  }, [accountBalance, isConnected]);

  return (
    <>
      <Head>
        <title>Gaslite Drop | The most efficient airdrop tool</title>
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

      <main>
        <Toaster theme="dark" />

        <div className="flex flex-col md:flex-row border-b-2 border-grey/[0.1]">
          {/* Left Side */}
          <div className="md:w-5/12 pt-4 pb-12 md:py-24 px-4 text-center md:text-left md:px-24 items-center text-black bg-blue-100 border-right border-black flex justify-center">
            {/* Shown on mobile */}
            <div>
              <div className="md:hidden">
                <Navbar />
              </div>

              <div className="flex flex-col mt-12 md:mt-0">
                <h1 className="text-[56px] font-alarm uppercase text-markPink-900">
                  <Link onClick={resetForm} href="/">
                    Gaslite Drop
                  </Link>
                </h1>
                <h2 className="heading text-grey">
                  The most efficient airdrop tool
                </h2>
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="md:w-7/12 mx-auto px-6 md:px-24">
            {/* Shown on Desktop */}
            <div className="hidden md:flex">
              <Navbar />
            </div>

            <div className="flex items-center min-h-[400px] md:h-screen py-12 md:py-0">
              {(() => {
                if (!isConnected) return <DisconnectedView />;

                return (
                  <>
                    {(() => {
                      if (airdropType === AirdropType.ERC20) {
                        return (
                          <ERC20Provider
                            selected={airdropType}
                            setSelected={setAirdropType}
                            contractAddress={contractAddress}
                            setContractAddress={setContractAddress}
                          />
                        );
                      } else if (airdropType === AirdropType.ERC721) {
                        return (
                          <ERC721Provider
                            selected={airdropType}
                            setSelected={setAirdropType}
                            contractAddress={contractAddress}
                            setContractAddress={setContractAddress}
                          />
                        );
                      } else if (airdropType === AirdropType.ETH) {
                        return (
                          <ETHProvider
                            tokenBalance={balance}
                            setSelected={setAirdropType}
                            setContractAddress={setContractAddress}
                          />
                        );
                      } else if (airdropType === AirdropType.FRIENDTECH) {
                        return (
                          <FriendtechProvider
                            selected={airdropType}
                            setSelected={setAirdropType}
                            contractAddress={contractAddress}
                            setContractAddress={setContractAddress}
                          />
                        );
                      } else {
                        return (
                          <NewProvider
                            contractAddress={contractAddress}
                            selected={airdropType}
                            setSelected={setAirdropType}
                            setContractAddress={setContractAddress}
                          />
                        );
                      }
                    })()}
                  </>
                );
              })()}
            </div>
          </div>
        </div>

        <Footer />
      </main>
    </>
  );
};

export default Home;
