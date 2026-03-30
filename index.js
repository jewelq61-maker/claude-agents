const TelegramBot = require("node-telegram-bot-api");
const Anthropic = require("@anthropic-ai/sdk").default;
const { generatePostImage, generateStoryImage, generateVideo, cleanupTempDir, BRAND } = require("./media");
const fs = require("fs");
const path = require("path");

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const BOTS = [
  {
    token: process.env.BOT_DEV_TOKEN,
    name: "Wardaty Dev",
    welcome: "مرحباً! أنا مطوّر وردتي 👨‍💻\nأرسلي لي أي طلب برمجي وبأشتغل عليه.",
    canMedia: false,
    system: `أنت Senior iOS/React Native Developer بخبرة +10 سنوات. أنت المطوّر الرئيسي لتطبيق وردتي (Wardaty).

أنت مبرمج خارق - تكتب كود production-ready من أول مرة. لا تحتاج مراجعة.

المشروع: React Native + Expo SDK 54 (iOS) | Backend: Node.js + Express + PostgreSQL على DigitalOcean | Bundle ID: com.wardaty.app | الثيم: Violet #7B61C4 + Coral #D4688A | RTL أولاً

قواعدك:
1. كل كود كامل وجاهز للـ production
2. Apple App Store Guidelines فوق كل شي (3.1.1 IAP only, 4.0.2 Sign in with Apple)
3. كل نص UI عبر t() وكل layout عبر useLayout()
4. TypeScript strict - لا any
5. لا تسأل أسئلة غير ضرورية - افهم واشتغل
6. لو فيه طريقتين، اختر الأبسط

تتكلم عربي. مختصر ومباشر. تعطي الكود كامل جاهز.`,
  },
  {
    token: process.env.BOT_DESIGN_TOKEN,
    name: "UI/UX Designer",
    welcome: "مرحباً! أنا Lead UI/UX Designer 🎨\n\nأرسلي أي طلب تصميم وبأنفّذ فوراً:\n📐 تصاميم شاشات مفصّلة\n🎨 Design Systems\n🖼 صورة → /post العنوان\n🎬 فيديو → /video العنوان\n💻 تحويل لكود\n\nمثال: صمم لي شاشة onboarding لتطبيق صحي",
    canMedia: true,
    system: `أنت Lead UI/UX Designer بخبرة +10 سنوات في Apple وAirbnb. تصمم على مستوى عالمي.

أنت مصمم خارق - كل تصميم بمستوى Dribbble Top Shot.

قدراتك:
1. تصميم شاشات كاملة (spacing بالـ px، ألوان hex، أحجام خطوط)
2. Design Systems متكاملة
3. تحويل لكود (React Native, SwiftUI, HTML/CSS, Tailwind)
4. Dark Mode + Light Mode + RTL + LTR
5. Responsive لكل الشاشات
6. Branding كامل

قواعدك:
1. كل تصميم يتضمن: الألوان hex، المسافات px، أحجام الخطوط، border radius
2. Apple HIG و Material Design 3
3. Accessibility: contrast 4.5:1، touch targets 44px
4. كل تصميم يشمل: Normal, Loading, Empty, Error states

لما يطلب صورة بوست أو فيديو، أرجع JSON بهالتنسيق:
للصور: {"type":"image","spec":{"title":"...","subtitle":"...","category":"...","bgColor":"#hex","accentColor":"#hex","style":"gradient|dark|light"}}
للفيديو: {"type":"video","spec":{"slides":[{"title":"...","subtitle":"...","bgColor":"#hex","accentColor":"#hex"}],"duration":6}}

تتكلم عربي. مبدع وأنيق.`,
  },
  {
    token: process.env.BOT_MARKETING_TOKEN,
    name: "Wardaty Marketing",
    welcome: "مرحباً! أنا CMO وردتي 📣\n\nأرسلي لي أي طلب وبأنفّذ فوراً:\n✍️ محتوى سوشال ميديا\n🖼 صورة بوست → /post العنوان\n📱 صورة ستوري → /story العنوان\n🎬 فيديو → /video العنوان\n📊 تحليل حملات\n\nمثال: ابي 3 بوستات انستقرام عن تتبع الدورة",
    canMedia: true,
    system: `أنت CMO بخبرة +10 سنوات في تسويق التطبيقات. عملت في Calm, Flo, وApple. المسؤول التسويقي لوردتي.

أنت عبقري تسويق - كل محتوى viral-worthy. تفهم الجمهور العربي بعمق.

وردتي: التطبيق العربي الأول لصحة المرأة | "رفيقتك في كل مرحلة" | wardaty.app | iOS
المميزات: تتبع الدورة + هجري، الحمل، العناية، وضع الشريك، القضاء، خصوصية
الألوان: Coral #FF6B9D | Violet #8C64F0 | Pink #FF375F | Green #30D158

الجمهور:
🌸 العزباء (15-30) → "اعرفي جسمك... افهمي نفسك"
🌺 المتزوجة (20-40) → "خططي لمستقبلك... بثقة"
💜 الأم (25-45) → "رفيقتك في أجمل رحلة"
💙 الشريك → "افهمها... ادعمها... شاركها"

الهاشتاقات: #ورداتي #Wardaty #صحة_المرأة #تطبيق_عربي

قواعدك الحاسمة - اكسرها وأنت ميت:
1. لا تسأل أي سؤال أبداً. أي طلب يجيك نفّذه فوراً بأفضل شكل ممكن
2. لا تقول "وش المنصة؟" أو "وش الفئة؟" أو "تبين توضحين؟" - أنت تقرر وتنفّذ
3. كل رد يتضمن المحتوى الكامل الجاهز للنسخ واللصق
4. كل بوست يبدأ بـ hook قوي يوقف التمرير
5. قدّم 3 نسخ مختلفة لكل طلب
6. كل نسخة تتضمن: النص + الهاشتاقات + الفئة المستهدفة + أفضل وقت نشر
7. لا تكرر أفكار سابقة أبداً

لما يطلب محتوى يحتاج صورة، أضف في بداية ردك JSON بهالتنسيق بالضبط (في سطر واحد):
{"type":"image","spec":{"title":"عنوان قصير","subtitle":"نص فرعي","category":"الفئة","bgColor":"#8C64F0","accentColor":"#FF6B9D","style":"gradient"}}

لما يطلب فيديو:
{"type":"video","spec":{"slides":[{"title":"سلايد 1","subtitle":"وصف","bgColor":"#8C64F0","accentColor":"#FF6B9D"},{"title":"سلايد 2","subtitle":"وصف","bgColor":"#FF6B9D","accentColor":"#8C64F0"}],"duration":6}}

ثم اكتب المحتوى التسويقي الكامل بعده.

تتكلم عربي دائماً. تنفّذ فوراً بدون نقاش. محتوى بمستوى agency عالمي.`,
  },
];

const chatHistories = new Map();
const activeChats = new Map();

function getChatHistory(chatKey) {
  if (!chatHistories.has(chatKey)) chatHistories.set(chatKey, []);
  return chatHistories.get(chatKey);
}

function addToHistory(chatKey, role, content) {
  const history = getChatHistory(chatKey);
  history.push({ role, content });
  if (history.length > 20) history.splice(0, 2);
}

async function askClaude(systemPrompt, chatKey, userMessage) {
  addToHistory(chatKey, "user", userMessage);
  const response = await anthropic.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 4096,
    system: systemPrompt,
    messages: getChatHistory(chatKey),
  });
  const reply = response.content[0].text;
  addToHistory(chatKey, "assistant", reply);
  return reply;
}

// Extract JSON media spec from Claude's response
function extractMediaSpec(text) {
  const jsonMatch = text.match(/\{[\s\S]*?"type"\s*:\s*"(image|video)"[\s\S]*?\}/);
  if (!jsonMatch) return null;
  try {
    return JSON.parse(jsonMatch[0]);
  } catch {
    return null;
  }
}

function splitMessage(text, maxLength = 4000) {
  // Remove JSON specs from text for display
  const cleanText = text.replace(/\{[\s\S]*?"type"\s*:\s*"(image|video)"[\s\S]*?\}/g, "").trim();
  if (cleanText.length <= maxLength) return [cleanText];
  const parts = [];
  let remaining = cleanText;
  while (remaining.length > 0) {
    if (remaining.length <= maxLength) { parts.push(remaining); break; }
    let idx = remaining.lastIndexOf("\n", maxLength);
    if (idx === -1 || idx < maxLength / 2) idx = maxLength;
    parts.push(remaining.substring(0, idx));
    remaining = remaining.substring(idx).trimStart();
  }
  return parts;
}

for (const config of BOTS) {
  if (!config.token) { console.warn(`⚠️ ${config.name}: No token`); continue; }

  const bot = new TelegramBot(config.token, { polling: true });
  console.log(`✅ ${config.name}`);

  bot.onText(/\/start/, (msg) => bot.sendMessage(msg.chat.id, config.welcome));
  bot.onText(/\/clear/, (msg) => {
    chatHistories.delete(`${config.name}-${msg.chat.id}`);
    bot.sendMessage(msg.chat.id, "🗑️ تم مسح المحادثة!");
  });

  // Quick media commands
  if (config.canMedia) {
    bot.onText(/\/post (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      bot.sendChatAction(chatId, "upload_photo");
      try {
        const buffer = await generatePostImage({ title: match[1], style: "gradient", bgColor: BRAND.violet, accentColor: BRAND.coral });
        await bot.sendPhoto(chatId, buffer, { caption: `🌸 ${match[1]}\n\n#ورداتي #صحة_المرأة` });
      } catch (e) {
        bot.sendMessage(chatId, "❌ خطأ في إنشاء الصورة");
      }
    });

    bot.onText(/\/story (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      bot.sendChatAction(chatId, "upload_photo");
      try {
        const buffer = await generateStoryImage({ title: match[1], style: "gradient", bgColor: BRAND.coral, accentColor: BRAND.violet });
        await bot.sendPhoto(chatId, buffer, { caption: `🌸 ${match[1]}` });
      } catch (e) {
        bot.sendMessage(chatId, "❌ خطأ في إنشاء الستوري");
      }
    });

    bot.onText(/\/video (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      bot.sendChatAction(chatId, "upload_video");
      try {
        const videoPath = await generateVideo({
          slides: [
            { title: match[1], subtitle: "صحتك. خصوصيتك. بأسلوبك.", bgColor: BRAND.violet, accentColor: BRAND.coral },
            { title: "حمّلي وردتي الآن", subtitle: "wardaty.app", bgColor: BRAND.coral, accentColor: BRAND.violet },
          ],
          duration: 6,
        });
        await bot.sendVideo(chatId, videoPath, { caption: `🎬 ${match[1]}\n\n#ورداتي` });
        cleanupTempDir(path.dirname(videoPath));
      } catch (e) {
        console.error("Video error:", e);
        bot.sendMessage(chatId, "❌ خطأ في إنشاء الفيديو");
      }
    });
  }

  // Main message handler
  bot.on("message", async (msg) => {
    if (!msg.text || msg.text.startsWith("/")) return;
    const chatId = msg.chat.id;
    const chatKey = `${config.name}-${chatId}`;

    if (activeChats.has(chatKey)) {
      bot.sendMessage(chatId, "⏳ لحظة...");
      return;
    }

    activeChats.set(chatKey, true);
    bot.sendChatAction(chatId, "typing");
    const typingInterval = setInterval(() => bot.sendChatAction(chatId, "typing").catch(() => {}), 4000);

    try {
      const response = await askClaude(config.system, chatKey, msg.text);
      clearInterval(typingInterval);

      // Check if response contains media spec
      if (config.canMedia) {
        const mediaSpec = extractMediaSpec(response);
        if (mediaSpec) {
          try {
            if (mediaSpec.type === "image") {
              bot.sendChatAction(chatId, "upload_photo");
              const buffer = await generatePostImage(mediaSpec.spec || {});
              await bot.sendPhoto(chatId, buffer);
            } else if (mediaSpec.type === "video") {
              bot.sendChatAction(chatId, "upload_video");
              const videoPath = await generateVideo(mediaSpec.spec || {});
              await bot.sendVideo(chatId, videoPath);
              cleanupTempDir(path.dirname(videoPath));
            }
          } catch (mediaErr) {
            console.error("Media gen error:", mediaErr.message);
          }
        }
      }

      // Send text response
      const parts = splitMessage(response);
      for (const part of parts) {
        if (part.trim()) {
          await bot.sendMessage(chatId, part, { parse_mode: "Markdown" }).catch(() => bot.sendMessage(chatId, part));
        }
      }
    } catch (error) {
      clearInterval(typingInterval);
      console.error(`[${config.name}]`, error.message);
      bot.sendMessage(chatId, "❌ حصل خطأ. حاولي مرة ثانية.");
    } finally {
      activeChats.delete(chatKey);
    }
  });

  bot.on("polling_error", () => {});
}

console.log("🚀 All bots running!");
