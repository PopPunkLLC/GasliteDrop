import { useEffect, useState } from "react";
import { erc20ABI, erc721ABI, useAccount, useChainId } from "wagmi";
import { readContract, readContracts } from "@wagmi/core";
import { formatUnits } from "viem";
import {
  airdropContractAddress,
  airdrop1155ContractAddress,
} from "@/lib/contracts";
import { erc1155ABI, supportsInterfaceABI } from "@/lib/abis";

const ERC1155InterfaceId: string = "0xd9b67a26";
const ERC721InterfaceId: string = "0x80ac58cd";

const useTokenData = ({ contractAddress }) => {
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const { address } = useAccount();
  const chainId = useChainId();

  const fetchTokenData = async () => {
    let tokenType = "ERC20";

    setIsLoading(true);

    try {
      const [is721, is1155] = await readContracts({
        contracts: [
          // Check 721 support
          {
            address: contractAddress,
            abi: supportsInterfaceABI,
            functionName: "supportsInterface",
            args: [ERC721InterfaceId],
            enabled: contractAddress,
            chainId,
          },
          // Check 1155 support
          {
            address: contractAddress,
            abi: supportsInterfaceABI,
            functionName: "supportsInterface",
            args: [ERC1155InterfaceId],
            enabled: contractAddress,
            chainId,
          },
        ],
      });

      if (is721?.result) {
        tokenType = "ERC721";
      } else if (is1155?.result) {
        tokenType = "ERC1155";
      }
    } catch (e) {
      // console.error(e);
    }

    try {
      if (tokenType === "ERC721") {
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
              args: [address!, airdropContractAddress?.[chainId]], // the signing wallet, the airdrop contract (operator)
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
          isValid,
          name: name?.result,
          standard: "ERC721",
          symbol: symbol?.result,
        });
      } else if (tokenType === "ERC1155") {
        const data = await readContracts({
          contracts: [
            {
              address: contractAddress,
              abi: erc1155ABI,
              functionName: "isApprovedForAll",
              args: [address!, airdrop1155ContractAddress?.[chainId]], // the signing wallet, the airdrop contract (operator)
              enabled: address && contractAddress,
              chainId,
            },
          ],
        });

        const [isApprovedForAll] = data ?? [];

        setToken({
          contractAddress,
          decimals: 0,
          isApprovedForAll: isApprovedForAll?.result,
          isValid: true,
          standard: "ERC1155",
          // Use contract metadata via `contractURI`? meh, non-standard
          name: "",
          symbol: "",
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
          args: [address!, airdropContractAddress?.[chainId]],
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
