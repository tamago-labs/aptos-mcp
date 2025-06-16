import { z } from "zod";
import { AptosAgent } from "../../agent";
import { McpTool } from "../../types";

export const GetBalanceTool: McpTool = {
    name: "aptos_get_balance",
    description: "Get the balance of APT or a specific token",
    schema: {
        mint: z.string().optional().describe("Token type to check balance for. If omitted, returns APT balance")
    },
    handler: async (agent: AptosAgent, input: Record<string, any>) => {
        const balance = await agent.getBalance(input?.mint);
        return {
            status: "success",
            balance
        };
    },
}
