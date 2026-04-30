const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);
config.resolver.blockList = [/\.cache\/openid-client\/.*/, /expo-auth-session_tmp_.*/];
module.exports = config;
