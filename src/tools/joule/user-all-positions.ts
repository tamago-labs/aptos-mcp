import type { AptosAgent } from "../../agent";

/**
 * Get all user positions from Joule Finance
 * @param agent AptosAgent instance
 * @returns Array of all user positions
 */
export async function getUserAllPositions(agent: AptosAgent): Promise<any[]> {
    try {
        // Query all position resources for the user
        const resources = await agent.aptos.getAccountResources({
            accountAddress: agent.account.accountAddress,
        });

        // Filter for Joule position resources
        const positions = resources.filter(resource =>
            resource.type.includes("0x2fe576faa841347a9b1b32c869685deb75a15e3f62dfe37cbd6d52cc403a16f6::position")
        );

        return positions;
    } catch (error: any) {
        throw new Error(`Failed to get user positions: ${error.message}`);
    }
}
