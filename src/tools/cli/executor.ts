import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface CliResult {
  stdout: string;
  stderr: string;
  success: boolean;
  parsed?: any;
}

/**
 * Executes an Aptos CLI command
 * @param command The main Aptos command (account, move, config, etc.)
 * @param args Array of arguments to pass to the command
 * @returns Result of the command execution
 */
export const executeAptosCommand = async (
  command: string,
  args: string[]
): Promise<CliResult> => {
  try {
    // Sanitize inputs to prevent command injection
    const sanitizedArgs = args.map(arg => {
      // Basic sanitization - more robust in production
      return arg.replace(/[;&|`$]/g, '');
    });
    
    const fullCommand = `aptos ${command} ${sanitizedArgs.join(' ')}`; 
    
    const { stdout, stderr } = await execAsync(fullCommand);
    
    // Try to parse JSON if applicable
    let parsed = undefined;
    if (stdout.trim().startsWith('{') || stdout.trim().startsWith('[')) {
      try {
        parsed = JSON.parse(stdout);
      } catch (e) {
        // Not valid JSON, ignore
      }
    }
    
    return {
      stdout,
      stderr,
      success: true,
      parsed
    };
  } catch (error: any) {
    console.error('Error executing Aptos command:', error);
    return {
      stdout: '',
      stderr: error.message || 'Unknown error executing CLI command',
      success: false
    };
  }
};
