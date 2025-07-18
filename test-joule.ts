#!/usr/bin/env ts-node

import { listAllJoulePools, getAvailableJouleTokens } from "./src/tools/joule/list-all-pools";

async function testJoulePools() {
    console.log("🔍 Testing Joule Finance Pool Listing...");
    console.log("=".repeat(50));
    
    try {
        console.log("🏦 Fetching Joule Finance pools...");
        console.log("");
        
        // List all Joule pools
        const pools = await listAllJoulePools();
        
        console.log(`✅ Found ${pools.length} Joule Finance pools:`);
        console.log("");
        
        // Display pools in a formatted table
        console.log("📊 JOULE FINANCE POOLS:");
        console.log("-".repeat(120));
        console.log(
            "| Asset".padEnd(12) + 
            "| Deposit APY".padEnd(12) + 
            "| Extra APY".padEnd(12) + 
            "| Borrow APY".padEnd(12) + 
            "| Price".padEnd(12) + 
            "| Market Size".padEnd(15) + 
            "| Available".padEnd(15) + 
            "| Utilization".padEnd(12) + 
            "| LTV".padEnd(8) + "|"
        );
        console.log("-".repeat(120));
        
        pools.forEach((pool: any) => {
            const asset = pool.assetName.substring(0, 10);
            const depositApy = `${(pool.depositApy * 100).toFixed(2)}%`;
            const extraApy = pool.extraDepositApy > 0 ? `${(pool.extraDepositApy * 100).toFixed(2)}%` : "0%";
            const borrowApy = `${(pool.borrowApy * 100).toFixed(2)}%`;
            const price = `$${pool.price.toFixed(4)}`;
            const marketSize = formatNumber(pool.marketSize);
            const available = formatNumber(pool.available);
            const utilization = `${(pool.utilization * 100).toFixed(1)}%`;
            const ltv = `${(pool.ltv * 100).toFixed(0)}%`;
            
            console.log(
                `| ${asset.padEnd(10)}| ${depositApy.padEnd(10)}| ${extraApy.padEnd(10)}| ${borrowApy.padEnd(10)}| ${price.padEnd(10)}| ${marketSize.padEnd(13)}| ${available.padEnd(13)}| ${utilization.padEnd(10)}| ${ltv.padEnd(6)}|`
            );
        });
        
        console.log("-".repeat(120));
        console.log("");
        
        // Show summary statistics
        const totalMarketSize = pools.reduce((sum: number, pool: any) => sum + (pool.marketSize * pool.price), 0);
        const totalAvailable = pools.reduce((sum: number, pool: any) => sum + (pool.available * pool.price), 0);
        const avgDepositApy = pools.reduce((sum: number, pool: any) => sum + pool.depositApy, 0) / pools.length;
        const avgBorrowApy = pools.reduce((sum: number, pool: any) => sum + pool.borrowApy, 0) / pools.length;
        const highestDepositApy = Math.max(...pools.map((pool: any) => pool.depositApy));
        const highestBorrowApy = Math.max(...pools.map((pool: any) => pool.borrowApy));
        const avgUtilization = pools.reduce((sum: number, pool: any) => sum + pool.utilization, 0) / pools.length;
        
        console.log("📈 SUMMARY STATISTICS:");
        console.log(`   Total Pools: ${pools.length}`);
        console.log(`   Total Market Size: $${formatNumber(totalMarketSize)}`);
        console.log(`   Total Available Liquidity: $${formatNumber(totalAvailable)}`);
        console.log(`   Average Deposit APY: ${(avgDepositApy * 100).toFixed(2)}%`);
        console.log(`   Average Borrow APY: ${(avgBorrowApy * 100).toFixed(2)}%`);
        console.log(`   Highest Deposit APY: ${(highestDepositApy * 100).toFixed(2)}%`);
        console.log(`   Highest Borrow APY: ${(highestBorrowApy * 100).toFixed(2)}%`);
        console.log(`   Average Utilization: ${(avgUtilization * 100).toFixed(1)}%`);
        
        console.log("");
        console.log("🎯 TOP POOLS BY DEPOSIT APY:");
        const topByDeposit = [...pools]
            .sort((a, b) => b.depositApy - a.depositApy)
            .slice(0, 3);
        
        topByDeposit.forEach((pool: any, index: number) => {
            const totalApy = pool.depositApy + pool.extraDepositApy;
            console.log(`   ${index + 1}. ${pool.assetName}: ${(pool.depositApy * 100).toFixed(2)}% + ${(pool.extraDepositApy * 100).toFixed(2)}% = ${(totalApy * 100).toFixed(2)}%`);
        });
        
        console.log("");
        console.log("💰 HIGHEST VALUE POOLS:");
        const topByValue = [...pools]
            .sort((a, b) => (b.marketSize * b.price) - (a.marketSize * a.price))
            .slice(0, 3);
        
        topByValue.forEach((pool: any, index: number) => {
            const value = pool.marketSize * pool.price;
            console.log(`   ${index + 1}. ${pool.assetName}: $${formatNumber(value)} (${formatNumber(pool.marketSize)} tokens)`);
        });
        
        console.log("");
        console.log("🔥 HIGHEST UTILIZATION POOLS:");
        const topByUtilization = [...pools]
            .filter(pool => pool.utilization > 0)
            .sort((a, b) => b.utilization - a.utilization)
            .slice(0, 3);
        
        topByUtilization.forEach((pool: any, index: number) => {
            console.log(`   ${index + 1}. ${pool.assetName}: ${(pool.utilization * 100).toFixed(1)}% (${formatNumber(pool.totalBorrowed)} borrowed)`);
        });
        
        console.log("");
        console.log("🪙 AVAILABLE TOKENS:");
        const tokens = await getAvailableJouleTokens();
        console.log(`   Found ${tokens.length} supported tokens:`);
        tokens.forEach((token: any) => {
            console.log(`   - ${token.name} (${token.address.substring(0, 10)}...): $${token.price.toFixed(4)}`);
        });
        
        console.log("");
        console.log("🎉 Test completed successfully!");
        
        // Show detailed info for first pool
        if (pools.length > 0) {
            console.log("");
            console.log("🔍 DETAILED INFO FOR FIRST POOL:");
            console.log(JSON.stringify(pools[0], null, 2));
        }
        
    } catch (error) {
        console.error("❌ Error testing Joule pools:");
        console.error(error);
        
        if (error instanceof Error) {
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
        }
        
        console.log("");
        console.log("💡 Troubleshooting tips:");
        console.log("1. Check internet connection");
        console.log("2. Verify Joule API is accessible at https://price-api.joule.finance/api/market");
        console.log("3. Check if API response format has changed");
        console.log("4. Ensure axios dependency is installed");
        
        process.exit(1);
    }
}

/**
 * Format numbers for better readability
 */
function formatNumber(num: number): string {
    if (num >= 1000000) {
        return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}K`;
    } else {
        return num.toFixed(2);
    }
}

// Run the test
if (require.main === module) {
    testJoulePools().catch(console.error);
}
