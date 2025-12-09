// backend/src/automation.js
const cron = require('node-cron');
const axios = require('axios');
const db = require('./db'); // Ensure this points to your team's db.js file

// --- CONFIGURATION ---
const ABANDONED_THRESHOLD_MINUTES = 15;
const MAX_RETRIES = 3;
// Ideally, load these from process.env in production
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN; 
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID; 

/**
 * 1. START THE WORKER
 * Call this function once in server.js
 */
const startAbandonedCartWorker = () => {
    console.log("🟢 [Worker] Abandoned Cart Automation Started...");

    // Run every minute ('* * * * *')
    cron.schedule('* * * * *', async () => {
        try {
            console.log("🔍 Checking for abandoned carts...");
            
            // THE SMART QUERY
            // 1. Order is PENDING
            // 2. Order is older than 15 mins
            // 3. We haven't sent a reminder yet
            // 4. STOP IF REPLY: User has NOT sent a message since the order was created
            const query = `
                SELECT o.id, o.amount, o.items, c.phone, c.name 
                FROM orders o
                JOIN customers c ON o.customer_id = c.id
                WHERE o.status = 'pending'
                AND o.created_at < NOW() - INTERVAL '${ABANDONED_THRESHOLD_MINUTES} minutes'
                
                -- Check 1: Ensure we haven't already reminded them
                AND NOT EXISTS (
                    SELECT 1 FROM automation_events ae 
                    WHERE ae.customer_id = c.id 
                    AND ae.event_type = 'abandoned_reminded'
                    AND ae.metadata->>'order_id' = o.id::text
                )

                -- Check 2: STOP IF REPLY RECORDED
                -- We check messages table for any 'in' (incoming) message 
                -- that arrived AFTER the order was created.
                AND NOT EXISTS (
                    SELECT 1 FROM messages m
                    WHERE m.customer_id = c.id
                    AND m.direction = 'in'
                    AND m.created_at > o.created_at
                )
            `;

            const result = await db.query(query);
            
            if (result.rows.length === 0) return;

            console.log(`⚡ Found ${result.rows.length} carts to recover.`);

            // Process each order
            for (const order of result.rows) {
                await processOrder(order);
            }

        } catch (error) {
            console.error("🔴 Global Worker Error:", error.message);
        }
    });
};

/**
 * 2. PROCESS ORDER (Orchestrator)
 */
async function processOrder(order) {
    // Safely extract item name (default to generic if missing)
    const firstItem = (order.items && order.items.length > 0) ? order.items[0].name : "your cart items";
    
    // Prepare Template Parameters: {{1}}=Name, {{2}}=Item
    const templateParams = [
        { type: "text", text: order.name || "Valued Customer" }, 
        { type: "text", text: firstItem }                        
    ];

    // Send with Retry Logic
    const success = await sendWithRetry(order.phone, templateParams);

    // Log Result to DB
    if (success) {
        await logEvent(order, 'abandoned_reminded', { status: 'success' });
        console.log(`✅ Recovered message sent to ${order.phone}`);
    } else {
        await logEvent(order, 'abandoned_failed', { status: 'failed', reason: 'max_retries_reached' });
        console.error(`❌ Failed to send to ${order.phone} after ${MAX_RETRIES} attempts.`);
    }
}

/**
 * 3. SEND WITH RETRY (The Engine)
 */
async function sendWithRetry(phone, parameters, attempt = 1) {
    try {
        const payload = {
            messaging_product: "whatsapp",
            to: phone,
            type: "template",
            template: { 
                name: "abandoned_cart", // ⚠️ MUST MATCH META TEMPLATE NAME EXACTLY
                language: { code: "en_US" },
                components: [
                    {
                        type: "body",
                        parameters: parameters 
                    }
                ]
            }
        };

        await axios.post(
            `https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`,
            payload,
            { headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` } }
        );
        
        return true; // Success!

    } catch (error) {
        console.warn(`⚠️ Attempt ${attempt} failed: ${error.message}`);
        
        if (attempt < MAX_RETRIES) {
            // Wait 1 second (1000ms) before retrying
            await new Promise(res => setTimeout(res, 1000));
            return sendWithRetry(phone, parameters, attempt + 1);
        } else {
            return false; // Give up
        }
    }
}

/**
 * 4. DB LOGGER
 */
async function logEvent(order, type, metadata) {
    try {
        await db.query(`
            INSERT INTO automation_events (customer_id, event_type, metadata)
            VALUES ($1, $2, $3)
        `, [order.customer_id || null, type, JSON.stringify({ order_id: order.id, ...metadata })]);
    } catch (e) {
        console.error("Failed to log event to DB:", e.message);
    }
}

/**
 * 5. MANUAL TRIGGER HELPER
 * Use this in your order.js route for the "Red Button"
 */
const produceManualAbandonment = async (orderId) => {
    try {
        // Update Order Status
        await db.query(
            "UPDATE orders SET status = 'abandoned', updated_at = NOW() WHERE id = $1",
            [orderId]
        );

        // Log Manual Event
        await db.query(
            `INSERT INTO automation_events (customer_id, event_type, metadata)
             SELECT customer_id, 'manual_abandon', $2
             FROM orders WHERE id = $1`,
            [orderId, JSON.stringify({ triggered_by: 'admin_panel' })]
        );
        return true;
    } catch (error) {
        console.error("Manual trigger failed:", error.message);
        return false;
    }
};

module.exports = { startAbandonedCartWorker, produceManualAbandonment };