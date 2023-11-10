import { useEffect, useState } from "react";
import { erc20ABI, erc721ABI, useAccount, useChainId } from "wagmi";
import { readContract, readContracts } from "@wagmi/core";
import { airdropContractAddress } from "@/components/airdropContractAddress";
import { formatUnits } from "viem";

const supportsInterfaceABI = [
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4",
      },
    ],
    name: "supportsInterface",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const useTokenData = ({ contractAddress }) => {
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const { address } = useAccount();
  const chainId = useChainId();

  const fetchTokenData = async () => {
    let isERC721: boolean;

    setIsLoading(true);

    // Check for ERC721 supports interface
    try {
      const supportsInterface = await readContract({
        address: contractAddress,
        abi: supportsInterfaceABI,
        functionName: "supportsInterface",
        args: ["0x80ac58cd"],
        enabled: contractAddress,
        chainId,
      });
      isERC721 = Boolean(supportsInterface);
    } catch (e) {
      // console.error(e);
      isERC721 = false;
    }

    try {
      if (isERC721) {
        const data = await readContracts({
          contracts: [
            {
              address: contractAddress,
              abi: erc721ABI,
              functionName: "name",
              enabled: contractAddress,
              chainId,
            },
            {
              address: contractAddress,
              abi: erc721ABI,
              functionName: "symbol",
              enabled: contractAddress,
              chainId,
            },
            {
              address: contractAddress,
              abi: erc721ABI,
              functionName: "balanceOf",
              args: [address],
              enabled: contractAddress,
              chainId,
            },
            {
              address: contractAddress,
              abi: erc721ABI,
              functionName: "isApprovedForAll",
              args: [address!, airdropContractAddress], // the signing wallet, the airdrop contract (operator)
              enabled: address && contractAddress,
              chainId,
            },
          ],
        });

        const [name, symbol, balance, isApprovedForAll] = data ?? [];

        const isValid =
          name?.status === "success" && symbol?.status === "success";

        setToken({
          balance: balance?.result,
          contractAddress,
          decimals: 0,
          formattedBalance: balance?.result
            ? formatUnits(balance?.result, 0)
            : "0",
          isApprovedForAll: isApprovedForAll?.result,
          isERC721: true,
          isValid,
          name: name?.result,
          standard: "ERC721",
          symbol: symbol?.result,
        });
      } else {
        const data = await readContracts({
          contracts: [
            {
              address: contractAddress,
              abi: erc20ABI,
              functionName: "name",
              enabled: contractAddress,
              chainId,
            },
            {
              address: contractAddress,
              abi: erc20ABI,
              functionName: "symbol",
              enabled: contractAddress,
              chainId,
            },
            {
              address: contractAddress,
              abi: erc20ABI,
              functionName: "decimals",
              enabled: contractAddress,
              chainId,
            },
            {
              address: contractAddress,
              abi: erc20ABI,
              functionName: "balanceOf",
              args: [address],
              enabled: contractAddress,
              chainId,
            },
          ],
        });

        const [name, symbol, decimals, balance] = data ?? [];

        const isValid =
          name?.status === "success" && symbol?.status === "success";

        const allowance = await readContract({
          address: contractAddress,
          abi: erc20ABI,
          functionName: "allowance",
          args: [address!, airdropContractAddress],
          enabled: isValid,
          chainId,
        });

        setToken({
          allowance,
          balance: balance?.result,
          contractAddress,
          decimals: decimals?.result,
          formattedBalance: balance?.result
            ? formatUnits(balance?.result, decimals?.result || 18)
            : "0",
          isERC721: false,
          isValid,
          name: name?.result,
          standard: "ERC20",
          symbol: symbol?.result,
        });
      }
    } catch (e) {
      console.error(e);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (address && contractAddress && chainId) {
      fetchTokenData();
    } else {
      setIsLoading(false);
    }
  }, [address, contractAddress, chainId]);

  return {
    ...(token ?? {}),
    isLoading,
    onRefresh: fetchTokenData.bind(null, contractAddress),
  };
};

export default useTokenData;
