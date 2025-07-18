import { z } from "zod";
import { 
    listEchelonMarkets, 
    getEchelonUserPosition,
    getEchelonMarketInfo,
    formatAprAsPercentage,
    formatPrice
} from "../../tools/echelon";

const ListEchelonMarketsInputSchema = z.object({});

export const ListEchelonMarketsTool = {
    name: "list_echelon_markets",
    description: "List all available lending markets on Echelon Finance with supply/borrow APY data",
    schema: ListEchelonMarketsInputSchema,
    handler: async (agent: any, input: any) => {
        const markets = await listEchelonMarkets(agent.aptos);
        
        // Add formatted values for better readability
        const formattedMarkets = markets.map((market: any) => ({
            ...market,
            supplyAprFormatted: formatAprAsPercentage(market.supplyApr),
            borrowAprFormatted: formatAprAsPercentage(market.borrowApr),
            priceFormatted: formatPrice(market.price)
        }));

        return {
            message: `Retrieved ${markets.length} Echelon Finance markets`,
            markets: formattedMarkets,
            summary: {
                totalMarkets: markets.length,
                validMarkets: markets.filter((m: any) => !m.error).length,
                errorMarkets: markets.filter((m: any) => m.error).length
            }
        };
    }
};

const GetEchelonMarketInfoInputSchema = z.object({
    marketId: z.string().describe("Market identifier to get information for")
});

export const GetEchelonMarketInfoTool = {
    name: "get_echelon_market_info", 
    description: "Get detailed information for a specific Echelon Finance market",
    schema: GetEchelonMarketInfoInputSchema,
    handler: async (agent: any, input: any) => {
        const marketInfo = await getEchelonMarketInfo(agent.aptos, input.marketId);
        
        return {
            message: `Retrieved market information for ${input.marketId}`,
            market: {
                ...marketInfo,
                supplyAprFormatted: formatAprAsPercentage(marketInfo.supplyApr),
                borrowAprFormatted: formatAprAsPercentage(marketInfo.borrowApr),
                priceFormatted: formatPrice(marketInfo.price)
            }
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

// Export only the market data tools - no lending/borrowing functionality
