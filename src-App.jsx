import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Home, PlusCircle, MapPin, Star, User, Shield, Globe, Camera, Check, X,
  Wallet, CreditCard, LogOut, BarChart2, Users, FileText, Download,
  ChevronRight, ChevronLeft, Upload, Clock, CheckCircle2, AlertCircle,
  Lock, Wrench, Sparkles, Truck, Package, Hammer, BookOpen, Laptop, Leaf,
  ShoppingBag, Fingerprint, Building2, Ban, Search, ArrowRight, ArrowLeft,
  BadgeCheck, TrendingUp, PieChart, ListChecks
} from "lucide-react";

/* ============================== DESIGN TOKENS ============================== */
const COLORS = {
  stone: "#F2EEE3",
  stoneDeep: "#E9E2CD",
  card: "#FCFAF3",
  ink: "#16231C",
  inkSoft: "#3E4A40",
  forest: "#1B4332",
  forestLight: "#2D6A4F",
  forestPale: "#E4EEE7",
  gold: "#C89B3C",
  goldLight: "#E4C979",
  goldPale: "#F6ECD2",
  border: "#E3DCC8",
  danger: "#B3261E",
  dangerPale: "#F6E4E1",
};

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Markazi+Text:wght@500;600;700&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&family=Noto+Nastaliq+Urdu:wght@400;600;700&display=swap');`;

/* ============================== MOCK REFERENCE DATA ============================== */
const CITIES = [
  { id: "riyadh", en: "Riyadh", ar: "الرياض" },
  { id: "jeddah", en: "Jeddah", ar: "جدة" },
  { id: "mecca", en: "Mecca", ar: "مكة المكرمة" },
  { id: "medina", en: "Medina", ar: "المدينة المنورة" },
  { id: "dammam", en: "Dammam", ar: "الدمام" },
  { id: "khobar", en: "Khobar", ar: "الخبر" },
  { id: "taif", en: "Taif", ar: "الطائف" },
  { id: "buraidah", en: "Buraidah", ar: "بريدة" },
  { id: "tabuk", en: "Tabuk", ar: "تبوك" },
  { id: "abha", en: "Abha", ar: "أبها" },
  { id: "jubail", en: "Jubail", ar: "الجبيل" },
  { id: "hail", en: "Hail", ar: "حائل" },
  { id: "najran", en: "Najran", ar: "نجران" },
  { id: "yanbu", en: "Yanbu", ar: "ينبع" },
  { id: "alahsa", en: "Al Ahsa", ar: "الأحساء" },
];

const CITY_COORDS = {
  riyadh: [24.7136, 46.6753], jeddah: [21.4858, 39.1925], mecca: [21.3891, 39.8579],
  medina: [24.5247, 39.5692], dammam: [26.4207, 50.0888], khobar: [26.2172, 50.1971],
  taif: [21.2703, 40.4158], buraidah: [26.3260, 43.9750], tabuk: [28.3998, 36.5715],
  abha: [18.2465, 42.5117], jubail: [27.0046, 49.6600], hail: [27.5114, 41.7208],
  najran: [17.4924, 44.1277], yanbu: [24.0895, 38.0618], alahsa: [25.3833, 49.5867],
};

const CATEGORIES = [
  { id: "repair", en: "Home Repair", ar: "صيانة منزلية", Icon: Wrench },
  { id: "cleaning", en: "Cleaning", ar: "تنظيف", Icon: Sparkles },
  { id: "moving", en: "Moving", ar: "نقل عفش", Icon: Truck },
  { id: "delivery", en: "Delivery", ar: "توصيل", Icon: Package },
  { id: "assembly", en: "Furniture Assembly", ar: "تركيب أثاث", Icon: Hammer },
  { id: "tutoring", en: "Tutoring", ar: "دروس خصوصية", Icon: BookOpen },
  { id: "tech", en: "Tech Support", ar: "دعم تقني", Icon: Laptop },
  { id: "garden", en: "Gardening", ar: "تنسيق حدائق", Icon: Leaf },
  { id: "errand", en: "Errands", ar: "مشاوير وأعمال متفرقة", Icon: ShoppingBag },
];

const PAYMENT_METHODS = [
  { id: "mada", en: "mada", ar: "مدى" },
  { id: "visa_mc", en: "Visa / Mastercard", ar: "فيزا / ماستركارد" },
  { id: "apple_pay", en: "Apple Pay", ar: "Apple Pay" },
  { id: "stc_pay", en: "STC Pay", ar: "STC Pay" },
  { id: "bank_transfer", en: "Bank Transfer (SARIE)", ar: "تحويل بنكي (سريع)" },
];

const SERVICE_FEE_RATE = 0.30;

const cityLabel = (id, lang) => CITIES.find((c) => c.id === id)?.[lang] || id;
const catInfo = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[0];

const CURRENCY_LABEL = { ar: "ر.س", ur: "ریال", en: "SAR" };
const fmtSAR = (n, lang) =>
  `${Number(n).toLocaleString("en-US", { maximumFractionDigits: 0 })} ${CURRENCY_LABEL[lang] || "SAR"}`;

const uid = () => Math.random().toString(36).slice(2, 10);

/* ============================== ADMIN + AUTH INTEGRATION ============================== */
const ADMIN_EMAIL = "m.alodhayb@hotmail.com";
const isAdminEmail = (email) => (email || "").trim().toLowerCase() === ADMIN_EMAIL;

/* Optional real authentication via Supabase. If window.supabase has been configured
   (see config.js), these functions talk to your real Supabase project. If it hasn't been
   configured, every function below returns { ok: false, useLocalFallback: true } so the app
   falls back to the built-in in-memory demo accounts instead of breaking. */
function hasSupabase() {
  return typeof window !== "undefined" && window.supabase && window.SUPABASE_CONFIGURED;
}

async function authSignUp({ email, password, fullName, username, phone, city }) {
  if (!hasSupabase()) return { ok: false, useLocalFallback: true };
  try {
    const { data, error } = await window.supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName, username, phone, city } },
    });
    if (error) return { ok: false, error: error.message };
    if (data.user) {
      await window.supabase.from("profiles").upsert({
        id: data.user.id, email, full_name: fullName, username, phone, city,
        is_admin: isAdminEmail(email),
      });
    }
    return { ok: true, user: data.user, session: data.session };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

async function authSignIn({ email, password }) {
  if (!hasSupabase()) return { ok: false, useLocalFallback: true };
  try {
    const { data, error } = await window.supabase.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, error: error.message };
    return { ok: true, user: data.user, session: data.session };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

async function authSignOut() {
  if (!hasSupabase()) return;
  try { await window.supabase.auth.signOut(); } catch (err) { /* no-op */ }
}

async function authGetProfile(userId) {
  if (!hasSupabase()) return null;
  try {
    const { data, error } = await window.supabase.from("profiles").select("*").eq("id", userId).single();
    if (error) return null;
    return data;
  } catch (err) {
    return null;
  }
}

function profileToUser(profile, authUser) {
  const email = profile?.email || authUser?.email || "";
  return {
    id: authUser?.id || profile?.id, username: profile?.username || (email.split("@")[0] || "user"),
    fullName: profile?.full_name || email, phone: profile?.phone || "", email,
    city: profile?.city || "riyadh", verified: !!authUser?.email_confirmed_at,
    isAdmin: isAdminEmail(email), suspended: !!profile?.suspended,
    createdAt: (authUser?.created_at || new Date().toISOString()).slice(0, 10), ratings: [],
  };
}

/* ============================== TRANSLATIONS ============================== */
const T = {
  en:
  {
    "appName": "Taskers",
    "tagline": "Post a task. Get real offers. Get it done.",
    "heroTitle": "Someone in your city can do this today.",
    "heroBody": "Post any task with your price, get offers from real people nearby, agree on a fee, and pay securely — all in Saudi Riyal.",
    "getStarted": "Get started",
    "browseAsGuest": "Browse tasks",
    "login": "Log in",
    "register": "Create account",
    "logout": "Log out",
    "fullNameHolder": "Full name",
    "username": "Username",
    "phone": "Phone number",
    "email": "Email",
    "password": "Password",
    "city": "City",
    "createAccount": "Create account",
    "alreadyHave": "Already have an account?",
    "needAccount": "Need an account?",
        "home": "Home",
    "postTask": "Post a task",
    "profile": "Profile",
    "admin": "Admin",
    "allCities": "All cities",
    "browseByCity": "Browse by city",
    "tasksNear": "Tasks in",
    "noTasks": "No open tasks here yet. Be the first to post one.",
    "askingPrice": "Asking price",
    "offers": "offers",
    "offer": "offer",
    "open": "Open for offers",
    "negotiating": "Receiving offers",
    "accepted": "Offer accepted",
    "inProgress": "In progress",
    "completed": "Completed",
    "viewTask": "View task",
    "postedBy": "Posted by",
    "taskTitle": "Task title",
    "taskTitleHolder": "e.g. Assemble IKEA wardrobe",
    "description": "Description",
    "descHolder": "Describe what you need done, materials, timing…",
    "category": "Category",
    "price": "Your price (SAR)",
    "location": "Location / address (optional)",
    "locationHolder": "e.g. Al Olaya district, near King Fahd Rd",
"pinOnMap": "Pin the location on the map (optional)", "pinOnMapHint": "Tap or drag the pin to the exact spot. Defaults to the city center.",
"mapUnavailable": "Map preview unavailable", "viewOnMap": "View on map",
    "photos": "Photos of the task (optional)",
    "addPhotos": "Add photos",
    "publish": "Publish task",
    "back": "Back",
    "taskDetails": "Task details",
    "makeOffer": "Make an offer",
    "acceptAsking": "Accept asking price",
    "yourOffer": "Your offer amount (SAR)",
    "submitOffer": "Submit offer",
    "offersReceived": "Offers received",
    "noOffersYet": "No offers yet.",
    "accept": "Accept",
    "reject": "Decline",
    "acceptedOfferFrom": "Accepted offer from",
    "payNow": "Confirm & pay",
    "paymentTitle": "Confirm payment",
    "chooseMethod": "Choose a payment method",
    "taskPrice": "Task price",
    "serviceFee": "Service fee (30%)",
    "totalDue": "Total due",
    "payerNote": "Charged to the requester. The tasker receives the task price after the platform's 30% service fee is deducted from their payout.",
    "confirmPay": "Pay securely",
    "paymentSuccess": "Payment confirmed",
    "markComplete": "Mark task as completed",
    "markedComplete": "Task completed",
    "rateExperience": "Rate your experience",
    "ratingFor": "Rating for",
    "comment": "Comment (optional)",
    "submitRating": "Submit rating",
    "thanksRating": "Thanks for your rating",
    "yourTasks": "Tasks you posted",
    "yourOffers": "Offers you made",
    "yourRatings": "Your ratings",
    "noActivity": "No activity yet.",
    "memberSince": "Member since",
    "verified": "Verified account",
    "notVerified": "Not verified",
    "adminOverview": "Overview",
    "adminCities": "Cities",
    "adminUsers": "Users",
    "adminTasks": "Tasks",
    "adminExport": "Data export",
    "totalUsers": "Total users",
    "totalTasks": "Total tasks",
    "totalRevenue": "Platform revenue (30% fees)",
    "totalGMV": "Total task value processed",
    "completedTasks": "Completed tasks",
    "activeTasks": "Active tasks",
    "revenueByCity": "Revenue & tasks by city",
    "exportUsers": "Export users (CSV)",
    "exportTasks": "Export tasks (CSV)",
    "exportAll": "Export full dataset (CSV)",
    "exportNote": "As the platform admin you can export collected platform data at any time for accounting, compliance and analysis.",
    "suspend": "Suspend",
    "unsuspend": "Reinstate",
    "suspended": "Suspended",
    "deleteTask": "Delete task",
    "deleteTaskConfirm": "Delete this task permanently?",
    "deleteConfirmYes": "Yes, delete it",
    "accountSuspendedMsg": "This account has been suspended. Contact support for help.",
    "translateTask": "Translate",
    "showOriginal": "Show original",
    "translating": "Translating…",
    "translationFailed": "Translation unavailable right now.",
    "privacyPolicy": "Privacy Policy",
    "language": "Language",
    "yourCity": "Your city",
    "welcomeBack": "Welcome back",
    "step": "Step",
    "of": "of",
    "cancel": "Cancel",
    "close": "Close",
    "ratingsCount": "ratings",
    "noRatings": "No ratings yet",
    "requester": "Requester",
    "tasker": "Tasker",
    "postedTasksEmpty": "You haven't posted any tasks yet.",
    "offersEmpty": "You haven't made any offers yet.",
    "requiredField": "Please fill in this field",
    "photoTooLarge": "Each photo must be under 5MB",
    "demoResetNote": "This is an interactive prototype — data lives in memory unless real sign-in is connected.",
    "footerRights": "All rights reserved.",
    "heroCTA1": "Post your first task",
    "heroCTA2": "See how it works",
    "howItWorks": "How Taskers works",
    "how1t": "Post your task",
    "how1b": "Add a title, description, your price, city and photos.",
    "how2t": "Get offers",
    "how2b": "Nearby taskers accept your price or send a counter-offer.",
    "how3t": "Pay securely",
    "how3b": "Accept an offer and pay with mada, Apple Pay, STC Pay and more.",
    "how4t": "Rate each other",
    "how4b": "Once the task is done, both sides rate the experience.",
    "yourRole": "Use Taskers as both a requester and a tasker — post tasks, and make offers on others.",
    "dataCollectionNotice": "By continuing you agree to our Privacy Policy.",
    "adminBadge": "Platform Admin",
    "searchTasks": "Search tasks…",
    "filterCategory": "Category",
    "allCategories": "All categories",
    "loginAs": "Continue as",
    "ratingModalReqTitle": "Rate the requester",
    "ratingModalTaskerTitle": "Rate the tasker",
    "trustBadge": "Secure sign-in, verified accounts",
    "signUpTab": "Sign up",
    "logInTab": "Log in",
    "joinTaskers": "Join Taskers",
    "joinTaskersSub": "Create an account or log in below to post a task or start making offers — right here on the home page.",
    "authErrorGeneric": "Something went wrong. Please try again.",
    "emailInUse": "This email is already registered. Try logging in instead.",
    "invalidCredentials": "Incorrect email or password.",
    "connectingAuth": "Connecting…",
  },
  ar:
  {
    "appName": "تاسكرز",
    "tagline": "انشر مهمتك، استقبل عروض حقيقية، وخلّصها.",
    "heroTitle": "في مدينتك أشخاص جاهزون ينجزون مهمتك اليوم.",
    "heroBody": "انشر أي مهمة بسعرك، استقبل عروضًا من أشخاص قريبين منك، اتفقوا على الأجرة، وادفع بأمان — كل ذلك بالريال السعودي.",
    "getStarted": "ابدأ الآن",
    "browseAsGuest": "تصفح المهام",
    "login": "تسجيل الدخول",
    "register": "إنشاء حساب",
    "logout": "تسجيل الخروج",
    "fullNameHolder": "الاسم الكامل",
    "username": "اسم المستخدم",
    "phone": "رقم الجوال",
    "email": "البريد الإلكتروني",
    "password": "كلمة المرور",
    "city": "المدينة",
    "createAccount": "إنشاء الحساب",
    "alreadyHave": "لديك حساب بالفعل؟",
    "needAccount": "تحتاج حساب جديد؟",
        "home": "الرئيسية",
    "postTask": "انشر مهمة",
    "profile": "حسابي",
    "admin": "لوحة الإدارة",
    "allCities": "كل المدن",
    "browseByCity": "تصفح حسب المدينة",
    "tasksNear": "مهام في",
    "noTasks": "لا توجد مهام مفتوحة هنا حتى الآن. كن أول من ينشر مهمة.",
    "askingPrice": "السعر المطلوب",
    "offers": "عروض",
    "offer": "عرض",
    "open": "مفتوح للعروض",
    "negotiating": "يستقبل عروضًا",
    "accepted": "تم قبول عرض",
    "inProgress": "قيد التنفيذ",
    "completed": "مكتمل",
    "viewTask": "عرض المهمة",
    "postedBy": "نشرها",
    "taskTitle": "عنوان المهمة",
    "taskTitleHolder": "مثال: تركيب دولاب ايكيا",
    "description": "الوصف",
    "descHolder": "اشرح المطلوب إنجازه، المواد، التوقيت…",
    "category": "التصنيف",
    "price": "سعرك (ريال سعودي)",
    "location": "الموقع / العنوان (اختياري)",
    "locationHolder": "مثال: حي العليا، قرب طريق الملك فهد",
"pinOnMap": "حدد الموقع على الخريطة (اختياري)", "pinOnMapHint": "اضغط أو اسحب الدبوس إلى الموقع الدقيق. يبدأ افتراضيًا من مركز المدينة.",
"mapUnavailable": "تعذّر عرض الخريطة", "viewOnMap": "عرض على الخريطة",
    "photos": "صور للمهمة (اختياري)",
    "addPhotos": "إضافة صور",
    "publish": "نشر المهمة",
    "back": "رجوع",
    "taskDetails": "تفاصيل المهمة",
    "makeOffer": "تقديم عرض",
    "acceptAsking": "قبول السعر المطلوب",
    "yourOffer": "قيمة عرضك (ريال سعودي)",
    "submitOffer": "إرسال العرض",
    "offersReceived": "العروض المستلمة",
    "noOffersYet": "لا توجد عروض بعد.",
    "accept": "قبول",
    "reject": "رفض",
    "acceptedOfferFrom": "تم قبول عرض من",
    "payNow": "تأكيد والدفع",
    "paymentTitle": "تأكيد الدفع",
    "chooseMethod": "اختر وسيلة الدفع",
    "taskPrice": "سعر المهمة",
    "serviceFee": "رسوم الخدمة (30%)",
    "totalDue": "الإجمالي المستحق",
    "payerNote": "يُحسب هذا المبلغ على صاحب المهمة. أما منفّذ المهمة فيستلم سعر المهمة كاملاً بعد خصم رسوم المنصة 30% من مستحقاته.",
    "confirmPay": "ادفع بأمان",
    "paymentSuccess": "تم تأكيد الدفع",
    "markComplete": "تحديد المهمة كمكتملة",
    "markedComplete": "تم إنجاز المهمة",
    "rateExperience": "قيّم تجربتك",
    "ratingFor": "تقييم",
    "comment": "تعليق (اختياري)",
    "submitRating": "إرسال التقييم",
    "thanksRating": "شكرًا لتقييمك",
    "yourTasks": "المهام التي نشرتها",
    "yourOffers": "العروض التي قدّمتها",
    "yourRatings": "تقييماتك",
    "noActivity": "لا يوجد نشاط بعد.",
    "memberSince": "عضو منذ",
    "verified": "حساب موثّق",
    "notVerified": "غير موثّق",
    "adminOverview": "نظرة عامة",
    "adminCities": "المدن",
    "adminUsers": "المستخدمون",
    "adminTasks": "المهام",
    "adminExport": "تصدير البيانات",
    "totalUsers": "إجمالي المستخدمين",
    "totalTasks": "إجمالي المهام",
    "totalRevenue": "إيرادات المنصة (رسوم 30%)",
    "totalGMV": "إجمالي قيمة المهام المنفذة",
    "completedTasks": "مهام مكتملة",
    "activeTasks": "مهام نشطة",
    "revenueByCity": "الإيرادات والمهام حسب المدينة",
    "exportUsers": "تصدير المستخدمين (CSV)",
    "exportTasks": "تصدير المهام (CSV)",
    "exportAll": "تصدير كامل البيانات (CSV)",
    "exportNote": "بصفتك مدير المنصة، يمكنك تصدير البيانات المجمّعة في أي وقت لأغراض المحاسبة والامتثال والتحليل.",
    "suspend": "إيقاف",
    "unsuspend": "إعادة تفعيل",
    "suspended": "موقوف",
    "deleteTask": "حذف المهمة",
    "deleteTaskConfirm": "هل تريد حذف هذه المهمة نهائيًا؟",
    "deleteConfirmYes": "نعم، احذفها",
    "accountSuspendedMsg": "تم إيقاف هذا الحساب. تواصل مع الدعم للمساعدة.",
    "translateTask": "ترجمة",
    "showOriginal": "عرض النص الأصلي",
    "translating": "جارٍ الترجمة…",
    "translationFailed": "الترجمة غير متاحة حاليًا.",
    "privacyPolicy": "سياسة الخصوصية",
    "language": "اللغة",
    "yourCity": "مدينتك",
    "welcomeBack": "مرحبًا بعودتك",
    "step": "خطوة",
    "of": "من",
    "cancel": "إلغاء",
    "close": "إغلاق",
    "ratingsCount": "تقييم",
    "noRatings": "لا توجد تقييمات بعد",
    "requester": "صاحب المهمة",
    "tasker": "منفّذ المهمة",
    "postedTasksEmpty": "لم تنشر أي مهام بعد.",
    "offersEmpty": "لم تقدّم أي عروض بعد.",
    "requiredField": "يرجى تعبئة هذا الحقل",
    "photoTooLarge": "يجب ألا يتجاوز حجم كل صورة 5 ميجابايت",
    "demoResetNote": "هذا نموذج تفاعلي تجريبي — تبقى البيانات في الذاكرة ما لم يتم ربط تسجيل دخول حقيقي.",
    "footerRights": "جميع الحقوق محفوظة.",
    "heroCTA1": "انشر مهمتك الأولى",
    "heroCTA2": "كيف تعمل المنصة",
    "howItWorks": "كيف تعمل تاسكرز",
    "how1t": "انشر مهمتك",
    "how1b": "أضف عنوانًا ووصفًا وسعرك ومدينتك وصورًا.",
    "how2t": "استقبل العروض",
    "how2b": "منفذو المهام القريبون يقبلون سعرك أو يرسلون عرضًا مقابلًا.",
    "how3t": "ادفع بأمان",
    "how3b": "اقبل عرضًا وادفع عبر مدى وApple Pay وSTC Pay وغيرها.",
    "how4t": "قيّموا بعضكم",
    "how4b": "بعد إنجاز المهمة، يقيّم الطرفان تجربتهما.",
    "yourRole": "استخدم تاسكرز كصاحب مهام ومنفّذ مهام في آن واحد — انشر مهامك، وقدّم عروضًا على مهام الآخرين.",
    "dataCollectionNotice": "بالمتابعة، فإنك توافق على سياسة الخصوصية.",
    "adminBadge": "مدير المنصة",
    "searchTasks": "ابحث عن مهام…",
    "filterCategory": "التصنيف",
    "allCategories": "كل التصنيفات",
    "loginAs": "الدخول باسم",
    "ratingModalReqTitle": "قيّم صاحب المهمة",
    "ratingModalTaskerTitle": "قيّم منفّذ المهمة",
    "trustBadge": "تسجيل دخول آمن، حسابات موثّقة",
    "signUpTab": "إنشاء حساب",
    "logInTab": "تسجيل الدخول",
    "joinTaskers": "انضم إلى تاسكرز",
    "joinTaskersSub": "أنشئ حسابًا أو سجّل الدخول أدناه لتنشر مهمة أو تبدأ بتقديم العروض — مباشرة من الصفحة الرئيسية.",
    "authErrorGeneric": "حدث خطأ ما. حاول مرة أخرى.",
    "emailInUse": "هذا البريد الإلكتروني مسجّل بالفعل. جرّب تسجيل الدخول بدلاً من ذلك.",
    "invalidCredentials": "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
    "connectingAuth": "جارٍ الاتصال…",
  },
  ur:
  {
    "appName": "ٹاسکرز",
    "tagline": "کام پوسٹ کریں، حقیقی پیشکشیں حاصل کریں، اور اسے مکمل کروائیں۔",
    "heroTitle": "آپ کے شہر میں کوئی نہ کوئی آج ہی یہ کام کر سکتا ہے۔",
    "heroBody": "اپنی قیمت کے ساتھ کوئی بھی کام پوسٹ کریں، قریبی لوگوں سے پیشکشیں حاصل کریں، اجرت طے کریں، اور محفوظ طریقے سے ادائیگی کریں — یہ سب سعودی ریال میں۔",
    "getStarted": "شروع کریں",
    "browseAsGuest": "کام دیکھیں",
    "login": "لاگ ان کریں",
    "register": "اکاؤنٹ بنائیں",
    "logout": "لاگ آؤٹ",
    "fullNameHolder": "پورا نام",
    "username": "یوزر نیم",
    "phone": "فون نمبر",
    "email": "ای میل",
    "password": "پاسورڈ",
    "city": "شہر",
    "createAccount": "اکاؤنٹ بنائیں",
    "alreadyHave": "پہلے سے اکاؤنٹ ہے؟",
    "needAccount": "نیا اکاؤنٹ چاہیے؟",
        "home": "ہوم",
    "postTask": "کام پوسٹ کریں",
    "profile": "پروفائل",
    "admin": "ایڈمن",
    "allCities": "تمام شہر",
    "browseByCity": "شہر کے لحاظ سے دیکھیں",
    "tasksNear": "کام میں",
    "noTasks": "یہاں ابھی کوئی کھلا کام نہیں ہے۔ سب سے پہلے آپ ایک پوسٹ کریں۔",
    "askingPrice": "مطلوبہ قیمت",
    "offers": "پیشکشیں",
    "offer": "پیشکش",
    "open": "پیشکشوں کے لیے کھلا",
    "negotiating": "پیشکشیں موصول ہو رہی ہیں",
    "accepted": "پیشکش قبول کر لی گئی",
    "inProgress": "جاری ہے",
    "completed": "مکمل",
    "viewTask": "کام دیکھیں",
    "postedBy": "پوسٹ کنندہ",
    "taskTitle": "کام کا عنوان",
    "taskTitleHolder": "مثلاً: آئیکیا الماری جوڑنا",
    "description": "تفصیل",
    "descHolder": "بتائیں کہ کیا کام کروانا ہے، سامان، وقت…",
    "category": "زمرہ",
    "price": "آپ کی قیمت (سعودی ریال)",
    "location": "مقام / پتہ (اختیاری)",
    "locationHolder": "مثلاً: العليا ضلع، کنگ فہد روڈ کے قریب",
"pinOnMap": "نقشے پر مقام نشان زد کریں (اختیاری)", "pinOnMapHint": "درست مقام پر پن کو دبائیں یا گھسیٹیں۔ ڈیفالٹ کے طور پر شہر کے مرکز سے شروع ہوتا ہے۔",
"mapUnavailable": "نقشہ دستیاب نہیں", "viewOnMap": "نقشے پر دیکھیں",
    "photos": "کام کی تصاویر (اختیاری)",
    "addPhotos": "تصاویر شامل کریں",
    "publish": "کام شائع کریں",
    "back": "واپس",
    "taskDetails": "کام کی تفصیلات",
    "makeOffer": "پیشکش کریں",
    "acceptAsking": "مطلوبہ قیمت قبول کریں",
    "yourOffer": "آپ کی پیشکش کی رقم (سعودی ریال)",
    "submitOffer": "پیشکش جمع کروائیں",
    "offersReceived": "موصول شدہ پیشکشیں",
    "noOffersYet": "ابھی تک کوئی پیشکش نہیں۔",
    "accept": "قبول کریں",
    "reject": "مسترد کریں",
    "acceptedOfferFrom": "پیشکش قبول کی گئی از",
    "payNow": "تصدیق اور ادائیگی",
    "paymentTitle": "ادائیگی کی تصدیق",
    "chooseMethod": "ادائیگی کا طریقہ منتخب کریں",
    "taskPrice": "کام کی قیمت",
    "serviceFee": "سروس فیس (30%)",
    "totalDue": "کل واجب الادا رقم",
    "payerNote": "یہ رقم کام پوسٹ کرنے والے سے وصول کی جاتی ہے۔ کام کرنے والے کو پلیٹ فارم کی 30% سروس فیس کی کٹوتی کے بعد رقم ملتی ہے۔",
    "confirmPay": "محفوظ ادائیگی کریں",
    "paymentSuccess": "ادائیگی کی تصدیق ہو گئی",
    "markComplete": "کام مکمل کے طور پر نشان زد کریں",
    "markedComplete": "کام مکمل ہو گیا",
    "rateExperience": "اپنے تجربے کی درجہ بندی کریں",
    "ratingFor": "درجہ بندی برائے",
    "comment": "تبصرہ (اختیاری)",
    "submitRating": "درجہ بندی جمع کروائیں",
    "thanksRating": "آپ کی درجہ بندی کا شکریہ",
    "yourTasks": "آپ کے پوسٹ کردہ کام",
    "yourOffers": "آپ کی پیشکشیں",
    "yourRatings": "آپ کی درجہ بندیاں",
    "noActivity": "ابھی تک کوئی سرگرمی نہیں۔",
    "memberSince": "رکنیت کی تاریخ",
    "verified": "تصدیق شدہ اکاؤنٹ",
    "notVerified": "غیر تصدیق شدہ",
    "adminOverview": "جائزہ",
    "adminCities": "شہر",
    "adminUsers": "صارفین",
    "adminTasks": "کام",
    "adminExport": "ڈیٹا ایکسپورٹ",
    "totalUsers": "کل صارفین",
    "totalTasks": "کل کام",
    "totalRevenue": "پلیٹ فارم آمدنی (30% فیس)",
    "totalGMV": "کل پروسیس شدہ کام کی مالیت",
    "completedTasks": "مکمل شدہ کام",
    "activeTasks": "جاری کام",
    "revenueByCity": "شہر کے لحاظ سے آمدنی اور کام",
    "exportUsers": "صارفین ایکسپورٹ کریں (CSV)",
    "exportTasks": "کام ایکسپورٹ کریں (CSV)",
    "exportAll": "مکمل ڈیٹا ایکسپورٹ کریں (CSV)",
    "exportNote": "پلیٹ فارم ایڈمن کی حیثیت سے، آپ اکاؤنٹنگ، تعمیل اور تجزیے کے لیے کسی بھی وقت اکٹھا کیا گیا ڈیٹا ایکسپورٹ کر سکتے ہیں۔",
    "suspend": "معطل کریں",
    "unsuspend": "بحال کریں",
    "suspended": "معطل شدہ",
    "deleteTask": "کام حذف کریں",
    "deleteTaskConfirm": "کیا آپ اس کام کو مستقل طور پر حذف کرنا چاہتے ہیں؟",
    "deleteConfirmYes": "جی ہاں، حذف کریں",
    "accountSuspendedMsg": "یہ اکاؤنٹ معطل کر دیا گیا ہے۔ مدد کے لیے سپورٹ سے رابطہ کریں۔",
    "translateTask": "ترجمہ کریں",
    "showOriginal": "اصل متن دکھائیں",
    "translating": "ترجمہ ہو رہا ہے…",
    "translationFailed": "فی الحال ترجمہ دستیاب نہیں۔",
    "privacyPolicy": "پرائیویسی پالیسی",
    "language": "زبان",
    "yourCity": "آپ کا شہر",
    "welcomeBack": "خوش آمدید",
    "step": "مرحلہ",
    "of": "از",
    "cancel": "منسوخ کریں",
    "close": "بند کریں",
    "ratingsCount": "درجہ بندیاں",
    "noRatings": "ابھی تک کوئی درجہ بندی نہیں",
    "requester": "کام پوسٹ کرنے والا",
    "tasker": "کام کرنے والا",
    "postedTasksEmpty": "آپ نے ابھی تک کوئی کام پوسٹ نہیں کیا۔",
    "offersEmpty": "آپ نے ابھی تک کوئی پیشکش نہیں کی۔",
    "requiredField": "براہ کرم یہ خانہ پُر کریں",
    "photoTooLarge": "ہر تصویر کا حجم 5MB سے کم ہونا چاہیے",
    "demoResetNote": "یہ ایک انٹرایکٹو پروٹو ٹائپ ہے — جب تک حقیقی سائن اِن مربوط نہ ہو، ڈیٹا صرف میموری میں رہتا ہے۔",
    "footerRights": "جملہ حقوق محفوظ ہیں۔",
    "heroCTA1": "اپنا پہلا کام پوسٹ کریں",
    "heroCTA2": "یہ کیسے کام کرتا ہے",
    "howItWorks": "ٹاسکرز کیسے کام کرتا ہے",
    "how1t": "اپنا کام پوسٹ کریں",
    "how1b": "عنوان، تفصیل، اپنی قیمت، شہر اور تصاویر شامل کریں۔",
    "how2t": "پیشکشیں حاصل کریں",
    "how2b": "قریبی کام کرنے والے آپ کی قیمت قبول کریں یا جوابی پیشکش بھیجیں۔",
    "how3t": "محفوظ ادائیگی کریں",
    "how3b": "پیشکش قبول کریں اور مدیٰ، ایپل پے، ایس ٹی سی پے وغیرہ سے ادائیگی کریں۔",
    "how4t": "ایک دوسرے کی درجہ بندی کریں",
    "how4b": "کام مکمل ہونے کے بعد، دونوں فریق تجربے کی درجہ بندی کرتے ہیں۔",
    "yourRole": "ٹاسکرز کو بیک وقت کام پوسٹ کرنے والے اور کام کرنے والے کے طور پر استعمال کریں — اپنے کام پوسٹ کریں، اور دوسروں کے کاموں پر پیشکشیں دیں۔",
    "dataCollectionNotice": "جاری رکھ کر، آپ ہماری پرائیویسی پالیسی سے اتفاق کرتے ہیں۔",
    "adminBadge": "پلیٹ فارم ایڈمن",
    "searchTasks": "کام تلاش کریں…",
    "filterCategory": "زمرہ",
    "allCategories": "تمام زمرے",
    "loginAs": "بطور جاری رکھیں",
    "ratingModalReqTitle": "کام پوسٹ کرنے والے کی درجہ بندی کریں",
    "ratingModalTaskerTitle": "کام کرنے والے کی درجہ بندی کریں",
    "trustBadge": "محفوظ سائن اِن، تصدیق شدہ اکاؤنٹس",
    "signUpTab": "اکاؤنٹ بنائیں",
    "logInTab": "لاگ ان",
    "joinTaskers": "ٹاسکرز میں شامل ہوں",
    "joinTaskersSub": "کام پوسٹ کرنے یا پیشکشیں دینا شروع کرنے کے لیے نیچے اکاؤنٹ بنائیں یا لاگ ان کریں — بالکل اسی ہوم پیج پر۔",
    "authErrorGeneric": "کچھ غلط ہو گیا۔ براہ کرم دوبارہ کوشش کریں۔",
    "emailInUse": "یہ ای میل پہلے سے رجسٹرڈ ہے۔ اس کے بجائے لاگ ان کرنے کی کوشش کریں۔",
    "invalidCredentials": "غلط ای میل یا پاسورڈ۔",
    "connectingAuth": "رابطہ ہو رہا ہے…",
  },
};

/* ============================== SEED DATA ============================== */
function seedData() {
  const admin = {
    id: "u_admin", username: "admin", password: "Nasri77811808" , fullName: "Mohammed Alodhayb",
    phone: "+966500000001", email: "m.alodhayb@hotmail.com", city: "riyadh",
    verified: true, isAdmin: true, suspended: false, createdAt: "2026-01-05",
    ratings: [],
  };

  return { users: [admin], tasks: [] };
}

/* ============================== SMALL UI PRIMITIVES ============================== */
function Btn({ children, onClick, variant = "primary", style = {}, disabled, type = "button", full }) {
  const base = {
    fontFamily: "inherit", fontWeight: 600, fontSize: 14.5, borderRadius: 10,
    padding: "10px 18px", cursor: disabled ? "not-allowed" : "pointer",
    border: "1.5px solid transparent", transition: "all .15s ease",
    opacity: disabled ? 0.55 : 1, width: full ? "100%" : "auto",
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
  };
  const variants = {
    primary: { background: COLORS.forest, color: "#fff" },
    gold: { background: COLORS.gold, color: COLORS.ink },
    outline: { background: "transparent", color: COLORS.forest, borderColor: COLORS.forest },
    ghost: { background: "transparent", color: COLORS.inkSoft, borderColor: "transparent" },
    danger: { background: "transparent", color: COLORS.danger, borderColor: COLORS.danger },
    card: { background: COLORS.card, color: COLORS.ink, borderColor: COLORS.border },
  };
  return (
    <button type={type} disabled={disabled} onClick={onClick}
      style={{ ...base, ...variants[variant], ...style }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.filter = "brightness(0.96)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.filter = "none"; }}>
      {children}
    </button>
  );
}

function Field({ label, children, required }) {
  return (
    <label style={{ display: "block", marginBottom: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.inkSoft, marginBottom: 6 }}>
        {label} {required && <span style={{ color: COLORS.gold }}>*</span>}
      </div>
      {children}
    </label>
  );
}

const inputStyle = {
  width: "100%", boxSizing: "border-box", padding: "11px 13px", borderRadius: 9,
  border: `1.5px solid ${COLORS.border}`, background: "#fff", color: COLORS.ink,
  fontFamily: "inherit", fontSize: 16, outline: "none",
};

function Input(props) { return <input {...props} style={{ ...inputStyle, ...(props.style || {}) }} />; }
function TextArea(props) { return <textarea {...props} style={{ ...inputStyle, resize: "vertical", minHeight: 90, ...(props.style || {}) }} />; }
function Select({ children, style, ...props }) {
  return (
    <div style={{ position: "relative", width: style?.width || "100%" }}>
      <select {...props} style={{
        ...inputStyle, ...(style || {}), width: "100%",
        appearance: "none", WebkitAppearance: "none", MozAppearance: "none",
        paddingInlineEnd: 30, backgroundImage: "none",
      }}>
        {children}
      </select>
      <ChevronDownGlyph />
    </div>
  );
}

function ChevronDownGlyph() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={COLORS.inkSoft} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"
      style={{ position: "absolute", top: "50%", insetInlineEnd: 12, transform: "translateY(-50%)", pointerEvents: "none" }}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function Badge({ children, tone = "forest" }) {
  const tones = {
    forest: { bg: COLORS.forestPale, fg: COLORS.forest },
    gold: { bg: COLORS.goldPale, fg: "#8A6A20" },
    danger: { bg: COLORS.dangerPale, fg: COLORS.danger },
    neutral: { bg: COLORS.stoneDeep, fg: COLORS.inkSoft },
  };
  const c = tones[tone];
  return (
    <span style={{ background: c.bg, color: c.fg, fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 5 }}>
      {children}
    </span>
  );
}

function Stars({ value, size = 14 }) {
  const full = Math.round(value || 0);
  return (
    <span style={{ display: "inline-flex", gap: 1 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} fill={i <= full ? COLORS.gold : "none"} color={COLORS.gold} strokeWidth={1.5} />
      ))}
    </span>
  );
}

function avgRating(user) {
  if (!user || !user.ratings || user.ratings.length === 0) return null;
  return user.ratings.reduce((s, r) => s + r.stars, 0) / user.ratings.length;
}

function SaduDivider({ color = COLORS.gold, height = 10 }) {
  const tri = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="${height}"><polygon points="0,${height} 10,0 20,${height}" fill="${color}"/></svg>`;
  const url = `url("data:image/svg+xml;utf8,${encodeURIComponent(tri)}")`;
  return <div style={{ height, backgroundImage: url, backgroundRepeat: "repeat-x", opacity: 0.55 }} />;
}

/* ============================== MAP (Leaflet, no API key required) ==============================
   Renders real OpenStreetMap tiles. `editable` allows clicking/dragging to set a pin (used when
   posting a task); otherwise it's a read-only preview (used on the task detail page). Falls back
   to a plain message if the map library couldn't load (e.g. no internet), without breaking the rest
   of the page. */
function LeafletMap({ lat, lng, editable = false, onChange, resetSignal, height = 220, label }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.L || !containerRef.current) { setFailed(true); return undefined; }
    let map;
    try {
      const L = window.L;
      map = L.map(containerRef.current, {
        center: [lat, lng], zoom: 12,
        dragging: true, scrollWheelZoom: false, zoomControl: true,
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
      }).addTo(map);
      const marker = L.marker([lat, lng], { draggable: editable }).addTo(map);
      if (editable) {
        marker.on("dragend", () => {
          const pos = marker.getLatLng();
          onChange && onChange(pos.lat, pos.lng);
        });
        map.on("click", (e) => {
          marker.setLatLng(e.latlng);
          onChange && onChange(e.latlng.lat, e.latlng.lng);
        });
      }
      mapRef.current = map; markerRef.current = marker;
    } catch (err) {
      setFailed(true);
    }
    return () => { if (map) map.remove(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-center when the city changes (resetSignal), without fighting a manual pin placement.
  useEffect(() => {
    if (mapRef.current && markerRef.current) {
      mapRef.current.setView([lat, lng], 12);
      markerRef.current.setLatLng([lat, lng]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal]);

  if (failed) {
    return (
      <div style={{ height, borderRadius: 10, border: `1.5px dashed ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 6, color: COLORS.inkSoft, fontSize: 12.5, textAlign: "center", padding: 12 }}>
        <MapPin size={18} />
        <span>{label || "Map preview unavailable"}</span>
      </div>
    );
  }

  return <div ref={containerRef} style={{ height, borderRadius: 10, overflow: "hidden", border: `1.5px solid ${COLORS.border}` }} />;
}

/* ============================== HEADER ============================== */
function AppHeader({ t, lang, setLang, dir, currentUser, setView, onLogout }) {
  return (
    <div style={{ position: "sticky", top: 0, zIndex: 30, background: COLORS.stone }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => setView(currentUser ? "home" : "landing")}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: COLORS.forest, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: COLORS.goldLight, fontFamily: "'Markazi Text', serif", fontWeight: 700, fontSize: 20 }}>T</span>
          </div>
          <span style={{ fontFamily: "'Markazi Text', serif", fontWeight: 700, fontSize: 24, color: COLORS.forest, letterSpacing: 0.2 }}>
            {t.appName}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {currentUser && (
            <>
              <Btn variant="ghost" onClick={() => setView("home")} style={{ padding: "8px 12px" }}>
                <Home size={16} />{t.home}
              </Btn>
              <Btn variant="ghost" onClick={() => setView("postTask")} style={{ padding: "8px 12px" }}>
                <PlusCircle size={16} />{t.postTask}
              </Btn>
              <Btn variant="ghost" onClick={() => setView("profile")} style={{ padding: "8px 12px" }}>
                <User size={16} />{t.profile}
              </Btn>
              {currentUser.isAdmin && (
                <Btn variant="ghost" onClick={() => setView("admin")} style={{ padding: "8px 12px" }}>
                  <Shield size={16} />{t.admin}
                </Btn>
              )}
            </>
          )}
          <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
            <Globe size={15} color={COLORS.inkSoft} style={{ position: "absolute", [dir === "rtl" ? "right" : "left"]: 10, pointerEvents: "none" }} />
            <select value={lang} onChange={(e) => setLang(e.target.value)} style={{
              ...inputStyle, width: "auto", padding: dir === "rtl" ? "8px 32px 8px 12px" : "8px 12px 8px 32px",
              fontSize: 13.5, fontWeight: 600, cursor: "pointer", background: COLORS.card,
              appearance: "none", WebkitAppearance: "none", MozAppearance: "none",
            }}>
              <option value="ar">العربية</option>
              <option value="en">English</option>
              <option value="ur">اردو</option>
            </select>
          </div>
          {!currentUser && (
            <Btn variant="card" onClick={() => setView("login")} style={{ padding: "8px 12px" }}>{t.login}</Btn>
          )}
          {currentUser && (
            <Btn variant="outline" onClick={onLogout} style={{ padding: "8px 12px" }}>
              <LogOut size={15} />
            </Btn>
          )}
        </div>
      </div>
      <SaduDivider />
    </div>
  );
}

/* ============================== LANDING ============================== */
function Landing({ t, lang, dir, setView, users, onLogin, onRegister }) {
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;
  return (
    <div>
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "64px 20px 40px", display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 40, alignItems: "start" }}>
        <div>
          <Badge tone="gold"><BadgeCheck size={13} /> {t.trustBadge}</Badge>
          <h1 style={{ fontFamily: "'Markazi Text', serif", fontSize: 52, lineHeight: 1.05, color: COLORS.ink, margin: "18px 0 16px", fontWeight: 700 }}>
            {t.heroTitle}
          </h1>
          <p style={{ fontSize: 17, color: COLORS.inkSoft, lineHeight: 1.7, maxWidth: 480 }}>{t.heroBody}</p>
          <Btn variant="outline" onClick={() => setView("home")} style={{ padding: "13px 24px", fontSize: 15.5, marginTop: 28 }}>
            {t.browseAsGuest} <Arrow size={16} />
          </Btn>

          <div style={{ marginTop: 36, background: COLORS.card, border: `1.5px solid ${COLORS.border}`, borderRadius: 14, padding: 18, maxWidth: 420 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.forest, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
              <Wrench size={15} /> {t.taskTitleHolder}
            </div>
            {[
              { label: t.taskPrice, val: fmtSAR(150, "en") },
              { label: t.offers, val: "3" },
              { label: t.city, val: "Riyadh" },
            ].map((r, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderTop: i > 0 ? `1px solid ${COLORS.border}` : "none", fontSize: 13.5 }}>
                <span style={{ color: COLORS.inkSoft }}>{r.label}</span>
                <span style={{ fontWeight: 700, color: COLORS.ink }}>{r.val}</span>
              </div>
            ))}
            <SaduDivider height={7} />
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 13.5 }}>
              <span style={{ color: COLORS.inkSoft }}>{t.serviceFee}</span>
              <span style={{ fontWeight: 700, color: COLORS.gold }}>{fmtSAR(45, "en")}</span>
            </div>
          </div>
        </div>

        <div style={{ background: COLORS.card, border: `1.5px solid ${COLORS.border}`, borderRadius: 18, padding: 24 }}>
          <h2 style={{ fontFamily: "'Markazi Text', serif", fontSize: 24, color: COLORS.ink, margin: "0 0 4px", fontWeight: 700 }}>{t.joinTaskers}</h2>
          <p style={{ fontSize: 13, color: COLORS.inkSoft, marginBottom: 18, lineHeight: 1.6 }}>{t.joinTaskersSub}</p>
          <AuthScreen t={t} lang={lang} dir={dir} users={users} onLogin={onLogin} onRegister={onRegister} setView={setView} compact />
        </div>
      </div>

      <div style={{ background: COLORS.card, borderTop: `1px solid ${COLORS.border}`, borderBottom: `1px solid ${COLORS.border}` }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "48px 20px" }}>
          <h2 style={{ fontFamily: "'Markazi Text', serif", fontSize: 30, color: COLORS.ink, marginBottom: 28, fontWeight: 700 }}>{t.howItWorks}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
            {[
              [t.how1t, t.how1b, PlusCircle], [t.how2t, t.how2b, Users],
              [t.how3t, t.how3b, Wallet], [t.how4t, t.how4b, Star],
            ].map(([title, body, Icon], i) => (
              <div key={i}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: COLORS.forestPale, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                  <Icon size={19} color={COLORS.forest} />
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, color: COLORS.ink, marginBottom: 5 }}>{title}</div>
                <div style={{ fontSize: 13.5, color: COLORS.inkSoft, lineHeight: 1.55 }}>{body}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "40px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <p style={{ fontSize: 13.5, color: COLORS.inkSoft }}>{t.dataCollectionNotice}</p>
        <Btn variant="ghost" onClick={() => setView("privacy")} style={{ padding: "6px 4px" }}>
          <FileText size={14} /> {t.privacyPolicy}
        </Btn>
      </div>
    </div>
  );
}

/* ============================== AUTH (Register / Login) ============================== */
function AuthScreen({ t, lang, dir, users, onLogin, onRegister, setView, compact }) {
  const [mode, setMode] = useState("register"); // register | login
  const [form, setForm] = useState({ fullName: "", username: "", phone: "", email: "", city: "riyadh", password: "" });
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const updateLogin = (k, v) => setLoginForm((f) => ({ ...f, [k]: v }));

  const submitRegister = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.username || !form.phone || !form.email || !form.password) { setError(t.requiredField); return; }
    if (users.some((u) => u.username === form.username)) { setError(lang === "ar" ? "اسم المستخدم مستخدم بالفعل" : lang === "ur" ? "یہ یوزر نیم پہلے سے استعمال میں ہے" : "Username already taken"); return; }
    setError(""); setBusy(true);
    const result = await onRegister(form);
    setBusy(false);
    if (result && result.error) setError(result.error);
  };

  const submitLogin = async (e) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) { setError(t.requiredField); return; }
    setError(""); setBusy(true);
    const result = await onLogin(loginForm);
    setBusy(false);
    if (result && result.error) setError(result.error);
  };

  return (
    <div style={{ maxWidth: 460, margin: compact ? "0" : "0 auto", padding: compact ? "0" : "48px 20px" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <Btn variant={mode === "register" ? "primary" : "card"} onClick={() => { setMode("register"); setError(""); }} style={{ flex: 1 }}>{t.signUpTab}</Btn>
        <Btn variant={mode === "login" ? "primary" : "card"} onClick={() => { setMode("login"); setError(""); }} style={{ flex: 1 }}>{t.logInTab}</Btn>
      </div>

      {mode === "login" && (
        <form onSubmit={submitLogin} style={{ background: COLORS.card, border: `1.5px solid ${COLORS.border}`, borderRadius: 16, padding: 22 }}>
          <Field label={t.email} required><Input type="email" value={loginForm.email} onChange={(e) => updateLogin("email", e.target.value)} placeholder="name@email.com" /></Field>
          <Field label={t.password} required><Input type="password" value={loginForm.password} onChange={(e) => updateLogin("password", e.target.value)} placeholder="••••••••" /></Field>
          {error && <div style={{ color: COLORS.danger, fontSize: 13, marginBottom: 12 }}>{error}</div>}
          <Btn type="submit" variant="primary" full disabled={busy} style={{ padding: 12 }}>{busy ? t.connectingAuth : t.login}</Btn>
        </form>
      )}

      {mode === "register" && (
        <form onSubmit={submitRegister} style={{ background: COLORS.card, border: `1.5px solid ${COLORS.border}`, borderRadius: 16, padding: 22 }}>
          <Field label={t.fullNameHolder} required><Input value={form.fullName} onChange={(e) => update("fullName", e.target.value)} placeholder={t.fullNameHolder} /></Field>
          <Field label={t.username} required><Input value={form.username} onChange={(e) => update("username", e.target.value)} placeholder="username" /></Field>
          <Field label={t.phone} required><Input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+966 5xx xxx xxx" /></Field>
          <Field label={t.email} required><Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="name@email.com" /></Field>
          <Field label={t.password} required><Input type="password" value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="••••••••" /></Field>
          <Field label={t.city} required>
            <Select value={form.city} onChange={(e) => update("city", e.target.value)}>
              {CITIES.map((c) => <option key={c.id} value={c.id}>{c[lang]}</option>)}
            </Select>
          </Field>
          {error && <div style={{ color: COLORS.danger, fontSize: 13, marginBottom: 12 }}>{error}</div>}
          <Btn type="submit" variant="primary" full disabled={busy} style={{ padding: 12 }}>
            {busy ? t.connectingAuth : (<>{t.createAccount} <ChevronRight size={16} style={{ transform: dir === "rtl" ? "rotate(180deg)" : "none" }} /></>)}
          </Btn>
          <p style={{ fontSize: 12, color: COLORS.inkSoft, marginTop: 12, textAlign: "center" }}>{t.dataCollectionNotice}</p>
        </form>
      )}
    </div>
  );
}

/* ============================== TASK CARD / FEED ============================== */
function TaskCard({ task, t, lang, dir, users, onOpen }) {
  const requester = users.find((u) => u.id === task.requesterId);
  const cat = catInfo(task.category);
  const statusTone = { open: "forest", negotiating: "gold", accepted: "gold", inProgress: "gold", completed: "neutral" }[task.status];
  return (
    <div onClick={() => onOpen(task.id)} style={{ background: COLORS.card, border: `1.5px solid ${COLORS.border}`, borderRadius: 14, overflow: "hidden", cursor: "pointer", display: "flex", flexDirection: "column" }}>
      <div style={{ height: 4, background: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.forest})` }} />
      {task.photos && task.photos.length > 0 ? (
        <img src={task.photos[0]} alt="" style={{ width: "100%", height: 140, objectFit: "cover" }} />
      ) : (
        <div style={{ height: 100, background: COLORS.forestPale, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <cat.Icon size={30} color={COLORS.forest} />
        </div>
      )}
      <div style={{ padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
          <Badge tone={statusTone}>{t[task.status]}</Badge>
          <Badge tone="neutral"><MapPin size={11} />{cityLabel(task.city, lang)}</Badge>
        </div>
        <div style={{ fontWeight: 700, fontSize: 15.5, color: COLORS.ink, marginBottom: 4 }}>{task.title}</div>
        <div style={{ fontSize: 13, color: COLORS.inkSoft, marginBottom: 12, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{task.description}</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10, borderTop: `1px solid ${COLORS.border}` }}>
          <div>
            <div style={{ fontSize: 11, color: COLORS.inkSoft }}>{t.askingPrice}</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: COLORS.forest }}>{fmtSAR(task.price, lang)}</div>
          </div>
          <div style={{ textAlign: dir === "rtl" ? "left" : "right" }}>
            <div style={{ fontSize: 11, color: COLORS.inkSoft }}>{task.bids.length} {task.bids.length === 1 ? t.offer : t.offers}</div>
            <div style={{ fontSize: 12, color: COLORS.inkSoft, display: "flex", alignItems: "center", gap: 4, justifyContent: dir === "rtl" ? "flex-start" : "flex-end" }}>
              <Stars value={avgRating(requester)} size={11} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TaskFeed({ t, lang, dir, tasks, users, currentUser, setView, openTask, cityFilter, setCityFilter, catFilter, setCatFilter, search, setSearch }) {
  const filtered = tasks.filter((task) =>
    (cityFilter === "all" || task.city === cityFilter) &&
    (catFilter === "all" || task.category === catFilter) &&
    (search.trim() === "" || task.title.toLowerCase().includes(search.toLowerCase()))
  );
  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", padding: "28px 20px 60px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
        <div>
          <h2 style={{ fontFamily: "'Markazi Text', serif", fontSize: 28, color: COLORS.ink, margin: 0, fontWeight: 700 }}>
            {t.tasksNear} {cityFilter === "all" ? t.allCities : cityLabel(cityFilter, lang)}
          </h2>
          <p style={{ fontSize: 13, color: COLORS.inkSoft, margin: "4px 0 0" }}>{t.demoResetNote}</p>
        </div>
        <Btn variant="primary" onClick={() => setView("postTask")} style={{ padding: "10px 18px" }}><PlusCircle size={16} />{t.postTask}</Btn>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 22 }}>
        <div style={{ position: "relative", flex: "1 1 220px" }}>
          <Search size={15} color={COLORS.inkSoft} style={{ position: "absolute", top: 12, [dir === "rtl" ? "right" : "left"]: 12 }} />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.searchTasks} style={{ [dir === "rtl" ? "paddingRight" : "paddingLeft"]: 36 }} />
        </div>
        <Select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} style={{ width: 180 }}>
          <option value="all">{t.allCities}</option>
          {CITIES.map((c) => <option key={c.id} value={c.id}>{c[lang]}</option>)}
        </Select>
        <Select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} style={{ width: 190 }}>
          <option value="all">{t.allCategories}</option>
          {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c[lang]}</option>)}
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: COLORS.inkSoft }}>
          <AlertCircle size={28} style={{ marginBottom: 10 }} />
          <div>{t.noTasks}</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 18 }}>
          {filtered.map((task) => <TaskCard key={task.id} task={task} t={t} lang={lang} dir={dir} users={users} onOpen={openTask} />)}
        </div>
      )}
    </div>
  );
}

/* ============================== POST TASK ============================== */
function PostTaskForm({ t, lang, dir, currentUser, onCreate, setView }) {
  const startCoords = CITY_COORDS[currentUser.city] || CITY_COORDS.riyadh;
  const [form, setForm] = useState({ title: "", description: "", category: "repair", city: currentUser.city, price: "", location: "", photos: [], lat: startCoords[0], lng: startCoords[1] });
  const [error, setError] = useState("");
  const fileRef = useRef();

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const updateCity = (cityId) => {
    const coords = CITY_COORDS[cityId] || CITY_COORDS.riyadh;
    setForm((f) => ({ ...f, city: cityId, lat: coords[0], lng: coords[1] }));
  };

  const handleFiles = (files) => {
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB per photo
    const valid = Array.from(files).filter((file) => {
      if (!file.type.startsWith("image/")) return false;
      if (file.size > MAX_SIZE) { setError(t.photoTooLarge); return false; }
      return true;
    });
    const readers = valid.slice(0, 4).map((file) => new Promise((res) => {
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.readAsDataURL(file);
    }));
    Promise.all(readers).then((imgs) => update("photos", [...form.photos, ...imgs].slice(0, 4)));
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.price) { setError(t.requiredField); return; }
    onCreate({
      id: "t_" + uid(), title: form.title, description: form.description, category: form.category,
      city: form.city, location: form.location, price: Number(form.price), photos: form.photos,
      lat: form.lat, lng: form.lng,
      requesterId: currentUser.id, status: "open", createdAt: new Date().toISOString().slice(0, 10),
      bids: [], acceptedBidId: null, ratedBy: [],
    });
  };

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "36px 20px 60px" }}>
      <h2 style={{ fontFamily: "'Markazi Text', serif", fontSize: 28, color: COLORS.ink, marginBottom: 20, fontWeight: 700 }}>{t.postTask}</h2>
      <form onSubmit={submit} style={{ background: COLORS.card, border: `1.5px solid ${COLORS.border}`, borderRadius: 16, padding: 22 }}>
        <Field label={t.taskTitle} required><Input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder={t.taskTitleHolder} /></Field>
        <Field label={t.category} required>
          <Select value={form.category} onChange={(e) => update("category", e.target.value)}>
            {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c[lang]}</option>)}
          </Select>
        </Field>
        <Field label={t.description} required><TextArea value={form.description} onChange={(e) => update("description", e.target.value)} placeholder={t.descHolder} /></Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label={t.price} required><Input type="number" min="1" value={form.price} onChange={(e) => update("price", e.target.value)} placeholder="150" /></Field>
          <Field label={t.city} required>
            <Select value={form.city} onChange={(e) => updateCity(e.target.value)}>
              {CITIES.map((c) => <option key={c.id} value={c.id}>{c[lang]}</option>)}
            </Select>
          </Field>
        </div>
        <Field label={t.location}><Input value={form.location} onChange={(e) => update("location", e.target.value)} placeholder={t.locationHolder} /></Field>
        <Field label={t.pinOnMap}>
          <LeafletMap lat={form.lat} lng={form.lng} editable resetSignal={form.city}
            onChange={(lat, lng) => setForm((f) => ({ ...f, lat, lng }))}
            label={t.mapUnavailable} height={200} />
          <div style={{ fontSize: 11.5, color: COLORS.inkSoft, marginTop: 6 }}>{t.pinOnMapHint}</div>
        </Field>
        <Field label={t.photos}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {form.photos.map((p, i) => <img key={i} src={p} alt="" style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8, border: `1.5px solid ${COLORS.border}` }} />)}
            <button type="button" onClick={() => fileRef.current.click()} style={{ width: 64, height: 64, borderRadius: 8, border: `1.5px dashed ${COLORS.border}`, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <Camera size={20} color={COLORS.inkSoft} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => handleFiles(e.target.files)} />
          </div>
        </Field>
        {error && <div style={{ color: COLORS.danger, fontSize: 13, marginBottom: 12 }}>{error}</div>}
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <Btn variant="ghost" onClick={() => setView("home")}>{t.cancel}</Btn>
          <Btn type="submit" variant="primary" full style={{ padding: 12 }}>{t.publish}</Btn>
        </div>
      </form>
    </div>
  );
}

/* ============================== RATING MODAL ============================== */
function RatingModal({ t, dir, title, onSubmit, onClose }) {
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState("");
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(22,35,28,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 24, width: "100%", maxWidth: 380 }}>
        <h3 style={{ fontFamily: "'Markazi Text', serif", fontSize: 22, fontWeight: 700, color: COLORS.ink, marginBottom: 14 }}>{title}</h3>
        <div style={{ display: "flex", gap: 6, marginBottom: 16, justifyContent: "center" }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} size={30} fill={i <= stars ? COLORS.gold : "none"} color={COLORS.gold} strokeWidth={1.5} style={{ cursor: "pointer" }} onClick={() => setStars(i)} />
          ))}
        </div>
        <Field label={t.comment}><TextArea value={comment} onChange={(e) => setComment(e.target.value)} /></Field>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn variant="ghost" onClick={onClose}>{t.cancel}</Btn>
          <Btn variant="primary" full onClick={() => onSubmit(stars, comment)}>{t.submitRating}</Btn>
        </div>
      </div>
    </div>
  );
}

/* ============================== PAYMENT MODAL ============================== */
function PaymentModal({ t, lang, task, onConfirm, onClose }) {
  const [method, setMethod] = useState("mada");
  const fee = Math.round(task.price * SERVICE_FEE_RATE);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(22,35,28,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 24, width: "100%", maxWidth: 420 }}>
        <h3 style={{ fontFamily: "'Markazi Text', serif", fontSize: 22, fontWeight: 700, color: COLORS.ink, marginBottom: 14 }}>{t.paymentTitle}</h3>

        <div style={{ background: COLORS.stone, borderRadius: 10, padding: 14, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, marginBottom: 6 }}>
            <span style={{ color: COLORS.inkSoft }}>{t.taskPrice}</span><span style={{ fontWeight: 600 }}>{fmtSAR(task.price, lang)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, marginBottom: 6 }}>
            <span style={{ color: COLORS.inkSoft }}>{t.serviceFee}</span><span style={{ fontWeight: 600, color: COLORS.gold }}>{fmtSAR(fee, lang)}</span>
          </div>
          <div style={{ borderTop: `1px solid ${COLORS.border}`, marginTop: 8, paddingTop: 8, display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 700 }}>
            <span>{t.totalDue}</span><span style={{ color: COLORS.forest }}>{fmtSAR(task.price, lang)}</span>
          </div>
          <p style={{ fontSize: 11.5, color: COLORS.inkSoft, marginTop: 8, lineHeight: 1.5 }}>{t.payerNote}</p>
        </div>

        <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.inkSoft, marginBottom: 8 }}>{t.chooseMethod}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 18 }}>
          {PAYMENT_METHODS.map((m) => (
            <button key={m.id} onClick={() => setMethod(m.id)} style={{
              padding: "10px 12px", borderRadius: 9, cursor: "pointer", fontFamily: "inherit", fontSize: 13.5, fontWeight: 600,
              border: `1.5px solid ${method === m.id ? COLORS.forest : COLORS.border}`,
              background: method === m.id ? COLORS.forestPale : "#fff", color: COLORS.ink,
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <CreditCard size={14} color={method === m.id ? COLORS.forest : COLORS.inkSoft} /> {m[lang]}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn variant="ghost" onClick={onClose}>{t.cancel}</Btn>
          <Btn variant="primary" full onClick={() => onConfirm(method)}><Lock size={14} />{t.confirmPay}</Btn>
        </div>
      </div>
    </div>
  );
}

/* ============================== TASK DETAIL ============================== */
function TaskDetail({ t, lang, dir, task, users, currentUser, actions, setView }) {
  const [offerAmount, setOfferAmount] = useState("");
  const [showPay, setShowPay] = useState(false);
  const [rateFor, setRateFor] = useState(null); // 'requester' | 'tasker'
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [translated, setTranslated] = useState(null); // { title, description } | null
  const [translating, setTranslating] = useState(false);
  const [translateError, setTranslateError] = useState("");

  const requester = users.find((u) => u.id === task.requesterId);
  const isOwner = currentUser && currentUser.id === task.requesterId;
  const canDelete = currentUser && (isOwner || currentUser.isAdmin);
  const myBid = task.bids.find((b) => b.taskerId === currentUser?.id);
  const acceptedBid = task.bids.find((b) => b.id === task.acceptedBidId);
  const taskerOfAccepted = acceptedBid && users.find((u) => u.id === acceptedBid.taskerId);
  const cat = catInfo(task.category);

  const iHaveRated = currentUser && task.ratedBy?.includes(currentUser.id);
  const canRate = currentUser && task.status === "completed" && (currentUser.id === task.requesterId || currentUser.id === acceptedBid?.taskerId) && !iHaveRated;

  const runTranslate = async () => {
    if (translated) { setTranslated(null); return; } // toggle back to original
    setTranslating(true); setTranslateError("");
    try {
      const res = await fetch("/api/translate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: task.title, description: task.description, targetLang: lang }),
      });
      if (!res.ok) throw new Error("bad response");
      const data = await res.json();
      setTranslated({ title: data.title, description: data.description });
    } catch (err) {
      setTranslateError(t.translationFailed);
    } finally {
      setTranslating(false);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "28px 20px 70px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <Btn variant="ghost" onClick={() => setView("home")} style={{ padding: "6px 4px" }}>
          {dir === "rtl" ? <ArrowRight size={15} /> : <ArrowLeft size={15} />} {t.back}
        </Btn>
        {canDelete && !confirmingDelete && (
          <Btn variant="danger" onClick={() => setConfirmingDelete(true)} style={{ padding: "6px 12px", fontSize: 13 }}>
            <X size={14} />{t.deleteTask}
          </Btn>
        )}
        {canDelete && confirmingDelete && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12.5, color: COLORS.inkSoft }}>{t.deleteTaskConfirm}</span>
            <Btn variant="danger" onClick={() => actions.deleteTask(task.id)} style={{ padding: "6px 12px", fontSize: 13 }}>{t.deleteConfirmYes}</Btn>
            <Btn variant="ghost" onClick={() => setConfirmingDelete(false)} style={{ padding: "6px 12px", fontSize: 13 }}>{t.cancel}</Btn>
          </div>
        )}
      </div>

      <div style={{ background: COLORS.card, border: `1.5px solid ${COLORS.border}`, borderRadius: 16, overflow: "hidden" }}>
        {task.photos && task.photos.length > 0 ? (
          <div style={{ display: "flex", gap: 2 }}>
            {task.photos.map((p, i) => <img key={i} src={p} alt="" style={{ flex: 1, height: 200, objectFit: "cover" }} />)}
          </div>
        ) : (
          <div style={{ height: 130, background: COLORS.forestPale, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <cat.Icon size={40} color={COLORS.forest} />
          </div>
        )}

        <div style={{ padding: 22 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            <Badge tone={{ open: "forest", negotiating: "gold", accepted: "gold", inProgress: "gold", completed: "neutral" }[task.status]}>{t[task.status]}</Badge>
            <Badge tone="neutral"><MapPin size={11} />{cityLabel(task.city, lang)}{task.location ? ` · ${task.location}` : ""}</Badge>
            <Badge tone="neutral"><cat.Icon size={11} />{cat[lang]}</Badge>
          </div>

          <h2 style={{ fontFamily: "'Markazi Text', serif", fontSize: 28, color: COLORS.ink, margin: "0 0 8px", fontWeight: 700 }}>{translated ? translated.title : task.title}</h2>
          <p style={{ fontSize: 14.5, color: COLORS.inkSoft, lineHeight: 1.7, marginBottom: 8 }}>{translated ? translated.description : task.description}</p>
          <div style={{ marginBottom: 16 }}>
            <Btn variant="ghost" onClick={runTranslate} disabled={translating} style={{ padding: "4px 6px", fontSize: 12.5 }}>
              <Globe size={13} />{translating ? t.translating : translated ? t.showOriginal : t.translateTask}
            </Btn>
            {translateError && <span style={{ fontSize: 12, color: COLORS.danger, marginInlineStart: 8 }}>{translateError}</span>}
          </div>

          {(task.lat && task.lng) && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.inkSoft, marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
                <MapPin size={13} /> {t.viewOnMap}
              </div>
              <LeafletMap lat={task.lat} lng={task.lng} label={t.mapUnavailable} height={200} />
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: COLORS.forestPale, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: COLORS.forest, fontSize: 14 }}>
              {requester?.fullName?.[0]}
            </div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: COLORS.ink }}>{t.postedBy} {requester?.fullName}</div>
              <div style={{ fontSize: 12, color: COLORS.inkSoft, display: "flex", alignItems: "center", gap: 5 }}>
                <Stars value={avgRating(requester)} /> {avgRating(requester) ? avgRating(requester).toFixed(1) : t.noRatings}
              </div>
            </div>
          </div>

          <div style={{ background: COLORS.stone, borderRadius: 12, padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 12, color: COLORS.inkSoft }}>{t.askingPrice}</div>
              <div style={{ fontWeight: 700, fontSize: 22, color: COLORS.forest }}>{fmtSAR(task.price, lang)}</div>
            </div>
            {task.status === "open" && !isOwner && (
              <div style={{ fontSize: 12, color: COLORS.inkSoft, textAlign: dir === "rtl" ? "left" : "right" }}>
                {t.serviceFee}: {fmtSAR(Math.round(task.price * SERVICE_FEE_RATE), lang)}
              </div>
            )}
          </div>

          {/* Guest / not-logged-in viewer */}
          {!currentUser && <div style={{ fontSize: 13, color: COLORS.inkSoft }}>{t.needAccount} <Btn variant="ghost" onClick={() => setView("register")} style={{ padding: "2px 6px" }}>{t.register}</Btn></div>}

          {/* Tasker view: not owner, task open/negotiating, no bid yet */}
          {currentUser && !isOwner && ["open", "negotiating"].includes(task.status) && !myBid && (
            <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 18 }}>
              <div style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 10, color: COLORS.ink }}>{t.makeOffer}</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Btn variant="gold" onClick={() => actions.placeBid(task.id, currentUser.id, task.price)}>
                  <Check size={15} /> {t.acceptAsking} ({fmtSAR(task.price, lang)})
                </Btn>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <Input type="number" min="1" value={offerAmount} onChange={(e) => setOfferAmount(e.target.value)} placeholder={t.yourOffer} style={{ maxWidth: 200 }} />
                <Btn variant="outline" onClick={() => { if (offerAmount) { actions.placeBid(task.id, currentUser.id, Number(offerAmount)); setOfferAmount(""); } }}>{t.submitOffer}</Btn>
              </div>
            </div>
          )}

          {currentUser && !isOwner && myBid && task.status !== "completed" && (
            <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 18, fontSize: 13.5, color: COLORS.inkSoft }}>
              {lang === "ar" ? `عرضك: ${fmtSAR(myBid.amount, lang)} — ${myBid.status === "pending" ? "بانتظار الرد" : myBid.status === "accepted" ? "تم القبول" : "تم الرفض"}` : `Your offer: ${fmtSAR(myBid.amount, lang)} — ${myBid.status === "pending" ? "awaiting response" : myBid.status === "accepted" ? "accepted" : "declined"}`}
            </div>
          )}

          {/* Owner view: manage bids */}
          {isOwner && ["open", "negotiating"].includes(task.status) && (
            <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 18 }}>
              <div style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 10, color: COLORS.ink }}>{t.offersReceived} ({task.bids.length})</div>
              {task.bids.length === 0 && <div style={{ fontSize: 13.5, color: COLORS.inkSoft }}>{t.noOffersYet}</div>}
              {task.bids.map((b) => {
                const tasker = users.find((u) => u.id === b.taskerId);
                return (
                  <div key={b.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderTop: `1px solid ${COLORS.border}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: "50%", background: COLORS.forestPale, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: COLORS.forest, fontSize: 13 }}>{tasker?.fullName?.[0]}</div>
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 600 }}>{tasker?.fullName}</div>
                        <div style={{ fontSize: 11.5, color: COLORS.inkSoft, display: "flex", alignItems: "center", gap: 4 }}><Stars value={avgRating(tasker)} size={11} /></div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ fontWeight: 700, color: COLORS.forest }}>{fmtSAR(b.amount, lang)}</div>
                      {b.status === "pending" ? (
                        <>
                          <Btn variant="primary" onClick={() => actions.acceptBid(task.id, b.id)} style={{ padding: "6px 10px", fontSize: 12.5 }}><Check size={13} />{t.accept}</Btn>
                          <Btn variant="danger" onClick={() => actions.rejectBid(task.id, b.id)} style={{ padding: "6px 10px", fontSize: 12.5 }}><X size={13} />{t.reject}</Btn>
                        </>
                      ) : (
                        <Badge tone={b.status === "accepted" ? "forest" : "danger"}>{b.status === "accepted" ? t.accept : t.reject}</Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Accepted, awaiting payment */}
          {task.status === "accepted" && (
            <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 18 }}>
              <div style={{ fontSize: 13.5, color: COLORS.inkSoft, marginBottom: 10 }}>
                {t.acceptedOfferFrom} {taskerOfAccepted?.fullName} — {fmtSAR(acceptedBid.amount, lang)}
              </div>
              {isOwner && <Btn variant="primary" onClick={() => setShowPay(true)}><Wallet size={15} />{t.payNow}</Btn>}
              {!isOwner && <Badge tone="gold"><Clock size={12} />{t.inProgress}</Badge>}
            </div>
          )}

          {/* In progress */}
          {task.status === "inProgress" && (
            <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 18 }}>
              <Badge tone="gold"><Clock size={12} />{t.paymentSuccess}</Badge>
              {isOwner && <div style={{ marginTop: 12 }}><Btn variant="primary" onClick={() => actions.completeTask(task.id)}><CheckCircle2 size={15} />{t.markComplete}</Btn></div>}
            </div>
          )}

          {/* Completed */}
          {task.status === "completed" && (
            <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 18 }}>
              <Badge tone="neutral"><CheckCircle2 size={12} />{t.markedComplete}</Badge>
              {canRate && (
                <div style={{ marginTop: 12 }}>
                  <Btn variant="gold" onClick={() => setRateFor(currentUser.id === task.requesterId ? "tasker" : "requester")}>
                    <Star size={14} />{t.rateExperience}
                  </Btn>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showPay && (
        <PaymentModal t={t} lang={lang} task={{ price: acceptedBid.amount }} onClose={() => setShowPay(false)}
          onConfirm={(method) => { actions.payTask(task.id, method); setShowPay(false); }} />
      )}

      {rateFor && (
        <RatingModal t={t} dir={dir} title={rateFor === "tasker" ? t.ratingModalTaskerTitle : t.ratingModalReqTitle}
          onClose={() => setRateFor(null)}
          onSubmit={(stars, comment) => {
            const targetId = rateFor === "tasker" ? acceptedBid.taskerId : task.requesterId;
            actions.rateUser(task.id, currentUser.id, targetId, stars, comment);
            setRateFor(null);
          }} />
      )}
    </div>
  );
}

/* ============================== PROFILE ============================== */
function Profile({ t, lang, dir, currentUser, tasks, users, setView, openTask }) {
  const myTasks = tasks.filter((tk) => tk.requesterId === currentUser.id);
  const myOffers = tasks.filter((tk) => tk.bids.some((b) => b.taskerId === currentUser.id));
  const rating = avgRating(currentUser);

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "28px 20px 60px" }}>
      <div style={{ background: COLORS.card, border: `1.5px solid ${COLORS.border}`, borderRadius: 16, padding: 22, display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <div style={{ width: 60, height: 60, borderRadius: "50%", background: COLORS.forest, display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.goldLight, fontWeight: 700, fontSize: 22 }}>
          {currentUser.fullName[0]}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontWeight: 700, fontSize: 18, color: COLORS.ink }}>{currentUser.fullName}</div>
            {currentUser.isAdmin && <Badge tone="gold">{t.adminBadge}</Badge>}
          </div>
          <div style={{ fontSize: 13, color: COLORS.inkSoft }}>@{currentUser.username} · {cityLabel(currentUser.city, lang)}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
            <Stars value={rating} />
            <span style={{ fontSize: 12.5, color: COLORS.inkSoft }}>{rating ? `${rating.toFixed(1)} (${currentUser.ratings.length} ${t.ratingsCount})` : t.noRatings}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, fontSize: 12.5, color: COLORS.forest, fontWeight: 600 }}>
            <BadgeCheck size={13} /> {currentUser.verified ? t.verified : t.notVerified}
          </div>
        </div>
      </div>

      <h3 style={{ fontFamily: "'Markazi Text', serif", fontSize: 22, color: COLORS.ink, marginBottom: 12, fontWeight: 700 }}>{t.yourTasks}</h3>
      {myTasks.length === 0 ? <p style={{ fontSize: 13.5, color: COLORS.inkSoft }}>{t.postedTasksEmpty}</p> : (
        <div style={{ display: "grid", gap: 10, marginBottom: 24 }}>
          {myTasks.map((tk) => (
            <div key={tk.id} onClick={() => openTask(tk.id)} style={{ cursor: "pointer", background: "#fff", border: `1.5px solid ${COLORS.border}`, borderRadius: 10, padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div><div style={{ fontWeight: 600, fontSize: 14 }}>{tk.title}</div><div style={{ fontSize: 12, color: COLORS.inkSoft }}>{cityLabel(tk.city, lang)}</div></div>
              <Badge tone={{ open: "forest", negotiating: "gold", accepted: "gold", inProgress: "gold", completed: "neutral" }[tk.status]}>{t[tk.status]}</Badge>
            </div>
          ))}
        </div>
      )}

      <h3 style={{ fontFamily: "'Markazi Text', serif", fontSize: 22, color: COLORS.ink, marginBottom: 12, fontWeight: 700 }}>{t.yourOffers}</h3>
      {myOffers.length === 0 ? <p style={{ fontSize: 13.5, color: COLORS.inkSoft }}>{t.offersEmpty}</p> : (
        <div style={{ display: "grid", gap: 10 }}>
          {myOffers.map((tk) => {
            const b = tk.bids.find((bb) => bb.taskerId === currentUser.id);
            return (
              <div key={tk.id} onClick={() => openTask(tk.id)} style={{ cursor: "pointer", background: "#fff", border: `1.5px solid ${COLORS.border}`, borderRadius: 10, padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div><div style={{ fontWeight: 600, fontSize: 14 }}>{tk.title}</div><div style={{ fontSize: 12, color: COLORS.inkSoft }}>{fmtSAR(b.amount, lang)}</div></div>
                <Badge tone={b.status === "accepted" ? "forest" : b.status === "rejected" ? "danger" : "neutral"}>{b.status === "accepted" ? t.accept : b.status === "rejected" ? t.reject : t.negotiating}</Badge>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ============================== ADMIN DASHBOARD ============================== */
function toCSV(rows) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const esc = (v) => {
    let s = String(v ?? "");
    // Neutralize formula injection: if a spreadsheet app opens this CSV, a leading
    // =, +, -, @, tab, or CR could be interpreted as a formula. Prefix with a
    // single quote in that case, same mitigation used by Google/Microsoft exports.
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return `"${s.replace(/"/g, '""')}"`;
  };
  return [headers.join(","), ...rows.map((r) => headers.map((h) => esc(r[h])).join(","))].join("\n");
}
function downloadCSV(filename, rows) {
  const csv = toCSV(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

function AdminDashboard({ t, lang, dir, tasks, users, onDeleteTask, onToggleSuspend }) {
  const [tab, setTab] = useState("overview");

  const completed = tasks.filter((tk) => tk.status === "completed");
  const revenue = completed.reduce((s, tk) => s + Math.round((tk.acceptedBidId ? tk.bids.find((b) => b.id === tk.acceptedBidId)?.amount || tk.price : tk.price) * SERVICE_FEE_RATE), 0);
  const gmv = completed.reduce((s, tk) => s + (tk.acceptedBidId ? tk.bids.find((b) => b.id === tk.acceptedBidId)?.amount || tk.price : tk.price), 0);
  const activeCount = tasks.filter((tk) => !["completed"].includes(tk.status)).length;

  const cityStats = CITIES.map((c) => {
    const cityTasks = tasks.filter((tk) => tk.city === c.id);
    const cityCompleted = cityTasks.filter((tk) => tk.status === "completed");
    const cityRevenue = cityCompleted.reduce((s, tk) => s + Math.round((tk.acceptedBidId ? tk.bids.find((b) => b.id === tk.acceptedBidId)?.amount || tk.price : tk.price) * SERVICE_FEE_RATE), 0);
    return { ...c, count: cityTasks.length, revenue: cityRevenue };
  }).filter((c) => c.count > 0).sort((a, b) => b.count - a.count);
  const maxCount = Math.max(1, ...cityStats.map((c) => c.count));

  const tabs = [
    { id: "overview", label: t.adminOverview, Icon: PieChart },
    { id: "cities", label: t.adminCities, Icon: MapPin },
    { id: "users", label: t.adminUsers, Icon: Users },
    { id: "tasks", label: t.adminTasks, Icon: ListChecks },
    { id: "export", label: t.adminExport, Icon: Download },
  ];

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "28px 20px 60px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <Shield size={22} color={COLORS.forest} />
        <h2 style={{ fontFamily: "'Markazi Text', serif", fontSize: 28, color: COLORS.ink, margin: 0, fontWeight: 700 }}>{t.admin}</h2>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 22, flexWrap: "wrap" }}>
        {tabs.map((tb) => (
          <Btn key={tb.id} variant={tab === tb.id ? "primary" : "card"} onClick={() => setTab(tb.id)} style={{ padding: "9px 14px" }}>
            <tb.Icon size={15} />{tb.label}
          </Btn>
        ))}
      </div>

      {tab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: 14 }}>
          {[
            [t.totalUsers, users.length, Users],
            [t.totalTasks, tasks.length, ListChecks],
            [t.activeTasks, activeCount, Clock],
            [t.completedTasks, completed.length, CheckCircle2],
            [t.totalGMV, fmtSAR(gmv, lang), TrendingUp],
            [t.totalRevenue, fmtSAR(revenue, lang), Wallet],
          ].map(([label, val, Icon], i) => (
            <div key={i} style={{ background: COLORS.card, border: `1.5px solid ${COLORS.border}`, borderRadius: 14, padding: 18 }}>
              <Icon size={18} color={COLORS.gold} style={{ marginBottom: 10 }} />
              <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.ink }}>{val}</div>
              <div style={{ fontSize: 12.5, color: COLORS.inkSoft, marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {tab === "cities" && (
        <div style={{ background: COLORS.card, border: `1.5px solid ${COLORS.border}`, borderRadius: 14, padding: 20 }}>
          <div style={{ fontWeight: 700, marginBottom: 14 }}>{t.revenueByCity}</div>
          {cityStats.map((c) => (
            <div key={c.id} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                <span style={{ fontWeight: 600 }}>{c[lang]}</span>
                <span style={{ color: COLORS.inkSoft }}>{c.count} {t.totalTasks.toLowerCase()} · {fmtSAR(c.revenue, lang)}</span>
              </div>
              <div style={{ height: 8, background: COLORS.stoneDeep, borderRadius: 6, overflow: "hidden" }}>
                <div style={{ width: `${(c.count / maxCount) * 100}%`, height: "100%", background: `linear-gradient(90deg, ${COLORS.forest}, ${COLORS.gold})` }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "users" && (
        <div style={{ background: COLORS.card, border: `1.5px solid ${COLORS.border}`, borderRadius: 14, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
            <thead>
              <tr style={{ background: COLORS.stone, textAlign: dir === "rtl" ? "right" : "left" }}>
                {[t.username, t.phone, t.email, t.city, t.verified, "★", ""].map((h, i) => <th key={i} style={{ padding: "10px 14px", fontWeight: 700, color: COLORS.inkSoft }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderTop: `1px solid ${COLORS.border}`, opacity: u.suspended ? 0.55 : 1 }}>
                  <td style={{ padding: "10px 14px", fontWeight: 600 }}>
                    {u.fullName} {u.isAdmin && <Badge tone="gold">Admin</Badge>} {u.suspended && <Badge tone="danger">{t.suspended}</Badge>}
                  </td>
                  <td style={{ padding: "10px 14px", color: COLORS.inkSoft }}>{u.phone}</td>
                  <td style={{ padding: "10px 14px", color: COLORS.inkSoft }}>{u.email}</td>
                  <td style={{ padding: "10px 14px", color: COLORS.inkSoft }}>{cityLabel(u.city, lang)}</td>
                  <td style={{ padding: "10px 14px" }}>{u.verified ? <BadgeCheck size={15} color={COLORS.forest} /> : <Ban size={15} color={COLORS.danger} />}</td>
                  <td style={{ padding: "10px 14px" }}>{avgRating(u) ? avgRating(u).toFixed(1) : "—"}</td>
                  <td style={{ padding: "10px 14px" }}>
                    {!u.isAdmin && (
                      <Btn variant={u.suspended ? "outline" : "danger"} onClick={() => onToggleSuspend(u.id)} style={{ padding: "5px 9px", fontSize: 12 }}>
                        <Ban size={12} />{u.suspended ? t.unsuspend : t.suspend}
                      </Btn>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "tasks" && (
        <div style={{ background: COLORS.card, border: `1.5px solid ${COLORS.border}`, borderRadius: 14, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
            <thead>
              <tr style={{ background: COLORS.stone, textAlign: dir === "rtl" ? "right" : "left" }}>
                {[t.taskTitle, t.city, t.askingPrice, t.offers, "Status", ""].map((h, i) => <th key={i} style={{ padding: "10px 14px", fontWeight: 700, color: COLORS.inkSoft }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {tasks.map((tk) => (
                <tr key={tk.id} style={{ borderTop: `1px solid ${COLORS.border}` }}>
                  <td style={{ padding: "10px 14px", fontWeight: 600 }}>{tk.title}</td>
                  <td style={{ padding: "10px 14px", color: COLORS.inkSoft }}>{cityLabel(tk.city, lang)}</td>
                  <td style={{ padding: "10px 14px", color: COLORS.inkSoft }}>{fmtSAR(tk.price, lang)}</td>
                  <td style={{ padding: "10px 14px", color: COLORS.inkSoft }}>{tk.bids.length}</td>
                  <td style={{ padding: "10px 14px" }}><Badge tone={{ open: "forest", negotiating: "gold", accepted: "gold", inProgress: "gold", completed: "neutral" }[tk.status]}>{t[tk.status]}</Badge></td>
                  <td style={{ padding: "10px 14px" }}>
                    <Btn variant="danger" onClick={() => onDeleteTask(tk.id)} style={{ padding: "5px 9px", fontSize: 12 }}><X size={12} />{t.deleteTask}</Btn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "export" && (
        <div style={{ background: COLORS.card, border: `1.5px solid ${COLORS.border}`, borderRadius: 14, padding: 22 }}>
          <p style={{ fontSize: 13.5, color: COLORS.inkSoft, lineHeight: 1.6, marginBottom: 18 }}>{t.exportNote}</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Btn variant="primary" onClick={() => downloadCSV("taskers_users.csv", users.map((u) => ({ id: u.id, username: u.username, fullName: u.fullName, phone: u.phone, email: u.email, city: u.city, verified: u.verified, isAdmin: u.isAdmin, rating: avgRating(u) || "", createdAt: u.createdAt })))}>
              <Download size={15} />{t.exportUsers}
            </Btn>
            <Btn variant="primary" onClick={() => downloadCSV("taskers_tasks.csv", tasks.map((tk) => ({ id: tk.id, title: tk.title, city: tk.city, category: tk.category, price: tk.price, status: tk.status, bids: tk.bids.length, requesterId: tk.requesterId, createdAt: tk.createdAt })))}>
              <Download size={15} />{t.exportTasks}
            </Btn>
            <Btn variant="gold" onClick={() => downloadCSV("taskers_full_export.csv", tasks.map((tk) => ({ taskId: tk.id, title: tk.title, city: tk.city, price: tk.price, status: tk.status, serviceFee: Math.round(tk.price * SERVICE_FEE_RATE), requester: users.find((u) => u.id === tk.requesterId)?.username })))}>
              <Download size={15} />{t.exportAll}
            </Btn>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================== PRIVACY POLICY ============================== */
function PrivacyPolicy({ t, lang, dir, setView }) {
  const en = (
    <>
      <p><strong>Last updated:</strong> July 2026</p>
      <p>Taskers ("we", "the platform") operates a marketplace connecting people who need tasks done ("Requesters") with people who perform them ("Taskers") within the Kingdom of Saudi Arabia. This policy explains how we collect, use, share and protect personal data in accordance with the Saudi Personal Data Protection Law (PDPL, issued under Royal Decree M/19/1443) and its implementing regulations issued by the Saudi Data & AI Authority (SDAIA).</p>

      <h4>1. Who is responsible for your data</h4>
      <p>The platform administrator acts as the data controller and is responsible for determining the purposes and means of processing personal data collected through the app and website.</p>

      <h4>2. Data we collect</h4>
      <ul>
        <li>Account data: full name, username, phone number, email address, city.</li>
        <li>Authentication data: your email and a securely hashed password (we never store your password in plain text), handled by our authentication provider.</li>
        <li>Task data: task titles, descriptions, prices, categories, photos you upload, and any location or address you choose to provide.</li>
        <li>Transaction data: task prices, offers, accepted amounts, service fees, and payment method selected (payment card and bank details are processed by our licensed payment partners and are not stored on our servers).</li>
        <li>Rating and review data submitted about and by you.</li>
        <li>Technical data: device, log and usage information collected automatically when you use the app.</li>
      </ul>

      <h4>3. Why we process your data</h4>
      <p>To operate the marketplace (matching requesters and taskers), verify identity and prevent fraud, process payments and calculate the platform's 30% service fee, distribute tasks to relevant users by city, enable ratings between users, provide customer support, comply with legal and regulatory obligations, and improve the service.</p>

      <h4>4. Legal basis for processing</h4>
      <p>We process personal data based on your consent, the necessity of processing to perform our contract with you, and our legitimate interest in operating a safe and functioning marketplace, in line with the PDPL.</p>

      <h4>5. Account authentication</h4>
      <p>Registration requires creating an account with an email and password. Your credentials are processed by our authentication provider and are never stored by the platform in plain text. We may introduce additional verification steps (such as phone or document verification) in the future, and will update this policy if we do.</p>

      <h4>6. Sharing your data</h4>
      <p>We share data with: other users to the extent necessary to complete a task (e.g., a tasker sees the requester's task details and city; a requester sees a bidding tasker's name and rating); our authentication and database provider (Supabase), which stores account and task data on our behalf; our hosting provider (Vercel), which serves the platform; licensed payment service providers to process payments in Saudi Riyal; and government or regulatory authorities where required by law. We do not sell personal data to third parties.</p>

      <h4>7. Administrator access to platform data</h4>
      <p>As the platform administrator, we may access, review, export and analyze data collected through the platform — including user records, task records, ratings, and transaction and revenue data — for the purposes of operating the business, accounting, fraud prevention, dispute resolution, regulatory compliance and service improvement. This access is limited to what is necessary for these purposes.</p>

      <h4>8. Cross-border data transfer</h4>
      <p>Personal data is primarily processed within Saudi Arabia. Any transfer of personal data outside the Kingdom will only take place in accordance with the requirements of the PDPL and SDAIA regulations, including ensuring an adequate level of protection or applying appropriate safeguards.</p>

      <h4>9. Data retention</h4>
      <p>We retain personal data only for as long as necessary to fulfill the purposes described in this policy, or as required by applicable Saudi law (including tax and financial record-keeping obligations), after which it is securely deleted or anonymized.</p>

      <h4>10. Your rights</h4>
      <p>Subject to the PDPL, you have the right to: know the legal basis for processing your data, access your personal data, request correction of inaccurate data, request deletion of your data, withdraw consent at any time, and object to certain processing. To exercise these rights, contact us using the details below.</p>

      <h4>11. Security</h4>
      <p>We apply technical and organizational measures designed to protect personal data against unauthorized access, loss, misuse or disclosure, consistent with SDAIA's data security controls.</p>

      <h4>12. Children</h4>
      <p>Taskers is intended for users who are at least 18 years old. We do not knowingly collect data from minors.</p>

      <h4>13. Changes to this policy</h4>
      <p>We may update this policy from time to time. Material changes will be communicated through the app.</p>

      <h4>14. Contact & governing law</h4>
      <p>This policy is governed by the laws of the Kingdom of Saudi Arabia. For privacy inquiries or to exercise your rights, contact the platform administrator at privacy@taskers.sa.</p>
    </>
  );

  const ar = (
    <>
      <p><strong>آخر تحديث:</strong> يوليو 2026</p>
      <p>تُشغّل منصة "تاسكرز" ("نحن"، "المنصة") سوقًا إلكترونيًا يربط بين الأشخاص الراغبين في إنجاز مهام ("أصحاب المهام") ومن ينفذونها ("منفذو المهام") داخل المملكة العربية السعودية. توضح هذه السياسة كيفية جمعنا واستخدامنا ومشاركتنا وحمايتنا للبيانات الشخصية وفقًا لنظام حماية البيانات الشخصية الصادر بموجب المرسوم الملكي رقم م/19/1443، ولوائحه التنفيذية الصادرة عن الهيئة السعودية للبيانات والذكاء الاصطناعي (سدايا).</p>

      <h4>1. المسؤول عن بياناتك</h4>
      <p>يُعد مدير المنصة "المتحكم في البيانات"، وهو المسؤول عن تحديد أغراض ووسائل معالجة البيانات الشخصية التي يتم جمعها عبر التطبيق والموقع.</p>

      <h4>2. البيانات التي نجمعها</h4>
      <ul>
        <li>بيانات الحساب: الاسم الكامل، اسم المستخدم، رقم الجوال، البريد الإلكتروني، المدينة.</li>
        <li>بيانات المصادقة: بريدك الإلكتروني وكلمة مرور مشفّرة بشكل آمن (لا نخزّن كلمة المرور كنص صريح أبدًا)، تتم معالجتها عبر مزوّد خدمة المصادقة الخاص بنا.</li>
        <li>بيانات المهام: عناوين المهام، الأوصاف، الأسعار، التصنيفات، الصور التي ترفعها، وأي موقع أو عنوان تختار تقديمه.</li>
        <li>بيانات المعاملات: أسعار المهام، العروض، المبالغ المقبولة، رسوم الخدمة، ووسيلة الدفع المختارة (تتم معالجة بيانات البطاقات والحسابات البنكية من قبل شركاء الدفع المرخصين ولا يتم تخزينها على خوادمنا).</li>
        <li>بيانات التقييمات والمراجعات المقدَّمة عنك ومنك.</li>
        <li>بيانات تقنية: معلومات الجهاز والسجلات والاستخدام التي تُجمع تلقائيًا عند استخدامك للتطبيق.</li>
      </ul>

      <h4>3. أغراض معالجة بياناتك</h4>
      <p>لتشغيل السوق الإلكتروني (مطابقة أصحاب المهام مع منفذيها)، والتحقق من الهوية ومنع الاحتيال، ومعالجة المدفوعات واحتساب رسوم الخدمة البالغة 30%، وتوزيع المهام على المستخدمين المعنيين حسب المدينة، وتمكين التقييمات بين المستخدمين، وتقديم الدعم، والامتثال للالتزامات النظامية، وتحسين الخدمة.</p>

      <h4>4. الأساس النظامي للمعالجة</h4>
      <p>نعالج البيانات الشخصية استنادًا إلى موافقتك، وضرورة المعالجة لتنفيذ العقد معك، ومصلحتنا المشروعة في تشغيل سوق آمن وفعّال، بما يتوافق مع نظام حماية البيانات الشخصية.</p>

      <h4>5. مصادقة الحساب</h4>
      <p>يتطلب التسجيل إنشاء حساب ببريد إلكتروني وكلمة مرور. تتم معالجة بيانات الدخول الخاصة بك عبر مزوّد خدمة المصادقة، ولا يتم تخزينها كنص صريح على الإطلاق. قد نضيف خطوات تحقق إضافية مستقبلاً (مثل التحقق عبر الجوال أو المستندات)، وسنحدّث هذه السياسة عند حدوث ذلك.</p>

      <h4>6. مشاركة بياناتك</h4>
      <p>نشارك البيانات مع: مستخدمين آخرين بالقدر اللازم لإنجاز المهمة (مثل اطّلاع منفذ المهمة على تفاصيل المهمة ومدينتها، واطّلاع صاحب المهمة على اسم وتقييم منفذ المهمة المتقدم بعرض)؛ ومزوّد خدمة المصادقة وقاعدة البيانات (Supabase) الذي يخزّن بيانات الحسابات والمهام نيابة عنا؛ ومزوّد الاستضافة (Vercel) الذي يشغّل المنصة؛ ومزودي خدمات الدفع المرخصين لمعالجة المدفوعات بالريال السعودي؛ والجهات الحكومية أو الرقابية عند اقتضاء النظام ذلك. لا نبيع البيانات الشخصية لأطراف ثالثة.</p>

      <h4>7. اطّلاع الإدارة على بيانات المنصة</h4>
      <p>بصفتنا مدير المنصة، يجوز لنا الاطّلاع على البيانات التي تُجمع عبر المنصة ومراجعتها وتصديرها وتحليلها — بما في ذلك سجلات المستخدمين والمهام والتقييمات وبيانات المعاملات والإيرادات — لأغراض تشغيل النشاط والمحاسبة ومنع الاحتيال وتسوية النزاعات والامتثال النظامي وتحسين الخدمة. يقتصر هذا الاطّلاع على ما هو ضروري لتحقيق هذه الأغراض.</p>

      <h4>8. نقل البيانات خارج المملكة</h4>
      <p>تتم معالجة البيانات الشخصية بشكل أساسي داخل المملكة العربية السعودية. لن يتم نقل أي بيانات شخصية خارج المملكة إلا وفقًا لمتطلبات نظام حماية البيانات الشخصية ولوائح سدايا، بما يشمل ضمان مستوى ملائم من الحماية أو تطبيق الضمانات المناسبة.</p>

      <h4>9. مدة الاحتفاظ بالبيانات</h4>
      <p>نحتفظ بالبيانات الشخصية فقط للمدة اللازمة لتحقيق الأغراض الموضحة في هذه السياسة، أو حسب ما يقتضيه النظام السعودي المعمول به (بما في ذلك الالتزامات الضريبية والمحاسبية)، وبعدها يتم حذفها أو إخفاء هويتها بشكل آمن.</p>

      <h4>10. حقوقك</h4>
      <p>وفقًا لنظام حماية البيانات الشخصية، يحق لك: معرفة الأساس النظامي لمعالجة بياناتك، والوصول إلى بياناتك الشخصية، وطلب تصحيح البيانات غير الدقيقة، وطلب حذف بياناتك، وسحب موافقتك في أي وقت، والاعتراض على بعض عمليات المعالجة. لممارسة هذه الحقوق، تواصل معنا عبر بيانات التواصل أدناه.</p>

      <h4>11. أمن المعلومات</h4>
      <p>نطبق تدابير تقنية وتنظيمية مصممة لحماية البيانات الشخصية من الوصول غير المصرح به أو الفقدان أو سوء الاستخدام أو الإفصاح، بما يتوافق مع ضوابط أمن البيانات الصادرة عن سدايا.</p>

      <h4>12. الأطفال</h4>
      <p>مخصصة تاسكرز للمستخدمين البالغين 18 عامًا فأكثر. لا نجمع عن قصد بيانات من القُصّر.</p>

      <h4>13. التعديلات على هذه السياسة</h4>
      <p>قد نُحدّث هذه السياسة من وقت لآخر. سيتم إبلاغك بأي تغييرات جوهرية عبر التطبيق.</p>

      <h4>14. التواصل والنظام الحاكم</h4>
      <p>تخضع هذه السياسة لأنظمة المملكة العربية السعودية. للاستفسارات المتعلقة بالخصوصية أو لممارسة حقوقك، تواصل مع إدارة المنصة عبر privacy@taskers.sa.</p>
    </>
  );

  const ur = (
    <>
      <p><strong>آخری تجدید:</strong> جولائی 2026</p>
      <p>ٹاسکرز ("ہم"، "پلیٹ فارم") سعودی عرب کی سرزمین پر کام کروانے والوں ("درخواست دہندگان") کو کام کرنے والوں ("ورکرز") سے جوڑنے والا ایک مارکیٹ پلیس چلاتا ہے۔ یہ پالیسی بتاتی ہے کہ ہم ذاتی ڈیٹا کو سعودی پرسنل ڈیٹا پروٹیکشن لاء (PDPL) اور سعودی ڈیٹا اینڈ اے آئی اتھارٹی (SDAIA) کے قواعد کے مطابق کیسے اکٹھا، استعمال، شیئر اور محفوظ کرتے ہیں۔</p>

      <h4>1. آپ کے ڈیٹا کا ذمہ دار کون ہے</h4>
      <p>پلیٹ فارم ایڈمنسٹریٹر "ڈیٹا کنٹرولر" کے طور پر کام کرتا ہے اور ایپ اور ویب سائٹ کے ذریعے اکٹھے کیے گئے ذاتی ڈیٹا کی پروسیسنگ کے مقاصد اور طریقے طے کرنے کا ذمہ دار ہے۔</p>

      <h4>2. ہم کون سا ڈیٹا اکٹھا کرتے ہیں</h4>
      <ul>
        <li>اکاؤنٹ ڈیٹا: پورا نام، یوزر نیم، فون نمبر، ای میل، شہر۔</li>
        <li>تصدیقی ڈیٹا: آپ کا ای میل اور محفوظ طریقے سے ہیش شدہ پاسورڈ (ہم پاسورڈ کبھی سادہ متن میں محفوظ نہیں کرتے)، ہمارے تصدیقی سروس فراہم کنندہ کے ذریعے پروسیس کیا جاتا ہے۔</li>
        <li>کام کا ڈیٹا: کام کے عنوانات، تفصیلات، قیمتیں، زمرے، آپ کی اپلوڈ کردہ تصاویر، اور کوئی بھی مقام یا پتہ جو آپ فراہم کریں۔</li>
        <li>ٹرانزیکشن ڈیٹا: کام کی قیمتیں، پیشکشیں، منظور شدہ رقمیں، سروس فیس، اور منتخب کردہ ادائیگی کا طریقہ (کارڈ اور بینک تفصیلات ہمارے لائسنس یافتہ ادائیگی شراکت داروں کے ذریعے پروسیس ہوتی ہیں اور ہمارے سرورز پر محفوظ نہیں کی جاتیں)۔</li>
        <li>آپ کے بارے میں اور آپ کی جانب سے دی گئی درجہ بندیاں اور تبصرے۔</li>
        <li>تکنیکی ڈیٹا: ڈیوائس، لاگ اور استعمال کی معلومات جو ایپ استعمال کرتے وقت خودکار طور پر اکٹھی ہوتی ہیں۔</li>
      </ul>

      <h4>3. ہم آپ کا ڈیٹا کیوں پروسیس کرتے ہیں</h4>
      <p>مارکیٹ پلیس چلانے (درخواست دہندگان اور ورکرز کو ملانے)، شناخت کی تصدیق اور دھوکہ دہی سے بچاؤ، ادائیگیوں کی پروسیسنگ اور پلیٹ فارم کی 30% سروس فیس کا حساب لگانے، شہر کے لحاظ سے متعلقہ صارفین کو کام تقسیم کرنے، صارفین کے درمیان درجہ بندی ممکن بنانے، کسٹمر سپورٹ فراہم کرنے، قانونی اور ریگولیٹری تقاضوں کی تعمیل کرنے، اور سروس کو بہتر بنانے کے لیے۔</p>

      <h4>4. پروسیسنگ کی قانونی بنیاد</h4>
      <p>ہم ذاتی ڈیٹا کو آپ کی رضامندی، آپ کے ساتھ ہمارے معاہدے کی تعمیل کی ضرورت، اور ایک محفوظ اور فعال مارکیٹ پلیس چلانے میں ہمارے جائز مفاد کی بنیاد پر پروسیس کرتے ہیں، جو PDPL کے مطابق ہے۔</p>

      <h4>5. اکاؤنٹ کی تصدیق</h4>
      <p>رجسٹریشن کے لیے ای میل اور پاسورڈ کے ساتھ اکاؤنٹ بنانا ضروری ہے۔ آپ کی لاگ اِن معلومات ہمارے تصدیقی سروس فراہم کنندہ کے ذریعے پروسیس کی جاتی ہیں اور کبھی سادہ متن میں محفوظ نہیں کی جاتیں۔ ہم مستقبل میں اضافی تصدیقی مراحل (جیسے فون یا دستاویز کی تصدیق) متعارف کروا سکتے ہیں، اور ایسا کرنے پر اس پالیسی کو اپ ڈیٹ کریں گے۔</p>

      <h4>6. آپ کا ڈیٹا شیئر کرنا</h4>
      <p>ہم ڈیٹا شیئر کرتے ہیں: دیگر صارفین کے ساتھ کام مکمل کرنے کے لیے ضروری حد تک (مثلاً، ایک ورکر درخواست دہندہ کے کام کی تفصیلات اور شہر دیکھتا ہے؛ ایک درخواست دہندہ پیشکش دینے والے ورکر کا نام اور درجہ بندی دیکھتا ہے)؛ ہمارے تصدیقی اور ڈیٹا بیس فراہم کنندہ (Supabase) کے ساتھ جو ہماری جانب سے اکاؤنٹ اور کام کا ڈیٹا محفوظ کرتا ہے؛ ہمارے ہوسٹنگ فراہم کنندہ (Vercel) کے ساتھ جو پلیٹ فارم چلاتا ہے؛ لائسنس یافتہ ادائیگی سروس فراہم کنندگان کے ساتھ سعودی ریال میں ادائیگیاں پروسیس کرنے کے لیے؛ اور حکومتی یا ریگولیٹری اداروں کے ساتھ جہاں قانون کا تقاضا ہو۔ ہم ذاتی ڈیٹا تیسرے فریق کو فروخت نہیں کرتے۔</p>

      <h4>7. پلیٹ فارم ڈیٹا تک ایڈمن کی رسائی</h4>
      <p>پلیٹ فارم ایڈمنسٹریٹر کی حیثیت سے، ہم پلیٹ فارم کے ذریعے اکٹھے کیے گئے ڈیٹا تک رسائی حاصل کر سکتے ہیں، اس کا جائزہ لے سکتے ہیں، ایکسپورٹ کر سکتے ہیں اور تجزیہ کر سکتے ہیں — بشمول صارفین کے ریکارڈ، کام کے ریکارڈ، درجہ بندیاں، اور ٹرانزیکشن و آمدنی کا ڈیٹا — کاروبار چلانے، اکاؤنٹنگ، دھوکہ دہی سے بچاؤ، تنازعات کے حل، ریگولیٹری تعمیل، اور سروس کی بہتری کے مقاصد کے لیے۔ یہ رسائی صرف ان مقاصد کے لیے ضروری حد تک محدود ہے۔</p>

      <h4>8. سرحد پار ڈیٹا کی منتقلی</h4>
      <p>ذاتی ڈیٹا بنیادی طور پر سعودی عرب کے اندر پروسیس کیا جاتا ہے۔ سعودی عرب سے باہر ذاتی ڈیٹا کی کوئی بھی منتقلی صرف PDPL اور SDAIA کے ضوابط کے مطابق ہوگی، جس میں تحفظ کی مناسب سطح کو یقینی بنانا یا مناسب حفاظتی اقدامات کا اطلاق شامل ہے۔</p>

      <h4>9. ڈیٹا کو محفوظ رکھنے کی مدت</h4>
      <p>ہم ذاتی ڈیٹا کو صرف اس پالیسی میں بیان کردہ مقاصد کے حصول کے لیے ضروری وقت تک، یا لاگو سعودی قانون (بشمول ٹیکس اور مالیاتی ریکارڈ رکھنے کی ذمہ داریوں) کے تقاضے کے مطابق محفوظ رکھتے ہیں، جس کے بعد اسے محفوظ طریقے سے حذف یا گمنام کر دیا جاتا ہے۔</p>

      <h4>10. آپ کے حقوق</h4>
      <p>PDPL کے تحت، آپ کو یہ حق حاصل ہے: اپنے ڈیٹا کی پروسیسنگ کی قانونی بنیاد جاننا، اپنے ذاتی ڈیٹا تک رسائی حاصل کرنا، غلط ڈیٹا کی تصحیح کی درخواست کرنا، اپنا ڈیٹا حذف کرنے کی درخواست کرنا، کسی بھی وقت اپنی رضامندی واپس لینا، اور بعض پروسیسنگ پر اعتراض کرنا۔ ان حقوق کو استعمال کرنے کے لیے، نیچے دی گئی تفصیلات کے ذریعے ہم سے رابطہ کریں۔</p>

      <h4>11. سیکیورٹی</h4>
      <p>ہم SDAIA کے ڈیٹا سیکیورٹی کنٹرولز کے مطابق، ذاتی ڈیٹا کو غیر مجاز رسائی، نقصان، غلط استعمال یا افشا سے بچانے کے لیے تیار کردہ تکنیکی اور تنظیمی اقدامات لاگو کرتے ہیں۔</p>

      <h4>12. بچے</h4>
      <p>ٹاسکرز صرف 18 سال یا اس سے زیادہ عمر کے صارفین کے لیے ہے۔ ہم جان بوجھ کر نابالغوں کا ڈیٹا اکٹھا نہیں کرتے۔</p>

      <h4>13. اس پالیسی میں تبدیلیاں</h4>
      <p>ہم وقتاً فوقتاً اس پالیسی کو اپ ڈیٹ کر سکتے ہیں۔ کسی بھی اہم تبدیلی کے بارے میں ایپ کے ذریعے آپ کو مطلع کیا جائے گا۔</p>

      <h4>14. رابطہ اور حاکم قانون</h4>
      <p>یہ پالیسی مملکت سعودی عرب کے قوانین کے تابع ہے۔ پرائیویسی سے متعلق سوالات یا اپنے حقوق استعمال کرنے کے لیے، پلیٹ فارم ایڈمنسٹریٹر سے privacy@taskers.sa پر رابطہ کریں۔</p>
    </>
  );

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "36px 20px 70px" }}>
      <Btn variant="ghost" onClick={() => setView("home")} style={{ marginBottom: 14, padding: "6px 4px" }}>
        {dir === "rtl" ? <ArrowRight size={15} /> : <ArrowLeft size={15} />} {t.back}
      </Btn>
      <h2 style={{ fontFamily: "'Markazi Text', serif", fontSize: 30, color: COLORS.ink, marginBottom: 6, fontWeight: 700 }}>{t.privacyPolicy}</h2>
      <div style={{ fontSize: 14, color: COLORS.inkSoft, lineHeight: 1.8 }} className="policy-body">
        <style>{`.policy-body h4{color:${COLORS.forest};font-size:15.5px;margin:22px 0 6px;font-family:inherit;font-weight:700}.policy-body ul{padding-inline-start:20px;margin:8px 0}.policy-body li{margin-bottom:6px}`}</style>
        {lang === "ar" ? ar : lang === "ur" ? ur : en}
      </div>
    </div>
  );
}

/* ============================== ROOT APP ============================== */
export default function App() {
  const [lang, setLang] = useState("ar");
  const dir = lang === "en" ? "ltr" : "rtl";
  const t = T[lang];
  const [authLoading, setAuthLoading] = useState(true);

  const seeded = useMemo(() => seedData(), []);
  const [users, setUsers] = useState(seeded.users);
  const [tasks, setTasks] = useState(seeded.tasks);
  const [currentUser, setCurrentUser] = useState(null);
  const [view, setView] = useState("landing");
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  const [cityFilter, setCityFilter] = useState("all");
  const [catFilter, setCatFilter] = useState("all");
  const [search, setSearch] = useState("");

  const openTask = (id) => { setSelectedTaskId(id); setView("taskDetail"); };

  // Restore a real Supabase session on load, if one is configured and active.
  useEffect(() => {
    (async () => {
      if (hasSupabase()) {
        try {
          const { data } = await window.supabase.auth.getSession();
          if (data && data.session && data.session.user) {
            const profile = await authGetProfile(data.session.user.id);
            const restored = profileToUser(profile, data.session.user);
            setCurrentUser(restored);
            setCityFilter(restored.city);
            setUsers((prev) => (prev.some((u) => u.id === restored.id) ? prev : [...prev, restored]));
          }
        } catch (err) { /* no-op: fall back to logged-out state */ }
      }
      setAuthLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = async (loginInput) => {
    const { email, password } = loginInput;
    if (hasSupabase()) {
      const result = await authSignIn({ email, password });
      if (!result.ok) return { error: result.error ? t.invalidCredentials : t.authErrorGeneric };
      const profile = await authGetProfile(result.user.id);
      if (profile && profile.suspended) { await authSignOut(); return { error: t.accountSuspendedMsg }; }
      const restored = profileToUser(profile, result.user);
      setUsers((prev) => (prev.some((u) => u.id === restored.id) ? prev : [...prev, restored]));
      setCurrentUser(restored); setCityFilter(restored.city); setView("home");
      return { ok: true };
    }
    // Local fallback: match a demo/registered account by email.
    const match = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!match) return { error: t.invalidCredentials };
    if (match.suspended) return { error: t.accountSuspendedMsg };
    setCurrentUser(match); setCityFilter(match.city); setView("home");
    return { ok: true };
  };

  const handleRegister = async (form) => {
    if (hasSupabase()) {
      const result = await authSignUp(form);
      if (!result.ok) return { error: result.error && /already registered|exists/i.test(result.error) ? t.emailInUse : (result.error || t.authErrorGeneric) };
      const newUser = profileToUser(
        { email: form.email, full_name: form.fullName, username: form.username, phone: form.phone, city: form.city, is_admin: isAdminEmail(form.email) },
        result.user
      );
      setUsers((prev) => [...prev, newUser]);
      setCurrentUser(newUser); setCityFilter(newUser.city); setView("home");
      return { ok: true };
    }
    // Local fallback: create an in-memory account (no backend connected).
    if (users.some((u) => u.email.toLowerCase() === form.email.toLowerCase())) return { error: t.emailInUse };
    const newUser = {
      id: "u_" + uid(), username: form.username, fullName: form.fullName,
      phone: form.phone, email: form.email, city: form.city,
      verified: true, isAdmin: isAdminEmail(form.email), suspended: false,
      createdAt: new Date().toISOString().slice(0, 10), ratings: [],
    };
    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser); setCityFilter(newUser.city); setView("home");
    return { ok: true };
  };

  const handleLogout = () => { authSignOut(); setCurrentUser(null); setView("landing"); };

  const handleDeleteTask = (taskId) => {
    setTasks((prev) => prev.filter((tk) => tk.id !== taskId));
    if (selectedTaskId === taskId) { setSelectedTaskId(null); setView("home"); }
  };

  const handleToggleSuspend = async (userId) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;
    const nextSuspended = !target.suspended;
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, suspended: nextSuspended } : u)));
    if (hasSupabase()) {
      try { await window.supabase.from("profiles").update({ suspended: nextSuspended }).eq("id", userId); }
      catch (err) { /* local state already updated; DB write failure is non-fatal for this demo */ }
    }
  };

  const actions = {
    placeBid: (taskId, taskerId, amount) => {
      setTasks((prev) => prev.map((tk) => tk.id === taskId
        ? { ...tk, status: "negotiating", bids: [...tk.bids, { id: "b_" + uid(), taskerId, amount, status: "pending", createdAt: new Date().toISOString().slice(0, 10) }] }
        : tk));
    },
    acceptBid: (taskId, bidId) => {
      setTasks((prev) => prev.map((tk) => tk.id !== taskId ? tk : {
        ...tk, status: "accepted", acceptedBidId: bidId,
        bids: tk.bids.map((b) => ({ ...b, status: b.id === bidId ? "accepted" : "rejected" })),
      }));
    },
    rejectBid: (taskId, bidId) => {
      setTasks((prev) => prev.map((tk) => tk.id !== taskId ? tk : {
        ...tk, bids: tk.bids.map((b) => (b.id === bidId ? { ...b, status: "rejected" } : b)),
      }));
    },
    payTask: (taskId, method) => {
      setTasks((prev) => prev.map((tk) => tk.id === taskId ? { ...tk, status: "inProgress", paymentMethod: method } : tk));
    },
    completeTask: (taskId) => {
      setTasks((prev) => prev.map((tk) => tk.id === taskId ? { ...tk, status: "completed" } : tk));
    },
    rateUser: (taskId, fromId, targetId, stars, comment) => {
      setUsers((prev) => prev.map((u) => u.id === targetId ? { ...u, ratings: [...u.ratings, { stars, comment, from: fromId }] } : u));
      setTasks((prev) => prev.map((tk) => tk.id === taskId ? { ...tk, ratedBy: [...(tk.ratedBy || []), fromId] } : tk));
    },
    deleteTask: handleDeleteTask,
  };

  const selectedTask = tasks.find((tk) => tk.id === selectedTaskId);

  return (
    <div dir={dir} lang={lang} style={{
      fontFamily: lang === "ar" ? "'IBM Plex Sans Arabic', sans-serif" : lang === "ur" ? "'Noto Nastaliq Urdu', 'IBM Plex Sans Arabic', serif" : "'IBM Plex Sans', sans-serif",
      background: COLORS.stone, minHeight: "100vh", color: COLORS.ink,
    }}>
      <style>{FONT_IMPORT}</style>
      <style>{`
        * { -webkit-tap-highlight-color: transparent; }
        html { -webkit-text-size-adjust: 100%; text-size-adjust: 100%; }
        input, textarea, select, button { -webkit-appearance: none; appearance: none; font: inherit; }
        input[type="file"] { -webkit-appearance: none; }
        img { -webkit-user-drag: none; }
      `}</style>
      <AppHeader t={t} lang={lang} setLang={setLang} dir={dir} currentUser={currentUser} setView={setView} onLogout={handleLogout} />

      {view === "landing" && <Landing t={t} lang={lang} dir={dir} setView={setView} users={users} onLogin={handleLogin} onRegister={handleRegister} />}

      {(view === "register" || view === "login") && (
        <AuthScreen t={t} lang={lang} dir={dir} users={users} onLogin={handleLogin} onRegister={handleRegister} setView={setView} />
      )}

      {view === "home" && (
        <TaskFeed t={t} lang={lang} dir={dir} tasks={tasks} users={users} currentUser={currentUser} setView={setView}
          openTask={openTask} cityFilter={cityFilter} setCityFilter={setCityFilter} catFilter={catFilter} setCatFilter={setCatFilter}
          search={search} setSearch={setSearch} />
      )}

      {view === "postTask" && currentUser && (
        <PostTaskForm t={t} lang={lang} dir={dir} currentUser={currentUser}
          onCreate={(task) => { setTasks((prev) => [task, ...prev]); openTask(task.id); }} setView={setView} />
      )}
      {view === "postTask" && !currentUser && (
        <AuthScreen t={t} lang={lang} dir={dir} users={users} onLogin={handleLogin} onRegister={handleRegister} setView={setView} />
      )}

      {view === "taskDetail" && selectedTask && (
        <TaskDetail t={t} lang={lang} dir={dir} task={selectedTask} users={users} currentUser={currentUser} actions={actions} setView={setView} />
      )}

      {view === "profile" && currentUser && (
        <Profile t={t} lang={lang} dir={dir} currentUser={currentUser} tasks={tasks} users={users} setView={setView} openTask={openTask} />
      )}

      {view === "admin" && currentUser?.isAdmin && (
        <AdminDashboard t={t} lang={lang} dir={dir} tasks={tasks} users={users} onDeleteTask={handleDeleteTask} onToggleSuspend={handleToggleSuspend} />
      )}

      {view === "privacy" && <PrivacyPolicy t={t} lang={lang} dir={dir} setView={setView} />}

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "20px 20px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, borderTop: `1px solid ${COLORS.border}`, marginTop: 20 }}>
        <span style={{ fontSize: 12, color: COLORS.inkSoft }}>© 2026 {t.appName}. {t.footerRights}</span>
        <Btn variant="ghost" onClick={() => setView("privacy")} style={{ padding: "4px 4px", fontSize: 12 }}>{t.privacyPolicy}</Btn>
      </div>
    </div>
  );
}
