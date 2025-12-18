import axios from "axios";

export async function getUser(chatId) {
  try {
    const BOT_TOKEN = process.env.BOT_TOKEN;

    const API = `https://api.telegram.org/bot${BOT_TOKEN}`;

    const res = await axios.get(`${API}/getChat`, {
      params: { chat_id: chatId }
    });

    return res.data.result;
  } catch (err) {
    console.error("getUser error:", err.response?.data || err.message);
    return null;
  }
}

export async function getPhoto(chatId) {
  try {
    const BOT_TOKEN = process.env.BOT_TOKEN;

    const API = `https://api.telegram.org/bot${BOT_TOKEN}`;

    const photos = await axios.get(`${API}/getUserProfilePhotos`, {
      params: { user_id: chatId, limit: 1 }
    });

    if (!photos.data.result.total_count) return null;

    const fileId = photos.data.result.photos[0][0].file_id;

    const file = await axios.get(`${API}/getFile`, {
      params: { file_id: fileId }
    });

    return `https://api.telegram.org/file/bot${BOT_TOKEN}/${file.data.result.file_path}`;
  } catch (err) {
    console.error("getPhoto error:", err.response?.data || err.message);
    return null;
  }
}
export async function alertMessage(chatId, number, cutCoin) {
  try {
    const BOT_TOKEN = process.env.BOT_TOKEN;
    const API = `https://api.telegram.org/bot${BOT_TOKEN}`;

    let message = `⚠️ SMS Attack Status\nNumber: ${number}\n`;
    if (cutCoin.success) {
      message += `✅ Attack sent successfully!\n💰 Remaining coins: ${cutCoin.coin}`;
    } else {
      message += `❌ Attack failed.\nMessage: ${cutCoin.message || "No coins deducted."}`;
    }

    await axios.post(`${API}/sendMessage`, {
      chat_id: chatId,
      text: message,
      parse_mode: "HTML"
    });

  } catch (err) {
    console.error(err.response?.data || err.message);
  }
}