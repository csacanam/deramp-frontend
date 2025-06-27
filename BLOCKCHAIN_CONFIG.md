# 🔗 Configuración de Blockchains

Esta aplicación usa una configuración centralizada para manejar todas las blockchains soportadas. Esto hace que sea muy fácil agregar nuevas redes sin tener que actualizar múltiples archivos.

## 📁 Archivo Principal: `src/config/chains.ts`

Toda la configuración de blockchains está centralizada en este archivo. Para agregar una nueva blockchain, solo necesitas modificar este archivo.

## ✅ Cómo Agregar una Nueva Blockchain

### 1. Instalar la Chain (si es necesario)

Si la blockchain no está incluida en `wagmi/chains`, primero agrégala:

```bash
npm install @wagmi/chains
```

### 2. Agregar a la Configuración Central

Edita `src/config/chains.ts` y agrega la nueva blockchain al array `SUPPORTED_CHAINS`:

```typescript
import { newChain } from "wagmi/chains"; // Importar la nueva chain

export const SUPPORTED_CHAINS: ChainConfig[] = [
  // ... blockchains existentes ...

  // ✅ NUEVA BLOCKCHAIN
  {
    chain: newChain,
    backendNames: [
      "Nombre Principal",
      "Nombre Alternativo 1",
      "Nombre Alternativo 2",
      "Abreviación",
    ],
    enabled: true,
    priority: 9, // Orden en dropdowns (número más bajo = mayor prioridad)
  },
];
```

### 3. ¡Eso es todo!

No necesitas actualizar ningún otro archivo. La configuración centralizada automáticamente:

- ✅ **Agregará la chain a wagmi** (para conectar wallets)
- ✅ **Actualizará los mapeos** de nombres del backend
- ✅ **Habilitará el balance de tokens** en esa red
- ✅ **Permitirá cambiar de red** en la wallet
- ✅ **Incluirá la red en dropdowns**

## 🔧 Configuración por Blockchain

Cada blockchain tiene estas propiedades:

### `chain: Chain`

El objeto chain de wagmi (ej: `mainnet`, `polygon`, `bsc`)

### `backendNames: string[]`

Lista de nombres que puede usar el backend para referirse a esta blockchain:

- Nombre oficial
- Nombres alternativos
- Abreviaciones
- Variaciones comunes

**Ejemplo para BSC:**

```typescript
backendNames: ["BSC", "BNB Smart Chain", "Binance Smart Chain", "BNB"];
```

### `enabled: boolean`

Si la blockchain está activa. Para desactivar temporalmente una red:

```typescript
enabled: false;
```

### `priority: number`

Orden en dropdowns. Número más bajo = mayor prioridad.

## 📋 Blockchains Actualmente Soportadas

| Blockchain | Chain ID | Backend Names                                          | Priority |
| ---------- | -------- | ------------------------------------------------------ | -------- |
| Ethereum   | 1        | `Ethereum`, `Ethereum Mainnet`, `ETH`                  | 1        |
| Base       | 8453     | `Base`, `Base Mainnet`                                 | 2        |
| Polygon    | 137      | `Polygon`, `Polygon POS`, `MATIC`                      | 3        |
| Arbitrum   | 42161    | `Arbitrum`, `Arbitrum One`, `ARB`                      | 4        |
| Optimism   | 10       | `Optimism`, `OP Mainnet`, `OP`                         | 5        |
| BSC        | 56       | `BSC`, `BNB Smart Chain`, `Binance Smart Chain`, `BNB` | 6        |
| Avalanche  | 43114    | `Avalanche`, `Avalanche C-Chain`, `AVAX`               | 7        |
| Celo       | 42220    | `Celo`, `CELO`                                         | 8        |

## 🛠️ Funciones Disponibles

El archivo `chains.ts` exporta varias funciones útiles:

### `getAllEnabledChains()`

Retorna todas las chains habilitadas para wagmi.

### `getBackendNameToChainMap()`

Mapeo de nombres del backend → chain objects.

### `getBackendNameToChainIdMap()`

Mapeo de nombres del backend → chain IDs.

### `findChainByBackendName(name)`

Busca una chain por nombre del backend.

### `findChainIdByBackendName(name)`

Busca un chain ID por nombre del backend.

### `getChainDebugInfo(name)`

Información de debug para troubleshooting.

## 🚨 Troubleshooting

Si una blockchain no funciona, revisa:

1. **¿Está en `SUPPORTED_CHAINS`?** - Debe estar agregada al array
2. **¿Está `enabled: true`?** - Debe estar habilitada
3. **¿Los nombres coinciden?** - Los `backendNames` deben incluir el nombre exacto que usa el backend
4. **¿Está importada?** - La chain debe estar importada de `wagmi/chains`

### Debug en Consola

La aplicación muestra warnings útiles en la consola del navegador:

```
⚠️ Unknown network: "Nombre Desconocido". {found: false, availableNames: [...]}
```

## 📝 Ejemplo Completo: Agregar Fantom

```typescript
// 1. Importar
import { fantom } from 'wagmi/chains';

// 2. Agregar a SUPPORTED_CHAINS
{
  chain: fantom,
  backendNames: ['Fantom', 'FTM', 'Fantom Opera'],
  enabled: true,
  priority: 9
}
```

¡Y eso es todo! Fantom estará disponible en toda la aplicación automáticamente.

## 🎯 Beneficios de esta Arquitectura

- ✅ **Un solo lugar** para agregar blockchains
- ✅ **No se olvida** actualizar archivos
- ✅ **Fácil mantenimiento** y debugging
- ✅ **Configuración flexible** (habilitar/deshabilitar, prioridades)
- ✅ **Nombres alternativos** para compatibilidad con backend
- ✅ **Type safety** con TypeScript
