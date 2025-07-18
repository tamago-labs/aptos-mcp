import { z } from "zod";
import { 
    createAriesProfile, 
    lendOnAries, 
    borrowOnAries, 
    repayOnAries, 
    withdrawFromAries 
} from "../../tools/aries";

const CreateAriesProfileInputSchema = z.object({});

export const CreateAriesProfileTool = {
    name: "create_aries_profile",
    description: "Create a user profile on Aries Finance lending protocol",
    schema: CreateAriesProfileInputSchema,
    handler: async (agent: any, input: any) => {
        return await createAriesProfile(agent.aptos, agent.account);
    }
};

const LendOnAriesInputSchema = z.object({
    amount: z.number().describe("Amount to lend"),
    mint: z.string().describe("Token address to lend")
});

export const LendOnAriesTool = {
    name: "lend_on_aries",
    description: "Lend tokens on Aries Finance to earn interest",
    schema: LendOnAriesInputSchema,
    handler: async (agent: any, input: any) => {
        return await lendOnAries(agent.aptos, agent.account, input.amount, input.mint);
    }
};

const BorrowOnAriesInputSchema = z.object({
    amount: z.number().describe("Amount to borrow"),
    mint: z.string().describe("Token address to borrow")
});

export const BorrowOnAriesTool = {
    name: "borrow_on_aries",
    description: "Borrow tokens on Aries Finance using collateral",
    schema: BorrowOnAriesInputSchema,
    handler: async (agent: any, input: any) => {
        return await borrowOnAries(agent.aptos, agent.account, input.amount, input.mint);
    }
};

const RepayOnAriesInputSchema = z.object({
    amount: z.number().describe("Amount to repay"),
    mint: z.string().describe("Token address to repay")
});

export const RepayOnAriesTool = {
    name: "repay_on_aries",
    description: "Repay borrowed tokens on Aries Finance",
    schema: RepayOnAriesInputSchema,
    handler: async (agent: any, input: any) => {
        return await repayOnAries(agent.aptos, agent.account, input.amount, input.mint);
    }
};

const WithdrawFromAriesInputSchema = z.object({
    amount: z.number().describe("Amount to withdraw"),
    mint: z.string().describe("Token address to withdraw")
});

export const WithdrawFromAriesTool = {
    name: "withdraw_from_aries",
    description: "Withdraw lent tokens from Aries Finance",
    schema: WithdrawFromAriesInputSchema,
    handler: async (agent: any, input: any) => {
        return await withdrawFromAries(agent.aptos, agent.account, input.amount, input.mint);
    }
};
