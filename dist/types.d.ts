export declare enum OrderStatus {
    PENDING_DEPOSIT_WALLET = "pending_deposit_wallet",
    CREATING_DEPOSIT_WALLET = "creating_deposit_wallet",
    CREATING_DEPOSIT_WALLET_FAILED = "creating_deposit_wallet_failed",
    CREATING_DEPOSIT_WALLET_HALTED = "creating_deposit_wallet_halted",
    CREATING_DEPOSIT_WALLET_COMPLETED = "creating_deposit_wallet_completed",
    USER_DEPOSIT_PENDING = "user_deposit_pending",
    USER_DEPOSIT_DETECTED = "user_deposit_detected",
    USER_DEPOSIT_EXPIRED = "user_deposit_expired",
    USER_DEPOSIT_FAILED = "user_deposit_failed",
    USER_DEPOSIT_HALTED = "user_deposit_halted",
    USER_DEPOSIT_COMPLETED = "user_deposit_completed",
    SENDING_TO_DEPOSIT_WALLET = "sending_to_deposit_wallet",
    SENDING_TO_DEPOSIT_WALLET_FAILED = "sending_to_deposit_wallet_failed",
    SENDING_TO_DEPOSIT_WALLET_HALTED = "sending_to_deposit_wallet_halted",
    SENDING_TO_DEPOSIT_WALLET_COMPLETED = "sending_to_deposit_wallet_completed",
    SENDING_TO_HOT_WALLET = "sending_to_hot_wallet",
    SENDING_TO_HOT_WALLET_FAILED = "sending_to_hot_wallet_failed",
    SENDING_TO_HOT_WALLET_HALTED = "sending_to_hot_wallet_halted",
    SENDING_TO_HOT_WALLET_COMPLETED = "sending_to_hot_wallet_completed",
    SENDING_TO_GAS_WALLET = "sending_to_gas_wallet",
    SENDING_TO_GAS_WALLET_FAILED = "sending_to_gas_wallet_failed",
    SENDING_TO_GAS_WALLET_HALTED = "sending_to_gas_wallet_halted",
    SENDING_TO_GAS_WALLET_COMPLETED = "sending_to_gas_wallet_completed",
    SENDING_TO_FEE_WALLET = "sending_to_fee_wallet",
    SENDING_TO_FEE_WALLET_FAILED = "sending_to_fee_wallet_failed",
    SENDING_TO_FEE_WALLET_HALTED = "sending_to_fee_wallet_halted",
    SENDING_TO_FEE_WALLET_COMPLETED = "sending_to_fee_wallet_completed",
    CREATING_ORDER_LEGS = "creating_order_legs",
    CREATING_ORDER_LEGS_FAILED = "creating_order_legs_failed",
    CREATING_ORDER_LEGS_HALTED = "creating_order_legs_halted",
    CREATING_ORDER_LEGS_COMPLETED = "creating_order_legs_completed",
    SETTLING_ORDER_LEGS = "settling_order_legs",
    SETTLING_ORDER_LEGS_FAILED = "settling_order_legs_failed",
    SETTLING_ORDER_LEGS_HALTED = "settling_order_legs_halted",
    SETTLING_ORDER_LEGS_COMPLETED = "settling_order_legs_completed",
    MONITORING = "monitoring",
    EXPIRED = "expired",// Result: order expired (retry possible)
    HALTED = "halted",// Result: provider order halted (retry possible)
    FAILED = "failed",// Result: order failed (retry possible)
    REFUNDED = "refunded",// Result: order refunded
    COMPLETED = "completed"
}
export declare enum OrderLegStatus {
    WAITING = "waiting",
    PENDING_PROVIDER_ORDER = "pending_provider_order",
    CREATING_PROVIDER_ORDER = "creating_provider_order",
    CREATING_PROVIDER_ORDER_FAILED = "creating_provider_order_failed",
    CREATING_PROVIDER_ORDER_HALTED = "creating_provider_order_halted",
    CREATING_PROVIDER_ORDER_COMPLETED = "creating_provider_order_completed",
    SENDING_TO_PROVIDER_DEPOSIT = "sending_to_provider_deposit",
    SENDING_TO_PROVIDER_DEPOSIT_FAILED = "sending_to_provider_deposit_failed",
    SENDING_TO_PROVIDER_DEPOSIT_HALTED = "sending_to_provider_deposit_halted",
    SENDING_TO_PROVIDER_DEPOSIT_COMPLETED = "sending_to_provider_deposit_completed",
    PENDING = "pending",
    PROVIDER_DEPOSIT_DETECTED = "provider_deposit_detected",// a) Await provider deposit detection
    PROVIDER_DEPOSIT_CONFIRMED = "provider_deposit_confirmed",// b) Await provider deposit confirmation
    PROVIDER_EXCHANGE_CONFIRMED = "provider_exchange_confirmed",// c) Await provider exchange confirmation
    PROVIDER_WITHDRAWAL_CONFIRMED = "provider_withdrawal_confirmed",// d) Await provider withdrawal confirmation
    EXPIRED = "expired",// Result: provider order expired (retry possible)
    HALTED = "halted",// Result: provider order halted (retry possible)
    FAILED = "failed",// Result: provider order failed (retry possible)
    REFUNDED = "refunded",// Result: provider order refunded (retry impossible)
    COMPLETED = "completed"
}
export declare enum OrderStatusShort {
    pending = "pending",
    sending = "sending",
    monitoring = "monitoring",
    expired = "expired",
    halted = "halted",
    failed = "failed",
    refunded = "refunded",
    completed = "completed"
}
export declare enum OrderStatusText {
    pending = "Awaiting Deposit",
    sending = "Settling Order Legs",
    monitoring = "Monitoring Order Legs",
    expired = "Order Expired",
    halted = "Order Halted",
    failed = "Order Failed",
    refunded = "Order Refunded",
    completed = "Order Completed"
}
export declare enum OrderLegStatusShort {
    waiting = "waiting",
    pending = "pending",
    sending = "sending",
    confirming = "confirming",
    exchanging = "exchanging",
    withdrawing = "withdrawing",
    expired = "expired",
    halted = "halted",
    failed = "failed",
    refunded = "refunded",
    completed = "completed"
}
export interface Asset {
    id: string;
    url: string;
    ca?: string;
    type: string;
    assetId: string;
    networkId: string;
    networkName: string;
    symbol: string;
    displayName: string;
    decimals: number;
    precision: number;
    limits: {
        min: number;
        max: number;
    };
    status: {
        send: boolean;
        receive: boolean;
    };
    logoPath?: string;
    assetColor?: string;
    networkColor?: string;
}
export interface AssetDepositLimit {
    assetId: string;
    minDeposit: number;
    maxDeposit: number | null;
}
export interface Exchanger {
    id: string;
    name: string;
    website: string;
    category: string;
    about: {
        country: {
            countryCode: string;
            countryName: string;
            countryFlag: string;
        };
        year: number;
        description: string;
    };
    logoPath?: string;
    bannerPath?: {
        lightMode: string;
        darkMode: string;
    };
    colors?: {
        background: string;
        foreground: string;
        icon: string;
    };
    status: {
        show: boolean;
        quotes: boolean;
        orders: boolean;
    };
    eta?: number;
    isAvailable: boolean;
}
export interface Rate {
    exchangeId: string;
    exchangeRate: number;
}
export interface QuoteData {
    quoteId: string;
    rates: Rate[];
}
export interface QuoteLeg {
    status: string;
    type: string;
    quoteId: string;
    quoteLegInput: {
        fromAmount: number;
        fromAssetId: string;
        fromNetworkId: string;
    };
    quoteLegOutput: {
        toPctBips: number;
        toAmount: number;
        toAssetId: string;
        toNetworkId: string;
        toExchangerId: string;
    };
    limits?: {
        minAmount: number | null;
        maxAmount: number | null;
    };
    createdAt?: Date;
    updatedAt?: Date;
}
export interface Quote {
    _id: string;
    status: string;
    type: string;
    userId: string | null;
    apiKeyId: string | null;
    quoteInput: {
        fromAmount: number;
        fromAssetId: string;
        fromNetworkId: string;
    };
    quoteLegs: QuoteLeg[];
}
export interface WalletDistribution {
    toAddress: string;
    toPctBips: number;
    toAssetId: string;
    toNetworkId: string;
    toExchangerId: string;
}
export interface OrderData {
    orderId: string;
    depositAddress: string;
    depositAmount: number;
}
export interface OrderOutput {
    toDistributionId: number;
    toAddress: string;
    toPctBips: number;
    toAmount: number;
    toAssetId: string;
    toNetworkId: string;
    toExchangerId: string;
}
export interface OrderLeg {
    status: OrderLegStatus;
    statusShort: OrderLegStatusShort;
    statusText: string;
    type: string;
    orderId: string;
    orderLegInput: {
        fromAmount: number;
        fromAssetId: string;
        fromNetworkId: string;
    };
    orderLegOutput: OrderOutput;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface Order {
    _id: string;
    status: OrderStatus;
    statusShort: OrderStatusShort;
    statusText: OrderStatusText;
    type: string;
    shortId: string;
    userId: string | null;
    apiKeyId: string | null;
    quoteId: string | null;
    orderInput: {
        fromAmount: number;
        fromAssetId: string;
        fromNetworkId: string;
    };
    orderOutputs: OrderOutput[];
    orderLegs: OrderLeg[];
    expiredAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
    depositWalletAddress: string;
    depositAmount: number;
}
export interface OrderStatusData {
    orderId: string;
    orderStatus: OrderStatus;
    orderStatusShort: OrderStatusShort;
    orderStatusText: OrderStatusText;
}
