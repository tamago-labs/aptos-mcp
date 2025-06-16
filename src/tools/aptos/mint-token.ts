import { type AccountAddress } from "@aptos-labs/ts-sdk";
import type { AptosAgent } from "../../agent";

/**
 * Mint tokens to a recipient
 * @param agent AptosAgent instance
 * @param to Recipient address
 * @param mint Token type
 * @param amount Amount to mint
 * @returns Transaction hash
 */
export async function mintToken(
    agent: AptosAgent,
    to: AccountAddress,
    mint: string,
    amount: number
): Promise<string> {
    try {
        const transaction = await agent.aptos.transaction.build.simple({
            sender: agent.account.accountAddress,
            data: {
                function: "0x1::managed_coin::mint",
                typeArguments: [mint],
                functionArguments: [to.toString(), amount],
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
            console.error(waitForTransaction, "Token minting failed");
            throw new Error("Token minting failed");
        }

        return waitForTransaction.hash;
    } catch (error: any) {
        throw new Error(`Token minting failed: ${error.message}`);
    }
}
