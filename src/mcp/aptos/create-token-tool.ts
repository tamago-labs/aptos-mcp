import { z } from "zod";
import { AptosAgent } from "../../agent";
import { McpTool } from "../../types";

export const CreateTokenTool: McpTool = {
    name: "aptos_create_token",
    description: "Create a new token on Aptos",
    schema: {
        name: z.string().describe("Token name"),
        symbol: z.string().describe("Token symbol"),
        iconURI: z.string().optional().describe("Icon URI"),
        projectURI: z.string().optional().describe("Project URI")
    },
    handler: async (agent: AptosAgent, input: Record<string, any>) => {
        try {
            const result = await agent.createToken(
                input.name,
                input.symbol,
                input.iconURI || "",
                input.projectURI || ""
            );
            return {
                message: `Successfully created token ${input.name} (${input.symbol})`,
                ...result
            };
        } catch (error: any) {
            throw new Error(`Failed to create token: ${error.message}`)
        }
    }
};
