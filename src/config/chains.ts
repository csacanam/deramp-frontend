import { Chain } from 'wagmi/chains';
import { celo } from 'wagmi/chains';

// Centralized configuration of all supported blockchains
export interface ChainConfig {
  chain: Chain;
  // Alternative names that the backend can use
  backendNames: string[];
  // Whether it's active or not (to be able to temporarily disable)
  enabled: boolean;
  // Priority order for displaying in dropdowns
  priority: number;
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
    priority: 1
  },
  {
    chain: celoAlfajores,
    backendNames: ['Celo Alfajores', 'Alfajores', 'Celo Testnet'],
    enabled: true,
    priority: 2
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