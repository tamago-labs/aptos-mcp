import { z } from "zod";
import { getAllUserPositions, getUserPortfolioSummary } from "../tools/portfolio";

const GetAllUserPositionsInputSchema = z.object({
    aptosClient: z.any().describe("Aptos client instance"),
    userAddress: z.string().describe("User address to get positions for")
});

export const GetAllUserPositionsTool = {
    name: "get_all_user_positions",
    description: "Get user positions across all DeFi protocols (Joule, Aries, MerkleTrade, etc.)",
    schema: GetAllUserPositionsInputSchema,
    handler: async (input: any) => {
        return await getAllUserPositions(input.aptosClient, input.userAddress);
    }
};

const GetUserPortfolioSummaryInputSchema = z.object({
    aptosClient: z.any().describe("Aptos client instance"),
    userAddress: z.string().describe("User address to get portfolio summary for")
});

export const GetUserPortfolioSummaryTool = {
    name: "get_user_portfolio_summary",
    description: "Get comprehensive portfolio summary with total value across all protocols",
    schema: GetUserPortfolioSummaryInputSchema,
    handler: async (input: any) => {
        return await getUserPortfolioSummary(input.aptosClient, input.userAddress);
    }
};
