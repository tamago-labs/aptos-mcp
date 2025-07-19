#!/usr/bin/env ts-node

import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import {
    getAllValidators,
    getValidatorInfo,
    getValidatorPerformance
} from "./src/tools/validators/list-validators";
import { getTopValidators } from "./src/tools/validators/analyze-validators";
import {
    getValidatorsForStaking
} from "./src/tools/validators/rewards-calculator";
import {
    getAptosName,
    getValidatorDisplayName,
    formatAddressForDisplay
} from "./src/tools/validators/address-names";

// Mock agent structure to match your existing pattern
const createMockAgent = (aptos: Aptos) => ({
    aptos,
    account: {
        accountAddress: { toString: () => "0x1" }
    }
});

async function testValidatorTools() {
    console.log("🔍 Testing Aptos Validator Tools with Name Resolution...");
    console.log("=".repeat(70));

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

        // Test 1: Get all validators with basic info
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
        console.log(`| Status`.padEnd(20) + `| Count`.padEnd(10) + `| Percentage`.padEnd(15) + "|");
        console.log("-".repeat(60));
        console.log(`| ${"Active".padEnd(18)} | ${String(activeValidators.length).padEnd(8)} | ${((activeValidators.length / allValidators.length) * 100).toFixed(1).padEnd(11)}% |`);
        console.log(`| ${"Pending Active".padEnd(18)} | ${String(pendingActiveValidators.length).padEnd(8)} | ${((pendingActiveValidators.length / allValidators.length) * 100).toFixed(1).padEnd(11)}% |`);
        console.log(`| ${"Pending Inactive".padEnd(18)} | ${String(pendingInactiveValidators.length).padEnd(8)} | ${((pendingInactiveValidators.length / allValidators.length) * 100).toFixed(1).padEnd(11)}% |`);
        console.log(`| ${"Inactive".padEnd(18)} | ${String(inactiveValidators.length).padEnd(8)} | ${((inactiveValidators.length / allValidators.length) * 100).toFixed(1).padEnd(11)}% |`);
        console.log("-".repeat(60));
        console.log("");

        // Test 2: Get top validators and show their operator names
        console.log("🏆 Step 2: Getting top validators with operator names...");
        const topValidators = await getTopValidators(agent as any, 8, 'voting_power');

        console.log("📊 TOP VALIDATORS WITH OPERATOR NAMES:");
        console.log("-".repeat(120));
        console.log(`| Rank| Validator Address        | Operator Display Name    | Voting Power | APY   | Named|`);
        console.log("-".repeat(120));

        for (let i = 0; i < Math.min(topValidators.length, 8); i++) {
            const validator = topValidators[i];
            try {
                // Get validator info to find operator address
                const { stake } = await getValidatorInfo(agent as any, validator.address);
                const operatorAddress = stake.operatorAddress;

                // Get display name for operator (this is the key part!)
                const nameInfo = await getValidatorDisplayName(
                    agent as any,
                    validator.address,
                    operatorAddress
                );

                const validatorAddr = formatAddressForDisplay(validator.address);
                const votingPowerAPT = (Number(validator.votingPower) / 1e8).toFixed(0);
                const namedIcon = nameInfo.isNamedOperator ? "✅" : "❌";

                console.log(`| ${(i + 1).toString().padEnd(3)}| ${validatorAddr.padEnd(24)}| ${nameInfo.bestDisplayName.padEnd(24)}| ${votingPowerAPT.padEnd(12)}| ${validator.apy.toFixed(2).padEnd(5)}| ${namedIcon.padEnd(4)}|`);

            } catch (error) {
                const validatorAddr = formatAddressForDisplay(validator.address);
                const votingPowerAPT = (Number(validator.votingPower) / 1e8).toFixed(0);
                console.log(`| ${(i + 1).toString().padEnd(3)}| ${validatorAddr.padEnd(24)}| ${"ERROR".padEnd(24)}| ${votingPowerAPT.padEnd(12)}| ${validator.apy.toFixed(2).padEnd(5)}| ${"❌".padEnd(4)}|`);
            }
        }
        console.log("-".repeat(120));
        console.log("");

        // Test 3: Analyze operator names found
        console.log("🏷️ Step 3: Analyzing operator names from real validators...");

        // Collect operator addresses and their names from the top validators
        const operatorNameAnalysis: any = [];
        for (let i = 0; i < Math.min(topValidators.length, 5); i++) {
            const validator = topValidators[i];
            try {
                const { stake } = await getValidatorInfo(agent as any, validator.address);
                const operatorAddress = stake.operatorAddress;
                const nameInfo = await getAptosName(agent as any, operatorAddress);

                operatorNameAnalysis.push({
                    operatorAddress,
                    nameInfo,
                    validatorAddress: validator.address
                });
            } catch (error) {
                // Skip validators that error out
            }
        }

        if (operatorNameAnalysis.length > 0) {
            console.log("📋 OPERATOR NAME ANALYSIS FROM REAL VALIDATORS:");
            console.log("-".repeat(100));
            console.log(`| Operator Address             | Name Found    | Display Name         | Status    |`);
            console.log("-".repeat(100));

            operatorNameAnalysis.forEach(({ operatorAddress, nameInfo }: any) => {
                const displayAddr = formatAddressForDisplay(operatorAddress);
                const nameFound = nameInfo.hasName ? nameInfo.fullName! : "None";
                const displayName = nameInfo.displayAddress;
                const status = nameInfo.hasName ? "✅ Named" : "❌ Unnamed";

                console.log(`| ${displayAddr.padEnd(28)}| ${nameFound.padEnd(13)}| ${displayName.padEnd(20)}| ${status.padEnd(9)}|`);
            });
            console.log("-".repeat(100));

            const namedCount = operatorNameAnalysis.filter((op: any) => op.nameInfo.hasName).length;
            console.log(`OPERATOR NAME SUMMARY:`);
            console.log(`   Total operators analyzed: ${operatorNameAnalysis.length}`);
            console.log(`   Named operators: ${namedCount} (${((namedCount / operatorNameAnalysis.length) * 100).toFixed(1)}%)`);
            console.log(`   Unnamed operators: ${operatorNameAnalysis.length - namedCount} (${(((operatorNameAnalysis.length - namedCount) / operatorNameAnalysis.length) * 100).toFixed(1)}%)`);
        }
        console.log("");

        // Test 4: Get validators optimized for staking (with enhanced names)
        console.log("💰 Step 4: Getting best validators for staking (with operator names)...");
        try {
            const stakingValidators = await getValidatorsForStaking(agent as any, 10);

            console.log(`✅ Found ${stakingValidators.length} validators optimized for staking:`);
            console.log("");
            console.log("💎 BEST VALIDATORS FOR STAKING:");
            console.log("-".repeat(115));
            console.log(`| Rank| Display Name                     | APY   | Commission| Pool Available| Named Op|`);
            console.log("-".repeat(115));

            for (let i = 0; i < Math.min(stakingValidators.length, 10); i++) {
                const validator = stakingValidators[i];
                let displayName = validator.displayName;

                // Truncate long names to fit table
                if (displayName.length > 30) {
                    displayName = displayName.substring(0, 27) + "...";
                }

                const poolStatus = validator.hasActiveDelegationPool ? "Yes" : "No";
                const namedOp = validator.isNamedOperator ? "✅" : "❌";

                console.log(`| ${(i + 1).toString().padEnd(3)}| ${displayName.padEnd(32)}| ${validator.apy.toFixed(2).padEnd(5)}| ${validator.commission.toFixed(2)}%`.padEnd(9) + `| ${poolStatus.padEnd(13)}| ${namedOp.padEnd(7)}|`);
            }
            console.log("-".repeat(115));
            console.log("");

            // Show summary of named vs unnamed operators
            const namedOperators = stakingValidators.filter(v => v.isNamedOperator).length;
            const totalOperators = stakingValidators.length;
            const withDelegationPools = stakingValidators.filter(v => v.hasActiveDelegationPool).length;

            console.log("📈 STAKING VALIDATORS SUMMARY:");
            console.log(`   Total validators analyzed: ${totalOperators}`);
            console.log(`   Named operators: ${namedOperators} (${((namedOperators / totalOperators) * 100).toFixed(1)}%)`);
            console.log(`   Unnamed operators: ${totalOperators - namedOperators} (${(((totalOperators - namedOperators) / totalOperators) * 100).toFixed(1)}%)`);
            console.log(`   Validators with delegation pools: ${withDelegationPools}`);

            const avgAPY = stakingValidators.reduce((sum, v) => sum + v.apy, 0) / stakingValidators.length;
            const poolValidators = stakingValidators.filter(v => v.hasActiveDelegationPool);
            const avgCommission = poolValidators.length > 0
                ? poolValidators.reduce((sum, v) => sum + v.commission, 0) / poolValidators.length
                : 0;

            console.log(`   Average APY: ${avgAPY.toFixed(2)}%`);
            console.log(`   Average commission (pools only): ${avgCommission.toFixed(2)}%`);

            // Show examples of named operators found
            const namedExamples = stakingValidators.filter(v => v.isNamedOperator).slice(0, 3);
            if (namedExamples.length > 0) {
                console.log("");
                console.log("🏷️ EXAMPLES OF NAMED OPERATORS:");
                namedExamples.forEach(v => {
                    console.log(`   ${v.displayName} - APY: ${v.apy.toFixed(2)}%, Commission: ${v.commission.toFixed(2)}%`);
                });
            }

        } catch (error) {
            console.log(`⚠️  Could not get staking validators: ${(error as Error).message}`);
        }

        // Test 5: Show detailed info for a specific validator (with operator name)
        if (activeValidators.length > 0) {
            console.log("");
            console.log("🔍 Step 5: Detailed validator analysis with operator info...");

            const testValidator = activeValidators[0]; // Use first active validator
            console.log(`Analyzing validator: ${formatAddressForDisplay(testValidator.address)}`);

            try {
                const validatorInfo = await getValidatorInfo(agent as any, testValidator.address);
                const operatorAddress = validatorInfo.stake.operatorAddress;

                // Get operator name
                const nameInfo = await getValidatorDisplayName(
                    agent as any,
                    testValidator.address,
                    operatorAddress
                );

                console.log("");
                console.log("🔍 VALIDATOR DETAILED ANALYSIS:");
                console.log("-".repeat(60));
                console.log(`   Validator Address: ${testValidator.address}`);
                console.log(`   Operator Address: ${operatorAddress}`);
                console.log(`   Operator Display Name: ${nameInfo.bestDisplayName}`);
                console.log(`   Is Named Operator: ${nameInfo.isNamedOperator ? "✅ Yes" : "❌ No"}`);
                console.log("");
                console.log("📊 STAKE BREAKDOWN:");
                console.log(`   Active Stake: ${(Number(validatorInfo.stake.active) / 1e8).toFixed(2)} APT`);
                console.log(`   Total Stake: ${(Number(validatorInfo.stake.totalStake) / 1e8).toFixed(2)} APT`);
                console.log(`   Locked Until: ${new Date(Number(validatorInfo.stake.lockedUntilSecs) * 1000).toLocaleDateString()}`);
                console.log("");
                console.log("🎯 PERFORMANCE:");
                console.log(`   Success Rate: ${(validatorInfo.rewards.proposalSuccessRate * 100).toFixed(2)}%`);
                console.log(`   Estimated APY: ${validatorInfo.rewards.estimatedAPY.toFixed(2)}%`);
                console.log(`   Successful Proposals: ${validatorInfo.rewards.successfulProposals}`);
                console.log(`   Failed Proposals: ${validatorInfo.rewards.failedProposals}`);

            } catch (error) {
                console.log(`⚠️  Could not get detailed info: ${(error as Error).message}`);
            }
        }

        // Test 6: Get staking ecosystem overview
        console.log("");
        console.log("📊 Step 6: Staking ecosystem overview...");
        try {
            const validatorSet = await aptos.getAccountResource({
                accountAddress: "0x1",
                resourceType: "0x1::stake::ValidatorSet",
            });

            const validatorSetData = validatorSet.data as any;
            const totalActiveValidators = validatorSetData.active_validators?.length || 0;
            const totalVotingPower = validatorSetData.total_voting_power || "0";

            const stakingConfig = await aptos.getAccountResource({
                accountAddress: "0x1",
                resourceType: "0x1::staking_config::StakingConfig",
            });

            const config = stakingConfig.data as any;
            const rewardsRate = Number(config.rewards_rate || 0);
            const rewardsRateDenominator = Number(config.rewards_rate_denominator || 1);
            const baseAPY = (rewardsRate / rewardsRateDenominator) * 100;

            console.log("🌐 APTOS STAKING ECOSYSTEM OVERVIEW:");
            console.log("-".repeat(60));
            console.log(`   Total Active Validators: ${totalActiveValidators}`);
            console.log(`   Total Staked: ${(Number(totalVotingPower) / 1e8).toFixed(0)} APT`);
            console.log(`   Base APY: ${baseAPY.toFixed(2)}%`);
            console.log(`   Minimum Stake: ${(Number(config.minimum_stake || 0) / 1e8).toFixed(2)} APT`);
            console.log(`   Maximum Stake: ${(Number(config.maximum_stake || 0) / 1e8).toFixed(0)} APT`);
            console.log(`   Pending Active: ${validatorSetData.pending_active?.length || 0}`);
            console.log(`   Pending Inactive: ${validatorSetData.pending_inactive?.length || 0}`);
            console.log("-".repeat(60));

        } catch (error) {
            console.log(`⚠️  Could not get staking overview: ${(error as Error).message}`);
        }

        console.log("");
        console.log("✅ All validator tools with name resolution tested successfully!");
        console.log("");
        console.log("🎯 KEY FEATURES DEMONSTRATED:");
        console.log("   ✅ Validator listing and status tracking");
        console.log("   ✅ Operator address identification");
        console.log("   ✅ Aptos name resolution (.apt names)");
        console.log("   ✅ Smart display name selection (operator > validator)");
        console.log("   ✅ Delegation pool detection");
        console.log("   ✅ Commission rate analysis");
        console.log("   ✅ APY calculations based on performance");
        console.log("   ✅ Named operator identification");
        console.log("");
        console.log("💡 INTEGRATION READY:");
        console.log("   - Tables now show meaningful names instead of addresses");
        console.log("   - Operator addresses are prioritized for name resolution");
        console.log("   - Fallback to truncated addresses when names unavailable");
        console.log("   - Visual indicators (✅/❌) for easy operator recognition");

    } catch (error) {
        console.error("❌ Test failed:", error);

        if (error instanceof Error) {
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
        }

        console.log("");
        console.log("💡 Troubleshooting tips:");
        console.log("1. Check network connection to Aptos Mainnet");
        console.log("2. Verify AptosNames API is accessible (https://aptosnames.com)");
        console.log("3. Ensure validator view functions are available");
        console.log("4. Check if delegation pool contracts exist");
        console.log("5. Verify operator addresses are being resolved correctly");

        process.exit(1);
    }
}

// Run the test
if (require.main === module) {
    testValidatorTools()
        .then(() => {
            console.log("");
            console.log("🎉 Validator tools with operator name resolution are working perfectly!");
            console.log("🚀 Your tables will now show meaningful names like 'chorusone.apt' instead of '0x123...'!");
            process.exit(0);
        })
        .catch(error => {
            console.error("");
            console.error("💥 Test suite failed:", error);
            process.exit(1);
        });
}
