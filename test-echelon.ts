#!/usr/bin/env ts-node

import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { listEchelonMarkets } from "./src/tools/echelon/index";

async function testEchelonPools() {
    console.log("🔍 Testing Echelon Finance Pool Listing...");
    console.log("=" .repeat(50));
    
    try {
        // Create Aptos client
        const config = new AptosConfig({
            network: Network.MAINNET,
        });
        const aptos = new Aptos(config);
        
        console.log("📡 Connected to Aptos Mainnet");
        console.log("🏦 Fetching Echelon Finance markets...");
        console.log("");
        
        // List all Echelon markets
        const markets = await listEchelonMarkets(aptos);
        
        console.log(`✅ Found ${markets.length} Echelon Finance markets:`);
        console.log("");
        
        // Display markets in a formatted table
        console.log("📊 ECHELON FINANCE MARKETS:");
        console.log("-".repeat(100));
        console.log("| Market ID".padEnd(15) + "| Coin Name".padEnd(20) + "| Supply APR".padEnd(12) + "| Borrow APR".padEnd(12) + "| Price".padEnd(12) + "|");
        console.log("-".repeat(100));
        
        markets.forEach((market: any) => {
            const marketId = market.marketId.toString().substring(0, 12) + "...";
            const coinName = market.coinDisplayName || market.coinName || "Unknown";
            const supplyApr = market.error ? "ERROR" : `${(market.supplyApr * 100).toFixed(2)}%`;
            const borrowApr = market.error ? "ERROR" : `${(market.borrowApr * 100).toFixed(2)}%`;
            const price = market.error ? "ERROR" : `${market.price.toFixed(4)}`;
            
            console.log(`| ${marketId.padEnd(13)}| ${coinName.substring(0, 18).padEnd(18)}| ${supplyApr.padEnd(10)}| ${borrowApr.padEnd(10)}| ${price.padEnd(10)}|`);
        });
        
        console.log("-".repeat(100));
        console.log("");
        
        // Show summary statistics
        const validMarkets = markets.filter((m: any) => !m.error);
        const avgSupplyApr = validMarkets.reduce((sum: number, m: any) => sum + m.supplyApr, 0) / validMarkets.length;
        const avgBorrowApr = validMarkets.reduce((sum: number, m: any) => sum + m.borrowApr, 0) / validMarkets.length;
        const highestSupplyApr = Math.max(...validMarkets.map((m: any) => m.supplyApr));
        const highestBorrowApr = Math.max(...validMarkets.map((m: any) => m.borrowApr));
        
        console.log("📈 SUMMARY STATISTICS:");
        console.log(`   Total Markets: ${markets.length}`);
        console.log(`   Valid Markets: ${validMarkets.length}`);
        console.log(`   Average Supply APR: ${(avgSupplyApr * 100).toFixed(2)}%`);
        console.log(`   Average Borrow APR: ${(avgBorrowApr * 100).toFixed(2)}%`);
        console.log(`   Highest Supply APR: ${(highestSupplyApr * 100).toFixed(2)}%`);
        console.log(`   Highest Borrow APR: ${(highestBorrowApr * 100).toFixed(2)}%`);
        
        console.log("");
        console.log("🎉 Test completed successfully!");
        
        // Show detailed info for first market
        if (validMarkets.length > 0) {
            console.log("");
            console.log("🔍 DETAILED INFO FOR FIRST MARKET:");
            const firstMarket = validMarkets[0];
            console.log(JSON.stringify({
                marketId: firstMarket.marketId,
                coinName: firstMarket.coinName,
                coinDisplayName: firstMarket.coinDisplayName,
                coinAddress: firstMarket.coinAddress,
                supplyApr: firstMarket.supplyApr,
                borrowApr: firstMarket.borrowApr,
                price: firstMarket.price
            }, null, 2));
        }
        
        // Show coin name resolution summary
        console.log("");
        console.log("🏷️ COIN NAME RESOLUTION SUMMARY:");
        const knownCoins = markets.filter((m: any) => m.coinConfidence === 'high' || !m.coinConfidence).length;
        const extractedCoins = markets.filter((m: any) => m.coinConfidence === 'medium').length;
        const unknownCoins = markets.filter((m: any) => m.coinConfidence === 'low' || m.error).length;
        
        console.log(`   ✅ Known coins: ${knownCoins}`);
        console.log(`   🔍 Extracted names: ${extractedCoins}`);
        console.log(`   ⚠️ Unknown/Error: ${unknownCoins}`);
        
        if (extractedCoins > 0) {
            console.log("");
            console.log("   📝 Extracted coin examples:");
            markets.filter((m: any) => m.coinConfidence === 'medium').slice(0, 3).forEach((market: any) => {
                console.log(`      ${market.coinName}: ${market.coinAddress.substring(0, 30)}...`);
            });
        }
        
    } catch (error) {
        console.error("❌ Error testing Echelon pools:");
        console.error(error);
        
        if (error instanceof Error) {
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
        }
        
        console.log("");
        console.log("💡 Troubleshooting tips:");
        console.log("1. Check if Echelon contract address is correct");
        console.log("2. Verify network connection");
        console.log("3. Ensure view functions exist on the contract");
        console.log("4. Check if contract functions have correct names");
        
        process.exit(1);
    }
}

// Run the test
if (require.main === module) {
    testEchelonPools().catch(console.error);
}
