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
    hasDelegationPool
} from "../../tools/validators/delegation-pools";
import {
    calculateValidatorAPY,
    getValidatorsForStaking
} from "../../tools/validators/rewards-calculator";
import {
    getAptosName,
    getValidatorDisplayNameDirect
} from "../../tools/validators/address-names";

// ============================================================================
// CORE VALIDATOR TOOLS (Essential)
// ============================================================================

export const ListValidatorsTool: McpTool = {
    name: "aptos_list_validators",
    description: "List all validators in the Aptos network with their current status and information",
    schema: {
        limit: z.number().optional().default(50).describe("Maximum number of validators to return"),
        activeOnly: z.boolean().optional().default(true).describe("Show only active validators")
    },
    handler: async (agent: AptosAgent, input: Record<string, any>) => {
        try {
            const validators = await getAllValidators(agent);
            const filteredValidators = input.activeOnly 
                ? validators.filter(v => v.isActive)
                : validators;
            
            return filteredValidators.slice(0, input.limit || 50);
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

export const GetValidatorsForStakingTool: McpTool = {
    name: "aptos_get_validators_for_staking",
    description: "Get the best validators optimized for delegated staking with operator names and commission rates",
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

// ============================================================================
// STREAMLINED VALIDATOR DISPLAY NAME TOOL (One-Step Solution)
// ============================================================================

/**
 * One-step tool that gets validator info and resolves operator display name
 */
export const GetValidatorDisplayNameDirectTool: McpTool = {
    name: "aptos_get_validator_display_name_direct",
    description: "Get validator display name in one step - automatically fetches operator address and resolves to .apt name",
    schema: {
        validatorAddress: z.string().describe("Validator address to get display name for")
    },
    handler: async (agent: AptosAgent, input: Record<string, any>) => {
        try {
            return await getValidatorDisplayNameDirect(agent, input.validatorAddress);
        } catch (error: any) {
            throw new Error(`Failed to get validator display name: ${error.message}`);
        }
    }
};

// ============================================================================
// DELEGATION POOL TOOLS (Essential for Staking)
// ============================================================================

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

// ============================================================================
// ECOSYSTEM OVERVIEW TOOL
// ============================================================================

export const GetStakingOverviewTool: McpTool = {
    name: "aptos_get_staking_overview",
    description: "Get an overview of the Aptos staking ecosystem including total staked, number of validators, and average APY",
    schema: {},
    handler: async (agent: AptosAgent, input: Record<string, any>) => {
        try {
            // Get validator set
            const validatorSet = await agent.aptos.getAccountResource({
                accountAddress: "0x1",
                resourceType: "0x1::stake::ValidatorSet",
            });

            const validatorSetData = validatorSet.data as any;
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

// ============================================================================
// SIMPLE NAME RESOLUTION TOOL (For General Use)
// ============================================================================

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

// ============================================================================
// EXPORT STREAMLINED TOOLS (Only Essential Ones)
// ============================================================================

export const ValidatorMcpTools = {
    // Core Validator Tools (Essential)
    "ListValidatorsTool": ListValidatorsTool,
    "GetValidatorInfoTool": GetValidatorInfoTool,
    "GetTopValidatorsTool": GetTopValidatorsTool,
    "GetValidatorsForStakingTool": GetValidatorsForStakingTool,
    
    // One-Step Display Name Tool (NEW - Streamlined)
    "GetValidatorDisplayNameDirectTool": GetValidatorDisplayNameDirectTool,
    
    // Delegation Pool Tools (Essential for Staking)
    "GetDelegationPoolInfoTool": GetDelegationPoolInfoTool,
    "CheckDelegationPoolTool": CheckDelegationPoolTool,
    
    // Ecosystem Overview
    "GetStakingOverviewTool": GetStakingOverviewTool,
    
    // Simple Name Resolution
    "GetAptosNameTool": GetAptosNameTool
};

/*
REMOVED TOOLS (Not Essential):
- GetValidatorPerformanceTool (redundant with GetValidatorInfoTool)
- GetDelegationPoolCommissionTool (included in GetDelegationPoolInfoTool)
- GetUserDelegationTool (specific use case, not core)
- GetPendingWithdrawalsTool (specific use case, not core)
- CalculateValidatorAPYTool (complex, covered by GetValidatorsForStakingTool)
- GetBatchAptosNamesTool (batch processing, not core)
- GetValidatorDisplayNameTool (replaced by GetValidatorDisplayNameDirectTool)
- CheckOperatorNameTool (covered by GetAptosNameTool)

STREAMLINED TO 9 ESSENTIAL TOOLS (from 15)
*/
