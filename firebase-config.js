// إعدادات مشروع Firebase Web App — الصقي القيم من Firebase Console هنا.
// هذه المعلومات ليست كلمة مرور، لكن لا تضعي أي مفاتيح سرية أو بيانات رقابية هنا.
export const firebaseConfig = {
  apiKey: "PUT_API_KEY_HERE",
  authDomain: "PUT_PROJECT_ID_HERE.firebaseapp.com",
  projectId: "PUT_PROJECT_ID_HERE",
  appId: "PUT_APP_ID_HERE"
};
export const firebaseReady = !Object.values(firebaseConfig).some(value => String(value).includes("PUT_"));
