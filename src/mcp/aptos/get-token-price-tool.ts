import { z } from "zod";
import { AptosAgent } from "../../agent";
import { McpTool } from "../../types";

export const GetTokenPriceTool: McpTool = {
    name: "aptos_get_token_price",
    description: "Get the price of a token",
    schema: {
        query: z.string().describe("Token symbol or name to get price for")
    },
    handler: async (agent: AptosAgent, input: Record<string, any>) => {
        try {
            const result = await agent.getTokenPrice(input.query);
            return {
                status: "success",
                price: result
            };
        } catch (error: any) {
            throw new Error(`Failed to get token price: ${error.message}`)
        }
    }
};
