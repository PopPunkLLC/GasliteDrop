import { useEffect, useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { readContract, readContracts } from "@wagmi/core";
import { formatUnits } from "viem";
import {
  airdropContractAddress,
  airdrop1155ContractAddress,
} from "@/lib/contracts";
import {
  erc1155Abi,
  supportsInterfaceABI,
  erc721Abi,
  erc20Abi,
} from "@/lib/abis";
import { config } from "@/lib/wagmi";

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

    // console.log("fetching token data", contractAddress, chainId);

    try {
      const [is721, is1155] = await readContracts(config, {
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
      console.error(e);
      return;
    }

    // console.log("token type", tokenType);

    try {
      if (tokenType === "ERC721") {
        const data = await readContracts(config, {
          contracts: [
            {
              address: contractAddress,
              abi: erc721Abi,
              functionName: "name",
              enabled: contractAddress,
              chainId,
            },
            {
              address: contractAddress,
              abi: erc721Abi,
              functionName: "symbol",
              enabled: contractAddress,
              chainId,
            },
            {
              address: contractAddress,
              abi: erc721Abi,
              functionName: "balanceOf",
              args: [address],
              enabled: contractAddress,
              chainId,
            },
            {
              address: contractAddress,
              abi: erc721Abi,
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
          formattedBalance:
            balance?.status === "success"
              ? formatUnits(balance?.result, 0)
              : "0",
          isApprovedForAll: isApprovedForAll?.result,
          isValid,
          name: name?.result,
          standard: "ERC721",
          symbol: symbol?.result,
        });
      } else if (tokenType === "ERC1155") {
        const data = await readContracts(config, {
          contracts: [
            {
              address: contractAddress,
              abi: erc1155Abi,
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
        const data = await readContracts(config, {
          contracts: [
            {
              address: contractAddress,
              abi: erc20Abi,
              functionName: "name",
              enabled: contractAddress,
              chainId,
            },
            {
              address: contractAddress,
              abi: erc20Abi,
              functionName: "symbol",
              enabled: contractAddress,
              chainId,
            },
            {
              address: contractAddress,
              abi: erc20Abi,
              functionName: "decimals",
              enabled: contractAddress,
              chainId,
            },
            {
              address: contractAddress,
              abi: erc20Abi,
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

        const allowance = await readContract(config, {
          address: contractAddress,
          abi: erc20Abi,
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
          formattedBalance:
            balance?.status === "success"
              ? formatUnits(balance?.result, Number(decimals?.result || 18))
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
