import { type InputGenerateTransactionPayloadData, type MoveStructId } from "@aptos-labs/ts-sdk";
import type { AptosAgent } from "../../agent";

/**
 * Withdraw lent tokens from Joule Finance
 * @param agent AptosAgent instance
 * @param amount Amount to withdraw
 * @param mint The Move struct ID of the token to withdraw
 * @param positionId The position ID to withdraw from
 * @param fungibleAsset Whether the token is a fungible asset
 * @returns Transaction signature
 */
export async function withdrawToken(
    agent: AptosAgent,
    amount: number,
    mint: MoveStructId,
    positionId: string,
    fungibleAsset: boolean = false
): Promise<string> {
    const COIN_STANDARD_DATA: InputGenerateTransactionPayloadData = {
        function: "0x2fe576faa841347a9b1b32c869685deb75a15e3f62dfe37cbd6d52cc403a16f6::pool::withdraw",
        typeArguments: [mint.toString()],
        functionArguments: [positionId, amount],
    };

    const FUNGIBLE_ASSET_DATA: InputGenerateTransactionPayloadData = {
        function: "0x2fe576faa841347a9b1b32c869685deb75a15e3f62dfe37cbd6d52cc403a16f6::pool::withdraw_fa",
        functionArguments: [positionId, mint.toString(), amount],
    };

    try {
        const transaction = await agent.aptos.transaction.build.simple({
            sender: agent.account.accountAddress,
            data: fungibleAsset ? FUNGIBLE_ASSET_DATA : COIN_STANDARD_DATA,
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
            console.error(signedTransaction, "Token withdraw failed");
            throw new Error("Token withdraw failed");
        }

        return waitForTransaction.hash;

    } catch (error: any) {
        throw new Error(`Token withdraw failed: ${error.message}`);
    }
}
