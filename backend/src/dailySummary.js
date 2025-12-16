// backend/src/dailySummary.js
const cron = require("node-cron");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
const db = require("./db"); // Ensure this points to your DB connection

// Image Generation Tools
const satori = require("satori").default;
const { html } = require("satori-html");
const { Resvg } = require("@resvg/resvg-js");

// --- HELPER TO GET CONFIG SAFELY ---
function getConfig() {
  const token = process.env.WA_ACCESS_TOKEN;
  const phoneId = process.env.WA_PHONE_NUMBER_ID;

  if (!token || !phoneId) {
    throw new Error("❌ Missing WA_ACCESS_TOKEN or WA_PHONE_NUMBER_ID in .env");
  }
  return { token: token.trim(), phoneId: phoneId.trim() };
}

/**
 * 1. MAIN WORKER (The Cron Job)
 */
const startDailySummaryWorker = () => {
  console.log(
    "🟢 [Worker] Daily Summary Service Started (Scheduled 21:00 IST)..."
  );

  // Run at 9:00 PM every day
  cron.schedule("25 12 * * *", async () => {
    try {
      console.log("⏰ Cron Job Triggered: Starting Batch Process...");
      await runDailyJob();
    } catch (error) {
      console.error("🔴 Cron Job Failed:", error.message);
    }
  });
};

/**
 * 2. BATCH PROCESSOR (Loops through Users)
 */
async function runDailyJob() {
  // 1. Find all users who want the summary
  const res = await db.query(
    "SELECT id, notification_phone FROM users WHERE daily_summary_enabled = TRUE"
  );
  const users = res.rows;

  if (users.length === 0) {
    console.log("ℹ️ No users have enabled daily summaries. Skipping.");
    return;
  }

  console.log(`📊 Found ${users.length} users to notify.`);

  // 2. Generate the stats & image ONCE (Optimization)
  // (Assuming all admins see the SAME store stats for now.
  // If this is a multi-tenant SaaS, you'd move this inside the loop to fetch stats per user_id)
  const stats = await getDailyStats();
  const pngBuffer = await generateSummaryImage(stats);

  // 3. Upload ONCE
  const mediaId = await uploadImageToMeta(pngBuffer);

  // 4. Send to EACH user
  for (const user of users) {
    if (user.notification_phone) {
      console.log(
        `🔹 Sending to User ${user.id} (${user.notification_phone})...`
      );
      try {
        await sendMediaMessage(user.notification_phone, mediaId, stats);
      } catch (err) {
        console.error(
          `❌ Failed to send to ${user.notification_phone}:`,
          err.message
        );
      }
    }
  }
  console.log("✅ Batch Process Complete!");
}

/**
 * 3. SINGLE SEND (For "Send Test" Button)
 */
async function generateAndSendSummary(targetPhone) {
  if (!targetPhone) {
    throw new Error("Target phone number is required for test send.");
  }

  const stats = await getDailyStats();
  const pngBuffer = await generateSummaryImage(stats);
  const mediaId = await uploadImageToMeta(pngBuffer);

  await sendMediaMessage(targetPhone, mediaId, stats);
}

/**
 * 4. ANALYTICS
 */
async function getDailyStats() {
  const query = `
        SELECT 
            COUNT(*) FILTER (WHERE status = 'completed') as new_orders,
            COALESCE(SUM(amount) FILTER (WHERE status = 'completed'), 0) as total_revenue,
            COUNT(*) FILTER (WHERE status = 'pending') as abandoned_count,
            COALESCE(SUM(amount) FILTER (WHERE status = 'pending'), 0) as lost_revenue,
            COUNT(*) FILTER (WHERE status = 'completed' AND created_at::date < CURRENT_DATE) as recovered_count
        FROM orders
        WHERE created_at >= CURRENT_DATE 
           OR created_at >= CURRENT_DATE
    `;

  const res = await db.query(query);
  const row = res.rows[0];
  return {
    new_orders: row ? row.new_orders : 0,
    total_revenue: row ? row.total_revenue : 0,
    abandoned_count: row ? row.abandoned_count : 0,
    lost_revenue: row ? row.lost_revenue : 0,
    recovered_count: row ? row.recovered_count : 0,
  };
}

/**
 * 5. IMAGE GENERATOR
 */
async function generateSummaryImage(stats) {
  // Use local file for stability
  const fontPath = path.join(__dirname, "Roboto-Regular.ttf");
  if (!fs.existsSync(fontPath)) {
    throw new Error(
      `❌ Font file missing! Please ensure 'Roboto-Regular.ttf' is in ${__dirname}`
    );
  }
  const fontBuffer = fs.readFileSync(fontPath);

  const markup = html`
    <div
      style="display: flex; flex-direction: column; width: 600px; height: 400px; background-color: #1e293b; color: white; padding: 40px; font-family: Roboto;"
    >
      <h2 style="font-size: 32px; margin-bottom: 10px;">Daily Store Summary</h2>
      <p style="font-size: 18px; color: #94a3b8; margin-bottom: 40px;">
        ${new Date().toLocaleDateString("en-IN")}
      </p>
      <div style="display: flex; gap: 20px; margin-bottom: 30px;">
        <div
          style="display: flex; flex-direction: column; background: #334155; padding: 20px; border-radius: 10px; flex: 1;"
        >
          <span style="font-size: 16px; color: #cbd5e1;">Revenue</span>
          <span style="font-size: 36px; font-weight: bold; color: #4ade80;"
            >₹${stats.total_revenue}</span
          >
        </div>
        <div
          style="display: flex; flex-direction: column; background: #334155; padding: 20px; border-radius: 10px; flex: 1;"
        >
          <span style="font-size: 16px; color: #cbd5e1;">Orders</span>
          <span style="font-size: 36px; font-weight: bold; color: white;"
            >${stats.new_orders}</span
          >
        </div>
      </div>
      <div
        style="display: flex; justify-content: space-between; background: #334155; padding: 20px; border-radius: 10px;"
      >
        <div style="display: flex; flex-direction: column;">
          <span style="font-size: 14px; color: #f87171;">Abandoned</span>
          <span style="font-size: 24px;">${stats.abandoned_count}</span>
        </div>
        <div style="display: flex; flex-direction: column;">
          <span style="font-size: 14px; color: #fbbf24;">Lost Val</span>
          <span style="font-size: 24px;">₹${stats.lost_revenue}</span>
        </div>
        <div style="display: flex; flex-direction: column;">
          <span style="font-size: 14px; color: #60a5fa;">Recovered</span>
          <span style="font-size: 24px;">${stats.recovered_count}</span>
        </div>
      </div>
    </div>
  `;

  const svg = await satori(markup, {
    width: 600,
    height: 400,
    fonts: [{ name: "Roboto", data: fontBuffer, weight: 400, style: "normal" }],
  });

  const resvg = new Resvg(svg, {
    background: "rgba(255, 255, 255, 0)",
    fitTo: { mode: "width", value: 600 },
  });
  return resvg.render().asPng();
}

/**
 * 6. UPLOADER
 */
async function uploadImageToMeta(imageBuffer) {
  const { token, phoneId } = getConfig();
  const form = new FormData();
  form.append("file", imageBuffer, {
    filename: "summary.png",
    contentType: "image/png",
  });
  form.append("type", "image/png");
  form.append("messaging_product", "whatsapp");

  const url = `https://graph.facebook.com/v21.0/${phoneId}/media`;
  const response = await axios.post(url, form, {
    headers: { Authorization: `Bearer ${token}`, ...form.getHeaders() },
  });
  return response.data.id;
}

/**
 * 7. SENDER
 */
async function sendMediaMessage(phone, mediaId, stats) {
  const { token, phoneId } = getConfig();
  const caption = `📊 *Daily Store Summary*\n\n✅ Revenue: ₹${stats.total_revenue}\n📦 Orders: ${stats.new_orders}\n⚠️ Abandoned: ${stats.abandoned_count} (₹${stats.lost_revenue})`;

  const url = `https://graph.facebook.com/v21.0/${phoneId}/messages`;
  await axios.post(
    url,
    {
      messaging_product: "whatsapp",
      to: phone,
      type: "image",
      image: { id: mediaId, caption: caption },
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  console.log(`✅ Sent to ${phone}!`);
}

module.exports = { startDailySummaryWorker, generateAndSendSummary };
