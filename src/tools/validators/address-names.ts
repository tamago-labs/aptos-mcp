import type { AptosAgent } from "../../agent";
import axios from "axios";

export interface AptosNameInfo {
    name: string | null;
    fullName: string | null;
    hasName: boolean;
    displayAddress: string;
}

/**
 * Enhanced validator info with names
 */
export interface ValidatorWithNames {
    address: string;
    displayName: string;
    validatorName: AptosNameInfo;
    operatorName?: AptosNameInfo;
    isNamedOperator: boolean;
    votingPower: string;
    apy: number;
    successRate: number;
    commission: number;
    hasActiveDelegationPool: boolean;
}

/**
 * Convert an address to its Aptos name using the AptosNames API
 */
export async function getAptosName(
    agent: AptosAgent,
    address: string
): Promise<AptosNameInfo> {
    try {
        // Clean the address
        const cleanAddress = address.startsWith("0x") ? address : `0x${address}`;
        
        // Try to get the primary name from AptosNames API
        const response = await axios.get(
            `https://www.aptosnames.com/api/mainnet/v1/primary-name/${cleanAddress}`,
            {
                timeout: 5000,
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Aptos-MCP-Server/1.0'
                }
            }
        );

        if (response.data && response.data.name) {
            const name = response.data.name;
            const fullName = `${name}.apt`;
            
            return {
                name,
                fullName,
                hasName: true,
                displayAddress: fullName
            };
        } else {
            return {
                name: null,
                fullName: null,
                hasName: false,
                displayAddress: formatAddressForDisplay(cleanAddress)
            };
        }
    } catch (error) {
        // If API fails, return formatted address
        return {
            name: null,
            fullName: null,
            hasName: false,
            displayAddress: formatAddressForDisplay(address)
        };
    }
}

/**
 * Batch convert multiple addresses to Aptos names
 */
export async function getBatchAptosNames(
    agent: AptosAgent,
    addresses: string[]
): Promise<Map<string, AptosNameInfo>> {
    const results = new Map<string, AptosNameInfo>();
    
    // Process in batches to avoid overwhelming the API
    const batchSize = 5;
    for (let i = 0; i < addresses.length; i += batchSize) {
        const batch = addresses.slice(i, i + batchSize);
        const promises = batch.map(address => 
            getAptosName(agent, address).catch(error => ({
                name: null,
                fullName: null,
                hasName: false,
                displayAddress: formatAddressForDisplay(address)
            }))
        );
        
        const batchResults = await Promise.all(promises);
        batch.forEach((address, index) => {
            results.set(address, batchResults[index]);
        });
        
        // Small delay between batches to be respectful to the API
        if (i + batchSize < addresses.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
    
    return results;
}

/**
 * Format address for display (truncated with ellipsis)
 */
export function formatAddressForDisplay(address: string): string {
    const cleanAddress = address.startsWith("0x") ? address : `0x${address}`;
    if (cleanAddress.length <= 16) {
        return cleanAddress;
    }
    return `${cleanAddress.substring(0, 10)}...${cleanAddress.substring(cleanAddress.length - 6)}`;
}

/**
 * Check if an address is likely an operator (has a meaningful name)
 */
export async function isOperatorWithName(
    agent: AptosAgent,
    address: string
): Promise<boolean> {
    const nameInfo = await getAptosName(agent, address);
    return nameInfo.hasName;
}

/**
 * Get validator display name (name if available, otherwise formatted address)
 */
export async function getValidatorDisplayName(
    agent: AptosAgent,
    validatorAddress: string,
    operatorAddress?: string
): Promise<{
    validatorName: AptosNameInfo;
    operatorName?: AptosNameInfo;
    bestDisplayName: string;
    isNamedOperator: boolean;
}> {
    try {
        // Get name for validator address
        const validatorName = await getAptosName(agent, validatorAddress);
        
        // If operator address is provided and different, get its name too
        let operatorName: AptosNameInfo | undefined;
        if (operatorAddress && operatorAddress !== validatorAddress) {
            operatorName = await getAptosName(agent, operatorAddress);
        }
        
        // Determine best display name
        let bestDisplayName: string;
        let isNamedOperator = false;
        
        if (operatorName?.hasName) {
            bestDisplayName = operatorName.fullName!;
            isNamedOperator = true;
        } else if (validatorName.hasName) {
            bestDisplayName = validatorName.fullName!;
            isNamedOperator = true;
        } else {
            bestDisplayName = validatorName.displayAddress;
        }
        
        return {
            validatorName,
            operatorName,
            bestDisplayName,
            isNamedOperator
        };
    } catch (error) {
        return {
            validatorName: {
                name: null,
                fullName: null,
                hasName: false,
                displayAddress: formatAddressForDisplay(validatorAddress)
            },
            bestDisplayName: formatAddressForDisplay(validatorAddress),
            isNamedOperator: false
        };
    }
}

/**
 * One-step function to get validator display name (combines both steps)
 */
export async function getValidatorDisplayNameDirect(
    agent: AptosAgent,
    validatorAddress: string
): Promise<{
    validatorAddress: string;
    operatorAddress: string;
    displayName: string;
    isNamedOperator: boolean;
    validatorName: AptosNameInfo;
    operatorName?: AptosNameInfo;
}> {
    try {
        // Step 1: Get validator info to find operator address
        const validatorInfo = await agent.aptos.view({
            payload: {
                function: "0x1::stake::get_operator",
                typeArguments: [],
                functionArguments: [validatorAddress],
            },
        });
        
        const operatorAddress = validatorInfo[0]?.toString() || validatorAddress;
        
        // Step 2: Get display name using operator address
        const nameInfo = await getValidatorDisplayName(
            agent,
            validatorAddress,
            operatorAddress
        );
        
        return {
            validatorAddress,
            operatorAddress,
            displayName: nameInfo.bestDisplayName,
            isNamedOperator: nameInfo.isNamedOperator,
            validatorName: nameInfo.validatorName,
            operatorName: nameInfo.operatorName
        };
    } catch (error: any) {
        // Fallback to formatted address if everything fails
        const fallbackDisplay = formatAddressForDisplay(validatorAddress);
        return {
            validatorAddress,
            operatorAddress: validatorAddress,
            displayName: fallbackDisplay,
            isNamedOperator: false,
            validatorName: {
                name: null,
                fullName: null,
                hasName: false,
                displayAddress: fallbackDisplay
            }
        };
    }
}
