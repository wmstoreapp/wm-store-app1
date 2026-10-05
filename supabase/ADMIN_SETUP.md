# إعداد مدير wm في Supabase

## 1. إنشاء حساب المدير

من Supabase افتح **Authentication → Users → Add user**، وأنشئ مستخدمًا بالبريد الإلكتروني وكلمة مرور قوية. انسخ قيمة **User UID** لهذا المستخدم.

## 2. تطبيق Migration الصلاحيات

من **SQL Editor** انسخ وشغّل ملف:

`supabase/migrations/20261005083000_secure_admin_products.sql`

## 3. إضافة المستخدم إلى قائمة المديرين

بعد استبدال `USER_UUID` بالـ UID الحقيقي، شغّل:

```sql
insert into public.admin_users (user_id)
values ('USER_UUID');
```

## 4. تسجيل الدخول من التطبيق

افتح قائمة صورة الحساب، اختر **للإدارة فقط**، ثم استخدم بريد المدير وكلمة المرور التي أنشأتها في Supabase Auth.

الحسابات غير الموجودة في `admin_users` تستطيع استخدام التطبيق، لكنها لا تستطيع إضافة أو تعديل أو إخفاء المنتجات.

> لا تفتح سياسات INSERT أو UPDATE أو DELETE للعامة. صلاحيات الكتابة محصورة في مستخدم Supabase Auth موجود داخل `admin_users`.
