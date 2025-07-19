import { z } from "zod";
import type { AptosAgent } from "../../agent";
import { McpTool } from "../../types";
import { 
    getAllValidators, 
    getValidatorInfo, 
    getValidatorPerformance 
} from "../../tools/validators/list-validators";
import { getTopValidators } from "../../tools/validators/analyze-validators";
import { 
    getDelegationPoolInfo,
    getDelegationPoolCommission,
    getUserDelegation,
    getPendingWithdrawals,
    hasDelegationPool
} from "../../tools/validators/delegation-pools";
import {
    calculateValidatorAPY,
    getValidatorsForStaking
} from "../../tools/validators/rewards-calculator";
import {
    getAptosName,
    getBatchAptosNames,
    getValidatorDisplayName,
    isOperatorWithName
} from "../../tools/validators/address-names";

// Core Validator Information Tools
export const ListValidatorsTool: McpTool = {
    name: "aptos_list_validators",
    description: "List all validators in the Aptos network with their current status and information",
    schema: {
        limit: z.number().optional().default(50).describe("Maximum number of validators to return"),
        activeOnly: z.boolean().optional().default(true).describe("Show only active validators"),
        includeDetails: z.boolean().optional().default(false).describe("Include detailed stake and reward information")
    },
    handler: async (agent: AptosAgent, input: Record<string, any>) => {
        try {
            if (input.includeDetails) { 
                const topValidators = await getTopValidators(
                    agent, 
                    input.limit || 50, 
                    'voting_power'
                );
                return topValidators;
            } else { 
                const validators = await getAllValidators(agent);
                const filteredValidators = input.activeOnly 
                    ? validators.filter(v => v.isActive)
                    : validators;
                
                return filteredValidators.slice(0, input.limit || 50);
            } 
        } catch (error: any) {
            throw new Error(`Failed to list validators: ${error.message}`);
        }
    }
};

export const GetValidatorInfoTool: McpTool = {
    name: "aptos_get_validator_info",
    description: "Get detailed information about a specific validator including stake, rewards, and performance",
    schema: {
        validatorAddress: z.string().describe("Validator address to get information for")
    },
    handler: async (agent: AptosAgent, input: Record<string, any>) => {
        try {
            return await getValidatorInfo(agent, input.validatorAddress);
        } catch (error: any) {
            throw new Error(`Failed to get validator info: ${error.message}`);
        }
    }
};

export const GetTopValidatorsTool: McpTool = {
    name: "aptos_get_top_validators",
    description: "Get top validators ranked by various criteria (voting power, APY, success rate, etc.)",
    schema: {
        limit: z.number().optional().default(20).describe("Number of top validators to return"),
        sortBy: z.enum(['voting_power', 'apy', 'success_rate', 'total_stake']).optional().default('voting_power').describe("Criteria to sort validators by")
    },
    handler: async (agent: AptosAgent, input: Record<string, any>) => {
        try {
            return await getTopValidators(
                agent, 
                input.limit || 20, 
                input.sortBy || 'voting_power'
            );
        } catch (error: any) {
            throw new Error(`Failed to get top validators: ${error.message}`);
        }
    }
};

export const GetValidatorPerformanceTool: McpTool = {
    name: "aptos_get_validator_performance",
    description: "Get performance metrics for a specific validator including proposal success rate and estimated APY",
    schema: {
        validatorAddress: z.string().describe("Validator address to get performance for")
    },
    handler: async (agent: AptosAgent, input: Record<string, any>) => {
        try {
            return await getValidatorPerformance(agent, input.validatorAddress);
        } catch (error: any) {
            throw new Error(`Failed to get validator performance: ${error.message}`);
        }
    }
};

// Delegation Pool Information Tools
export const GetDelegationPoolInfoTool: McpTool = {
    name: "aptos_get_delegation_pool_info",
    description: "Get information about a delegation pool including commission rates and total stake",
    schema: {
        poolAddress: z.string().describe("Delegation pool address")
    },
    handler: async (agent: AptosAgent, input: Record<string, any>) => {
        try {
            return await getDelegationPoolInfo(agent, input.poolAddress);
        } catch (error: any) {
            throw new Error(`Failed to get delegation pool info: ${error.message}`);
        }
    }
};

export const GetDelegationPoolCommissionTool: McpTool = {
    name: "aptos_get_delegation_pool_commission",
    description: "Get commission information for a delegation pool",
    schema: {
        poolAddress: z.string().describe("Delegation pool address")
    },
    handler: async (agent: AptosAgent, input: Record<string, any>) => {
        try {
            return await getDelegationPoolCommission(agent, input.poolAddress);
        } catch (error: any) {
            throw new Error(`Failed to get delegation pool commission: ${error.message}`);
        }
    }
};

export const GetUserDelegationTool: McpTool = {
    name: "aptos_get_user_delegation",
    description: "Get user's delegation information in a specific pool",
    schema: {
        poolAddress: z.string().describe("Delegation pool address"),
        userAddress: z.string().optional().describe("User address (defaults to current account)")
    },
    handler: async (agent: AptosAgent, input: Record<string, any>) => {
        try {
            return await getUserDelegation(agent, input.poolAddress, input.userAddress);
        } catch (error: any) {
            throw new Error(`Failed to get user delegation: ${error.message}`);
        }
    }
};

export const GetPendingWithdrawalsTool: McpTool = {
    name: "aptos_get_pending_withdrawals",
    description: "Get pending withdrawals from a delegation pool",
    schema: {
        poolAddress: z.string().describe("Delegation pool address"),
        userAddress: z.string().optional().describe("User address (defaults to current account)")
    },
    handler: async (agent: AptosAgent, input: Record<string, any>) => {
        try {
            return await getPendingWithdrawals(agent, input.poolAddress, input.userAddress);
        } catch (error: any) {
            throw new Error(`Failed to get pending withdrawals: ${error.message}`);
        }
    }
};

export const CheckDelegationPoolTool: McpTool = {
    name: "aptos_check_delegation_pool",
    description: "Check if an address has a delegation pool available for staking",
    schema: {
        poolAddress: z.string().describe("Address to check for delegation pool")
    },
    handler: async (agent: AptosAgent, input: Record<string, any>) => {
        try {
            const hasPool = await hasDelegationPool(agent, input.poolAddress);
            return {
                address: input.poolAddress,
                hasDelegationPool: hasPool,
                message: hasPool 
                    ? "Delegation pool available for staking" 
                    : "No delegation pool found at this address"
            };
        } catch (error: any) {
            throw new Error(`Failed to check delegation pool: ${error.message}`);
        }
    }
};

// Analysis and Calculation Tools
export const CalculateValidatorAPYTool: McpTool = {
    name: "aptos_calculate_validator_apy",
    description: "Calculate detailed APY and rewards information for a validator",
    schema: {
        validatorAddress: z.string().describe("Validator address to calculate APY for")
    },
    handler: async (agent: AptosAgent, input: Record<string, any>) => {
        try {
            return await calculateValidatorAPY(agent, input.validatorAddress);
        } catch (error: any) {
            throw new Error(`Failed to calculate validator APY: ${error.message}`);
        }
    }
};

export const GetValidatorsForStakingTool: McpTool = {
    name: "aptos_get_validators_for_staking",
    description: "Get the best validators optimized for delegated staking with commission rates and delegation pool info",
    schema: {
        limit: z.number().optional().default(20).describe("Number of validators to return")
    },
    handler: async (agent: AptosAgent, input: Record<string, any>) => {
        try {
            return await getValidatorsForStaking(agent, input.limit || 20);
        } catch (error: any) {
            throw new Error(`Failed to get validators for staking: ${error.message}`);
        }
    }
};

export const GetStakingOverviewTool: McpTool = {
    name: "aptos_get_staking_overview",
    description: "Get an overview of the Aptos staking ecosystem including total staked, number of validators, and average APY",
    schema: {},
    handler: async (agent: AptosAgent, input: Record<string, any>) => {
        try {
            // Get validator set
            const validatorSetData = await agent.aptos.getAccountResource({
                accountAddress: "0x1",
                resourceType: "0x1::stake::ValidatorSet",
            });

            const activeValidators = validatorSetData.active_validators || [];
            const totalVotingPower = validatorSetData.total_voting_power || "0";

            // Get staking configuration
            const stakingConfig = await agent.aptos.getAccountResource({
                accountAddress: "0x1",
                resourceType: "0x1::staking_config::StakingConfig",
            });

            const config = stakingConfig.data as any;
            const rewardsRate = Number(config.rewards_rate || 0);
            const rewardsRateDenominator = Number(config.rewards_rate_denominator || 1);
            const minimumStake = config.minimum_stake || "0";
            const maximumStake = config.maximum_stake || "0";

            // Calculate average APY
            const baseAPY = (rewardsRate / rewardsRateDenominator) * 100;

            return {
                totalActiveValidators: activeValidators.length,
                totalVotingPower: totalVotingPower,
                totalStaked: totalVotingPower, // Voting power represents total staked
                averageAPY: baseAPY,
                minimumStakeRequired: minimumStake,
                maximumStakeAllowed: maximumStake,
                rewardsRate: `${rewardsRate}/${rewardsRateDenominator}`,
                pendingActiveValidators: validatorSetData.pending_active?.length || 0,
                pendingInactiveValidators: validatorSetData.pending_inactive?.length || 0
            };
        } catch (error: any) {
            throw new Error(`Failed to get staking overview: ${error.message}`);
        }
    }
};

// Address and Name Resolution Tools
export const GetAptosNameTool: McpTool = {
    name: "aptos_get_aptos_name",
    description: "Convert an Aptos address to its registered .apt name",
    schema: {
        address: z.string().describe("Aptos address to resolve to name")
    },
    handler: async (agent: AptosAgent, input: Record<string, any>) => {
        try {
            return await getAptosName(agent, input.address);
        } catch (error: any) {
            throw new Error(`Failed to get Aptos name: ${error.message}`);
        }
    }
};

export const GetBatchAptosNamesTool: McpTool = {
    name: "aptos_get_batch_aptos_names",
    description: "Convert multiple Aptos addresses to their registered .apt names",
    schema: {
        addresses: z.array(z.string()).describe("Array of Aptos addresses to resolve")
    },
    handler: async (agent: AptosAgent, input: Record<string, any>) => {
        try {
            const nameMap = await getBatchAptosNames(agent, input.addresses);
            // Convert Map to object for JSON serialization
            const result: Record<string, any> = {};
            for (const [address, nameInfo] of nameMap.entries()) {
                result[address] = nameInfo;
            }
            return result;
        } catch (error: any) {
            throw new Error(`Failed to get batch Aptos names: ${error.message}`);
        }
    }
};

export const GetValidatorDisplayNameTool: McpTool = {
    name: "aptos_get_validator_display_name",
    description: "Get the best display name for a validator (uses operator name if available)",
    schema: {
        validatorAddress: z.string().describe("Validator address"),
        operatorAddress: z.string().optional().describe("Operator address (optional)")
    },
    handler: async (agent: AptosAgent, input: Record<string, any>) => {
        try {
            return await getValidatorDisplayName(
                agent,
                input.validatorAddress,
                input.operatorAddress
            );
        } catch (error: any) {
            throw new Error(`Failed to get validator display name: ${error.message}`);
        }
    }
};

export const CheckOperatorNameTool: McpTool = {
    name: "aptos_check_operator_name",
    description: "Check if an address has a registered .apt name (useful for identifying named operators)",
    schema: {
        address: z.string().describe("Address to check for registered name")
    },
    handler: async (agent: AptosAgent, input: Record<string, any>) => {
        try {
            const hasName = await isOperatorWithName(agent, input.address);
            const nameInfo = await getAptosName(agent, input.address);
            return {
                address: input.address,
                ...nameInfo,
                hasName
            };
        } catch (error: any) {
            throw new Error(`Failed to check operator name: ${error.message}`);
        }
    }
};

// Export all validator tools for MCP index
export const ValidatorMcpTools = {
    // Validator Information Tools
    "ListValidatorsTool": ListValidatorsTool,
    "GetValidatorInfoTool": GetValidatorInfoTool,
    "GetTopValidatorsTool": GetTopValidatorsTool,
    "GetValidatorPerformanceTool": GetValidatorPerformanceTool,

    // Delegation Pool Information Tools  
    "GetDelegationPoolInfoTool": GetDelegationPoolInfoTool,
    "GetDelegationPoolCommissionTool": GetDelegationPoolCommissionTool,
    "GetUserDelegationTool": GetUserDelegationTool,
    "GetPendingWithdrawalsTool": GetPendingWithdrawalsTool,
    "CheckDelegationPoolTool": CheckDelegationPoolTool,

    // Analysis and Calculation Tools
    "CalculateValidatorAPYTool": CalculateValidatorAPYTool,
    "GetValidatorsForStakingTool": GetValidatorsForStakingTool,
    "GetStakingOverviewTool": GetStakingOverviewTool,

    // Address and Name Resolution Tools
    "GetAptosNameTool": GetAptosNameTool,
    "GetBatchAptosNamesTool": GetBatchAptosNamesTool,
    "GetValidatorDisplayNameTool": GetValidatorDisplayNameTool,
    "CheckOperatorNameTool": CheckOperatorNameTool
};
