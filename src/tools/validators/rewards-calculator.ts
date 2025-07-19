import type { AptosAgent } from "../../agent";
import { getValidatorInfo } from "./list-validators";
import { getTopValidators } from "./analyze-validators";
import { getDelegationPoolCommission, hasDelegationPool } from "./delegation-pools";
import { 
    getValidatorDisplayName, 
    ValidatorWithNames, 
    formatAddressForDisplay
} from "./address-names";

export interface ValidatorRewardsCalculation {
    currentEpochRewards: string;
    annualizedRewards: string;
    currentAPY: number;
    projectedAPY: number;
    stakingRewardsRate: number;
    epochDuration: number;
}

/**
 * Calculate detailed APY and rewards for a validator
 */
export async function calculateValidatorAPY(
    agent: AptosAgent,
    validatorAddress: string
): Promise<ValidatorRewardsCalculation> {
    try {
        // Get staking configuration
        const stakingConfig = await agent.aptos.getAccountResource({
            accountAddress: "0x1",
            resourceType: "0x1::staking_config::StakingConfig",
        });

        const config = stakingConfig.data as any;
        const rewardsRate = Number(config.rewards_rate || 0);
        const rewardsRateDenominator = Number(config.rewards_rate_denominator || 1);
        
        // Get validator performance
        const { rewards, stake } = await getValidatorInfo(agent, validatorAddress);
        
        // Calculate rewards rate as percentage
        const stakingRewardsRate = (rewardsRate / rewardsRateDenominator) * 100;
        
        // Estimate epoch duration (Aptos epochs are roughly 2 hours)
        const epochDuration = 2 * 60 * 60; // 2 hours in seconds
        const epochsPerYear = (365 * 24 * 60 * 60) / epochDuration;
        
        // Calculate current epoch rewards based on stake and performance
        const activeStake = BigInt(stake.active);
        const currentEpochRewards = (activeStake * BigInt(rewardsRate) * BigInt(rewards.successfulProposals)) / 
            (BigInt(rewardsRateDenominator) * BigInt(Math.max(rewards.successfulProposals + rewards.failedProposals, 1)));
        
        // Annualized rewards
        const annualizedRewards = currentEpochRewards * BigInt(Math.floor(epochsPerYear));
        
        // Current APY based on performance
        const currentAPY = activeStake > 0 
            ? Number(annualizedRewards * BigInt(100)) / Number(activeStake)
            : 0;
        
        // Projected APY (assuming 100% success rate)
        const projectedAPY = stakingRewardsRate;
        
        return {
            currentEpochRewards: currentEpochRewards.toString(),
            annualizedRewards: annualizedRewards.toString(),
            currentAPY,
            projectedAPY,
            stakingRewardsRate,
            epochDuration
        };
    } catch (error: any) {
        throw new Error(`Failed to calculate validator APY: ${error.message}`);
    }
}

/**
 * Simplified version of getValidatorsForStaking with better error handling
 */
export async function getValidatorsForStaking(
    agent: AptosAgent,
    limit: number = 20
): Promise<ValidatorWithNames[]> {
    try {
        // Step 1: Get top validators (this should work)
        const topValidators = await getTopValidators(agent, Math.min(limit * 2, 50), 'success_rate');
        const stakingValidators: ValidatorWithNames[] = [];

        // Step 2: Process each validator with maximum error resilience
        for (const validator of topValidators) {
            if (stakingValidators.length >= limit) break;
            
            try {
                // Default values
                let hasActiveDelegationPool = false;
                let commission = 0;
                let displayName = formatAddressForDisplay(validator.address);
                let isNamedOperator = false;
                let operatorName;
                
                // Try to check delegation pool
                try {
                    hasActiveDelegationPool = await hasDelegationPool(agent, validator.address);
                    if (hasActiveDelegationPool) {
                        const commissionInfo = await getDelegationPoolCommission(agent, validator.address);
                        commission = commissionInfo.operatorCommissionPercentage;
                    }
                } catch (e) {
                    // Ignore delegation pool errors, use defaults
                }

                // Try to get display name
                try {
                    const { stake } = await getValidatorInfo(agent, validator.address);
                    const operatorAddress = stake.operatorAddress;
                    
                    const nameInfo = await getValidatorDisplayName(
                        agent, 
                        validator.address, 
                        operatorAddress
                    );
                    
                    displayName = nameInfo.bestDisplayName;
                    isNamedOperator = nameInfo.isNamedOperator;
                    operatorName = nameInfo.operatorName;
                } catch (e) {
                    // Ignore name resolution errors, use defaults
                }

                // Build result with fallback values
                stakingValidators.push({
                    address: validator.address,
                    displayName,
                    validatorName: {
                        name: null,
                        fullName: null,
                        hasName: false,
                        displayAddress: displayName
                    },
                    operatorName,
                    isNamedOperator,
                    votingPower: validator.votingPower,
                    apy: validator.apy,
                    successRate: validator.successRate,
                    commission,
                    hasActiveDelegationPool
                });

            } catch (error) {
                // Skip this validator and continue
                console.warn(`Skipping validator ${validator.address}: ${error}`);
                continue;
            }
        }

        // Sort by combination of APY and low commission
        stakingValidators.sort((a, b) => {
            const scoreA = a.apy * (1 - a.commission / 100);
            const scoreB = b.apy * (1 - b.commission / 100);
            return scoreB - scoreA;
        });

        return stakingValidators.slice(0, limit);
        
    } catch (error: any) {
        throw new Error(`Failed to get validators for staking: ${error.message}`);
    }
}
