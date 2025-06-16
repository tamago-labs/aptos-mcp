import axios from "axios";

/**
 * Get pool details from Joule Finance
 * @param poolId Pool identifier
 * @returns Pool information including rates and liquidity
 */
export async function getPoolDetails(poolId: string): Promise<any> {
    try {
        const response = await axios.get(`https://api.joule.finance/pools/${poolId}`);
        return response.data;
    } catch (error: any) {
        throw new Error(`Failed to get pool details: ${error.message}`);
    }
}
