import { executeAptosCommand } from './executor';

/**
 * Get current network configuration
 * @returns Current network configuration
 */
export const getCurrentNetwork = async () => {
  return executeAptosCommand('config', ['show-profiles']);
};

/**
 * Set the current network
 * @param network Network name (mainnet, testnet, devnet, or custom URL)
 * @param profile Optional profile name
 * @returns Result of network configuration
 */
export const setNetwork = async (network: string, profile?: string) => {
  const args = ['set-global-config', '--network', network];
  if (profile) {
    args.push('--profile', profile);
  }
  return executeAptosCommand('config', args);
};

/**
 * Initialize Aptos configuration
 * @param network Network to connect to
 * @param profile Profile name
 * @param privateKey Optional private key
 * @returns Initialization result
 */
export const initConfig = async (
  network: string = 'testnet',
  profile: string = 'default',
  privateKey?: string
) => {
  const args = ['init', '--network', network];
  if (profile !== 'default') {
    args.push('--profile', profile);
  }
  if (privateKey) {
    args.push('--private-key', privateKey);
  }
  return executeAptosCommand('config', args);
};

/**
 * List all profiles
 * @returns List of configured profiles
 */
export const listProfiles = async () => {
  return executeAptosCommand('config', ['show-profiles']);
};

/**
 * Switch to a different profile
 * @param profileName Profile name to switch to
 * @returns Switch result
 */
export const switchProfile = async (profileName: string) => {
  return executeAptosCommand('config', ['switch-profile', '--profile', profileName]);
};

/**
 * Show global configuration
 * @returns Global configuration settings
 */
export const showGlobalConfig = async () => {
  return executeAptosCommand('config', ['show-global-config']);
};

/**
 * Get node information
 * @param nodeUrl Optional node URL (uses configured network if not provided)
 * @returns Node information including chain ID, version, etc.
 */
export const getNodeInfo = async (nodeUrl?: string) => {
  const args = ['node', 'show'];
  if (nodeUrl) {
    args.push('--url', nodeUrl);
  }
  return executeAptosCommand('info', args);
};

/**
 * Get ledger information
 * @returns Current ledger information
 */
export const getLedgerInfo = async () => {
  return executeAptosCommand('info', ['show-ledger-info']);
};

/**
 * Get network peers information
 * @returns Network peers information
 */
export const getNetworkPeers = async () => {
  return executeAptosCommand('info', ['show-peers']);
};
