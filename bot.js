import TelegramBot from "node-telegram-bot-api";
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./Users.js";

dotenv.config();

await mongoose.connect(process.env.MONGO_DB);

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

const checkUserInGroup = async (chatId) => {
  try {
    const r = await bot.getChatMember(process.env.CHANNEL_USERNAME, chatId);
    return ["member", "administrator", "creator"].includes(r.status);
  } catch {
    return false;
  }
};

const saveAndCheck = async (chatId, ref) => {
  const user = await User.findOne({ chat_id: chatId });
  if (!user) {
    await User.create({ chat_id: chatId });
    if (ref) {
      const up = await User.updateOne(
        { chat_id: ref },
        { $inc: { coin: 100, rafer: 1 } }
      );
      if (up.modifiedCount > 0) {
        bot.sendMessage(
          ref,
`🎉 অভিনন্দন!

আপনার রেফার করা একজন নতুন ব্যবহারকারী সফলভাবে আমাদের সাথে যুক্ত হয়েছে!

আপনার অ্যাকাউন্টে *১০০ কয়েন* যোগ করা হয়েছে।
তারিখ: ${new Date().toLocaleDateString("bn-BD")}

আরও রেফার করুন এবং আরও কয়েন অর্জন করুন!`,
          { parse_mode: "Markdown" }
        );
      }
    }
  }
};

const generateLink = async (chatId, name, messageId = null) => {
  const token = Buffer.from(`${Math.floor(Math.random() * 100)}_${chatId}`).toString("base64");

  await User.updateOne({ chat_id: chatId }, { token });

  const text =
`👋 হ্যালো [${name}](tg://user?id=${chatId}),

আপনি এখন আপনার ইউনিক *KatsuBlast SMS সার্ভিস* লিঙ্ক অ্যাক্সেস করার জন্য প্রস্তুত। নিচের বাটনে ক্লিক করে শুরু করুন।

আমাদের শর্তাবলী ভঙ্গ বা অপব্যবহার করলে তাৎক্ষণিক ব্যবস্থা নেওয়া হবে। দয়া করে সেবা দায়িত্বশীলভাবে ব্যবহার করুন এবং নিয়ম মেনে চলুন।

যেকোনো সহায়তার জন্য আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করুন।

*KatsuBlast* বেছে নেওয়ার জন্য আপনাকে ধন্যবাদ।`;

  const keyboard = {
    inline_keyboard: [
      [
        {
          text: "🚀 KatsuBlast খুলুন",
          web_app: { url: `${process.env.MAIN_URL}${token}` }
        },
        { text: "💎 ডেইলি বোনাস", callback_data: "daily_bonus" }
      ]
    ]
  };

  if (messageId) {
    bot.editMessageText(text, {
      chat_id: chatId,
      message_id: messageId,
      parse_mode: "Markdown",
      reply_markup: keyboard
    });
  } else {
    bot.sendPhoto(chatId, "https://i.ibb.co/C5yv0Dzx/a93e47135d.jpg", {
      caption: text,
      parse_mode: "Markdown",
      reply_markup: keyboard
    });
  }
};

const dailyBonus = async (chatId) => {
  const user = await User.findOne({ chat_id: chatId });
  if (!user) return;

  const now = new Date();
  if (user.last_bonus && now - user.last_bonus < 86400000) {
    return bot.sendMessage(
      chatId,
      "⏳ আপনি ইতিমধ্যে আজকের ডেইলি বোনাস গ্রহণ করেছেন।"
    );
  }

  user.coin += 30;
  user.last_bonus = now;
  await user.save();

  bot.sendMessage(
    chatId,
    `🎉 আপনি আজকের ডেইলি বোনাস পেয়েছেন!\n\nবর্তমান কয়েন: ${user.coin}`
  );
};

const statusInfo = async (chatId) => {
  const user = await User.findOne({ chat_id: chatId });
  if (!user) return;

  const status = user.isPremium ? "💎 প্রিমিয়াম" : "🆓 ফ্রি";

  bot.sendMessage(
    chatId,
`📊 অ্যাকাউন্ট স্ট্যাটাস

আইডি: ${user.chat_id}
স্ট্যাটাস: ${status}
মোট কয়েন: ${user.coin}
মোট রেফার: ${user.rafer}
মোট বোম: ${user.total_bom}`,
    { parse_mode: "Markdown" }
  );
};

bot.onText(/\/start(.*)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const name = msg.from.first_name || "";
  const ref = match[1]?.startsWith(" r_") ? match[1].replace(" r_", "") : null;

  await saveAndCheck(chatId, ref);

  if (await checkUserInGroup(chatId)) {
    generateLink(chatId, name);
  } else {
    bot.sendMessage(
      chatId,
`🌟 স্বাগতম ${name}!

অনুগ্রহ করে নিচের বাটনে ক্লিক করে আমাদের টেলিগ্রাম চ্যানেলে যোগ দিন।
চ্যানেলে যোগ না দিলে সেবা ব্যবহার করা যাবে না।`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "চ্যানেলে যোগ দিন",
                url: `https://t.me/${process.env.CHANNEL_USERNAME.replace("@", "")}`
              },
              { text: "✔️ যোগদান করেছি", callback_data: "check_join" }
            ]
          ]
        }
      }
    );
  }
});

bot.onText(/\/status/, (msg) => statusInfo(msg.chat.id));

bot.on("callback_query", async (q) => {
  const chatId = q.message.chat.id;

  if (q.data === "check_join") {
    if (await checkUserInGroup(chatId)) {
      generateLink(chatId, q.from.first_name, q.message.message_id);
    } else {
      bot.answerCallbackQuery(q.id, { text: "আগে চ্যানেলে যোগ দিন" });
    }
  }

  if (q.data === "daily_bonus") {
    dailyBonus(chatId);
  }
});

console.log("🤖 ZEROX Bot running");