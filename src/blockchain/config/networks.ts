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

// Helper function to get block explorer URL for a transaction
export const getBlockExplorerUrl = (networkName: string, txHash: string): string | null => {
  const network = NETWORKS[networkName as NetworkKey];
  if (!network || !network.blockExplorer) {
    return null;
  }
  return `${network.blockExplorer}/tx/${txHash}`;
}; 