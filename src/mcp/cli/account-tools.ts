import { z } from "zod";
import { AptosAgent } from "../../agent";
import { McpTool } from "../../types";
import { 
  createAccount, 
  fundAccount, 
  getAccountInfo, 
  listAccounts, 
  getAccountResources,
  getAccountModules,
  transferAPT
} from "../../tools/cli/account";

export const CreateAccountTool: McpTool = {
  name: "aptos_cli_create_account",
  description: "Create a new Aptos account using CLI",
  schema: {
    accountName: z.string().optional().describe("Optional account name/alias")
  },
  handler: async (agent: AptosAgent, input: Record<string, any>) => {
    const result = await createAccount(input.accountName);
    
    if (!result.success) {
      return {
        status: "error",
        message: result.stderr
      };
    }
    
    return {
      status: "success",
      output: result.stdout,
      parsed: result.parsed
    };
  },
};

export const FundAccountTool: McpTool = {
  name: "aptos_cli_fund_account",
  description: "Fund an account with test APT (testnet/devnet only)",
  schema: {
    accountAddress: z.string().describe("Account address to fund"),
    amount: z.number().optional().describe("Amount of APT to fund (default: 100000000 = 1 APT)")
  },
  handler: async (agent: AptosAgent, input: Record<string, any>) => {
    const result = await fundAccount(input.accountAddress, input.amount);
    
    if (!result.success) {
      return {
        status: "error",
        message: result.stderr
      };
    }
    
    return {
      status: "success",
      output: result.stdout,
      parsed: result.parsed
    };
  },
};

export const GetAccountInfoTool: McpTool = {
  name: "aptos_cli_get_account_info",
  description: "Get account information including sequence number and authentication key",
  schema: {
    accountAddress: z.string().describe("Account address to query")
  },
  handler: async (agent: AptosAgent, input: Record<string, any>) => {
    const result = await getAccountInfo(input.accountAddress);
    
    if (!result.success) {
      return {
        status: "error",
        message: result.stderr
      };
    }
    
    return {
      status: "success",
      output: result.stdout,
      parsed: result.parsed
    };
  },
};

export const ListAccountsTool: McpTool = {
  name: "aptos_cli_list_accounts",
  description: "List all accounts in the local configuration",
  schema: {},
  handler: async (agent: AptosAgent, input: Record<string, any>) => {
    const result = await listAccounts();
    
    if (!result.success) {
      return {
        status: "error",
        message: result.stderr
      };
    }
    
    return {
      status: "success",
      output: result.stdout,
      parsed: result.parsed
    };
  },
};

export const GetAccountResourcesTool: McpTool = {
  name: "aptos_cli_get_account_resources",
  description: "Get account resources (coins, tokens, etc.)",
  schema: {
    accountAddress: z.string().describe("Account address to query")
  },
  handler: async (agent: AptosAgent, input: Record<string, any>) => {
    const result = await getAccountResources(input.accountAddress);
    
    if (!result.success) {
      return {
        status: "error",
        message: result.stderr
      };
    }
    
    return {
      status: "success",
      output: result.stdout,
      parsed: result.parsed
    };
  },
};

export const GetAccountModulesTool: McpTool = {
  name: "aptos_cli_get_account_modules",
  description: "Get published modules on an account",
  schema: {
    accountAddress: z.string().describe("Account address to query")
  },
  handler: async (agent: AptosAgent, input: Record<string, any>) => {
    const result = await getAccountModules(input.accountAddress);
    
    if (!result.success) {
      return {
        status: "error",
        message: result.stderr
      };
    }
    
    return {
      status: "success",
      output: result.stdout,
      parsed: result.parsed
    };
  },
};

export const TransferAPTTool: McpTool = {
  name: "aptos_cli_transfer_apt",
  description: "Transfer APT between accounts using CLI",
  schema: {
    toAddress: z.string().describe("Recipient address"),
    amount: z.number().positive().describe("Amount to transfer (in Octas, 1 APT = 100,000,000 Octas)"),
    fromAccount: z.string().optional().describe("Sender account name (uses default if not specified)")
  },
  handler: async (agent: AptosAgent, input: Record<string, any>) => {
    const result = await transferAPT(input.toAddress, input.amount, input.fromAccount);
    
    if (!result.success) {
      return {
        status: "error",
        message: result.stderr
      };
    }
    
    return {
      status: "success",
      output: result.stdout,
      parsed: result.parsed
    };
  },
};
