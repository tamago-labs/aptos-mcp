import { Aptos } from "@aptos-labs/ts-sdk";

/**
 * Common Aptos token address mappings
 * This list includes well-known tokens on Aptos mainnet
 * Updated based on actual Echelon Finance markets
 */
export const KNOWN_TOKEN_ADDRESSES: Record<string, string> = {
    // Native Aptos Coin
    "0x1::aptos_coin::AptosCoin": "APT",
    
    // Stablecoins (Actual addresses from Echelon)
    "0xf22bede237a07e121b56d91a491eb7bcdfd1f590792a206497ca6a32e6f8c15c::usdc::USDC": "USDC",
    "0x5e156f1207d0ebfa19a9eeff00d62a282278fb8719f4fab3a586a0a2c0fffbea::coin::T": "USDC (Wormhole)",
    "0x6f986d146e4a90b828d8c12c14b6f4e003fdff11a8eeccecb760c67e56278f7b::coin::T": "USDT (Wormhole)",
    
    // Wrapped tokens (Actual addresses from Echelon)
    "0xfaf4e633ae9eb31366c9ca24214231760926576c7b6945b12e4717de3ceaeed9::coin::T": "WETH (Wormhole)",
    "0x5dee1d4b13fae338a1e1780f9ad2709a010e82438849b5e26ec6ad6afaf42439::coin::T": "WBTC (Wormhole)",
    "0x4e1854f6d332c9525e258fb6e66f84b6af8aba687bb0e13f29e1b5b7b7e7e0c2::coin::T": "ABTC",
    
    // Liquid staking tokens (Actual addresses from Echelon)
    "0x111ae3e5bc816a5e63c2da97d0aa3886519e0cd5e4b82e1053cc391279015b70::stapt_token::StakedApt": "stAPT",
    "0xcc8a89c8dce9693d354449f1f73e60e14e347417854f029db5bc8e7454008abb::coin::T": "amAPT",
    "0x7fd500c11216f0fe3095d0c4b8aa4d64a4e2e04f837a5b6e83a1b9b7b6e7e0c2::coin::T": "eAPT",
    
    // Other DeFi tokens
    "0x159df6b7689437016108a019fd5bef736bac692b6d4e4c3cb8ee3e6e0b0f1e1e::coin::T": "MOVE",
    
    // Common patterns we see in Echelon (partial matches)
    "usdc": "USDC",
    "usdt": "USDT", 
    "weth": "WETH",
    "wbtc": "WBTC",
    "apt": "APT",
    "aptos": "APT"
};

/**
 * Extract a readable name from a coin address
 * @param address Full coin type address
 * @returns Readable coin name
 */
export function extractCoinName(address: string): string {
    // Check if it's in our known addresses first
    if (KNOWN_TOKEN_ADDRESSES[address]) {
        return KNOWN_TOKEN_ADDRESSES[address];
    }
    
    // Try to extract name from the address structure
    try {
        // Handle standard coin types like 0x1::aptos_coin::AptosCoin
        if (address.includes("::")) {
            const parts = address.split("::");
            if (parts.length >= 3) {
                // Get the last part (coin name)
                const coinName = parts[parts.length - 1];
                
                // Clean up common patterns
                if (coinName === "T") {
                    // For generic T types, try to get the module name
                    const moduleName = parts[parts.length - 2];
                    return formatCoinName(moduleName);
                }
                
                return formatCoinName(coinName);
            }
        }
        
        // Check for common patterns in the address string
        const lowerAddr = address.toLowerCase();
        for (const [pattern, name] of Object.entries(KNOWN_TOKEN_ADDRESSES)) {
            if (pattern.length < 10 && lowerAddr.includes(pattern)) {
                return name;
            }
        }
        
        // If it's just a long hex address, try to match patterns
        if (address.startsWith("0x") && address.length > 20) {
            // Check for partial matches in known addresses
            for (const [knownAddr, name] of Object.entries(KNOWN_TOKEN_ADDRESSES)) {
                if (knownAddr.length > 20) {
                    const knownPrefix = knownAddr.substring(0, 30);
                    const addressPrefix = address.substring(0, 30);
                    if (knownPrefix === addressPrefix) {
                        return name + " (partial match)";
                    }
                }
            }
            
            // Return shortened address
            return `${address.substring(0, 8)}...${address.substring(address.length - 6)}`;
        }
        
        return address;
    } catch (error) {
        return address;
    }
}

/**
 * Format coin name for display
 * @param name Raw coin name
 * @returns Formatted name
 */
function formatCoinName(name: string): string {
    // Handle common patterns
    const formatted = name
        .replace(/([A-Z])/g, ' $1') // Add space before capitals
        .replace(/^\\s+/, '') // Remove leading spaces
        .replace(/coin|token/gi, '') // Remove common suffixes
        .trim();
    
    // Handle special cases
    if (formatted.toLowerCase().includes('apt')) return 'APT';
    if (formatted.toLowerCase().includes('usdc')) return 'USDC';
    if (formatted.toLowerCase().includes('usdt')) return 'USDT';
    if (formatted.toLowerCase().includes('weth')) return 'WETH';
    if (formatted.toLowerCase().includes('wbtc')) return 'WBTC';
    
    return formatted || name;
}

/**
 * Get coin metadata from the blockchain
 * @param aptosClient Aptos client
 * @param coinType Coin type address
 * @returns Coin metadata
 */
export async function getCoinMetadata(aptosClient: Aptos, coinType: string): Promise<{
    name: string;
    symbol: string;
    decimals: number;
} | null> {
    try {
        // Try to get coin info resource
        const coinInfo = await aptosClient.getAccountResource({
            accountAddress: coinType.split("::")[0],
            resourceType: `0x1::coin::CoinInfo<${coinType}>`
        });
        
        if (coinInfo && coinInfo.data) {
            const data = coinInfo.data as any;
            return {
                name: data.name || extractCoinName(coinType),
                symbol: data.symbol || extractCoinName(coinType),
                decimals: parseInt(data.decimals) || 8
            };
        }
    } catch (error) {
        // Coin info not found, try fungible asset metadata
        try {
            // For fungible assets, the metadata might be stored differently
            // This is a simplified approach
            console.log(`Could not fetch metadata for ${coinType}`);
        } catch (faError) {
            console.log(`Could not fetch FA metadata for ${coinType}`);
        }
    }
    
    return null;
}

/**
 * Resolve multiple coin addresses to names
 * @param aptosClient Aptos client
 * @param addresses Array of coin addresses
 * @returns Map of address to name
 */
export async function resolveCoinNames(
    aptosClient: Aptos, 
    addresses: string[]
): Promise<Record<string, string>> {
    const resolved: Record<string, string> = {};
    
    // First pass: check known addresses
    for (const address of addresses) {
        if (address && address !== "unknown") {
            resolved[address] = extractCoinName(address);
        } else {
            resolved[address] = "Unknown";
        }
    }
    
    // Second pass: try to get metadata from blockchain for unknown ones
    for (const address of addresses) {
        if (address && address !== "unknown" && !KNOWN_TOKEN_ADDRESSES[address]) {
            try {
                const metadata = await getCoinMetadata(aptosClient, address);
                if (metadata) {
                    resolved[address] = metadata.symbol || metadata.name;
                }
            } catch (error) {
                // Keep the extracted name from first pass
                console.log(`Failed to get metadata for ${address}: ${error}`);
            }
        }
    }
    
    return resolved;
}

/**
 * Enhanced coin name resolver that handles common Aptos DeFi tokens
 * @param address Coin type address
 * @returns Readable coin name with confidence level
 */
export function resolveCoinNameWithConfidence(address: string): {
    name: string;
    confidence: 'high' | 'medium' | 'low';
    source: 'known' | 'extracted' | 'shortened';
} {
    if (!address || address === "unknown") {
        return { name: "Unknown", confidence: 'low', source: 'known' };
    }
    
    // High confidence: known addresses
    if (KNOWN_TOKEN_ADDRESSES[address]) {
        return { 
            name: KNOWN_TOKEN_ADDRESSES[address], 
            confidence: 'high', 
            source: 'known' 
        };
    }
    
    // Medium confidence: can extract meaningful name
    const extracted = extractCoinName(address);
    if (extracted !== address && !extracted.includes("0x")) {
        return { 
            name: extracted, 
            confidence: 'medium', 
            source: 'extracted' 
        };
    }
    
    // Low confidence: just show shortened address
    return { 
        name: extracted, 
        confidence: 'low', 
        source: 'shortened' 
    };
}
