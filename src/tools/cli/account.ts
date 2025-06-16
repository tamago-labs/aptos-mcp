import { executeAptosCommand } from './executor';

/**
 * Create a new Aptos account
 * @param accountName Optional account name/alias
 * @returns Result with the new account details
 */
export const createAccount = async (accountName?: string) => {
  const args = ['create'];
  if (accountName) {
    args.push('--account', accountName);
  }
  return executeAptosCommand('account', args);
};

/**
 * Get account information
 * @param accountAddress Account address to query
 * @returns Account information including sequence number, authentication key, etc.
 */
export const getAccountInfo = async (accountAddress: string) => {
  return executeAptosCommand('account', ['lookup-address', '--address', accountAddress]);
};

/**
 * List all accounts in the local configuration
 * @returns List of configured accounts
 */
export const listAccounts = async () => {
  return executeAptosCommand('account', ['list']);
};

/**
 * Get account resources
 * @param accountAddress Account address to query
 * @returns Account resources (coins, tokens, etc.)
 */
export const getAccountResources = async (accountAddress: string) => {
  return executeAptosCommand('account', ['list', '--query', 'resources', '--account', accountAddress]);
};

/**
 * Get account modules
 * @param accountAddress Account address to query
 * @returns Published modules on the account
 */
export const getAccountModules = async (accountAddress: string) => {
  return executeAptosCommand('account', ['list', '--query', 'modules', '--account', accountAddress]);
};

/**
 * Transfer APT between accounts
 * @param toAddress Recipient address
 * @param amount Amount to transfer (in Octas, 1 APT = 100,000,000 Octas)
 * @param fromAccount Optional sender account name (uses default if not specified)
 * @returns Transaction result
 */
export const transferAPT = async (toAddress: string, amount: number, fromAccount?: string) => {
  const args = ['transfer', '--account', toAddress, '--amount', amount.toString()];
  if (fromAccount) {
    args.push('--profile', fromAccount);
  }
  return executeAptosCommand('account', args);
};
