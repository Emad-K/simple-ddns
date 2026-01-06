import { z } from "zod";

const EnvSchema = z.object({
    NODE_ENV: z.string().default("development"),
    PORT: z.coerce.number().default(3000),
    LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
    CLOUDFLARE_API_TOKEN: z.string().min(1),
    CLOUDFLARE_ZONE_ID: z.string().min(1),
    AUTH_TOKEN: z.string().min(1),
});

export type Env = z.infer<typeof EnvSchema>;

const { data: env, error } = EnvSchema.safeParse(process.env);

if (error) {
    console.error("❌ Invalid env:");
    console.error(JSON.stringify(error.flatten().fieldErrors, null, 2));
    process.exit(1);
}

export default env!;
