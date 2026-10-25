import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import { getAuth, signInAnonymously, setPersistence, browserLocalPersistence } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';
import { firebaseConfig, firebaseReady } from './firebase-config.js';
const missions = [
      {icon:'i-wifi',name:'انقطع الاتصال',title:'أنت في زيارة ميدانية… وفجأة انقطع الإنترنت!',question:'كيف تضمن استمرار التوثيق في حل رقمي مناسب للميدان؟',options:['التوقف عن أي توثيق حتى تعود الشبكة','حفظ مسودة محليًا بشكل آمن، ثم مزامنتها لاحقًا','إرسال تفاصيل المنشأة إلى أي هاتف قريب'],correct:1,feedback:'هذه آلية مقترحة لتطوير رقيب مستقبلًا: حفظ آمن محليًا، ثم مزامنة ومراجعة عند عودة الاتصال. لم نثبت تنفيذها الفعلي بعد.'},
      {icon:'i-route',name:'أول زيارة',title:'ثلاث منشآت تنتظر الزيارة… فمن تبدأ بها؟',question:'ما الذي يساعد المشرف على اختيار الأولوية؟',options:['قرب المنشأة وحده','اختيار أي منشأة عشوائيًا','طبيعة البلاغ، السجل، الأولوية، والقرب مع قرار المشرف'],correct:2,feedback:'لا توجد أولوية صحيحة من معلومة واحدة. رقيب يقترح جمع المؤشرات في رؤية تساعد المشرف، ولا تقرر بدلًا عنه.'},
      {icon:'i-file',name:'ملف المنشأة',title:'وصلت إلى منشأة لم تزرها من قبل.',question:'ما المعلومة الأكثر فائدة قبل بدء التفتيش؟',options:['ملفها وسجل الزيارات المتاح للمفتش المخوّل','اسم المنشأة فقط','لون واجهة المحل'],correct:0,feedback:'وجود سجل المنشأة في سياق الزيارة يسهّل فهم الحالة ويقلل البحث بين مصادر متعددة، بحسب الصلاحيات.'},
      {icon:'i-notebook',name:'وثّق الزيارة',title:'انتهت الزيارة، ولديك ملاحظات وصور.',question:'كيف تتجنب تشتت الأدلة؟',options:['تحفظها في أماكن منفصلة','تربط الملاحظات والأدلة بسجل الزيارة نفسه','ترسلها لأي شخص في تطبيق محادثة'],correct:1,feedback:'توثيق الأدلة ضمن سجل واحد للزيارة هو أحد أجزاء رحلة رقيب المقترحة.'},
      {icon:'i-user',name:'دور المشرف',title:'أنت المشرف، والفريق ينجز زيارات متعددة.',question:'ما العرض الذي يساعدك على المتابعة؟',options:['رسائل متفرقة فقط','عدد المفتشين فقط','حالة الزيارات والمهام التي تحتاج مراجعة'],correct:2,feedback:'المتابعة تكون أوضح عندما تُعرض حالات الزيارات والاستثناءات في مكان منظم، دون تجاوز صلاحيات المشرف.'},
      {icon:'i-list',name:'إدخال البيانات',title:'تضطر إلى كتابة المعلومة نفسها في أكثر من موضع.',question:'ما التحسين الأفضل لسير العمل؟',options:['إعادة استخدامها ضمن سير عمل مترابط بصلاحيات مناسبة','زيادة النماذج المتكررة','الاعتماد الدائم على ملاحظات ورقية منفصلة'],correct:0,feedback:'تقليل الإدخال المتكرر احتياج ظهر في الدراسة الاستكشافية؛ وهو أحد دوافع تصور رقيب.'},
      {icon:'i-flag',name:'بلاغ مستجد',title:'ظهر بلاغ جديد أثناء خطة زيارات اليوم.',question:'كيف ينبغي التعامل معه؟',options:['تجاهل البلاغ حتى نهاية الأسبوع','مراجعته وتقييم أولويته وتأثيره في الخطة','إلغاء جميع الزيارات بلا تقييم'],correct:1,feedback:'يتطلب تغيير الخطة تقييمًا بشريًا لطبيعة البلاغ والموارد المتاحة، ويمكن للنظام أن يساعد في وضوح القرار.'},
      {icon:'i-lock',name:'معلومة حساسة',title:'أمامك ملف يحتوي على تفاصيل رقابية غير عامة.',question:'من ينبغي أن يتمكن من الاطلاع عليه؟',options:['أي شخص يمتلك رابطًا عامًا','كل زائر في المعرض','المستخدمون المخوّلون وفق صلاحياتهم'],correct:2,feedback:'أي تطبيق فعلي ينبغي أن يحمي بيانات المنشآت وأدلة التفتيش بصلاحيات ومراجعة مناسبة. لعبتنا لا تستخدم بيانات حقيقية.'},
      {icon:'i-eye',name:'بعد الزيارة',title:'ضغطت «إنهاء الزيارة»… هل انتهت الرحلة؟',question:'ما الخطوة التي تحفظ قيمة ما تم توثيقه؟',options:['إتاحة المراجعة والمتابعة وفق الإجراء المعتمد','حذف جميع الملاحظات','البدء في تسجيل البيانات نفسها من الصفر'],correct:0,feedback:'التحدي لا ينتهي بالتوثيق؛ قيمة رحلة التفتيش تظهر أيضًا في المراجعة والمتابعة.'},
      {icon:'i-shield',name:'فكرة رقيب',title:'وصلت للمهمة الأخيرة: لماذا فكرنا في رقيب؟',question:'أي وصف أقرب للرؤية التي نعمل عليها؟',options:['استبدال المفتش في اتخاذ القرار','ربط رحلة التفتيش من التخطيط حتى المتابعة','استبدال جميع الأنظمة الحكومية القائمة'],correct:1,feedback:'رقيب نموذج أولي يقترح طبقة تنظيم للعمل الميداني تكمل الأنظمة القائمة، وتُختبر فائدتها قبل أي اعتماد فعلي.'}
    ];
const $ = id => document.getElementById(id);
const deck = $('deck');
const KEY = 'raqeeb-single-answer-2026';
let state = {stage: 'new', mission: null, choice: null};
let user = null, db = null, sending = false;
const icon = name => `<svg class="icon" aria-hidden="true"><use href="#${name}"></use></svg>`;
function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){}}
function read(){try{const val=JSON.parse(localStorage.getItem(KEY)||'null');if(val&&['new','picked','pending','sent'].includes(val.stage)&& (val.mission===null || Number.isInteger(val.mission)&&val.mission>=0&&val.mission<10)){state=val}}catch(e){} }
function showMessage(message){ $('noSelection').hidden=false; $('noSelection').textContent=message; }
function renderDeck(){
  deck.replaceChildren();
  const blocked=!user||state.stage!=='new';
  deck.classList.toggle('has-picked',state.mission!==null);
  missions.forEach((m,i)=>{
    const btn=document.createElement('button'); btn.type='button'; btn.className='card'+(state.mission===i?' is-open':'');
    btn.disabled=blocked;btn.setAttribute('aria-label','البطاقة '+(i+1));
    btn.innerHTML=`<span class="cardInner"><span class="cardFace cardBack"><span class="smallMark">رقيب</span>${icon('i-spark')}<span class="no">${String(i+1).padStart(2,'0')}</span></span><span class="cardFace cardFront">${icon(m.icon)}<strong>${m.name}</strong></span></span>`;
    btn.addEventListener('click',()=>pick(i));deck.append(btn);
  });
}
function pick(i){
  if(!user||state.stage!=='new')return;
  state={stage:'picked',mission:i,choice:null};save();renderDeck();renderQuestion();
}
function renderQuestion(){
  if(!['picked','pending'].includes(state.stage)||state.mission===null)return;
  const m=missions[state.mission];
  $('question').classList.remove('hidden');$('noSelection').hidden=true;
  $('missionIndex').textContent='المهمّة '+String(state.mission+1).padStart(2,'0');
  $('missionTitle').textContent=m.title;$('missionQuestion').textContent=m.question;
  const box=$('choices');box.replaceChildren();
  m.options.forEach((label,i)=>{
    const b=document.createElement('button');b.type='button';b.className='choice';b.disabled=state.choice!==null;
    b.innerHTML='<span class="radio" aria-hidden="true"></span>';
    const span=document.createElement('span');span.textContent=label;b.append(span);
    b.addEventListener('click',()=>answer(i));box.append(b);
  });
  if(state.choice!==null){const b=document.createElement('button');b.type='button';b.className='primary';b.textContent='إعادة إرسال الإجابة';b.addEventListener('click',send);box.append(b);}
  if(window.matchMedia('(max-width:640px)').matches){requestAnimationFrame(()=>$('question').scrollIntoView({behavior:'smooth',block:'start'}));}
}
function showFinish(title='شكرًا لمشاركتك!',message='قرارك يضيف للحكاية.',canRetry=false){
  document.body.classList.add('ended');$('complete').classList.add('show');
  $('endTitle').textContent=title;$('endMessage').textContent=message;
  $('sendNote').hidden=true;$('retryBtn').hidden=!canRetry;
  $('challenge').scrollIntoView({behavior:'auto',block:'start'});
}
async function send(){
  if(sending||!db||!user||state.mission===null||!Number.isInteger(state.choice))return;
  sending=true;
  state.stage='pending';save();showFinish('جارٍ إرسال الإجابة…','');
  const m=missions[state.mission];
  try{
    // Document id is an anonymous Firebase UID: different visitors can choose the same card.
    // Firestore rules accept CREATE only (no update): one vote per anonymous account.
    await setDoc(doc(db,'raqeebVotes',user.uid),{
      visitorId:user.uid,cardNumber:state.mission+1,cardTitle:m.name,
      choiceIndex:state.choice,answerText:m.options[state.choice],submittedAt:serverTimestamp()
    });
    state.stage='sent';save();showFinish();
  }catch(err){
    try{const already=await getDoc(doc(db,'raqeebVotes',user.uid));if(already.exists()){state.stage='sent';save();showFinish();return}}catch(e){}
    state.stage='pending';save();
    showFinish('تعذّر الإرسال','تحقّق من الإنترنت ثم حاول مرة أخرى.',true);
    console.error('RAQEEB submission failed',err);
  }finally{sending=false}
}
function answer(i){if(!user||state.stage!=='picked'||state.choice!==null)return;state.choice=i;save();send()}
async function init(){
  read();renderDeck();
  if(!firebaseReady){showMessage('التحدّي غير متاح مؤقتًا.');return}
  try{
    const app=initializeApp(firebaseConfig);db=getFirestore(app);
    const auth=getAuth(app);
    await auth.authStateReady();
    await setPersistence(auth,browserLocalPersistence);
    user=auth.currentUser??(await signInAnonymously(auth)).user;
    if(!user.isAnonymous){user=null;showMessage('التحدّي متاح من صفحة الزوار.');return}
    const vote=await getDoc(doc(db,'raqeebVotes',user.uid));
    if(vote.exists() || state.stage==='sent'){
      state.stage='sent';save();showFinish();return;
    }
    if(state.stage==='picked') {renderDeck();renderQuestion();return}
    if(state.stage==='pending' && state.choice!==null){
      showFinish('لم يكتمل الإرسال','تقدر تعيد إرسال نفس إجابتك.',true);return;
    }
    state={stage:'new',mission:null,choice:null};save();renderDeck();showMessage('وراء كل بطاقة حكاية من الميدان.');
  }catch(error){user=null;renderDeck();showMessage('التحدّي غير متاح مؤقتًا.');console.warn('RAQEEB setup error',error)}
}
$('startBtn').addEventListener('click',()=>$('challenge').scrollIntoView({behavior:'smooth',block:'start'}));
$('retryBtn').addEventListener('click',send);
init();
