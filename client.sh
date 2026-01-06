#!/bin/bash

# Configuration
# The base URL of your simple-ddns instance (e.g., https://ddns.example.com)
BASE_URL="http://localhost:3000"
# Your secure auth token
AUTH_TOKEN="your_secure_auth_token"
# The subdomain you want to update (e.g., home.example.com)
SUBDOMAIN="test.true.tips"

# Call the API
# IP detection is automatic on the server side
curl -X GET "$BASE_URL/update/$SUBDOMAIN" \
     -H "Authorization: Bearer $AUTH_TOKEN"
