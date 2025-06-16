import type { MoveStructId } from "@aptos-labs/ts-sdk";
import type { AptosAgent } from "../../agent";

/**
 * Redeem MOD stablecoin for collateral on Thala
 * @param agent AptosAgent instance
 * @param collateralType Type of collateral to receive
 * @param modAmount Amount of MOD to redeem
 * @returns Transaction signature
 */
export async function redeemMod(
    agent: AptosAgent,
    collateralType: MoveStructId,
    modAmount: number
): Promise<string> {
    try {
        const transaction = await agent.aptos.transaction.build.simple({
            sender: agent.account.accountAddress,
            data: {
                function: "0xfaf4e633ae9eb31366c9ca24214231760926576c7b625313b3688b5e900731f6::stability::redeem_mod",
                typeArguments: [collateralType],
                functionArguments: [modAmount],
            },
        });

        const signedTransaction = agent.aptos.transaction.sign({
            signer: agent.account,
            transaction,
        });

        const submittedTransaction = await agent.aptos.transaction.submit.simple({
            transaction,
            senderAuthenticator: signedTransaction,
        });

        const waitForTransaction = await agent.aptos.waitForTransaction({
            transactionHash: submittedTransaction.hash,
        });

        if (!waitForTransaction.success) {
            console.error(signedTransaction, "Redeem MOD failed");
            throw new Error("Redeem MOD failed");
        }

        return waitForTransaction.hash;

    } catch (error: any) {
        throw new Error(`Redeem MOD failed: ${error.message}`);
    }
}
