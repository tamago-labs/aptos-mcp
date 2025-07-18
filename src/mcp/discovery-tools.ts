import { z } from "zod";
import { listAllJoulePools, getAvailableJouleTokens } from "../tools/joule/list-all-pools";
import { listLiquidswapPools, getLiquidswapPoolInfo } from "../tools/liquidswap/list-pools";
import { listThalaPools, getThalaStakingPools } from "../tools/thala/list-pools";
import { 
    listAllSupportedTokens, 
    searchTokens, 
    getAllLiquidityPools, 
    getBestLendingRates 
} from "../tools/discovery";

const ListJoulePoolsInputSchema = z.object({});

export const ListJoulePoolsTool = {
    name: "list_joule_pools",
    description: "List all available lending pools on Joule Finance with APY and liquidity information",
    schema: ListJoulePoolsInputSchema,
    handler: async (agent: any, input: any) => {
        return await listAllJoulePools();
    }
};

const ListLiquidswapPoolsInputSchema = z.object({});

export const ListLiquidswapPoolsTool = {
    name: "list_liquidswap_pools", 
    description: "List all available liquidity pools on Liquidswap DEX",
    schema: ListLiquidswapPoolsInputSchema,
    handler: async (agent: any, input: any) => {
        return await listLiquidswapPools(agent.aptos);
    }
};

const GetLiquidswapPoolInfoInputSchema = z.object({
    tokenA: z.string().describe("First token address"),
    tokenB: z.string().describe("Second token address")
});

export const GetLiquidswapPoolInfoTool = {
    name: "get_liquidswap_pool_info",
    description: "Get specific pool information for a token pair on Liquidswap",
    schema: GetLiquidswapPoolInfoInputSchema,
    handler: async (agent: any, input: any) => {
        return await getLiquidswapPoolInfo(agent.aptos, input.tokenA, input.tokenB);
    }
};

const ListThalaPoolsInputSchema = z.object({});

export const ListThalaPoolsTool = {
    name: "list_thala_pools",
    description: "List all available pools on Thala (both DEX and staking pools)",
    schema: ListThalaPoolsInputSchema,
    handler: async (agent: any, input: any) => {
        return await listThalaPools(agent.aptos);
    }
};

const ListAllSupportedTokensInputSchema = z.object({});

export const ListAllSupportedTokensTool = {
    name: "list_all_supported_tokens",
    description: "Get all supported tokens across all protocols",
    schema: ListAllSupportedTokensInputSchema,
    handler: async (agent: any, input: any) => {
        return await listAllSupportedTokens();
    }
};

const SearchTokensInputSchema = z.object({
    query: z.string().describe("Search query for token name, symbol, or address")
});

export const SearchTokensTool = {
    name: "search_tokens",
    description: "Search for tokens by name, symbol, or address across all protocols",
    schema: SearchTokensInputSchema,
    handler: async (agent: any, input: any) => {
        return await searchTokens(input.query);
    }
};

const GetBestLendingRatesInputSchema = z.object({});

export const GetBestLendingRatesTool = {
    name: "get_best_lending_rates",
    description: "Get the best lending rates across all lending protocols",
    schema: GetBestLendingRatesInputSchema,
    handler: async (agent: any, input: any) => {
        return await getBestLendingRates();
    }
};

const GetAllLiquidityPoolsInputSchema = z.object({});

export const GetAllLiquidityPoolsTool = {
    name: "get_all_liquidity_pools",
    description: "Get all liquidity pools across all DEX protocols",
    schema: GetAllLiquidityPoolsInputSchema,
    handler: async (agent: any, input: any) => {
        return await getAllLiquidityPools(agent.aptos);
    }
};
