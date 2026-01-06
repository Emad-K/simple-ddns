import type { Context } from "hono";
import { getConnInfo } from "hono/bun";

/**
 * Helper to handle promises without try-catch blocks.
 * Returns a tuple [data, error].
 */
export async function to<T>(promise: Promise<T>): Promise<[T | null, any]> {
    try {
        const data = await promise;
        return [data, null];
    } catch (error) {
        return [null, error];
    }
}

/**
 * Detect IP automatically from the connection or headers.
 */
export function getIp(c: Context): string | undefined {
    // 1. Try connection info (Native Bun/Hono way)
    const info = getConnInfo(c);
    if (info.remote.address) return info.remote.address;

    // 2. Fallback to common proxy headers
    return (
        c.req.header("x-forwarded-for")?.split(",")[0].trim() ||
        c.req.header("cf-connecting-ip") ||
        c.req.header("x-real-ip")
    );
}
