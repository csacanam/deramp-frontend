// Función para interpolar variables en strings de traducción
// Ejemplo: interpolate("Necesitas {required} {symbol}", { required: "100", symbol: "USDC" })
// Resultado: "Necesitas 100 USDC"
export const interpolate = (template: string, variables: Record<string, string | number>): string => {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return variables[key]?.toString() || match;
  });
};

// Función para acceder a propiedades anidadas de forma segura
// Ejemplo: getNestedProperty(t, "balance.insufficient") 
export const getNestedProperty = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}; 