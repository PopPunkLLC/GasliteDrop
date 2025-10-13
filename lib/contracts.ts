import {
  arbitrum,
  base,
  baseSepolia,
  mainnet,
  optimism,
  polygon,
  sepolia,
  bsc,
  zora,
  blast,
  degen,
  sanko,
  apeChain,
  abstract,
  flowMainnet
} from "viem/chains";

export const airdropContractAddress = {
  [mainnet.id]: "0x09350F89e2D7B6e96bA730783c2d76137B045FEF",
  [sepolia.id]: "0x09350F89e2D7B6e96bA730783c2d76137B045FEF",
  [arbitrum.id]: "0x09350F89e2D7B6e96bA730783c2d76137B045FEF",
  [optimism.id]: "0x09350F89e2D7B6e96bA730783c2d76137B045FEF",
  [polygon.id]: "0x09350F89e2D7B6e96bA730783c2d76137B045FEF",
  [base.id]: "0x09350F89e2D7B6e96bA730783c2d76137B045FEF",
  [baseSepolia.id]: "0xf6c3555139aeA30f4a2be73EBC46ba64BAB8ac12",
  [bsc.id]: "0xf6c3555139aeA30f4a2be73EBC46ba64BAB8ac12",
  [blast.id]: "0x2EA391c57bDE02019EFbBEb0C05f104877c975C4",
  [zora.id]: "0x0eBa170fDC5edC7f528AdbEebC6a1bFc55343181",
  [degen.id]: "0x0eBa170fDC5edC7f528AdbEebC6a1bFc55343181",
  [sanko.id]: "0x0eBa170fDC5edC7f528AdbEebC6a1bFc55343181",
  [apeChain.id]: "0x54b5cd30582ddc305d814c95138a5bce04419249",
  [abstract.id]: "0xe231Aa7183862CEe136D8414E5638764c4297E79",
  [flowMainnet.id]: "0xD9D7aA276E216922016386Bdf0AE9F9B4b167F3B",
};

export const airdrop1155ContractAddress = {
  [mainnet.id]: "0x1155D79afC98dad97Ee4b0c747398DcF5b631155",
  [sepolia.id]: "0x1155D79afC98dad97Ee4b0c747398DcF5b631155",
  [arbitrum.id]: "0x1155D79afC98dad97Ee4b0c747398DcF5b631155",
  [optimism.id]: "0x1155D79afC98dad97Ee4b0c747398DcF5b631155",
  [polygon.id]: "0x1155D79afC98dad97Ee4b0c747398DcF5b631155",
  [base.id]: "0x1155D79afC98dad97Ee4b0c747398DcF5b631155",
  [baseSepolia.id]: "0x1155D79afC98dad97Ee4b0c747398DcF5b631155",
  [bsc.id]: "0x53d097F8f78Ada73085fAF3A4c36B9Ec58E7E172",
  [sanko.id]: "0xeCC9a57543bFDe6BBc01420680Fc4a1BC51B6D1A",
  [abstract.id]: "0xa5a2e5A4aa8Fd0CB021c00fc62283F337c175d07",
  [flowMainnet.id]: "0x853EcD46B0701FF8f7d3Aabd24C3e8fb60F520c8",
  [blast.id]: "", // not deployed yet!
  [degen.id]: "", // not deployed yet!
  [zora.id]: "", // not deployed yet!
  [apeChain.id]: "", // not deployed yet!
};
