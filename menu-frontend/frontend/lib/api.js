// lib/api.js
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const sendMessageToBot = async (message) => {
    try {
        const response = await fetch(`${BACKEND_URL}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message }),
        });
        if (!response.ok) {
            // Attempt to read error message from response body
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorData.message || response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error sending message to bot:", error);
        return { bot_response: "Sorry, I'm having trouble connecting right now.", recommended_dishes: [] };
    }
};

export const confirmOrder = async (orderDetails) => {
    try {
        const response = await fetch(`${BACKEND_URL}/api/order/confirm`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderDetails),
        });
        if (!response.ok) {
            // Attempt to read error message from response body
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorData.message || response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error confirming order:", error);
        return { message: "Failed to confirm order." };
    }
};
