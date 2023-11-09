import React, { useEffect } from "react";
import { useKeyboardEvent } from "@react-hookz/web";
import { MdClose as CloseIcon } from "react-icons/md";
import { shortenAddress } from "@/components/utils";

const TwitterTable = ({ data }) => (
  <table className="w-full">
    <thead>
      <tr className="border-b-2 border-neutral-700">
        <th className="hidden lg:table-cell bg-white text-grey capitalize p-2 sticky top-0 text-left">
          <span />
        </th>
        <th className="bg-white text-grey capitalize p-2 sticky top-0 text-left">
          Username
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
            <img
              src={user?.profile_image_url}
              className="w-[30px] h-[30px] rounded-full overflow-hidden"
            />
          </td>
          <td className="capitalize bg-transparent text-black bg-white p-2 border-t-2 border-neutral-700">
            <span>{user?.username}</span>
          </td>
          <td className="capitalize bg-transparent text-black bg-white p-2 border-t-2 border-neutral-700">
            {ens ? (
              <span>{ens}</span>
            ) : (
              <>
                <span className="hidden md:flex">{addr}</span>
                <span className="flex md:hidden">
                  {shortenAddress(addr, 6)}
                </span>
              </>
            )}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

const TwitterAddressModal = ({ data, onClose }) => {
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

  console.log(data);

  return (
    <div className="flex items-center justify-center fixed top-0 left-0 w-full h-[100dvh] z-[10000]">
      <div className="absolute top-0 left-0 h-full w-full z-[1] bg-white text-black bg-opacity-90" />
      <div className="flex flex-col w-4/5 md:w-1/2 mx-auto bg-white text-black rounded-md border-[2px] border-grey/[.3] z-[2] p-6">
        <header className="flex flex-row items-center justify-between">
          <h1 className="text-2xl">Twitter Matches</h1>
          <button onClick={onClose}>
            <CloseIcon className="text-2xl text-grey" />
          </button>
        </header>
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
