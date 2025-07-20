# 🔗 Configuración de Blockchains

Esta aplicación usa una configuración centralizada para manejar todas las blockchains soportadas. Actualmente solo soporta **Celo** y **Celo Alfajores**.

## 📁 Archivo Principal: `src/config/chains.ts`

Toda la configuración de blockchains está centralizada en este archivo. Para agregar una nueva blockchain, solo necesitas modificar este archivo.

## ✅ Blockchains Actualmente Soportadas

| Blockchain     | Chain ID | Backend Names                                 | Priority |
| -------------- | -------- | --------------------------------------------- | -------- |
| Celo           | 42220    | `Celo`, `CELO`, `Celo Mainnet`                | 1        |
| Celo Alfajores | 44787    | `Celo Alfajores`, `Alfajores`, `Celo Testnet` | 2        |

## 🔧 Configuración por Blockchain

Cada blockchain tiene estas propiedades:

### `chain: Chain`

El objeto chain de wagmi (ej: `celo`) o definido manualmente (ej: `celoAlfajores`)

### `backendNames: string[]`

Lista de nombres que puede usar el backend para referirse a esta blockchain:

- Nombre oficial
- Nombres alternativos
- Abreviaciones
- Variaciones comunes

**Ejemplo para Celo:**

```typescript
backendNames: ["Celo", "CELO", "Celo Mainnet"];
```

### `enabled: boolean`

Si la blockchain está activa. Para desactivar temporalmente una red:

```typescript
enabled: false;
```

### `priority: number`

Orden en dropdowns. Número más bajo = mayor prioridad.

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
4. **¿Está importada?** - La chain debe estar importada de `wagmi/chains` o definida manualmente

### Debug en Consola

La aplicación muestra warnings útiles en la consola del navegador:

```
⚠️ Unknown network: "Nombre Desconocido". {found: false, availableNames: [...]}
```

## 📝 Ejemplo: Celo Alfajores

Celo Alfajores no está disponible en `wagmi/chains`, por lo que se define manualmente:

```typescript
// Definir Celo Alfajores manualmente
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

// Agregar a SUPPORTED_CHAINS
{
  chain: celoAlfajores,
  backendNames: ['Celo Alfajores', 'Alfajores', 'Celo Testnet'],
  enabled: true,
  priority: 2
}
```

## 🎯 Beneficios de esta Arquitectura

- ✅ **Un solo lugar** para agregar blockchains
- ✅ **No se olvida** actualizar archivos
- ✅ **Fácil mantenimiento** y debugging
- ✅ **Configuración flexible** (habilitar/deshabilitar, prioridades)
- ✅ **Nombres alternativos** para compatibilidad con backend
- ✅ **Type safety** con TypeScript
- ✅ **Soporte para chains personalizadas** (como Celo Alfajores)
