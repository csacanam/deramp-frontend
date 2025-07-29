import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';

import App from './App.tsx';
import { config } from './config/wagmi.ts';
import './index.css';
import '@rainbow-me/rainbowkit/styles.css';

// Initialize vConsole for mobile debugging
import('vconsole').then(({ default: VConsole }) => {
  new VConsole();
  console.log('🔧 vConsole initialized for mobile debugging');
});

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>
);
