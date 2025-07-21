export const NETWORKS = {
  alfajores: {
    chainId: 44787,
    name: "Celo Alfajores",
    rpcUrl: "https://alfajores-forno.celo-testnet.org",
    blockExplorer: "https://alfajores.celoscan.io",
    nativeCurrency: {
      name: "CELO",
      symbol: "CELO",
      decimals: 18,
    },
  },
  // Add more networks here in the future
};

export type NetworkKey = keyof typeof NETWORKS;
export type NetworkConfig = typeof NETWORKS[NetworkKey]; 