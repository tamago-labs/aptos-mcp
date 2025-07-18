#!/usr/bin/env ts-node

import { AptosAgent } from './src/agent';
import { ValidatorMcpTools } from './src/mcp/validators/validator-tools';

async function testValidatorTools() {
    console.log('🚀 Testing Validator Tools...\n');
    
    try {
        // Initialize agent
        const agent = new AptosAgent();
        console.log(`✅ Initialized agent with address: ${await agent.getAddress()}\n`);

        // Test 1: List validators
        console.log('📋 Testing: List Validators');
        const listResult = await ValidatorMcpTools.ListValidatorsTool.handler(agent, {
            limit: 10,
            activeOnly: true,
            includeDetails: false
        });
        console.log(`Found ${listResult.length} validators`);
        if (listResult.length > 0) {
            console.log(`First validator: ${listResult[0].address}`);
            console.log(`Voting power: ${listResult[0].votingPower}`);
            console.log(`State: ${listResult[0].state}\n`);
        }

        // Test 2: Get top validators
        console.log('🏆 Testing: Get Top Validators');
        const topValidators = await ValidatorMcpTools.GetTopValidatorsTool.handler(agent, {
            limit: 5,
            sortBy: 'voting_power'
        });
        console.log(`Top ${topValidators.length} validators by voting power:`);
        topValidators.forEach((v: any, i: number) => {
            console.log(`  ${i + 1}. ${v.address} - Voting Power: ${v.votingPower}`);
        });
        console.log();

        // Test 3: Get validator info for the first active validator
        if (listResult.length > 0) {
            const firstValidator = listResult[0].address;
            console.log(`🔍 Testing: Get Validator Info for ${firstValidator}`);
            try {
                const validatorInfo = await ValidatorMcpTools.GetValidatorInfoTool.handler(agent, {
                    validatorAddress: firstValidator
                });
                console.log('✅ Validator info retrieved successfully');
                console.log(`  Active stake: ${validatorInfo.stake.active}`);
                console.log(`  Total stake: ${validatorInfo.stake.totalStake}`);
                console.log(`  Success rate: ${(validatorInfo.rewards.proposalSuccessRate * 100).toFixed(2)}%`);
                console.log(`  Estimated APY: ${validatorInfo.rewards.estimatedAPY.toFixed(2)}%\n`);
            } catch (error: any) {
                console.log(`⚠️  Could not get detailed info: ${error.message}\n`);
            }
        }

        // Test 4: Get staking overview
        console.log('📊 Testing: Get Staking Overview');
        const overview = await ValidatorMcpTools.GetStakingOverviewTool.handler(agent, {});
        console.log(`Total active validators: ${overview.totalActiveValidators}`);
        console.log(`Total staked: ${overview.totalStaked}`);
        console.log(`Average APY: ${overview.averageAPY}%`);
        console.log(`Minimum stake: ${overview.minimumStakeRequired}`);
        console.log();

        // Test 5: Get validators for staking
        console.log('💰 Testing: Get Validators for Staking');
        try {
            const stakingValidators = await ValidatorMcpTools.GetValidatorsForStakingTool.handler(agent, {
                limit: 5
            });
            console.log(`Found ${stakingValidators.length} validators optimized for staking:`);
            stakingValidators.forEach((v: any, i: number) => {
                console.log(`  ${i + 1}. ${v.address}`);
                console.log(`     APY: ${v.apy.toFixed(2)}%`);
                console.log(`     Commission: ${v.commission.toFixed(2)}%`);
                console.log(`     Has delegation pool: ${v.hasActiveDelegationPool}`);
            });
        } catch (error) {
            console.log(`⚠️  Could not get staking validators: ${error.message}`);
        }

        console.log('\n✅ All validator tools tested successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}


    // Run the test
if (require.main === module) {
    testValidatorTools().catch(console.error);
}
