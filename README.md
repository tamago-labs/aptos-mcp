# Aptos MCP

![NPM Version](https://img.shields.io/npm/v/@tamago-labs/aptos-mcp)

**Aptos MCP** is a comprehensive Model Context Protocol (MCP) server implementation for the Aptos blockchain, compatible with MCP clients like Claude Desktop or Cursor.ai. It provides a complete DeFi toolkit covering major Aptos protocols including pool discovery, lending, DEX operations, perpetual trading, liquid staking, and cross-protocol portfolio management.

## Features

- **50+ MCP tools** covering the complete Aptos DeFi ecosystem
- **Universal Pool Discovery** - Discover and list pools across all protocols
- **Complete DEX integration** - Liquidswap with swapping, liquidity management, and pool creation
- **Professional lending protocols** - Joule Finance and Aries Finance with full lending/borrowing workflow
- **Perpetual trading** - MerkleTrade integration for advanced trading strategies
- **DEX aggregation** - Panora Exchange for optimal swap routing
- **Liquid staking options** - Thala Finance and Amnis Finance integrations
- **Cross-protocol portfolio management** - Unified position tracking and analysis
- **Stablecoin operations** - MOD minting and redemption through Thala
- **Native APT staking** with validator insights from AI

## Using with Claude Desktop

1. Install Claude Desktop if you haven't already
2. Open Claude Desktop settings
3. Add the Aptos MCP client to your configuration:

```json
{
  "mcpServers": {
    "aptos-mcp": {
      "command": "npx",
      "args": [
        "-y",
        "@tamago-labs/aptos-mcp",
        "--aptos_private_key=YOUR_PRIVATE_KEY", 
        "--aptos_network=mainnet"
      ],
      "disabled": false
    }
  }
}
```

This Private Key mode is recommended for advanced users who can securely manage their private keys. The MCP client handles transactions locally without exposing any data to external servers.

## Use Cases

### 1. Complete DeFi Portfolio Management 
The agent connects to price oracles and major DeFi protocols to help you:

- **Discover and monitor** all available pools across DeFi protocols
- **Execute complex DeFi strategies** across lending, borrowing, and liquidity provision
- **Trade perpetuals** with advanced position management on MerkleTrade
- **Optimize swap routes** using Panora DEX aggregator for best rates
- **Manage liquid staking positions** with Thala and Amnis protocols
- **Track cross-protocol positions** with unified portfolio analysis
- **Trade and provide liquidity** on Liquidswap DEX with advanced pool management
- **Track lending positions** across Joule Finance and Aries Finance

### 2. Advanced DeFi Protocol Management
The agent assists DeFi protocol managers and power users with:

- **Universal pool discovery** across all Aptos DeFi protocols
- **Multi-protocol position management** across lending platforms
- **Perpetual trading strategies** with MerkleTrade integration
- **Liquidity optimization** strategies across different DEX pools
- **Cross-protocol yield farming** and reward optimization
- **Risk management** through diversified staking and lending
- **Real-time rate comparison** across lending protocols

## Available Tools

### Core Wallet Operations
| Tool Name | Description | Example Usage |
|-----------|-------------|---------------|
| `aptos_get_address` | Retrieve your wallet address | "What's my wallet address?" |
| `aptos_get_balance` | Get APT or token balance | "Show my APT balance" |
| `aptos_transfer_token` | Transfer tokens to another address | "Transfer 10 APT to 0x123..." |

### Token Management & Discovery
| Tool Name | Description | Example Usage |
|-----------|-------------|---------------|
| `aptos_create_token` | Create a new token on Aptos | "Create a token named MyToken with symbol MTK" |
| `aptos_mint_token` | Mint tokens to an address | "Mint 1000 MTK tokens to 0x456..." |
| `aptos_burn_token` | Burn tokens from your account | "Burn 100 MTK tokens" |
| `aptos_get_token_price` | Get token price | "What's the current price of APT?" |
| `list_all_supported_tokens` | Get all supported tokens across protocols | "Show me all available tokens" |
| `search_tokens` | Search tokens by name/symbol/address | "Find all USDC tokens" |

### Pool Discovery & Liquidity Management
| Tool Name | Description | Example Usage |
|-----------|-------------|---------------|
| `list_joule_pools` | List all Joule Finance lending pools | "Show all available lending pools" |
| `list_liquidswap_pools` | List all Liquidswap DEX pools | "Show all trading pools" |
| `get_liquidswap_pool_info` | Get specific pool information | "Show APT/USDC pool details" |
| `list_thala_pools` | List all Thala pools (DEX & staking) | "Show Thala pool options" |
| `get_all_liquidity_pools` | Aggregate pools from all DEXes | "Show all liquidity pools" |
| `get_best_lending_rates` | Compare rates across protocols | "Find best lending rates" |

### Liquidswap DEX Operations
| Tool Name | Description | Example Usage |
|-----------|-------------|---------------|
| `aptos_swap_tokens` | Swap tokens via Liquidswap | "Swap 10 APT for USDC" |
| `aptos_add_liquidity` | Add liquidity to earn fees | "Add 100 APT and 500 USDC to the pool" |
| `aptos_remove_liquidity` | Remove liquidity from pools | "Remove 50 LP tokens from APT/USDC pool" |
| `aptos_create_pool` | Create new trading pools | "Create a new pool for APT/USDT trading" |

### Joule Finance - Complete Lending Protocol
| Tool Name | Description | Example Usage |
|-----------|-------------|---------------|
| `aptos_joule_lend` | Lend tokens to earn interest | "Lend 100 APT to Joule Finance" |
| `aptos_joule_borrow` | Borrow tokens against collateral | "Borrow 50 USDC using my APT collateral" |
| `aptos_joule_repay` | Repay borrowed tokens | "Repay 25 USDC to my lending position" |
| `aptos_joule_withdraw` | Withdraw lent tokens | "Withdraw 50 APT from my lending position" |
| `aptos_joule_get_position` | Get specific position details | "Show details for position pos_123" |
| `aptos_joule_get_all_positions` | Get all lending positions | "Show all my Joule Finance positions" |
| `aptos_joule_claim_reward` | Claim lending rewards | "Claim rewards from my lending positions" |
| `aptos_joule_list_pools` | List all Joule lending pools | "Show available lending markets" |

### Aries Finance - Lending Protocol
| Tool Name | Description | Example Usage |
|-----------|-------------|---------------|
| `create_aries_profile` | Create user profile on Aries | "Set up my Aries Finance account" |
| `lend_on_aries` | Lend tokens to earn interest | "Lend 200 USDC to Aries Finance" |
| `borrow_on_aries` | Borrow tokens against collateral | "Borrow 100 APT using USDC collateral" |
| `repay_on_aries` | Repay borrowed tokens | "Repay 50 APT to Aries Finance" |
| `withdraw_from_aries` | Withdraw lent tokens | "Withdraw 100 USDC from Aries" |

### MerkleTrade - Perpetual Trading
| Tool Name | Description | Example Usage |
|-----------|-------------|---------------|
| `place_merkle_market_order` | Place market order for perps | "Long 1000 USDC worth of APT-PERP" |
| `place_merkle_limit_order` | Place limit order for perps | "Set limit buy for APT-PERP at $8.50" |
| `close_merkle_position` | Close trading position | "Close my APT-PERP position" |
| `get_merkle_positions` | Get all trading positions | "Show my perpetual positions" |

### Panora - DEX Aggregator
| Tool Name | Description | Example Usage |
|-----------|-------------|---------------|
| `swap_with_panora` | Swap with best rates across DEXes | "Swap 100 APT for USDC using Panora" |
| `get_panora_quote` | Get swap quote from aggregator | "Quote 50 USDC to APT via Panora" |

### Thala Finance - Liquid Staking & Stablecoin
| Tool Name | Description | Example Usage |
|-----------|-------------|---------------|
| `aptos_thala_stake` | Stake APT for thAPT (liquid staking) | "Stake 200 APT with Thala for thAPT" |
| `aptos_thala_unstake` | Unstake thAPT back to APT | "Unstake 100 thAPT tokens" |
| `aptos_thala_mint_mod` | Mint MOD stablecoin | "Mint 150 MOD using thAPT as collateral" |
| `aptos_thala_redeem_mod` | Redeem MOD for collateral | "Redeem 75 MOD tokens for thAPT" |

### Cross-Protocol Portfolio Management
| Tool Name | Description | Example Usage |
|-----------|-------------|---------------|
| `get_all_user_positions` | Get positions across all protocols | "Show all my DeFi positions" |
| `get_user_portfolio_summary` | Comprehensive portfolio analysis | "Analyze my complete portfolio" |

### Native Staking Operations
| Tool Name | Description | Example Usage |
|-----------|-------------|---------------|
| `aptos_stake_apt` | Stake APT with a validator | "Stake 100 APT with validator 0x123..." |
| `aptos_unstake_apt` | Unstake APT from a validator | "Unstake 50 APT from validator 0x123..." |

### Transaction Management
| Tool Name | Description | Example Usage |
|-----------|-------------|---------------|
| `aptos_get_transaction` | Get transaction details | "Show transaction 0xabc..." |

## Example Interactions

### Universal Pool Discovery
```
User: "Show me all available pools across all protocols on Aptos"

Agent: 
1. Uses list_joule_pools to show lending markets
2. Uses list_liquidswap_pools to show DEX pools  
3. Uses list_thala_pools to show Thala options
4. Uses get_best_lending_rates to compare yields
5. Provides comprehensive overview with recommendations
```

### Advanced DeFi Portfolio Analysis
```
User: "Analyze my complete DeFi portfolio across all protocols"

Agent:
1. Uses get_all_user_positions to aggregate all positions
2. Uses get_user_portfolio_summary for comprehensive analysis
3. Shows total value, yield breakdown, and risk assessment
4. Provides optimization recommendations across protocols
```

### Perpetual Trading Strategy
```
User: "Help me set up a long position on APT with proper risk management"

Agent:
1. Uses get_merkle_positions to check current exposure
2. Uses place_merkle_limit_order to enter position at target price
3. Sets up stop-loss and take-profit levels
4. Monitors position with regular updates
```

### Cross-Protocol Yield Optimization
```
User: "Find the best yields for my USDC across all lending protocols"

Agent:
1. Uses get_best_lending_rates to compare all protocols
2. Shows Joule Finance vs Aries Finance rates
3. Factors in additional rewards and risks
4. Executes optimal allocation across protocols
```

### DEX Aggregation for Best Rates
```
User: "Swap 1000 USDC for APT using the best available rate"

Agent:
1. Uses get_panora_quote to get aggregated pricing
2. Compares with direct Liquidswap rates
3. Uses swap_with_panora for optimal execution
4. Shows savings compared to single DEX
```

### Complete Lending Workflow
```
User: "I want to use my APT as collateral to borrow USDC, then track my position"

Agent:
1. Uses aptos_joule_lend to deposit APT as collateral
2. Uses aptos_joule_borrow to borrow USDC against collateral
3. Uses aptos_joule_get_position to show health ratio and details
4. Sets up monitoring for liquidation risk
```

### Advanced Liquidswap Operations
```
User: "Create a new trading pool for my token, add initial liquidity, 
       then show me the pool statistics"

Agent:
1. Uses aptos_create_pool to create the trading pair
2. Uses aptos_add_liquidity to provide initial liquidity
3. Shows pool statistics and fee earning potential
4. Provides ongoing pool management recommendations
```

### Comprehensive Staking Strategy
```
User: "What are the best staking options for my 1000 APT?"

Agent:
1. Compares native staking vs liquid staking options
2. Shows yields for Thala liquid staking vs native validators
3. Recommends diversified approach using multiple protocols
4. Executes chosen strategy across different platforms
```

## Protocol Integrations

### Universal Pool Discovery
- **Cross-protocol pool listing** across all major DeFi protocols
- **Real-time rate comparison** for optimal yield farming
- **Token discovery** with comprehensive search functionality
- **Liquidity analysis** across all DEX protocols

### Liquidswap DEX
- **Complete trading functionality** with optimal routing
- **Advanced liquidity management** with fee optimization
- **Pool creation and management** for new trading pairs
- **Real-time price monitoring** and arbitrage detection

### Joule Finance
- **Professional lending platform** with competitive rates
- **Multi-asset collateral support** for borrowing
- **Automated reward claiming** and compound strategies
- **Risk management** with health ratio monitoring

### Aries Finance
- **Alternative lending platform** for diversified yield
- **Profile-based lending** with customized parameters
- **Cross-protocol arbitrage** opportunities
- **Advanced risk management** tools

### MerkleTrade
- **Perpetual futures trading** with leverage
- **Advanced order types** (market, limit, stop-loss)
- **Real-time position monitoring** and risk management
- **Professional trading interface** for active traders

### Panora Exchange
- **DEX aggregation** for optimal swap rates
- **Cross-protocol liquidity** access
- **Minimal slippage** through intelligent routing
- **Best price discovery** across all DEXes

### Thala Finance
- **Liquid staking** - Keep liquidity while earning staking rewards
- **MOD stablecoin** - Collateralized debt position management
- **Yield optimization** through liquid staking derivatives
- **Advanced DeFi composability** with other protocols

### Cross-Protocol Features
- **Unified portfolio tracking** across all protocols
- **Risk assessment** with comprehensive analytics
- **Yield optimization** strategies
- **Position rebalancing** recommendations

### Native Aptos Staking
- **Validator selection** with AI-driven recommendations
- **Staking optimization** based on performance metrics
- **Automated management** of staking positions

## Troubleshooting

If you're using Ubuntu or another Linux environment with NVM, you'll need to manually configure the path. Follow these steps:

1. Install the Aptos MCP under your current NVM-managed Node.js version.

```bash
npm install -g @tamago-labs/aptos-mcp
```

2. Due to how NVM installs libraries, you may need to use absolute paths in your config. Replace the example values below with your actual username and Node version:

```json
{
  "mcpServers": {
    "aptos-mcp": {
      "command": "/home/YOUR_NAME/.nvm/versions/node/YOUR_NODE_VERSION/bin/node",
      "args": [
        "/home/YOUR_NAME/.nvm/versions/node/YOUR_NODE_VERSION/bin/@tamago-labs/aptos-mcp",
        "--aptos_private_key=YOUR_PRIVATE_KEY",
        "--aptos_network=mainnet"
      ]
    }
  }
}
```

3. Restart Claude Desktop and it should work now.

## Work with Local Files

When working with local files especially when using Aptos CLI tools for smart contract development to create, build, and test a Move package on your machine—you'll need to import an additional MCP server library of `filesystem` made by Claude team. Use with:

```json
"filesystem": {
  "command": "npx",
  "args": [
    "-y",
    "@modelcontextprotocol/server-filesystem",
    "${workspaceFolder}"
  ],
  "disabled": false
}
```

`workspaceFolder` refers to your working directory. You can provide more than one argument. Subfolders or specific files can then be referenced in your AI prompt.

If you're using Linux and encounter issues during setup, please refer to the troubleshooting section.

## License
This project is licensed under the MIT License.
