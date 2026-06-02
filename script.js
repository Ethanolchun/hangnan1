const MAX_DAY = 7;
const MAX_ROUND = 3;

const scenes = [
  {
    id: "classroom",
    name: "航南教室",
    emoji: "📚",
    difficulty: 1.0,
    intro: "你走进教室，黑板还没擦，窗户却关得像保险柜。空气里有一种沉重的历史感。"
  },
  {
    id: "elevator",
    name: "电梯",
    emoji: "🛗",
    difficulty: 1.35,
    intro: "电梯门缓缓合上。你意识到，这不是交通工具，这是一个随机匹配的密闭副本。"
  },
  {
    id: "dorm",
    name: "宿舍",
    emoji: "🛏️",
    difficulty: 1.25,
    intro: "你回到宿舍。桌面很安静，地面很安静，只有角落里的袜子像在进行生命活动。"
  },
  {
    id: "canteen",
    name: "食堂",
    emoji: "🍜",
    difficulty: 0.9,
    intro: "你端着饭寻找座位。饭香、人群和不可名状的气味在空气里开会。"
  },
  {
    id: "library",
    name: "自习区",
    emoji: "📖",
    difficulty: 0.95,
    intro: "你来到自习区。这里安静得连翻书声都很谨慎，但气味并不遵守图书馆纪律。"
  },
  {
    id: "groupMeeting",
    name: "小组讨论",
    emoji: "🧑‍💻",
    difficulty: 1.15,
    intro: "小组围坐讨论展示。PPT 还没打开，空气已经开始做开题报告。"
  },
  {
    id: "corridor",
    name: "走廊",
    emoji: "🚪",
    difficulty: 0.75,
    intro: "走廊有风，这是今日份稀有资源。你短暂地相信世界仍有救。"
  }
];

const smellSources = [
  {
    id: "winterType",
    name: "冬眠型选手",
    base: 45,
    text: "有人坚信冬天不会出汗，所以洗澡可以进入低频维护模式。"
  },
  {
    id: "sportType",
    name: "运动直达型",
    base: 70,
    text: "刚运动完的气息未经任何处理，直接抵达公共空间。"
  },
  {
    id: "sockWizard",
    name: "袜子炼金术士",
    base: 80,
    text: "某双袜子似乎已经不属于纺织品，而属于实验样本。"
  },
  {
    id: "perfumeCover",
    name: "香水掩盖派",
    base: 60,
    text: "香水试图力挽狂澜，但它面对的是一整套复杂生态系统。"
  },
  {
    id: "researchType",
    name: "沉浸学习型",
    base: 55,
    text: "有人认为洗澡会打断思路，显然他的思路很坚固。"
  },
  {
    id: "crowdedType",
    name: "密闭叠加型",
    base: 90,
    text: "空间小、人数多、空气流动弱，三者合体打出了组合技。"
  },
  {
    id: "normalType",
    name: "普通闷热型",
    base: 25,
    text: "倒也没有特别严重，只是空气有点不想上班。"
  }
];

const randomEvents = [
  {
    id: "closedRoom",
    name: "门窗紧闭",
    text: "门窗紧闭，空气开始循环播放自己。",
    effect: s => {
      s.air -= 12;
      s.smellLevel += 10;
      return "空气质量 -12，气味强度 +10";
    }
  },
  {
    id: "afterSport",
    name: "体育课刚下课",
    text: "一批刚运动完的同学进入场景，空气忽然有了肌肉记忆。",
    effect: s => {
      s.smellLevel += 22;
      s.patience -= 5;
      return "气味强度 +22，忍耐值 -5";
    }
  },
  {
    id: "sockCritical",
    name: "袜子暴击",
    text: "角落里的一双袜子完成了从衣物到地貌的进化。",
    effect: s => {
      s.smellLevel += 30;
      s.sanity -= 12;
      return "气味强度 +30，理智值 -12";
    },
    sceneOnly: "dorm"
  },
  {
    id: "campusWind",
    name: "北航大风",
    text: "一阵风穿过走廊。它很冷，但它正义。",
    effect: s => {
      s.air += 25;
      s.smellLevel -= 15;
      return "空气质量 +25，气味强度 -15";
    }
  },
  {
    id: "roomCheck",
    name: "卫生检查传闻",
    text: "据说要查卫生，公共区域突然出现了短暂文明。",
    effect: s => {
      s.air += 18;
      s.relationship += 4;
      s.smellLevel -= 12;
      return "空气质量 +18，关系 +4，气味强度 -12";
    },
    sceneOnly: "dorm"
  },
  {
    id: "deadline",
    name: "DDL 压顶",
    text: "小组作业 DDL 逼近，你决定暂时把鼻子交给命运。",
    effect: s => {
      s.study += 18;
      s.hp -= 8;
      return "学习进度 +18，精神值 -8";
    }
  },
  {
    id: "powerOff",
    name: "突然停电",
    text: "灯灭的一瞬间，空气仿佛也开始放飞自我。",
    effect: s => {
      s.sanity -= 8;
      s.air -= 8;
      return "理智值 -8，空气质量 -8";
    }
  },
  {
    id: "miracleBath",
    name: "奇迹洗澡",
    text: "有人主动洗澡并更换衣物。你短暂地看见了文明的曙光。",
    effect: s => {
      s.smellLevel -= 40;
      s.relationship += 8;
      s.patience += 8;
      return "气味强度 -40，关系 +8，忍耐值 +8";
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
    patience: 80,
    courage: 52,
    relationship: 82,
    study: 0,
    cleanliness: 100,
    sanity: 100,
    smellLevel: 50,
    scene: scenes[0],
    source: smellSources[0],
    event: null,
    hasMask: true,
    maskUses: 4,
    hasSpray: true,
    sprayUses: 3,
    mint: 2,
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
  newEncounter("欢迎来到航南生存挑战。今天的目标：完成任务，并保住鼻子的尊严。");
}

function restartGame() {
  startGame();
}

function newEncounter(prefix = "") {
  state.windowOpened = false;
  state.scene = pick(scenes);
  state.source = pick(smellSources);

  const base = state.source.base * state.scene.difficulty;
  const randomNoise = Math.floor(Math.random() * 21) - 10;
  const ruleBonus = state.hasRule && state.scene.id === "dorm" ? -25 : 0;
  state.smellLevel = clamp(base + randomNoise + ruleBonus, 5, 100);

  const validEvents = randomEvents.filter(e => !e.sceneOnly || e.sceneOnly === state.scene.id);
  state.event = Math.random() < 0.72 ? pick(validEvents) : null;

  let eventEffect = "";
  if (state.event) {
    eventEffect = state.event.effect(state);
  }

  state.message = prefix || `${state.scene.intro} ${state.source.text}`;
  state.effect = state.event ? `随机事件「${state.event.name}」：${state.event.text}｜${eventEffect}` : "本回合没有额外随机事件。空气保持表面平静。";

  applyPassiveDamage();
  normalizeState();
  render();
  checkImmediateEnd();
}

function applyPassiveDamage(multiplier = 1) {
  const damage = Math.max(2, state.smellLevel * 0.08 * multiplier);
  const airLoss = Math.max(2, state.smellLevel * 0.06 * multiplier);

  state.hp -= damage;
  state.air -= airLoss;
  state.patience -= state.smellLevel * 0.035 * multiplier;

  if (state.scene.id === "elevator") {
    state.hp -= 4;
    state.sanity -= 3;
  }

  if (state.scene.id === "dorm" && !state.hasRule) {
    state.cleanliness -= 2;
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
    desc: "学习推进，但精神与忍耐下降。",
    available: () => true,
    run: () => {
      state.study += 12;
      state.patience -= 14;
      state.hp -= state.smellLevel * 0.16;
      state.sanity -= 6;
      state.message = "你选择了沉默。知识进入了大脑，气味也进入了灵魂。";
      state.effect = "学习进度 +12，忍耐值 -14，精神值受气味影响下降。";
    }
  },
  {
    id: "mask",
    title: "戴口罩",
    desc: "减少伤害，消耗一次口罩耐久。",
    available: () => state.hasMask && state.maskUses > 0,
    run: () => {
      state.maskUses -= 1;
      state.study += 9;
      state.hp -= state.smellLevel * 0.06;
      state.patience -= 3;
      state.courage -= 2;
      state.message = "你戴上口罩。这是理智与鼻腔达成的停火协议。";
      state.effect = "学习进度 +9，气味伤害大幅降低，口罩耐久 -1。";
    }
  },
  {
    id: "window",
    title: "开窗通风",
    desc: "提升空气，可能轻微影响关系。",
    available: () => state.scene.id !== "elevator" && !state.windowOpened,
    run: () => {
      state.air += 28;
      state.smellLevel -= 20;
      state.patience += 6;
      state.relationship -= state.scene.id === "library" ? 8 : 4;
      state.windowOpened = true;
      state.message = "你打开窗户。风冲进来了，带着一点冷，但至少是活的。";
      state.effect = "空气质量 +28，气味强度 -20，关系小幅下降。";
    }
  },
  {
    id: "move",
    title: "换座 / 远离",
    desc: "保命优先，但耽误任务。",
    available: () => state.scene.id !== "dorm",
    run: () => {
      state.hp += 8;
      state.sanity += 5;
      state.study -= 4;
      state.escapeCount += 1;
      state.message = "你迅速移动到上风口。你不是逃兵，你只是尊重流体力学。";
      state.effect = "精神值 +8，理智值 +5，学习进度 -4，逃离次数 +1。";
    }
  },
  {
    id: "gentle",
    title: "委婉提醒",
    desc: "长期收益高，消耗勇气。",
    available: () => state.courage >= 12,
    run: () => {
      const hasCard = state.talkCard > 0;
      if (hasCard) state.talkCard -= 1;
      state.smellLevel -= 24;
      state.courage -= 14;
      state.relationship -= hasCard ? 2 : 6;
      state.remindCount += 1;
      state.patience += 5;
      state.message = "你说：“最近大家运动和学习都挺累的，要不我们注意一下通风和换洗？”这句话绕了三圈，终于落在卫生问题上。";
      state.effect = `气味强度 -24，勇气 -14，提醒次数 +1${hasCard ? "，委婉话术卡抵消了大部分关系损失。" : "。"}`;
    }
  },
  {
    id: "direct",
    title: "直接开怼",
    desc: "短期强力，但关系掉得快。",
    available: () => true,
    run: () => {
      state.smellLevel -= 42;
      state.relationship -= 30;
      state.courage -= 8;
      state.explodeCount += 1;
      state.message = "你终于说出了那句：“能不能注意一下个人卫生？”空气安静了，人际关系也安静了。";
      state.effect = "气味强度 -42，关系 -30，爆发次数 +1。爽是爽了，但后劲不小。";
    }
  },
  {
    id: "spray",
    title: "空气清新剂",
    desc: "低污染有效，高污染反噬。",
    available: () => state.hasSpray && state.sprayUses > 0,
    run: () => {
      state.sprayUses -= 1;
      if (state.smellLevel > 70) {
        state.air -= 22;
        state.sanity -= 14;
        state.message = "你使用了空气清新剂。系统提示：不要把玫瑰种在沼气池上。";
        state.effect = "触发「香臭混合态」：空气质量 -22，理智值 -14，清新剂 -1。";
        $("sceneVisual").classList.add("shake");
        setTimeout(() => $("sceneVisual").classList.remove("shake"), 350);
      } else {
        state.air += 22;
        state.smellLevel -= 10;
        state.message = "你使用了空气清新剂。它短暂地证明，科技仍然值得相信。";
        state.effect = "空气质量 +22，气味强度 -10，清新剂 -1。";
      }
    }
  },
  {
    id: "mint",
    title: "薄荷糖续命",
    desc: "恢复精神和理智。",
    available: () => state.mint > 0,
    run: () => {
      state.mint -= 1;
      state.hp += 14;
      state.sanity += 12;
      state.message = "你含下一颗薄荷糖。鼻腔没有完全胜利，但至少签了临时停战协议。";
      state.effect = "精神值 +14，理智值 +12，薄荷糖 -1。";
    }
  },
  {
    id: "detergent",
    title: "洗衣液净化",
    desc: "宿舍特攻，减少长期污染。",
    available: () => state.scene.id === "dorm" && state.detergent > 0,
    run: () => {
      state.detergent -= 1;
      state.air += 18;
      state.smellLevel -= 34;
      state.cleanliness += 6;
      state.message = "你掏出洗衣液。某些衣物终于从考古文物回到了日用品身份。";
      state.effect = "空气质量 +18，气味强度 -34，自身洁净度 +6，洗衣液 -1。";
    }
  },
  {
    id: "rule",
    title: "制定宿舍公约",
    desc: "隐藏好结局关键。",
    available: () => state.scene.id === "dorm" && !state.hasRule && state.courage >= 25,
    run: () => {
      state.hasRule = true;
      state.courage -= 22;
      state.relationship -= 8;
      state.remindCount += 1;
      state.air += 10;
      state.smellLevel -= 22;
      state.message = "你提出宿舍卫生公约：通风、换洗、运动后及时处理。规则一出，空气第一次有了制度保障。";
      state.effect = "建立长期机制：之后宿舍气味生成降低。勇气 -22，关系 -8，提醒次数 +1。";
    }
  }
];

function doAction(actionId) {
  if (state.gameOver) return;
  const action = actions.find(a => a.id === actionId);
  if (!action || !action.available()) return;

  action.run();
  applyPassiveDamage(0.55);
  normalizeState();
  render();

  const ending = getFailureEnding();
  if (ending) {
    endGame(ending);
    return;
  }

  setTimeout(nextTurn, 520);
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
  state.hp += 10;
  state.patience += 8;
  state.sanity += 5;
  state.cleanliness -= 4;
  state.air = Math.max(state.air, 52);

  normalizeState();

  if (state.day > MAX_DAY) {
    endGame(getSuccessEnding());
  } else {
    newEncounter(`你撑过了一天。睡眠恢复了一点精神，但洁净度也在提醒你：公共卫生从自己开始。`);
  }
}

function getFailureEnding() {
  if (state.hp <= 0) {
    return {
      title: "精神阵亡",
      text: "你完成了部分任务，但鼻腔和灵魂都表示需要休庭。公共空间卫生不是小事，它会真实消耗每个人的精力。"
    };
  }
  if (state.air <= 0) {
    return {
      title: "生化警报",
      text: "空气质量归零。你终于理解，窗户不是装饰品，通风也不是玄学。"
    };
  }
  if (state.patience <= 0) {
    return {
      title: "忍耐崩溃",
      text: "你忍到最后，终于喊出了心里话。问题也许解决了一点，但场面一度非常安静。"
    };
  }
  if (state.relationship <= 0) {
    return {
      title: "宿舍冷战",
      text: "你赢下了气味战争的一小局，却输掉了人际关系的大地图。下次也许需要更聪明的话术。"
    };
  }
  if (state.cleanliness <= 0) {
    return {
      title: "你也成为传说",
      text: "你一直在嫌弃别人，却忘了自己也需要洗澡和换衣服。屠龙者终成龙，太抽象了。"
    };
  }
  if (state.sanity <= 0) {
    return {
      title: "鼻腔飞升",
      text: "你已经闻不到味道了。不是空气变好了，是你的感知系统选择了离线。"
    };
  }
  return null;
}

function getSuccessEnding() {
  if (state.hasRule && state.remindCount >= 4 && state.relationship > 45) {
    return {
      title: "隐藏结局：文明宿舍倡议人",
      text: "你没有只靠愤怒解决问题，而是用沟通和规则降低了长期污染。一个人的清洁习惯，也可以被制度设计轻轻推一把。"
    };
  }
  if (state.study >= 100 && state.remindCount >= 3 && state.relationship > 50 && state.sanity > 45) {
    return {
      title: "最佳结局：清新航南",
      text: "你完成了学习任务，也守住了空气质量。你证明了：公共空间的文明，可以从一次开窗、一次提醒、一次换洗开始。"
    };
  }
  if (state.escapeCount >= 5) {
    return {
      title: "回避型生存",
      text: "你凭借对上风口和逃生路线的精准把握活了下来。严格来说，这不是解决问题，但确实很会保命。"
    };
  }
  if (state.explodeCount >= 3) {
    return {
      title: "爆发型勇士",
      text: "你多次正面开怼，短期效果显著，社交余震也很显著。爽文路线达成。"
    };
  }
  if (state.sanity < 45) {
    return {
      title: "麻木适应",
      text: "你完成了一周生存，但已经对空气质量不再抱有世俗欲望。恭喜通关，也建议休息。"
    };
  }
  return {
    title: "普通结局：成功存活",
    text: "你撑过了一周。虽然没有彻底改变环境，但你学会了口罩、通风、沟通和撤退的组合技。"
  };
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
    <div><span>学习进度</span><strong>${state.study}</strong></div>
    <div><span>空气质量</span><strong>${state.air}</strong></div>
    <div><span>精神值</span><strong>${state.hp}</strong></div>
    <div><span>忍耐值</span><strong>${state.patience}</strong></div>
    <div><span>人际关系</span><strong>${state.relationship}</strong></div>
    <div><span>提醒次数</span><strong>${state.remindCount}</strong></div>
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
    state.hasRule ? "📜 宿舍公约 已建立" : "📜 宿舍公约 未建立"
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
  $("airEmoji").textContent = state.scene.emoji;
  $("eventLabel").textContent = state.event ? `随机事件：${state.event.name}` : "普通遭遇";
  $("storyTitle").textContent = `${state.scene.name}｜${state.source.name}`;
  $("storyText").textContent = `${state.message} ${state.source.text}`;
  $("effectText").textContent = state.effect;
  $("subtitle").textContent = state.air < 35 ? "警告：空气质量进入红区。" : "公共空间卫生外部性观察中……";

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
