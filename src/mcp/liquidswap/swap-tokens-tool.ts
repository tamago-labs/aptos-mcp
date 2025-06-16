import { z } from "zod";
import { AptosAgent } from "../../agent";
import { McpTool } from "../../types";

export const SwapTokensTool: McpTool = {
    name: "aptos_swap_tokens",
    description: "Swap tokens using Liquidswap DEX",
    schema: {
        mintX: z.string().describe("Token type to swap from"),
        mintY: z.string().describe("Token type to swap to"),
        swapAmount: z.number().positive().describe("Amount to swap"),
        minCoinOut: z.number().optional().describe("Minimum amount to receive (slippage protection)")
    },
    handler: async (agent: AptosAgent, input: Record<string, any>) => {
        try {
            const result = await agent.swapTokens(
                input.mintX,
                input.mintY,
                input.swapAmount,
                input.minCoinOut || 0
            );
            return {
                message: `Successfully swapped ${input.swapAmount} tokens`,
                ...result
            };
        } catch (error: any) {
            throw new Error(`Failed to swap tokens: ${error.message}`)
        }
    }
};
