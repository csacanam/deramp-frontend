import { Chain } from 'wagmi/chains';
import { celo } from 'wagmi/chains';

// Token configuration interface
export interface TokenConfig {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
}

// Centralized configuration of all supported blockchains
export interface ChainConfig {
  chain: Chain;
  // Alternative names that the backend can use
  backendNames: string[];
  // Whether it's active or not (to be able to temporarily disable)
  enabled: boolean;
  // Priority order for displaying in dropdowns
  priority: number;
  // Contracts deployed on this network
  contracts: {
    DERAMP_PROXY: string;
    DERAMP_STORAGE: string;
    ACCESS_MANAGER: string;
    INVOICE_MANAGER: string;
    PAYMENT_PROCESSOR: string;
  };
  // Tokens available on this network
  tokens: Record<string, TokenConfig>;
  // RPC URLs for this network
  rpcUrls: string[];
  // Block explorer URL
  blockExplorer: string;
  // Native currency configuration
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

// Define Celo Alfajores manually since it's not in wagmi/chains
const celoAlfajores: Chain = {
  id: 44787,
  name: 'Celo Alfajores',
  nativeCurrency: {
    decimals: 18,
    name: 'Celo',
    symbol: 'CELO',
  },
  rpcUrls: {
    default: { http: ['https://alfajores-forno.celo-testnet.org'] },
    public: { http: ['https://alfajores-forno.celo-testnet.org'] },
  },
  blockExplorers: {
    default: { name: 'Celo Explorer', url: 'https://explorer.celo.org/alfajores' },
  },
  testnet: true,
};

// ✅ CENTRAL BLOCKCHAIN CONFIGURATION
// Only Celo and Celo Alfajores are enabled
export const SUPPORTED_CHAINS: ChainConfig[] = [
  {
    chain: celo,
    backendNames: ['Celo', 'CELO', 'Celo Mainnet'],
    enabled: true,
    priority: 1,
    contracts: {
      DERAMP_PROXY: "0x0000000000000000000000000000000000000000", // TODO: Add mainnet addresses
      DERAMP_STORAGE: "0x0000000000000000000000000000000000000000",
      ACCESS_MANAGER: "0x0000000000000000000000000000000000000000",
      INVOICE_MANAGER: "0x0000000000000000000000000000000000000000",
      PAYMENT_PROCESSOR: "0x0000000000000000000000000000000000000000",
    },
    tokens: {
      CELO: {
        address: "0x0000000000000000000000000000000000000000",
        symbol: "CELO",
        name: "Celo",
        decimals: 18,
      },
      // TODO: Add mainnet tokens
    },
    rpcUrls: ['https://forno.celo.org'],
    blockExplorer: 'https://explorer.celo.org',
    nativeCurrency: {
      name: 'CELO',
      symbol: 'CELO',
      decimals: 18,
    }
  },
  {
    chain: celoAlfajores,
    backendNames: ['Celo Alfajores', 'Alfajores', 'Celo Testnet'],
    enabled: true,
    priority: 2,
    contracts: {
      DERAMP_PROXY: "0xc44cDAdf371DFCa94e325d1B35e27968921Ef668",
      DERAMP_STORAGE: "0x25f5A82B9B021a35178A25540bb0f052fF22e6b4",
      ACCESS_MANAGER: "0x776D9E84D5DAaecCb014f8aa8D64a6876B47a696",
      INVOICE_MANAGER: "0xe7c011eB0328287B11aC711885a2f76d5797012f",
      PAYMENT_PROCESSOR: "0x23b353F6B8F90155f7854Ca3813C0216819543B1",
    },
    tokens: {
      CELO: {
        address: "0x0000000000000000000000000000000000000000",
        symbol: "CELO",
        name: "Celo",
        decimals: 18,
      },
      CCOP: {
        address: "0xe6A57340f0df6E020c1c0a80bC6E13048601f0d4",
        symbol: "cCOP",
        name: "Celo Colombian Peso",
        decimals: 18,
      },
      CUSD: {
        address: "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1",
        symbol: "cUSD",
        name: "Celo Dollar",
        decimals: 18,
      },
      CEUR: {
        address: "0x10c892A6EC43a53E45D0B916B4b7D383B1b78C0F",
        symbol: "cEUR",
        name: "Celo Euro",
        decimals: 18,
      },
      USDC: {
        address: "0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B",
        symbol: "USDC",
        name: "USD Coin",
        decimals: 6,
      },
    },
    rpcUrls: ['https://alfajores-forno.celo-testnet.org'],
    blockExplorer: 'https://alfajores.celoscan.io',
    nativeCurrency: {
      name: 'CELO',
      symbol: 'CELO',
      decimals: 18,
    }
  }
];

// ✅ FUNCTIONS DERIVED FROM CENTRAL CONFIGURATION

// Get all enabled chains for wagmi
export const getAllEnabledChains = () => {
  const enabledChains = SUPPORTED_CHAINS
    .filter(config => config.enabled)
    .sort((a, b) => a.priority - b.priority)
    .map(config => config.chain);
  
  // Ensure we always have at least one chain
  if (enabledChains.length === 0) {
    throw new Error('No hay blockchains habilitadas. Revisa la configuración en SUPPORTED_CHAINS.');
  }
  
  return enabledChains;
};

// Mapping of backend names to chain objects
export const getBackendNameToChainMap = (): Record<string, Chain> => {
  const map: Record<string, Chain> = {};
  
  SUPPORTED_CHAINS
    .filter(config => config.enabled)
    .forEach(config => {
      config.backendNames.forEach(name => {
        map[name] = config.chain;
      });
    });
  
  return map;
};

// Mapping of backend names to chain IDs
export const getBackendNameToChainIdMap = (): Record<string, number> => {
  const map: Record<string, number> = {};
  
  SUPPORTED_CHAINS
    .filter(config => config.enabled)
    .forEach(config => {
      config.backendNames.forEach(name => {
        map[name] = config.chain.id;
      });
    });
  
  return map;
};

// Find chain by backend name
export const findChainByBackendName = (backendName: string): Chain | undefined => {
  const chainConfig = SUPPORTED_CHAINS
    .filter(config => config.enabled)
    .find(config => config.backendNames.includes(backendName));
  
  return chainConfig?.chain;
};

// Find chain ID by backend name
export const findChainIdByBackendName = (backendName: string): number | undefined => {
  const chain = findChainByBackendName(backendName);
  return chain?.id;
};

// Find chain config by backend name
export const findChainConfigByBackendName = (backendName: string): ChainConfig | undefined => {
  return SUPPORTED_CHAINS
    .filter(config => config.enabled)
    .find(config => config.backendNames.includes(backendName));
};

// Find chain config by chain ID
export const findChainConfigByChainId = (chainId: number): ChainConfig | undefined => {
  return SUPPORTED_CHAINS
    .filter(config => config.enabled)
    .find(config => config.chain.id === chainId);
};

// Get debug information for a chain
export const getChainDebugInfo = (backendName: string) => {
  const chainConfig = SUPPORTED_CHAINS
    .filter(config => config.enabled)
    .find(config => config.backendNames.includes(backendName));
  
  if (!chainConfig) {
    return {
      found: false,
      backendName,
      availableNames: SUPPORTED_CHAINS
        .filter(config => config.enabled)
        .flatMap(config => config.backendNames)
    };
  }
  
  return {
    found: true,
    backendName,
    chainId: chainConfig.chain.id,
    chainName: chainConfig.chain.name,
    allBackendNames: chainConfig.backendNames,
    priority: chainConfig.priority
  };
};

// Helper function to get block explorer URL for a transaction
export const getBlockExplorerUrl = (networkName: string, txHash: string): string | null => {
  const chainConfig = findChainConfigByBackendName(networkName);
  if (!chainConfig || !chainConfig.blockExplorer) {
    return null;
  }
  return `${chainConfig.blockExplorer}/tx/${txHash}`;
}; 