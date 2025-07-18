import type { AptosAgent } from "../../agent";

export interface DelegationPoolInfo {
    poolAddress: string;
    operatorCommissionPercentage: string;
    totalCoins: string;
    totalShares: string;
    inactiveShares: string;
    principalStake: string;
    pendingWithdrawals: string;
    minimumDeposit: string;
}

export interface DelegationPoolCommission {
    operatorCommissionPercentage: number;
    commissionPoolBalance: string;
}

/**
 * Get delegation pool information for a validator
 */
export async function getDelegationPoolInfo(
    agent: AptosAgent,
    poolAddress: string
): Promise<DelegationPoolInfo> {
    try {
        // Get delegation pool resource
        const poolResource = await agent.aptos.getAccountResource({
            accountAddress: poolAddress,
            resourceType: "0x1::delegation_pool::DelegationPool",
        });

        const poolData = poolResource.data as any;

        return {
            poolAddress,
            operatorCommissionPercentage: poolData.operator_commission_percentage?.toString() || "0",
            totalCoins: poolData.active_shares?.total_coins || "0",
            totalShares: poolData.active_shares?.total_shares || "0",
            inactiveShares: poolData.inactive_shares?.total_shares || "0",
            principalStake: poolData.active_shares?.total_coins || "0",
            pendingWithdrawals: poolData.pending_withdrawals || "0",
            minimumDeposit: "11000000" // 0.11 APT minimum (11M octas)
        };
    } catch (error: any) {
        throw new Error(`Failed to get delegation pool info: ${error.message}`);
    }
}

/**
 * Get user's delegation in a specific pool
 */
export async function getUserDelegation(
    agent: AptosAgent,
    poolAddress: string,
    userAddress?: string
): Promise<{
    activeStake: string;
    inactiveStake: string;
    pendingInactiveStake: string;
    rewards: string;
}> {
    try {
        const address = userAddress || agent.account.accountAddress.toString();
        
        // Get user's delegation pool shares
        const userShares = await agent.aptos.view({
            payload: {
                function: "0x1::delegation_pool::get_stake",
                typeArguments: [],
                functionArguments: [poolAddress, address],
            },
        });

        const shares = userShares as any[];
        
        return {
            activeStake: shares[0]?.toString() || "0",
            inactiveStake: shares[1]?.toString() || "0", 
            pendingInactiveStake: shares[2]?.toString() || "0",
            rewards: "0" // Would need additional calculation
        };
    } catch (error: any) {
        throw new Error(`Failed to get user delegation: ${error.message}`);
    }
}

/**
 * Get delegation pool commission information
 */
export async function getDelegationPoolCommission(
    agent: AptosAgent,
    poolAddress: string
): Promise<DelegationPoolCommission> {
    try {
        // Get the delegation pool resource
        const poolResource = await agent.aptos.getAccountResource({
            accountAddress: poolAddress,
            resourceType: "0x1::delegation_pool::DelegationPool",
        });

        const poolData = poolResource.data as any;
        
        return {
            operatorCommissionPercentage: Number(poolData.operator_commission_percentage || 0) / 100, // Convert from basis points
            commissionPoolBalance: poolData.operator_commission_percentage_shares?.total_coins || "0"
        };
    } catch (error: any) {
        throw new Error(`Failed to get delegation pool commission: ${error.message}`);
    }
}

/**
 * Get pending withdrawals from delegation pool
 */
export async function getPendingWithdrawals(
    agent: AptosAgent,
    poolAddress: string,
    userAddress?: string
): Promise<{
    pendingWithdrawals: Array<{
        amount: string;
        unlockEpoch: number;
    }>;
    totalPending: string;
}> {
    try {
        const address = userAddress || agent.account.accountAddress.toString();
        
        // Get pending withdrawals
        const pendingWithdrawals = await agent.aptos.view({
            payload: {
                function: "0x1::delegation_pool::get_pending_withdrawal",
                typeArguments: [],
                functionArguments: [poolAddress, address],
            },
        });

        const withdrawals = pendingWithdrawals as any[];
        
        return {
            pendingWithdrawals: withdrawals.map((w: any) => ({
                amount: w.amount?.toString() || "0",
                unlockEpoch: Number(w.unlock_epoch || 0)
            })),
            totalPending: withdrawals.reduce((sum, w) => sum + BigInt(w.amount || 0), BigInt(0)).toString()
        };
    } catch (error: any) {
        // If no pending withdrawals, return empty
        return {
            pendingWithdrawals: [],
            totalPending: "0"
        };
    }
}

/**
 * Check if an address has a delegation pool
 */
export async function hasDelegationPool(
    agent: AptosAgent,
    poolAddress: string
): Promise<boolean> {
    try {
        await agent.aptos.getAccountResource({
            accountAddress: poolAddress,
            resourceType: "0x1::delegation_pool::DelegationPool",
        });
        return true;
    } catch (error) {
        return false;
    }
}
