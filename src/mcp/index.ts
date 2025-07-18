import { GetBalanceTool } from "./aptos/get-balance-tool";
import { GetAddressTool } from "./aptos/get-address-tool";
import { TransferTokenTool } from "./aptos/transfer-token-tool";
import { CreateTokenTool } from "./aptos/create-token-tool";
import { MintTokenTool } from "./aptos/mint-token-tool";
import { BurnTokenTool } from "./aptos/burn-token-tool";
import { GetTokenPriceTool } from "./aptos/get-token-price-tool";
import { GetTransactionTool } from "./aptos/get-transaction-tool";
import { SwapTokensTool } from "./liquidswap/swap-tokens-tool";
import { AddLiquidityTool, RemoveLiquidityTool, CreatePoolTool } from "./liquidswap/liquidity-tools";
import { StakeAPTTool, UnstakeAPTTool } from "./staking/stake-tools";
import {
    JouleLendTool,
    JouleBorrowTool,
    JouleRepayTool,
    JouleWithdrawTool,
    JouleGetPositionTool,
    JouleGetAllPositionsTool,
    JouleClaimRewardTool,
    JouleListPoolsTool
} from "./joule/joule-tools";
import {
    ThalaStakeTool,
    ThalaUnstakeTool,
    ThalaMintModTool,
    ThalaRedeemModTool
} from "./thala/thala-tools";
import {
    ListEchelonMarketsTool,
    GetEchelonMarketInfoTool,
    GetEchelonUserPositionTool
} from "./echelon/echelon-tools";
import {
    PlaceMerkleMarketOrderTool,
    PlaceMerkleLimitOrderTool,
    CloseMerklePositionTool,
    GetMerklePositionsTool
} from "./merkletrade/merkletrade-tools";
import {
    SwapWithPanoraTool,
    GetPanoraQuoteTool
} from "./panora/panora-tools";
import {
    ListLiquidswapPoolsTool,
    GetLiquidswapPoolInfoTool,
    ListThalaPoolsTool
} from "./liquidswap/pool-tools";


export const AptosMcpTools = {
    // Core Aptos Tools
    "GetBalanceTool": GetBalanceTool,
    "GetAddressTool": GetAddressTool,
    "TransferTokenTool": TransferTokenTool,
    "CreateTokenTool": CreateTokenTool,
    "MintTokenTool": MintTokenTool,
    "BurnTokenTool": BurnTokenTool,
    "GetTokenPriceTool": GetTokenPriceTool,
    "GetTransactionTool": GetTransactionTool,

    // Liquidswap DEX Tools
    "SwapTokensTool": SwapTokensTool,
    "AddLiquidityTool": AddLiquidityTool,
    "RemoveLiquidityTool": RemoveLiquidityTool,
    "CreatePoolTool": CreatePoolTool,

    // Basic Staking Tools
    "StakeAPTTool": StakeAPTTool,
    "UnstakeAPTTool": UnstakeAPTTool,

    // Joule Finance - Lending Protocol
    "JouleLendTool": JouleLendTool,
    "JouleBorrowTool": JouleBorrowTool,
    "JouleRepayTool": JouleRepayTool,
    "JouleWithdrawTool": JouleWithdrawTool,
    "JouleGetPositionTool": JouleGetPositionTool,
    "JouleGetAllPositionsTool": JouleGetAllPositionsTool,
    "JouleClaimRewardTool": JouleClaimRewardTool,
    "JouleListPoolsTool": JouleListPoolsTool,

    // Thala Finance - Liquid Staking & Stable Coin
    "ThalaStakeTool": ThalaStakeTool,
    "ThalaUnstakeTool": ThalaUnstakeTool,
    "ThalaMintModTool": ThalaMintModTool,
    "ThalaRedeemModTool": ThalaRedeemModTool,

    // Pool Listing Tools
    "ListLiquidswapPoolsTool": ListLiquidswapPoolsTool,
    "GetLiquidswapPoolInfoTool": GetLiquidswapPoolInfoTool,
    "ListThalaPoolsTool": ListThalaPoolsTool,

    // Echelon Finance - Market Data Only
    "ListEchelonMarketsTool": ListEchelonMarketsTool,
    "GetEchelonMarketInfoTool": GetEchelonMarketInfoTool,
    "GetEchelonUserPositionTool": GetEchelonUserPositionTool,

    // MerkleTrade - Perpetual Trading
    "PlaceMerkleMarketOrderTool": PlaceMerkleMarketOrderTool,
    "PlaceMerkleLimitOrderTool": PlaceMerkleLimitOrderTool,
    "CloseMerklePositionTool": CloseMerklePositionTool,
    "GetMerklePositionsTool": GetMerklePositionsTool,

    // Panora - DEX Aggregator
    "SwapWithPanoraTool": SwapWithPanoraTool,
    "GetPanoraQuoteTool": GetPanoraQuoteTool
 
}
