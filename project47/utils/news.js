const store = require('./store')

const CATEGORIES = ['头条', '科技', '财经', '体育', '娱乐']

const SOURCES = ['新华社', '人民日报', '央视新闻', '腾讯新闻', '网易新闻', '新浪新闻', '搜狐新闻', '凤凰网']

const generateNewsData = () => {
  const newsList = []
  let id = 1

  const newsTemplates = {
    '头条': [
      { title: '国家发布重大政策利好，多领域迎来发展新机遇', summary: '国务院今日发布一系列重要政策措施，涵盖经济、科技、民生等多个领域...' },
      { title: '全国经济运行总体平稳，高质量发展取得新成效', summary: '国家统计局发布最新数据显示，我国经济运行保持在合理区间...' },
      { title: '重大科技突破：我国科学家在量子计算领域取得新进展', summary: '中国科学院团队成功研发新一代量子处理器，运算效率提升数倍...' },
      { title: '民生保障再升级，多项惠民政策落地实施', summary: '各地积极推进民生工程，教育、医疗、养老等领域保障水平持续提高...' },
      { title: '一带一路建设成果丰硕，国际合作迈上新台阶', summary: '五年多来，一带一路倡议得到越来越多国家响应，合作项目遍地开花...' },
      { title: '生态文明建设成效显著，绿色发展理念深入人心', summary: '我国生态环境质量持续改善，美丽中国建设迈出坚实步伐...' },
      { title: '乡村振兴战略深入推进，农业农村发展活力迸发', summary: '各地因地制宜发展特色产业，农民收入稳步增长...' },
      { title: '改革开放持续深化，市场活力不断激发', summary: '简政放权、优化服务，营商环境持续改善...' },
      { title: '科技创新驱动发展，新产业新业态加速成长', summary: '数字经济、人工智能等新兴产业成为经济增长新引擎...' },
      { title: '文化强国建设扎实推进，文化自信显著增强', summary: '中华优秀传统文化创造性转化、创新性发展取得丰硕成果...' },
      { title: '健康中国行动全面实施，人民健康水平稳步提升', summary: '公共卫生服务体系不断完善，全民健身蔚然成风...' },
      { title: '社会保障体系更加健全，群众获得感幸福感增强', summary: '养老保险、医疗保险覆盖范围持续扩大，保障水平稳步提高...' },
      { title: '住房保障体系不断完善，保障性住房建设加快推进', summary: '更多困难群众圆了安居梦，房地产市场平稳健康发展...' },
      { title: '交通基础设施建设成就辉煌，出行更加便捷高效', summary: '高铁、高速公路网络四通八达，民航、水运服务能力大幅提升...' },
      { title: '能源结构持续优化，清洁能源发展迅速', summary: '可再生能源装机容量稳步增长，绿色低碳发展成效显著...' },
      { title: '教育公平取得新进展，教育质量稳步提升', summary: '义务教育均衡发展深入推进，高等教育内涵式发展成效显著...' },
      { title: '就业形势总体稳定，就业质量持续提高', summary: '创业带动就业效应明显，重点群体就业得到有效保障...' },
      { title: '收入分配结构持续优化，居民收入稳步增长', summary: '城乡居民收入差距继续缩小，中等收入群体持续扩大...' },
      { title: '脱贫攻坚成果巩固拓展，共同富裕迈出坚实步伐', summary: '防止返贫监测帮扶机制不断健全，脱贫地区发展活力持续增强...' },
      { title: '国家安全体系更加完善，社会大局保持稳定', summary: '平安中国建设深入推进，人民群众安全感持续提升...' }
    ],
    '科技': [
      { title: 'AI大模型技术再升级，多模态能力显著提升', summary: '新一代人工智能模型在图像识别、自然语言处理等方面取得突破性进展...' },
      { title: '5G应用场景持续拓展，千行百业数字化转型加速', summary: '5G+工业互联网、智慧医疗、远程教育等应用场景不断涌现...' },
      { title: '芯片自主研发取得重要突破，国产芯片性能大幅提升', summary: '国内芯片企业在先进制程、封装测试等方面取得关键技术突破...' },
      { title: '新能源汽车技术创新活跃，续航里程持续突破', summary: '电池技术、电机技术不断进步，新能源汽车市场竞争力显著增强...' },
      { title: '航天技术取得新突破，空间站建设稳步推进', summary: '神舟系列飞船成功发射，中国空间站进入应用与发展新阶段...' },
      { title: '区块链技术应用落地加速，实体经济融合加深', summary: '供应链金融、数字版权、食品安全溯源等领域应用成效显著...' },
      { title: '元宇宙概念持续升温，VR/AR技术快速发展', summary: '虚拟现实、增强现实设备性能提升，消费级市场逐渐成熟...' },
      { title: '云计算市场规模持续扩大，云原生技术成为主流', summary: '企业上云步伐加快，云原生架构成为数字化转型重要支撑...' },
      { title: '大数据技术深度应用，数据要素价值加速释放', summary: '数据治理体系不断完善，数据驱动决策成为企业核心能力...' },
      { title: '网络安全技术升级，零信任架构广泛应用', summary: '网络安全防护能力持续提升，关键信息基础设施安全得到有效保障...' },
      { title: '物联网设备爆发式增长，万物互联时代来临', summary: '智能家居、智慧工厂、智慧城市等应用场景快速发展...' },
      { title: '自动驾驶技术逐步成熟，商业化应用加速推进', summary: 'L2+级自动驾驶车型大规模量产，高级别自动驾驶测试范围扩大...' },
      { title: '量子通信技术实用化进程加快，安全通信能力提升', summary: '量子密钥分发网络建设推进，政务、金融等领域率先应用...' },
      { title: '生物技术与信息技术深度融合，精准医疗时代开启', summary: '基因测序、AI辅助诊断等技术快速发展，个性化医疗成为可能...' },
      { title: '储能技术取得重大突破，新能源消纳能力提升', summary: '新型电池技术研发加速，储能成本持续下降...' },
      { title: '半导体材料国产化进程加快，产业链自主可控能力增强', summary: '光刻胶、特种气体等关键材料取得突破，供应链安全保障提升...' },
      { title: '工业互联网平台快速发展，制造业数字化转型深入', summary: '重点行业工业互联网平台落地应用，生产效率大幅提升...' },
      { title: '人机协作机器人市场增长迅速，智能制造水平提升', summary: '协作机器人在汽车、电子等行业广泛应用，柔性制造能力增强...' },
      { title: '智慧城市建设全面推进，城市治理能力现代化加速', summary: '城市大脑、智慧交通、智慧安防等系统集成应用，城市运行更高效...' },
      { title: '数字孪生技术应用场景拓展，虚实融合发展加速', summary: '数字孪生在工业、建筑、城市管理等领域落地，赋能实体经济...' }
    ],
    '财经': [
      { title: 'A股市场持续走强，投资者信心显著提升', summary: '多重利好因素推动股市上涨，市场交投活跃...' },
      { title: '人民币汇率保持稳定，外汇储备规模充足', summary: '我国外汇市场运行平稳，人民币汇率在合理均衡水平上保持基本稳定...' },
      { title: '上市公司业绩稳步增长，质量持续提升', summary: '年报显示，上市公司盈利水平改善，研发投入加大...' },
      { title: '货币政策灵活适度，流动性保持合理充裕', summary: '央行综合运用多种货币政策工具，为经济发展提供有力支持...' },
      { title: '财政政策加力提效，重点领域支出保障有力', summary: '积极财政政策持续发力，基建投资、民生保障等重点领域支出增长...' },
      { title: '房地产市场平稳健康发展，政策优化调整显效', summary: '各地因城施策，支持刚性和改善性住房需求，市场预期逐步改善...' },
      { title: '消费市场持续复苏，升级类商品增长较快', summary: '社会消费品零售总额稳步增长，线上线下消费融合发展...' },
      { title: '外贸进出口稳中提质，结构持续优化', summary: '一般贸易占比提升，机电产品出口增长较快，市场多元化成效显著...' },
      { title: '利用外资规模稳定增长，质量效益提升', summary: '高技术产业吸收外资增长明显，外资企业看好中国市场...' },
      { title: '银行业保险业运行稳健，服务实体经济能力增强', summary: '金融机构加大对小微企业、绿色发展等重点领域支持力度...' },
      { title: '债券市场功能深化，直接融资比重提升', summary: '债券品种不断丰富，服务实体经济融资需求能力增强...' },
      { title: '基金市场规模稳步扩大，投资者结构持续优化', summary: '公募基金、私募基金规模增长，机构投资者占比提升...' },
      { title: '普惠金融深入推进，小微企业融资成本下降', summary: '金融支持小微企业力度加大，融资便利性提升...' },
      { title: '绿色金融快速发展，双碳目标金融支持有力', summary: '绿色贷款、绿色债券规模快速增长，碳市场运行平稳...' },
      { title: '数字人民币试点范围扩大，应用场景不断丰富', summary: '数字人民币在零售、政务、跨境等领域试点应用取得积极成效...' },
      { title: '资本市场改革持续深化，基础制度更加完善', summary: '注册制改革全面推进，上市公司质量提升，市场生态持续优化...' },
      { title: '居民财富管理需求增长，资产配置多元化', summary: '居民理财意识增强，股票、基金、保险等配置比例提升...' },
      { title: '国企改革深化提升行动扎实推进，核心竞争力增强', summary: '国有企业聚焦主责主业，战略新兴产业布局加快...' },
      { title: '民营企业发展环境持续优化，发展信心增强', summary: '支持民营经济发展政策落地，民营企业创新活力迸发...' },
      { title: '区域协调发展深入推进，优势互补高质量发展', summary: '京津冀、长三角、粤港澳大湾区等区域发展动能强劲...' }
    ],
    '体育': [
      { title: '中国队在国际赛场再创佳绩，金牌总数名列前茅', summary: '中国体育代表团在多项国际赛事中表现出色，展现强大竞技实力...' },
      { title: '中超联赛精彩继续，争冠形势日趋激烈', summary: '各支球队竞技状态出色，比赛悬念迭起，球迷热情高涨...' },
      { title: 'CBA总决赛激战正酣，强强对话备受关注', summary: '两支劲旅展开巅峰对决，精彩比赛点燃篮球迷热情...' },
      { title: '网球大满贯赛事开打，中国选手表现值得期待', summary: '多位中国选手跻身正赛，有望创造佳绩...' },
      { title: '马拉松运动蓬勃发展，路跑赛事遍地开花', summary: '全国各地马拉松赛事火热举办，全民健身蔚然成风...' },
      { title: '电竞产业快速发展，赛事关注度持续攀升', summary: '电子竞技赛事观看人数创新高，产业生态日趋完善...' },
      { title: '冰雪运动持续升温，冬奥效应持续显现', summary: '群众参与冰雪运动热情高涨，冰雪产业蓬勃发展...' },
      { title: '青少年体育工作扎实推进，后备人才培养加强', summary: '体教融合深入发展，青少年体育赛事体系不断完善...' },
      { title: '全民健身公共服务体系不断完善，群众健身更便利', summary: '体育场地设施持续增加，全民健身活动广泛开展...' },
      { title: '体育产业规模稳步扩大，融合发展态势良好', summary: '体育+旅游、体育+康养等新业态快速发展...' },
      { title: '足球改革深化推进，青训体系建设加强', summary: '校园足球、社会足球蓬勃发展，足球人才培养体系完善...' },
      { title: '篮球运动普及度持续提升，民间赛事活跃', summary: '三人篮球、街头篮球等形式多样，群众参与度高...' },
      { title: '游泳世锦赛即将开幕，中国队全力备战', summary: '中国游泳队在多个项目上具备夺金实力...' },
      { title: '体操世锦赛中国队表现优异，传统优势项目保持强势', summary: '中国体操队在团体和单项比赛中展现强大竞争力...' },
      { title: '羽毛球赛事精彩纷呈，国羽新人崭露头角', summary: '年轻队员快速成长，为国羽注入新活力...' },
      { title: '乒乓球世锦赛中国队包揽金牌，霸主地位稳固', summary: '中国乒乓球队展现强大统治力，继续引领世界乒坛...' },
      { title: '排球联赛竞争激烈，各队实力接近', summary: '多支球队展现夺冠潜力，比赛充满悬念...' },
      { title: '田径项目多点突破，中国速度令人振奋', summary: '短跑、跨栏等项目成绩提升，中国田径实力增强...' },
      { title: '水上运动发展迅速，赛艇、皮划艇成绩突破', summary: '中国水上项目在国际赛场竞争力提升...' },
      { title: '举重队世锦赛表现出色，打破多项世界纪录', summary: '中国举重队展现绝对实力，为祖国赢得荣誉...' }
    ],
    '娱乐': [
      { title: '热门电影票房创新高，国产影片口碑票房双丰收', summary: '多部国产大片上映，观影热潮持续，中国电影市场活力迸发...' },
      { title: '热播电视剧引发全民热议，优质内容获好评', summary: '现实题材作品引发观众共鸣，制作水平不断提升...' },
      { title: '综艺节目创新不断，多元内容满足观众需求', summary: '文化类、音乐类、竞技类综艺精彩纷呈，收视表现亮眼...' },
      { title: '乐坛新人辈出，原创音乐蓬勃发展', summary: '音乐市场活力十足，各类音乐风格百花齐放...' },
      { title: '演唱会市场火爆回归，歌手巡演一票难求', summary: '线下演出全面复苏，歌迷热情高涨...' },
      { title: '国漫崛起势头强劲，优质作品层出不穷', summary: '国产动画在技术和内容上双提升，走向世界舞台...' },
      { title: '短视频平台持续火热，内容创作生态繁荣', summary: '创作者数量持续增长，优质内容不断涌现...' },
      { title: '数字藏品市场发展迅速，文化IP价值凸显', summary: '传统文化与数字技术结合，开辟文创产业新赛道...' },
      { title: '游戏精品化趋势明显，国产游戏出海成绩斐然', summary: '中国游戏企业研发实力增强，国际市场份额提升...' },
      { title: '话剧舞台剧市场回暖，演出场次大幅增加', summary: '线下剧场人气回升，观众艺术消费需求增长...' },
      { title: '时尚产业蓬勃发展，国潮品牌受青睐', summary: '本土设计师品牌崛起，中国时尚影响力扩大...' },
      { title: '网络文学IP改编持续火热，影视化作品爆款频出', summary: '优质网文IP价值持续释放，全产业链开发加速...' },
      { title: '脱口秀文化破圈，喜剧市场蓬勃发展', summary: '脱口秀节目和线下演出受到年轻人追捧...' },
      { title: '音乐节市场火爆，年轻人户外娱乐需求旺盛', summary: '各地音乐节扎堆举办，成为年轻人社交娱乐新方式...' },
      { title: '艺术展览人气旺盛，文化消费升级明显', summary: '各类艺术展览吸引大量观众，美育工作成效显著...' },
      { title: '偶像团体竞争激烈，选秀节目创新求变', summary: '偶像市场趋于理性，艺人综合实力提升...' },
      { title: '非遗文化年轻化，传统技艺焕发新生', summary: '非遗传承人通过短视频等新形式传播传统文化...' },
      { title: '线上演出成为新常态，云娱乐模式持续发展', summary: '线上线下融合发展，演艺行业呈现新形态...' },
      { title: '剧本杀、密室逃脱等新业态持续火爆', summary: '沉浸式娱乐成为年轻人社交新宠...' },
      { title: '直播电商发展迅速，内容电商成趋势', summary: '主播与内容创作者跨界融合，带货形式创新...' }
    ]
  }

  const coverImages = {
    '头条': 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=500&fit=crop',
    '科技': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=500&fit=crop',
    '财经': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=500&fit=crop',
    '体育': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=500&fit=crop',
    '娱乐': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=500&fit=crop'
  }

  CATEGORIES.forEach(category => {
    const templates = newsTemplates[category]
    for (let i = 0; i < 20; i++) {
      const template = templates[i % templates.length]
      const suffix = i >= templates.length ? `（${Math.floor(i / templates.length) + 1}）` : ''
      const daysAgo = Math.floor(Math.random() * 30)
      const hoursAgo = Math.floor(Math.random() * 24)
      const publishTime = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000 - hoursAgo * 60 * 60 * 1000)

      newsList.push({
        id: id++,
        title: template.title + suffix,
        summary: template.summary,
        content: generateRichContent(template.title, template.summary),
        coverImage: coverImages[category],
        source: SOURCES[Math.floor(Math.random() * SOURCES.length)],
        publishTime: formatTime(publishTime),
        category
      })
    }
  })

  return newsList
}

const generateRichContent = (title, summary) => {
  return `<div style="padding: 20px;">
    <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 16px; color: #333;">${title}</h1>
    <p style="font-size: 16px; line-height: 1.8; color: #666; margin-bottom: 20px;">${summary}</p>
    <p style="font-size: 16px; line-height: 1.8; color: #333; margin-bottom: 16px;">
    这是新闻的详细内容。近年来，相关领域取得了显著进展，各项工作扎实推进，成效显著。
    专家表示，这一发展趋势符合预期，将为行业带来新的机遇和挑战。
    </p>
    <p style="font-size: 16px; line-height: 1.8; color: #333; margin-bottom: 16px;">
    据了解，相关部门已经出台了一系列配套措施，确保各项政策落地见效。
    市场反应积极，行业信心持续增强，发展前景十分广阔。
    </p>
    <h2 style="font-size: 20px; font-weight: bold; margin: 24px 0 16px; color: #333;">发展背景</h2>
    <p style="font-size: 16px; line-height: 1.8; color: #333; margin-bottom: 16px;">
    在国家政策的大力支持下，各方面力量积极参与，形成了良好的发展格局。
    技术创新不断突破，产业升级步伐加快，市场活力持续迸发。
    </p>
    <h2 style="font-size: 20px; font-weight: bold; margin: 24px 0 16px; color: #333;">未来展望</h2>
    <p style="font-size: 16px; line-height: 1.8; color: #333; margin-bottom: 16px;">
    展望未来，发展潜力巨大，机遇与挑战并存。我们要抓住机遇，迎接挑战，
    推动高质量发展不断取得新成效，为全面建设社会主义现代化国家作出更大贡献。
    </p>
    <p style="font-size: 14px; color: #999; text-align: right; margin-top: 30px;">（本文为模拟新闻数据）</p>
  </div>`
}

const formatTime = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:${minute}`
}

const mockNewsData = generateNewsData()

const getNewsList = ({ category = '', page = 1, pageSize = 10, keyword = '' } = {}) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filteredNews = [...mockNewsData]

      if (category) {
        filteredNews = filteredNews.filter(news => news.category === category)
      }

      if (keyword) {
        const lowerKeyword = keyword.toLowerCase()
        filteredNews = filteredNews.filter(news =>
          news.title.toLowerCase().includes(lowerKeyword) ||
          news.summary.toLowerCase().includes(lowerKeyword)
        )
      }

      filteredNews = store.applyFilter(filteredNews)

      const total = filteredNews.length
      const totalPages = Math.ceil(total / pageSize)
      const startIndex = (page - 1) * pageSize
      const endIndex = startIndex + pageSize
      const list = filteredNews.slice(startIndex, endIndex)

      resolve({
        list,
        total,
        totalPages,
        page,
        pageSize,
        hasMore: page < totalPages
      })
    }, 300)
  })
}

const getNewsById = (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const news = mockNewsData.find(item => item.id === parseInt(id))
      if (news) {
        resolve(news)
      } else {
        reject(new Error('新闻不存在'))
      }
    }, 200)
  })
}

const getNewsByCategory = (category, page = 1, pageSize = 10) => {
  return getNewsList({ category, page, pageSize })
}

const searchNews = (keyword, page = 1, pageSize = 10) => {
  return getNewsList({ keyword, page, pageSize })
}

const getCategories = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...CATEGORIES])
    }, 100)
  })
}

module.exports = {
  CATEGORIES,
  getNewsList,
  getNewsById,
  getNewsByCategory,
  searchNews,
  getCategories
}
