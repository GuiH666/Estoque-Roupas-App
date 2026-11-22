// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    // Regras novas do React Compiler (eslint-plugin-react-hooks) que apontam o padrão
    // `useRef(new Animated.Value(0)).current` e setState dentro de useEffect.
    // Esse é o padrão usual de animação do React Native e funciona normalmente; desligadas
    // até as animações serem migradas (ex.: useSharedValue do Reanimated).
    rules: {
      'react-hooks/refs': 'off',
      'react-hooks/set-state-in-effect': 'off',
    },
  },
]);
