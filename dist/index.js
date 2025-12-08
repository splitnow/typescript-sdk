// src/sdk.ts
var SPLITNOW_API_URL = "https://splitnow.io/api";

class SplitNOW {
  apiKey = "";
  apiUrl = SPLITNOW_API_URL;
  constructor({
    apiKey,
    apiUrl = SPLITNOW_API_URL
  }) {
    this.apiKey = apiKey;
    this.apiUrl = apiUrl;
    if (!apiKey) {
      throw new Error("Invalid or missing SplitNOW API key!");
    }
  }
  async getHealth() {
    const isHealthy = await this.#GET(`/health/`, `text`);
    return isHealthy.toString() === "OK";
  }
  async getAssets() {
    const assets = await this.#GET(`/assets/`);
    return assets.assets;
  }
  async getAssetPrices() {
    const assetPrices = await this.#GET(`/assets/prices/`);
    return assetPrices.prices;
  }
  async getAssetDepositLimits() {
    const assetDepositLimits = await this.#GET(`/assets/limits/`);
    return assetDepositLimits.limits;
  }
  async getExchangers() {
    const exchangers = await this.#GET(`/exchangers/`);
    return exchangers.exchangers;
  }
  async createAndFetchQuote({
    fromAmount,
    fromAssetId,
    fromNetworkId,
    toAssetId,
    toNetworkId
  }) {
    const quoteId = await this.#POST(`/quotes/`, {
      type: "floating_rate",
      quoteInput: {
        fromAmount,
        fromAssetId,
        fromNetworkId
      },
      quoteOutputs: [
        {
          toPctBips: 1e4,
          toAssetId,
          toNetworkId
        }
      ]
    });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const quote = await this.#GET(`/quotes/${quoteId}`);
    const quoteData = {
      quoteId,
      rates: quote.quoteLegs.map((quoteLeg) => {
        const exchangeRate = {
          exchangeId: quoteLeg.quoteLegOutput.toExchangerId,
          exchangeRate: Number((quoteLeg.quoteLegOutput.toAmount * 99 / 100).toFixed(3))
        };
        return exchangeRate;
      })
    };
    return quoteData;
  }
  async createAndFetchOrder({
    quoteId,
    fromAmount,
    fromAssetId,
    fromNetworkId,
    walletDistributions
  }) {
    const limits = await this.getAssetDepositLimits();
    const minPerWallet = limits[limits.findIndex((limit) => limit.assetId === fromAssetId)].minDeposit;
    const minAmount = minPerWallet * walletDistributions.length;
    if (minAmount > fromAmount)
      throw new Error(`Failed to create order: Minimum deposit is ${minAmount} ${fromAssetId.toUpperCase()} (${minPerWallet} * ${walletDistributions.length} wallets)`);
    const { shortId: orderId } = await this.#POST(`/orders/`, {
      type: "floating_rate",
      quoteId: quoteId || null,
      orderInput: {
        fromAmount,
        fromAssetId,
        fromNetworkId
      },
      orderOutputs: walletDistributions
    });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const order = await this.#GET(`/orders/${orderId}`);
    const orderData = {
      orderId: order.shortId,
      depositAddress: order.depositWalletAddress,
      depositAmount: order.orderInput.fromAmount
    };
    return orderData;
  }
  async getQuote({
    quoteId
  }) {
    const quote = await this.#GET(`/quotes/${quoteId}`);
    return quote;
  }
  async getOrder({
    orderId
  }) {
    const order = await this.#GET(`/orders/${orderId}`);
    return order;
  }
  async getOrderStatus({
    orderId
  }) {
    const order = await this.#GET(`/orders/${orderId}`);
    const orderStatusData = {
      orderId,
      orderStatus: order.status,
      orderStatusShort: order.statusShort,
      orderStatusText: order.statusText
    };
    return orderStatusData;
  }
  async#POST(endpoint, body) {
    const res = await fetch(`${this.apiUrl}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey
      },
      body: JSON.stringify(body)
    });
    if (!res || !res.ok)
      throw new Error("Failed to make request");
    const json = await res.json();
    if (!endpoint.startsWith("/quotes") && !endpoint.startsWith("/orders")) {
      return json;
    }
    if (!json.success) {
      throw new Error(`Failed to make request: "${json.error}"`);
    }
    return json.data;
  }
  async#GET(endpoint, responseType = "json") {
    const res = await fetch(`${this.apiUrl}${endpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey
      }
    });
    if (!res || !res.ok)
      throw new Error("Failed to make request");
    const json = responseType === "json" ? await res.json() : await res.text();
    if (!endpoint.startsWith("/quotes") && !endpoint.startsWith("/orders")) {
      return json;
    }
    if (!json.success) {
      throw new Error(`Failed to make request: "${json.error}"`);
    }
    return json.data;
  }
}
// src/types.ts
var OrderStatus;
((OrderStatus2) => {
  OrderStatus2["PENDING_DEPOSIT_WALLET"] = "pending_deposit_wallet";
  OrderStatus2["CREATING_DEPOSIT_WALLET"] = "creating_deposit_wallet";
  OrderStatus2["CREATING_DEPOSIT_WALLET_FAILED"] = "creating_deposit_wallet_failed";
  OrderStatus2["CREATING_DEPOSIT_WALLET_HALTED"] = "creating_deposit_wallet_halted";
  OrderStatus2["CREATING_DEPOSIT_WALLET_COMPLETED"] = "creating_deposit_wallet_completed";
  OrderStatus2["USER_DEPOSIT_PENDING"] = "user_deposit_pending";
  OrderStatus2["USER_DEPOSIT_DETECTED"] = "user_deposit_detected";
  OrderStatus2["USER_DEPOSIT_EXPIRED"] = "user_deposit_expired";
  OrderStatus2["USER_DEPOSIT_FAILED"] = "user_deposit_failed";
  OrderStatus2["USER_DEPOSIT_HALTED"] = "user_deposit_halted";
  OrderStatus2["USER_DEPOSIT_COMPLETED"] = "user_deposit_completed";
  OrderStatus2["SENDING_TO_DEPOSIT_WALLET"] = "sending_to_deposit_wallet";
  OrderStatus2["SENDING_TO_DEPOSIT_WALLET_FAILED"] = "sending_to_deposit_wallet_failed";
  OrderStatus2["SENDING_TO_DEPOSIT_WALLET_HALTED"] = "sending_to_deposit_wallet_halted";
  OrderStatus2["SENDING_TO_DEPOSIT_WALLET_COMPLETED"] = "sending_to_deposit_wallet_completed";
  OrderStatus2["SENDING_TO_HOT_WALLET"] = "sending_to_hot_wallet";
  OrderStatus2["SENDING_TO_HOT_WALLET_FAILED"] = "sending_to_hot_wallet_failed";
  OrderStatus2["SENDING_TO_HOT_WALLET_HALTED"] = "sending_to_hot_wallet_halted";
  OrderStatus2["SENDING_TO_HOT_WALLET_COMPLETED"] = "sending_to_hot_wallet_completed";
  OrderStatus2["SENDING_TO_GAS_WALLET"] = "sending_to_gas_wallet";
  OrderStatus2["SENDING_TO_GAS_WALLET_FAILED"] = "sending_to_gas_wallet_failed";
  OrderStatus2["SENDING_TO_GAS_WALLET_HALTED"] = "sending_to_gas_wallet_halted";
  OrderStatus2["SENDING_TO_GAS_WALLET_COMPLETED"] = "sending_to_gas_wallet_completed";
  OrderStatus2["SENDING_TO_FEE_WALLET"] = "sending_to_fee_wallet";
  OrderStatus2["SENDING_TO_FEE_WALLET_FAILED"] = "sending_to_fee_wallet_failed";
  OrderStatus2["SENDING_TO_FEE_WALLET_HALTED"] = "sending_to_fee_wallet_halted";
  OrderStatus2["SENDING_TO_FEE_WALLET_COMPLETED"] = "sending_to_fee_wallet_completed";
  OrderStatus2["CREATING_ORDER_LEGS"] = "creating_order_legs";
  OrderStatus2["CREATING_ORDER_LEGS_FAILED"] = "creating_order_legs_failed";
  OrderStatus2["CREATING_ORDER_LEGS_HALTED"] = "creating_order_legs_halted";
  OrderStatus2["CREATING_ORDER_LEGS_COMPLETED"] = "creating_order_legs_completed";
  OrderStatus2["SETTLING_ORDER_LEGS"] = "settling_order_legs";
  OrderStatus2["SETTLING_ORDER_LEGS_FAILED"] = "settling_order_legs_failed";
  OrderStatus2["SETTLING_ORDER_LEGS_HALTED"] = "settling_order_legs_halted";
  OrderStatus2["SETTLING_ORDER_LEGS_COMPLETED"] = "settling_order_legs_completed";
  OrderStatus2["MONITORING"] = "monitoring";
  OrderStatus2["EXPIRED"] = "expired";
  OrderStatus2["HALTED"] = "halted";
  OrderStatus2["FAILED"] = "failed";
  OrderStatus2["REFUNDED"] = "refunded";
  OrderStatus2["COMPLETED"] = "completed";
})(OrderStatus ||= {});
var OrderLegStatus;
((OrderLegStatus2) => {
  OrderLegStatus2["WAITING"] = "waiting";
  OrderLegStatus2["PENDING_PROVIDER_ORDER"] = "pending_provider_order";
  OrderLegStatus2["CREATING_PROVIDER_ORDER"] = "creating_provider_order";
  OrderLegStatus2["CREATING_PROVIDER_ORDER_FAILED"] = "creating_provider_order_failed";
  OrderLegStatus2["CREATING_PROVIDER_ORDER_HALTED"] = "creating_provider_order_halted";
  OrderLegStatus2["CREATING_PROVIDER_ORDER_COMPLETED"] = "creating_provider_order_completed";
  OrderLegStatus2["SENDING_TO_PROVIDER_DEPOSIT"] = "sending_to_provider_deposit";
  OrderLegStatus2["SENDING_TO_PROVIDER_DEPOSIT_FAILED"] = "sending_to_provider_deposit_failed";
  OrderLegStatus2["SENDING_TO_PROVIDER_DEPOSIT_HALTED"] = "sending_to_provider_deposit_halted";
  OrderLegStatus2["SENDING_TO_PROVIDER_DEPOSIT_COMPLETED"] = "sending_to_provider_deposit_completed";
  OrderLegStatus2["PENDING"] = "pending";
  OrderLegStatus2["PROVIDER_DEPOSIT_DETECTED"] = "provider_deposit_detected";
  OrderLegStatus2["PROVIDER_DEPOSIT_CONFIRMED"] = "provider_deposit_confirmed";
  OrderLegStatus2["PROVIDER_EXCHANGE_CONFIRMED"] = "provider_exchange_confirmed";
  OrderLegStatus2["PROVIDER_WITHDRAWAL_CONFIRMED"] = "provider_withdrawal_confirmed";
  OrderLegStatus2["EXPIRED"] = "expired";
  OrderLegStatus2["HALTED"] = "halted";
  OrderLegStatus2["FAILED"] = "failed";
  OrderLegStatus2["REFUNDED"] = "refunded";
  OrderLegStatus2["COMPLETED"] = "completed";
})(OrderLegStatus ||= {});
var OrderStatusShort;
((OrderStatusShort2) => {
  OrderStatusShort2["pending"] = "pending";
  OrderStatusShort2["sending"] = "sending";
  OrderStatusShort2["monitoring"] = "monitoring";
  OrderStatusShort2["expired"] = "expired";
  OrderStatusShort2["halted"] = "halted";
  OrderStatusShort2["failed"] = "failed";
  OrderStatusShort2["refunded"] = "refunded";
  OrderStatusShort2["completed"] = "completed";
})(OrderStatusShort ||= {});
var OrderStatusText;
((OrderStatusText2) => {
  OrderStatusText2["pending"] = "Awaiting Deposit";
  OrderStatusText2["sending"] = "Settling Order Legs";
  OrderStatusText2["monitoring"] = "Monitoring Order Legs";
  OrderStatusText2["expired"] = "Order Expired";
  OrderStatusText2["halted"] = "Order Halted";
  OrderStatusText2["failed"] = "Order Failed";
  OrderStatusText2["refunded"] = "Order Refunded";
  OrderStatusText2["completed"] = "Order Completed";
})(OrderStatusText ||= {});
var OrderLegStatusShort;
((OrderLegStatusShort2) => {
  OrderLegStatusShort2["waiting"] = "waiting";
  OrderLegStatusShort2["pending"] = "pending";
  OrderLegStatusShort2["sending"] = "sending";
  OrderLegStatusShort2["confirming"] = "confirming";
  OrderLegStatusShort2["exchanging"] = "exchanging";
  OrderLegStatusShort2["withdrawing"] = "withdrawing";
  OrderLegStatusShort2["expired"] = "expired";
  OrderLegStatusShort2["halted"] = "halted";
  OrderLegStatusShort2["failed"] = "failed";
  OrderLegStatusShort2["refunded"] = "refunded";
  OrderLegStatusShort2["completed"] = "completed";
})(OrderLegStatusShort ||= {});
export {
  SplitNOW,
  OrderStatusText,
  OrderStatusShort,
  OrderStatus,
  OrderLegStatusShort,
  OrderLegStatus
};
