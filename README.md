# 🏋️ TechnoFit - منصة التقنية واللياقة

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-16.1.3-black?style=for-the-badge&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/TailwindCSS-4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="TailwindCSS">
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma" alt="Prisma">
</div>

## 📖 وصف المشروع

**TechnoFit** هي منصة شخصية احترافية تجمع بين ثلاثة مجالات رئيسية:
- 💻 **التكنولوجيا** - مقالات ونصائح تقنية
- 🏋️ **كمال الأجسام** - برامج تدريبية ونصائح لياقة
- 🥗 **التغذية** - أنظمة غذائية ونصائح صحية

## ✨ المميزات

### للمستخدمين
- 📝 تصفح المقالات حسب التصنيف
- ❤️ نظام الإعجاب التفاعلي
- 💬 نظام التعليقات مع موافقة المشرف
- 📤 مشاركة المقالات على السوشيال ميديا
- 📱 تصميم متجاوب لجميع الأجهزة
- 🌙 دعم الوضع الداكن

### للمشرفين
- 🔐 نظام تسجيل دخول آمن
- 📊 لوحة تحكم شاملة
- ✏️ إنشاء وتعديل وحذف المقالات
- 💬 إدارة التعليقات والموافقة عليها
- 📧 عرض رسائل التواصل
- 🗑️ نظام التنظيف الذكي لقاعدة البيانات

## 🛠️ التقنيات المستخدمة

| التقنية | الاستخدام |
|---------|----------|
| Next.js 16 | إطار العمل الرئيسي |
| TypeScript | لغة البرمجة |
| Tailwind CSS | التنسيقات |
| shadcn/ui | مكونات UI |
| Prisma | ORM لقاعدة البيانات |
| SQLite | قاعدة البيانات |
| Lucide Icons | الأيقونات |

## 🚀 البدء

### المتطلبات
- Node.js 18+
- Bun أو npm

### التثبيت

```bash
# استنساخ المشروع
git clone https://github.com/YOUR_USERNAME/technofit.git
cd technofit

# تثبيت التبعيات
bun install

# إعداد قاعدة البيانات
bun run db:push

# تشغيل الخادم
bun run dev
```

### بيانات الدخول للمشرف
```
Username: admin
Password: TechnoFit@2024
```

## 📁 هيكل المشروع

```
technofit/
├── prisma/              # قاعدة البيانات
│   └── schema.prisma    # مخطط قاعدة البيانات
├── public/              # الملفات العامة
│   └── uploads/         # الصور المرفوعة
├── src/
│   ├── app/
│   │   ├── api/         # API Routes
│   │   │   ├── posts/   # API المقالات
│   │   │   ├── comments/# API التعليقات
│   │   │   ├── likes/   # API الإعجابات
│   │   │   ├── contacts/# API التواصل
│   │   │   └── images/  # API الصور
│   │   ├── layout.tsx   # التخطيط الرئيسي
│   │   └── page.tsx     # الصفحة الرئيسية
│   ├── components/
│   │   ├── admin/       # مكونات لوحة التحكم
│   │   ├── blog/        # مكونات المدونة
│   │   └── ui/          # مكونات UI
│   └── lib/
│       ├── auth.tsx     # نظام المصادقة
│       └── db.ts        # اتصال قاعدة البيانات
└── package.json
```

## 🔗 روابط مهمة

- 🌐 **الموقع**: [TechnoFit](https://technofit.vercel.app)
- 📱 **TikTok**: [@technofit90](https://www.tiktok.com/@technofit90)
- 📷 **Instagram**: [@a.technofit](https://www.instagram.com/a.technofit)
- 📞 **WhatsApp**: [+201069465855](https://wa.me/201069465855)

## 📝 API Endpoints

| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/api/posts` | قائمة المقالات |
| GET | `/api/posts/:slug` | تفاصيل مقال |
| POST | `/api/posts` | إنشاء مقال جديد |
| PUT | `/api/posts/:slug` | تعديل مقال |
| DELETE | `/api/posts/:slug` | حذف مقال |
| POST | `/api/likes` | إضافة/إزالة إعجاب |
| GET | `/api/likes?postId=xxx` | حالة الإعجاب |
| GET | `/api/comments` | قائمة التعليقات |
| POST | `/api/comments` | إضافة تعليق |
| PUT | `/api/comments` | موافقة على تعليق |
| POST | `/api/contacts` | إرسال رسالة تواصل |
| POST | `/api/images` | رفع صورة |

## 📊 قاعدة البيانات

### الجداول
- **Post** - المقالات
- **Comment** - التعليقات
- **Like** - الإعجابات
- **Contact** - رسائل التواصل
- **Service** - الخدمات
- **UploadedImage** - الصور المرفوعة

## 🔒 الأمان

- ✅ حماية من CSRF
- ✅ التحقق من المدخلات
- ✅ تشفير كلمات المرور
- ✅ حماية الملفات المرفوعة

## 📄 الترخيص

هذا المشروع مرخص تحت رخصة MIT.

---

<div align="center">
  صنع بـ ❤️ بواسطة <a href="https://github.com/technofit90">TechnoFit</a>
</div>
