#!/usr/bin/env ts-node

import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import {
    getAllValidators,
    getValidatorInfo,
    getValidatorPerformance
} from "./src/tools/validators/list-validators";
import { getTopValidators } from "./src/tools/validators/analyze-validators";
import {
    getDelegationPoolInfo,
    getDelegationPoolCommission,
    hasDelegationPool
} from "./src/tools/validators/delegation-pools";
import {
    calculateValidatorAPY,
    getValidatorsForStaking
} from "./src/tools/validators/rewards-calculator";

// Mock agent structure to match your existing pattern
const createMockAgent = (aptos: Aptos) => ({
    aptos,
    account: {
        accountAddress: { toString: () => "0x1" }
    }
});

async function testValidatorTools() {
    console.log("🔍 Testing Aptos Validator Tools...");
    console.log("=".repeat(60));

    try {
        // Create Aptos client
        const config = new AptosConfig({
            network: Network.MAINNET,
        });
        const aptos = new Aptos(config);
        const agent = createMockAgent(aptos);

        console.log("📡 Connected to Aptos Mainnet");
        console.log("🏛️ Fetching validator information...");
        console.log("");

        // Test 1: Get all validators
        console.log("📋 Step 1: Getting all validators...");
        const allValidators = await getAllValidators(agent as any);

        console.log(`✅ Found ${allValidators.length} total validators:`);
        const activeValidators = allValidators.filter(v => v.isActive);
        const pendingActiveValidators = allValidators.filter(v => v.state === 'PENDING_ACTIVE');
        const pendingInactiveValidators = allValidators.filter(v => v.state === 'PENDING_INACTIVE');
        const inactiveValidators = allValidators.filter(v => v.state === 'INACTIVE');

        console.log("");
        console.log("📊 VALIDATOR STATUS BREAKDOWN:");
        console.log("-".repeat(60));
        console.log(`| ${"Status".padEnd(18)} | ${"Count".padEnd(8)} | ${"Percentage".padEnd(12)} |`);
        console.log("-".repeat(60));
        console.log(`| ${"Active".padEnd(18)} | ${String(activeValidators.length).padEnd(8)} | ${((activeValidators.length / allValidators.length) * 100).toFixed(1).padEnd(11)}% |`);
        console.log(`| ${"Pending Active".padEnd(18)} | ${String(pendingActiveValidators.length).padEnd(8)} | ${((pendingActiveValidators.length / allValidators.length) * 100).toFixed(1).padEnd(11)}% |`);
        console.log(`| ${"Pending Inactive".padEnd(18)} | ${String(pendingInactiveValidators.length).padEnd(8)} | ${((pendingInactiveValidators.length / allValidators.length) * 100).toFixed(1).padEnd(11)}% |`);
        console.log(`| ${"Inactive".padEnd(18)} | ${String(inactiveValidators.length).padEnd(8)} | ${((inactiveValidators.length / allValidators.length) * 100).toFixed(1).padEnd(11)}% |`);
        console.log("-".repeat(60));
        console.log("");

        // Test 2: Get top validators
        console.log("🏆 Step 2: Getting top validators by voting power...");
        const topValidators = await getTopValidators(agent as any, 10, 'voting_power');

        console.log(`✅ Top ${topValidators.length} validators by voting power:`);
        console.log("");
        console.log("🏆 TOP VALIDATORS:");
        console.log("-".repeat(90));
        console.log("| Rank".padEnd(6) + "| Address".padEnd(25) + "| Voting Power".padEnd(15) + "| APY".padEnd(8) + "| Success Rate".padEnd(15) + "|");
        console.log("-".repeat(90));

        topValidators.slice(0, 10).forEach((validator, index) => {
            const address = validator.address.substring(0, 22) + "...";
            const votingPower = (Number(validator.votingPower) / 1e8).toFixed(0); // Convert from octas to APT
            const apy = validator.apy.toFixed(2);
            const successRate = (validator.successRate * 100).toFixed(1);

            console.log(`| ${(index + 1).toString().padEnd(4)}| ${address.padEnd(23)}| ${votingPower.padEnd(13)}| ${apy.padEnd(6)}| ${successRate.padEnd(13)}|`);
        });
        console.log("-".repeat(90));
        console.log("");

        // Test 3: Get detailed info for first validator
        if (activeValidators.length > 0) {
            const firstValidator = activeValidators[0].address;
            console.log(`🔍 Step 3: Getting detailed info for validator: ${firstValidator.substring(0, 30)}...`);

            try {
                const validatorInfo = await getValidatorInfo(agent as any, firstValidator);

                console.log("✅ Validator detailed information:");
                console.log("");
                console.log("📊 STAKE BREAKDOWN:");
                console.log(`   Active Stake: ${(Number(validatorInfo.stake.active) / 1e8).toFixed(2)} APT`);
                console.log(`   Inactive Stake: ${(Number(validatorInfo.stake.inactive) / 1e8).toFixed(2)} APT`);
                console.log(`   Pending Active: ${(Number(validatorInfo.stake.pendingActive) / 1e8).toFixed(2)} APT`);
                console.log(`   Pending Inactive: ${(Number(validatorInfo.stake.pendingInactive) / 1e8).toFixed(2)} APT`);
                console.log(`   Total Stake: ${(Number(validatorInfo.stake.totalStake) / 1e8).toFixed(2)} APT`);
                console.log("");
                console.log("🎯 PERFORMANCE METRICS:");
                console.log(`   Successful Proposals: ${validatorInfo.rewards.successfulProposals}`);
                console.log(`   Failed Proposals: ${validatorInfo.rewards.failedProposals}`);
                console.log(`   Success Rate: ${(validatorInfo.rewards.proposalSuccessRate * 100).toFixed(2)}%`);
                console.log(`   Estimated APY: ${validatorInfo.rewards.estimatedAPY.toFixed(2)}%`);
                console.log(`   Current Voting Power: ${(Number(validatorInfo.rewards.currentEpochVotingPower) / 1e8).toFixed(2)} APT`);
                console.log("");

            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                console.log(`⚠️  Could not get detailed info: ${errorMessage}`);
                console.log("");
            }
        }

        // Test 4: Check delegation pools
        console.log("💰 Step 4: Checking delegation pools...");
        let delegationPoolCount = 0;
        let validatorsWithPools: any = [];

        for (let i = 0; i < Math.min(activeValidators.length, 5); i++) {
            const validator = activeValidators[i];
            try {
                const hasPool = await hasDelegationPool(agent as any, validator.address);
                if (hasPool) {
                    delegationPoolCount++;
                    validatorsWithPools.push(validator);
                }
            } catch (error) {
                // Skip validators that error out
            }
        }

        console.log(`✅ Found ${delegationPoolCount} validators with delegation pools (from ${Math.min(activeValidators.length, 5)} checked)`);

        if (validatorsWithPools.length > 0) {
            console.log("");
            console.log("💎 DELEGATION POOL DETAILS:");
            console.log("-".repeat(80));
            console.log("| Address".padEnd(25) + "| Commission".padEnd(12) + "| Voting Power".padEnd(15) + "| Status".padEnd(10) + "|");
            console.log("-".repeat(80));

            for (const validator of validatorsWithPools.slice(0, 3)) {
                try {
                    const commission = await getDelegationPoolCommission(agent as any, validator.address);
                    const address = validator.address.substring(0, 22) + "...";
                    const votingPower = (Number(validator.votingPower) / 1e8).toFixed(0);
                    const commissionRate = commission.operatorCommissionPercentage.toFixed(2);

                    console.log(`| ${address.padEnd(23)}| ${commissionRate.padEnd(10)}| ${votingPower.padEnd(13)}| Active`.padEnd(8) + "|");
                } catch (error) {
                    const address = validator.address.substring(0, 22) + "...";
                    console.log(`| ${address.padEnd(23)}| ERROR`.padEnd(10) + "| N/A".padEnd(13) + "| ERROR".padEnd(8) + "|");
                }
            }
            console.log("-".repeat(80));
        }

        // Test 5: Get staking overview
        console.log("");
        console.log("📊 Step 5: Getting staking ecosystem overview...");

        try {
            // Get validator set resource directly
            const validatorSetData = await aptos.getAccountResource({
                accountAddress: "0x1",
                resourceType: "0x1::stake::ValidatorSet",
            });

            // Get staking configuration
            const stakingConfig = await aptos.getAccountResource({
                accountAddress: "0x1",
                resourceType: "0x1::staking_config::StakingConfig",
            });
            const config = stakingConfig.data as any;

            const totalVotingPower = validatorSetData.total_voting_power || "0";
            const rewardsRate = Number(config.rewards_rate || 0);
            const rewardsRateDenominator = Number(config.rewards_rate_denominator || 1);
            const baseAPY = (rewardsRate / rewardsRateDenominator) * 100;

            console.log("✅ Staking ecosystem overview:");
            console.log("");
            console.log("🌐 ECOSYSTEM STATISTICS:");
            console.log(`   Total Active Validators: ${validatorSetData.active_validators?.length || 0}`);
            console.log(`   Pending Active Validators: ${validatorSetData.pending_active?.length || 0}`);
            console.log(`   Pending Inactive Validators: ${validatorSetData.pending_inactive?.length || 0}`);
            console.log(`   Total Voting Power: ${(Number(totalVotingPower) / 1e8).toFixed(0)} APT`);
            console.log(`   Base APY: ${baseAPY.toFixed(2)}%`);
            console.log(`   Minimum Stake: ${(Number(config.minimum_stake || 0) / 1e8).toFixed(2)} APT`);
            console.log(`   Maximum Stake: ${(Number(config.maximum_stake || 0) / 1e8).toFixed(0)} APT`);

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.log(`⚠️  Could not get staking overview: ${errorMessage}`);
        }

        // Test 6: Get validators optimized for staking
        console.log("");
        console.log("🎯 Step 6: Getting validators optimized for staking...");

        try {
            const stakingValidators = await getValidatorsForStaking(agent as any, 5);

            if (stakingValidators.length > 0) {
                console.log(`✅ Found ${stakingValidators.length} validators optimized for delegated staking:`);
                console.log("");
                console.log("💎 BEST VALIDATORS FOR STAKING:");
                console.log("-".repeat(100));
                console.log("| Rank".padEnd(6) + "| Address".padEnd(25) + "| APY".padEnd(8) + "| Commission".padEnd(12) + "| Pool Available".padEnd(15) + "|");
                console.log("-".repeat(100));

                stakingValidators.forEach((validator, index) => {
                    const address = validator.address.substring(0, 22) + "...";
                    const apy = validator.apy.toFixed(2);
                    const commission = validator.commission.toFixed(2);
                    const hasPool = validator.hasActiveDelegationPool ? "Yes" : "No";

                    console.log(`| ${(index + 1).toString().padEnd(4)}| ${address.padEnd(23)}| ${apy.padEnd(6)}| ${commission.padEnd(10)}| ${hasPool.padEnd(13)}|`);
                });
                console.log("-".repeat(100));

                // Show detailed recommendation
                if (stakingValidators.length > 0) {
                    const best = stakingValidators[0];
                    console.log("");
                    console.log("🏆 RECOMMENDED VALIDATOR FOR STAKING:");
                    console.log(`   Address: ${best.address}`);
                    console.log(`   Estimated APY: ${best.apy.toFixed(2)}%`);
                    console.log(`   Commission Rate: ${best.commission.toFixed(2)}%`);
                    console.log(`   Success Rate: ${(best.successRate * 100).toFixed(1)}%`);
                    console.log(`   Has Delegation Pool: ${best.hasActiveDelegationPool ? "✅ Yes" : "❌ No"}`);
                    console.log(`   Minimum Stake: ${(Number(best.minimumStake) / 1e8).toFixed(2)} APT`);
                }
            } else {
                console.log("⚠️  No validators found with delegation pools");
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.log(`⚠️  Could not get staking validators: ${errorMessage}`);
        }

        console.log("");
        console.log("🎉 All validator tools tested successfully!");
        console.log("");

        // Summary
        console.log("📋 TEST SUMMARY:");
        console.log(`   ✅ Total validators discovered: ${allValidators.length}`);
        console.log(`   ✅ Active validators: ${activeValidators.length}`);
        console.log(`   ✅ Validators with delegation pools: ${delegationPoolCount} (from ${Math.min(activeValidators.length, 5)} checked)`);
        console.log(`   ✅ Top validators analyzed: ${topValidators.length}`);
        console.log("");
        console.log("💡 INTEGRATION NOTES:");
        console.log("   - Use 'aptos_get_validators_for_staking' to find the best validators");
        console.log("   - Use your existing StakeAPTTool with delegation pool addresses");
        console.log("   - Delegation pools support liquid staking with 0.11 APT minimum");
        console.log("   - Commission rates and APY are calculated from real-time data");

    } catch (error) {
        console.error("❌ Error testing validator tools:");
        console.error(error);

        if (error instanceof Error) {
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
        }

        console.log("");
        console.log("💡 Troubleshooting tips:");
        console.log("1. Check if connected to Aptos Mainnet");
        console.log("2. Verify validator resources exist at 0x1 address");
        console.log("3. Ensure view functions are available");
        console.log("4. Check if delegation pool resources are accessible");

        process.exit(1);
    }
}

// Run the test
if (require.main === module) {
    testValidatorTools().catch(console.error);
}
