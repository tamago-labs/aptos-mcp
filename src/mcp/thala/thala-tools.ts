import { z } from "zod";
import { AptosAgent } from "../../agent";
import { McpTool } from "../../types";

export const ThalaStakeTool: McpTool = {
    name: "aptos_thala_stake",
    description: "Stake APT with Thala to receive thAPT (liquid staking)",
    schema: {
        amount: z.number().positive().describe("Amount of APT to stake")
    },
    handler: async (agent: AptosAgent, input: Record<string, any>) => {
        try {
            const result = await agent.thalaStake(input.amount);
            return {
                message: `Successfully staked ${input.amount} APT with Thala`,
                hash: result
            };
        } catch (error: any) {
            throw new Error(`Failed to stake APT: ${error.message}`)
        }
    }
};

export const ThalaUnstakeTool: McpTool = {
    name: "aptos_thala_unstake",
    description: "Unstake thAPT to receive APT back",
    schema: {
        amount: z.number().positive().describe("Amount of thAPT to unstake")
    },
    handler: async (agent: AptosAgent, input: Record<string, any>) => {
        try {
            const result = await agent.thalaUnstake(input.amount);
            return {
                message: `Successfully unstaked ${input.amount} thAPT`,
                hash: result
            };
        } catch (error: any) {
            throw new Error(`Failed to unstake thAPT: ${error.message}`)
        }
    }
};

export const ThalaMintModTool: McpTool = {
    name: "aptos_thala_mint_mod",
    description: "Mint MOD stablecoin by depositing collateral",
    schema: {
        collateralType: z.string().describe("Type of collateral to deposit"),
        collateralAmount: z.number().positive().describe("Amount of collateral to deposit"),
        modAmount: z.number().positive().describe("Amount of MOD to mint")
    },
    handler: async (agent: AptosAgent, input: Record<string, any>) => {
        try {
            const result = await agent.thalaMintMod(
                input.collateralType,
                input.collateralAmount,
                input.modAmount
            );
            return {
                message: `Successfully minted ${input.modAmount} MOD using ${input.collateralAmount} ${input.collateralType}`,
                hash: result
            };
        } catch (error: any) {
            throw new Error(`Failed to mint MOD: ${error.message}`)
        }
    }
};

export const ThalaRedeemModTool: McpTool = {
    name: "aptos_thala_redeem_mod",
    description: "Redeem MOD stablecoin for underlying collateral",
    schema: {
        collateralType: z.string().describe("Type of collateral to receive"),
        modAmount: z.number().positive().describe("Amount of MOD to redeem")
    },
    handler: async (agent: AptosAgent, input: Record<string, any>) => {
        try {
            const result = await agent.thalaRedeemMod(
                input.collateralType,
                input.modAmount
            );
            return {
                message: `Successfully redeemed ${input.modAmount} MOD for ${input.collateralType}`,
                hash: result
            };
        } catch (error: any) {
            throw new Error(`Failed to redeem MOD: ${error.message}`)
        }
    }
};
