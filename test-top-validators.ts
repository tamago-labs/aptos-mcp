#!/usr/bin/env ts-node

import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { getTopValidators } from "./src/tools/validators/analyze-validators";
import { getAllValidators } from "./src/tools/validators/list-validators";

// Mock agent structure to match your existing pattern
const createMockAgent = (aptos: Aptos) => ({
    aptos,
    account: {
        accountAddress: { toString: () => "0x1" }
    }
});

async function testTopValidatorsTool() {
    console.log("🔍 Testing aptos_get_top_validators Tool...");
    console.log("=" .repeat(60));
    
    try {
        // Create Aptos client
        const config = new AptosConfig({
            network: Network.MAINNET,
        });
        const aptos = new Aptos(config);
        const agent = createMockAgent(aptos);
        
        console.log("📡 Connected to Aptos Mainnet");
        console.log("");
        
        // Test 1: First get all validators to see what we're working with
        console.log("📋 Step 1: Getting all validators...");
        const allValidators = await getAllValidators(agent as any);
        console.log(`✅ Found ${allValidators.length} total validators`);
        
        const activeValidators = allValidators.filter(v => v.isActive);
        console.log(`✅ Found ${activeValidators.length} active validators`);
        
        if (activeValidators.length === 0) {
            throw new Error("No active validators found!");
        }
        
        console.log("");
        console.log("📊 First 3 active validators (basic info):");
        activeValidators.slice(0, 3).forEach((v, i) => {
            console.log(`   ${i + 1}. ${v.address.substring(0, 20)}... - Voting Power: ${v.votingPower}`);
        });
        
        // Test 2: Test getTopValidators with minimal limit
        console.log("");
        console.log("🏆 Step 2: Testing getTopValidators with limit 3...");
        
        try {
            const topValidators = await getTopValidators(agent as any, 3);
            
            console.log(`✅ Successfully got ${topValidators.length} top validators:`);
            console.log("");
            console.log("📊 TOP VALIDATORS RESULT:");
            console.log("-".repeat(80));
            console.log("| Rank | Address                    | Voting Power | APY   | Success Rate |");
            console.log("-".repeat(80));
            
            topValidators.forEach(validator => {
                const address = validator.address.substring(0, 22) + "...";
                const votingPower = (Number(validator.votingPower) / 1e8).toFixed(0);
                const apy = validator.apy.toFixed(2);
                const successRate = (validator.successRate * 100).toFixed(1);
                
                console.log(`| ${validator.rank.toString().padEnd(4)} | ${address.padEnd(26)} | ${votingPower.padEnd(12)} | ${apy.padEnd(5)} | ${successRate.padEnd(12)} |`);
            });
            console.log("-".repeat(80));
            
        } catch (error) {
            console.error("❌ Error in getTopValidators:");
            console.error(error);
            
            // Let's try a simpler approach - just sort by voting power without detailed info
            console.log("");
            console.log("🔄 Trying simplified approach...");
            
            const simpleTop = activeValidators
                .sort((a, b) => Number(b.votingPower) - Number(a.votingPower))
                .slice(0, 3)
                .map((validator, index) => ({
                    address: validator.address,
                    rank: index + 1,
                    score: 0,
                    votingPower: validator.votingPower,
                    apy: 0, // Default values when detailed info fails
                    successRate: 0,
                    totalStake: validator.votingPower // Use voting power as proxy
                }));
            
            console.log("✅ Simplified top validators:");
            simpleTop.forEach(v => {
                console.log(`   ${v.rank}. ${v.address.substring(0, 30)}... - ${(Number(v.votingPower) / 1e8).toFixed(0)} APT`);
            });
        }
        
        // Test 3: Test different sorting criteria
        console.log("");
        console.log("🔍 Step 3: Testing different sorting criteria...");
        
        const sortingOptions = ['voting_power', 'apy', 'success_rate', 'total_stake'] as const;
        
        for (const sortBy of sortingOptions) {
            try {
                console.log(`Testing sortBy: ${sortBy}...`);
                const result = await getTopValidators(agent as any, 2, sortBy);
                console.log(`✅ ${sortBy}: Got ${result.length} results`);
            } catch (error) {
                console.log(`❌ ${sortBy}: Failed - ${(error as Error).message}`);
            }
        }
        
        console.log("");
        console.log("✅ Top validators tool testing completed!");
        
    } catch (error) {
        console.error("❌ Test failed:", error);
        
        if (error instanceof Error) {
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
        }
        
        console.log("");
        console.log("💡 Debugging info:");
        console.log("1. Check if validator set resource exists at 0x1");
        console.log("2. Verify view functions are accessible");
        console.log("3. Check if individual validator resources exist");
        console.log("4. Test with smaller limits to isolate issues");
        
        process.exit(1);
    }
}

// Run the test
if (require.main === module) {
    testTopValidatorsTool()
        .then(() => {
            console.log("");
            console.log("🎉 Test completed successfully!");
            process.exit(0);
        })
        .catch(error => {
            console.error("");
            console.error("💥 Test suite failed:", error);
            process.exit(1);
        });
}
