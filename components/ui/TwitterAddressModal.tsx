import React, { useEffect } from "react";
import { useKeyboardEvent } from "@react-hookz/web";
import { MdCheck as CheckIcon, MdClose as CloseIcon } from "react-icons/md";
import { shortenAddress } from "@/components/utils";
import { formatDistance } from "date-fns";
import {
  AGE_OPTIONS,
  DEFAULT_TWITTER_EXCLUSIONS,
} from "@/components/ui/constants";
import { isEqual } from "lodash";

const TwitterTable = ({ data }) => (
  <table className="w-full">
    <thead>
      <tr className="border-b-2 border-neutral-700">
        <th className="hidden lg:table-cell bg-white text-grey capitalize p-2 sticky top-0 w-[60px]">
          <span />
        </th>
        <th className="bg-white text-grey capitalize p-2 sticky top-0 text-left">
          User
        </th>
        <th className="bg-white text-grey capitalize p-2 sticky top-0 text-left">
          Account
        </th>
        <th className="bg-white text-grey capitalize p-2 sticky top-0 text-left">
          Metrics
        </th>
        <th className="bg-white text-grey capitalize p-2 sticky top-0 text-left">
          Address / ENS
        </th>
      </tr>
    </thead>
    <tbody className="overflow-auto">
      {data.map(({ user, addr, ens }) => (
        <tr key={addr}>
          <td className="hidden lg:table-cell capitalize bg-transparent text-black bg-white p-2 border-t-2 border-neutral-700">
            <div className="flex flex-row items-center justify-center">
              <img
                src={user?.profile_image_url}
                className="w-[30px] h-[30px] rounded-full overflow-hidden"
                alt="PFP"
              />
            </div>
          </td>
          <td className="capitalize bg-transparent text-black bg-white p-2 border-t-2 border-neutral-700">
            <div className="flex flex-col max-w-[150px] lg:max-w-[250px]">
              <span className="truncate text-sm">{user?.name}</span>
              <span className="text-xs">{user?.username}</span>
            </div>
          </td>
          <td className="capitalize bg-transparent text-black bg-white p-2 border-t-2 border-neutral-700">
            <div className="flex flex-col">
              <span className="text-xs">
                Location: {user?.location || "N/A"}
              </span>
              <span className="text-xs lowercase">
                Created {formatDistance(new Date(user?.created_at), new Date())}{" "}
                ago
              </span>
            </div>
          </td>
          <td className="capitalize bg-transparent text-black bg-white p-2 border-t-2 border-neutral-700">
            <div className="flex flex-col min-w-[150px]">
              <span className="text-xs flex-wrap">
                {user?.public_metrics.following_count} following,{" "}
                {user?.public_metrics.followers_count} followers,{" "}
                {user?.public_metrics.tweet_count} tweets
              </span>
            </div>
          </td>
          <td className="capitalize bg-transparent text-black bg-white p-2 border-t-2 border-neutral-700">
            {ens ? (
              <span className="text-sm">{ens}</span>
            ) : (
              <span className="text-sm">{shortenAddress(addr, 6)}</span>
            )}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

const TwitterAddressModal = ({
  exclusions,
  data,
  onClose,
  onSetExclusions,
}) => {
  useEffect(() => {
    window.document.body.style.overflow = "hidden";
    return () => {
      window.document.body.style.overflow = "auto";
    };
  }, []);

  useKeyboardEvent(
    true,
    (ev) => {
      if (ev?.key === "Escape") {
        onClose();
      }
    },
    [],
    { eventOptions: { passive: true } }
  );

  return (
    <div className="flex items-center justify-center fixed top-0 left-0 w-full h-[100dvh] z-[10000]">
      <div className="absolute top-0 left-0 h-full w-full z-[1] bg-white text-black bg-opacity-90" />
      <div className="flex flex-col w-4/5 md:w-3/4 mx-auto bg-white text-black rounded-md border-[2px] border-grey/[.3] z-[2] p-6">
        <header className="flex flex-row items-center justify-between">
          <div className="flex flex-row space-x-2 items-center">
            <h1 className="text-2xl">Twitter Matches ({data.length})</h1>
            {!isEqual(exclusions, DEFAULT_TWITTER_EXCLUSIONS) && (
              <button
                type="button"
                className="flex text-xs hover:underline items-center justify-center h-[32px]"
                onClick={() => {
                  onSetExclusions(DEFAULT_TWITTER_EXCLUSIONS);
                }}
              >
                reset
              </button>
            )}
          </div>
          <button onClick={onClose}>
            <CloseIcon className="text-2xl text-grey" />
          </button>
        </header>
        <div className="flex flex-row flex-wrap mt-1 gap-2">
          <div className="flex flex-row items-center">
            <div className="flex flex-col">
              <span className="text-[10px] text-grey uppercase font-semibold">
                Picture?
              </span>
              <button
                id="hasProfile"
                type="button"
                className="flex h-[32px] items-center justify-center"
                onClick={() => {
                  onSetExclusions((prev) => ({
                    ...prev,
                    hasProfile: !prev.hasProfile,
                  }));
                }}
              >
                {exclusions?.hasProfile ? <CheckIcon /> : <CloseIcon />}
              </button>
            </div>
          </div>
          <div className="flex flex-row items-center">
            <div className="flex flex-col">
              <span className="text-[10px] text-grey uppercase font-semibold">
                Description?
              </span>
              <button
                id="hasDescription"
                type="button"
                className="flex h-[32px] items-center justify-center"
                onClick={() => {
                  onSetExclusions((prev) => ({
                    ...prev,
                    hasDescription: !prev.hasDescription,
                  }));
                }}
              >
                {exclusions?.hasDescription ? <CheckIcon /> : <CloseIcon />}
              </button>
            </div>
          </div>
          <div className="flex flex-row items-center">
            <div className="flex flex-col">
              <span className="text-[10px] text-grey uppercase font-semibold">
                Location?
              </span>
              <button
                id="hasLocation"
                type="button"
                className="flex h-[32px] items-center justify-center"
                onClick={() => {
                  onSetExclusions((prev) => ({
                    ...prev,
                    hasLocation: !prev.hasLocation,
                  }));
                }}
              >
                {exclusions?.hasLocation ? <CheckIcon /> : <CloseIcon />}
              </button>
            </div>
          </div>
          <div className="flex flex-row items-center">
            <label className="flex flex-col" htmlFor="minFollowerCount">
              <span className="text-[10px] text-grey uppercase font-semibold">
                Min. followers
              </span>
              <input
                id="minFollowerCount"
                name="minFollowerCount"
                className="max-w-[80px] border border-2 pl-2 h-[32px] text-sm rounded-md"
                type="number"
                value={exclusions?.minFollowerCount}
                step={1}
                onChange={(e) => {
                  onSetExclusions((prev) => ({
                    ...prev,
                    minFollowerCount: Number(e.target.value),
                  }));
                }}
              />
            </label>
          </div>
          <div className="flex flex-row items-center">
            <label className="flex flex-col" htmlFor="minTweetCount">
              <span className="text-[10px] text-grey uppercase font-semibold">
                Min. tweets
              </span>
              <input
                id="minTweetCount"
                name="minTweetCount"
                className="max-w-[80px] border border-2 pl-2 h-[32px] text-sm rounded-md"
                type="number"
                value={exclusions?.minTweetCount}
                step={1}
                onChange={(e) => {
                  onSetExclusions((prev) => ({
                    ...prev,
                    minTweetCount: Number(e.target.value),
                  }));
                }}
              />
            </label>
          </div>
          <div className="flex flex-row items-center">
            <label className="flex flex-col" htmlFor="minAccountAge">
              <span className="text-[10px] text-grey uppercase font-semibold">
                Min. Account Age
              </span>
              <select
                id="minAccountAge"
                name="minAccountAge"
                className="max-w-[100px] border border-2 h-[32px] text-sm rounded-md"
                value={exclusions?.minAccountAge}
                onChange={(e) => {
                  onSetExclusions((prev) => ({
                    ...prev,
                    minAccountAge: e.target.value,
                  }));
                }}
              >
                {AGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
        <div className="flex flex-col w-full pt-4 space-y-4">
          <div
            className="w-full border-2 border-neutral-700 bg-transparent rounded-md border-separate border-spacing-0 overflow-auto"
            style={{ height: "50vh" }}
          >
            <TwitterTable data={data} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwitterAddressModal;
