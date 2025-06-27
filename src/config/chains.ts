import { Chain } from 'wagmi/chains';
import { base, polygon, celo, bsc, mainnet, arbitrum, optimism, avalanche } from 'wagmi/chains';

// Configuración centralizada de todas las blockchains soportadas
export interface ChainConfig {
  chain: Chain;
  // Nombres alternativos que puede usar el backend
  backendNames: string[];
  // Si está activa o no (para poder desactivar temporalmente)
  enabled: boolean;
  // Orden de prioridad para mostrar en dropdowns
  priority: number;
}

// ✅ CONFIGURACIÓN CENTRAL DE BLOCKCHAINS
// Para agregar una nueva blockchain, solo hay que añadirla aquí
export const SUPPORTED_CHAINS: ChainConfig[] = [
  {
    chain: mainnet,
    backendNames: ['Ethereum', 'Ethereum Mainnet', 'ETH'],
    enabled: true,
    priority: 1
  },
  {
    chain: base,
    backendNames: ['Base', 'Base Mainnet'],
    enabled: true,
    priority: 2
  },
  {
    chain: polygon,
    backendNames: ['Polygon', 'Polygon POS', 'MATIC'],
    enabled: true,
    priority: 3
  },
  {
    chain: arbitrum,
    backendNames: ['Arbitrum', 'Arbitrum One', 'ARB'],
    enabled: true,
    priority: 4
  },
  {
    chain: optimism,
    backendNames: ['Optimism', 'OP Mainnet', 'OP'],
    enabled: true,
    priority: 5
  },
  {
    chain: bsc,
    backendNames: ['BSC', 'BNB Smart Chain', 'Binance Smart Chain', 'BNB'],
    enabled: true,
    priority: 6
  },
  {
    chain: avalanche,
    backendNames: ['Avalanche', 'Avalanche C-Chain', 'AVAX'],
    enabled: true,
    priority: 7
  },
  {
    chain: celo,
    backendNames: ['Celo', 'CELO'],
    enabled: true,
    priority: 8
  }
];

// ✅ FUNCIONES DERIVADAS DE LA CONFIGURACIÓN CENTRAL

// Obtener todas las chains habilitadas para wagmi
export const getAllEnabledChains = () => {
  const enabledChains = SUPPORTED_CHAINS
    .filter(config => config.enabled)
    .sort((a, b) => a.priority - b.priority)
    .map(config => config.chain);
  
  // Asegurar que siempre tengamos al menos una chain
  if (enabledChains.length === 0) {
    throw new Error('No hay blockchains habilitadas. Revisa la configuración en SUPPORTED_CHAINS.');
  }
  
  return enabledChains;
};

// Mapeo de nombres del backend a chain objects
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

// Mapeo de nombres del backend a chain IDs
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

// Buscar chain por nombre del backend
export const findChainByBackendName = (backendName: string): Chain | undefined => {
  const chainConfig = SUPPORTED_CHAINS
    .filter(config => config.enabled)
    .find(config => config.backendNames.includes(backendName));
  
  return chainConfig?.chain;
};

// Buscar chain ID por nombre del backend
export const findChainIdByBackendName = (backendName: string): number | undefined => {
  const chain = findChainByBackendName(backendName);
  return chain?.id;
};

// Obtener información de debug para una chain
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