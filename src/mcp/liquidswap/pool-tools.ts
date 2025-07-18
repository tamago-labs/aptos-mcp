import { z } from "zod";
import { listLiquidswapPools, getLiquidswapPoolInfo } from "../../tools/liquidswap/list-pools";
import { listThalaPools } from "../../tools/thala/list-pools";

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
