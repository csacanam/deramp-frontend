import { Chain } from 'wagmi/chains';
import { celo } from 'wagmi/chains';

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

// Definir Celo Alfajores manualmente ya que no está en wagmi/chains
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

// ✅ CONFIGURACIÓN CENTRAL DE BLOCKCHAINS
// Solo Celo y Celo Alfajores están habilitados
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