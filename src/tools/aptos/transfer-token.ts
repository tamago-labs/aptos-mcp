import {
    type AccountAddress,
    type InputGenerateTransactionPayloadData,
} from "@aptos-labs/ts-sdk";
import type { AptosAgent } from "../../agent";

/**
 * Transfer APT, tokens or fungible asset to a recipient
 * @param agent AptosAgent instance
 * @param to Recipient's address
 * @param amount Amount to transfer
 * @param mint Token type to transfer
 * @returns Transaction hash
 */
export async function transferTokens(
    agent: AptosAgent,
    to: AccountAddress,
    amount: number,
    mint: string
): Promise<string> {
    const COIN_STANDARD_DATA: InputGenerateTransactionPayloadData = {
        function: "0x1::coin::transfer",
        typeArguments: [mint],
        functionArguments: [to.toString(), amount],
    };

    const FUNGIBLE_ASSET_DATA: InputGenerateTransactionPayloadData = {
        function: "0x1::primary_fungible_store::transfer",
        typeArguments: ["0x1::fungible_asset::Metadata"],
        functionArguments: [mint, to.toString(), amount],
    };

    try {
        const transaction = await agent.aptos.transaction.build.simple({
            sender: agent.account.accountAddress,
            data: mint.split("::").length === 3 ? COIN_STANDARD_DATA : FUNGIBLE_ASSET_DATA,
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
            console.error(waitForTransaction, "Token transfer failed");
            throw new Error("Token transfer failed");
        }

        return waitForTransaction.hash;
    } catch (error: any) {
        throw new Error(`Token transfer failed: ${error.message}`);
    }
}
