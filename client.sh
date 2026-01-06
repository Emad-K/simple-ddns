#!/bin/bash

# Configuration
URL="https://your-hono-app.com/update"
AUTH_TOKEN="your_secure_auth_token"

# Call the API
# If you don't provide the 'ip' query param, the server will detect your public IP
curl -X GET "$URL" \
     -H "Authorization: Bearer $AUTH_TOKEN"
