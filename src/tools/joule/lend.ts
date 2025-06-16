import { AccountAddress, type InputGenerateTransactionPayloadData, type MoveStructId } from "@aptos-labs/ts-sdk";
import type { AptosAgent } from "../../agent";

/**
 * Lend APT, tokens or fungible asset to a position in Joule Finance
 * @param agent AptosAgent instance
 * @param amount Amount to lend
 * @param mint The Move struct ID of the token to lend
 * @param positionId The position ID to lend to
 * @param newPosition Whether to create a new position or not
 * @param fungibleAsset Whether the token is a fungible asset
 * @returns Transaction signature and position ID
 */
export async function lendToken(
    agent: AptosAgent,
    amount: number,
    mint: MoveStructId,
    positionId: string,
    newPosition: boolean,
    fungibleAsset: boolean = false
): Promise<{ hash: string; positionId: string }> {
    const DEFAULT_FUNCTIONAL_ARGS = [positionId, amount, newPosition];

    const COIN_STANDARD_DATA: InputGenerateTransactionPayloadData = {
        function: "0x2fe576faa841347a9b1b32c869685deb75a15e3f62dfe37cbd6d52cc403a16f6::pool::lend",
        typeArguments: [mint.toString()],
        functionArguments: DEFAULT_FUNCTIONAL_ARGS,
    };

    const FUNGIBLE_ASSET_DATA: InputGenerateTransactionPayloadData = {
        function: "0x2fe576faa841347a9b1b32c869685deb75a15e3f62dfe37cbd6d52cc403a16f6::pool::lend_fa",
        functionArguments: [positionId, mint.toString(), newPosition, amount],
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
            console.error(signedTransaction, "Token lend failed");
            throw new Error("Token lend failed");
        }

        return {
            hash: waitForTransaction.hash,
            // @ts-ignore
            positionId: signedTransaction.events[0]?.data?.position_id || positionId,
        }; 
    } catch (error: any) {
        throw new Error(`Token lend failed: ${error.message}`);
    }
}
