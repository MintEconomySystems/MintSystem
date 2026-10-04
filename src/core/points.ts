import { randomUUID } from "node:crypto";
import { prisma } from "../db.js";

/**
 * Resolves the account ID for a given scope and owner.
 * If an identity already exists for the given scope and owner, it returns the associated account ID.
 * Otherwise, it creates a new account and identity.
 */
export async function resolveAccountId(scopeId: string, ownerId: string): Promise<string> {
    const existing = await prisma.identity.findUnique({
        where: {
            scopeId_ownerId: {
                scopeId,
                ownerId,
            },
        }
    });

    if (existing) {
        return existing.accountId;
    }

    const accountId = randomUUID();
    await prisma.account.create({
        data: { accountId },
    });
    await prisma.identity.create({
        data: {
            scopeId,
            ownerId,
            accountId,
        },
    });

    return accountId;
}

/**
 * Retrieves the points balance for a given account ID.
 * If the account does not exist or has no points, it returns 0.
 */
export async function getPoints(accountId: string): Promise<number> {
    const balancer = await prisma.balance.findUnique({
        where: { accountId },
    });

    return balancer?.points ?? 0;
}

/**
 * Adds points to an account and records the change in the point log.
 * Returns the new balance after the addition.
 */
export async function addPoints(
    accountId: string,
    amount: number,
    reason: string,
    source?: string,
): Promise<number> {
    const balance = await prisma.balance.upsert({
        where: { accountId },
        update: { points: { increment: amount } },
        create: { accountId, points: amount },
    });

    await prisma.pointLog.create({
        data: {
            accountId, amount, reason, source: source ?? null
        },
    });

    return balance.points;
}

/**
 * Deducts points from an account if sufficient balance exists and records the change in the point log.
 * Returns true if the deduction was successful, false otherwise.
 */
export async function spendPoints(
    accountId: string,
    amount: number,
    reason: string,
    source?: string,
): Promise<boolean> {
    const current = await getPoints(accountId);

    if (current < amount) {
        return false;
    }

    await prisma.balance.update({
        where: { accountId },
        data: { points: { decrement: amount } },
    });

    await prisma.pointLog.create({
        data: { accountId, amount: -amount, reason, source: source ?? null },
    });

    return true;
}