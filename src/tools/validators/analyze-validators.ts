import type { AptosAgent } from "../../agent";
import { getAllValidators, getValidatorInfo, ValidatorInfo } from "./list-validators";

export interface ValidatorAnalysis {
    address: string;
    rank: number;
    score: number;
    votingPower: string;
    apy: number;
    successRate: number;
    totalStake: string;
    commission?: number;
    uptime?: number;
}

/**
 * Get top validators ranked by various criteria
 */
export async function getTopValidators(
    agent: AptosAgent,
    limit: number = 50,
    sortBy: 'voting_power' | 'apy' | 'success_rate' | 'total_stake' = 'voting_power'
): Promise<ValidatorAnalysis[]> {
    try {
        const validators = await getAllValidators(agent);
        const validatorAnalyses: ValidatorAnalysis[] = [];

        // Get detailed info for each validator
        for (let i = 0; i < Math.min(validators.length, limit * 2); i++) {
            const validator = validators[i];
            if (!validator.isActive) continue;

            try {
                const { stake, rewards } = await getValidatorInfo(agent, validator.address);
                
                // Calculate score based on multiple factors
                const score = calculateValidatorScore(
                    Number(validator.votingPower),
                    rewards.proposalSuccessRate,
                    rewards.estimatedAPY,
                    Number(stake.totalStake)
                );

                validatorAnalyses.push({
                    address: validator.address,
                    rank: 0, // Will be set after sorting
                    score,
                    votingPower: validator.votingPower,
                    apy: rewards.estimatedAPY,
                    successRate: rewards.proposalSuccessRate,
                    totalStake: stake.totalStake,
                });
            } catch (error) {
                console.warn(`Failed to get info for validator ${validator.address}:`, error);
                continue;
            }
        }

        // Sort by criteria
        validatorAnalyses.sort((a, b) => {
            switch (sortBy) {
                case 'voting_power':
                    return Number(b.votingPower) - Number(a.votingPower);
                case 'apy':
                    return b.apy - a.apy;
                case 'success_rate':
                    return b.successRate - a.successRate;
                case 'total_stake':
                    return Number(b.totalStake) - Number(a.totalStake);
                default:
                    return b.score - a.score;
            }
        });

        // Assign ranks and limit results
        return validatorAnalyses.slice(0, limit).map((validator, index) => ({
            ...validator,
            rank: index + 1
        }));
    } catch (error: any) {
        throw new Error(`Failed to get top validators: ${error.message}`);
    }
}

function calculateValidatorScore(
    votingPower: number,
    successRate: number,
    apy: number,
    totalStake: number
): number {
    // Weighted score calculation
    const votingPowerWeight = 0.3;
    const successRateWeight = 0.4;
    const apyWeight = 0.2;
    const stakeWeight = 0.1;

    // Normalize values (simplified)
    const normalizedVotingPower = Math.min(votingPower / 1000000, 1); // Normalize to max 1M
    const normalizedSuccessRate = successRate;
    const normalizedAPY = Math.min(apy / 10, 1); // Normalize to max 10%
    const normalizedStake = Math.min(totalStake / 10000000, 1); // Normalize to max 10M

    return (
        normalizedVotingPower * votingPowerWeight +
        normalizedSuccessRate * successRateWeight +
        normalizedAPY * apyWeight +
        normalizedStake * stakeWeight
    ) * 100;
}
