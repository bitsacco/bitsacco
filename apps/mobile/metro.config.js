const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

// Find the project and workspace directories
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [workspaceRoot];

// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// 3. Add support for resolving modules from the workspace
config.resolver.disableHierarchicalLookup = false;

// 4. Add polyfills for Node.js modules
config.resolver.alias = {
  buffer: "buffer",
  stream: "readable-stream", 
  crypto: "crypto-browserify",
  url: "url",
  "node:buffer": "buffer",
  "node:crypto": "crypto-browserify",
  "node:stream": "readable-stream",
  "node:url": "url",
};

// 5. Force Metro to resolve certain extensions
config.resolver.sourceExts = [...config.resolver.sourceExts, "cjs", "svg"];

// 6. Remove svg from assetExts
config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== "svg");

// 7. Use react-native-svg-transformer for svg files
config.transformer.babelTransformerPath = require.resolve("react-native-svg-transformer");

// 6. Add global polyfills
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

module.exports = config;