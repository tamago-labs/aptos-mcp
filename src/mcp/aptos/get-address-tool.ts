import { z } from "zod";
import { AptosAgent } from "../../agent";
import { McpTool } from "../../types";

export const GetAddressTool: McpTool = {
    name: "aptos_get_address",
    description: "Get the wallet address",
    schema: {},
    handler: async (agent: AptosAgent, input: Record<string, any>) => {
        const address = await agent.getAddress();
        return {
            status: "success",
            address
        };
    },
}
