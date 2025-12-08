import { describe, expect, it, test } from 'bun:test'
import { SplitNOW } from '../src/index.ts'

const SPLITNOW_API_KEY: string = process.env.SPLITNOW_API_KEY?.toString() ?? ''

const splitnow = new SplitNOW({
  apiKey: SPLITNOW_API_KEY,
})

let quoteId: string = ''
let orderId: string = ''

describe('Health', () => {
  it(`getHealth (GET /health/)`, async () => {
    const isHealthy = await splitnow.getHealth()

    expect(isHealthy).toBe(true)
  })
})

describe('Assets', () => {
  it(`getAssets (GET /assets/)`, async () => {
    const assets = await splitnow.getAssets()

    expect(assets.length > 0).toBe(true)
  })

  it(`getAssetPrices (GET /assets/prices/)`, async () => {
    const assetPrices = await splitnow.getAssetPrices()

    expect(Object.entries(assetPrices).length > 0).toBe(true)
  })

  it(`getAssetDepositLimits (GET /assets/limits/)`, async () => {
    const assetDepositLimits = await splitnow.getAssetDepositLimits()

    expect(assetDepositLimits.length > 0).toBe(true)
  })
})

describe('Exchangers', () => {
  it(`getExchangers (GET /exchangers/)`, async () => {
    const exchangers = await splitnow.getExchangers()

    expect(exchangers.length > 0).toBe(true)
  })
})

describe('Quotes', () => {
  it(`createAndFetchQuote (POST /quotes/ & GET /quotes/{id})`, async () => {
    const quote = await splitnow.createAndFetchQuote({
      fromAmount: 10,
      fromAssetId: 'sol',
      fromNetworkId: 'solana',
      toAssetId: 'sol',
      toNetworkId: 'solana',
    })

    quoteId = quote.quoteId.toString()

    expect(quote.rates.length > 0).toBe(true)
  })

  it(`getQuote (GET /quotes/{id})`, async () => {
    const quote = await splitnow.createAndFetchQuote({
      fromAmount: 10,
      fromAssetId: 'sol',
      fromNetworkId: 'solana',
      toAssetId: 'sol',
      toNetworkId: 'solana',
    })

    quoteId = quote.quoteId.toString()

    expect(quote.rates.length > 0).toBe(true)
  })
})

describe('Orders', () => {
  it(`createAndFetchOrder (POST /orders/ & GET /orders/{id})`, async () => {
    const order = await splitnow.createAndFetchOrder({
      quoteId: quoteId,
      fromAmount: 10,
      fromAssetId: 'sol',
      fromNetworkId: 'solana',
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

    orderId = order.orderId.toString()

    expect(order.depositAddress.length > 0 && order.depositAmount > 0).toBe(true)
  })

  it(`getOrder (GET /orders/{id})`, async () => {
    const order = await splitnow.getOrder({
      orderId: orderId
    })

    expect(order.statusShort === 'pending').toBe(true)
  })

  it(`getOrderStatus (GET /orders/{id})`, async () => {
    const orderStatus = await splitnow.getOrderStatus({
      orderId: orderId
    })

    expect(orderStatus.orderStatusShort === 'pending').toBe(true)
  })
})
