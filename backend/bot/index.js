import TelegramBot from "node-telegram-bot-api";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

//const __filename = fileURLToPath(import.meta.url);
//const __dirname = path.dirname(__filename);

function startBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    console.error("❌ TELEGRAM_BOT_TOKEN is not set.");
    return;
  }

  const bot = new TelegramBot(token, { polling: true });

  // ======================
  // /start command
  // ======================
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const user = msg.from?.first_name || "Trader";

    try {

      let  imagePath = "https://www.zaytrade.com/assets/logo.png";
     // let imagePath = path.join(__dirname, "assets", "welcome.jpg");
      //if (!fs.existsSync(imagePath)) {
     //   imagePath = "https://www.zaytrade.com/assets/logo-r9W9um86.png";
     // }

      await bot.sendPhoto(chatId, imagePath, {
        caption: `👋 *Welcome to ZayTrade*, ${user}

⚡ Fast, time-based crypto trading.
Built for speed, not confusion.`,
        parse_mode: "Markdown",
      });

      await bot.sendMessage(
        chatId,
        `
⚡ *What you can do on ZayTrade*

⏱️ Trade crypto with fixed time intervals  
🕒 Choose **30s, 60s, or 120s**

📈 *Buy* if price will go up  
📉 *Sell* if price will go down  

🎯 Enter trade → wait → result  
💰 Profit or loss calculated instantly  

📱 Available on Telegram & Web App
        `.trim(),
        { parse_mode: "Markdown" }
      );

      const keyboard = {
        keyboard: [
          [
            {
              text: "🚀 Launch Trading App",
              web_app: { url: "https://zaytrade.com" },
            },
          ],
          [
            { text: "📘 How It Works" },
            { text: "⏱️ Trading Rules" },
          ],
          [
            { text: "📊 My Trades" },
            { text: "📞 Support" },
          ],
          [
            { text: "❓ FAQ" },
            { text: "🆘 Help" },
          ],
        ],
        resize_keyboard: true,
      };

      await bot.sendMessage(chatId, "Choose an option below:", {
        reply_markup: keyboard,
      });

      console.log(`✅ Welcome sent to ${user} (${chatId})`);
    } catch (err) {
      console.error("❌ Error in /start:", err);
      await bot.sendMessage(
        chatId,
        "⚠️ Something went wrong. Please try again."
      );
    }
  });

  // ======================
  // Button handlers
  // ======================
  bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    switch (text) {
      case "📘 How It Works":
        return bot.sendMessage(
          chatId,
          `
📘 *How ZayTrade Works*

1️⃣ Select a crypto pair  
2️⃣ Choose trade duration:
   ⏱️ 30s / 60s / 120s  
3️⃣ Choose direction:
   📈 Buy = price goes up  
   📉 Sell = price goes down  
4️⃣ Enter amount & confirm  
5️⃣ Wait for timer to finish  

✅ Result is calculated instantly
          `.trim(),
          { parse_mode: "Markdown" }
        );

      case "⏱️ Trading Rules":
        return bot.sendMessage(
          chatId,
          `
⏱️ *Trading Rules*

• Fixed-time trades only  
• Available durations: 30s, 60s, 120s  
• Outcome based on price at expiry  
• No early exit  

Trade what you can afford to lose.
          `.trim(),
          { parse_mode: "Markdown" }
        );

      case "📊 My Trades":
        return bot.sendMessage(
          chatId,
          `
📊 *My Trades*

View:
• Active trades  
• Completed trades  
• Trade results  

Open the app → select any coin → scroll down to see your trade active and completed trades.
          `.trim(),
          { parse_mode: "Markdown" }
        );

      case "📞 Support":
        return bot.sendMessage(
          chatId,
          `
📞 *Support*

Need help or something feels off?
📧 support@zaytrade.com n/
live customer support n/
 open app → click chat icons

Fast response. No bots pretending to be human.
          `.trim(),
          { parse_mode: "Markdown" }
        );

      case "❓ FAQ":
        return bot.sendMessage(
          chatId,
          `
❓ *FAQ*

🔐 Is login required?  
Yes. Telegram authentication is required.

⏱️ Can I close a trade early?  
No. Trades end only when the timer finishes.

📱 Telegram or Web?  
Both use the same account.

More questions coming.
          `.trim(),
          { parse_mode: "Markdown" }
        );

      case "🆘 Help":
        return bot.sendMessage(
          chatId,
          `
🆘 *Help Menu*

Use the buttons or tap:
• 📘 How It Works  
• ⏱️ Trading Rules  
• 📊 My Trades  
• 📞 Support  

Simple on purpose.
          `.trim(),
          { parse_mode: "Markdown" }
        );
    }
  });

  bot.on("polling_error", (err) => {
    console.error("📡 Polling error:", err?.message || err);
  });

  console.log("🤖 ZayTrade Telegram Bot is running.");
}

export default startBot;
