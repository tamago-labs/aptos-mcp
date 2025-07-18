import { z } from "zod";
import { swapWithPanora, getPanoraQuote } from "../../tools/panora";

const SwapWithPanoraInputSchema = z.object({
    fromToken: z.string().describe("Token address to swap from"),
    toToken: z.string().describe("Token address to swap to"),
    amount: z.number().describe("Amount to swap"),
    toWalletAddress: z.string().optional().describe("Destination wallet address (optional)"),
    apiKey: z.string().describe("Panora API key")
});

export const SwapWithPanoraTool = {
    name: "swap_with_panora",
    description: "Swap tokens using Panora DEX aggregator for best rates",
    schema: SwapWithPanoraInputSchema,
    handler: async (agent: any, input: any) => {
        return await swapWithPanora(
            agent.aptos,
            agent.account,
            input.fromToken,
            input.toToken,
            input.amount,
            input.toWalletAddress,
            input.apiKey
        );
    }
};

const GetPanoraQuoteInputSchema = z.object({
    fromToken: z.string().describe("Token address to swap from"),
    toToken: z.string().describe("Token address to swap to"),
    amount: z.number().describe("Amount to swap"),
    apiKey: z.string().describe("Panora API key")
});

export const GetPanoraQuoteTool = {
    name: "get_panora_quote",
    description: "Get a swap quote from Panora DEX aggregator",
    schema: GetPanoraQuoteInputSchema,
    handler: async (agent: any, input: any) => {
        return await getPanoraQuote(input.fromToken, input.toToken, input.amount, input.apiKey);
    }
};
