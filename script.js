const MAX_DAY = 7;
const MAX_ROUND = 3;

const scenes = [
  {
    id: "classroom",
    name: "航南教室",
    difficulty: 1.15,
    text: "教室门一开，空气先给你来了个下马威。"
  },
  {
    id: "elevator",
    name: "电梯",
    difficulty: 1.55,
    text: "电梯门合上，副本开始。"
  },
  {
    id: "dorm",
    name: "宿舍",
    difficulty: 1.65,
    text: "你回到宿舍。真正的每日 Boss 刷新了。"
  },
  {
    id: "canteen",
    name: "食堂",
    difficulty: 1.0,
    text: "饭香和奇怪气味同时入场。"
  },
  {
    id: "library",
    name: "自习区",
    difficulty: 1.1,
    text: "自习区很安静，但气味不守规矩。"
  },
  {
    id: "groupMeeting",
    name: "小组讨论",
    difficulty: 1.3,
    text: "PPT 还没打开，空气已经开题。"
  }
];

const dormScene = scenes.find(s => s.id === "dorm");

const characters = [
  {
    id: "winterType",
    name: "冬眠型选手",
    avatar: "🧥",
    base: 55,
    desc: "厚外套、乱头发，坚信冬天不出汗。",
    line: "“冬天不用天天洗吧？”"
  },
  {
    id: "sportType",
    name: "运动直达型",
    avatar: "🏀",
    base: 82,
    desc: "球鞋、短袖、汗味未冷却，刚下球场直达室内。",
    line: "“我就坐一会儿。”"
  },
  {
    id: "sockWizard",
    name: "袜子炼金术士",
    avatar: "🧦",
    base: 92,
    desc: "床边有神秘袜团，疑似正在培养文明。",
    line: "“别动，我还要穿。”"
  },
  {
    id: "perfumeCover",
    name: "香水掩盖派",
    avatar: "🧴",
    base: 72,
    desc: "香水喷得很努力，但底味更努力。",
    line: "“我喷香水了啊。”"
  },
  {
    id: "researchType",
    name: "沉浸学习型",
    avatar: "💻",
    base: 66,
    desc: "电脑不关，人不洗漱，灵感和气味都在持续输出。",
    line: "“洗澡会打断思路。”"
  },
  {
    id: "crowdedType",
    name: "密闭叠加型",
    avatar: "🧍‍♂️",
    base: 96,
    desc: "不是一个人，是一群人。空气直接进入困难模式。",
    line: "“挤一挤就到了。”"
  }
];

const randomEvents = [
  {
    id: "closedRoom",
    name: "门窗紧闭",
    text: "窗户关死了。",
    effect: s => {
      s.air -= 18;
      s.smellLevel += 16;
      return "空气 -18，气味 +16";
    }
  },
  {
    id: "afterSport",
    name: "运动后入场",
    text: "汗味增援抵达。",
    effect: s => {
      s.smellLevel += 30;
      s.patience -= 10;
      return "气味 +30，忍耐 -10";
    }
  },
  {
    id: "sockCritical",
    name: "袜子暴击",
    text: "袜子完成进化。",
    effect: s => {
      s.smellLevel += 42;
      s.sanity -= 20;
      return "气味 +42，理智 -20";
    },
    sceneOnly: "dorm"
  },
  {
    id: "campusWind",
    name: "北航大风",
    text: "风来了，正义来了。",
    effect: s => {
      s.air += 22;
      s.smellLevel -= 18;
      return "空气 +22，气味 -18";
    }
  },
  {
    id: "deadline",
    name: "DDL 压顶",
    text: "你被迫硬学。",
    effect: s => {
      s.study += 16;
      s.hp -= 16;
      return "学习 +16，精神 -16";
    }
  },
  {
    id: "powerOff",
    name: "突然停电",
    text: "黑暗放大了一切。",
    effect: s => {
      s.sanity -= 16;
      s.air -= 12;
      return "理智 -16，空气 -12";
    }
  },
  {
    id: "miracleBath",
    name: "奇迹洗澡",
    text: "有人洗澡了。",
    effect: s => {
      s.smellLevel -= 45;
      s.relationship += 8;
      return "气味 -45，关系 +8";
    }
  }
];

let state = {};

const $ = id => document.getElementById(id);

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getDefaultState() {
  return {
    day: 1,
    round: 1,

    hp: 100,
    air: 100,
    patience: 72,
    courage: 50,
    relationship: 78,
    study: 0,
    cleanliness: 92,
    sanity: 88,

    smellLevel: 65,
    scene: scenes[0],
    character: characters[0],
    event: null,

    maskUses: 1,
    sprayUses: 1,
    mint: 1,
    detergent: 1,
    talkCard: 1,

    hasRule: false,
    remindCount: 0,
    explodeCount: 0,
    escapeCount: 0,
    windowOpened: false,

    message: "",
    effect: "",
    gameOver: false
  };
}

function startGame() {
  state = getDefaultState();
  $("startScreen").classList.remove("active");
  $("endScreen").classList.remove("active");
  $("gameScreen").classList.add("active");
  newEncounter("第一天开始。活下去，顺便学习。");
}

function chooseScene() {
  if (state.round === 3) return dormScene;
  return pick(scenes.filter(s => s.id !== "dorm"));
}

function newEncounter(prefix = "") {
  state.windowOpened = false;
  state.scene = chooseScene();
  state.character = state.scene.id === "dorm"
    ? pick(characters.filter(c => ["sockWizard", "winterType", "researchType", "perfumeCover"].includes(c.id)))
    : pick(characters);

  const base = state.character.base * state.scene.difficulty;
  const noise = Math.floor(Math.random() * 25) - 8;
  const ruleBonus = state.hasRule && state.scene.id === "dorm" ? -32 : 0;
  state.smellLevel = clamp(base + noise + ruleBonus, 15, 100);

  const validEvents = randomEvents.filter(e => !e.sceneOnly || e.sceneOnly === state.scene.id);
  state.event = Math.random() < 0.78 ? pick(validEvents) : null;

  let eventEffect = "无额外事件";
  if (state.event) eventEffect = state.event.effect(state);

  state.message = prefix || state.scene.text;
  state.effect = state.event ? `事件「${state.event.name}」：${state.event.text}｜${eventEffect}` : eventEffect;

  applyPassiveDamage();
  normalizeState();
  render();
  checkImmediateEnd();
}

function applyPassiveDamage(multiplier = 1) {
  const hpLoss = Math.max(5, state.smellLevel * 0.13 * multiplier);
  const airLoss = Math.max(4, state.smellLevel * 0.12 * multiplier);
  const patienceLoss = Math.max(3, state.smellLevel * 0.08 * multiplier);

  state.hp -= hpLoss;
  state.air -= airLoss;
  state.patience -= patienceLoss;
  state.sanity -= state.smellLevel * 0.045 * multiplier;

  if (state.scene.id === "elevator") {
    state.hp -= 8;
    state.sanity -= 8;
  }

  if (state.scene.id === "dorm") {
    state.hp -= 6;
    state.cleanliness -= state.hasRule ? 2 : 7;
    state.relationship -= state.hasRule ? 0 : 2;
  }
}

function normalizeState() {
  ["hp", "air", "patience", "courage", "relationship", "study", "cleanliness", "sanity", "smellLevel"].forEach(key => {
    state[key] = clamp(state[key]);
  });
}

const actions = [
  {
    id: "endure",
    title: "忍了",
    desc: "学习快，但掉状态很疼。",
    available: () => true,
    run: () => {
      state.study += 13;
      state.patience -= 22;
      state.hp -= state.smellLevel * 0.22;
      state.sanity -= 12;
      state.message = "你忍了。知识进脑，气味入魂。";
      state.effect = "学习 +13，忍耐 -22，精神和理智下降。";
    }
  },
  {
    id: "mask",
    title: "戴口罩",
    desc: "仅 1 次，保命强。",
    available: () => state.maskUses > 0,
    run: () => {
      state.maskUses -= 1;
      state.study += 8;
      state.hp -= state.smellLevel * 0.05;
      state.patience -= 4;
      state.message = "你戴上口罩。鼻腔暂时停火。";
      state.effect = "学习 +8，伤害大幅降低，口罩 -1。";
    }
  },
  {
    id: "window",
    title: "开窗",
    desc: "不能在电梯用。",
    available: () => state.scene.id !== "elevator" && !state.windowOpened,
    run: () => {
      state.air += 30;
      state.smellLevel -= 24;
      state.patience += 5;
      state.relationship -= state.scene.id === "dorm" ? 8 : 5;
      state.windowOpened = true;
      state.message = "你开窗。冷风进来，命也回来一点。";
      state.effect = "空气 +30，气味 -24，关系小降。";
    }
  },
  {
    id: "move",
    title: "远离",
    desc: "保命，但耽误学习。",
    available: () => state.scene.id !== "dorm",
    run: () => {
      state.hp += 10;
      state.sanity += 8;
      state.study -= 8;
      state.escapeCount += 1;
      state.message = "你撤到上风口。尊重流体力学。";
      state.effect = "精神 +10，理智 +8，学习 -8，逃离 +1。";
    }
  },
  {
    id: "gentle",
    title: "委婉提醒",
    desc: "稳，但需要勇气。",
    available: () => state.courage >= 14,
    run: () => {
      const hasCard = state.talkCard > 0;
      if (hasCard) state.talkCard -= 1;

      state.smellLevel -= 28;
      state.courage -= 18;
      state.relationship -= hasCard ? 3 : 9;
      state.remindCount += 1;
      state.patience += 5;

      state.message = "你委婉提醒：要不大家注意通风和换洗？";
      state.effect = `气味 -28，勇气 -18，提醒 +1${hasCard ? "，话术卡抵消关系损失。" : "。"}`;
    }
  },
  {
    id: "direct",
    title: "直接开怼",
    desc: "强效，但危险。",
    available: () => true,
    run: () => {
      state.smellLevel -= 50;
      state.relationship -= 38;
      state.courage -= 10;
      state.explodeCount += 1;
      state.message = "你说：能不能洗澡？空气安静了，人也安静了。";
      state.effect = "气味 -50，关系 -38，爆发 +1。";
    }
  },
  {
    id: "spray",
    title: "清新剂",
    desc: "仅 1 次，高污染反噬。",
    available: () => state.sprayUses > 0,
    run: () => {
      state.sprayUses -= 1;
      if (state.smellLevel > 68) {
        state.air -= 28;
        state.sanity -= 22;
        state.message = "清新剂失败。花香和臭味合成新物种。";
        state.effect = "触发反噬：空气 -28，理智 -22。";
        $("sceneVisual").classList.add("shake");
        setTimeout(() => $("sceneVisual").classList.remove("shake"), 350);
      } else {
        state.air += 24;
        state.smellLevel -= 14;
        state.message = "清新剂短暂有效。";
        state.effect = "空气 +24，气味 -14，清新剂 -1。";
      }
    }
  },
  {
    id: "mint",
    title: "薄荷糖",
    desc: "仅 1 次，回精神。",
    available: () => state.mint > 0,
    run: () => {
      state.mint -= 1;
      state.hp += 16;
      state.sanity += 14;
      state.message = "你吃了薄荷糖。续命成功。";
      state.effect = "精神 +16，理智 +14，薄荷糖 -1。";
    }
  },
  {
    id: "detergent",
    title: "洗衣液",
    desc: "宿舍专用，仅 1 次。",
    available: () => state.scene.id === "dorm" && state.detergent > 0,
    run: () => {
      state.detergent -= 1;
      state.air += 20;
      state.smellLevel -= 42;
      state.cleanliness += 8;
      state.message = "洗衣液出场。衣物重新成为衣物。";
      state.effect = "空气 +20，气味 -42，洁净 +8。";
    }
  },
  {
    id: "rule",
    title: "宿舍公约",
    desc: "隐藏结局关键。",
    available: () => state.scene.id === "dorm" && !state.hasRule && state.courage >= 24,
    run: () => {
      state.hasRule = true;
      state.courage -= 24;
      state.relationship -= 12;
      state.remindCount += 1;
      state.air += 12;
      state.smellLevel -= 28;
      state.message = "你提出宿舍公约：通风、换洗、运动后及时处理。";
      state.effect = "长期降低宿舍污染。勇气 -24，关系 -12。";
    }
  }
];

function doAction(actionId) {
  if (state.gameOver) return;
  const action = actions.find(a => a.id === actionId);
  if (!action || !action.available()) return;

  action.run();
  applyPassiveDamage(0.7);
  normalizeState();
  render();

  const ending = getFailureEnding();
  if (ending) {
    endGame(ending);
    return;
  }

  setTimeout(nextTurn, 420);
}

function nextTurn() {
  if (state.gameOver) return;

  if (state.study >= 100 && state.day >= 5) {
    endGame(getSuccessEnding());
    return;
  }

  if (state.round < MAX_ROUND) {
    state.round += 1;
    newEncounter();
  } else {
    endDay();
  }
}

function endDay() {
  state.day += 1;
  state.round = 1;
  state.hp += 6;
  state.patience += 5;
  state.sanity += 3;
  state.cleanliness -= 7;
  state.air = Math.max(state.air, 45);

  normalizeState();

  if (state.day > MAX_DAY) {
    endGame(getSuccessEnding());
  } else {
    newEncounter("新的一天。状态恢复很少，危机继续。");
  }
}

function getFailureEnding() {
  if (state.hp <= 0) return { title: "精神阵亡", text: "你没被考试击倒，但被空气击倒了。" };
  if (state.air <= 0) return { title: "生化警报", text: "空气归零。窗户和洗澡都不是摆设。" };
  if (state.patience <= 0) return { title: "忍耐崩溃", text: "你忍到极限，场面开始不可控。" };
  if (state.relationship <= 0) return { title: "宿舍冷战", text: "气味战赢了，人际关系没了。" };
  if (state.cleanliness <= 0) return { title: "你也成为传说", text: "你忘了自己也要洗澡。屠龙者终成龙。" };
  if (state.sanity <= 0) return { title: "鼻腔飞升", text: "你闻不到了，不是赢了，是系统离线了。" };
  return null;
}

function getSuccessEnding() {
  if (state.hasRule && state.remindCount >= 4 && state.relationship > 40) {
    return { title: "隐藏结局：文明宿舍倡议人", text: "你用沟通和规则解决了长期问题。高级，真的高级。" };
  }
  if (state.study >= 100 && state.remindCount >= 3 && state.relationship > 45 && state.sanity > 35) {
    return { title: "最佳结局：清新航南", text: "你完成学习，也守住了空气。文明从一次换洗开始。" };
  }
  if (state.escapeCount >= 5) {
    return { title: "回避型生存", text: "你靠上风口活了下来。没解决问题，但很会保命。" };
  }
  if (state.explodeCount >= 3) {
    return { title: "爆发型勇士", text: "爽文路线达成，社交余震也达成。" };
  }
  return { title: "普通结局：成功存活", text: "你撑过一周。建议奖励自己一口新鲜空气。" };
}

function checkImmediateEnd() {
  const ending = getFailureEnding();
  if (ending) endGame(ending);
}

function endGame(ending) {
  state.gameOver = true;
  $("gameScreen").classList.remove("active");
  $("endScreen").classList.add("active");
  $("endingTitle").textContent = ending.title;
  $("endingText").textContent = ending.text;
  $("endingStats").innerHTML = `
    <div><span>学习</span><strong>${state.study}</strong></div>
    <div><span>空气</span><strong>${state.air}</strong></div>
    <div><span>精神</span><strong>${state.hp}</strong></div>
    <div><span>忍耐</span><strong>${state.patience}</strong></div>
    <div><span>关系</span><strong>${state.relationship}</strong></div>
    <div><span>提醒</span><strong>${state.remindCount}</strong></div>
  `;
}

function statColor(value) {
  if (value <= 25) return "linear-gradient(90deg, #ef4444, #f97316)";
  if (value <= 55) return "linear-gradient(90deg, #f59e0b, #facc15)";
  return "linear-gradient(90deg, #5d7cff, #7c3aed)";
}

function renderStats() {
  const stats = [
    ["空气质量", state.air],
    ["精神值", state.hp],
    ["忍耐值", state.patience],
    ["学习进度", state.study],
    ["社交勇气", state.courage],
    ["人际关系", state.relationship],
    ["自身洁净度", state.cleanliness],
    ["理智值", state.sanity]
  ];

  $("stats").innerHTML = stats.map(([name, value]) => `
    <div class="stat">
      <div class="stat-head"><span>${name}</span><strong>${value}</strong></div>
      <div class="bar"><div style="width:${value}%; background:${statColor(value)}"></div></div>
    </div>
  `).join("");
}

function renderInventory() {
  const items = [
    `😷 口罩 × ${state.maskUses}`,
    `🌫️ 清新剂 × ${state.sprayUses}`,
    `🍃 薄荷糖 × ${state.mint}`,
    `🧴 洗衣液 × ${state.detergent}`,
    `💬 话术卡 × ${state.talkCard}`,
    state.hasRule ? "📜 公约：有" : "📜 公约：无"
  ];

  $("inventory").innerHTML = `<div class="inventory">${items.map(i => `<span class="item">${i}</span>`).join("")}</div>`;
}

function renderActions() {
  $("actions").innerHTML = actions.map(action => {
    const ok = action.available();
    return `
      <button class="action-btn" ${ok ? "" : "disabled"} onclick="doAction('${action.id}')">
        <strong>${action.title}</strong>
        <span>${action.desc}</span>
      </button>
    `;
  }).join("");
}

function render() {
  $("dayNum").textContent = state.day;
  $("roundNum").textContent = state.round;
  $("sceneName").textContent = state.scene.name;
  $("smellBadge").textContent = `气味强度 ${state.smellLevel}`;

  $("avatar").textContent = state.character.avatar;
  $("characterName").textContent = state.character.name;
  $("characterDesc").textContent = `${state.character.desc} ${state.character.line}`;

  $("eventLabel").textContent = state.event ? `事件：${state.event.name}` : "普通遭遇";
  $("storyTitle").textContent = `${state.scene.name}`;
  $("storyText").textContent = state.message;
  $("effectText").textContent = state.effect;
  $("subtitle").textContent = state.air < 35 ? "警告：空气质量红区。" : "硬核模式：请谨慎选择。";

  $("remindCount").textContent = state.remindCount;
  $("explodeCount").textContent = state.explodeCount;
  $("escapeCount").textContent = state.escapeCount;
  $("ruleState").textContent = state.hasRule ? "有" : "无";

  renderStats();
  renderInventory();
  renderActions();
}

$("startBtn").addEventListener("click", startGame);
$("restartBtn").addEventListener("click", restartGame);
$("againBtn").addEventListener("click", () => {
  $("endScreen").classList.remove("active");
  $("startScreen").classList.add("active");
});
$("helpBtn").addEventListener("click", () => $("modal").classList.remove("hidden"));
$("closeModal").addEventListener("click", () => $("modal").classList.add("hidden"));
$("modal").addEventListener("click", e => {
  if (e.target.id === "modal") $("modal").classList.add("hidden");
});
