import { z } from "zod";
import { AptosAgent } from "../../agent";
import { McpTool } from "../../types";

export const StakeAPTTool: McpTool = {
    name: "aptos_stake_apt",
    description: "Stake APT with a validator",
    schema: {
        validatorAddress: z.string().describe("Validator address to stake with"),
        amount: z.number().positive().describe("Amount of APT to stake")
    },
    handler: async (agent: AptosAgent, input: Record<string, any>) => {
        try {
            const result = await agent.stakeAPT(
                input.validatorAddress,
                input.amount
            );
            return {
                message: `Successfully staked ${input.amount} APT with validator ${input.validatorAddress}`,
                ...result
            };
        } catch (error: any) {
            throw new Error(`Failed to stake APT: ${error.message}`)
        }
    }
};

export const UnstakeAPTTool: McpTool = {
    name: "aptos_unstake_apt",
    description: "Unstake APT from a validator",
    schema: {
        validatorAddress: z.string().describe("Validator address to unstake from"),
        amount: z.number().positive().describe("Amount of APT to unstake")
    },
    handler: async (agent: AptosAgent, input: Record<string, any>) => {
        try {
            const result = await agent.unstakeAPT(
                input.validatorAddress,
                input.amount
            );
            return {
                message: `Successfully unstaked ${input.amount} APT from validator ${input.validatorAddress}`,
                ...result
            };
        } catch (error: any) {
            throw new Error(`Failed to unstake APT: ${error.message}`)
        }
    }
};
