import type { Context } from "hono";
import { getConnInfo } from "hono/bun";
import ipaddr from "ipaddr.js";

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
 * Converts IPv4-mapped IPv6 addresses to standard IPv4.
 */
export function getIp(c: Context): string | undefined {
  let address: string | undefined;

  // 1. Try common proxy headers first (priority)
  address = c.req.header("cf-connecting-ip") ||
    c.req.header("x-real-ip") ||
    c.req.header("x-forwarded-for")?.split(",")[0].trim();

  // 2. Fallback to connection info if no headers found
  if (!address) {
    const info = getConnInfo(c);
    address = info.remote.address;
  }

  if (!address) return undefined;

  // Process IP to handle IPv4-mapped IPv6 (::ffff:x.x.x.x)
  if (!ipaddr.isValid(address)) return address;

  const addr = ipaddr.process(address);
  return addr.toString();
}
