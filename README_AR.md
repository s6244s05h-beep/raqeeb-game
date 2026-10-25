# رقيب — لعبة التحدّي التفاعلية | جاهز لـ GitHub Pages

**محتويات المجلد**
- `index.html`: لعبة الزوار (10 بطاقات، كل متصفح يُجيب مرة واحدة).
- `game.js`: يرسل الإجابة إلى Firestore، ويحفظ اختيار الزائر في متصفحه.
- `admin.html` + `admin.css` + `admin.js`: لوحة الفريق. محمية بتسجيل الدخول وقواعد Firestore.
- `firebase-config.js`: ملف إعداد الربط، يُملأ من Firebase Console.
- `firestore.rules`: قواعد Firestore المقترحة لمنع قراءة الزوار لإجابات الآخرين.
- `stand.html`: قالب ورقة A4. بعد النشر أدخِل رابط اللعبة لتوليد QR ثم اطبع PDF.

## 1 — رفع الملفات إلى GitHub Pages (مجاني)
1. افتح https://github.com/new وأنشئ مستودع Public باسم `raqeeb-game`.
2. افتح المستودع > Add file > Upload files.
3. **افتح مجلد هذا المشروع وارفع الملفات نفسها** بحيث يظهر `index.html` في جذر المستودع، وليس تحت مجلد آخر. اضغط Commit changes.
4. Settings > Pages > Build and deployment: Source = Deploy from a branch، Branch = main، Folder = /(root)، Save.
5. رابط اللعبة سيكون بشكل `https://USERNAME.github.io/raqeeb-game/` بعد النشر (هذا مثال؛ استخدم الرابط الحقيقي).

## 2 — تشغيل حفظ الإجابات (مهم: لن تعمل الإرساليات قبل هذه الخطوة)
1. افتح https://console.firebase.google.com وأنشئ مشروع Firebase جديدًا، واختر خطة Spark المجانية. **لا تفعّل الفوترة**.
2. داخل Project settings > Your apps > Web (رمز </>) > Register app. انسخ القيم الأربع `apiKey`, `authDomain`, `projectId`, `appId` والصقها في `firebase-config.js` بدل النصوص `PUT_...`.
3. Security > Authentication > Sign-in method: فعّل **Anonymous** (للزوار) و **Email/Password** (للفريق).
4. Security > Authentication > Users > Add user: أنشئ بريدًا وكلمة مرور خاصة بالفريق. **لا تضع كلمة المرور في أي ملف GitHub**.
5. من صفحة Users انسخ عمود **User UID** الخاص بحساب الفريق فقط.
6. Firestore Database > Create database > اختر الموقع المناسب لخدمة Firebase و Standard edition. من **Rules** الصق محتوى `firestore.rules`، واستبدل `PASTE_TEAM_ADMIN_UID_HERE` بقيمة UID الحقيقية، ثم Publish. لا تستخدم قواعد `allow read, write: if true`.
7. Authentication > Settings > Authorized domains: أضف `USERNAME.github.io` إذا لم يكن موجودًا.
8. ارفع `firebase-config.js` المحدَّث إلى المستودع نفسه، وانتظر تحديث GitHub Pages.
9. افتح رابط اللعبة من جوال، جاوب عن بطاقة واحدة وانتظر شاشة الشكر. بعدها افتح `https://USERNAME.github.io/raqeeb-game/admin.html` على متصفح آخر وسجّل دخول الفريق؛ ستظهر الإجابة.
10. جرّب مشاركًا ثانيًا بنفس رقم البطاقة على جهاز آخر: كلاهما يدخل في النتائج بشكل مستقل. حد المحاولة ينطبق على نفس المتصفح/حساب Firebase المجهول، وليس على البطاقة.

## 3 — إنشاء QR وورقة A4
1. افتح `stand.html` من المجلد بعد نشر رابط اللعبة، مع اتصال بالإنترنت.
2. الصق رابط GitHub Pages الحقيقي في الحقل، اضغط «إنشاء QR».
3. افحص QR بهاتف **مختلف** وتأكد أنه يفتح اللعبة.
4. اضغط «طباعة A4» واختر الطابعة أو «حفظ بتنسيق PDF». اختر A4 طولي و Scale 100% وفعّل طباعة الخلفيات إن ظهر الخيار.

## نقاط مهمة جدًا
- GitHub Pages مجاني للمستودعات العامة، وكل الملفات المنشورة فيه قابلة للقراءة؛ لا تضف معلومات تفتيش رسمية أو أسرارًا.
- قاعدة بيانات Firestore تحفظ الإجابات؛ GitHub Pages **لا** يحفظها بنفسه.
- لا يستطيع أي موقع عام ضمان «شخص واحد فقط» دون تعريف موثوق لكل شخص. هذه النسخة تمنع الإعادة من نفس المتصفح وحساب Firebase المجهول؛ مسح البيانات أو جهاز آخر يتجاوزها.
- صفحة `admin.html` نفسها قد يصل إليها أي شخص يعرف الرابط، **لكن الإجابات محمية بصلاحيات Firestore حتى بعد معرفة الرابط**. افتح لوحة الفريق من متصفح مختلف عن لعبة الزائر.
- كل إجابة لا تُعد مرسلة إلا بعد نجاح Firestore. إن فشل الإرسال، يظهر خيار إعادة محاولة الإجابة نفسها.
- لابد من إنترنت للمشاركة. إذا لم تُدخل إعداد Firebase أو لم تفعّل Authentication/Rules، تبقى اللعبة غير جاهزة للجمهور.
- الأرقام الظاهرة في لوحة الإدارة قبل وصول أي ردود تساوي صفرًا؛ لا توجد بيانات تجريبية مخترعة.
- لا توجد أي كلمات مرور داخل ملفات الموقع.
