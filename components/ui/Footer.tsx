import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="text-center p-10 bg-transparent text-blk-700 font-normal">
      <div className="flex flex-col gap-4 link">
        <p className="md:flex md:justify-center md:items-end md:space-x-1">
          Created by
          <Link
            href="https://gaslite.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="md:flex md:justify-center md:items-start md:space-x-1 hover:text-markPink-500"
          >
            <span className="ml-1 underline">Gaslite</span>
          </Link>
        </p>

        <div className="md:flex md:justify-center md:items-end md:space-x-1">
          <p className="text-grey">Contributors:</p>

          <div className="flex space-x-1">
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
          </div>
        </div>

        <div className="md:flex md:justify-center md:items-end space-x-1">
          <p className="text-grey inline-block">Collaborators: </p>
          <div className="flex space-x-1">
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
          </div>
        </div>

        <div className="flex md:justify-center md:items-end space-x-1">
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
        </div>

        <div className="md:flex md:justify-center md:items-end md:space-x-1">
          <Link
            className="hover:text-markPink-500"
            href="https://twitter.com/emo_eth"
            target="_blank"
            rel="noopener noreferrer"
          >
            @emo_eth
          </Link>
        </div>

        <div className="flex justify-center font-normal mt-4">
          © Pop Punk LLC. All rights reserved
        </div>
      </div>
    </footer>
  );
}
