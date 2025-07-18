import type { AptosAgent } from "../../agent";

export interface ValidatorInfo {
    address: string;
    votingPower: string;
    consensusPublicKey: string;
    networkAddresses: string;
    fullnodeAddresses: string;
    validatorIndex: number;
    isActive: boolean;
    state: 'ACTIVE' | 'PENDING_ACTIVE' | 'PENDING_INACTIVE' | 'INACTIVE';
}

export interface ValidatorStakeInfo {
    active: string;
    inactive: string;
    pendingActive: string;
    pendingInactive: string;
    totalStake: string;
    lockedUntilSecs: string;
    operatorAddress: string;
    delegatedVoter: string;
}

export interface ValidatorRewardsInfo {
    successfulProposals: number;
    failedProposals: number;
    proposalSuccessRate: number;
    currentEpochVotingPower: string;
    estimatedAPY: number;
}

/**
 * Get all active validators in the current validator set
 */
export async function getAllValidators(agent: AptosAgent): Promise<ValidatorInfo[]> {
    try {
        // Get active validators
        const validatorSetData = await agent.aptos.getAccountResource({
            accountAddress: "0x1",
            resourceType: "0x1::stake::ValidatorSet",
        });

        const validators: ValidatorInfo[] = []; 
 
        // Process active validators
        for (let i = 0; i < validatorSetData.active_validators.length; i++) {
            const validator = validatorSetData.active_validators[i];
            validators.push({
                address: validator.addr,
                votingPower: validator.voting_power,
                consensusPublicKey: validator.config.consensus_pubkey,
                networkAddresses: validator.config.network_addresses,
                fullnodeAddresses: validator.config.fullnode_addresses,
                validatorIndex: validator.config.validator_index,
                isActive: true,
                state: 'ACTIVE'
            });
        }
 

        return validators;
    } catch (error: any) {
        throw new Error(`Failed to get validators: ${error.message}`);
    }
}

/**
 * Get detailed information for a specific validator
 */
export async function getValidatorInfo(
    agent: AptosAgent, 
    validatorAddress: string
): Promise<{
    info: ValidatorInfo;
    stake: ValidatorStakeInfo;
    rewards: ValidatorRewardsInfo;
}> {
    try {
        // Get validator state
        const state = await agent.aptos.view({
            payload: {
                function: "0x1::stake::get_validator_state",
                typeArguments: [],
                functionArguments: [validatorAddress],
            },
        });

        // Get stake information
        const stakeInfo = await agent.aptos.view({
            payload: {
                function: "0x1::stake::get_stake",
                typeArguments: [],
                functionArguments: [validatorAddress],
            },
        });

        // Get validator config
        const config = await agent.aptos.view({
            payload: {
                function: "0x1::stake::get_validator_config",
                typeArguments: [],
                functionArguments: [validatorAddress],
            },
        });

        // Get lockup information
        const lockupSecs = await agent.aptos.view({
            payload: {
                function: "0x1::stake::get_lockup_secs",
                typeArguments: [],
                functionArguments: [validatorAddress],
            },
        });

        // Get operator and delegated voter
        const operatorAddress = await agent.aptos.view({
            payload: {
                function: "0x1::stake::get_operator",
                typeArguments: [],
                functionArguments: [validatorAddress],
            },
        });

        const delegatedVoter = await agent.aptos.view({
            payload: {
                function: "0x1::stake::get_delegated_voter",
                typeArguments: [],
                functionArguments: [validatorAddress],
            },
        });

        // Get current epoch voting power
        const votingPower = await agent.aptos.view({
            payload: {
                function: "0x1::stake::get_current_epoch_voting_power",
                typeArguments: [],
                functionArguments: [validatorAddress],
            },
        });

        // Get validator index
        const validatorIndex: any = await agent.aptos.view({
            payload: {
                function: "0x1::stake::get_validator_index",
                typeArguments: [],
                functionArguments: [validatorAddress],
            },
        });

        // Get proposal counts for rewards calculation
        let successfulProposals = 0;
        let failedProposals = 0;
        try {
            const proposalCounts = await agent.aptos.view({
                payload: {
                    function: "0x1::stake::get_current_epoch_proposal_counts",
                    typeArguments: [],
                    functionArguments: [validatorIndex[0]],
                },
            });
            successfulProposals = Number(proposalCounts[0]);
            failedProposals = Number(proposalCounts[1]);
        } catch (e) {
            // If validator is not active, proposal counts might not be available
        }

        const stakeData = stakeInfo as any[];
        const configData = config as any[];
        
        const active = stakeData[0];
        const inactive = stakeData[1];
        const pendingActive = stakeData[2];
        const pendingInactive = stakeData[3];
        const totalStake = BigInt(active) + BigInt(inactive) + BigInt(pendingActive) + BigInt(pendingInactive);

        // Calculate APY (simplified calculation)
        const proposalSuccessRate = (successfulProposals + failedProposals) > 0 
            ? successfulProposals / (successfulProposals + failedProposals) 
            : 0;
        
        // Estimate APY based on staking rewards (this is a simplified calculation)
        const baseAPY = 7.0; // Approximate base APY for Aptos staking
        const estimatedAPY = baseAPY * proposalSuccessRate;

        const stateMap = {
            1: 'PENDING_ACTIVE' as const,
            2: 'ACTIVE' as const,
            3: 'PENDING_INACTIVE' as const,
            4: 'INACTIVE' as const,
        };

        return {
            info: {
                address: validatorAddress,
                votingPower: votingPower[0]?.toString() || "0",
                consensusPublicKey: configData[0],
                networkAddresses: configData[1],
                fullnodeAddresses: configData[2],
                validatorIndex: Number(validatorIndex[0]),
                isActive: Number(state[0]) === 2,
                state: stateMap[Number(state[0]) as keyof typeof stateMap] || 'INACTIVE'
            },
            stake: {
                active: active.toString(),
                inactive: inactive.toString(),
                pendingActive: pendingActive.toString(),
                pendingInactive: pendingInactive.toString(),
                totalStake: totalStake.toString(),
                lockedUntilSecs: lockupSecs[0]?.toString() || "0",
                operatorAddress: operatorAddress[0]?.toString() || validatorAddress,
                delegatedVoter: delegatedVoter[0]?.toString() || validatorAddress
            },
            rewards: {
                successfulProposals,
                failedProposals,
                proposalSuccessRate,
                currentEpochVotingPower: votingPower[0]?.toString() || "0",
                estimatedAPY
            }
        };
    } catch (error: any) {
        throw new Error(`Failed to get validator info: ${error.message}`);
    }
}

/**
 * Get validator performance metrics
 */
export async function getValidatorPerformance(
    agent: AptosAgent,
    validatorAddress: string
): Promise<ValidatorRewardsInfo> {
    try {
        const validatorIndex: any = await agent.aptos.view({
            payload: {
                function: "0x1::stake::get_validator_index",
                typeArguments: [],
                functionArguments: [validatorAddress],
            },
        });

        const proposalCounts = await agent.aptos.view({
            payload: {
                function: "0x1::stake::get_current_epoch_proposal_counts",
                typeArguments: [],
                functionArguments: [validatorIndex[0]],
            },
        });

        const votingPower = await agent.aptos.view({
            payload: {
                function: "0x1::stake::get_current_epoch_voting_power",
                typeArguments: [],
                functionArguments: [validatorAddress],
            },
        });

        const successfulProposals = Number(proposalCounts[0]);
        const failedProposals = Number(proposalCounts[1]);
        const proposalSuccessRate = (successfulProposals + failedProposals) > 0 
            ? successfulProposals / (successfulProposals + failedProposals) 
            : 0;

        // Estimate APY based on performance
        const baseAPY = 7.0;
        const estimatedAPY = baseAPY * proposalSuccessRate;

        return {
            successfulProposals,
            failedProposals,
            proposalSuccessRate,
            currentEpochVotingPower: votingPower[0]?.toString() || "0",
            estimatedAPY
        };
    } catch (error: any) {
        throw new Error(`Failed to get validator performance: ${error.message}`);
    }
}
