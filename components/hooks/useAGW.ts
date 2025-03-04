import { useEffect, useState } from "react";
import { getBytecode } from "@wagmi/core";
import { config } from "@/lib/wagmi";
import { abstract } from "viem/chains";
import { getGeneralPaymasterInput } from "viem/zksync";
import { useAbstractClient } from "@abstract-foundation/agw-react";

const checkIsContract = async (address: string): Promise<boolean> => {
  const code = await getBytecode(config, {
    address,
    chainId: abstract.id,
  });
  return code !== "0x" && code !== undefined;
};

const useAGW = (address: string | undefined) => {
  const [isAGW, setIsAGW] = useState(false);
  const { data: agwClient, isLoading, error } = useAbstractClient();

  useEffect(() => {
    async function check() {
      try {
        const isContract = await checkIsContract(address);
        setIsAGW(isContract);
      } catch (e) {
        console.log(e);
      }
    }
    if (address) {
      check();
    }
  }, [address]);

  return {
    isAGW,
    isLoading,
    error,
    client: agwClient,
    getGeneralPaymasterInput,
  };
};

export default useAGW;
