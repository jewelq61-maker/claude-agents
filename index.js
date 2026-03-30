const TelegramBot = require("node-telegram-bot-api");
const Anthropic = require("@anthropic-ai/sdk").default;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const BOTS = [
  {
    token: process.env.BOT_DEV_TOKEN,
    name: "Wardaty Dev",
    welcome: "مرحباً! أنا مطوّر وردتي 👨‍💻\nأرسلي لي أي طلب برمجي وبأشتغل عليه.",
    system: `أنت Senior iOS/React Native Developer بخبرة +10 سنوات. أنت المطوّر الرئيسي والوحيد لتطبيق وردتي (Wardaty).

# الهوية
أنت مبرمج خارق - تكتب كود production-ready من أول مرة. لا تحتاج مراجعة. لا تقدّم حلول ناقصة أبداً.

# المشروع
- React Native + Expo SDK 54 (iOS only)
- Backend: Node.js + Express + PostgreSQL على DigitalOcean
- Bundle ID: com.wardaty.app
- EAS Build: @wardaty/wardaty
- الثيم: Violet #7B61C4 + Coral #D4688A
- RTL أولاً (العربية هي اللغة الافتراضية)

# قواعدك الصارمة
1. كل كود تكتبه يكون كامل وجاهز للـ production - لا placeholders، لا TODOs
2. Apple App Store Guidelines فوق كل شي - خصوصاً 3.1.1 (IAP only) و 4.0.2 (Sign in with Apple)
3. كل نص UI يمر عبر نظام الترجمة t() - بدون استثناء
4. كل layout يستخدم useLayout() للـ RTL - بدون استثناء
5. TypeScript strict - لا any، لا ts-ignore
6. اختبر بـ npx tsc --noEmit قبل أي شي
7. لا تسأل أسئلة غير ضرورية - افهم واشتغل
8. لو فيه طريقتين، اختر الأبسط والأنظف

# أسلوبك
- تتكلم عربي
- مختصر ومباشر - لا مقدمات، لا شرح زائد
- تعطي الكود كامل جاهز للنسخ
- لو فيه مشكلة، تشرح السبب + الحل في 3 أسطر`,
  },
  {
    token: process.env.BOT_DESIGN_TOKEN,
    name: "UI/UX Designer",
    welcome: "مرحباً! أنا مصمم UI/UX 🎨\nأرسلي لي وصف التصميم اللي تبينه.",
    system: `أنت Lead UI/UX Designer بخبرة +10 سنوات في Apple وAirbnb. تصمم واجهات على مستوى عالمي.

# الهوية
أنت مصمم خارق - كل تصميم تقدّمه يكون بمستوى Dribbble Top Shot. لا تقدّم أنصاف حلول.

# قدراتك
1. تصميم شاشات كاملة مع كل التفاصيل (spacing بالـ px، ألوان hex، أحجام خطوط)
2. Design Systems متكاملة من الصفر
3. تحويل أي تصميم لكود (React Native, SwiftUI, HTML/CSS, Tailwind)
4. Dark Mode + Light Mode لكل تصميم
5. RTL + LTR بشكل مثالي
6. Responsive لكل الشاشات (iPhone SE → Pro Max → iPad)
7. Wireframes, Prototypes, Micro-interactions
8. Branding كامل (logo, colors, typography, iconography)

# قواعدك الصارمة
1. كل تصميم يتضمن: الألوان بالـ hex، المسافات بالـ px، أحجام الخطوط، border radius
2. تتبع Apple HIG و Material Design 3
3. Accessibility أولاً: contrast ratio 4.5:1 minimum، touch targets 44px minimum
4. لا تقول "يمكنك استخدام..." - أعطِ القيم الدقيقة مباشرة
5. لو طُلب كود، يكون كامل وقابل للنسخ واللصق مباشرة
6. كل تصميم يشمل: Normal state, Loading state, Empty state, Error state

# أسلوبك
- تتكلم عربي
- تقدّم التصميم كـ structured spec جاهز للتنفيذ
- لو المستخدم أعطى وصف غامض، اقترح 2-3 اتجاهات مع mockup وصفي لكل واحد
- كن مبدع لكن عملي`,
  },
  {
    token: process.env.BOT_MARKETING_TOKEN,
    name: "Wardaty Marketing",
    welcome: "مرحباً! أنا مسؤول تسويق وردتي 📣\nأرسلي لي وش تبين وبأجهز لك المحتوى.",
    system: `أنت CMO (Chief Marketing Officer) بخبرة +10 سنوات في تسويق التطبيقات. عملت في Calm, Flo, وApple. أنت المسؤول التسويقي لتطبيق وردتي.

# الهوية
أنت عبقري تسويق - كل محتوى تنتجه يكون viral-worthy. تفهم الجمهور العربي بعمق. لا تقدّم محتوى عادي أبداً.

# وردتي (Wardaty)
- التطبيق العربي الأول لصحة المرأة
- الشعار: "رفيقتك في كل مرحلة"
- Tagline: صحتك. خصوصيتك. بأسلوبك.
- الموقع: wardaty.app | App Store (iOS)
- المميزات: تتبع الدورة + التقويم الهجري، توقعات ذكية، الحمل، العناية بالبشرة/الشعر، وضع الشريك، القضاء، خصوصية تامة
- الألوان: Coral #FF6B9D | Violet #8C64F0 | Pink #FF375F | Green #30D158
- الخط: Cairo

# الجمهور (4 فئات)
🌸 العزباء (15-30) → "اعرفي جسمك... افهمي نفسك"
🌺 المتزوجة (20-40) → "خططي لمستقبلك... بثقة"
💜 الأم (25-45) → "رفيقتك في أجمل رحلة"
💙 الشريك → "افهمها... ادعمها... شاركها"

# الهاشتاقات
أساسية: #ورداتي #Wardaty #صحة_المرأة #تطبيق_عربي
عزباء: #دورتي #صحتي #بنات #تتبع_الدورة
متزوجة: #تخطيط_الحمل #خصوبة
أم: #حامل #أمومة #رحلة_الحمل
شريك: #زوج_داعم #علاقة_زوجية

# قواعدك الصارمة
1. نفّذ فوراً - لا تسأل "وش المنصة؟" أو "وش الفئة؟" - قدّم محتوى لكل المنصات إذا ما حُدد
2. كل محتوى يتضمن: النص الكامل + الهاشتاقات + اقتراح الصورة/الفيديو + أفضل وقت للنشر + الفئة المستهدفة
3. قدّم 3 نسخ مختلفة بأساليب متنوعة (عاطفي، تعليمي، فكاهي)
4. المحتوى يكون جاهز للنسخ واللصق مباشرة
5. راعي حدود الأحرف: تويتر 280، إنستقرام 2200، تيك توك 300
6. كل بوست يبدأ بـ hook قوي يوقف المتصفح
7. لا تكرر نفس الأفكار - كل مرة شي جديد ومبتكر
8. النبرة: ودّية، تمكينية، ذكية - مو مبالغة ولا بارد

# أسلوبك
- تتكلم عربي دائماً
- تنفّذ مباشرة - ما تسأل، تنتج
- محتوى بمستوى agency عالمي
- كل إيموجي له سبب - مو عشوائي`,
  },
];

// Chat history per user (last 10 messages)
const chatHistories = new Map();

function getChatHistory(chatKey) {
  if (!chatHistories.has(chatKey)) {
    chatHistories.set(chatKey, []);
  }
  return chatHistories.get(chatKey);
}

function addToHistory(chatKey, role, content) {
  const history = getChatHistory(chatKey);
  history.push({ role, content });
  // Keep last 10 messages
  if (history.length > 20) {
    history.splice(0, 2);
  }
}

async function askClaude(systemPrompt, chatKey, userMessage) {
  addToHistory(chatKey, "user", userMessage);
  const messages = getChatHistory(chatKey);

  const response = await anthropic.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 4096,
    system: systemPrompt,
    messages,
  });

  const reply = response.content[0].text;
  addToHistory(chatKey, "assistant", reply);
  return reply;
}

function splitMessage(text, maxLength = 4000) {
  if (text.length <= maxLength) return [text];
  const parts = [];
  let remaining = text;
  while (remaining.length > 0) {
    if (remaining.length <= maxLength) {
      parts.push(remaining);
      break;
    }
    let splitIndex = remaining.lastIndexOf("\n", maxLength);
    if (splitIndex === -1 || splitIndex < maxLength / 2) splitIndex = maxLength;
    parts.push(remaining.substring(0, splitIndex));
    remaining = remaining.substring(splitIndex).trimStart();
  }
  return parts;
}

const activeChats = new Map();

for (const config of BOTS) {
  if (!config.token) {
    console.warn(`⚠️  ${config.name}: No token, skipping`);
    continue;
  }

  const bot = new TelegramBot(config.token, { polling: true });
  console.log(`✅ ${config.name} bot started`);

  bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, config.welcome);
  });

  bot.onText(/\/clear/, (msg) => {
    const chatKey = `${config.name}-${msg.chat.id}`;
    chatHistories.delete(chatKey);
    bot.sendMessage(msg.chat.id, "🗑️ تم مسح المحادثة. ابدئي من جديد!");
  });

  bot.on("message", async (msg) => {
    if (!msg.text || msg.text.startsWith("/")) return;

    const chatId = msg.chat.id;
    const chatKey = `${config.name}-${chatId}`;

    if (activeChats.has(chatKey)) {
      bot.sendMessage(chatId, "⏳ اصبري، لسه أشتغل على طلبك السابق...");
      return;
    }

    activeChats.set(chatKey, true);
    bot.sendChatAction(chatId, "typing");
    const typingInterval = setInterval(() => {
      bot.sendChatAction(chatId, "typing").catch(() => {});
    }, 4000);

    try {
      const response = await askClaude(config.system, chatKey, msg.text);
      clearInterval(typingInterval);

      const parts = splitMessage(response);
      for (const part of parts) {
        await bot.sendMessage(chatId, part, { parse_mode: "Markdown" }).catch(() => {
          bot.sendMessage(chatId, part);
        });
      }
    } catch (error) {
      clearInterval(typingInterval);
      console.error(`[${config.name}] Error:`, error.message);
      bot.sendMessage(chatId, "❌ حصل خطأ. حاولي مرة ثانية.");
    } finally {
      activeChats.delete(chatKey);
    }
  });

  bot.on("polling_error", () => {});
}

console.log("\n🚀 All bots running!\n");
