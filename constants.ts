
import { VerbalAtom, SoundCard, GenerationSlot } from './types';

// -----------------------------------------------------------------------------
// 1. 定义 300 个母句「生成位」(Pressure Points / Slots)
// -----------------------------------------------------------------------------

const RAW_SLOTS = [
  // A. 未开口阶段 (1-20)
  "刚被点名", "轮到自己说话", "被突然看向", "被问“你怎么看”", "被要求表态", "被要求决定", "被要求介绍自己", "被要求用英语说第一句", "被要求重复刚才的话", "意识到“大家在等”", "意识到“不说不行”", "话到嘴边卡住", "想好了但不敢说", "不确定说什么合适", "担心说错", "担心被误解", "担心被评价", "担心升级关系", "想逃离但还在场", "开口前最后一秒",
  // B. 第一声之后 (21-40)
  "刚说完第一句", "声音发出来了", "觉得自己说得很怪", "对方还没回应", "空气突然安静", "对方皱眉", "对方沉默", "对方点头但没说话", "不知道该不该继续", "想补充解释", "想修正刚才那句话", "想道歉", "想撤回", "想笑着化解", "想马上结束", "心跳加快", "意识到“我已经说了”", "意识到“不能当没发生”", "需要第二句", "第二句不知道怎么接",
  // C. 状态占位 (41-60)
  "想说明当下状态", "不想解释原因", "状态不稳定", "精力不足", "情绪一般", "没准备好", "正在想", "需要缓冲", "需要暂停", "需要时间", "不在最佳状态", "不想被追问", "不想深入", "想留在表面", "想先站住位置", "不想推进", "不想后退", "只想被放过", "想保持中性", "想让局面冷却",
  // D. 需求表达 (61-80)
  "需要时间", "需要帮助", "需要空间", "需要慢下来", "需要暂停", "需要澄清", "需要改变节奏", "需要重新来", "不需要更多信息", "不需要现在决定", "不需要解释", "不需要继续", "不需要回应", "不需要被说服", "不需要被安慰", "不需要被指导", "不需要被评估", "不需要被纠正", "不需要被推进", "不需要被定义",
  // E. 犹豫与保留 (81-100)
  "还没想好", "还没决定", "还不确定", "需要再看看", "想再等等", "想保留判断", "不想现在定", "不想被逼", "不想给答案", "不想承诺", "不想表态", "不想站队", "不想升级", "不想否定", "不想肯定", "想保持开放", "想让事情悬着", "想延后", "想模糊", "想留白",
  // F. 日常拒绝 (101-120)
  "不想现在做", "不想参与", "不想继续", "不想答应", "不想配合", "不想跟进", "不想深入", "不想讨论", "不想解释", "不想确认", "不想改变", "不想推进", "不想承接", "不想负责", "不想被拉入", "不想被卷入", "不想被代表", "不想被引用", "不想被绑定", "不想被继续问",
  // G. 情绪低载体 (121-140)
  "感觉不太对", "有点过了", "不太舒服", "有点奇怪", "有点多", "有点快", "有点重", "有点乱", "有点偏", "有点危险", "有点失控", "有点越界", "有点勉强", "有点尴尬", "有点紧", "有点压", "有点累", "有点烦", "有点冷", "有点空",
  // H. 关系维护 (141-160)
  "想稍后再说", "想换个时间", "想留到下次", "想暂停但不结束", "想保持联系", "想缓和", "想冷处理", "想给空间", "想让关系活着", "想避免冲突", "想避免伤害", "想避免升级", "想避免摊牌", "想避免对立", "想避免误会", "想暂时放下", "想先搁置", "想回头再看", "想不把话说死", "想留余地",
  // I. 使用权位 (161-180)
  "表示“行”", "表示“看情况”", "表示“无所谓”", "表示“先这样”", "表示“还行”", "表示“算了”", "表示“再说”", "表示“等等看”", "表示“就这样吧”", "表示“到此为止”", "表示“没感觉”", "表示“不是现在”", "表示“有点勉强”", "表示“凑合”", "表示“差不多”", "表示“随便”", "表示“看你”", "表示“再议”", "表示“未定”", "表示“保留”",
  // J. 试探 (181-200)
  "想确认对方立场", "想确认对方意图", "想确认对方是否认真", "想确认对方是否意识到后果", "想确认对方是否在回避", "想确认对方是否清楚", "想确认对方是否同意", "想确认对方是否改变", "想确认对方是否准备好", "想确认对方是否愿意继续", "想试探边界", "想打开不安全话题", "想测试关系弹性", "想让对方表态", "想让对方露底", "想让对方停顿", "想让对方回应", "想让对方选择", "想让对方接球", "想看下一步",
  // K. 暴露 (201-220)
  "承认不安全", "承认不信任", "承认不舒服", "承认害怕", "承认拒绝", "承认不同意", "承认不接受", "承认不愿继续", "承认关系有问题", "承认情况失控", "承认界限被越过", "承认期待落空", "承认误判", "承认犹豫", "承认矛盾", "承认不想配合", "承认不再相信", "承认需要退出", "承认不想说清楚", "承认无法继续",
  // L. 推进 / 对抗 / 退出 (221-240)
  "要求面对问题", "要求改变", "要求决定", "指出回避", "指出不一致", "指出责任", "指出界限", "拒绝被推", "拒绝被转移", "拒绝被操控", "终止对话", "离开现场", "结束关系", "中断进程", "切断话题", "拒绝继续", "明确立场", "明确后果", "明确不再让步", "明确这是最后一次",
  // M. 未完成 / 悬置 (241-260)
  "明确未解决", "明确未结束", "明确需要时间", "明确不收尾", "明确不下结论", "明确保持开放", "明确暂停", "明确搁置", "明确关系悬空", "明确话题未完", "明确之后再谈", "明确不急", "明确不逼", "明确不继续追", "明确不关闭", "明确不逃避", "明确不解释", "明确不定义", "明确不定性", "明确不终结",
  // N. 40 个高危 / 元位 (261-300)
  "语言开始失效", "沉默比说话更强", "说话本身成为风险", "表达无效感出现", "对话变成博弈", "语言被用来控制", "语言被用来逃避", "语言成为负担", "不说比说安全", "说了也改变不了", "对方不再回应", "对话进入死局", "关系进入临界", "信任断裂", "语言边界显现", "认知边界被碰到", "自我暴露达到上限", "无法继续解释", "无法继续争论", "无法继续扮演", "角色崩塌", "面具掉落", "表达失效", "意义感崩溃", "行动替代语言", "退出成为唯一选项", "沉默成为答案", "不可说之物出现", "语言终点", "对白结束点", "再说已无意义", "不再需要句子", "关系进入新态", "自我位置重构", "不再需要回应", "不再需要确认", "不再需要语言", "回到行动", "回到沉默", "结束"
];

function getCategory(index: number): string {
  if (index < 20) return "未开口阶段";
  if (index < 40) return "第一声之后";
  if (index < 60) return "状态占位";
  if (index < 80) return "需求表达";
  if (index < 100) return "犹豫与保留";
  if (index < 120) return "日常拒绝";
  if (index < 140) return "情绪低载体";
  if (index < 160) return "关系维护";
  if (index < 180) return "使用权位";
  if (index < 200) return "试探";
  if (index < 220) return "暴露";
  if (index < 240) return "推进/对抗/退出";
  if (index < 260) return "未完成/悬置";
  return "元位";
}

export const GENERATION_SLOTS: GenerationSlot[] = RAW_SLOTS.map((desc, i) => ({
  id: `${i + 1}`,
  category: getCategory(i),
  description: desc
}));

// -----------------------------------------------------------------------------
// 2. 映射母句内容 (仅保留有意义的内容，过滤 Sample 占位符)
// -----------------------------------------------------------------------------

const SLOTS_CONTENT_MAP: Record<string, Partial<VerbalAtom>> = {
  // A. 未开口
  "1": { native: "Give me a second.", intent: "等我一下。", fuzzy: "GIV mi a SE-kənd" },
  "2": { native: "It's my turn.", intent: "轮到我了。", fuzzy: "ɪts may TERN" },
  "3": { native: "What are we looking at?", intent: "我们在看什么？", fuzzy: "WʌT ar wi Lʊ-kɪŋ at" },
  "4": { native: "Let me think.", intent: "让我想想。", fuzzy: "LET mi θɪŋk" },
  "5": { native: "I'm not sure yet.", intent: "我还不确定。", fuzzy: "aym NAT ʃʊr YET" },
  "6": { native: "I'll decide later.", intent: "我晚点决定。", fuzzy: "ayl dɪ-SAYD LEY-tər" },
  "7": { native: "I'm just Alan.", intent: "我就是阿兰。", fuzzy: "aym dʒʌst A-lən" },
  "8": { native: "Hello everyone.", intent: "大家好。", fuzzy: "hə-LO EV-ri-wʌn" },
  "9": { native: "Could you say that again?", intent: "能再说一遍吗？", fuzzy: "kʊd yu SEY ðat ə-GEN" },
  "10": { native: "I'm ready now.", intent: "我准备好了。", fuzzy: "aym RE-di NAW" },
  "11": { native: "I have to say this.", intent: "我必须说这个。", fuzzy: "ay HAV tə SEY ðɪs" },
  "12": { native: "Wait, I lost it.", intent: "等下，我忘了（想说什么）。", fuzzy: "WEYT, ay LƆST ɪt" },
  "13": { native: "I'm speaking up.", intent: "我要开口了。", fuzzy: "aym SPI-kɪŋ ʌP" },
  "14": { native: "Is this okay?", intent: "这样说行吗？", fuzzy: "ɪz ðɪs o-KEY" },
  "15": { native: "I might be wrong.", intent: "我也许错了。", fuzzy: "ay MAYT bi RƆŊ" },
  "16": { native: "You know what I mean.", intent: "你知道我的意思。", fuzzy: "yu NO wʌt ay MIN" },
  "17": { native: "It's just my opinion.", intent: "只是我的观点。", fuzzy: "ɪts dʒʌst may ə-PɪN-yən" },
  "18": { native: "I'm moving forward.", intent: "我在往前走（推进关系）。", fuzzy: "aym MU-vɪŋ FƆR-wərd" },
  "19": { native: "I'm still here.", intent: "我还在这。", fuzzy: "aym STɪL hɪr" },
  "20": { native: "Here we go.", intent: "开始了。", fuzzy: "hɪr wi GO" },

  // B. 第一声之后
  "21": { native: "That was it.", intent: "就这样。", fuzzy: "ðat wʌz ɪt" },
  "22": { native: "Did you hear me?", intent: "你听见了吗？", fuzzy: "DɪD yu hɪr mi" },
  "23": { native: "That sounded weird.", intent: "刚才听起来很怪。", fuzzy: "ðat SAWN-dəd WɪRD" },
  "24": { native: "Are you there?", intent: "你在听吗？", fuzzy: "ar yu ðer" },
  "25": { native: "Keep it simple.", intent: "简单点。", fuzzy: "KIP ɪt SɪM-pəl" },
  "26": { native: "Don't look at me like that.", intent: "别那样看着我。", fuzzy: "dont LʊK at mi LAYK ðat" },
  "27": { native: "Say something.", intent: "说点什么。", fuzzy: "SEY SʌM-θɪŋ" },
  "28": { native: "I see you nodding.", intent: "我看到你在点头。", fuzzy: "ay SI yu NA-dɪŋ" },
  "29": { native: "Should I go on?", intent: "我要继续吗？", fuzzy: "ʃʊd ay GO ON" },
  "30": { native: "Let me explain.", intent: "让我解释下。", fuzzy: "LET mi ɪk-SPLEYN" },
  "31": { native: "Wait, scratch that.", intent: "等下，收回刚才那句。", fuzzy: "WEYT, SKRATCH ðat" },
  "32": { native: "My bad.", intent: "我的错。", fuzzy: "may BAD" },
  "33": { native: "Forget it.", intent: "算了。", fuzzy: "fər-GET ɪt" },
  "34": { native: "Just kidding.", intent: "开玩笑的。", fuzzy: "dʒʌst Kɪ-dɪŋ" },
  "35": { native: "I'm done.", intent: "我说完了。", fuzzy: "aym DʌN" },
  "36": { native: "I'm a bit nervous.", intent: "我有点紧张。", fuzzy: "aym a bɪt NER-vəs" },
  "37": { native: "I said it.", intent: "我说了。", fuzzy: "ay SED ɪt" },
  "38": { native: "It's out now.", intent: "话已经出口了。", fuzzy: "ɪts AWT NAW" },
  "39": { native: "One more thing.", intent: "还有一件事。", fuzzy: "wʌn MƆR θɪŋ" },
  "40": { native: "Your turn.", intent: "该你了。", fuzzy: "YƆR TERN" },

  // C. 状态占位
  "41": { native: "I'm here now.", intent: "我现在在这。", fuzzy: "aym HɪR NAW" },
  "42": { native: "Because I want to.", intent: "因为我想这么做。", fuzzy: "bɪ-KƆZ ay WANT TU" },
  "43": { native: "Everything is changing.", intent: "一切都在变。", fuzzy: "EV-ri-θɪŋ ɪz CHEYN-dʒɪŋ" },
  "44": { native: "I'm out of energy.", intent: "我没能量了。", fuzzy: "aym AWT əv E-nər-dʒi" },
  "45": { native: "I'm okay.", intent: "我还可以。", fuzzy: "aym o-KEY" },
  "46": { native: "Not ready yet.", intent: "还没准备好。", fuzzy: "NAT RE-di YET" },
  "47": { native: "I'm processing.", intent: "我在处理（想）。", fuzzy: "aym PRA-se-sɪŋ" },
  "48": { native: "Hold on.", intent: "稍等。", fuzzy: "HOLD ON" },
  "49": { native: "Let's pause.", intent: "暂停下。", fuzzy: "lets PƆZ" },
  "50": { native: "Time out.", intent: "休战/暂停。", fuzzy: "TAYM AWT" },

  // I. 使用权位 (161-180)
  "161": { native: "It's fine.", intent: "行。", fuzzy: "ɪts FAYN" },
  "162": { native: "It depends.", intent: "看情况。", fuzzy: "ɪt dɪ-PENDZ" },
  "163": { native: "Whatever.", intent: "无所谓。", fuzzy: "wʌt-EV-ər" },
  "164": { native: "Let's leave it.", intent: "先这样吧。", fuzzy: "lets LIV ɪt" },
  "165": { native: "Not bad.", intent: "还行。", fuzzy: "NAT BAD" },
  "166": { native: "Never mind.", intent: "算了。", fuzzy: "NE-vər MAYND" },
  "167": { native: "We'll see.", intent: "再说。", fuzzy: "wil SI" },
  "168": { native: "Wait and see.", intent: "等等看。", fuzzy: "WEYT and SI" },
  "169": { native: "Let it be.", intent: "就这样吧。", fuzzy: "LET ɪt BI" },
  "170": { native: "Stop here.", intent: "到此为止。", fuzzy: "STAP HɪR" },

  // J. 试探 (181-200)
  "181": { native: "Where do you stand?", intent: "你立场在哪？", fuzzy: "WER du yu STAND" },
  "182": { native: "What's the plan?", intent: "什么打算？", fuzzy: "WʌTS ðə PLAN" },
  "183": { native: "Are you serious?", intent: "你认真的吗？", fuzzy: "ar yu Sɪ-ri-əs" },
  "184": { native: "Do you know the cost?", intent: "你知道后果吗？", fuzzy: "du yu NO ðə KƆST" },
  "185": { native: "Are you avoiding this?", intent: "你在回避这个吗？", fuzzy: "ar yu ə-VƆY-dɪŋ ðɪs" },

  // L. 推进 / 对抗 / 退出 (221-240)
  "221": { native: "Face the truth.", intent: "面对现实吧。", fuzzy: "FEYS ðə TRUθ" },
  "222": { native: "Change it now.", intent: "现在就改。", fuzzy: "CHEYNDʒ ɪt NAW" },
  "223": { native: "Make a choice.", intent: "做个选择。", fuzzy: "MEYK a CHƆYS" },
  "231": { native: "We are done.", intent: "谈完了。", fuzzy: "wi ar DʌN" },
  "232": { native: "I'm leaving.", intent: "我要走了。", fuzzy: "aym LI-vɪŋ" },

  // N. 元位 (261-300)
  "261": { native: "No more words.", intent: "没话好说了。", fuzzy: "NO MƆR WERDZ" },
  "287": { native: "Silence is my answer.", intent: "沉默就是我的回答。", fuzzy: "SAY-ləns ɪz may AN-sər" },
  "300": { native: "That's it. End.", intent: "就这样。结束。", fuzzy: "ðats ɪt. END" }
};

// 辅助函数：生成母句列表，自动过滤掉占位符
function generateFullAtoms(): VerbalAtom[] {
  const result: VerbalAtom[] = [];
  GENERATION_SLOTS.forEach(slot => {
    const content = SLOTS_CONTENT_MAP[slot.id];
    
    // 只有当 SLOTS_CONTENT_MAP 中存在明确内容时才添加，彻底杜绝 Sample 193 类占位符
    if (content) {
      result.push({
        id: `atom-${slot.id}`,
        sample_pool: parseInt(slot.id) <= 180 ? '日常生活' : '对白·行动原子',
        role: slot.category,
        intent: content.intent || '',
        intent_en: slot.description,
        native: content.native || '',
        fuzzy: content.fuzzy || '',
        fallback: [],
        keywords: [],
        rhythm: '',
        notes: `压力位: ${slot.id}`,
        slotId: slot.id
      });
    }
  });
  return result;
}

export const MOTHER_ATOMS = generateFullAtoms();

// -----------------------------------------------------------------------------
// 3. 初始对白原子 (维持原有兼容性)
// -----------------------------------------------------------------------------

export const MCKEE_ATOMS: VerbalAtom[] = MOTHER_ATOMS.filter(a => a.sample_pool === '对白·行动原子').slice(0, 10);
export const INITIAL_VERBAL_ATOMS: VerbalAtom[] = MOTHER_ATOMS.filter(a => a.sample_pool === '日常生活').slice(0, 5);

// -----------------------------------------------------------------------------
// 4. Sound Cards (顺口溜) & Themes (秘密对白)
// -----------------------------------------------------------------------------

export interface DeepTheme {
  title: string;
  titleEn: string;
  description: string;
  quotes: SoundCard[];
}

export const BOUNDARY_THEMES: DeepTheme[] = [
  {
    title: "语言的边界",
    titleEn: "Language as Limit",
    description: "世界并不是被理解的，而是被语言圈定的。",
    quotes: [
      {
        id: "deep-1-1",
        target: "Wittgenstein",
        targetCn: "维特根斯坦",
        whyHard: "Abstract conceptual limit.",
        practiceLine: "The limits of my language mean the limits of my world.",
        commMode: "ðə Lɪ-mɪts əv may LAN-gwɪdʒ MIN... may WERLD",
        accentNote: "我的语言的界限意味着我的世界的界限。",
        secretRules: "出处：Tractatus Logico-Philosophicus",
        status: "hidden"
      },
      {
        id: "deep-1-2",
        target: "Wittgenstein",
        targetCn: "维特根斯坦",
        whyHard: "Ethical silence.",
        practiceLine: "Whereof one cannot speak, thereof one must be silent.",
        commMode: "WER-əv wʌn KAN-at SPIK... MʌST bi SAY-lənt",
        accentNote: "凡是不可言说者，必将归于沉默。",
        secretRules: "体会“不可言说”与“必须沉默”之间的张力。",
        status: "hidden"
      },
      {
        id: "deep-1-3",
        target: "Samuel Beckett",
        targetCn: "萨缪尔·贝克特",
        whyHard: "Minimalist existence.",
        practiceLine: "Words are all we have.",
        commMode: "WERDZ ar OL wi HAV",
        accentNote: "言语是我们拥有的一切。",
        secretRules: "用一种荒诞但坚定的语气发声。",
        status: "hidden"
      }
    ]
  },
  {
    title: "说与不可说的边界",
    titleEn: "Speech vs. Exposure",
    description: "不是一切都应该被表达。",
    quotes: [
      {
        id: "deep-2-1",
        target: "Wittgenstein",
        targetCn: "维特根斯坦",
        whyHard: "Visual vs Verbal.",
        practiceLine: "What can be shown cannot be said.",
        commMode: "WʌT kan bi ʃON KAN-at bi SED",
        accentNote: "能够显现的，不能被言说。",
        secretRules: "强调“Shown”和“Said”的对比。",
        status: "hidden"
      },
      {
        id: "deep-2-2",
        target: "Haruki Murakami",
        targetCn: "村上春树",
        whyHard: "Nuance of feeling.",
        practiceLine: "There are things that cannot be put into words.",
        commMode: "ðer ar θɪŋz ðat KAN-at bi PʊT ɪn-tə WERDZ",
        accentNote: "世上有些事是无法用语言形容的。",
        secretRules: "慢速、沉思地发声。",
        status: "hidden"
      },
      {
        id: "deep-2-3",
        target: "Herman Melville",
        targetCn: "赫尔曼·梅尔维尔",
        whyHard: "The power of refusal.",
        practiceLine: "I would prefer not to.",
        commMode: "ay wʊd prɪ-FER NAT TU",
        accentNote: "我宁愿不。",
        secretRules: "出处：Bartleby, the Scrivener。这是一种极强的防御性发声。",
        status: "hidden"
      }
    ]
  },
  {
    title: "自由与责任的边界",
    titleEn: "Freedom as Burden",
    description: "自由不是权利，是负担。",
    quotes: [
      {
        id: "deep-3-1",
        target: "Jean-Paul Sartre",
        targetCn: "让-保罗·萨特",
        whyHard: "Existential weight.",
        practiceLine: "Man is condemned to be free.",
        commMode: "MAN ɪz kən-DEMD tə bi FRI",
        accentNote: "人是被判定为自由的。",
        secretRules: "把“Condemned”读得沉重，像是一种审判。",
        status: "hidden"
      },
      {
        id: "deep-3-2",
        target: "Jean-Paul Sartre",
        targetCn: "让-保罗·萨特",
        whyHard: "Agency within history.",
        practiceLine: "Freedom is what you do with what’s been done to you.",
        commMode: "FRI-dəm ɪz WʌT yu DU... wʌts BIN DʌN tə yu",
        accentNote: "自由是你对施加在你身上的东西所做的反抗。",
        secretRules: "节奏在“What you do”处加速。",
        status: "hidden"
      },
      {
        id: "deep-3-3",
        target: "Sigmund Freud",
        targetCn: "西格蒙德·弗洛伊德",
        whyHard: "Psychological resistance.",
        practiceLine: "Most people do not really want freedom, because freedom involves responsibility.",
        commMode: "MOST PI-pəl... rɪ-span-sə-BɪL-ə-ti",
        accentNote: "大多数人并不真正渴望自由，因为自由意味着责任。",
        secretRules: "“Responsibility”需要清晰的音节展开。",
        status: "hidden"
      }
    ]
  },
  {
    title: "自我与幻觉的边界",
    titleEn: "Self vs. Illusion",
    description: "你以为的“我”，很可能只是逃避的结果。",
    quotes: [
      {
        id: "deep-4-1",
        target: "Socrates",
        targetCn: "苏格拉底",
        whyHard: "Ancient imperative.",
        practiceLine: "The unexamined life is not worth living.",
        commMode: "ðə ʌn-ɪg-ZA-mɪnd LAYF... NAT WERθ Lɪ-vɪŋ",
        accentNote: "未经审视的生活是不值得过的。",
        secretRules: "在“Not worth”处停顿，增强劝诫感。",
        status: "hidden"
      },
      {
        id: "deep-4-2",
        target: "Carl Jung",
        targetCn: "卡尔·荣格",
        whyHard: "Individuation.",
        practiceLine: "I am not what happened to me, I am what I choose to become.",
        commMode: "ay am NAT wʌt HAP-ənd... ay am WʌT ay CHUZ tə bɪ-KʌM",
        accentNote: "我不是发生在我身上的事，我是我选择成为的人。",
        secretRules: "重音落在“Choose”上。",
        status: "hidden"
      },
      {
        id: "deep-4-3",
        target: "Oscar Wilde",
        targetCn: "奥斯卡·王尔德",
        whyHard: "Wildean paradox.",
        practiceLine: "Man is least himself when he talks in his own person.",
        commMode: "MAN ɪz LIST hɪm-SELF... TƆKS ɪn hɪz ON PER-sən",
        accentNote: "人以自己身份说话时，最不像他自己。",
        secretRules: "带着一点讽刺和观察者的视角。",
        status: "hidden"
      }
    ]
  },
  {
    title: "沉默与力量的边界",
    titleEn: "Silence as Boundary",
    description: "有些边界，只能用不说来守住。",
    quotes: [
      {
        id: "deep-5-1",
        target: "Laozi",
        targetCn: "老子",
        whyHard: "Taoist paradox.",
        practiceLine: "Silence is a source of great strength.",
        commMode: "SAY-ləns ɪz a SƆRS əv GRET STREŊθ",
        accentNote: "沉默是大力量的源泉。",
        secretRules: "发音要稳，气息要长。",
        status: "hidden"
      },
      {
        id: "deep-5-2",
        target: "Haruki Murakami",
        targetCn: "村上春树",
        whyHard: "Modern stoicism.",
        practiceLine: "Sometimes the most powerful thing you can say is nothing at all.",
        commMode: "SʌM-taymz... NɅ-θɪŋ at OL",
        accentNote: "有时最有力的话是什么都不说。",
        secretRules: "结尾“Nothing at all”要像消失了一样轻。",
        status: "hidden"
      },
      {
        id: "deep-5-3",
        target: "Rumi",
        targetCn: "鲁米",
        whyHard: "Poetic resonance.",
        practiceLine: "In silence there is eloquence.",
        commMode: "ɪn SAY-ləns ðer ɪz EL-ə-kwəns",
        accentNote: "沉默中自有雄辩。",
        secretRules: "“Eloquence”发音要饱满、华丽。",
        status: "hidden"
      }
    ]
  },
  {
    title: "理解与控制的边界",
    titleEn: "Understanding ≠ Control",
    description: "理解世界，并不会让世界听你的。",
    quotes: [
      {
        id: "deep-6-1",
        target: "Ernest Hemingway",
        targetCn: "欧内斯特·海明威",
        whyHard: "Hard-boiled truth.",
        practiceLine: "The world breaks everyone, and afterward many are strong at the broken places.",
        commMode: "ðə WERLD BREYKS EV-ri-wʌn... STRƆŊ at ðə BRO-kən PLEY-səz",
        accentNote: "世界击碎每一个人，之后许多人在破碎之处变得坚强。",
        secretRules: "出处：A Farewell to Arms。这是一种带着伤疤的发声。",
        status: "hidden"
      },
      {
        id: "deep-6-2",
        target: "Søren Kierkegaard",
        targetCn: "索伦·克尔凯郭尔",
        whyHard: "Existential reality.",
        practiceLine: "Life is not a problem to be solved, but a reality to be experienced.",
        commMode: "LAYF ɪz NAT a PRAB-ləm... rɪ-AL-ə-ti tə bi ɪk-SPIR-i-ənst",
        accentNote: "生活不是一个要解决的问题，而是一个要体验的现实。",
        secretRules: "强调“Reality”和“Experienced”。",
        status: "hidden"
      },
      {
        id: "deep-6-3",
        target: "Woody Allen",
        targetCn: "伍迪·艾伦",
        whyHard: "Sardonic wit.",
        practiceLine: "If you want to make God laugh, tell him about your plans.",
        commMode: "ɪf yu WANT tə MEYK GAD LAF... TEL hɪm ə-BAWT yər PLANZ",
        accentNote: "如果你想让上帝发笑，就把你的计划告诉他。",
        secretRules: "带着自嘲和宿命感的轻快语气。",
        status: "hidden"
      }
    ]
  }
];

export const INITIAL_SOUND_CARDS: SoundCard[] = [
  {
    id: 'th-1',
    target: 'TH (Tooth Friction)',
    targetCn: 'TH (齿间摩擦)',
    whyHard: 'Requires tongue-tip exposure to dental surfaces.',
    practiceLine: 'Thirty-three thieves thought that they thrilled the throne.',
    commMode: 'If the /θ/ stops your flow, blur it into a soft /f/ (firty-free). Keep moving.',
    accentNote: 'In multicultural London English, this shift to /f/ is the standard daily reality.',
    secretRules: 'Imagine your tongue is a gate that air must push through.',
    status: 'hidden'
  },
  {
    id: 'rl-1',
    target: 'R / L (Tongue Separation)',
    targetCn: 'R / L (舌位分离)',
    whyHard: 'Separating the liquid "R" from the lateral "L".',
    practiceLine: 'Red lorry, yellow lorry.',
    commMode: 'Focus on the "R" start. If "L" feels sticky, let it be a soft glide.',
    accentNote: 'These sounds are notoriously fluid across world English variations.',
    secretRules: 'R is a growl from the back; L is a tap at the front.',
    status: 'hidden'
  },
  {
    id: 'rl-2',
    target: 'R / L (Sentence Flow)',
    targetCn: 'R / L (句式流态)',
    whyHard: 'Transitioning between R and L positions within a phrase.',
    practiceLine: 'Really light rain rolls along the road.',
    commMode: 'Allow "Really" and "Rolls" to carry the rhythm; let others follow.',
    accentNote: 'Fluency comes from the speed of the transition, not phonetic isolation.',
    secretRules: 'Keep your jaw relaxed; only the tongue moves.',
    status: 'hidden'
  },
  {
    id: 'ssh-1',
    target: 'S / SH (Fricative Contrast)',
    targetCn: 'S / SH (摩擦对比)',
    whyHard: 'Switching between alveolar and post-alveolar friction.',
    practiceLine: 'She sells seashells by the seashore.',
    commMode: 'Ensure the "SH" has a broad air stream. Don\'t stop if they mix.',
    accentNote: 'In casual Atlantic speech, these distinctions soften considerably.',
    secretRules: 'Pout for SH; smile for S.',
    status: 'hidden'
  },
  {
    id: 'ssh-2',
    target: 'S / SH (Hiss Stability)',
    targetCn: 'S / SH (嘶鸣稳定)',
    whyHard: 'Stability of the tongue tip during continuous S sounds.',
    practiceLine: 'Six slimy snails sailed silently.',
    commMode: 'Focus on the "S" hiss at the start of each word. Keep it sharp.',
    accentNote: 'A slight lisp is a common native variation and causes zero loss of meaning.',
    secretRules: 'Focus the air on a single point behind your top teeth.',
    status: 'hidden'
  },
  {
    id: 'pb-1',
    target: 'P / B (Air Plosives)',
    targetCn: 'P / B (爆破气流)',
    whyHard: 'Activating the lip-burst mechanism.',
    practiceLine: 'Peter Piper picked a peck of pickled peppers.',
    commMode: 'Pop the "P" like a bubble. Don\'t worry about the vowels.',
    accentNote: 'Unaspirated P is a key feature of many global English varieties.',
    secretRules: 'Build pressure behind closed lips and release all at once.',
    status: 'hidden'
  },
  {
    id: 'pb-2',
    target: 'P / B (Rhythmic Plosives)',
    targetCn: 'P / B (节奏爆破)',
    whyHard: 'Contrasting voiced and unvoiced bursts.',
    practiceLine: 'A big black bug bit a big black dog.',
    commMode: 'Hit the "B" hard to set the beat. Let the sentence "bounce".',
    accentNote: 'Plosive strength varies wildly by region; the rhythm is what matters.',
    secretRules: 'Think of the "B" as a drum beat for the whole sentence.',
    status: 'hidden'
  },
  {
    id: 'wv-1',
    target: 'W / V (Lip Awareness)',
    targetCn: 'W / V (唇形差异)',
    whyHard: 'Distinguishing rounded lips from lip-to-teeth contact.',
    practiceLine: 'Whether the weather is warm or whether the weather is hot.',
    commMode: 'Blur the "W" and "V" into a single soft sound if the contrast stops you.',
    accentNote: 'Merging W and V is a standard feature of several "New Englishes".',
    secretRules: 'Circle the lips for W; vibrate the lower lip for V.',
    status: 'hidden'
  },
  {
    id: 'flow-1',
    target: 'Flow (Linking & Reduction)',
    targetCn: 'Flow (连读与弱读)',
    whyHard: 'Trusting the rhythm to take over conscious control.',
    practiceLine: 'I scream, you scream, we all scream for ice cream.',
    commMode: 'Link "scream" to "for" to "ice". Treat it as one long word.',
    accentNote: 'Linking is the "secret sauce" of natural native-like speed.',
    secretRules: 'Never pause between words. Run them all together.',
    status: 'hidden'
  },
  {
    id: 'flow-2',
    target: 'Flow (Stress & Pulse)',
    targetCn: 'Flow (重音与脉冲)',
    whyHard: 'Using word stress to maintain musicality.',
    practiceLine: 'Humpty Dumpty sat on a wall, Humpty Dumpty had a great fall.',
    commMode: 'Exaggerate the "HUMP" and "DUMP". Everything else is quiet.',
    accentNote: 'English is stress-timed; the pulse is the primary carrier of meaning.',
    secretRules: 'Stomp your foot on every stressed syllable.',
    status: 'hidden'
  },
  {
    id: 'flow-3',
    target: 'Flow (Phrase Endurance)',
    targetCn: 'Flow (长句耐力)',
    whyHard: 'Maintaining vocal presence across a long, complex thought.',
    practiceLine: 'Whether the weather is warm or whether the weather is hot, we have to put up with the weather, whether we like it or not.',
    commMode: 'Breath deeply at the comma. Keep the second half moving faster.',
    accentNote: 'Phrase grouping is more important than individual word clarity.',
    secretRules: 'Imagine you are running down a hill—don\'t stop until the bottom.',
    status: 'hidden'
  }
];

export const PROFESSION_TO_VECTOR: Record<string, any> = {
  'Engineer': { judgment_frequency: 0.8, urgency: 0.4, abstraction: 0.9, reversibility: 0.3, emotion_expression: 0.2 },
  'Nurse': { judgment_frequency: 0.3, urgency: 0.9, abstraction: 0.2, reversibility: 0.1, emotion_expression: 0.7 },
  'Sales': { judgment_frequency: 0.6, urgency: 0.7, abstraction: 0.5, reversibility: 0.8, emotion_expression: 0.9 },
  'Student': { judgment_frequency: 0.2, urgency: 0.2, abstraction: 0.6, reversibility: 0.5, emotion_expression: 0.4 },
};
