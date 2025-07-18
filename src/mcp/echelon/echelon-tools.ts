import { z } from "zod";
import { 
    listEchelonMarkets,
    supplyToEchelon,
    borrowFromEchelon,
    repayToEchelon,
    withdrawFromEchelon,
    getEchelonUserPosition
} from "../../tools/echelon";

const ListEchelonMarketsInputSchema = z.object({});

export const ListEchelonMarketsTool = {
    name: "list_echelon_markets",
    description: "List all available lending markets on Echelon Finance with supply/borrow APY data",
    schema: ListEchelonMarketsInputSchema,
    handler: async (agent: any, input: any) => {
        const markets = await listEchelonMarkets(agent.aptos);
        return {
            message: `Retrieved ${markets.length} Echelon Finance markets`,
            markets: markets
        };
    }
};

const SupplyToEchelonInputSchema = z.object({
    coinAddress: z.string().describe("Token address to supply"),
    market: z.string().describe("Market identifier"),
    amount: z.number().describe("Amount to supply")
});

export const SupplyToEchelonTool = {
    name: "supply_to_echelon",
    description: "Supply (lend) tokens to Echelon Finance to earn interest",
    schema: SupplyToEchelonInputSchema,
    handler: async (agent: any, input: any) => {
        const hash = await supplyToEchelon(
            agent.aptos,
            agent.account,
            input.coinAddress,
            input.market,
            input.amount
        );
        return {
            message: `Successfully supplied ${input.amount} tokens to Echelon market ${input.market}`,
            hash: hash
        };
    }
};

const BorrowFromEchelonInputSchema = z.object({
    coinAddress: z.string().describe("Token address to borrow"),
    market: z.string().describe("Market identifier"),
    amount: z.number().describe("Amount to borrow")
});

export const BorrowFromEchelonTool = {
    name: "borrow_from_echelon",
    description: "Borrow tokens from Echelon Finance using collateral",
    schema: BorrowFromEchelonInputSchema,
    handler: async (agent: any, input: any) => {
        const hash = await borrowFromEchelon(
            agent.aptos,
            agent.account,
            input.coinAddress,
            input.market,
            input.amount
        );
        return {
            message: `Successfully borrowed ${input.amount} tokens from Echelon market ${input.market}`,
            hash: hash
        };
    }
};

const RepayToEchelonInputSchema = z.object({
    coinAddress: z.string().describe("Token address to repay"),
    market: z.string().describe("Market identifier"),
    amount: z.number().describe("Amount to repay")
});

export const RepayToEchelonTool = {
    name: "repay_to_echelon",
    description: "Repay borrowed tokens to Echelon Finance",
    schema: RepayToEchelonInputSchema,
    handler: async (agent: any, input: any) => {
        const hash = await repayToEchelon(
            agent.aptos,
            agent.account,
            input.coinAddress,
            input.market,
            input.amount
        );
        return {
            message: `Successfully repaid ${input.amount} tokens to Echelon market ${input.market}`,
            hash: hash
        };
    }
};

const WithdrawFromEchelonInputSchema = z.object({
    coinAddress: z.string().describe("Token address to withdraw"),
    market: z.string().describe("Market identifier"),
    share: z.number().describe("Share amount to withdraw")
});

export const WithdrawFromEchelonTool = {
    name: "withdraw_from_echelon",
    description: "Withdraw supplied tokens from Echelon Finance",
    schema: WithdrawFromEchelonInputSchema,
    handler: async (agent: any, input: any) => {
        const hash = await withdrawFromEchelon(
            agent.aptos,
            agent.account,
            input.coinAddress,
            input.market,
            input.share
        );
        return {
            message: `Successfully withdrew tokens from Echelon market ${input.market}`,
            hash: hash
        };
    }
};

const GetEchelonUserPositionInputSchema = z.object({
    market: z.string().describe("Market identifier to check position for")
});

export const GetEchelonUserPositionTool = {
    name: "get_echelon_user_position",
    description: "Get user position details for a specific market on Echelon Finance",
    schema: GetEchelonUserPositionInputSchema,
    handler: async (agent: any, input: any) => {
        const position = await getEchelonUserPosition(
            agent.aptos,
            agent.account.accountAddress.toString(),
            input.market
        );
        return {
            message: `Retrieved position for market ${input.market}`,
            position: position
        };
    }
};
