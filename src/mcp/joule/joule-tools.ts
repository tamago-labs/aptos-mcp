import { z } from "zod";
import { AptosAgent } from "../../agent";
import { McpTool } from "../../types";
import { listAllJoulePools } from "../../tools/joule/list-all-pools";

export const JouleLendTool: McpTool = {
    name: "aptos_joule_lend",
    description: "Lend tokens to Joule Finance to earn interest",
    schema: {
        amount: z.number().positive().describe("Amount to lend"),
        mint: z.string().describe("Token type to lend"),
        positionId: z.string().describe("Position ID (use 'new' for new position)"),
        newPosition: z.boolean().optional().default(false).describe("Whether to create a new position"),
        fungibleAsset: z.boolean().optional().default(false).describe("Whether token is a fungible asset")
    },
    handler: async (agent: AptosAgent, input: Record<string, any>) => {
        try {
            const result = await agent.jouleLend(
                input.amount,
                input.mint,
                input.positionId,
                input.newPosition,
                input.fungibleAsset
            );
            return {
                message: `Successfully lent ${input.amount} ${input.mint} to Joule Finance`,
                ...result
            };
        } catch (error: any) {
            throw new Error(`Failed to lend tokens: ${error.message}`)
        }
    }
};

export const JouleBorrowTool: McpTool = {
    name: "aptos_joule_borrow",
    description: "Borrow tokens from Joule Finance against collateral",
    schema: {
        amount: z.number().positive().describe("Amount to borrow"),
        mint: z.string().describe("Token type to borrow"),
        positionId: z.string().describe("Position ID to borrow from"),
        fungibleAsset: z.boolean().optional().default(false).describe("Whether token is a fungible asset")
    },
    handler: async (agent: AptosAgent, input: Record<string, any>) => {
        try {
            const result = await agent.jouleBorrow(
                input.amount,
                input.mint,
                input.positionId,
                input.fungibleAsset
            );
            return {
                message: `Successfully borrowed ${input.amount} ${input.mint} from Joule Finance`,
                hash: result
            };
        } catch (error: any) {
            throw new Error(`Failed to borrow tokens: ${error.message}`)
        }
    }
};

export const JouleRepayTool: McpTool = {
    name: "aptos_joule_repay",
    description: "Repay borrowed tokens to Joule Finance",
    schema: {
        amount: z.number().positive().describe("Amount to repay"),
        mint: z.string().describe("Token type to repay"),
        positionId: z.string().describe("Position ID to repay to"),
        fungibleAsset: z.boolean().optional().default(false).describe("Whether token is a fungible asset")
    },
    handler: async (agent: AptosAgent, input: Record<string, any>) => {
        try {
            const result = await agent.jouleRepay(
                input.amount,
                input.mint,
                input.positionId,
                input.fungibleAsset
            );
            return {
                message: `Successfully repaid ${input.amount} ${input.mint} to Joule Finance`,
                hash: result
            };
        } catch (error: any) {
            throw new Error(`Failed to repay tokens: ${error.message}`)
        }
    }
};

export const JouleWithdrawTool: McpTool = {
    name: "aptos_joule_withdraw",
    description: "Withdraw lent tokens from Joule Finance",
    schema: {
        amount: z.number().positive().describe("Amount to withdraw"),
        mint: z.string().describe("Token type to withdraw"),
        positionId: z.string().describe("Position ID to withdraw from"),
        fungibleAsset: z.boolean().optional().default(false).describe("Whether token is a fungible asset")
    },
    handler: async (agent: AptosAgent, input: Record<string, any>) => {
        try {
            const result = await agent.jouleWithdraw(
                input.amount,
                input.mint,
                input.positionId,
                input.fungibleAsset
            );
            return {
                message: `Successfully withdrew ${input.amount} ${input.mint} from Joule Finance`,
                hash: result
            };
        } catch (error: any) {
            throw new Error(`Failed to withdraw tokens: ${error.message}`)
        }
    }
};

export const JouleGetPositionTool: McpTool = {
    name: "aptos_joule_get_position",
    description: "Get details about a specific Joule Finance position",
    schema: {
        positionId: z.string().describe("Position ID to query")
    },
    handler: async (agent: AptosAgent, input: Record<string, any>) => {
        try {
            const result = await agent.jouleGetPosition(input.positionId);
            return {
                message: `Retrieved position details for ${input.positionId}`,
                position: result
            };
        } catch (error: any) {
            throw new Error(`Failed to get position: ${error.message}`)
        }
    }
};

export const JouleGetAllPositionsTool: McpTool = {
    name: "aptos_joule_get_all_positions",
    description: "Get all Joule Finance positions for the current user",
    schema: {},
    handler: async (agent: AptosAgent, input: Record<string, any>) => {
        try {
            const result = await agent.jouleGetAllPositions();
            return {
                message: `Retrieved ${result.length} positions`,
                positions: result
            };
        } catch (error: any) {
            throw new Error(`Failed to get positions: ${error.message}`)
        }
    }
};

export const JouleClaimRewardTool: McpTool = {
    name: "aptos_joule_claim_reward",
    description: "Claim lending rewards from Joule Finance",
    schema: {
        positionId: z.string().describe("Position ID to claim rewards from")
    },
    handler: async (agent: AptosAgent, input: Record<string, any>) => {
        try {
            const result = await agent.jouleClaimReward(input.positionId);
            return {
                message: `Successfully claimed rewards for position ${input.positionId}`,
                hash: result
            };
        } catch (error: any) {
            throw new Error(`Failed to claim rewards: ${error.message}`)
        }
    }
};

export const JouleListPoolsTool: McpTool = {
    name: "aptos_joule_list_pools",
    description: "List all available lending pools on Joule Finance with APY and liquidity information",
    schema: {},
    handler: async (agent: AptosAgent, input: Record<string, any>) => {
        try {
            const result = await listAllJoulePools();
            return {
                message: `Retrieved ${result.length} Joule Finance pools`,
                pools: result
            };
        } catch (error: any) {
            throw new Error(`Failed to list pools: ${error.message}`)
        }
    }
};
