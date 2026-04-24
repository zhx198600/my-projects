const tarotCards = [
  {
    id: 0,
    name: "愚者",
    nameEn: "The Fool",
    element: "风",
    zodiac: "天王星",
    meaningUp: "代表新的开始、自发性和自由精神。正位时象征着勇气、冒险精神和对未知的信任。你有无限的可能性，只要保持开放的心态，就能抓住机遇。鼓励你追随内心的声音，勇敢迈出第一步。",
    meaningDown: "逆位时可能表示鲁莽、不负责任或冲动。你可能过于乐观而忽略风险，或者因为害怕失败而不敢行动。提醒你需要更多的规划和谨慎，同时不要让恐惧阻碍你的前进。",
    keywords: ["新的开始", "自由", "冒险", "纯真", "自发性"],
    imageUrl: "/images/tarot/cards/0-fool.jpg"
  },
  {
    id: 1,
    name: "魔术师",
    nameEn: "The Magician",
    element: "风",
    zodiac: "水星",
    meaningUp: "代表创造力、意志力和资源整合能力。正位时表示你拥有实现目标所需的所有工具和能力。你能够将想法转化为现实，通过清晰的沟通和果断的行动取得成功。",
    meaningDown: "逆位时可能表示操纵、欺骗或缺乏自信。你可能感到无力改变现状，或者滥用自己的能力。提醒你需要诚实面对自己，重新评估目标和方法，不要试图走捷径。",
    keywords: ["创造力", "意志力", "技能", "显化", "沟通"],
    imageUrl: "/images/tarot/cards/1-magician.jpg"
  },
  {
    id: 2,
    name: "女祭司",
    nameEn: "The High Priestess",
    element: "水",
    zodiac: "月亮",
    meaningUp: "代表直觉、内在智慧和神秘知识。正位时表示你需要倾听内心的声音，相信自己的直觉。这张牌鼓励你深入探索潜意识，连接更高的自我，获得更深层次的理解。",
    meaningDown: "逆位时可能表示忽视直觉、表面化或秘密。你可能过度依赖逻辑而忽略内心的感受，或者被隐藏的信息困扰。提醒你需要更深入地了解自己，不要害怕面对内在的真相。",
    keywords: ["直觉", "智慧", "潜意识", "神秘", "内在声音"],
    imageUrl: "/images/tarot/cards/2-high-priestess.jpg"
  },
  {
    id: 3,
    name: "皇后",
    nameEn: "The Empress",
    element: "土",
    zodiac: "金星",
    meaningUp: "代表丰饶、母性、自然和创造力。正位时象征着滋养、关怀和繁荣。你有能力创造和孕育新的生命、项目或关系。这张牌鼓励你与自然连接，享受生活的美好。",
    meaningDown: "逆位时可能表示创造力受阻、忽视自我或依赖他人。你可能感到缺乏滋养，或者过度照顾他人而忽略自己。提醒你需要平衡给予和接受，关注自己的需求。",
    keywords: ["丰饶", "母性", "自然", "创造力", "滋养"],
    imageUrl: "/images/tarot/cards/3-empress.jpg"
  },
  {
    id: 4,
    name: "皇帝",
    nameEn: "The Emperor",
    element: "火",
    zodiac: "白羊座",
    meaningUp: "代表权威、结构、稳定和领导能力。正位时表示你有能力建立秩序，实现目标。这张牌象征着理性、纪律和意志力，鼓励你采取主动，负责任地领导他人。",
    meaningDown: "逆位时可能表示独裁、僵化或缺乏控制。你可能感到权力被滥用，或者自己的权威受到挑战。提醒你需要灵活性和同理心，不要让控制欲阻碍你的成长。",
    keywords: ["权威", "结构", "领导", "稳定", "纪律"],
    imageUrl: "/images/tarot/cards/4-emperor.jpg"
  },
  {
    id: 5,
    name: "教皇",
    nameEn: "The Hierophant",
    element: "土",
    zodiac: "金牛座",
    meaningUp: "代表传统、信仰、教育和精神指导。正位时表示你可能从传统中获得智慧，或者需要寻求导师的指导。这张牌鼓励你学习、分享知识，遵循已被验证的路径。",
    meaningDown: "逆位时可能表示打破传统、质疑权威或虚假信仰。你可能感到受到传统的束缚，或者质疑现有的信念系统。提醒你需要独立思考，不要盲目接受他人的观点。",
    keywords: ["传统", "信仰", "教育", "导师", "灵性"],
    imageUrl: "/images/tarot/cards/5-hierophant.jpg"
  },
  {
    id: 6,
    name: "恋人",
    nameEn: "The Lovers",
    element: "风",
    zodiac: "双子座",
    meaningUp: "代表爱情、选择、和谐和价值观。正位时表示你面临重要的选择，需要遵循内心的价值观。这张牌象征着深刻的连接、吸引力和相互尊重，鼓励你真诚地面对自己和他人。",
    meaningDown: "逆位时可能表示内心冲突、不和谐或逃避选择。你可能在关系中感到不满足，或者害怕做出决定。提醒你需要诚实面对自己的感受，不要因为恐惧而妥协。",
    keywords: ["爱情", "选择", "和谐", "价值观", "连接"],
    imageUrl: "/images/tarot/cards/6-lovers.jpg"
  },
  {
    id: 7,
    name: "战车",
    nameEn: "The Chariot",
    element: "水",
    zodiac: "巨蟹座",
    meaningUp: "代表意志力、胜利、决心和自我控制。正位时表示你有能力克服障碍，实现目标。这张牌象征着勇气、专注和决心，鼓励你坚定地前进，即使面对挑战也不退缩。",
    meaningDown: "逆位时可能表示失控、缺乏方向或自我怀疑。你可能感到被情绪淹没，或者失去了前进的动力。提醒你需要重新评估目标，找回内心的平衡和力量。",
    keywords: ["意志力", "胜利", "决心", "控制", "前进"],
    imageUrl: "/images/tarot/cards/7-chariot.jpg"
  },
  {
    id: 8,
    name: "力量",
    nameEn: "Strength",
    element: "火",
    zodiac: "狮子座",
    meaningUp: "代表内在力量、勇气、耐心和同情心。正位时表示你拥有足够的内在力量来面对挑战。这张牌象征着温柔的力量，鼓励你用爱和耐心而非暴力来解决问题。",
    meaningDown: "逆位时可能表示自我怀疑、无力感或过度控制。你可能感到缺乏自信，或者试图用强硬的方式控制局面。提醒你需要连接内在的力量，相信自己的能力。",
    keywords: ["力量", "勇气", "耐心", "同情心", "自信"],
    imageUrl: "/images/tarot/cards/8-strength.jpg"
  },
  {
    id: 9,
    name: "隐士",
    nameEn: "The Hermit",
    element: "土",
    zodiac: "处女座",
    meaningUp: "代表内省、孤独、智慧和寻求真理。正位时表示你需要独处的时间来反思和成长。这张牌鼓励你向内探索，寻找内在的指引，而不是依赖他人的意见。",
    meaningDown: "逆位时可能表示孤立、逃避或拒绝指导。你可能感到孤独，或者害怕面对内在的真相。提醒你需要平衡独处和社交，不要完全与世界隔绝。",
    keywords: ["内省", "孤独", "智慧", "真理", "指引"],
    imageUrl: "/images/tarot/cards/9-hermit.jpg"
  },
  {
    id: 10,
    name: "命运之轮",
    nameEn: "Wheel of Fortune",
    element: "火",
    zodiac: "木星",
    meaningUp: "代表变化、命运、机遇和转折点。正位时表示你正处于一个重要的转折点，好运即将到来。这张牌鼓励你拥抱变化，相信命运的安排，抓住出现的机会。",
    meaningDown: "逆位时可能表示抗拒变化、厄运或停滞。你可能感到生活陷入困境，或者害怕改变。提醒你需要接受生活的起伏，学会在变化中找到平衡。",
    keywords: ["变化", "命运", "机遇", "转折", "周期"],
    imageUrl: "/images/tarot/cards/10-wheel-of-fortune.jpg"
  },
  {
    id: 11,
    name: "正义",
    nameEn: "Justice",
    element: "风",
    zodiac: "天秤座",
    meaningUp: "代表公正、平衡、真理和法律。正位时表示你需要做出公平的决定，或者会得到公正的结果。这张牌鼓励你诚实地面对自己，遵循内心的道德准则。",
    meaningDown: "逆位时可能表示不公、失衡或逃避责任。你可能感到被不公正对待，或者自己在做出不诚实的选择。提醒你需要审视自己的行为，为自己的决定负责。",
    keywords: ["公正", "平衡", "真理", "法律", "责任"],
    imageUrl: "/images/tarot/cards/11-justice.jpg"
  },
  {
    id: 12,
    name: "倒吊人",
    nameEn: "The Hanged Man",
    element: "水",
    zodiac: "海王星",
    meaningUp: "代表暂停、牺牲、新视角和投降。正位时表示你需要暂停、反思，从不同的角度看待问题。这张牌鼓励你放下控制，接受现状，通过牺牲获得更深的理解。",
    meaningDown: "逆位时可能表示拖延、抗拒改变或无意义的牺牲。你可能感到停滞不前，或者害怕做出改变。提醒你需要评估哪些牺牲是值得的，不要害怕采取行动。",
    keywords: ["暂停", "牺牲", "新视角", "投降", "反思"],
    imageUrl: "/images/tarot/cards/12-hanged-man.jpg"
  },
  {
    id: 13,
    name: "死神",
    nameEn: "Death",
    element: "水",
    zodiac: "天蝎座",
    meaningUp: "代表结束、转变、重生和释放。正位时表示旧的阶段正在结束，新的开始即将到来。这张牌鼓励你放手过去，拥抱变化，相信结束是为了更好的重生。",
    meaningDown: "逆位时可能表示抗拒变化、害怕死亡或停滞。你可能害怕放手过去，或者感到被困在无法改变的处境中。提醒你需要接受生活的变化，不要让恐惧阻碍你的成长。",
    keywords: ["结束", "转变", "重生", "释放", "变化"],
    imageUrl: "/images/tarot/cards/13-death.jpg"
  },
  {
    id: 14,
    name: "节制",
    nameEn: "Temperance",
    element: "火",
    zodiac: "射手座",
    meaningUp: "代表平衡、调和、耐心和适度。正位时表示你需要在生活的各个方面找到平衡。这张牌鼓励你温和、耐心地行动，通过调和对立的力量找到和谐。",
    meaningDown: "逆位时可能表示失衡、过度或缺乏耐心。你可能感到生活失去平衡，或者行为过于极端。提醒你需要审视自己的行为，找回内在的平衡和耐心。",
    keywords: ["平衡", "调和", "耐心", "适度", "和谐"],
    imageUrl: "/images/tarot/cards/14-temperance.jpg"
  },
  {
    id: 15,
    name: "恶魔",
    nameEn: "The Devil",
    element: "土",
    zodiac: "摩羯座",
    meaningUp: "代表束缚、物质主义、诱惑和阴影面。正位时表示你可能感到被某种欲望或恐惧束缚。这张牌鼓励你直面自己的阴影，认识到束缚你的力量，从而获得自由。",
    meaningDown: "逆位时可能表示打破束缚、释放或过度放纵。你可能正在摆脱某种限制，或者陷入更深的沉迷。提醒你需要负责任地使用自己的力量，不要让欲望控制你。",
    keywords: ["束缚", "物质主义", "诱惑", "阴影", "自由"],
    imageUrl: "/images/tarot/cards/15-devil.jpg"
  },
  {
    id: 16,
    name: "塔",
    nameEn: "The Tower",
    element: "火",
    zodiac: "火星",
    meaningUp: "代表突变、混乱、启示和解放。正位时表示你可能经历突然的变化或危机。这张牌鼓励你接受这种颠覆，因为它清除了虚假的结构，为新的开始让路。",
    meaningDown: "逆位时可能表示抗拒改变、害怕失败或拖延灾难。你可能试图避免必要的改变，或者已经经历了剧变正在恢复。提醒你需要勇敢面对挑战，不要害怕重建。",
    keywords: ["突变", "混乱", "启示", "解放", "重建"],
    imageUrl: "/images/tarot/cards/16-tower.jpg"
  },
  {
    id: 17,
    name: "星星",
    nameEn: "The Star",
    element: "风",
    zodiac: "水瓶座",
    meaningUp: "代表希望、灵感、宁静和精神指引。正位时表示你正处于一个充满希望和可能性的阶段。这张牌鼓励你相信未来，跟随内心的指引，追求更高的目标。",
    meaningDown: "逆位时可能表示失去希望、缺乏灵感或迷茫。你可能感到沮丧，或者失去了方向。提醒你需要重新连接内在的力量，不要让暂时的困难打败你。",
    keywords: ["希望", "灵感", "宁静", "指引", "可能性"],
    imageUrl: "/images/tarot/cards/17-star.jpg"
  },
  {
    id: 18,
    name: "月亮",
    nameEn: "The Moon",
    element: "水",
    zodiac: "双鱼座",
    meaningUp: "代表直觉、潜意识、幻觉和情绪。正位时表示你需要深入探索潜意识，面对内在的恐惧和不安。这张牌鼓励你相信直觉，即使情况不明朗也要继续前进。",
    meaningDown: "逆位时可能表示释放恐惧、真相大白或过度情绪化。你可能正在从恐惧中解脱，或者被情绪淹没。提醒你需要区分现实和幻想，不要被情绪左右。",
    keywords: ["直觉", "潜意识", "幻觉", "情绪", "恐惧"],
    imageUrl: "/images/tarot/cards/18-moon.jpg"
  },
  {
    id: 19,
    name: "太阳",
    nameEn: "The Sun",
    element: "火",
    zodiac: "太阳",
    meaningUp: "代表快乐、成功、活力和清晰。正位时表示你正处于一个充满光明和活力的阶段。这张牌鼓励你享受当下，分享你的快乐，用积极的态度面对生活。",
    meaningDown: "逆位时可能表示暂时的阴霾、自我怀疑或过度乐观。你可能感到缺乏活力，或者过于乐观而忽略现实。提醒你需要保持平衡，即使在困难时期也要保持希望。",
    keywords: ["快乐", "成功", "活力", "清晰", "积极"],
    imageUrl: "/images/tarot/cards/19-sun.jpg"
  },
  {
    id: 20,
    name: "审判",
    nameEn: "Judgement",
    element: "火",
    zodiac: "冥王星",
    meaningUp: "代表觉醒、重生、召唤和评估。正位时表示你正处于一个重要的觉醒时刻，需要重新评估过去的选择。这张牌鼓励你听从内心的召唤，拥抱新的开始。",
    meaningDown: "逆位时可能表示自我怀疑、恐惧改变或忽视召唤。你可能害怕面对自己的选择，或者拒绝改变。提醒你需要诚实地面对自己，不要让过去的错误定义你。",
    keywords: ["觉醒", "重生", "召唤", "评估", "新开始"],
    imageUrl: "/images/tarot/cards/20-judgement.jpg"
  },
  {
    id: 21,
    name: "世界",
    nameEn: "The World",
    element: "土",
    zodiac: "土星",
    meaningUp: "代表完成、整合、成就和圆满。正位时表示你已经完成了一个重要的阶段，取得了成就。这张牌鼓励你庆祝你的成功，认识到你已经拥有了你所需要的一切。",
    meaningDown: "逆位时可能表示未完成、缺乏方向或感到受限。你可能感到无法完成目标，或者被限制在某个阶段。提醒你需要接受完成的过程，不要让完美主义阻碍你。",
    keywords: ["完成", "整合", "成就", "圆满", "自由"],
    imageUrl: "/images/tarot/cards/21-world.jpg"
  }
];

export default tarotCards;
