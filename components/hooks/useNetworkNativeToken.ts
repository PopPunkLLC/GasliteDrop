import { useAccount } from "wagmi";

function useNetworkNativeToken() {
  const { chain } = useAccount();

  const getNetworkNativeToken = () => {
    if (!chain) return "ETH";

    switch (chain.name) {
      case "Ethereum":
        return "ETH";

      case "Sepolia":
        return "Sepolia ETH";

      case "Arbitrum One":
        return "Arbitrum ETH";

      case "OP Mainnet":
        return "OP";

      case "Polygon":
        return "MATIC";

      case "BNB Smart Chain":
        return "BNB";

      case "Base":
        return "Base ETH";

      case "Degen":
        return "DEGEN";

      case "Sanko":
        return "DMT";

      case "ApeChain":
        return "APE";

      case "Abstract":
        return "ETH";

      default:
        return "ETH";
    }
  };

  return {
    nativeToken: getNetworkNativeToken(),
  };
}

export default useNetworkNativeToken;
