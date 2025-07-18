// import { getUserAllPositions } from "../joule/user-all-positions";
import { listAllJoulePools } from "./joule/list-all-pools";

/**
 * Get user positions across all protocols
 * @param aptosClient Aptos client instance
 * @param userAddress User address
 * @returns Aggregated positions from all protocols
 */
export async function getAllUserPositions(aptosClient: any, userAddress: string): Promise<any> {
    const allPositions: any[] = [];
    
    try {
        // Get Joule positions using view function
        const joulePositions = await aptosClient.view({
            payload: {
                function: "0x2fe576faa841347a9b1b32c869685deb75a15e3f62dfe37cbd6d52cc403a16f6::pool::user_positions_map",
                functionArguments: [userAddress]
            }
        });
        
        if (joulePositions && Array.isArray(joulePositions[0])) {
            allPositions.push(...joulePositions[0].map((position: any) => ({
                ...position,
                protocol: "joule",
                type: "lending"
            })));
        }
    } catch (error) {
        console.warn("Failed to get Joule positions:", error);
    }

    // TODO: Add other protocol positions when available
    // - Aries positions
    // - MerkleTrade positions
    // - Thala positions

    return {
        totalPositions: allPositions.length,
        positions: allPositions,
        protocols: [...new Set(allPositions.map(p => p.protocol))]
    };
}

/**
 * Get user portfolio value across all protocols
 * @param aptosClient Aptos client instance
 * @param userAddress User address
 * @returns Portfolio summary with total value
 */
export async function getUserPortfolioSummary(aptosClient: any, userAddress: string): Promise<any> {
    try {
        const positions = await getAllUserPositions(aptosClient, userAddress);
        const pools = await listAllJoulePools();
        
        let totalLent = 0;
        let totalBorrowed = 0;
        let totalCollateral = 0;
        
        // Calculate portfolio values
        positions.positions.forEach((position: any) => {
            if (position.protocol === "joule") {
                // Find matching pool for price calculation
                const pool = pools.find((p: any) => p.tokenAddress === position.asset);
                const price = pool?.price || 1;
                
                if (position.supplied > 0) {
                    totalLent += position.supplied * price;
                }
                if (position.borrowed > 0) {
                    totalBorrowed += position.borrowed * price;
                }
                totalCollateral += (position.supplied - position.borrowed) * price;
            }
        });
        
        return {
            summary: {
                totalLent,
                totalBorrowed,
                totalCollateral,
                netWorth: totalCollateral,
                healthFactor: totalBorrowed > 0 ? totalCollateral / totalBorrowed : null
            },
            positions: positions.positions,
            protocols: positions.protocols
        };
    } catch (error: any) {
        throw new Error(`Failed to get portfolio summary: ${error.message}`);
    }
}
