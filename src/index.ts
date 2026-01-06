import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import axios from "axios";
import { StatusCodes, getReasonPhrase } from "http-status-codes";
import env from "./env";
import { to, getIp } from "./lib/utils";
import logger from "./lib/logger";

const app = new Hono();

// Cloudflare API client
const cf = axios.create({
  baseURL: `https://api.cloudflare.com/client/v4/zones/${env.CLOUDFLARE_ZONE_ID}/`,
  headers: {
    Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
    "Content-Type": "application/json",
  },
});

app.get("/", (c) => {
  return c.json({
    status: "ok",
    message: "Simple DDNS API is running",
    usage: "GET /update/:subdomain (IP detection is automatic)",
  });
});

app.get(
  "/update/:subdomain",
  bearerAuth({ token: env.AUTH_TOKEN }),
  async (c) => {
    const ip = getIp(c);
    const subdomain = c.req.param("subdomain");

    if (!ip) {
      return c.json({
        error: getReasonPhrase(StatusCodes.BAD_REQUEST),
        message: "Could not detect IP address.",
      }, StatusCodes.BAD_REQUEST);
    }

    const isIPv6 = ip.includes(":");
    const recordType = isIPv6 ? "AAAA" : "A";

    // 1. Search for the existing DNS record
    const [listRes, listErr] = await to(cf.get(`dns_records`, {
      params: { name: subdomain, type: recordType },
    }));

    if (listErr) {
      const status = listErr.response?.status || StatusCodes.INTERNAL_SERVER_ERROR;
      const details = listErr.response?.data?.errors;
      logger.error({ subdomain, error: listErr.message, details }, "Failed to list DNS records");
      return c.json({
        error: getReasonPhrase(status),
        message: listErr.message,
        details: details || "No additional details from provider",
      }, status);
    }

    const listData = listRes!.data;
    const existingRecord = listData.result?.[0];

    // 2. If record exists, update it if needed
    if (existingRecord) {
      if (existingRecord.content === ip) {
        logger.info({ subdomain, ip }, "Subdomain already up to date");
        return c.json({
          status: "no_change",
          message: `IP is already set to ${ip}`,
          subdomain,
        }, StatusCodes.OK);
      }

      const [updateRes, updateErr] = await to(cf.patch(`dns_records/${existingRecord.id}`, {
        content: ip,
        type: recordType,
        name: subdomain,
      }));

      if (updateErr) {
        const status = updateErr.response?.status || StatusCodes.INTERNAL_SERVER_ERROR;
        const details = updateErr.response?.data?.errors;
        logger.error({ subdomain, error: updateErr.message, details }, "Failed to update DNS record");
        return c.json({
          error: getReasonPhrase(status),
          message: updateErr.message,
          details: details || "No additional details from provider",
        }, status);
      }

      logger.info({ subdomain, ip, recordType }, "Updated DNS record");
      return c.json({
        status: "success",
        action: "updated",
        message: `Updated ${subdomain} to ${ip} (${recordType})`,
        ip,
      }, StatusCodes.OK);
    }

    // 3. If record does NOT exist, create it
    const [createRes, createErr] = await to(cf.post(`dns_records`, {
      type: recordType,
      name: subdomain,
      content: ip,
      ttl: 1, // Auto TTL
      proxied: false,
    }));

    if (createErr) {
      const status = createErr.response?.status || StatusCodes.INTERNAL_SERVER_ERROR;
      const details = createErr.response?.data?.errors;
      logger.error({ subdomain, error: createErr.message, details }, "Failed to create DNS record");
      return c.json({
        error: getReasonPhrase(status),
        message: "Failed to create new DNS record",
        details: details || createErr.message,
      }, status);
    }

    logger.info({ subdomain, ip, recordType }, "Created new DNS record");
    return c.json({
      status: "success",
      action: "created",
      message: `Created new ${recordType} record for ${subdomain} with IP ${ip}`,
      ip,
    }, StatusCodes.CREATED);
  });

export default {
  port: env.PORT,
  fetch: app.fetch,
};
