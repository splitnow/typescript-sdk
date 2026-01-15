import { Asset, AssetDepositLimit, Exchanger, QuoteData, Quote, QuoteLeg, WalletDistribution, OrderData, Order, OrderStatusData } from './types'

const SPLITNOW_API_URL: string = 'https://splitnow.io/api'

export class SplitNOW {
  public apiKey: string = ''
  public apiUrl: string = SPLITNOW_API_URL

  constructor({
    apiKey,
    apiUrl = SPLITNOW_API_URL
  }: {
    apiKey: string,
    apiUrl?: string,
  }) {
    this.apiKey = apiKey
    this.apiUrl = apiUrl

    if (!apiKey) {
      throw new Error('Invalid or missing SplitNOW API key!')
    }
  }

  // * Fetch whether API is online and healthy
  async getHealth(): Promise<boolean> {
    const isHealthy = await this.#GET(`/health/`, `text`)

    return isHealthy.toString() === 'OK'
  }

  // * Fetch supported assets
  async getAssets(): Promise<Asset[]> {
    const assets = await this.#GET(`/assets/`)

    return assets.assets
  }

  // * Fetch asset prices
  async getAssetPrices(): Promise<object> {
    const assetPrices = await this.#GET(`/assets/prices/`)

    return assetPrices.prices
  }

  // * Fetch asset deposit limits
  async getAssetDepositLimits(): Promise<AssetDepositLimit[]> {
    const assetDepositLimits = await this.#GET(`/assets/limits/`)

    return assetDepositLimits.limits
  }

  // * Fetch supported exchangers
  async getExchangers(): Promise<Exchanger[]> {
    const exchangers = await this.#GET(`/exchangers/`)

    return exchangers.exchangers
  }

  // * Create and fetch a quote for an order, for a given trade route and trade amount
  async createAndFetchQuote({
    fromAmount,
    fromAssetId,
    fromNetworkId,
    toAssetId,
    toNetworkId,
  }: {
    fromAmount: number,
    fromAssetId: string,
    fromNetworkId: string,
    toAssetId: string,
    toNetworkId: string,
  }): Promise<QuoteData> {
    const quoteId = await this.#POST(`/quotes/`, {
      type: 'floating_rate',
      quoteInput: {
        fromAmount: fromAmount,
        fromAssetId: fromAssetId,
        fromNetworkId: fromNetworkId,
      },
      quoteOutputs: [
        {
          toPctBips: 10000,
          toAssetId: toAssetId,
          toNetworkId: toNetworkId,
        },
      ],
    })

    // * Give our systems a moment to dispatch & process 50+ RFQs:
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const quote = await this.#GET(`/quotes/${quoteId}`)

    const quoteData: QuoteData = {
      quoteId: quoteId,
      rates: quote.quoteLegs.map((quoteLeg: QuoteLeg) => {
        const exchangeRate = {
          exchangeId: quoteLeg.quoteLegOutput.toExchangerId,
          exchangeRate: Number(quoteLeg.quoteLegOutput.toAmount),
        }

        return exchangeRate
      }),
    }

    return quoteData
  }

  // * Create and fetch an order, for a given trade route and trade amount
  async createAndFetchOrder({
    quoteId, // * Use the quoteId returned from createAndFetchQuote()
    fromAmount,
    fromAssetId,
    fromNetworkId,
    walletDistributions, // * The sum of all WalletDistribution.toPctBips values must add up to 10000
  }: {
    quoteId: string,
    fromAmount: number,
    fromAssetId: string,
    fromNetworkId: string,
    walletDistributions: WalletDistribution[],
  }): Promise<OrderData> {
    const limits: AssetDepositLimit[] = await this.getAssetDepositLimits()
    const minPerWallet = limits[limits.findIndex((limit: AssetDepositLimit) => limit.assetId === fromAssetId)].minDeposit
    const minAmount = minPerWallet * walletDistributions.length
    if (minAmount > fromAmount) throw new Error(`Failed to create order: Minimum deposit is ${minAmount} ${fromAssetId.toUpperCase()} (${minPerWallet} * ${walletDistributions.length} wallets)`)

    const { shortId: orderId } = await this.#POST(`/orders/`, {
      type: 'floating_rate',
      quoteId: quoteId || null,
      orderInput: {
        fromAmount: fromAmount,
        fromAssetId: fromAssetId,
        fromNetworkId: fromNetworkId,
      },
      orderOutputs: walletDistributions,
    })

    // * Give our systems a moment to dispatch & process 50+ RFQs:
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const order = await this.#GET(`/orders/${orderId}`)

    const orderData: OrderData = {
      orderId: order.shortId,
      depositAddress: order.depositWalletAddress,
      depositAmount: order.orderInput.fromAmount,
    }

    return orderData
  }

  // * Fetch the quote, for a given Quote ID
  async getQuote({
    quoteId,
  }: {
    quoteId: string,
  }): Promise<Quote> {
    const quote: Quote = await this.#GET(`/quotes/${quoteId}`)

    return quote
  }

  // * Fetch the order, for a given Order ID
  async getOrder({
    orderId,
  }: {
    orderId: string,
  }): Promise<Order> {
    const order: Order = await this.#GET(`/orders/${orderId}`)

    return order
  }

  // * Fetch the order status, for a given Order ID
  async getOrderStatus({
    orderId,
  }: {
    orderId: string,
  }): Promise<OrderStatusData> {
    const order: Order = await this.#GET(`/orders/${orderId}`)

    const orderStatusData: OrderStatusData = {
      orderId: orderId,
      orderStatus: order.status,
      orderStatusShort: order.statusShort,
      orderStatusText: order.statusText,
    }

    return orderStatusData
  }

  // * Private helper method for HTTP POST requests
  async #POST(endpoint: string, body: object): Promise<any> {
    const res: Response = await fetch(`${this.apiUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
      },
      body: JSON.stringify(body),
    })

    if (!res || !res.ok) throw new Error('Failed to make request')

    const json: any = await res.json()

    if (!endpoint.startsWith('/quotes') && !endpoint.startsWith('/orders')) {
      return json
    }

    if (!json.success) {
      throw new Error(`Failed to make request: "${json.error}"`)
    }

    return json.data
  }

  // * Private helper method for HTTP GET requests
  async #GET(endpoint: string, responseType: string = 'json'): Promise<any> {
    const res: Response = await fetch(`${this.apiUrl}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
      },
    })

    if (!res || !res.ok) throw new Error('Failed to make request')

    const json: any = responseType === 'json' ? await res.json() : await res.text()

    if (!endpoint.startsWith('/quotes') && !endpoint.startsWith('/orders')) {
      return json
    }

    if (!json.success) {
      throw new Error(`Failed to make request: "${json.error}"`)
    }

    return json.data
  }
}
