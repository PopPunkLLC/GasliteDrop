import { defineConfig } from '@wagmi/cli';
import { foundry, react } from '@wagmi/cli/plugins';
import {
  mainnet,
  optimism,
  sepolia,
  arbitrum,
  polygon,
  // bsc,
  base
} from '@wagmi/chains'

export const airdropContractAddress = '0x09350F89e2D7B6e96bA730783c2d76137B045FEF';

export default defineConfig({
  out: 'src/generated.ts',
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
        },
      },
      artifacts: '/out',
      project: './contracts',
    }),
    react(),
  ],
});
