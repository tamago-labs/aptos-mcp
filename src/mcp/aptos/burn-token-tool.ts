import { z } from "zod";
import { AptosAgent } from "../../agent";
import { McpTool } from "../../types";

export const BurnTokenTool: McpTool = {
    name: "aptos_burn_token",
    description: "Burn tokens from your account",
    schema: {
        amount: z.number().positive().describe("Amount to burn"),
        mint: z.string().describe("Token type to burn")
    },
    handler: async (agent: AptosAgent, input: Record<string, any>) => {
        try {
            const result = await agent.burnToken(
                input.amount,
                input.mint
            );
            return {
                message: `Successfully burned ${input.amount} tokens`,
                ...result
            };
        } catch (error: any) {
            throw new Error(`Failed to burn tokens: ${error.message}`)
        }
    }
};
