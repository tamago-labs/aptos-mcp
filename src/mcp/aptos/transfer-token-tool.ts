import { z } from "zod";
import { AptosAgent } from "../../agent";
import { McpTool } from "../../types";

export const TransferTokenTool: McpTool = {
    name: "aptos_transfer_token",
    description: "Transfer APT or tokens to another address",
    schema: {
        to: z.string().describe("Recipient's address"),
        amount: z.number().positive().describe("Amount to transfer"),
        mint: z.string().optional().describe("Token type to transfer (defaults to APT)")
    },
    handler: async (agent: AptosAgent, input: Record<string, any>) => {
        try {
            const result = await agent.transferToken(
                input.to, 
                input.amount, 
                input.mint || "0x1::aptos_coin::AptosCoin"
            );
            return {
                message: `Successfully transferred ${input.amount} tokens to ${input.to}`,
                ...result
            };
        } catch (error: any) {
            throw new Error(`Failed to transfer tokens: ${error.message}`)
        }
    }
};
