import { type MoveStructId, convertAmountFromOnChainToHumanReadable } from "@aptos-labs/ts-sdk";
import type { AptosAgent } from "../../agent";

/**
 * Fetches balance of an aptos account
 * @param agent AptosAgent instance
 * @param mint Token type to check balance for
 * @returns Balance amount
 */
export async function getBalance(agent: AptosAgent, mint?: string | MoveStructId): Promise<number> {
    try {
        if (mint) {
            let balance: number;
            if (mint.split("::").length !== 3) {
                // Fungible asset
                const balances = await agent.aptos.getCurrentFungibleAssetBalances({
                    options: {
                        where: {
                            owner_address: {
                                _eq: agent.account.accountAddress.toString(),
                            },
                            asset_type: { _eq: mint },
                        },
                    },
                });

                balance = balances[0]?.amount ?? 0;
            } else {
                // Coin standard
                balance = await agent.aptos.getAccountCoinAmount({
                    accountAddress: agent.account.accountAddress,
                    coinType: mint as MoveStructId,
                });
            }
            return balance;
        }
        
        // Get APT balance
        const balance = await agent.aptos.getAccountAPTAmount({
            accountAddress: agent.account.accountAddress,
        });

        const convertedBalance = convertAmountFromOnChainToHumanReadable(balance, 8);
        return convertedBalance;
    } catch (error: any) {
        throw new Error(`Failed to get balance: ${error.message}`);
    }
}
