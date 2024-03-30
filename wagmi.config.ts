import { defineConfig } from "@wagmi/cli";
import { foundry, react } from "@wagmi/cli/plugins";
import {
  mainnet,
  optimism,
  sepolia,
  arbitrum,
  polygon,
  // bsc,
  base,
} from "@wagmi/chains";
import { blast } from "@/lib/chains/blast";
import { degen } from "@/lib/chains/degen";

export const airdropContractAddress =
  "0x09350F89e2D7B6e96bA730783c2d76137B045FEF";

export default defineConfig({
  out: "src/generated.ts",
  plugins: [
    foundry({
      deployments: {
        Airdrop: {
          [mainnet.id]: airdropContractAddress,
          [optimism.id]: airdropContractAddress,
          [sepolia.id]: airdropContractAddress,
          [arbitrum.id]: airdropContractAddress,
          [polygon.id]: airdropContractAddress,
          // [bsc.id]: contractAddress,
          [base.id]: airdropContractAddress,
          [blast.id]: "0x2EA391c57bDE02019EFbBEb0C05f104877c975C4",
          [degen.id]: "0x0eBa170fDC5edC7f528AdbEebC6a1bFc55343181",
        },
      },
      artifacts: "/out",
      project: "./contracts",
    }),
    react(),
  ],
});
