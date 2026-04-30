const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);
config.resolver.blockList = [
  /\.cache\/openid-client\/.*/,
  /expo-auth-session_tmp_.*/,
  /openai_tmp_\d+\/.*/,
];
module.exports = config;
