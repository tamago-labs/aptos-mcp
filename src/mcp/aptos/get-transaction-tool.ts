import { z } from "zod";
import { AptosAgent } from "../../agent";
import { McpTool } from "../../types";

export const GetTransactionTool: McpTool = {
    name: "aptos_get_transaction",
    description: "Get transaction details by hash",
    schema: {
        hash: z.string().describe("Transaction hash")
    },
    handler: async (agent: AptosAgent, input: Record<string, any>) => {
        try {
            const result = await agent.getTransaction(input.hash);
            return {
                status: "success",
                transaction: result
            };
        } catch (error: any) {
            throw new Error(`Failed to get transaction: ${error.message}`)
        }
    }
};
