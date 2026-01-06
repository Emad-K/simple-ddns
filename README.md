# Simple Hono DDNS

A secure, lightweight Dynamic DNS API built with [Hono](https://hono.dev/) and designed to run on Bun, Node.js, or Cloudflare Workers. It updates a Cloudflare DNS record with your current IP address.

## Features

- **Secure**: Protected by Bearer Token authentication.
- **Smart**: Automatically detects the requester's IP if not provided.
- **Efficient**: Only updates Cloudflare if the IP has actually changed.
- **Lightweight**: Zero external dependencies (uses native `fetch`).

## Setup

1. **Clone and Install**:
   ```bash
   bun install
   ```

2. **Configure Environment**:
   Create a `.env` file based on `.env.example`:
   ```env
   CLOUDFLARE_API_TOKEN=your_token_here
   CLOUDFLARE_ZONE_ID=your_zone_id_here
   AUTH_TOKEN=your_secret_auth_token_here
   ```

3. **Cloudflare Permissions**:
   Your Cloudflare API Token needs `Zone.DNS` permissions for the specific zone.

## Usage

### Run Locally
```bash
bun run dev
```

### Update via Client
You must provide the subdomain you want to update in the URL path. IP detection is fully automatic:

```bash
curl -X GET "http://localhost:3000/update/my-device.example.com" \
     -H "Authorization: Bearer your_secret_auth_token_here"
```

## Automating Updates
Add a cron job on your client machine to run the update script periodically:
```bash
# Every 15 minutes
*/15 * * * * /path/to/client.sh
```
