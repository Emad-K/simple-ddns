# Simple Hono DDNS

A secure, lightweight Dynamic DNS API built with [Hono](https://hono.dev/) and designed to run on Bun. It automatically updates or creates Cloudflare DNS records (A/AAAA) based on the requester's IP.

## Features

- **Secure**: Protected by Bearer Token authentication.
- **Smart**: Automatically detects IPv4 or IPv6 and handles record types correctly.
- **Auto-Provisioning**: Automatically creates the DNS record if it doesn't already exist in Cloudflare.
- **Efficient**: Only updates Cloudflare if the IP has actually changed.
- **Containerized**: Ready-to-use Docker image and Compose setup.

## Setup

### Environment Variables

Create a `/home/masoud/projects/simple-ddns/.env` file with the following:

| Variable | Description | Required |
| :--- | :--- | :--- |
| `CLOUDFLARE_API_TOKEN` | Scoped API Token with `Zone.DNS` edit permissions | Yes |
| `CLOUDFLARE_ZONE_ID` | The Zone ID of your domain | Yes |
| `AUTH_TOKEN` | A secure secret for client authentication | Yes |
| `PORT` | Server port (defaults to `3000`) | No |
| `NODE_ENV` | environment (defaults to `development`) | No |


### Docker (Recommended)
```bash
docker compose pull
docker compose up -d
```

### Local Development
1. **Install**: `bun install`
2. **Run**: `bun run dev`

## Usage

### Update via Client
You must provide the subdomain you want to update in the URL path. IP detection is fully automatic:

```bash
curl -X GET "http://your-server:3000/update/my-home.example.com" \
     -H "Authorization: Bearer your_secure_auth_token"
```

The server will return:
- `201 Created` if the record was newly created.
- `200 OK` if the record was updated or already up-to-date.

## Automating Updates
Add a cron job on your client machine to run the update script periodically:
```bash
# Every 15 minutes
*/15 * * * * /path/to/client.sh
```
