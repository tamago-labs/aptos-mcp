import type { AptosAgent } from "../../agent";

/**
 * Get user position details from Joule Finance
 * @param agent AptosAgent instance
 * @param positionId The position ID to query
 * @returns Position details including balances and health
 */
export async function getUserPosition(agent: AptosAgent, positionId: string): Promise<any> {
    try {
        // Query the position resource on-chain
        const position = await agent.aptos.getAccountResource({
            accountAddress: agent.account.accountAddress,
            resourceType: `0x2fe576faa841347a9b1b32c869685deb75a15e3f62dfe37cbd6d52cc403a16f6::position::Position`,
        });

        return position;
    } catch (error: any) {
        throw new Error(`Failed to get user position: ${error.message}`);
    }
}
