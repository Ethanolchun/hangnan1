const MAX_DAY=7,MAX_ROUND=3,ACTIONS_PER_ROUND=4;
const scenes=[
{id:"classroom",name:"航南教室",difficulty:0.925,text:"教室门一开，空气先给你下马威。"},
{id:"elevator",name:"电梯",difficulty:1.150,text:"电梯门合上，副本开始。"},
{id:"canteen",name:"食堂",difficulty:0.92,text:"饭香和怪味同时入场。"},
{id:"library",name:"自习区",difficulty:1.00,text:"这里很安静，但气味不守纪律。"},
{id:"groupMeeting",name:"小组讨论",difficulty:1.15,text:"PPT 还没打开，空气已经开题。"},
{id:"dorm",name:"宿舍",difficulty:1.38,text:"你回到宿舍。每日 Boss 刷新。"}];
const characters=[
{id:"winter",name:"冬眠型选手",avatar:"🧥",base:48,desc:"厚外套，乱头发，坚信冬天不用天天洗。",line:"“冬天没出汗吧？”"},
{id:"sport",name:"运动直达型",avatar:"🏀",base:70,desc:"刚下球场，汗味还在热启动。",line:"“我就坐一会儿。”"},
{id:"sock",name:"袜子炼金术士",avatar:"🧦",base:78,desc:"床边袜团疑似培养出文明。",line:"“别动，我还要穿。”"},
{id:"perfume",name:"香水掩盖派",avatar:"🧴",base:62,desc:"香水很努力，底味更努力。",line:"“我喷香水了啊。”"},
{id:"study",name:"沉浸学习型",avatar:"💻",base:56,desc:"电脑不关，人不洗漱，持续输出。",line:"“洗澡会打断思路。”"},
{id:"crowded",name:"密闭叠加型",avatar:"🧍‍♂️",base:82,desc:"不是一个人，是一群人。",line:"“挤一挤就到了。”"},
{id:"normal",name:"普通闷热型",avatar:"😶",base:36,desc:"没有特别严重，但空气很摆。",line:"“还行吧？”"}];
const events=[
{name:"门窗紧闭",text:"窗户关死了。",sceneOnly:null,apply:s=>{s.air-=12;s.smell+=10;return"空气 -12，气味 +10"}},
{name:"运动后入场",text:"汗味增援抵达。",sceneOnly:null,apply:s=>{s.smell+=20;s.patience-=6;return"气味 +20，忍耐 -6"}},
{name:"袜子暴击",text:"袜子完成进化。",sceneOnly:"dorm",apply:s=>{s.smell+=28;s.sanity-=12;return"气味 +28，理智 -12"}},
{name:"北航大风",text:"风来了，正义来了。",sceneOnly:null,apply:s=>{s.air+=22;s.smell-=18;return"空气 +22，气味 -18"}},
{name:"DDL 压顶",text:"你被迫硬学。",sceneOnly:null,apply:s=>{s.study+=16;s.hp-=10;return"学习 +16，精神 -10"}},
{name:"突然停电",text:"黑暗放大了一切。",sceneOnly:null,apply:s=>{s.sanity-=10;s.air-=8;return"理智 -10，空气 -8"}},
{name:"奇迹洗澡",text:"有人洗澡了。",sceneOnly:null,apply:s=>{s.smell-=45;s.relationship+=8;return"气味 -45，关系 +8"}}];
let state={};
const $=id=>document.getElementById(id);
function clamp(v,min=0,max=100){return Math.max(min,Math.min(max,Math.round(v)))}
function pick(arr){return arr[Math.floor(Math.random()*arr.length)]}
function shuffle(arr){return[...arr].sort(()=>Math.random()-.5)}
function defaultState(){return{day:1,round:1,hp:100,air:100,patience:72,courage:50,relationship:78,study:0,clean:92,sanity:88,smell:60,scene:scenes[0],character:characters[0],event:null,mask:1,spray:1,mint:1,detergent:1,talkCard:1,hasRule:false,remind:0,explode:0,escape:0,windowOpened:false,currentActions:[],story:"",effect:"",gameOver:false,pendingFailure:null}}
const actions=[
{id:"endure",title:"忍了",desc:"学习快，但掉状态疼。",available:()=>true,run:()=>{state.study+=13;state.patience-=15;state.hp-=state.smell*.14;state.sanity-=7;state.story="你忍了。知识进脑，气味入魂。";state.effect="学习 +13，忍耐 -15，精神小降。"}},
{id:"mask",title:"戴口罩",desc:"仅 1 次，保命强。",available:()=>state.mask>0,run:()=>{state.mask-=1;state.study+=8;state.hp-=state.smell*.05;state.patience-=2;state.story="你戴上口罩。鼻腔暂时停火。";state.effect="学习 +8，伤害降低，口罩 -1。"}},
{id:"window",title:"开窗",desc:"提升空气，关系小降。",available:()=>state.scene.id!=="elevator"&&!state.windowOpened,run:()=>{state.air+=30;state.smell-=24;state.patience+=5;state.relationship-=state.scene.id==="dorm"?5:3;state.windowOpened=true;state.story="你开窗。冷风进来，命也回来一点。";state.effect="空气 +30，气味 -24，关系小降。"}},
{id:"move",title:"远离",desc:"保命，但耽误学习。",available:()=>state.scene.id!=="dorm",run:()=>{state.hp+=10;state.sanity+=8;state.study-=5;state.escape+=1;state.story="你撤到上风口。尊重流体力学。";state.effect="精神 +10，理智 +8，学习 -5。"}},
{id:"gentle",title:"委婉提醒",desc:"长期收益，消耗勇气。",available:()=>state.courage>=14,run:()=>{const card=state.talkCard>0;if(card)state.talkCard-=1;state.smell-=28;state.courage-=12;state.relationship-=card?2:5;state.remind+=1;state.patience+=5;state.story="你委婉提醒：大家注意通风和换洗。";state.effect=card?"气味 -28，话术卡 -1，关系微降。":"气味 -28，勇气 -12，关系小降。"}},
{id:"direct",title:"直接开怼",desc:"强效，但关系很危险。",available:()=>true,run:()=>{state.smell-=50;state.relationship-=26;state.courage-=7;state.explode+=1;state.story="你说：能不能洗澡？空气安静了，人也安静了。";state.effect="气味 -50，关系 -26，爆发 +1。"}},
{id:"spray",title:"空气清新剂",desc:"仅 1 次，高污染反噬。",available:()=>state.spray>0,run:()=>{state.spray-=1;if(state.smell>68){state.air-=18;state.sanity-=12;state.story="清新剂失败。花香和臭味合成新物种。";state.effect="反噬：空气 -18，理智 -12。"}else{state.air+=24;state.smell-=14;state.story="清新剂短暂有效。";state.effect="空气 +24，气味 -14。"}}},
{id:"mint",title:"薄荷糖",desc:"仅 1 次，回精神。",available:()=>state.mint>0,run:()=>{state.mint-=1;state.hp+=16;state.sanity+=14;state.story="你吃了薄荷糖。续命成功。";state.effect="精神 +16，理智 +14。"}},
{id:"detergent",title:"洗衣液",desc:"宿舍专用，仅 1 次。",available:()=>state.scene.id==="dorm"&&state.detergent>0,run:()=>{state.detergent-=1;state.air+=20;state.smell-=42;state.clean+=8;state.story="洗衣液出场。衣物重新成为衣物。";state.effect="空气 +20，气味 -42，洁净 +8。"}},
{id:"rule",title:"宿舍公约",desc:"宿舍可用，隐藏结局关键。",available:()=>state.scene.id==="dorm"&&!state.hasRule&&state.courage>=24,run:()=>{state.hasRule=true;state.courage-=24;state.relationship-=12;state.remind+=1;state.air+=12;state.smell-=28;state.story="你提出宿舍公约：通风、换洗、运动后处理。";state.effect="长期降低宿舍污染，关系 -12。"}},
{id:"deepBreath",title:"离场透气",desc:"恢复强，但学习变慢。",available:()=>state.scene.id!=="elevator",run:()=>{state.hp+=18;state.sanity+=12;state.patience+=6;state.study-=6;state.escape+=1;state.story="你离场透气两分钟。灵魂重新上线。";state.effect="精神 +18，理智 +12，学习 -6。"}},
{id:"shower",title:"自己洗澡",desc:"宿舍可用，恢复精神洁净。",available:()=>state.scene.id==="dorm",run:()=>{state.hp+=24;state.sanity+=12;state.clean+=30;state.air+=10;state.study-=5;state.story="你先去洗澡。自己先做示范。";state.effect="精神 +24，洁净 +30，学习 -5。"}},
{id:"studyBreak",title:"闭眼缓冲",desc:"小幅回血，任何场景可用。",available:()=>true,run:()=>{state.hp+=10;state.sanity+=8;state.patience+=4;state.study-=5;state.story="你闭眼十秒，假装世界很清新。";state.effect="精神 +10，理智 +8，学习 -5。"}}];
function startGame(){state=defaultState();show("gameScreen");newRound("第一天开始。活下去，顺便学习。")}
function show(id){["startScreen","gameScreen","endScreen"].forEach(s=>$(s).classList.remove("active"));$(id).classList.add("active")}
function chooseScene(){if(state.round===3)return scenes.find(s=>s.id==="dorm");return pick(scenes.filter(s=>s.id!=="dorm"))}
function chooseCharacter(){if(state.scene.id==="dorm")return pick(characters.filter(c=>["winter","sock","perfume","study"].includes(c.id)));if(state.scene.id==="elevator")return pick(characters.filter(c=>["sport","perfume","crowded","winter"].includes(c.id)));return pick(characters)}
function chooseEvent(){const pool=events.filter(e=>!e.sceneOnly||e.sceneOnly===state.scene.id);return Math.random()<.78?pick(pool):null}
function newRound(prefix=""){state.windowOpened=false;state.scene=chooseScene();state.character=chooseCharacter();const ruleBonus=state.hasRule&&state.scene.id==="dorm"?-32:0;const noise=Math.floor(Math.random()*25)-8;state.smell=clamp(state.character.base*state.scene.difficulty+noise+ruleBonus,15,100);state.event=chooseEvent();let eventEffect="无额外事件";if(state.event)eventEffect=state.event.apply(state);state.story=prefix||state.scene.text;state.effect=state.event?`事件「${state.event.name}」：${state.event.text}｜${eventEffect}`:eventEffect;passiveDamage();normalize();state.currentActions=chooseFourActions();render();checkEndNow()}
function chooseFourActions(){const available=actions.filter(a=>a.available());const recoverIds=["deepBreath","studyBreak","shower","mint"];const handleIds=["gentle","direct","window","move","detergent","rule","spray","mask"];const recoverPool=available.filter(a=>recoverIds.includes(a.id));const handlePool=available.filter(a=>handleIds.includes(a.id));const chosen=[];if(recoverPool.length>0)chosen.push(pick(recoverPool));if(handlePool.length>0){const h=pick(handlePool);if(!chosen.some(a=>a.id===h.id))chosen.push(h)}shuffle(available).forEach(a=>{if(chosen.length<ACTIONS_PER_ROUND&&!chosen.some(x=>x.id===a.id))chosen.push(a)});return chosen.slice(0,ACTIONS_PER_ROUND)}
function passiveDamage(mult=1){state.hp-=Math.max(3,state.smell*.085*mult);state.air-=Math.max(3,state.smell*.09*mult);state.patience-=Math.max(2,state.smell*.055*mult);state.sanity-=state.smell*.028*mult;if(state.scene.id==="elevator"){state.hp-=5;state.sanity-=5}if(state.scene.id==="dorm"){state.hp-=4;state.clean-=state.hasRule?1:4;state.relationship-=state.hasRule?0:1}}
function normalize(){["hp","air","patience","courage","relationship","study","clean","sanity","smell"].forEach(k=>{state[k]=clamp(state[k])})}
function doAction(id){
 const action=actions.find(a=>a.id===id);
 if(!action||!action.available()||state.gameOver)return;
 action.run();
 passiveDamage(.7);
 normalize();
 render();
 const fail=getFailure();
 showResultModal(fail);
}
function showResultModal(failEnding=null){
  $("resultTitle").textContent = failEnding ? "本回合结果：危险失控" : "本回合结果";
  $("resultStory").textContent = state.story;
  $("resultEffect").textContent = state.effect;
  $("resultModal").classList.remove("hidden");
  state.pendingFailure = failEnding;
}
function continueRound(){
  $("resultModal").classList.add("hidden");
  if(state.pendingFailure){
    const ending = state.pendingFailure;
    state.pendingFailure = null;
    return endGame(ending);
  }
  nextRound();
}
function nextRound(){if(state.study>=100&&state.day>=5)return endGame(getSuccess());if(state.round<MAX_ROUND){state.round+=1;newRound()}else endDay()}
function endDay(){state.day+=1;state.round=1;state.hp+=10;state.patience+=8;state.sanity+=6;state.clean-=4;state.air=Math.max(state.air,45);normalize();if(state.day>MAX_DAY)endGame(getSuccess());else newRound("新的一天。状态恢复很少，危机继续。")}
function getFailure(){if(state.hp<=0)return{title:"精神阵亡",text:"你没被考试击倒，但被空气击倒了。"};if(state.air<=0)return{title:"生化警报",text:"空气归零。窗户和洗澡都不是摆设。"};if(state.patience<=0)return{title:"忍耐崩溃",text:"你忍到极限，场面开始不可控。"};if(state.relationship<=0)return{title:"宿舍冷战",text:"气味战赢了，人际关系没了。"};if(state.clean<=0)return{title:"你也成为传说",text:"你忘了自己也要洗澡。屠龙者终成龙。"};if(state.sanity<=0)return{title:"鼻腔飞升",text:"你闻不到了，不是赢了，是系统离线了。"};return null}
function getSuccess(){if(state.hasRule&&state.remind>=4&&state.relationship>40)return{title:"隐藏结局：文明宿舍倡议人",text:"你用沟通和规则解决了长期问题。高级，真的高级。"};if(state.study>=100&&state.remind>=3&&state.relationship>45&&state.sanity>35)return{title:"最佳结局：清新航南",text:"你完成学习，也守住了空气。文明从一次换洗开始。"};if(state.escape>=5)return{title:"回避型生存",text:"你靠上风口活了下来。没解决问题，但很会保命。"};if(state.explode>=3)return{title:"爆发型勇士",text:"爽文路线达成，社交余震也达成。"};return{title:"普通结局：成功存活",text:"你撑过一周。建议奖励自己一口新鲜空气。"}}
function checkEndNow(){const fail=getFailure();if(fail)endGame(fail)}
function endGame(ending){state.gameOver=true;show("endScreen");$("endingTitle").textContent=ending.title;$("endingText").textContent=ending.text;$("endingStats").innerHTML=[["学习",state.study],["空气",state.air],["精神",state.hp],["忍耐",state.patience],["关系",state.relationship],["提醒",state.remind]].map(([k,v])=>`<div><span>${k}</span><b>${v}</b></div>`).join("")}
function color(v){if(v<=25)return"linear-gradient(90deg,#ef4444,#f97316)";if(v<=55)return"linear-gradient(90deg,#f59e0b,#facc15)";return"linear-gradient(90deg,#5967ff,#7c3aed)"}
function renderStats(){const list=[["空气质量",state.air],["精神值",state.hp],["忍耐值",state.patience],["学习进度",state.study],["社交勇气",state.courage],["人际关系",state.relationship],["自身洁净度",state.clean],["理智值",state.sanity]];$("stats").innerHTML=list.map(([name,value])=>`<div class="stat"><div class="stat-head"><span>${name}</span><b>${value}</b></div><div class="bar"><div class="fill" style="width:${value}%;background:${color(value)}"></div></div></div>`).join("")}
function renderInventory(){const items=[`😷 口罩 × ${state.mask}`,`🌫️ 清新剂 × ${state.spray}`,`🍃 薄荷糖 × ${state.mint}`,`🧴 洗衣液 × ${state.detergent}`,`💬 话术卡 × ${state.talkCard}`,state.hasRule?"📜 公约：有":"📜 公约：无"];$("inventory").innerHTML=items.map(i=>`<span class="chip">${i}</span>`).join("")}
function renderActions(){$("actions").innerHTML=state.currentActions.map(a=>`<button class="action" onclick="doAction('${a.id}')"><b>${a.title}</b><span>${a.desc}</span></button>`).join("")}
function render(){$("dayText").textContent=`${state.day} / ${MAX_DAY}`;$("roundText").textContent=`${state.round} / ${MAX_ROUND}`;$("sceneText").textContent=state.scene.name;$("smellText").textContent=`气味强度 ${state.smell}`;$("avatarText").textContent=state.character.avatar;$("characterName").textContent=state.character.name;$("characterDesc").textContent=`${state.character.desc} ${state.character.line}`;$("eventText").textContent=state.event?`随机事件：${state.event.name}`:"普通遭遇";$("storyTitle").textContent=state.scene.name;$("storyText").textContent=state.story;$("effectText").textContent=state.effect;$("subtitle").textContent=state.air<35?"警告：空气质量红区。":"每回合只随机出现 4 个选项。";$("remindText").textContent=state.remind;$("explodeText").textContent=state.explode;$("escapeText").textContent=state.escape;$("ruleText").textContent=state.hasRule?"有":"无";renderStats();renderInventory();renderActions()}
$("startBtn").addEventListener("click",startGame);
$("restartBtn").addEventListener("click",startGame);
$("againBtn").addEventListener("click",()=>show("startScreen"));
$("continueBtn").addEventListener("click",continueRound);
$("rulesBtn").addEventListener("click",()=>$("modal").classList.remove("hidden"));
$("closeModal").addEventListener("click",()=>$("modal").classList.add("hidden"));
$("modal").addEventListener("click",e=>{if(e.target.id==="modal")$("modal").classList.add("hidden")});