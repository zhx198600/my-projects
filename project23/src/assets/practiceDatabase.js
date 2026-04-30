export const practiceDatabase = {
  math: {
    equation: [
      { id: 1, text: '解方程：3x - 7 = 14', type: 'equation', difficulty: 'medium' },
      { id: 2, text: '解方程：5(x + 2) = 35', type: 'equation', difficulty: 'medium' },
      { id: 3, text: '解方程：2x + 8 = 4x - 6', type: 'equation', difficulty: 'medium' },
      { id: 4, text: '解方程：7x - 15 = 3x + 5', type: 'equation', difficulty: 'medium' },
      { id: 5, text: '解方程：4(2x - 3) = 20', type: 'equation', difficulty: 'medium' },
      { id: 6, text: '解方程：x² - 5x + 6 = 0', type: 'equation', difficulty: 'hard' },
      { id: 7, text: '解方程：2x² - 7x + 3 = 0', type: 'equation', difficulty: 'hard' },
      { id: 8, text: '解方程：x/3 + 5 = 12', type: 'equation', difficulty: 'easy' }
    ],
    inequality: [
      { id: 1, text: '解不等式：2x + 5 > 15', type: 'inequality', difficulty: 'medium' },
      { id: 2, text: '解不等式：3x - 7 ≤ 8', type: 'inequality', difficulty: 'medium' },
      { id: 3, text: '解不等式：5 - 2x ≥ 1', type: 'inequality', difficulty: 'medium' },
      { id: 4, text: '解不等式：4(x + 2) < 24', type: 'inequality', difficulty: 'medium' },
      { id: 5, text: '解不等式：|x - 3| < 5', type: 'inequality', difficulty: 'hard' },
      { id: 6, text: '解不等式：x² - 4x + 3 > 0', type: 'inequality', difficulty: 'hard' },
      { id: 7, text: '解不等式：2x + 1 < x - 3', type: 'inequality', difficulty: 'easy' }
    ],
    calculus: [
      { id: 1, text: '求函数 f(x) = x³ - 3x² + 2 的极值', type: 'calculus', difficulty: 'hard' },
      { id: 2, text: '求函数 f(x) = 2x³ - 6x + 1 的单调区间', type: 'calculus', difficulty: 'hard' },
      { id: 3, text: '求函数 f(x) = x⁴ - 4x³ 在区间 [0, 4] 上的最大值和最小值', type: 'calculus', difficulty: 'hard' },
      { id: 4, text: '求函数 f(x) = x² - 4x + 5 的最小值', type: 'calculus', difficulty: 'medium' },
      { id: 5, text: '求函数 f(x) = sin(x) 在区间 [0, π] 上的最大值', type: 'calculus', difficulty: 'hard' },
      { id: 6, text: '求函数 f(x) = x + 1/x (x > 0) 的最小值', type: 'calculus', difficulty: 'hard' }
    ],
    geometry: [
      { id: 1, text: '已知直角三角形的两条直角边分别为6和8，求斜边长度', type: 'geometry', difficulty: 'medium' },
      { id: 2, text: '求半径为5的圆的面积和周长', type: 'geometry', difficulty: 'easy' },
      { id: 3, text: '正方形的周长是24cm，求它的面积', type: 'geometry', difficulty: 'easy' },
      { id: 4, text: '长方形的长为12cm，宽为8cm，求对角线长度', type: 'geometry', difficulty: 'medium' },
      { id: 5, text: '等边三角形的边长为10cm，求它的面积', type: 'geometry', difficulty: 'medium' },
      { id: 6, text: '圆柱体的底面半径为3cm，高为10cm，求体积和表面积', type: 'geometry', difficulty: 'hard' },
      { id: 7, text: '球体的半径为6cm，求表面积和体积', type: 'geometry', difficulty: 'hard' }
    ],
    default: [
      { id: 1, text: '计算：125 × 16 ÷ 25', type: 'arithmetic', difficulty: 'easy' },
      { id: 2, text: '计算：999 × 999 + 1999', type: 'arithmetic', difficulty: 'medium' },
      { id: 3, text: '简算：(12 + 24 + 36 + 48) ÷ 6', type: 'arithmetic', difficulty: 'easy' },
      { id: 4, text: '简算：25 × 32 × 125', type: 'arithmetic', difficulty: 'medium' },
      { id: 5, text: '计算：9999 × 2222 + 3333 × 3334', type: 'arithmetic', difficulty: 'hard' },
      { id: 6, text: '简算：1 + 2 + 3 + ... + 99 + 100', type: 'arithmetic', difficulty: 'medium' }
    ]
  },
  physics: {
    kinematics: [
      { id: 1, text: '物体从静止开始做匀加速直线运动，加速度为2m/s²，求5秒后的速度', type: 'kinematics', difficulty: 'medium' },
      { id: 2, text: '汽车以10m/s的速度行驶，刹车加速度大小为2m/s²，求刹车后5秒内的位移', type: 'kinematics', difficulty: 'medium' },
      { id: 3, text: '自由下落的物体，求下落20米时的速度大小（g取10m/s²）', type: 'kinematics', difficulty: 'easy' },
      { id: 4, text: '物体竖直上抛，初速度为30m/s，求上升的最大高度（g取10m/s²）', type: 'kinematics', difficulty: 'medium' },
      { id: 5, text: '小车从斜面顶端滑下，初速度为0，加速度为4m/s²，斜面长8米，求滑到底端的时间', type: 'kinematics', difficulty: 'hard' },
      { id: 6, text: 'A、B两车相距100m，A车在前以10m/s匀速，B车在后以20m/s匀速，B车何时追上A车', type: 'kinematics', difficulty: 'hard' }
    ],
    mechanics: [
      { id: 1, text: '质量为5kg的物体，在水平面上受到20N的水平拉力，摩擦系数为0.2，求加速度（g取10m/s²）', type: 'mechanics', difficulty: 'medium' },
      { id: 2, text: '弹簧原长10cm，挂上2N的重物后长11cm，求弹簧的劲度系数', type: 'mechanics', difficulty: 'easy' },
      { id: 3, text: '两个力大小分别为3N和4N，夹角为90度，求它们的合力大小', type: 'mechanics', difficulty: 'easy' },
      { id: 4, text: '质量为2kg的物体做匀速圆周运动，半径为1m，线速度为4m/s，求向心力大小', type: 'mechanics', difficulty: 'medium' },
      { id: 5, text: '滑轮组下挂着重物，用200N的拉力将600N的物体匀速提升，求滑轮组的机械效率', type: 'mechanics', difficulty: 'hard' },
      { id: 6, text: '质量为10kg的物体放在倾角37度的斜面上，求物体受到的摩擦力（sin37°=0.6，cos37°=0.8）', type: 'mechanics', difficulty: 'hard' }
    ],
    electricity: [
      { id: 1, text: '电阻R1=10Ω，R2=20Ω，串联接在6V电源上，求电路中的电流', type: 'electricity', difficulty: 'easy' },
      { id: 2, text: '电阻R1=6Ω，R2=3Ω，并联接在6V电源上，求总电流', type: 'electricity', difficulty: 'medium' },
      { id: 3, text: '一盏灯标有"220V 40W"，求它正常工作时的电阻和电流', type: 'electricity', difficulty: 'medium' },
      { id: 4, text: '电能表标有"3000r/kW·h"，10分钟转了150转，求用电器的功率', type: 'electricity', difficulty: 'hard' },
      { id: 5, text: '把"6V 3W"的灯泡接在9V的电源上，需要串联多大的电阻才能正常发光', type: 'electricity', difficulty: 'hard' }
    ],
    default: [
      { id: 1, text: '质量为50kg的人站在电梯里，电梯以2m/s²加速上升，求人对地板的压力（g取10m/s²）', type: 'mechanics', difficulty: 'medium' },
      { id: 2, text: '容积为1立方米的水，温度从20℃升高到80℃，吸收的热量是多少', type: 'thermology', difficulty: 'medium' },
      { id: 3, text: '入射光线与镜面夹角为30度，求反射角大小', type: 'optics', difficulty: 'easy' },
      { id: 4, text: '凸透镜的焦距为10cm，物体放在距透镜15cm处，求像的位置和性质', type: 'optics', difficulty: 'hard' }
    ]
  },
  chinese: {
    classical: [
      { id: 1, text: '解释《论语》中"学而时习之，不亦说乎"中"说"的意思', type: 'classical', difficulty: 'easy' },
      { id: 2, text: '翻译"阡陌交通，鸡犬相闻"（《桃花源记》）', type: 'classical', difficulty: 'medium' },
      { id: 3, text: '解释"孰为汝多知乎"中"知"的通假字和意思', type: 'classical', difficulty: 'medium' },
      { id: 4, text: '翻译"所以动心忍性，曾益其所不能"（《生于忧患，死于安乐》）', type: 'classical', difficulty: 'hard' },
      { id: 5, text: '解释"牺牲玉帛，弗敢加也"中"牺牲"的古今异义', type: 'classical', difficulty: 'hard' },
      { id: 6, text: '翻译"微斯人，吾谁与归"（《岳阳楼记》），注意倒装句式', type: 'classical', difficulty: 'hard' }
    ],
    poetry: [
      { id: 1, text: '分析杜甫《春望》中"感时花溅泪，恨别鸟惊心"的表现手法', type: 'poetry', difficulty: 'medium' },
      { id: 2, text: '李白《静夜思》表达了作者怎样的思想感情？', type: 'poetry', difficulty: 'easy' },
      { id: 3, text: '赏析王维《使至塞上》中"大漠孤烟直，长河落日圆"的画面美', type: 'poetry', difficulty: 'hard' },
      { id: 4, text: '白居易《钱塘湖春行》是如何描写早春景象的？', type: 'poetry', difficulty: 'medium' },
      { id: 5, text: '苏轼《水调歌头·明月几时有》中"但愿人长久，千里共婵娟"有什么含义？', type: 'poetry', difficulty: 'medium' }
    ],
    reading: [
      { id: 1, text: '概括《背影》中父亲的形象特点', type: 'reading', difficulty: 'medium' },
      { id: 2, text: '《孔乙己》中周围人对孔乙己的态度说明了什么社会问题？', type: 'reading', difficulty: 'hard' },
      { id: 3, text: '《故乡》中闰土的变化反映了什么主题？', type: 'reading', difficulty: 'hard' },
      { id: 4, text: '分析《荷塘月色》中景物描写的作用', type: 'reading', difficulty: 'medium' },
      { id: 5, text: '《我的叔叔于勒》采用第一人称叙述有什么好处？', type: 'reading', difficulty: 'hard' }
    ],
    default: [
      { id: 1, text: '改正句子中的错别字：他迫不急待地打开了书包', type: 'vocabulary', difficulty: 'easy' },
      { id: 2, text: '用修改符号修改病句：通过这次活动，使我深受启发', type: 'grammar', difficulty: 'easy' },
      { id: 3, text: '将"小鸟在树上叫"扩写成不少于50字的一段话', type: 'writing', difficulty: 'medium' },
      { id: 4, text: '写一个描写雨景的片段，运用比喻和拟人修辞', type: 'writing', difficulty: 'medium' }
    ]
  },
  english: {
    grammar: [
      { id: 1, text: '用正确形式填空：He ______ (go) to school every day.', type: 'grammar', difficulty: 'easy' },
      { id: 2, text: '选择正确答案：She ______ TV when I called her. A. watches B. watched C. was watching D. is watching', type: 'grammar', difficulty: 'medium' },
      { id: 3, text: '将句子改为被动语态：We built this house last year.', type: 'grammar', difficulty: 'hard' },
      { id: 4, text: '用适当的关系词填空：This is the book ______ I bought yesterday.', type: 'grammar', difficulty: 'medium' },
      { id: 5, text: '改写成感叹句：She is a beautiful girl.', type: 'grammar', difficulty: 'easy' },
      { id: 6, text: '将直接引语改为间接引语：He said, "I am very happy."', type: 'grammar', difficulty: 'hard' }
    ],
    vocabulary: [
      { id: 1, text: '写出下列单词的复数形式：child, tomato, knife, sheep', type: 'vocabulary', difficulty: 'easy' },
      { id: 2, text: '写出下列形容词的比较级和最高级：good, big, beautiful', type: 'vocabulary', difficulty: 'medium' },
      { id: 3, text: '用所给词的适当形式填空：She is ______ (interest) in English.', type: 'vocabulary', difficulty: 'easy' },
      { id: 4, text: '写出下列动词的过去式和过去分词：go, do, see, write', type: 'vocabulary', difficulty: 'medium' },
      { id: 5, text: '根据句意及首字母提示完成单词：December is the t______ month of a year.', type: 'vocabulary', difficulty: 'hard' }
    ],
    reading: [
      { id: 1, text: '翻译句子：The more you practice, the better you will become.', type: 'translation', difficulty: 'medium' },
      { id: 2, text: '翻译句子：It is never too old to learn.', type: 'translation', difficulty: 'easy' },
      { id: 3, text: '翻译句子：Where there is a will, there is a way.', type: 'translation', difficulty: 'medium' },
      { id: 4, text: '用英语写一段介绍你自己的话，不少于5句话', type: 'writing', difficulty: 'medium' },
      { id: 5, text: '翻译句子：Action speaks louder than words.', type: 'translation', difficulty: 'hard' }
    ],
    default: [
      { id: 1, text: '写出5个关于颜色的英语单词', type: 'vocabulary', difficulty: 'easy' },
      { id: 2, text: '用英语写出一周七天的名称', type: 'vocabulary', difficulty: 'easy' },
      { id: 3, text: '写出5个职业的英语单词', type: 'vocabulary', difficulty: 'easy' },
      { id: 4, text: '写出5种动物的英语名称', type: 'vocabulary', difficulty: 'easy' }
    ]
  },
  chemistry: {
    reaction: [
      { id: 1, text: '写出氢气在氧气中燃烧的化学方程式', type: 'reaction', difficulty: 'easy' },
      { id: 2, text: '配平化学方程式：Fe + O₂ → Fe₃O₄', type: 'reaction', difficulty: 'medium' },
      { id: 3, text: '写出实验室制取氧气的化学方程式（写一种即可）', type: 'reaction', difficulty: 'medium' },
      { id: 4, text: '写出盐酸和氢氧化钠反应的化学方程式，并指出反应类型', type: 'reaction', difficulty: 'hard' },
      { id: 5, text: '写出铁和硫酸铜溶液反应的化学方程式，指出实验现象', type: 'reaction', difficulty: 'hard' },
      { id: 6, text: '写出碳酸钠和盐酸反应的化学方程式', type: 'reaction', difficulty: 'medium' }
    ],
    calculation: [
      { id: 1, text: '计算H₂O的相对分子质量（H:1, O:16）', type: 'calculation', difficulty: 'easy' },
      { id: 2, text: '计算CO₂中碳元素和氧元素的质量比（C:12, O:16）', type: 'calculation', difficulty: 'easy' },
      { id: 3, text: '计算NH₄NO₃中氮元素的质量分数（N:14, H:1, O:16）', type: 'calculation', difficulty: 'medium' },
      { id: 4, text: '10g氢气在氧气中充分燃烧，生成水的质量是多少？（H:1, O:16）', type: 'calculation', difficulty: 'hard' },
      { id: 5, text: '100g溶质质量分数为9.8%的稀硫酸与足量锌反应，生成氢气的质量是多少？（Zn:65, H:1, S:32, O:16）', type: 'calculation', difficulty: 'hard' }
    ],
    default: [
      { id: 1, text: '写出下列物质的化学式：氯化钠、二氧化碳、硫酸', type: 'formula', difficulty: 'easy' },
      { id: 2, text: '什么是质量守恒定律？', type: 'concept', difficulty: 'medium' },
      { id: 3, text: '金属活动性顺序表是什么？它有什么应用？', type: 'concept', difficulty: 'hard' },
      { id: 4, text: '复分解反应发生的条件是什么？', type: 'concept', difficulty: 'hard' }
    ]
  },
  biology: {
    cell: [
      { id: 1, text: '动物细胞和植物细胞的主要区别是什么？', type: 'cell', difficulty: 'medium' },
      { id: 2, text: '细胞分裂和细胞分化有什么区别？', type: 'cell', difficulty: 'medium' },
      { id: 3, text: '细胞膜的主要功能是什么？', type: 'cell', difficulty: 'easy' },
      { id: 4, text: '细胞核在细胞生命活动中有什么作用？', type: 'cell', difficulty: 'easy' },
      { id: 5, text: '什么是光合作用？它的反应式是什么？', type: 'cell', difficulty: 'hard' }
    ],
    genetics: [
      { id: 1, text: '什么是基因？基因和DNA的关系是什么？', type: 'genetics', difficulty: 'hard' },
      { id: 2, text: '显性基因和隐性基因有什么区别？', type: 'genetics', difficulty: 'medium' },
      { id: 3, text: '什么是染色体？人的体细胞中有多少对染色体？', type: 'genetics', difficulty: 'easy' },
      { id: 4, text: '为什么说DNA是主要的遗传物质？', type: 'genetics', difficulty: 'hard' },
      { id: 5, text: '什么是变异？变异对生物进化有什么意义？', type: 'genetics', difficulty: 'hard' }
    ],
    physiology: [
      { id: 1, text: '消化系统由哪些器官组成？', type: 'physiology', difficulty: 'easy' },
      { id: 2, text: '血液循环的路径是怎样的？', type: 'physiology', difficulty: 'hard' },
      { id: 3, text: '呼吸系统的主要功能是什么？', type: 'physiology', difficulty: 'easy' },
      { id: 4, text: '神经系统的基本单位是什么？反射弧由哪几部分组成？', type: 'physiology', difficulty: 'hard' },
      { id: 5, text: '胰岛素有什么作用？胰岛素分泌不足会导致什么疾病？', type: 'physiology', difficulty: 'medium' }
    ],
    default: [
      { id: 1, text: '什么是生态系统？生态系统的组成成分有哪些？', type: 'ecology', difficulty: 'medium' },
      { id: 2, text: '什么是食物链和食物网？', type: 'ecology', difficulty: 'easy' },
      { id: 3, text: '光合作用和呼吸作用有什么区别和联系？', type: 'physiology', difficulty: 'hard' },
      { id: 4, text: '什么是蒸腾作用？它对植物有什么意义？', type: 'physiology', difficulty: 'medium' }
    ]
  }
}

export function detectQuestionType(subject, questionText) {
  const text = questionText.toLowerCase()
  
  if (subject === 'math') {
    if (text.includes('解方程') || text.includes('=') || (text.includes('x') && text.includes('y'))) {
      return 'equation'
    }
    if (text.includes('不等式') || text.includes('>') || text.includes('<') || text.includes('|')) {
      return 'inequality'
    }
    if (text.includes('导数') || text.includes('最大值') || text.includes('最小值') || text.includes('极值') || text.includes('f(x)')) {
      return 'calculus'
    }
    if (text.includes('面积') || text.includes('体积') || text.includes('周长') || text.includes('三角形') || text.includes('圆')) {
      return 'geometry'
    }
    return 'default'
  }
  
  if (subject === 'physics') {
    if (text.includes('速度') || text.includes('位移') || text.includes('加速度') || text.includes('运动')) {
      return 'kinematics'
    }
    if (text.includes('电压') || text.includes('电流') || text.includes('电阻') || text.includes('功率') || text.includes('电路')) {
      return 'electricity'
    }
    if (text.includes('力') || text.includes('质量') || text.includes('滑轮') || text.includes('弹簧')) {
      return 'mechanics'
    }
    return 'default'
  }
  
  if (subject === 'chinese') {
    if (text.includes('文言文') || text.includes('翻译') || text.includes('解释') || text.includes('加点词')) {
      return 'classical'
    }
    if (text.includes('诗') || text.includes('赏析') || text.includes('古诗')) {
      return 'poetry'
    }
    if (text.includes('阅读') || text.includes('概括') || text.includes('分析')) {
      return 'reading'
    }
    return 'default'
  }
  
  if (subject === 'english') {
    if (text.includes('填空') || text.includes('时态') || text.includes('被动') || text.includes('语态')) {
      return 'grammar'
    }
    if (text.includes('单词') || text.includes('复数') || text.includes('比较级')) {
      return 'vocabulary'
    }
    if (text.includes('翻译') || text.includes('作文')) {
      return 'reading'
    }
    return 'default'
  }
  
  if (subject === 'chemistry') {
    if (text.includes('方程式') || text.includes('燃烧') || text.includes('反应')) {
      return 'reaction'
    }
    if (text.includes('计算') || text.includes('质量') || text.includes('分数')) {
      return 'calculation'
    }
    return 'default'
  }
  
  if (subject === 'biology') {
    if (text.includes('细胞')) {
      return 'cell'
    }
    if (text.includes('基因') || text.includes('DNA') || text.includes('遗传')) {
      return 'genetics'
    }
    if (text.includes('系统') || text.includes('血液') || text.includes('神经')) {
      return 'physiology'
    }
    return 'default'
  }
  
  return 'default'
}

export function detectDifficulty(questionText) {
  const text = questionText
  
  const hardKeywords = ['证明', '综合', '压轴', '竞赛', '最难', '复杂', '分析']
  const easyKeywords = ['简单', '基础', '容易', '计算', '直接']
  
  let hardCount = 0
  let easyCount = 0
  
  for (const keyword of hardKeywords) {
    if (text.includes(keyword)) hardCount++
  }
  
  for (const keyword of easyKeywords) {
    if (text.includes(keyword)) easyCount++
  }
  
  if (hardCount > 0) return 'hard'
  if (easyCount > 1) return 'easy'
  return 'medium'
}

export function getPracticeQuestions(subject, type, difficulty, count) {
  const subjectDB = practiceDatabase[subject] || practiceDatabase.math
  const typeDB = subjectDB[type] || subjectDB.default
  
  let filtered = typeDB
  
  if (difficulty) {
    const sameDifficulty = typeDB.filter(q => q.difficulty === difficulty)
    if (sameDifficulty.length > 0) {
      filtered = sameDifficulty
    }
  }
  
  const shuffled = [...filtered].sort(() => Math.random() - 0.5)
  
  return shuffled.slice(0, count)
}
