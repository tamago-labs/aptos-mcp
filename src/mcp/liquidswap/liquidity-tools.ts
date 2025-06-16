import { z } from "zod";
import { AptosAgent } from "../../agent";
import { McpTool } from "../../types";

export const AddLiquidityTool: McpTool = {
    name: "aptos_add_liquidity",
    description: "Add liquidity to a Liquidswap pool",
    schema: {
        mintX: z.string().describe("Token type for first asset"),
        mintY: z.string().describe("Token type for second asset"),
        mintXAmount: z.number().positive().describe("Amount of first token to add"),
        mintYAmount: z.number().positive().describe("Amount of second token to add")
    },
    handler: async (agent: AptosAgent, input: Record<string, any>) => {
        try {
            const result = await agent.addLiquidity(
                input.mintX,
                input.mintY,
                input.mintXAmount,
                input.mintYAmount
            );
            return {
                message: `Successfully added liquidity: ${input.mintXAmount} ${input.mintX} + ${input.mintYAmount} ${input.mintY}`,
                hash: result
            };
        } catch (error: any) {
            throw new Error(`Failed to add liquidity: ${error.message}`)
        }
    }
};

export const RemoveLiquidityTool: McpTool = {
    name: "aptos_remove_liquidity",
    description: "Remove liquidity from a Liquidswap pool",
    schema: {
        mintX: z.string().describe("Token type for first asset"),
        mintY: z.string().describe("Token type for second asset"),
        lpAmount: z.number().positive().describe("Amount of LP tokens to burn")
    },
    handler: async (agent: AptosAgent, input: Record<string, any>) => {
        try {
            const result = await agent.removeLiquidity(
                input.mintX,
                input.mintY,
                input.lpAmount
            );
            return {
                message: `Successfully removed liquidity: ${input.lpAmount} LP tokens`,
                hash: result
            };
        } catch (error: any) {
            throw new Error(`Failed to remove liquidity: ${error.message}`)
        }
    }
};

export const CreatePoolTool: McpTool = {
    name: "aptos_create_pool",
    description: "Create a new liquidity pool on Liquidswap",
    schema: {
        mintX: z.string().describe("Token type for first asset"),
        mintY: z.string().describe("Token type for second asset")
    },
    handler: async (agent: AptosAgent, input: Record<string, any>) => {
        try {
            const result = await agent.createPool(
                input.mintX,
                input.mintY
            );
            return {
                message: `Successfully created pool for ${input.mintX} / ${input.mintY}`,
                hash: result
            };
        } catch (error: any) {
            throw new Error(`Failed to create pool: ${error.message}`)
        }
    }
};
