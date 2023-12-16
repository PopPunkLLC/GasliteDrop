import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="flex flex-col items-center justify-center mx-auto md:items-start md:justify-start bg-transparent p-6 lg:p-10 text-blk-700 font-normal">
      <div className="flex flex-col lg:max-w-3xl w-full gap-3">
        <div className="flex flex-row w-full gap-1">
          <strong className="text-grey">Created by</strong>
          <Link
            href="https://gaslite.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-markPink-500"
          >
            <span className="underline">Gaslite</span>
          </Link>
        </div>
        <div className="flex flex-col md:flex-row w-full gap-1">
          <strong className="text-grey">Contributors:</strong>
          <div className="flex gap-1">
            <Link
              className="hover:text-markPink-500"
              href="https://twitter.com/PopPunkOnChain"
              target="_blank"
              rel="noopener noreferrer"
            >
              @PopPunkOnChain
            </Link>
            <Link
              className="hover:text-markPink-500"
              href="https://twitter.com/backseats_eth"
              target="_blank"
              rel="noopener noreferrer"
            >
              @backseats_eth
            </Link>
            <Link
              className="hover:text-markPink-500"
              href="https://twitter.com/scottybmitch"
              target="_blank"
              rel="noopener noreferrer"
            >
              @scottybmitch
            </Link>
          </div>
        </div>
        <div className="flex flex-col md:flex-row w-full gap-1">
          <strong className="text-grey inline-block">Collaborators: </strong>
          <div className="flex flex-wrap gap-1">
            <Link
              className="hover:text-markPink-500"
              href="https://twitter.com/optimizoor"
              target="_blank"
              rel="noopener noreferrer"
            >
              @optimizoor
            </Link>
            <Link
              className="hover:text-markPink-500"
              href="https://twitter.com/0xjustadev"
              target="_blank"
              rel="noopener noreferrer"
            >
              @0xjustadev
            </Link>
            <Link
              className="hover:text-markPink-500"
              href="https://twitter.com/bytes032"
              target="_blank"
              rel="noopener noreferrer"
            >
              @bytes032
            </Link>
            <Link
              className="hover:text-markPink-500"
              href="https://twitter.com/0xCygaar"
              target="_blank"
              rel="noopener noreferrer"
            >
              @0xCygaar
            </Link>
            <Link
              className="hover:text-markPink-500"
              href="https://twitter.com/Sabnock66"
              target="_blank"
              rel="noopener noreferrer"
            >
              @Sabnock66
            </Link>
            <Link
              className="hover:text-markPink-500"
              href="https://twitter.com/pashovkrum"
              target="_blank"
              rel="noopener noreferrer"
            >
              @pashovkrum
            </Link>
            <Link
              className="hover:text-markPink-500"
              href="https://twitter.com/emo_eth"
              target="_blank"
              rel="noopener noreferrer"
            >
              @emo_eth
            </Link>
          </div>
        </div>
        <div className="flex items-center justify-center flex-row w-full py-4">
          © Pop Punk LLC. All rights reserved
        </div>
      </div>
    </footer>
  );
}
