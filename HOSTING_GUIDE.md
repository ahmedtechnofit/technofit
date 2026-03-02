# دليل نشر TechnoFit على الاستضافة المجانية

## 🗄️ الخطوة 1: إنشاء قاعدة بيانات PostgreSQL مجانية

### الخيار 1: Supabase (الأفضل - 500MB مجاني)

1. اذهب إلى [supabase.com](https://supabase.com)
2. سجل حساب مجاني
3. أنشئ مشروع جديد (New Project)
4. اختر اسم المشروع وكلمة مرور قوية
5. انتظر حتى يتم إنشاء المشروع (1-2 دقيقة)
6. اذهب إلى **Settings** > **Database**
7. انسخ **Connection string** (URI format)
8. استبدل `[YOUR-PASSWORD]` بكلمة المرور التي اخترتها

**صيغة الرابط:**
```
postgresql://postgres:YOUR_PASSWORD@db.xxxxxxxxxxxx.supabase.co:5432/postgres
```

### الخيار 2: Neon (سهل وسريع - 512MB مجاني)

1. اذهب إلى [neon.tech](https://neon.tech)
2. سجل حساب مجاني
3. أنشئ مشروع جديد
4. انسخ **Connection string**

**صيغة الرابط:**
```
postgresql://username:password@ep-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

---

## 🚀 الخطوة 2: إعداد المشروع للنشر

### 2.1 تحديث ملف .env
```bash
# استبدل رابط قاعدة البيانات برابط PostgreSQL الخاص بك
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres"
```

### 2.2 تحديث Prisma للإنتاج
```bash
# انسخ ملف PostgreSQL schema
cp prisma/schema.postgresql.prisma prisma/schema.prisma

# أو عدّل الملف يدويًا وغيّر provider إلى "postgresql"
```

### 2.3 بناء قاعدة البيانات
```bash
npx prisma generate
npx prisma db push
```

---

## 📤 الخطوة 3: النشر على Vercel (مجاني)

1. اذهب إلى [vercel.com](https://vercel.com)
2. سجل حساب مجاني (يفضل بـ GitHub)
3. اربط مستودع GitHub الخاص بك
4. أضف متغير البيئة:
   - **Name:** `DATABASE_URL`
   - **Value:** رابط PostgreSQL الخاص بك
5. انقر **Deploy**

---

## 📤 الخطوة 4: النشر على Railway (مجاني)

1. اذهب إلى [railway.app](https://railway.app)
2. سجل حساب مجاني
3. أنشئ مشروع جديد من GitHub
4. أضف PostgreSQL من Marketplace
5. اربط المتغيرات تلقائيًا
6. انشر المشروع

---

## ⚠️ ملاحظات مهمة

1. **SQLite** يعمل محليًا فقط ولا يعمل على Vercel/Netlify
2. **PostgreSQL** مطلوب للنشر على الاستضافات المجانية
3. حافظ على رابط قاعدة البيانات سريًا ولا تشاركه
4. اعمل backup لقاعدة البيانات بشكل دوري

---

## 🔧 أوامر مفيدة

```bash
# تشغيل المشروع محليًا
bun run dev

# بناء قاعدة البيانات
npx prisma db push

# فتح Prisma Studio
npx prisma studio

# إنشاء بيانات تجريبية
npx prisma db seed
```

---

## 📞 الدعم

إذا واجهت أي مشاكل، تواصل معي وسأساعدك!
