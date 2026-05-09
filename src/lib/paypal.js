const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_MODE = process.env.PAYPAL_MODE || "sandbox";

const base = PAYPAL_MODE === "live" 
    ? "https://api-m.paypal.com" 
    : "https://api-m.sandbox.paypal.com";

/**
 * Generate an OAuth 2.0 access token from client id and secret
 */
export const generateAccessToken = async () => {
    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
        throw new Error("MISSING_API_CREDENTIALS");
    }
    const auth = Buffer.from(PAYPAL_CLIENT_ID + ":" + PAYPAL_CLIENT_SECRET).toString("base64");
    const response = await fetch(`${base}/v1/oauth2/token`, {
        method: "POST",
        body: "grant_type=client_credentials",
        headers: {
            Authorization: `Basic ${auth}`,
        },
    });

    const data = await response.json();
    return data.access_token;
};

/**
 * Handle response from PayPal API
 */
async function handleResponse(response) {
    if (response.status === 200 || response.status === 201) {
        return response.json();
    }

    const errorMessage = await response.text();
    throw new Error(errorMessage);
}

/**
 * Create an order to start the transaction
 */
export const createPayPalOrder = async (cart) => {
    const accessToken = await generateAccessToken();
    const url = `${base}/v2/checkout/orders`;
    const itemTotalValue = cart.items.reduce((acc, item) => acc + (parseFloat(item.price) * parseInt(item.quantity)), 0).toFixed(2);
    const discountValue = cart.discount ? parseFloat(cart.discount).toFixed(2) : "0.00";
    const totalValue = (parseFloat(itemTotalValue) - parseFloat(discountValue)).toFixed(2);

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
            intent: "CAPTURE",
            purchase_units: [
                {
                    amount: {
                        currency_code: cart.currency || "USD",
                        value: totalValue,
                        breakdown: {
                            item_total: {
                                currency_code: cart.currency || "USD",
                                value: itemTotalValue,
                            },
                            discount: parseFloat(discountValue) > 0 ? {
                                currency_code: cart.currency || "USD",
                                value: discountValue,
                            } : undefined,
                        },
                    },
                    items: cart.items.map(item => ({
                        name: item.title.substring(0, 127),
                        unit_amount: {
                            currency_code: cart.currency || "USD",
                            value: parseFloat(item.price).toFixed(2),
                        },
                        quantity: item.quantity.toString(),
                        category: "DIGITAL_GOODS",
                    })),
                },
            ],
            application_context: {
                shipping_preference: "NO_SHIPPING",
                user_action: "PAY_NOW",
            },
        }),
    });

    return handleResponse(response);
};

/**
 * Capture payment for an order
 */
export const capturePayPalOrder = async (orderID) => {
    const accessToken = await generateAccessToken();
    const url = `${base}/v2/checkout/orders/${orderID}/capture`;
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
    });

    return handleResponse(response);
};
