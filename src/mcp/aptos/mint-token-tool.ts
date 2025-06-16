import { z } from "zod";
import { AptosAgent } from "../../agent";
import { McpTool } from "../../types";

export const MintTokenTool: McpTool = {
    name: "aptos_mint_token",
    description: "Mint tokens to an address",
    schema: {
        to: z.string().describe("Recipient's address"),
        mint: z.string().describe("Token type to mint"),
        amount: z.number().positive().describe("Amount to mint")
    },
    handler: async (agent: AptosAgent, input: Record<string, any>) => {
        try {
            const result = await agent.mintToken(
                input.to,
                input.mint,
                input.amount
            );
            return {
                message: `Successfully minted ${input.amount} tokens to ${input.to}`,
                ...result
            };
        } catch (error: any) {
            throw new Error(`Failed to mint tokens: ${error.message}`)
        }
    }
};
