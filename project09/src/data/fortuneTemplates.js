const fortuneTemplates = {
  overall: {
    positive: [
      "整体运势向好，{cardName}为你带来{keywords}的能量。这段时间你充满了{energy}，适合{advice}。保持{attitude}的心态，好运将持续伴随你。",
      "本周/本月运势不错，{cardName}显示你拥有{keywords}的特质。你的{strength}将帮助你在{area}取得进展。建议你{action}，这将为你带来意想不到的收获。",
      "当前阶段运势顺畅，{cardName}的{element}元素能量正在为你服务。你在{aspect}方面表现出色，{opportunity}的机会正在向你走来。保持{mindset}，不要错过这些良机。"
    ],
    negative: [
      "整体运势需要谨慎，{cardName}逆位提示你可能面临{challenges}的挑战。这段时间你可能感到{feelings}，建议你{caution}。通过{solution}，你将能够度过这个阶段。",
      "本周/本月运势有些波折，{cardName}逆位显示你需要注意{warnings}。你的{weakness}可能会阻碍你的进展，建议你{action}。保持{attitude}的心态，困难只是暂时的。",
      "当前阶段需要更多的内省，{cardName}逆位提示你可能在{area}方面有所忽视。你可能过于{behavior}，这会导致{consequences}。建议你{advice}，重新评估你的方向。"
    ]
  },
  
  love: {
    positive: [
      "爱情运势甜蜜，{cardName}为你的感情生活带来{keywords}的能量。单身者有机会遇到{type}的对象，可能通过{way}相识。有伴者与伴侣的关系{status}，建议{coupleAdvice}，让感情更加升温。",
      "感情方面运势向好，{cardName}显示你的{aspect}魅力正在增强。单身者不要害怕{action}，你的{quality}会吸引到合适的人。有伴者可以通过{activity}来增进彼此的感情，创造美好的回忆。",
      "爱情运势充满机遇，{cardName}的{element}元素为你的感情生活注入活力。单身者保持{attitude}，可能在{place}遇到令人心动的对象。有伴者之间的{connection}正在加深，建议{advice}来维护这份美好。"
    ],
    negative: [
      "爱情运势需要关注，{cardName}逆位提示感情中可能出现{issues}。单身者可能感到{singleFeelings}，建议你{singleAction}，不要急于求成。有伴者之间可能存在{problems}，需要通过{solution}来解决。",
      "感情方面有些波折，{cardName}逆位显示你可能在{aspect}方面有所忽视。单身者不要因为{reason}而{behavior}，保持{attitude}最重要。有伴者可能会因为{cause}而产生{conflicts}，建议{action}来修复关系。",
      "爱情运势需要谨慎，{cardName}逆位提示你可能在感情中{pattern}。单身者可能过于{expectation}，导致{result}。有伴者需要注意{warning}，不要让{issue}影响你们的关系。建议{advice}来找回感情的平衡。"
    ]
  },
  
  career: {
    positive: [
      "事业运势强劲，{cardName}为你的职场带来{keywords}的能量。你在工作中表现{performance}，你的{ability}将帮助你{achievement}。有机会{opportunity}，建议你{action}来抓住这个机遇。",
      "职场运势向好，{cardName}显示你的{aspect}能力正在得到认可。你可能会收到{news}，或者在{project}中取得重要进展。建议你{advice}，这将为你的职业发展打下良好基础。",
      "事业运势充满机遇，{cardName}的{element}元素为你的职场注入活力。你在{area}方面的表现尤为出色，{recognition}正在向你走来。保持{attitude}，不要害怕{challenge}，这将是你成长的机会。"
    ],
    negative: [
      "事业运势需要谨慎，{cardName}逆位提示职场中可能出现{challenges}。你可能感到{feelings}，或者在{aspect}方面遇到困难。建议你{action}，通过{solution}来应对这些挑战。",
      "职场方面有些波折，{cardName}逆位显示你需要注意{warnings}。你的{behavior}可能会{consequence}，建议你调整{approach}。保持{attitude}，不要因为{setback}而{reaction}，困难是暂时的。",
      "事业运势需要内省，{cardName}逆位提示你可能在{area}方面有所忽视。你可能过于{focus}，而忽略了{aspect}。建议你重新评估{goal}，考虑{alternative}，这可能会为你打开新的可能性。"
    ]
  },
  
  wealth: {
    positive: [
      "财运运势向好，{cardName}为你的财务带来{keywords}的能量。你有机会{opportunity}，可能通过{way}获得额外收入。你的{aspect}能力正在增强，建议你{action}来管理你的财务。",
      "财务方面运势不错，{cardName}显示你的{aspect}运势正在提升。你可能会收到{news}，或者之前的{investment}开始有回报。建议你{advice}，这将帮助你更好地规划未来。",
      "财运充满机遇，{cardName}的{element}元素为你的财务注入活力。你在{area}方面有不错的运气，可能会有{surprise}出现。保持{attitude}，同时也要{caution}，理性地管理你的财富。"
    ],
    negative: [
      "财运需要谨慎，{cardName}逆位提示财务方面可能出现{challenges}。你可能会遇到{issues}，或者在{aspect}方面有所损失。建议你{action}，通过{solution}来稳定你的财务状况。",
      "财务方面有些波折，{cardName}逆位显示你需要注意{warnings}。你的{behavior}可能会导致{consequences}，建议你调整{approach}。不要因为{reason}而做出{decision}，保持理性最重要。",
      "财运需要更多关注，{cardName}逆位提示你可能在{area}方面有所忽视。你可能过于{attitude}，而没有做好{preparation}。建议你重新评估你的{plan}，考虑{alternative}，这将帮助你避免未来的财务问题。"
    ]
  },
  
  health: {
    positive: [
      "健康运势良好，{cardName}为你的身心带来{keywords}的能量。你的{aspect}状态不错，建议你{action}来维持这种状态。通过{habit}，你的{benefit}将得到进一步提升。",
      "身心状态向好，{cardName}显示你的{aspect}能量正在增强。你可能感到{feelings}，这是{sign}的表现。建议你{advice}，这将帮助你保持这种良好的状态。",
      "健康运势充满活力，{cardName}的{element}元素为你的身心注入积极能量。你在{area}方面的状态尤为出色，建议你{action}来进一步增强。保持{attitude}，你的身心将持续保持良好状态。"
    ],
    negative: [
      "健康运势需要关注，{cardName}逆位提示身心方面可能出现{warnings}。你可能感到{symptoms}，这是{sign}的表现。建议你{action}，不要忽视这些信号。",
      "身心状态需要调整，{cardName}逆位显示你可能在{aspect}方面有所忽视。你的{habit}可能会导致{consequences}，建议你调整{routine}。通过{solution}，你将能够恢复良好的状态。",
      "健康运势需要谨慎，{cardName}逆位提示你可能在{area}方面过度消耗。你可能因为{reason}而感到{feelings}，建议你{action}。不要忽视身体发出的信号，及时{adjustment}将帮助你恢复平衡。"
    ]
  },
  
  templateVariables: {
    cardName: "卡牌名称",
    keywords: "关键词",
    element: "元素",
    energy: "能量描述",
    advice: "建议",
    attitude: "态度",
    strength: "优势",
    area: "领域",
    action: "行动",
    aspect: "方面",
    opportunity: "机会",
    mindset: "心态",
    challenges: "挑战",
    feelings: "感受",
    caution: "注意事项",
    solution: "解决方案",
    warnings: "警告",
    weakness: "弱点",
    behavior: "行为",
    consequences: "后果",
    type: "类型",
    way: "方式",
    status: "状态",
    coupleAdvice: "情侣建议",
    quality: "品质",
    activity: "活动",
    place: "地点",
    connection: "连接",
    issues: "问题",
    singleFeelings: "单身感受",
    singleAction: "单身行动",
    problems: "问题",
    cause: "原因",
    conflicts: "冲突",
    pattern: "模式",
    expectation: "期望",
    result: "结果",
    issue: "问题",
    performance: "表现",
    ability: "能力",
    achievement: "成就",
    news: "消息",
    project: "项目",
    recognition: "认可",
    challenge: "挑战",
    setback: "挫折",
    reaction: "反应",
    goal: "目标",
    alternative: "替代方案",
    investment: "投资",
    surprise: "惊喜",
    loss: "损失",
    decision: "决定",
    plan: "计划",
    benefit: "益处",
    sign: "迹象",
    symptoms: "症状",
    habit: "习惯",
    routine: "日常",
    reason: "原因",
    adjustment: "调整"
  }
};

export default fortuneTemplates;
