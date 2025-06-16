import { executeAptosCommand } from './executor';

/**
 * Get transaction by hash
 * @param transactionHash Transaction hash to query
 * @returns Transaction details
 */
export const getTransactionByHash = async (transactionHash: string) => {
  return executeAptosCommand('transaction', ['show', '--transaction-hash', transactionHash]);
};

/**
 * Get transaction by version
 * @param version Transaction version number
 * @returns Transaction details
 */
export const getTransactionByVersion = async (version: number) => {
  return executeAptosCommand('transaction', ['show', '--version', version.toString()]);
};

/**
 * Get account transactions
 * @param accountAddress Account address
 * @param options Query options
 * @returns Account transaction history
 */
export const getAccountTransactions = async (
  accountAddress: string,
  options: {
    limit?: number,
    start?: number
  } = {}
) => {
  const args = ['show', '--account', accountAddress];
  
  if (options.limit) {
    args.push('--limit', options.limit.toString());
  }
  
  if (options.start) {
    args.push('--start', options.start.toString());
  }
  
  return executeAptosCommand('transaction', args);
};

/**
 * Simulate a transaction
 * @param sender Sender address
 * @param functionId Function to call
 * @param functionArgs Function arguments
 * @param options Simulation options
 * @returns Simulation result
 */
export const simulateTransaction = async (
  sender: string,
  functionId: string,
  functionArgs: string[] = [],
  options: {
    typeArgs?: string[],
    maxGas?: number
  } = {}
) => {
  const args = ['simulate', '--sender', sender, '--function-id', functionId];
  
  if (functionArgs.length > 0) {
    args.push('--args');
    args.push(...functionArgs);
  }
  
  if (options.typeArgs && options.typeArgs.length > 0) {
    args.push('--type-args');
    args.push(...options.typeArgs);
  }
  
  if (options.maxGas) {
    args.push('--max-gas', options.maxGas.toString());
  }
  
  return executeAptosCommand('transaction', args);
};

/**
 * Get events by creation number
 * @param accountAddress Account that created the events
 * @param creationNumber Event creation number
 * @param options Query options
 * @returns Events data
 */
export const getEventsByCreationNumber = async (
  accountAddress: string,
  creationNumber: number,
  options: {
    limit?: number,
    start?: number
  } = {}
) => {
  const args = ['show', '--account', accountAddress, '--creation-number', creationNumber.toString()];
  
  if (options.limit) {
    args.push('--limit', options.limit.toString());
  }
  
  if (options.start) {
    args.push('--start', options.start.toString());
  }
  
  return executeAptosCommand('event', args);
};

/**
 * Get events by event handle
 * @param accountAddress Account address
 * @param eventHandle Event handle (struct type)
 * @param fieldName Field name within the struct
 * @param options Query options
 * @returns Events data
 */
export const getEventsByHandle = async (
  accountAddress: string,
  eventHandle: string,
  fieldName: string,
  options: {
    limit?: number,
    start?: number
  } = {}
) => {
  const args = [
    'show', 
    '--account', accountAddress,
    '--event-handle', eventHandle,
    '--field-name', fieldName
  ];
  
  if (options.limit) {
    args.push('--limit', options.limit.toString());
  }
  
  if (options.start) {
    args.push('--start', options.start.toString());
  }
  
  return executeAptosCommand('event', args);
};
