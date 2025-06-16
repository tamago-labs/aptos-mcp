import type { AptosAgent } from "../../agent";

/**
 * Stake APT with a validator
 * @param agent AptosAgent instance
 * @param validatorAddress Validator address to stake with
 * @param amount Amount to stake
 * @returns Transaction hash
 */
export async function stakeAPT(
    agent: AptosAgent,
    validatorAddress: string,
    amount: number
): Promise<string> {
    try {
        const transaction = await agent.aptos.transaction.build.simple({
            sender: agent.account.accountAddress,
            data: {
                function: "0x1::delegation_pool::add_stake",
                typeArguments: [],
                functionArguments: [validatorAddress, amount],
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
            console.error(waitForTransaction, "Staking failed");
            throw new Error("Staking failed");
        }

        return waitForTransaction.hash;
    } catch (error: any) {
        throw new Error(`Staking failed: ${error.message}`);
    }
}

/**
 * Unstake APT from a validator
 * @param agent AptosAgent instance
 * @param validatorAddress Validator address to unstake from
 * @param amount Amount to unstake
 * @returns Transaction hash
 */
export async function unstakeAPT(
    agent: AptosAgent,
    validatorAddress: string,
    amount: number
): Promise<string> {
    try {
        const transaction = await agent.aptos.transaction.build.simple({
            sender: agent.account.accountAddress,
            data: {
                function: "0x1::delegation_pool::unlock",
                typeArguments: [],
                functionArguments: [validatorAddress, amount],
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
            console.error(waitForTransaction, "Unstaking failed");
            throw new Error("Unstaking failed");
        }

        return waitForTransaction.hash;
    } catch (error: any) {
        throw new Error(`Unstaking failed: ${error.message}`);
    }
}
