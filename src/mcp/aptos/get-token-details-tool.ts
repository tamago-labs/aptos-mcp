import { z } from "zod";
import { AptosAgent } from "../../agent";
import { McpTool } from "../../types";

export const GetTokenDetailsTool: McpTool = {
    name: "aptos_get_token_details",
    description: "Get details of a token",
    schema: {
        tokenAddress: z.string().describe("Token address")
    },
    handler: async (agent: AptosAgent, input: Record<string, any>) => {
        try {
            const result = await agent.getTokenDetails(input.tokenAddress);
            return {
                status: "success",
                tokenDetails: result
            };
        } catch (error: any) {
            throw new Error(`Failed to get token details: ${error.message}`)
        }
    }
};
