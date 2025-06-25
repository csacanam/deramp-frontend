import React from 'react';

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Section */}
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Accept stablecoin payments.{' '}
            <span className="text-green-400">No middlemen.</span>{' '}
            <span className="text-green-400">No friction.</span>
          </h1>
          
          {/* Subtitle */}
          <div className="text-lg md:text-xl text-gray-300 mb-8 space-y-2 leading-relaxed">
            <p>Let your customers pay with USDC, USDT or cCOP.</p>
            <p>You receive exactly what you expect — on the network you prefer.</p>
            <p className="font-medium">No custodians. No hidden fees.</p>
          </div>
          
          {/* CTA Button */}
          <a
            href="https://t.me/camilosaka"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg transition-colors duration-200 text-lg"
          >
            💬 Contact me on Telegram
          </a>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="py-8 text-center">
        <p className="text-gray-400 text-sm">
          Built for merchants who want crypto payments to just work.
        </p>
      </footer>
    </div>
  );
}; 