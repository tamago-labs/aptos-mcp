import { executeAptosCommand } from './executor';

/**
 * Initialize a new Move package
 * @param packageName Name of the package
 * @param path Directory path where to create the package
 * @returns Result of package initialization
 */
export const initMovePackage = async (packageName: string, path?: string) => {
  const args = ['init', '--name', packageName];
  if (path) {
    args.push('--package-dir', path);
  }
  return executeAptosCommand('move', args);
};

/**
 * Compile a Move package
 * @param packagePath Path to the Move package
 * @param options Compilation options
 * @returns Compilation result
 */
export const compileMovePackage = async (
  packagePath: string, 
  options: { 
    dev?: boolean, 
    test?: boolean,
    namedAddresses?: Record<string, string>
  } = {}
) => {
  const args = ['compile'];
  
  if (packagePath && packagePath !== '.') {
    args.push('--package-dir', packagePath);
  }
  
  if (options.dev) {
    args.push('--dev');
  }
  
  if (options.test) {
    args.push('--test');
  }
  
  if (options.namedAddresses) {
    for (const [name, address] of Object.entries(options.namedAddresses)) {
      args.push('--named-addresses', `${name}=${address}`);
    }
  }
  
  return executeAptosCommand('move', args);
};

/**
 * Test a Move package
 * @param packagePath Path to the Move package
 * @param options Test options
 * @returns Test results
 */
export const testMovePackage = async (
  packagePath: string,
  options: {
    filter?: string,
    coverage?: boolean,
    namedAddresses?: Record<string, string>
  } = {}
) => {
  const args = ['test'];
  
  if (packagePath && packagePath !== '.') {
    args.push('--package-dir', packagePath);
  }
  
  if (options.filter) {
    args.push('--filter', options.filter);
  }
  
  if (options.coverage) {
    args.push('--coverage');
  }
  
  if (options.namedAddresses) {
    for (const [name, address] of Object.entries(options.namedAddresses)) {
      args.push('--named-addresses', `${name}=${address}`);
    }
  }
  
  return executeAptosCommand('move', args);
};

/**
 * Publish a Move package
 * @param packagePath Path to the Move package
 * @param options Publishing options
 * @returns Publishing result with package address
 */
export const publishMovePackage = async (
  packagePath: string,
  options: {
    namedAddresses?: Record<string, string>,
    maxGas?: number,
    profile?: string
  } = {}
) => {
  const args = ['publish'];
  
  if (packagePath && packagePath !== '.') {
    args.push('--package-dir', packagePath);
  }
  
  if (options.namedAddresses) {
    for (const [name, address] of Object.entries(options.namedAddresses)) {
      args.push('--named-addresses', `${name}=${address}`);
    }
  }
  
  if (options.maxGas) {
    args.push('--max-gas', options.maxGas.toString());
  }
  
  if (options.profile) {
    args.push('--profile', options.profile);
  }
  
  return executeAptosCommand('move', args);
};

/**
 * Run a Move function
 * @param functionId Function identifier (address::module::function)
 * @param args Function arguments
 * @param options Execution options
 * @returns Function execution result
 */
export const runMoveFunction = async (
  functionId: string,
  functionArgs: string[] = [],
  options: {
    typeArgs?: string[],
    profile?: string,
    maxGas?: number
  } = {}
) => {
  const args = ['run', '--function-id', functionId];
  
  if (functionArgs.length > 0) {
    args.push('--args');
    args.push(...functionArgs);
  }
  
  if (options.typeArgs && options.typeArgs.length > 0) {
    args.push('--type-args');
    args.push(...options.typeArgs);
  }
  
  if (options.profile) {
    args.push('--profile', options.profile);
  }
  
  if (options.maxGas) {
    args.push('--max-gas', options.maxGas.toString());
  }
  
  return executeAptosCommand('move', args);
};

/**
 * Clean Move package build artifacts
 * @param packagePath Path to the Move package
 * @returns Cleanup result
 */
export const cleanMovePackage = async (packagePath: string) => {
  const args = ['clean'];
  if (packagePath && packagePath !== '.') {
    args.push('--package-dir', packagePath);
  }
  return executeAptosCommand('move', args);
};

/**
 * Download a Move package's dependencies
 * @param packagePath Path to the Move package
 * @returns Download result
 */
export const downloadMoveDependencies = async (packagePath: string) => {
  const args = ['download'];
  if (packagePath && packagePath !== '.') {
    args.push('--package-dir', packagePath);
  }
  return executeAptosCommand('move', args);
};

/**
 * Prove Move package (formal verification)
 * @param packagePath Path to the Move package
 * @param options Proving options
 * @returns Proof result
 */
export const proveMovePackage = async (
  packagePath: string,
  options: {
    namedAddresses?: Record<string, string>
  } = {}
) => {
  const args = ['prove'];
  
  if (packagePath && packagePath !== '.') {
    args.push('--package-dir', packagePath);
  }
  
  if (options.namedAddresses) {
    for (const [name, address] of Object.entries(options.namedAddresses)) {
      args.push('--named-addresses', `${name}=${address}`);
    }
  }
  
  return executeAptosCommand('move', args);
};
