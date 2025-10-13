import { defineChain } from "viem";

export const flowevm = defineChain({
  id: 747,
  name: 'Flow EVM Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Flow',
    symbol: 'FLOW',
  },
  rpcUrls: {
    default: {
      http: ['https://mainnet.evm.nodes.onflow.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Mainnet Explorer',
      url: 'https://evm.flowscan.io',
    },
  },
  iconUrl: "https://raw.githubusercontent.com/onflow/assets/refs/heads/main/tokens/registry/testnet%3A0xd3bf53dac106a0290b0483ecbc89d40fcc961f3e/logo.svg",
  blockTime: 800,
});

