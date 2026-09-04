

import js from "@eslint/js";
import globals from "globals";

export default [
  // Ignorados de la config plana
  {
    ignores: [
      "node_modules/**",
      "Baileys-master/**",
      "build/**", // si no quieres analizar la salida compilada
      "tmp/**",
      "temp/**"
    ]
  },
  
  // Configuración base
  js.configs.recommended,
  
  // Sobrescritura de configuración personalizada
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node, // globales integradas de Node.js (process, __dirname, etc.)
      },
    },
    rules: {
      // 🔥 Reglas de seguridad async
      "require-await": "error", // Atrapa funciones async sueltas que retornan promesas
      "no-async-promise-executor": "warn",

      // 🔥 Prevención de bugs
      "no-undef": "error", // Manten esto para atrapar bugs REALES
      
      // Reglas agresivas de formato/estilo deshabilitadas
      "no-irregular-whitespace": "off", 
      "no-unused-vars": "off", 
      "no-empty": "off",
      "no-useless-catch": "off",
      "no-unreachable": "off",
      "no-case-declarations": "off",
      "no-self-assign": "off",
      "no-useless-escape": "off",
      "no-implicit-globals": "off", 
    },
  }
];