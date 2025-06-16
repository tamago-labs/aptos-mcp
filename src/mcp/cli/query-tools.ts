import { z } from "zod";
import { AptosAgent } from "../../agent";
import { McpTool } from "../../types";
import {
  getTransactionByHash,
  getTransactionByVersion,
  getAccountTransactions,
  simulateTransaction,
  getEventsByCreationNumber,
  getEventsByHandle
} from "../../tools/cli/query";

export const GetTransactionByHashTool: McpTool = {
  name: "aptos_cli_get_transaction_by_hash",
  description: "Get transaction by hash using CLI",
  schema: {
    transactionHash: z.string().describe("Transaction hash to query")
  },
  handler: async (agent: AptosAgent, input: Record<string, any>) => {
    const result = await getTransactionByHash(input.transactionHash);
    
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

export const GetTransactionByVersionTool: McpTool = {
  name: "aptos_cli_get_transaction_by_version",
  description: "Get transaction by version number",
  schema: {
    version: z.number().describe("Transaction version number")
  },
  handler: async (agent: AptosAgent, input: Record<string, any>) => {
    const result = await getTransactionByVersion(input.version);
    
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

export const GetAccountTransactionsTool: McpTool = {
  name: "aptos_cli_get_account_transactions",
  description: "Get account transaction history",
  schema: {
    accountAddress: z.string().describe("Account address"),
    limit: z.number().optional().describe("Maximum number of transactions to return"),
    start: z.number().optional().describe("Starting transaction sequence number")
  },
  handler: async (agent: AptosAgent, input: Record<string, any>) => {
    const result = await getAccountTransactions(input.accountAddress, {
      limit: input.limit,
      start: input.start
    });
    
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

export const SimulateTransactionTool: McpTool = {
  name: "aptos_cli_simulate_transaction",
  description: "Simulate a transaction without executing it",
  schema: {
    sender: z.string().describe("Sender address"),
    functionId: z.string().describe("Function to call"),
    functionArgs: z.array(z.string()).optional().describe("Function arguments"),
    typeArgs: z.array(z.string()).optional().describe("Type arguments"),
    maxGas: z.number().optional().describe("Maximum gas to spend")
  },
  handler: async (agent: AptosAgent, input: Record<string, any>) => {
    const result = await simulateTransaction(
      input.sender,
      input.functionId,
      input.functionArgs,
      {
        typeArgs: input.typeArgs,
        maxGas: input.maxGas
      }
    );
    
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

export const GetEventsByCreationNumberTool: McpTool = {
  name: "aptos_cli_get_events_by_creation_number",
  description: "Get events by creation number",
  schema: {
    accountAddress: z.string().describe("Account that created the events"),
    creationNumber: z.number().describe("Event creation number"),
    limit: z.number().optional().describe("Maximum number of events to return"),
    start: z.number().optional().describe("Starting event sequence number")
  },
  handler: async (agent: AptosAgent, input: Record<string, any>) => {
    const result = await getEventsByCreationNumber(
      input.accountAddress,
      input.creationNumber,
      {
        limit: input.limit,
        start: input.start
      }
    );
    
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

export const GetEventsByHandleTool: McpTool = {
  name: "aptos_cli_get_events_by_handle",
  description: "Get events by event handle",
  schema: {
    accountAddress: z.string().describe("Account address"),
    eventHandle: z.string().describe("Event handle (struct type)"),
    fieldName: z.string().describe("Field name within the struct"),
    limit: z.number().optional().describe("Maximum number of events to return"),
    start: z.number().optional().describe("Starting event sequence number")
  },
  handler: async (agent: AptosAgent, input: Record<string, any>) => {
    const result = await getEventsByHandle(
      input.accountAddress,
      input.eventHandle,
      input.fieldName,
      {
        limit: input.limit,
        start: input.start
      }
    );
    
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
