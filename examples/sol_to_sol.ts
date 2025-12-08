import { SplitNOW } from '../src/index.ts'

const SPLITNOW_API_KEY: string = process.env.SPLITNOW_API_KEY?.toString() ?? ''

const splitnow = new SplitNOW({
  apiKey: SPLITNOW_API_KEY,
})

let quoteId: string = ''
let orderId: string = ''

async function createSolToSolOrder() {
  console.log('Creating order to split 10 SOL to 2 wallets.')

  const quote = await splitnow.createAndFetchQuote({
    fromAmount: 10,
    fromAssetId: 'sol',
    fromNetworkId: 'solana',
    toAssetId: 'sol',
    toNetworkId: 'solana',
  })
  quoteId = quote.quoteId.toString()

  console.log({ quote })

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

  console.log({ order })

  const orderStatus = await splitnow.getOrderStatus({
    orderId: orderId
  })

  console.log({ orderStatus })
}

createSolToSolOrder().then(() => {
  console.log('Done!')
}).catch((error) => {
  console.error(error)
})
