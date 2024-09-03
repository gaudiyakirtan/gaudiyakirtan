module.exports = function (api) {
  api.cache(true)
  return {
    presets: [['babel-preset-expo', { jsxRuntime: 'automatic' }]],
    plugins: [
      'react-native-reanimated/plugin',
      'nativewind/babel',
      // 'expo-router/babel', // Removed -- expo-router/babel is deprecated in favor of babel-preset-expo in SDK 50. To fix the issue, remove "expo-router/babel" from "plugins" in your babel.config.js file
    ],
  }
}
