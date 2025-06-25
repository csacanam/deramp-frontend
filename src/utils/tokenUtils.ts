import { Token, GroupedToken } from '../types/invoice';

export const groupTokensBySymbol = (tokens: Token[]): GroupedToken[] => {
  const grouped = tokens.reduce((acc, token) => {
    const existing = acc.find(group => group.symbol === token.symbol);
    
    if (existing) {
      existing.networks.push({
        network: token.network,
        contract_address: token.contract_address,
        decimals: token.decimals,
        id: token.id,
        rate_to_usd: token.rate_to_usd,
        amount_to_pay: token.amount_to_pay,
        updated_at: token.updated_at
      });
    } else {
      acc.push({
        symbol: token.symbol,
        name: token.name,
        networks: [{
          network: token.network,
          contract_address: token.contract_address,
          decimals: token.decimals,
          id: token.id,
          rate_to_usd: token.rate_to_usd,
          amount_to_pay: token.amount_to_pay,
          updated_at: token.updated_at
        }]
      });
    }
    
    return acc;
  }, [] as GroupedToken[]);

  return grouped;
};