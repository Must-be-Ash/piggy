# Session Token Authentication

## Overview

Coinbase Onramp and Offramp use session tokens for secure authentication. Session tokens are generated on your backend server using your CDP API keys and passed in the URL instead of including sensitive data like wallet addresses as query parameters.

## How Session Tokens Work

Session tokens provide a secure way to initialize Onramp/Offramp experiences:

1. Your backend server generates a session token using the CDP API

<Warning>
  **Security Requirements must be enforced**: Your backend API that generates session tokens must implement proper security measures. See [Security Requirements](/onramp-&-offramp/security-requirements) for complete implementation guidance.
</Warning>

2. The token encapsulates user addresses, supported assets, and client IP
3. You pass the token in the Onramp/Offramp URL
4. The token expires after 5 minutes and can only be used once

### Example URL Format

```bash
https://pay.coinbase.com/buy/select-asset?sessionToken=<token>&<other params>
```

## Implementation Steps

### Step 1: Create a CDP Secret API Key

<Info>
  **Optional API Key File Download**

  For enhanced security, API key files are no longer automatically downloaded. If you need to reference your API key via file path in your code, click the **Download API key** button in the modal to save the key file. Otherwise, you can copy the key details directly from the modal and use them as environment variables (recommended for better security).
</Info>

To generate session tokens, you'll need a Secret API Key from the [CDP Portal](https://portal.cdp.coinbase.com/projects/api-keys):

1. Navigate to your project's **API Keys** tab
2. Select the **Secret API Keys** section
3. Click **Create API key**
4. Configure your key settings (IP allowlist recommended)
5. Create your API key and securely store the details

<Tip>
  Session tokens must be generated server-side, so you'll need a Secret API Key (not a Client API Key).
</Tip>

### Step 2: Set Up JWT Authentication

To generate session tokens, you need to authenticate with CDP using JWT Bearer tokens. Follow the [CDP API key authentication guide](/api-reference/v2/authentication#generate-bearer-token-jwt-and-export) to set up JWT generation.

### Step 3: Generate Session Tokens

Use the Session Token API to generate tokens for each user session:

<Info>
  For complete API documentation including all parameters and response formats, see the [Create Session Token API Reference](/api-reference/rest-api/onramp-offramp/create-session-token).
</Info>

**You must include the true client IP of the end user when generating session tokens.**

* Extract the client IP from the network layer of the TCP request to your API
* **Do not trust HTTP headers** like `X-Forwarded-For` — these can be easily spoofed
* Include the client IP in the CDP API call for validation

```bash
curl -X POST 'https://api.developer.coinbase.com/onramp/v1/token' \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "addresses": [
      {
        "address": "0x4315d134aCd3221a02dD380ADE3aF39Ce219037c",
        "blockchains": ["ethereum", "base"]
      }
    ],
    "assets": ["ETH", "USDC"],
    "clientIp": "192.0.2.7"
  }'
```

**Response:**

```json
{
  "token": "ZWJlNDgwYmItNjBkMi00ZmFiLWIxYTQtMTM3MGI2YjJiNjFh",
  "channel_id": ""
}
```

[See an example](https://github.com/coinbase/onramp-demo-application/blob/51733031e49ed4b505291ee7acbdbee429dceb3c/app/utils/sessionTokenApi.ts) of how to generate a JWT and session token.

### Step 4: Create Onramp/Offramp URLs

Use the session token to create your Onramp/Offramp URLs:

<Info>
  For detailed information about URL parameters and options, see:

  * [Generating an Onramp URL](/onramp-&-offramp/onramp-apis/generating-onramp-url) for onramp parameters
  * [Generating an Offramp URL](/onramp-&-offramp/offramp-apis/generating-offramp-url) for offramp parameters
</Info>

#### Onramp URL Example

```bash
https://pay.coinbase.com/buy/select-asset?sessionToken=ZWJlNDgwYmItNjBkMi00ZmFiLWIxYTQtMTM3MGI2YjJiNjFh&defaultNetwork=base&presetFiatAmount=100
```

#### Offramp URL Example

```bash
https://pay.coinbase.com/v3/sell/input?sessionToken=ZWJlNDgwYmItNjBkMi00ZmFiLWIxYTQtMTM3MGI2YjJiNjFh&partnerUserId=user123&redirectUrl=https://yourapp.com/success
```

## Session Token Properties

* **Expiration**: Session tokens expire after 5 minutes
* **Single-use**: Each token can only be used once
* **Server-side generation**: Must be generated on your backend server

## Support and Resources

* **Sample Code**: [Session Token Implementation](https://github.com/coinbase/onramp-demo-application/blob/51733031e49ed4b505291ee7acbdbee429dceb3c/app/utils/sessionTokenApi.ts)
* **Authentication Guide**: [CDP API Key Authentication](/api-reference/v2/authentication)
* **Security Requirements**: [CORS Security Requirements](/onramp-&-offramp/security-requirements) — Essential CORS protection for your integration
* **Community Support**: [CDP Discord](https://discord.com/invite/cdp)

---

# Generating an Onramp URL

Coinbase Onramp is accessed by creating and directing users to a URL with [query parameters](#onramp-url-parameters) specific to their request. In your backend, generate a JWT, following the [CDP authentication steps](https://docs.cdp.coinbase.com/get-started/authentication/jwt-authentication)

Then you can use two methods to generate your URL:

1. (Preferred) In your backend, generate a One Click Buy URL using the [Create Onramp Session API](https://docs.cdp.coinbase.com/api-reference/v2/rest-api/onramp/create-an-onramp-session).
   * Pass this URL to your frontend to load the Onramp experience for the client.

<Warning>
  **Security Requirements must be enforced**: Your backend API that generates session tokens must implement proper security measures. See [Security Requirements](/onramp-&-offramp/security-requirements) for complete implementation guidance.
</Warning>

2. If you would prefer using our frontend util:
   * Generate a one time use session token in your backend using the JWT from Step 1 and the [generateSessionToken](https://docs.cdp.coinbase.com/onramp-&-offramp/session-token-authentication) endpoint
   * Pass this session token to your frontend
   * Use the [getOnrampBuyUrl](https://docs.base.org/builderkits/onchainkit/fund/get-onramp-buy-url) util with the [getOnrampURLWithSessionTokenParams](https://docs.base.org/onchainkit/fund/types#getonrampurlwithsessiontokenparams) to generate a URL with default parameters

<Tip>
  Frontend developers love using our [`<FundCard />`](https://onchainkit.xyz/fund/fund-card) and [`<FundButton />`](https://onchainkit.xyz/fund/fund-button), customizable React components to fund a wallet without leaving your App!
</Tip>

3. Manually generate a URL with required parameters
   * Most commonly used on the `Backend`

<Tip>
  Full API endpoint list

  For a complete list of all API endpoints supported by Onramp/Offramp, visit our [API Reference section](/api-reference/rest-api/onramp-offramp/create-buy-quote).
</Tip>

#### Backend URL creation

For Apps with a backend, use our APIs to create a [One-Click-Buy URL](/onramp-&-offramp/onramp-apis/one-click-buy-url) - a prefilled URL which takes users straight to the preview screen (existing Coinbase users) or Apple Pay + debit card (Guest checkout).
This enables you to pass a user's wallet addresses via API and avoid using query params for sensitive fields

### Example URL

The URL should look like this:

```bash lines wrap
https://pay.coinbase.com/buy/select-asset?sessionToken=<token>&<other params>
```

### Onramp URL parameters:

| Parameter               | Required | Type          | Description                                                                                                                                            |
| :---------------------- | :------- | :------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sessionToken`          | Yes      | String        | Token generated by the [Onramp Session Token API](#getting-an-session-token).                                                                          |
| `defaultNetwork`        | No       | String        | Default network that should be selected when multiple networks are present                                                                             |
| `defaultAsset`          | No       | String        | Default asset that should be selected when multiple assets are present                                                                                 |
| `presetCryptoAmount`    | No       | Number        | Preset crypto amount value                                                                                                                             |
| `presetFiatAmount`      | No       | Number        | Preset fiat amount value (for USD, CAD, GBP, EUR only). Ignored if `presetCryptoAmount` is also set.                                                   |
| `defaultExperience`     | No       | 'send', 'buy' | Default visual experience: either (1) Transfer funds from Coinbase ('send') or (2) Buy assets ('buy')                                                  |
| `defaultPaymentMethod`  | No       | String        | Default payment method used to purchase the asset                                                                                                      |
| `fiatCurrency`          | No       | String        | e.g: USD, CAD, GBP, etc.                                                                                                                               |
| `handlingRequestedUrls` | No       | Boolean       | Prevents the widget from opening URLs directly & relies on `onRequestedUrl` entirely for opening links                                                 |
| `partnerUserId`         | No       | String        | Unique ID representing the end-user. Must be less than 50 chars. Use with the Transaction Status API to retrieve transactions made during the session. |
| `redirectUrl`           | No       | String        | URL to redirect the user to when they successfully complete a transaction.                                                                             |

## Getting a Session Token

Developers can create and use a session token to securely authenticate users and manage sessions.

### Authentication

To authenticate your requests to the Session Token API, you'll need to:

1. [Create a CDP Secret API Key](/onramp-&-offramp/introduction/getting-started#step-4-create-a-secret-api-key)
2. Follow the instructions for [CDP API key authentication](/api-reference/v2/authentication#generate-bearer-token-jwt-and-export) to make signed requests

Using the JWT token, you can make a request to the Session Token API to obtain a token, then pass that token as the `sessionToken` query string parameter when generating the Coinbase Onramp or Offramp URL.

[See an example](https://github.com/coinbase/onramp-demo-application/blob/51733031e49ed4b505291ee7acbdbee429dceb3c/app/utils/sessionTokenApi.ts) of how to generate a JWT and session token.

<Warning>
  The token expires after a short period of time and can only be used once. A new token must be obtained for every new session.
</Warning>

<Warning>
  Full API endpoint list
  For a complete list of all API endpoints supported by Onramp/Offramp, visit our [API Reference section](/api-reference/rest-api/onramp-offramp/create-session-token).
</Warning>

### Method

```
POST
```

### URL

```
https://api.developer.coinbase.com/onramp/v1/token
```

### Request Parameters

The Session Token API is an RPC endpoint that accepts parameters as JSON in the request body.

| Name        | Type                               | Req | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| :---------- | :--------------------------------- | :-- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `addresses` | [Address\[\]](#address-parameters) | Y   | List of addresses that the purchased crypto should be sent to. Each entry in this array is an object containing an address and a list of blockchains the address supports.                                                                                                                                                                                                                                                                                                                                                                                                       |
| `clientIp`  | String                             | Y   | The client IP address of the end user. This parameter is required for security validation to ensure the quote can only be used by the requesting user. **Do not trust HTTP headers** like `X-Forwarded-For` — these can be easily spoofed.                                                                                                                                                                                                                                                                                                                                       |
| `assets`    | String\[]                          | N   | List of assets that will be available for the user to buy/send. Assets can either be symbols e.g. "ETH" or "BTC", or UUIDs retrieved from the [Buy Options API](/onramp-&-offramp/onramp-apis/countries-&-currencies). This optional parameter acts as a filter on the addresses parameter. If it is included then only the assets in this list that are available on one of the supported blockchains in the Addresses list will be available to the user. See the See the [Buy Options API](/onramp-&-offramp/onramp-apis/countries-&-currencies) for the full list of assets. |

#### Address Parameters

An Address object accepts the following parameters:

| Parameter   | Req'd | Type      | Description                                                                                                                                                                                                                                                                                                                                                                |
| :---------- | :---- | :-------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| address     | Yes   | String    | Destination address where the purchased tokens will be sent.                                                                                                                                                                                                                                                                                                               |
| blockchains | Yes   | String\[] | List of blockchains enabled for the associated address. All tokens available per blockchain are displayed to the user. Available blockchains include: "ethereum", "bitcoin", "base", "avacchain", "optimism", "solana", "polygon", "arbitrum", "stellar" and many more. See the [Buy Options API](/onramp-&-offramp/onramp-apis/countries-&-currencies) for the full list. |

### Response Fields

The Session Token API returns a JSON response including the following fields.

### Example Request/Response

<Tabs>
  <Tab value="bash" title="Request (cURL)">
    ```bash lines wrap
    cdpcurl -X POST 'https://api.developer.coinbase.com/onramp/v1/token' \
      -k /tmp/cdp_api_key.json \
      -d '{"addresses": [{"address": "0x4315d134aCd3221a02dD380ADE3aF39Ce219037c", "blockchains": ["ethereum", "base"]}], "assets": ["ETH", "USDC"]}'
    ```
  </Tab>

  <Tab value="jsonResponse" title="Response 200 (JSON)">
    ```json lines wrap
    {
      "data": {
        "token": "ZWJlNDgwYmItNjBkMi00ZmFiLWIxYTQtMTM3MGI2YjJiNjFh",
        "channel_id": "",
      }
    }
    ```
  </Tab>
</Tabs>

---

# Security Requirements

## Overview

To prevent unauthorized usage of onramp sessions, all applications must implement proper security measures when integrating with CDP APIs. This ensures that onramp experiences can only be accessed through approved, compliant applications with authenticated users.

<Warning>
  **Security is Critical**: Implementing proper CORS headers and additional authentication measures is essential for maintaining the security and integrity of the onramp service. Failure to implement these measures may result in unauthorized access to your integration. You are responsible and will be liable for any misuse of your endpoints due to improper implementation of these security measures.
</Warning>

## CORS Protection Requirements

Any APIs that call our authenticated endpoints for **web based clients** must implement CORS headers:

* Only allow specific, approved origins that should have access to your integration. Do not set
  `Access-Control-Allow-Origin` to `*`.
* This prevents malicious websites from hijacking your APIs to create unauthorized onramp sessions

<Info>
  If your API is not expected to be called from browser-based clients (e.g. only called by mobile apps), ensure you do not return the `Access-Control-Allow-Origin` header. This will deny all cross-origin browser requests.
</Info>

<Info>
  Learn more about [CORS implementation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS) from Mozilla's comprehensive guide.
</Info>

**Example CORS Configuration:**

```http
Access-Control-Allow-Origin: https://yourapprovedomain.com
Access-Control-Allow-Methods: POST
Access-Control-Allow-Headers: Content-Type, Authorization
```

## Strongly Recommended Security Measures

While CORS provides essential protection, implementing additional authentication layers significantly enhances the security of your onramp integration.

### Authenticated Endpoints

**Require user authentication before creating onramp sessions.** This ensures that only legitimate, authenticated users can initiate onramp experiences.

#### Wallet Signature Authentication

Implement wallet signature verification where users sign a unique message (containing wallet address and timestamp) with their private key. This proves wallet ownership without exposing sensitive keys, making it cryptographically impossible for attackers to impersonate legitimate users.

#### Traditional User Login

For applications with existing user accounts, require standard JWT or session-based authentication before allowing session token creation. This leverages your existing authentication infrastructure and user management systems.

<Info>
  **Security Enhancement**: Combining multiple authentication methods provides the strongest protection against unauthorized onramp usage.
</Info>

## Additional Resources

* [CORS MDN Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) — Comprehensive CORS implementation guide

<Info>
  **Need Help?** Join the **#onramp** channel in our [CDP Discord](https://discord.com/invite/cdp) community for implementation support and best practices.
</Info>
