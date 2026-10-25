import {initializeApp} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import {getAuth,signInWithEmailAndPassword,signOut,onAuthStateChanged,browserLocalPersistence,setPersistence} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import {getFirestore,collection,getDocs,onSnapshot} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';
import {firebaseConfig,firebaseReady} from './firebase-config.js';
const $ = id => document.getElementById(id);
let auth=null, db=null, unsubscribe=null, rows=[];
function showLogin(message=''){if(unsubscribe){unsubscribe();unsubscribe=null}$('loginArea').hidden=false;$('dashboard').hidden=true;$('loginMessage').textContent=message;rows=[]}
function safeValue(x){return String(x??'').replace(/^[=+\-@]/, "'\$&").replace(/\r?\n/g,' ').replaceAll('"','""')}
function downloadCSV(){const head=['رقم البطاقة','عنوان البطاقة','رقم الإجابة','نص الإجابة','وقت الإرسال'];const content=[head.join(','),...rows.map(r=>[r.cardNumber,r.cardTitle,r.choiceIndex+1,r.answerText,formatDate(r.submittedAt)].map(v=>'"'+safeValue(v)+'"').join(','))].join('\r\n');const blob=new Blob(['\ufeff',content],{type:'text/csv;charset=utf-8;'});const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download='raqeeb-visitors.csv';link.click();setTimeout(()=>URL.revokeObjectURL(link.href),2000)}
function formatDate(t){try{const date=t?.toDate?.();return date?new Intl.DateTimeFormat('ar-OM',{dateStyle:'short',timeStyle:'short',timeZone:'Asia/Muscat'}).format(date):'—'}catch(e){return '—'}}
function make(tag,text,cls){const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(cls)el.className=cls;return el}
function render(){const counts=Array(10).fill(0);rows.forEach(r=>{if(Number.isInteger(r.cardNumber)&&r.cardNumber>=1&&r.cardNumber<=10)counts[r.cardNumber-1]++});$('total').textContent=String(rows.length);$('unique').textContent=counts.filter(Boolean).length+'/10';$('last').textContent=rows.length?formatDate(rows[0].submittedAt):'—';$('csv').disabled=!rows.length;
 const bars=$('bars');bars.replaceChildren();const max=Math.max(1,...counts);
 counts.forEach((num,i)=>{const line=make('div',undefined,'barline');line.append(make('span','بطاقة '+String(i+1).padStart(2,'0')));const track=make('div',undefined,'track');const fill=make('div',undefined,'fill');fill.style.width=(num/max*100)+'%';track.append(fill);line.append(track,make('strong',String(num)));bars.append(line)});
 const answers=$('answers');answers.replaceChildren();if(!rows.length){answers.append(make('p','لا توجد مشاركات حتى الآن.','empty'));return}
 rows.slice(0,60).forEach(r=>{const item=make('article',undefined,'answer');const top=make('div',undefined,'answer-top');top.append(make('strong','بطاقة '+r.cardNumber+' — '+(r.cardTitle||'موقف ميداني')),make('time',formatDate(r.submittedAt)));item.append(top,make('p',r.answerText||''));answers.append(item)});
}
function openDashboard(){ $('loginArea').hidden=true;$('dashboard').hidden=false;$('status').textContent='جاري تحميل المشاركات…';if(unsubscribe)unsubscribe();unsubscribe=onSnapshot(collection(db,'raqeebVotes'),snap=>{rows=snap.docs.map(d=>d.data()).sort((a,b)=>(b.submittedAt?.seconds||0)-(a.submittedAt?.seconds||0));render();$('status').textContent='تم تحديث النتائج.'},error=>{$('status').textContent=error.code==='permission-denied'?'لا تملك هذه الجلسة صلاحية قراءة النتائج. تحقق من UID في قواعد Firestore.':'تعذر تحميل النتائج. تحقق من الاتصال والإعدادات.';console.warn('Raqeeb admin:',error)})}
if(!firebaseReady){showLogin('يلزم إعداد Firebase أولًا كما هو موضح في دليل الإعداد.');$('loginForm').querySelector('button').disabled=true}
else{
 const app=initializeApp(firebaseConfig);auth=getAuth(app);db=getFirestore(app);
 onAuthStateChanged(auth,user=>{if(user&&!user.isAnonymous)openDashboard();else showLogin()});
 $('loginForm').addEventListener('submit',async e=>{e.preventDefault();const b=$('signInBtn');b.disabled=true;$('loginMessage').textContent='جارٍ تسجيل الدخول…';try{await setPersistence(auth,browserLocalPersistence);await signInWithEmailAndPassword(auth,$('email').value.trim(),$('password').value)}catch(error){showLogin('تعذر تسجيل الدخول. تحقق من البريد وكلمة المرور.')}finally{b.disabled=false}});
 $('logout').addEventListener('click',async()=>{await signOut(auth);showLogin()});
 $('refresh').addEventListener('click',async()=>{if(!auth.currentUser)return;$('status').textContent='جارٍ التحديث…';try{const snap=await getDocs(collection(db,'raqeebVotes'));rows=snap.docs.map(d=>d.data()).sort((a,b)=>(b.submittedAt?.seconds||0)-(a.submittedAt?.seconds||0));render();$('status').textContent='تم التحديث.'}catch(e){$('status').textContent='تعذر التحديث، تحقق من الصلاحيات.'}});
 $('csv').addEventListener('click',downloadCSV);
}
