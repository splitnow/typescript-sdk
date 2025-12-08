import { Asset, AssetDepositLimit, Exchanger, QuoteData, Quote, WalletDistribution, OrderData, Order, OrderStatusData } from './types';
export declare class SplitNOW {
    #private;
    apiKey: string;
    apiUrl: string;
    constructor({ apiKey, apiUrl }: {
        apiKey: string;
        apiUrl?: string;
    });
    getHealth(): Promise<boolean>;
    getAssets(): Promise<Asset[]>;
    getAssetPrices(): Promise<object>;
    getAssetDepositLimits(): Promise<AssetDepositLimit[]>;
    getExchangers(): Promise<Exchanger[]>;
    createAndFetchQuote({ fromAmount, fromAssetId, fromNetworkId, toAssetId, toNetworkId, }: {
        fromAmount: number;
        fromAssetId: string;
        fromNetworkId: string;
        toAssetId: string;
        toNetworkId: string;
    }): Promise<QuoteData>;
    createAndFetchOrder({ quoteId, // * Use the quoteId returned from createAndFetchQuote()
    fromAmount, fromAssetId, fromNetworkId, walletDistributions, }: {
        quoteId: string;
        fromAmount: number;
        fromAssetId: string;
        fromNetworkId: string;
        walletDistributions: WalletDistribution[];
    }): Promise<OrderData>;
    getQuote({ quoteId, }: {
        quoteId: string;
    }): Promise<Quote>;
    getOrder({ orderId, }: {
        orderId: string;
    }): Promise<Order>;
    getOrderStatus({ orderId, }: {
        orderId: string;
    }): Promise<OrderStatusData>;
}
