import {firebaseConfig,firebaseReady} from './firebase-config.js';
const $ = id => document.getElementById(id);
let auth=null, db=null, unsubscribe=null, rows=[]; let sdkAuth=null,sdkStore=null;
function showLogin(message=''){if(unsubscribe){unsubscribe();unsubscribe=null}$('loginArea').hidden=false;$('dashboard').hidden=true;$('loginMessage').textContent=message;rows=[]}
function safeValue(x){const v=String(x??'').replace(/\r?\n/g,' ').replaceAll('\"','\"\"');return /^[=+\-@]/.test(v)?"'"+v:v}
function downloadCSV(){const head=['رقم البطاقة','عنوان البطاقة','رقم الإجابة','نص الإجابة','وقت الإرسال'];const content=[head.join(','),...rows.map(r=>[r.cardNumber,r.cardTitle,r.choiceIndex+1,r.answerText,formatDate(r.submittedAt)].map(v=>'"'+safeValue(v)+'"').join(','))].join('\r\n');const blob=new Blob(['\ufeff',content],{type:'text/csv;charset=utf-8;'});const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download='raqeeb-visitors.csv';link.click();setTimeout(()=>URL.revokeObjectURL(link.href),2000)}
function formatDate(t){try{const date=t?.toDate?.();return date?new Intl.DateTimeFormat('ar-OM',{dateStyle:'short',timeStyle:'short',timeZone:'Asia/Muscat'}).format(date):'—'}catch(e){return '—'}}
function make(tag,text,cls){const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(cls)el.className=cls;return el}
function render(){const counts=Array(10).fill(0);rows.forEach(r=>{if(Number.isInteger(r.cardNumber)&&r.cardNumber>=1&&r.cardNumber<=10)counts[r.cardNumber-1]++});$('total').textContent=String(rows.length);$('unique').textContent=counts.filter(Boolean).length+'/10';$('last').textContent=rows.length?formatDate(rows[0].submittedAt):'—';$('csv').disabled=!rows.length;
 const bars=$('bars');bars.replaceChildren();const max=Math.max(1,...counts);
 counts.forEach((num,i)=>{const line=make('div',undefined,'barline');line.append(make('span','بطاقة '+String(i+1).padStart(2,'0')));const track=make('div',undefined,'track');const fill=make('div',undefined,'fill');fill.style.width=(num/max*100)+'%';track.append(fill);line.append(track,make('strong',String(num)));bars.append(line)});
 const answers=$('answers');answers.replaceChildren();if(!rows.length){answers.append(make('p','لا توجد مشاركات حتى الآن.','empty'));return}
 rows.slice(0,60).forEach(r=>{const item=make('article',undefined,'answer');const top=make('div',undefined,'answer-top');top.append(make('strong','بطاقة '+r.cardNumber+' — '+(r.cardTitle||'موقف ميداني')),make('time',formatDate(r.submittedAt)));item.append(top,make('p',r.answerText||''));answers.append(item)});
}
function openDashboard(){ $('loginArea').hidden=true;$('dashboard').hidden=false;$('status').textContent='جاري تحميل المشاركات…';if(unsubscribe)unsubscribe();unsubscribe=sdkStore.onSnapshot(sdkStore.collection(db,'raqeebVotes'),snap=>{rows=snap.docs.map(d=>d.data()).sort((a,b)=>(b.submittedAt?.seconds||0)-(a.submittedAt?.seconds||0));render();$('status').textContent='تم تحديث النتائج.'},error=>{$('status').textContent=error.code==='permission-denied'?'لا تملك هذه الجلسة صلاحية قراءة النتائج. تحقق من UID في قواعد Firestore.':'تعذر تحميل النتائج. تحقق من الاتصال والإعدادات.';console.warn('Raqeeb admin:',error)})}

const samples=[
 {cardNumber:5,cardTitle:'دور المشرف',choiceIndex:2,answerText:'حالة الزيارات والمهام التي تحتاج مراجعة',submittedAt:{seconds:1792950000,toDate:()=>new Date('2026-10-25T18:00:00Z')}},
 {cardNumber:1,cardTitle:'انقطع الاتصال',choiceIndex:1,answerText:'حفظ مسودة محليًا بشكل آمن، ثم مزامنتها لاحقًا',submittedAt:{seconds:1792948200,toDate:()=>new Date('2026-10-25T17:30:00Z')}},
 {cardNumber:3,cardTitle:'ملف المنشأة',choiceIndex:0,answerText:'ملفها وسجل الزيارات المتاح للمفتش المخوّل',submittedAt:{seconds:1792946400,toDate:()=>new Date('2026-10-25T17:00:00Z')}},
 {cardNumber:5,cardTitle:'دور المشرف',choiceIndex:2,answerText:'حالة الزيارات والمهام التي تحتاج مراجعة',submittedAt:{seconds:1792944600,toDate:()=>new Date('2026-10-25T16:30:00Z')}},
 {cardNumber:8,cardTitle:'معلومة حساسة',choiceIndex:2,answerText:'المستخدمون المخوّلون وفق صلاحياتهم',submittedAt:{seconds:1792942800,toDate:()=>new Date('2026-10-25T16:00:00Z')}}
];

if(new URLSearchParams(location.search).get('preview')==='1'){
 $('loginArea').hidden=true;$('dashboard').hidden=false;
 $('previewBanner').hidden=false;
 $('logout').hidden=true;$('refresh').hidden=true;$('csv').hidden=true;
 rows=samples;render();$('status').textContent='هذه معاينة للواجهة، وليست بيانات فعلية.';
}else if(!firebaseReady){
 showLogin('لتفعيل استقبال الإجابات وربط الفريق، أكمل إعداد Firebase الموضح في الدليل.');
 $('signInBtn').disabled=true;
}else{
 (async()=>{
 try{
   const base='https://www.gstatic.com/firebasejs/11.10.0/';
   const [appLib,authLib,storeLib]=await Promise.all([
     import(base+'firebase-app.js'), import(base+'firebase-auth.js'), import(base+'firebase-firestore.js')
   ]);
   sdkAuth=authLib;sdkStore=storeLib;
   const app=appLib.initializeApp(firebaseConfig);auth=authLib.getAuth(app);db=storeLib.getFirestore(app);
   authLib.onAuthStateChanged(auth,user=>{if(user&&!user.isAnonymous)openDashboard();else showLogin()});
   $('loginForm').addEventListener('submit',async e=>{
     e.preventDefault();const button=$('signInBtn');button.disabled=true;
     $('loginMessage').textContent='جارٍ تسجيل الدخول…';
     try{await authLib.setPersistence(auth,authLib.browserLocalPersistence);
       await authLib.signInWithEmailAndPassword(auth,$('email').value.trim(),$('password').value);
     }catch(e){showLogin('تعذر تسجيل الدخول. تحقق من البريد وكلمة المرور.');}
     finally{button.disabled=false;}
   });
   $('logout').addEventListener('click',async()=>{await authLib.signOut(auth);showLogin()});
   $('refresh').addEventListener('click',async()=>{
     if(!auth.currentUser)return;
     $('status').textContent='جارٍ التحديث…';
     try{const snap=await storeLib.getDocs(storeLib.collection(db,'raqeebVotes'));
       rows=snap.docs.map(d=>d.data()).sort((a,b)=>(b.submittedAt?.seconds||0)-(a.submittedAt?.seconds||0));
       render();$('status').textContent='تم التحديث.';
     }catch(e){$('status').textContent='تعذر التحديث. تحقق من الصلاحيات.';}
   });
   $('csv').addEventListener('click',downloadCSV);
 }catch(error){showLogin('تعذر تشغيل تسجيل الدخول. تحقق من إعدادات Firebase.');console.warn(error)}
 })();
}
