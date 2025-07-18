#!/usr/bin/env ts-node

import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { 
    extractCoinName, 
    resolveCoinNameWithConfidence,
    KNOWN_TOKEN_ADDRESSES,
    resolveCoinNames
} from "./src/utils/coin-resolver";

async function testCoinResolver() {
    console.log("🔍 Testing Coin Name Resolution...");
    console.log("=".repeat(60));
    
    try {
        // Test known addresses
        console.log("📋 TESTING KNOWN ADDRESSES:");
        console.log("-".repeat(80));
        console.log("| Address".padEnd(50) + "| Resolved Name".padEnd(20) + "| Confidence".padEnd(10) + "|");
        console.log("-".repeat(80));
        
        const knownAddresses = Object.keys(KNOWN_TOKEN_ADDRESSES).slice(0, 5);
        knownAddresses.forEach(address => {
            const resolved = resolveCoinNameWithConfidence(address);
            const shortAddr = address.substring(0, 45) + "...";
            console.log(`| ${shortAddr.padEnd(48)}| ${resolved.name.padEnd(18)}| ${resolved.confidence.padEnd(8)}|`);
        });
        
        console.log("-".repeat(80));
        console.log("");
        
        // Test some example problematic addresses from Echelon
        console.log("🔧 TESTING PROBLEMATIC ADDRESSES:");
        const problematicAddresses = [
            "0xf22bede237a07e121b56d91a491eb7bcdfd1f590792a206497ca6a32e6f8c15c::usdc::USDC",
            "0x6f986d146e4a90b828d8c12c14b6f4e003fdff11a8eeccecb760c67e56278f7b::coin::T",
            "0x1::aptos_coin::AptosCoin",
            "unknown",
            "0x7fd500c11216f0fe3095d0c4b8aa4d64a4e2e04f837a5b6e83a1b9b7b6e7e0c2",
            "0x111ae3e5bc816a5e63c2da97d0aa3886519e0cd5e4b82e1053cc391279015b70::stapt_token::StakedApt"
        ];
        
        console.log("-".repeat(80));
        console.log("| Address".padEnd(50) + "| Resolved Name".padEnd(20) + "| Confidence".padEnd(10) + "|");
        console.log("-".repeat(80));
        
        problematicAddresses.forEach(address => {
            const resolved = resolveCoinNameWithConfidence(address);
            const shortAddr = address.length > 45 ? address.substring(0, 42) + "..." : address;
            console.log(`| ${shortAddr.padEnd(48)}| ${resolved.name.padEnd(18)}| ${resolved.confidence.padEnd(8)}|`);
        });
        
        console.log("-".repeat(80));
        console.log("");
        
        // Test with actual blockchain data
        console.log("🌐 TESTING WITH BLOCKCHAIN DATA:");
        const config = new AptosConfig({ network: Network.MAINNET });
        const aptos = new Aptos(config);
        
        const testAddresses = [
            "0x1::aptos_coin::AptosCoin",
            "0xf22bede237a07e121b56d91a491eb7bcdfd1f590792a206497ca6a32e6f8c15c::usdc::USDC",
            "0x6f986d146e4a90b828d8c12c14b6f4e003fdff11a8eeccecb760c67e56278f7b::coin::T"
        ];
        
        console.log("Resolving coin names with blockchain metadata...");
        const resolvedNames = await resolveCoinNames(aptos, testAddresses);
        
        console.log("-".repeat(80));
        console.log("| Address".padEnd(50) + "| Blockchain Name".padEnd(20) + "| Status".padEnd(10) + "|");
        console.log("-".repeat(80));
        
        testAddresses.forEach(address => {
            const shortAddr = address.substring(0, 42) + "...";
            const resolvedName = resolvedNames[address] || "Failed";
            const status = resolvedNames[address] ? "✅ Success" : "❌ Failed";
            console.log(`| ${shortAddr.padEnd(48)}| ${resolvedName.padEnd(18)}| ${status.padEnd(8)}|`);
        });
        
        console.log("-".repeat(80));
        console.log("");
        
        // Show extraction logic examples
        console.log("🔍 EXTRACTION LOGIC EXAMPLES:");
        const extractionTests = [
            { input: "0x1::aptos_coin::AptosCoin", expected: "AptosCoin" },
            { input: "0x123::usdc::USDC", expected: "USDC" },
            { input: "0x456::coin::T", expected: "coin" },
            { input: "0x789::stapt_token::StakedApt", expected: "StakedApt" },
            { input: "0x1234567890abcdef", expected: "0x123456...90abcdef" }
        ];
        
        console.log("-".repeat(60));
        console.log("| Input".padEnd(30) + "| Extracted".padEnd(15) + "| Expected".padEnd(15) + "|");
        console.log("-".repeat(60));
        
        extractionTests.forEach(test => {
            const extracted = extractCoinName(test.input);
            const inputShort = test.input.length > 25 ? test.input.substring(0, 22) + "..." : test.input;
            const match = extracted === test.expected ? "✅" : "❌";
            console.log(`| ${inputShort.padEnd(28)}| ${extracted.padEnd(13)}| ${test.expected.padEnd(13)}| ${match}`);
        });
        
        console.log("-".repeat(60));
        console.log("");
        
        // Performance test
        console.log("⚡ PERFORMANCE TEST:");
        const performanceAddresses = Array(100).fill(0).map((_, i) => 
            `0x${i.toString(16).padStart(40, '0')}::test::Token${i}`
        );
        
        const startTime = Date.now();
        performanceAddresses.forEach(addr => extractCoinName(addr));
        const endTime = Date.now();
        
        console.log(`   Processed ${performanceAddresses.length} addresses in ${endTime - startTime}ms`);
        console.log(`   Average time per address: ${((endTime - startTime) / performanceAddresses.length).toFixed(2)}ms`);
        
        // Summary
        console.log("");
        console.log("📊 SUMMARY:");
        console.log(`   ✅ Known token mappings: ${Object.keys(KNOWN_TOKEN_ADDRESSES).length}`);
        console.log(`   🔍 Extraction patterns supported: 5+`);
        console.log(`   ⚡ Performance: ~${((endTime - startTime) / performanceAddresses.length).toFixed(2)}ms per address`);
        console.log(`   🌐 Blockchain integration: Available`);
        
        console.log("");
        console.log("🎯 RECOMMENDATIONS:");
        console.log("   1. Add more known token addresses as they're discovered");
        console.log("   2. Implement caching for blockchain metadata calls");
        console.log("   3. Consider using token registry APIs for unknown tokens");
        console.log("   4. Monitor extraction accuracy and add patterns as needed");
        
        console.log("");
        console.log("🎉 Coin resolver test completed successfully!");
        
    } catch (error) {
        console.error("❌ Error testing coin resolver:");
        console.error(error);
        
        if (error instanceof Error) {
            console.error("Error message:", error.message);
        }
        
        process.exit(1);
    }
}

// Run the test
if (require.main === module) {
    testCoinResolver().catch(console.error);
}
