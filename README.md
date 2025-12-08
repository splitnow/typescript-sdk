# SplitNOW TypeScript SDK

TypeScript SDK (API wrapper) for [SplitNOW](https://splitnow.io), the multi-wallet instant crypto exchange. 🪼

- 0 dependencies
- Works on frontend: React, NextJS, SvelteKit, etc
- Works on backend: Node, Deno, Bun, etc

## Install

```shell
# Node.js
npm i splitnow

# Bun
bun i splitnow
```

## Usage Example

You'll need to create a SplitNOW API key if you don't have one already:

1. Create a SplitNOW account at [https://splitnow.io/auth/register](https://splitnow.io/auth/register)
2. Head to the API keys page on your account dashboard at [https://splitnow.io/account/api-keys](https://splitnow.io/account/api-keys)
3. Copy your account's API key and store it in a safe place.

This example demonstrates splitting **10 SOL** evenly across **2 wallets** through [Binance](https://binance.com/) & [Bybit](https://bybit.com/):

```ts
// First, import the `SplitNOW` SDK into your file:
import { SplitNOW } from 'splitnow'

// Next, initialize the `SplitNOW` SDK with your API key:
const splitnow = new SplitNOW({
  apiKey: 'replace_me', // Get a free API key at: https://splitnow.io/auth/register
})

// Step 1/3: Creating and fetching a quote
const quote = await splitnow.createAndFetchQuote({
  fromAmount: 10,
  fromAssetId: 'sol',
  fromNetworkId: 'solana',
  toAssetId: 'sol',
  toNetworkId: 'solana',
})
const rates = quote.rates // (Optional) You can filter through this array to see which exchanges are available and at what rate

// Step 2/3: Creating and fetching an order
const order = await splitnow.createAndFetchOrder({
  quoteId: quote.quoteId,  // Quote ID from previous step
  fromAmount: 10,          // Amount to split
  fromAssetId: 'sol',      // Input asset ID
  fromNetworkId: 'solana', // Input network ID
  walletDistributions: [
    {
      toAddress: '7ingPqZUYmuso5HakTLgoXjMpETpbZYzxeQBJChGrQn5',
      toPctBips: 5000,
      toAssetId: 'sol',
      toNetworkId: 'solana',
      toExchangerId: 'binance',
    },
    {
      toAddress: '92CzWZt7fD5ffhwkRNBKHxqHahVTPeWedd5UYmdmHjMw',
      toPctBips: 5000,
      toAssetId: 'sol',
      toNetworkId: 'solana',
      toExchangerId: 'bybit',
    },
  ],
})
const depositAddress = order.depositAddress // The unique deposit address of the order
const depositAmount = order.depositAmount   // The deposit amount to send to start the order

// Step 3/3: Fetching an order status
const orderStatus = await splitnow.getOrderStatus({
  orderId: order.orderId, // Order ID from previous step
})
```

### Understanding The 3-Step Flow

To ensure a seamless SplitNOW API integration for your use case, you must first understand the **3-step flow** when using the SplitNOW API.

Below is a short explainer of each step so that you can best fit each step into your own software & workflows.

#### Step 1/3: `SplitNOW.createAndFetchQuote()` - Creating and fetching a quote

```ts
const quote = await splitnow.createAndFetchQuote(/* your params */)
```

- Save `quote.quoteId` because you need this value to create your order in the next step.
- You'll also probably want to do something such as filter through `quote.rates` to see which exchanges are available and at what rate.
- If the `exchangeRate` key of a rate object in the `quote.rates` array is `0`, the pair might not be supported on that exchange.
- You can pick any exchange no matter what, though. Our systems fall back to the next best rate if your selection is unavailable!

#### Step 2/3: `SplitNOW.createAndFetchOrder()` - Creating and fetching an order

```ts
const order = await splitnow.createAndFetchOrder(/* your params */)
```

- Remember to pass in the `quoteId` from the previous step!
- The `order` object contains important information you'll need for initiating the order: `order.depositAddress` & `order.depositAmount`.
- Once you've sent the deposit, we take care of everything else automatically!
- Save `order.orderId` so you can check the status of your order anytime.

#### Step 3/3: `SplitNOW.getOrderStatus()` - Fetching an order status

```ts
const orderStatus = await splitnow.getOrderStatus(/* your params */)
```

- Remember to pass in the `orderId` from the previous step!
- Your 6-digit order ID is returned as `orderStatus.orderId`.
- You'll probably want to do something with `orderStatus.orderStatus` such as update your app's client or trigger a notification once the order status changes.
- If you want a human-readable order status such as for your UI, use `orderStatus.orderStatusText` or `orderStatus.orderStatusShort`.
- Once `orderStatus.orderStatus` is `completed`, it's all done and the wallets are funded as requested! Enjoy!

### Full Reference

This TypeScript SDK includes **10 functions** that wrap around the [SplitNOW API](https://splitnow.io/api/docs) to help you get up and running with creating quotes & orders quickly, no matter your use case:

#### getHealth

```ts
async getHealth(): Promise<boolean>
```

- Checks whether the SplitNOW API is healthy.
- **Returns**: A `Promise` that resolves to a `boolean`.

API Reference: [GET /health/](https://splitnow.io/api/docs#tag/default/get/health)

#### getAssets

```ts
async getAssets(): Promise<Asset[]>
```

- Gets a list of available asset IDs and network IDs.
- **Returns:** A `Promise` that resolves to a `Asset[]` array.

**💡 Pro Tip:** When creating quotes & orders, the `id` key of each `Asset` can be used for `fromAssetId` & `toAssetId`.

**💡 Pro Tip:** When creating quotes & orders, the `networkId` key of a corresponding `Asset` can be used for `fromNetworkId` & `toNetworkId`.

API Reference: [GET /assets/](https://splitnow.io/api/docs#tag/assets/get/assets)

#### getAssetPrices

```ts
async getAssetPrices(): Promise<object>
```

- Gets the current USD price of each available asset by ID.
- **Returns:** A `Promise` that resolves to an `object` where each key is an asset ID (`string`) and each value is its price (`number`).

API Reference: [GET /assets/prices/](https://splitnow.io/api/docs#tag/assets/get/assetsprices)

#### getAssetDepositLimits

```ts
async getAssetDepositLimits(): Promise<AssetDepositLimit[]>
```

- Gets the minimum and maximum deposit (if any) for each available asset.
- **Returns:** A `Promise` that resolves to a `AssetDepositLimit[]` array.

API Reference: [GET /assets/limits/](https://splitnow.io/api/docs#tag/assets/get/assetslimits)

#### getExchangers

```ts
async getExchangers(): Promise<Exchanger[]>
```

- Get a list of available exchanger IDs.
- **Returns:** A `Promise` that resolves to a `Exchanger[]` array.

**💡 Pro Tip:** When creating quotes & orders, the `id` key of each `Exchanger` can be used for `toExchangerId`.

API Reference: [GET /exchangers/](https://splitnow.io/api/docs#tag/exchangers/get/exchangers)

#### createAndFetchQuote

```ts
async createAndFetchQuote({
  fromAmount: number,
  fromAssetId: string,
  fromNetworkId: string,
  toAssetId: string,
  toNetworkId: string
}): Promise<QuoteData>
```

- Creates and fetch a quote.
- **Parameters:**
  - `fromAmount`: A numerical amount of tokens to split.
  - `fromAssetId`: The input asset ID returned from `getAssets`.
  - `fromNetworkId`: A corresponding input network ID returned from `getAssets`.
  - `fromAssetId`: The output asset ID returned from `getAssets`.
  - `fromNetworkId`: A corresponding output network ID returned from `getAssets`.
- **Returns:** A `Promise` that resolves to a `QuoteData`.

API Reference: [POST /quotes/](https://splitnow.io/api/docs#tag/quotes/post/quotes), [GET /quotes/{id}](https://splitnow.io/api/docs#tag/quotes/get/quotesid)

#### createAndFetchOrder

```ts
async createAndFetchOrder({
  quoteId: string,
  fromAmount: number,
  fromAssetId: string,
  fromNetworkId: string,
  walletDistributions: WalletDistribution[]
}): Promise<OrderData>
```

- Creates and fetches an order.
- **Parameters:**
  - `quoteId`: A quote ID returned from `createAndFetchQuote`.
  - `fromAmount`: A numerical amount of tokens to split.
  - `fromAssetId`: The input asset ID returned from `getAssets`.
  - `fromNetworkId`: A corresponding input network ID returned from `getAssets`.
  - `walletDistributions:` A `WalletDistribution[]` array containing recipient wallets and distribution preferences.
- **Returns:** A `Promise` that resolves to a `OrderData`.

API Reference: [POST /orders/](https://splitnow.io/api/docs#tag/orders/post/orders), [GET /orders/{id}](https://splitnow.io/api/docs#tag/orders/get/ordersid)

#### getQuote

```ts
async getQuote({
  quoteId: string
}): Promise<Quote>
```

- Fetches a quote by its ID.
- **Parameters:**
  - `quoteId`: The quote ID to fetch.
- **Returns:** A `Promise` that resolves to a `Quote`.

API Reference: [GET /quotes/{id}](https://splitnow.io/api/docs#tag/quotes/get/quotesid)

#### getOrder

```ts
async getOrder({
  orderId: string
}): Promise<Order>
```

- Fetches an order by its ID.
- **Parameters:**
  - `orderId`: The order ID to fetch.
- **Returns:** A `Promise` that resolves to a `Order`.

API Reference: [GET /orders/{id}](https://splitnow.io/api/docs#tag/orders/get/ordersid)

#### getOrderStatus

```ts
async getOrderStatus({
  orderId: string
}): Promise<OrderStatusData>
```

- Fetches the status of an order by its ID.
- **Parameters:**
  - `orderId`: The order ID to fetch.
- **Returns:** A `Promise` that resolves to a `OrderStatusData`.

API Reference: [GET /orders/{id}](https://splitnow.io/api/docs#tag/orders/get/ordersid)

## Rate Limits

The default rate-limit of each API key is 60 requests per minute.

Don't hesitate to [contact SplitNOW](support@splitnow.io) if you need more. We scale to meet any demand instantly!

## Security

Never expose your SplitNOW API key to clients! If you think your API key may have been accidentally leaked, please [contact support](support@splitnow.io) right away so that we can get you set up with a fresh one.

## Compliance & Restricted Regions

Our API services are not available to users in the [Restricted Regions](https://splitnow.io/restricted-regions), directly or indirectly, in accordance with our [Terms of Service](https://splitnow.io/terms).

## Support

- Official API docs: [https://splitnow.io/api/docs](https://splitnow.io/api/docs)
- Free 24/7 email support: [support@splitnow.io](mailto:support@splitnow.io)
- Free community support: [SplitNOW API Developers Chat](https://t.me/splitnow_developers)

## License

Unlicensed (Whitelabelled)

More information: [https://unlicense.org](https://unlicense.org)

---

*© 2025 SplitOTC, Ltd.*
