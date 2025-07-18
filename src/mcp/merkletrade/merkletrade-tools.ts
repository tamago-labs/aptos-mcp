import { z } from "zod";
import { 
    placeMerkleMarketOrder, 
    placeMerkleLimitOrder, 
    closeMerklePosition, 
    getMerklePositions,
    type MerkleOrderParams 
} from "../../tools/merkletrade";

const PlaceMerkleMarketOrderInputSchema = z.object({
    market: z.string().describe("Market identifier"),
    side: z.enum(["long", "short"]).describe("Position side"),
    size: z.number().describe("Position size"),
    reduceOnly: z.boolean().optional().describe("Whether this is a reduce-only order")
});

export const PlaceMerkleMarketOrderTool = {
    name: "place_merkle_market_order",
    description: "Place a market order on MerkleTrade perpetual exchange",
    schema: PlaceMerkleMarketOrderInputSchema,
    handler: async (agent: any, input: any) => {
        const params: MerkleOrderParams = {
            market: input.market,
            side: input.side,
            size: input.size,
            reduceOnly: input.reduceOnly
        };
        return await placeMerkleMarketOrder(agent.aptos, agent.account, params);
    }
};

const PlaceMerkleLimitOrderInputSchema = z.object({
    market: z.string().describe("Market identifier"),
    side: z.enum(["long", "short"]).describe("Position side"),
    size: z.number().describe("Position size"),
    price: z.number().describe("Limit price"),
    reduceOnly: z.boolean().optional().describe("Whether this is a reduce-only order")
});

export const PlaceMerkleLimitOrderTool = {
    name: "place_merkle_limit_order",
    description: "Place a limit order on MerkleTrade perpetual exchange",
    schema: PlaceMerkleLimitOrderInputSchema,
    handler: async (agent: any, input: any) => {
        const params: MerkleOrderParams = {
            market: input.market,
            side: input.side,
            size: input.size,
            price: input.price,
            reduceOnly: input.reduceOnly
        };
        return await placeMerkleLimitOrder(agent.aptos, agent.account, params);
    }
};

const CloseMerklePositionInputSchema = z.object({
    positionId: z.string().describe("Position ID to close"),
    size: z.number().optional().describe("Size to close (optional, closes full position if not specified)")
});

export const CloseMerklePositionTool = {
    name: "close_merkle_position",
    description: "Close a position on MerkleTrade perpetual exchange",
    schema: CloseMerklePositionInputSchema,
    handler: async (agent: any, input: any) => {
        return await closeMerklePosition(agent.aptos, agent.account, input.positionId, input.size);
    }
};

const GetMerklePositionsInputSchema = z.object({});

export const GetMerklePositionsTool = {
    name: "get_merkle_positions",
    description: "Get all open positions for a user on MerkleTrade",
    schema: GetMerklePositionsInputSchema,
    handler: async (agent: any, input: any) => {
        return await getMerklePositions(agent.aptos, agent.account.accountAddress.toString());
    }
};
