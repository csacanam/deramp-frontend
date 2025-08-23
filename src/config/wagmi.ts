import { createConfig, http } from 'wagmi';
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors';
import { getAllEnabledChains } from './chains';

// Debug: Log environment variables
console.log('🔍 Wagmi Config Debug:');
console.log('  - VITE_WALLETCONNECT_PROJECT_ID:', import.meta.env.VITE_WALLETCONNECT_PROJECT_ID);
console.log('  - NODE_ENV:', import.meta.env.NODE_ENV);
console.log('  - DEV:', import.meta.env.DEV);
console.log('  - Timestamp:', new Date().toISOString());

// Get all enabled chains from the consolidated configuration
const enabledChains = getAllEnabledChains();

export const config = createConfig({
  chains: enabledChains as any,
  connectors: [
    injected(),
    walletConnect({
      projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '2f5a2c1c23b54e8e9d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p8',
    }),
    coinbaseWallet({
      appName: 'Voulti',
    }),
  ],
  transports: enabledChains.reduce((acc, chain) => {
    acc[chain.id] = http();
    return acc;
  }, {} as Record<number, any>),
});

// Debug: Log config after creation
console.log('🔍 Wagmi Config Created:', {
  chains: enabledChains.map(c => ({ id: c.id, name: c.name })),
  connectors: config.connectors.map(c => ({ id: c.id, name: c.name })),
  timestamp: new Date().toISOString()
}); 