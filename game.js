// RAQEEB — visitor game. No paid build step; CDN Firebase is loaded only once configured.
import {firebaseConfig, firebaseReady} from './firebase-config.js';
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
const deck=$('deck');
const IS_PREVIEW=new URLSearchParams(location.search).has('preview');
const USE_FIREBASE=firebaseReady && !IS_PREVIEW;
const KEY=USE_FIREBASE?'raqeeb-real-visit-v3':IS_PREVIEW?'raqeeb-preview-visit-v3':'raqeeb-local-visit-v3';
let state={stage:'new',mission:null,choice:null};
let backend=null;
let user=null;
let transmitting=false;
const icon=n=>`<svg class="icon" aria-hidden="true"><use href="#${n}"></use></svg>`;
function persist(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch{}}
function restore(){try{const v=JSON.parse(localStorage.getItem(KEY)||'null');if(v&&['new','picked','sending','sent'].includes(v.stage)&&(v.mission===null||Number.isInteger(v.mission)&&v.mission>=0&&v.mission<missions.length))state=v;}catch{}}
function showDeck(){
  deck.replaceChildren();
  deck.classList.toggle('has-picked',state.mission!==null);
  missions.forEach((m,i)=>{
    const b=document.createElement('button');
    b.type='button'; b.className='card'+(state.mission===i?' is-open':'');
    b.disabled=state.stage!=='new';
    b.setAttribute('aria-label','البطاقة '+(i+1));
    b.innerHTML=`<span class="cardInner"><span class="cardFace cardBack"><span class="smallMark">رقيب</span>${icon('i-spark')}<span class="no">${String(i+1).padStart(2,'0')}</span></span><span class="cardFace cardFront">${icon(m.icon)}<strong>${m.name}</strong></span></span>`;
    b.addEventListener('click',()=>pick(i)); deck.append(b);
  });
}
function pick(i){
  if(state.stage!=='new')return;
  state={stage:'picked',mission:i,choice:null}; persist();showDeck();showQuestion();
}
function showQuestion(){
  if(state.mission===null||!['picked','sending'].includes(state.stage))return;
  const m=missions[state.mission];
  $('question').classList.remove('hidden');$('noSelection').hidden=true;
  $('missionIndex').textContent='البطاقة '+String(state.mission+1).padStart(2,'0');
  $('missionTitle').textContent=m.title; $('missionQuestion').textContent=m.question;
  const c=$('choices');c.replaceChildren();
  m.options.forEach((option,i)=>{
    const b=document.createElement('button'); b.type='button';b.className='choice';
    b.disabled=state.choice!==null;
    b.innerHTML='<span class="radio" aria-hidden="true"></span>';
    const t=document.createElement('span');t.textContent=option;b.append(t);
    b.addEventListener('click',()=>choose(i));
    if(state.choice===i)b.classList.add('selected');
    c.append(b);
  });
  if(state.choice!==null && state.stage==='sending'){
    const button=document.createElement('button');button.className='primary';button.type='button';
    button.textContent='إعادة إرسال الإجابة';button.addEventListener('click',send); c.append(button);
  }
  requestAnimationFrame(()=>{$('question').scrollIntoView({block:'start',behavior:'smooth'});});
}
function finish(title='شكرًا لمشاركتك!',subtitle='قرارك يضيف للحكاية.',retry=false){
  document.body.classList.add('ended');$('complete').classList.add('show');
  $('endTitle').textContent=title;$('endMessage').textContent=subtitle;
  $('retryBtn').hidden=!retry;$('sendNote').hidden=true;
  requestAnimationFrame(()=>$('challenge').scrollIntoView({block:'start',behavior:'smooth'}));
}
async function setupFirebase(){
  if(!USE_FIREBASE)return null;
  if(backend)return backend;
  const base='https://www.gstatic.com/firebasejs/11.10.0/';
  const [appLib,authLib,storeLib]=await Promise.all([
    import(base+'firebase-app.js'),import(base+'firebase-auth.js'),import(base+'firebase-firestore.js')
  ]);
  const app=appLib.initializeApp(firebaseConfig);
  const auth=authLib.getAuth(app);
  await authLib.setPersistence(auth,authLib.browserLocalPersistence);
  await auth.authStateReady();
  const person=auth.currentUser|| (await authLib.signInAnonymously(auth)).user;
  if(!person.isAnonymous)throw new Error('not anonymous');
  user=person;
  backend={auth,storeLib,db:storeLib.getFirestore(app)};
  return backend;
}
async function send(){
  if(transmitting||state.mission===null||!Number.isInteger(state.choice))return;
  transmitting=true;
  state.stage='sending';persist();
  if(!USE_FIREBASE){
    // Local interaction for reviewing design BEFORE Firebase connection.
    // No network call, and no statement that the response was received.
    state.stage='sent';persist();finish();transmitting=false;return;
  }
  finish('جارٍ إرسال إجابتك…','');
  try{
    const {storeLib,db}=await setupFirebase();
    const ref=storeLib.doc(db,'raqeebVotes',user.uid);
    const existing=await storeLib.getDoc(ref);
    if(existing.exists()){state.stage='sent';persist();finish();return;}
    const m=missions[state.mission];
    await storeLib.setDoc(ref,{
      visitorId:user.uid,cardNumber:state.mission+1,cardTitle:m.name,
      choiceIndex:state.choice,answerText:m.options[state.choice],
      submittedAt:storeLib.serverTimestamp()
    });
    state.stage='sent';persist();finish();
  }catch(error){
    console.error('RAQEEB: submission failed',error);
    state.stage='sending';persist();
    finish('لم يكتمل الإرسال','تحقق من الاتصال، ثم جرّب إرسال الإجابة نفسها.',true);
  }finally{transmitting=false;}
}
function choose(i){
  if(state.stage!=='picked'||state.choice!==null)return;
  state.choice=i;persist();send();
}
async function init(){
  restore();
  // Important: cards are INTERACTIVE without Firebase; it only controls remote submission.
  // If a real vote has been submitted, the account document persists server-side.
  if(state.stage==='sent'){finish();showDeck();return;}
  showDeck();
  if(state.stage==='picked'){showQuestion();}
  if(state.stage==='sending'){
    finish('لم يكتمل الإرسال','جرّب إرسال الإجابة نفسها.',true);
  }
  if(USE_FIREBASE){
    try{
      const {storeLib,db}=await setupFirebase();
      const vote=await storeLib.getDoc(storeLib.doc(db,'raqeebVotes',user.uid));
      if(vote.exists()){state.stage='sent';persist();showDeck();finish();}
    }catch(error){console.warn('RAQEEB: Firebase unavailable until configured',error);}
  }
}
$('startBtn').addEventListener('click',()=>$('challenge').scrollIntoView({behavior:'smooth',block:'start'}));
$('retryBtn').addEventListener('click',send);
init();
