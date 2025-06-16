import type { AptosAgent } from "../../agent";

/**
 * Create a new token
 * @param agent AptosAgent instance
 * @param name Token name
 * @param symbol Token symbol
 * @param iconURI Icon URI
 * @param projectURI Project URI
 * @returns Transaction hash
 */
export async function createToken(
    agent: AptosAgent,
    name: string,
    symbol: string,
    iconURI: string,
    projectURI: string
): Promise<string> {
    try {
        const transaction = await agent.aptos.transaction.build.simple({
            sender: agent.account.accountAddress,
            data: {
                function: "0x1::managed_coin::initialize",
                typeArguments: [],
                functionArguments: [name, symbol, 8, false],
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
            console.error(waitForTransaction, "Token creation failed");
            throw new Error("Token creation failed");
        }

        return waitForTransaction.hash;
    } catch (error: any) {
        throw new Error(`Token creation failed: ${error.message}`);
    }
}
