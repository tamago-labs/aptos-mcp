import type { AptosAgent } from "../../agent";
import { getValidatorInfo } from "./list-validators";
import { getTopValidators, ValidatorAnalysis } from "./analyze-validators";
import { getDelegationPoolCommission, hasDelegationPool } from "./delegation-pools";

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
 * Get validators optimized for staking (best for delegators)
 */
export async function getValidatorsForStaking(
    agent: AptosAgent,
    limit: number = 20
): Promise<Array<ValidatorAnalysis & {
    delegationPoolAddress: string | null;
    commission: number;
    minimumStake: string;
    hasActiveDelegationPool: boolean;
}>> {
    try {
        const topValidators = await getTopValidators(agent, limit * 2, 'success_rate');
        const stakingValidators = [];

        for (const validator of topValidators) {
            try {
                // Check if validator has delegation pool
                const hasDelegationPoolAvailable = await hasDelegationPool(agent, validator.address);
                let commission = 0;
                let delegationPoolAddress = null;

                if (hasDelegationPoolAvailable) {
                    delegationPoolAddress = validator.address;
                    try {
                        const commissionInfo = await getDelegationPoolCommission(agent, validator.address);
                        commission = commissionInfo.operatorCommissionPercentage;
                    } catch (e) {
                        // Commission info might not be available
                    }
                }

                stakingValidators.push({
                    ...validator,
                    delegationPoolAddress,
                    commission,
                    minimumStake: "11000000", // 0.11 APT minimum for delegation pools
                    hasActiveDelegationPool: hasDelegationPoolAvailable
                });

                if (stakingValidators.length >= limit) break;
            } catch (error) {
                console.warn(`Failed to get delegation info for validator ${validator.address}:`, error);
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
