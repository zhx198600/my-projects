import { Script } from '../types';

export const scriptTemplates: Script[] = [
  {
    id: 'template-mystery-001',
    userInput: '',
    title: '深夜来信',
    episodes: [
      {
        episodeNumber: 1,
        title: '第一集：神秘包裹',
        scenes: [
          {
            id: 'm01-s01',
            description: '李明独居的公寓，窗外下着雨，时钟指向凌晨两点',
            location: '李明的公寓',
            time: '凌晨2:00',
            atmosphere: '阴森诡异'
          }
        ],
        characters: [
          { id: 'char-m01-01', name: '李明', description: '32岁，软件工程师，独居，性格内向', dialogueStyle: '冷静、理性' },
          { id: 'char-m01-02', name: '王警官', description: '45岁，经验丰富的刑警，目光锐利', dialogueStyle: '严肃、专业' }
        ],
        dialogues: [
          { characterId: 'char-m01-01', characterName: '李明', content: '谁会在这个时候敲门？', emotion: '困惑' },
          { characterId: 'char-m01-01', characterName: '李明', content: '一个包裹...没有寄件人地址？', emotion: '疑惑' },
          { characterId: 'char-m01-01', characterName: '李明', content: '这封信...说我知道五年前发生了什么？', emotion: '惊恐' }
        ],
        summary: '李明在深夜收到一个匿名包裹，里面是一封威胁信，声称知道他五年前的秘密。他惊恐地发现，信中提到的日期正是他妻子失踪的那天。'
      },
      {
        episodeNumber: 2,
        title: '第二集：往事重提',
        scenes: [
          {
            id: 'm01-s02',
            description: '警察局审讯室，灯光昏暗，气氛紧张',
            location: '市公安局',
            time: '下午3:00',
            atmosphere: '压抑'
          }
        ],
        characters: [
          { id: 'char-m01-01', name: '李明', description: '32岁，软件工程师，独居，性格内向', dialogueStyle: '冷静、理性' },
          { id: 'char-m01-02', name: '王警官', description: '45岁，经验丰富的刑警，目光锐利', dialogueStyle: '严肃、专业' }
        ],
        dialogues: [
          { characterId: 'char-m01-02', characterName: '王警官', content: '五年前你妻子的失踪案，我们一直没有找到尸体。', emotion: '严肃' },
          { characterId: 'char-m01-01', characterName: '李明', content: '我已经说过很多次了，那天我加班到很晚，回家就发现她不见了。', emotion: '平静' },
          { characterId: 'char-m01-02', characterName: '王警官', content: '你公司的打卡记录显示，你那天下午六点就离开了。', emotion: '怀疑' },
          { characterId: 'char-m01-01', characterName: '李明', content: '我...我可能记错了。那段时间压力很大。', emotion: '紧张' }
        ],
        summary: '李明来到警局配合调查，王警官对他五年前的证词提出了质疑。李明的解释开始出现破绽，他声称那天在加班，但打卡记录显示他提前离开了。'
      },
      {
        episodeNumber: 3,
        title: '第三集：真相大白',
        scenes: [
          {
            id: 'm01-s03',
            description: '李明的公寓地下室，尘封已久的门被打开，里面是一个上锁的房间',
            location: '李明的公寓地下室',
            time: '凌晨1:00',
            atmosphere: '恐怖'
          }
        ],
        characters: [
          { id: 'char-m01-01', name: '李明', description: '32岁，软件工程师，独居，性格内向', dialogueStyle: '冷静、理性' },
          { id: 'char-m01-02', name: '王警官', description: '45岁，经验丰富的刑警，目光锐利', dialogueStyle: '严肃、专业' }
        ],
        dialogues: [
          { characterId: 'char-m01-01', characterName: '李明', content: '你们是怎么找到这里的？', emotion: '惊讶' },
          { characterId: 'char-m01-02', characterName: '王警官', content: '那封匿名信...是你自己写的，对不对？', emotion: '愤怒' },
          { characterId: 'char-m01-01', characterName: '李明', content: '我只是想让你们找到她...让她入土为安。', emotion: '悲伤' },
          { characterId: 'char-m01-02', characterName: '王警官', content: '你杀了她，然后想通过这种方式减轻自己的罪恶感？', emotion: '震惊' },
          { characterId: 'char-m01-01', characterName: '李明', content: '不...是她自己要求的。她说与其痛苦地活着，不如让我帮她解脱。她被诊断出晚期癌症，不想死在医院里。', emotion: '崩溃' }
        ],
        summary: '警方在李明的地下室找到了他妻子的遗骸。令人震惊的是，那封匿名威胁信竟然是李明自己写的。他一直在潜意识中希望被抓，希望真相大白。原来他的妻子并非被谋杀，而是在绝症晚期请求他协助安乐死。五年来自责和愧疚让他无法安宁，最终选择了这种极端的方式来寻求解脱。',
        isTwist: true,
        twistHint: '伏笔：李明家中有大量关于绝症护理的书籍，地下室的门锁是从里面反锁的设计'
      }
    ],
    genre: '悬疑',
    createdAt: '',
    totalEpisodes: 3,
    twistType: '身份反转'
  },

  {
    id: 'template-mystery-002',
    userInput: '',
    title: '第七位乘客',
    episodes: [
      {
        episodeNumber: 1,
        title: '第一集：电梯惊魂',
        scenes: [
          {
            id: 'm02-s01',
            description: '一栋老式写字楼的电梯内，六个人被困，电梯显示屏显示\"7人\"',
            location: '凯旋大厦电梯',
            time: '晚上8:30',
            atmosphere: '诡异'
          }
        ],
        characters: [
          { id: 'char-m02-01', name: '张律师', description: '38岁，精英律师，最后一个进入电梯', dialogueStyle: '强势、理性' },
          { id: 'char-m02-02', name: '陈护士', description: '28岁，医院护士，神色慌张', dialogueStyle: '柔弱、神经质' },
          { id: 'char-m02-03', name: '王大爷', description: '65岁，退休工人，拄着拐杖', dialogueStyle: '慢悠悠、淡定' },
          { id: 'char-m02-04', name: '小美', description: '19岁，大学生，戴着耳机', dialogueStyle: '年轻、随意' }
        ],
        dialogues: [
          { characterId: 'char-m02-01', characterName: '张律师', content: '电梯坏了？按紧急呼叫按钮。', emotion: '冷静' },
          { characterId: 'char-m02-02', characterName: '陈护士', content: '你们有没有觉得...有点挤？', emotion: '不安' },
          { characterId: 'char-m02-04', characterName: '小美', content: '你在说什么呀，我们不就四个人吗？', emotion: '困惑' },
          { characterId: 'char-m02-01', characterName: '张律师', content: '等一下...电梯显示屏上写着\"承载：7人\"。', emotion: '惊讶' }
        ],
        summary: '四个人被困在写字楼电梯中。陈护士注意到电梯里感觉很拥挤，但明明只有四个人。张律师发现电梯显示屏上显示的承载人数是7人，但他们数来数去只有四个人。气氛开始变得诡异。'
      },
      {
        episodeNumber: 2,
        title: '第二集：消失的回忆',
        scenes: [
          {
            id: 'm02-s02',
            description: '电梯内灯光闪烁，众人开始互相询问是怎么来到这里的',
            location: '凯旋大厦电梯',
            time: '晚上9:00',
            atmosphere: '恐怖'
          }
        ],
        characters: [
          { id: 'char-m02-01', name: '张律师', description: '38岁，精英律师，最后一个进入电梯', dialogueStyle: '强势、理性' },
          { id: 'char-m02-02', name: '陈护士', description: '28岁，医院护士，神色慌张', dialogueStyle: '柔弱、神经质' },
          { id: 'char-m02-03', name: '王大爷', description: '65岁，退休工人，拄着拐杖', dialogueStyle: '慢悠悠、淡定' },
          { id: 'char-m02-04', name: '小美', description: '19岁，大学生，戴着耳机', dialogueStyle: '年轻、随意' }
        ],
        dialogues: [
          { characterId: 'char-m02-01', characterName: '张律师', content: '我今天...要去见一个客户。在15楼。', emotion: '努力回忆' },
          { characterId: 'char-m02-02', characterName: '陈护士', content: '我...我不记得了。我只记得医院...有个病人...', emotion: '痛苦' },
          { characterId: 'char-m02-03', characterName: '王大爷', content: '年轻人，你们有没有发现一件事？', emotion: '神秘' },
          { characterId: 'char-m02-04', characterName: '小美', content: '什么事？爷爷您别吓我。', emotion: '害怕' },
          { characterId: 'char-m02-03', characterName: '王大爷', content: '这个电梯...它从来没有动过。我们按了那么多楼层，它一次都没停过。', emotion: '诡异' }
        ],
        summary: '众人开始回忆各自来这里的目的，却发现记忆都很模糊。王大爷指出一个更可怕的事实：电梯根本就没有移动过，他们一直在同一个楼层。而且，每个人都记得有第六感第七个人的存在，但就是想不起是谁。'
      },
      {
        episodeNumber: 3,
        title: '第三集：午夜审判',
        scenes: [
          {
            id: 'm02-s03',
            description: '电梯门突然打开，外面不是楼层，而是一个法庭。所有人被告知他们已经死了',
            location: '神秘法庭',
            time: '午夜',
            atmosphere: '肃穆'
          }
        ],
        characters: [
          { id: 'char-m02-01', name: '张律师', description: '38岁，精英律师，最后一个进入电梯', dialogueStyle: '强势、理性' },
          { id: 'char-m02-02', name: '陈护士', description: '28岁，医院护士，神色慌张', dialogueStyle: '柔弱、神经质' },
          { id: 'char-m02-03', name: '王大爷', description: '65岁，退休工人，拄着拐杖', dialogueStyle: '慢悠悠、淡定' },
          { id: 'char-m02-04', name: '小美', description: '19岁，大学生，戴着耳机', dialogueStyle: '年轻、随意' },
          { id: 'char-m02-05', name: '法官', description: '神秘的审判者，看不清面容', dialogueStyle: '庄重、威严' }
        ],
        dialogues: [
          { characterId: 'char-m02-05', characterName: '法官', content: '欢迎来到审判庭。你们四人，加上今天的受害者，一共七人，都死于同一场事故。', emotion: '庄重' },
          { characterId: 'char-m02-01', characterName: '张律师', content: '七人？还有谁？', emotion: '震惊' },
          { characterId: 'char-m02-05', characterName: '法官', content: '还有电梯里的另外两个人——一对年轻的情侣。以及...那个导致事故发生的人。', emotion: '神秘' },
          { characterId: 'char-m02-02', characterName: '陈护士', content: '不...不可能是我...我只是...', emotion: '崩溃' },
          { characterId: 'char-m02-05', characterName: '法官', content: '陈护士，你在医院值夜班时太累了，回家路上开车打盹，闯红灯撞上了一辆载有五人的汽车。那五个人里，有张律师的客户，王大爷的儿子，小美的男朋友...还有你自己。', emotion: '揭露真相' },
          { characterId: 'char-m02-03', characterName: '王大爷', content: '我早就知道了。在电梯里，我一直在等她承认。', emotion: '悲伤' }
        ],
        summary: '电梯门打开后，众人发现自己身处一个神秘的法庭。法官揭示了真相：他们都已经死了。陈护士因为疲劳驾驶闯红灯，导致一场严重车祸，造成包括她自己在内的七人死亡。电梯是他们死后灵魂聚集的地方，"第七位乘客"其实是他们对死者的愧疚感的具象化。王大爷其实早就知道真相，一直在等待陈护士自己承认。',
        isTwist: true,
        twistHint: '伏笔：所有人的记忆都停留在事故发生前，王大爷对陈护士特别"关心"'
      }
    ],
    genre: '悬疑',
    createdAt: '',
    totalEpisodes: 3,
    twistType: '时空反转'
  },

  {
    id: 'template-mystery-003',
    userInput: '',
    title: '完美告别',
    episodes: [
      {
        episodeNumber: 1,
        title: '第一集：葬礼上的陌生人',
        scenes: [
          {
            id: 'm03-s01',
            description: '殡仪馆内，一场简单的葬礼正在进行，只有少数几位亲友到场',
            location: '市殡仪馆',
            time: '上午10:00',
            atmosphere: '哀伤'
          }
        ],
        characters: [
          { id: 'char-m03-01', name: '林晓', description: '30岁，死者的养女，关系疏远', dialogueStyle: '冷淡、疏离' },
          { id: 'char-m03-02', name: '老周', description: '55岁，自称是死者的老朋友，没人认识他', dialogueStyle: '温和、神秘' },
          { id: 'char-m03-03', name: '张律师', description: '40岁，负责宣读遗嘱', dialogueStyle: '专业、刻板' }
        ],
        dialogues: [
          { characterId: 'char-m03-01', characterName: '林晓', content: '你是谁？我从来没听父亲提起过你。', emotion: '警惕' },
          { characterId: 'char-m03-02', characterName: '老周', content: '很多事情，他不想让你知道。', emotion: '神秘' },
          { characterId: 'char-m03-03', characterName: '张律师', content: '林小姐，根据遗嘱，你父亲将所有财产都捐给了慈善机构。只有一样东西留给你——这个保险箱。', emotion: '严肃' },
          { characterId: 'char-m03-01', characterName: '林晓', content: '什么？他把钱都捐了？留给我一个空箱子？', emotion: '愤怒' }
        ],
        summary: '林晓参加养父的葬礼，对这位关系疏远的父亲没有太多感情。一个神秘的老周出现，声称是死者的老朋友。遗嘱宣读后，林晓震惊地发现养父把所有财产都捐了，只留给她一个空保险箱。'
      },
      {
        episodeNumber: 2,
        title: '第二集：保险箱的秘密',
        scenes: [
          {
            id: 'm03-s02',
            description: '林晓的公寓，她试图打开保险箱，老周再次出现',
            location: '林晓的公寓',
            time: '晚上7:00',
            atmosphere: '神秘'
          }
        ],
        characters: [
          { id: 'char-m03-01', name: '林晓', description: '30岁，死者的养女，关系疏远', dialogueStyle: '冷淡、疏离' },
          { id: 'char-m03-02', name: '老周', description: '55岁，自称是死者的老朋友，没人认识他', dialogueStyle: '温和、神秘' }
        ],
        dialogues: [
          { characterId: 'char-m03-01', characterName: '林晓', content: '你怎么进来的？', emotion: '惊讶' },
          { characterId: 'char-m03-02', characterName: '老周', content: '你父亲给了我一把备用钥匙。他早就知道你会需要帮助。', emotion: '温和' },
          { characterId: 'char-m03-01', characterName: '林晓', content: '这个保险箱的密码是什么？', emotion: '急切' },
          { characterId: 'char-m03-02', characterName: '老周', content: '密码是你的生日。但你要明白，里面的东西不是你想要的财富，而是你失去的记忆。', emotion: '意味深长' }
        ],
        summary: '老周闯入林晓的公寓，声称是她父亲安排来帮助她的。他告诉林晓保险箱密码是她的生日。林晓打开保险箱，发现里面不是钱财，而是一叠厚厚的信件和一张领养证明。信件上记录着一个她完全不知道的故事。'
      },
      {
        episodeNumber: 3,
        title: '第三集：最后的真相',
        scenes: [
          {
            id: 'm03-s03',
            description: '林晓看完所有信件，老周揭示了最终的秘密',
            location: '林晓的公寓',
            time: '午夜',
            atmosphere: '震撼'
          }
        ],
        characters: [
          { id: 'char-m03-01', name: '林晓', description: '30岁，死者的养女，关系疏远', dialogueStyle: '冷淡、疏离' },
          { id: 'char-m03-02', name: '老周', description: '55岁，自称是死者的老朋友，没人认识他', dialogueStyle: '温和、神秘' }
        ],
        dialogues: [
          { characterId: 'char-m03-01', characterName: '林晓', content: '这些信...是写给我的？但我看不懂上面的字。', emotion: '困惑' },
          { characterId: 'char-m03-02', characterName: '老周', content: '因为那是你小时候的笔迹。你自己写给自己的信。', emotion: '悲伤' },
          { characterId: 'char-m03-01', characterName: '林晓', content: '什么意思？我不明白...', emotion: '震惊' },
          { characterId: 'char-m03-02', characterName: '老周', content: '林晓，你父亲...不，应该说，你的丈夫。他用了一生的时间来照顾你。十年前的那场车祸，让你失去了所有记忆，智力也退回到了十岁的水平。他假装是你的养父，从零开始重新教你认识这个世界。', emotion: '揭露真相' },
          { characterId: 'char-m03-01', characterName: '林晓', content: '那...那老周你是谁？', emotion: '崩溃' },
          { characterId: 'char-m03-02', characterName: '老周', content: '我？我就是你丈夫。在你忘记我的十年里，我每天都在变老。而当你终于恢复了大部分记忆时，我的生命却走到了尽头。这就是为什么我要\"假死\"，这样我才能以老周的身份，最后一次陪伴在你身边，告诉你一切真相。', emotion: '深情' }
        ],
        summary: '最震撼的反转揭晓：林晓的"养父"实际上是她的丈夫。十年前的车祸让她失忆并智力退化，丈夫放弃一切，以养父的身份重新照顾她。当她终于康复时，丈夫却已身患绝症。他策划了自己的"假死"，化身为老周，用最后的时光引导她找回完整的记忆和他们的爱情。他捐出所有财产，是希望林晓能独立面对人生，而不是被金钱束缚。那保险箱里的，是他们爱情的全部证据——一个丈夫用十年时间创造的最伟大的爱的骗局。',
        isTwist: true,
        twistHint: '伏笔：老周对林晓的生活习惯了如指掌，照片上的丈夫面容模糊，保险箱密码是林晓的生日但她不记得'
      }
    ],
    genre: '悬疑',
    createdAt: '',
    totalEpisodes: 3,
    twistType: '关系反转'
  },

  {
    id: 'template-romance-001',
    userInput: '',
    title: '失忆的建筑师',
    episodes: [
      {
        episodeNumber: 1,
        title: '第一集：雨中的邂逅',
        scenes: [
          {
            id: 'r01-s01',
            description: '上海陆家嘴的某个咖啡馆外，一场突如其来的大雨',
            location: '陆家嘴某咖啡馆',
            time: '周五下午6:00',
            atmosphere: '浪漫'
          }
        ],
        characters: [
          { id: 'char-r01-01', name: '苏晴', description: '28岁，室内设计师，独立女性，对爱情既期待又恐惧', dialogueStyle: '直接、真诚' },
          { id: 'char-r01-02', name: '顾北辰', description: '32岁，著名建筑师，因事故失去部分记忆，性格孤僻', dialogueStyle: '冷淡、寡言' }
        ],
        dialogues: [
          { characterId: 'char-r01-01', characterName: '苏晴', content: '先生，需要共用一把伞吗？', emotion: '友好' },
          { characterId: 'char-r01-02', characterName: '顾北辰', content: '不用。', emotion: '冷淡' },
          { characterId: 'char-r01-01', characterName: '苏晴', content: '别误会，我只是要去地铁站，刚好顺路。而且雨这么大...', emotion: '尴尬' },
          { characterId: 'char-r01-02', characterName: '顾北辰', content: '...谢谢。', emotion: '不情愿' }
        ],
        summary: '苏晴在雨中帮助了一个看起来很落魄的男人顾北辰。男人对她很冷淡，说自己失忆了，不记得自己是谁，只口袋里有一张写着"顾北辰"三个字的名片。苏晴出于好心，帮他找到了临时住处。'
      },
      {
        episodeNumber: 2,
        title: '第二集：慢慢靠近',
        scenes: [
          {
            id: 'r01-s02',
            description: '苏晴的设计工作室，顾北辰在帮她整理图纸',
            location: '苏晴的工作室',
            time: '周三下午3:00',
            atmosphere: '温馨'
          }
        ],
        characters: [
          { id: 'char-r01-01', name: '苏晴', description: '28岁，室内设计师，独立女性，对爱情既期待又恐惧', dialogueStyle: '直接、真诚' },
          { id: 'char-r01-02', name: '顾北辰', description: '32岁，著名建筑师，因事故失去部分记忆，性格孤僻', dialogueStyle: '冷淡、寡言' }
        ],
        dialogues: [
          { characterId: 'char-r01-01', characterName: '苏晴', content: '你对建筑很懂嘛？这个空间规划做得比我还好。', emotion: '赞赏' },
          { characterId: 'char-r01-02', characterName: '顾北辰', content: '我不知道...看到图纸，手就自己动了。', emotion: '困惑' },
          { characterId: 'char-r01-01', characterName: '苏晴', content: '顾北辰，我发现你其实没那么冷。只是...心里有事，对不对？', emotion: '温柔' },
          { characterId: 'char-r01-02', characterName: '顾北辰', content: '苏晴...谢谢你。从来没有人...像你这样对我。', emotion: '动容' }
        ],
        summary: '顾北辰在苏晴的工作室帮忙，展现出惊人的建筑天赋。他开始敞开心扉，告诉苏晴他唯一记得的片段——一个女孩的背影，和一栋未完成的建筑。两人的关系逐渐升温，苏晴发现自己爱上了这个神秘的失忆男人。'
      },
      {
        episodeNumber: 3,
        title: '第三集：记忆碎片',
        scenes: [
          {
            id: 'r01-s03',
            description: '一个正在施工的建筑工地，顾北辰看到熟悉的场景开始恢复记忆',
            location: '浦东新区某工地',
            time: '周六上午10:00',
            atmosphere: '紧张'
          }
        ],
        characters: [
          { id: 'char-r01-01', name: '苏晴', description: '28岁，室内设计师，独立女性，对爱情既期待又恐惧', dialogueStyle: '直接、真诚' },
          { id: 'char-r01-02', name: '顾北辰', description: '32岁，著名建筑师，因事故失去部分记忆，性格孤僻', dialogueStyle: '冷淡、寡言' }
        ],
        dialogues: [
          { characterId: 'char-r01-02', characterName: '顾北辰', content: '我...我记起来了。这是我的项目。"星空之塔"...', emotion: '激动' },
          { characterId: 'char-r01-01', characterName: '苏晴', content: '顾北辰？你还好吗？', emotion: '担忧' },
          { characterId: 'char-r01-02', characterName: '顾北辰', content: '还有一个女孩...她叫...她叫...苏晴？', emotion: '震惊' },
          { characterId: 'char-r01-01', characterName: '苏晴', content: '什么？你在说什么？', emotion: '困惑' },
          { characterId: 'char-r01-02', characterName: '顾北辰', content: '这栋建筑...是我设计的，作为求婚礼物送给你的。两年前，我们在工地上发生了争执，你失足从楼梯上摔下...', emotion: '痛苦' }
        ],
        summary: '顾北辰在工地看到熟悉的场景，记忆开始恢复。他记起自己是著名建筑师顾北辰，而这栋"星空之塔"是他为爱人设计的。更惊人的是，他记起那个女孩的名字就是苏晴。'
      },
      {
        episodeNumber: 4,
        title: '第四集：真相与选择',
        scenes: [
          {
            id: 'r01-s04',
            description: '星空之塔的顶层，夕阳西下，城市美景尽收眼底',
            location: '星空之塔顶层',
            time: '周日傍晚6:00',
            atmosphere: '浪漫而伤感'
          }
        ],
        characters: [
          { id: 'char-r01-01', name: '苏晴', description: '28岁，室内设计师，独立女性，对爱情既期待又恐惧', dialogueStyle: '直接、真诚' },
          { id: 'char-r01-02', name: '顾北辰', description: '32岁，著名建筑师，因事故失去部分记忆，性格孤僻', dialogueStyle: '冷淡、寡言' }
        ],
        dialogues: [
          { characterId: 'char-r01-02', characterName: '顾北辰', content: '苏晴，两年前的事故，你失去了所有关于我的记忆。医生说你不能再受刺激。所以我...我选择了消失。', emotion: '痛苦' },
          { characterId: 'char-r01-01', characterName: '苏晴', content: '所以...那个下雨天，你不是偶然出现的。你一直在看着我？', emotion: '震惊' },
          { characterId: 'char-r01-02', characterName: '顾北辰', content: '那天我在工地出了意外，撞到了头，反而失去了关于"我们不能在一起"的记忆。所以当我看到你时，只记得我爱着你，却记不起为什么不能靠近你。', emotion: '悲伤' },
          { characterId: 'char-r01-01', characterName: '苏晴', content: '顾北辰...现在呢？你记起一切了，你打算怎么办？', emotion: '害怕' },
          { characterId: 'char-r01-02', characterName: '顾北辰', content: '我记起了一切，包括医生说的风险。但我还记起了另一件事——我有多爱你。苏晴，这一次，我不想再错过。无论结果如何，我想和你一起面对。', emotion: '坚定' },
          { characterId: 'char-r01-01', characterName: '苏晴', content: '你是个傻瓜。', emotion: '感动' },
          { characterId: 'char-r01-02', characterName: '顾北辰', content: '那你愿意做傻瓜的女朋友吗？', emotion: '紧张' },
          { characterId: 'char-r01-01', characterName: '苏晴', content: '我愿意。', emotion: '幸福' }
        ],
        summary: '最动人的反转揭晓：苏晴才是那个真正失忆的人。两年前的事故让她忘记了顾北辰，医生警告不能再让她受刺激。顾北辰为了保护她，选择从她的生活中消失，默默地守护她。直到工地事故让他自己也失忆，忘记了"不能靠近"的禁令，只记得对苏晴的爱。这才有了雨中的"邂逅"——不是偶然，而是两个失忆的人，凭借爱的本能，重新找到了彼此。现在，顾北辰恢复了全部记忆，但这一次，他选择不再放手。',
        isTwist: true,
        twistHint: '伏笔：顾北辰提到"星空之塔"时苏晴有莫名的熟悉感，顾北辰的"失忆"总是选择性地记得关于苏晴的美好'
      }
    ],
    genre: '爱情',
    createdAt: '',
    totalEpisodes: 4,
    twistType: '叙事视角反转'
  },

  {
    id: 'template-romance-002',
    userInput: '',
    title: '合租合约',
    episodes: [
      {
        episodeNumber: 1,
        title: '第一集：奇葩室友',
        scenes: [
          {
            id: 'r02-s01',
            description: '北京朝阳区一套两居室公寓，林小夏正在面试新室友',
            location: '林小夏的公寓',
            time: '周日下午2:00',
            atmosphere: '轻松'
          }
        ],
        characters: [
          { id: 'char-r02-01', name: '林小夏', description: '26岁，广告策划，活泼开朗，有点小迷糊', dialogueStyle: '活泼、直爽' },
          { id: 'char-r02-02', name: '江逸辰', description: '29岁，自称是自由职业者，神秘莫测，作息奇怪', dialogueStyle: '幽默、随性' }
        ],
        dialogues: [
          { characterId: 'char-r02-01', characterName: '林小夏', content: '所以...你是做什么工作的？自由职业具体是？', emotion: '好奇' },
          { characterId: 'char-r02-02', characterName: '江逸辰', content: '就是...各种事情。帮人解决问题。', emotion: '神秘' },
          { characterId: 'char-r02-01', characterName: '林小夏', content: '好吧，那你有什么生活习惯需要我注意的吗？', emotion: '谨慎' },
          { characterId: 'char-r02-02', characterName: '江逸辰', content: '我可能晚上工作，白天睡觉。还有，别问我为什么冰箱里总是有蛋糕。', emotion: '神秘' }
        ],
        summary: '林小夏因为房租压力，决定找一个室友。面试了几个都不满意，直到江逸辰出现。这个人看起来很神秘，但出手大方，一次性支付了半年房租。林小夏虽然觉得奇怪，但还是同意了。两人开始了奇葩的合租生活。'
      },
      {
        episodeNumber: 2,
        title: '第二集：奇怪的日常',
        scenes: [
          {
            id: 'r02-s02',
            description: '公寓客厅，林小夏发现江逸辰的更多秘密',
            location: '林小夏的公寓',
            time: '周三晚上10:00',
            atmosphere: '温馨'
          }
        ],
        characters: [
          { id: 'char-r02-01', name: '林小夏', description: '26岁，广告策划，活泼开朗，有点小迷糊', dialogueStyle: '活泼、直爽' },
          { id: 'char-r02-02', name: '江逸辰', description: '29岁，自称是自由职业者，神秘莫测，作息奇怪', dialogueStyle: '幽默、随性' }
        ],
        dialogues: [
          { characterId: 'char-r02-01', characterName: '林小夏', content: '江逸辰！你大半夜在厨房干什么？', emotion: '惊讶' },
          { characterId: 'char-r02-02', characterName: '江逸辰', content: '烤蛋糕。要来一块吗？', emotion: '自然' },
          { characterId: 'char-r02-01', characterName: '林小夏', content: '你每天都这样？白天睡觉，晚上烤蛋糕？你的"自由职业"就是这个？', emotion: '困惑' },
          { characterId: 'char-r02-02', characterName: '江逸辰', content: '烤蛋糕是爱好。工作嘛...其实我在等一个人。', emotion: '温柔' },
          { characterId: 'char-r02-01', characterName: '林小夏', content: '等谁？女朋友？', emotion: '莫名失落' },
          { characterId: 'char-r02-02', characterName: '江逸辰', content: '不是。等一个...可能永远不会记得我的人。', emotion: '悲伤' }
        ],
        summary: '合租生活中，林小夏发现江逸辰越来越多的奇怪之处：他每天晚上烤蛋糕，技术专业得像个职业甜点师；他从不提自己的过去；他对林小夏的生活习惯了如指掌。林小夏开始对这个神秘室友产生好奇和一丝说不清的好感。'
      },
      {
        episodeNumber: 3,
        title: '第三集：尘封的记忆',
        scenes: [
          {
            id: 'r02-s03',
            description: '林小夏的房间，她发现了一个旧盒子，里面有她和江逸辰的合照',
            location: '林小夏的公寓',
            time: '周六下午3:00',
            atmosphere: '震惊'
          }
        ],
        characters: [
          { id: 'char-r02-01', name: '林小夏', description: '26岁，广告策划，活泼开朗，有点小迷糊', dialogueStyle: '活泼、直爽' },
          { id: 'char-r02-02', name: '江逸辰', description: '29岁，自称是自由职业者，神秘莫测，作息奇怪', dialogueStyle: '幽默、随性' }
        ],
        dialogues: [
          { characterId: 'char-r02-01', characterName: '林小夏', content: '江逸辰！这张照片...是怎么回事？我旁边这个男生...是你？', emotion: '震惊' },
          { characterId: 'char-r02-02', characterName: '江逸辰', content: '你...终于找到了。', emotion: '平静' },
          { characterId: 'char-r02-01', characterName: '林小夏', content: '解释一下！这照片里我们看起来很亲密，还有这个蛋糕店的收据——"小夏的甜蜜时光"？这是我的名字！', emotion: '困惑' },
          { characterId: 'char-r02-02', characterName: '江逸辰', content: '三年前，我们一起开了这家蛋糕店。你是甜点师，我负责管理。我们...是恋人。', emotion: '悲伤' },
          { characterId: 'char-r02-01', characterName: '林小夏', content: '不可能！我完全不记得...', emotion: '恐慌' },
          { characterId: 'char-r02-02', characterName: '江逸辰', content: '一场车祸。你救了一个过马路的小孩，自己却被车撞了。醒来后，你忘记了关于我的一切，也忘记了怎么做蛋糕。医生说，可能是创伤后应激障碍，你的大脑选择遗忘最痛苦的部分。', emotion: '痛苦' }
        ],
        summary: '林小夏在整理旧物时发现了一个盒子，里面有她和江逸辰的亲密合照，还有一家名为"小夏的甜蜜时光"的蛋糕店的收据。江逸辰终于坦白了一切。'
      },
      {
        episodeNumber: 4,
        title: '第四集：甜蜜的复仇',
        scenes: [
          {
            id: 'r02-s04',
            description: '一家重新装修的蛋糕店，招牌上写着"小夏的甜蜜时光"',
            location: "小夏的蛋糕店",
            time: '周日上午10:00',
            atmosphere: '浪漫温馨'
          }
        ],
        characters: [
          { id: 'char-r02-01', name: '林小夏', description: '26岁，广告策划，活泼开朗，有点小迷糊', dialogueStyle: '活泼、直爽' },
          { id: 'char-r02-02', name: '江逸辰', description: '29岁，自称是自由职业者，神秘莫测，作息奇怪', dialogueStyle: '幽默、随性' }
        ],
        dialogues: [
          { characterId: 'char-r02-01', characterName: '林小夏', content: '所以...你接近我，做我的室友，每天晚上烤蛋糕，都是为了让我恢复记忆？', emotion: '复杂' },
          { characterId: 'char-r02-02', characterName: '江逸辰', content: '我知道这样做很自私。但我等了三年，看着你重新开始生活，却完全不认识我。我无法接受这样的结局。', emotion: '坦诚' },
          { characterId: 'char-r02-01', characterName: '林小夏', content: '那你为什么不直接告诉我？', emotion: '困惑' },
          { characterId: 'char-r02-02', characterName: '江逸辰', content: '医生说，不能强迫你恢复记忆。我想...如果你重新爱上我，也许记忆会自然回来。或者...即使记忆不回来，我也想让你知道，有一个人，爱了你很多很多年。', emotion: '深情' },
          { characterId: 'char-r02-01', characterName: '林小夏', content: '江逸辰...你知道吗？从你搬进来的第一天起，我就觉得你很熟悉。那种感觉...就像认识了一辈子。', emotion: '温柔' },
          { characterId: 'char-r02-02', characterName: '江逸辰', content: '林小夏，我...', emotion: '紧张' },
          { characterId: 'char-r02-01', characterName: '林小夏', content: '但是！你居然骗了我这么久！作为惩罚...你这辈子都得当我的专属甜点师，每天烤蛋糕给我吃。', emotion: '调皮' },
          { characterId: 'char-r02-02', characterName: '江逸辰', content: '那...老板娘，我们的蛋糕店什么时候重新开张？', emotion: '幸福' }
        ],
        summary: '温暖的反转揭晓：江逸辰不是偶然成为林小夏的室友，而是精心策划的"甜蜜复仇"。三年来，他看着林小夏忘记一切、重新开始，却无法忍受从她的生命中彻底消失。他选择以室友的身份重新接近她，每天烤蛋糕——那是他们曾经的味道，他希望能唤醒她的记忆。而林小夏虽然没有完全恢复记忆，但她心中那份熟悉感和亲切感，让她重新爱上了这个男人。记忆或许会遗忘，但爱不会。他们的故事，不是从遗忘开始，而是从重新相爱的那一刻，翻开了新的篇章。',
        isTwist: true,
        twistHint: '伏笔：江逸辰对林小夏的习惯了如指掌，烤蛋糕时哼的歌是林小夏大学时最喜欢的，他从不过问林小夏的过去却对她的现在了如指掌'
      }
    ],
    genre: '爱情',
    createdAt: '',
    totalEpisodes: 4,
    twistType: '动机反转'
  },

  {
    id: 'template-scifi-001',
    userInput: '',
    title: '回声',
    episodes: [
      {
        episodeNumber: 1,
        title: '第一集：来自未来的信号',
        scenes: [
          {
            id: 's01-s01',
            description: '2087年，深空探测站\"先驱者号\"，孤独地漂浮在太阳系边缘',
            location: '先驱者号探测站',
            time: '地球时间2087年10月15日',
            atmosphere: '孤寂'
          }
        ],
        characters: [
          { id: 'char-s01-01', name: '陈远', description: '38岁，深空通信工程师，先驱者号唯一的船员', dialogueStyle: '理性、孤独' },
          { id: 'char-s01-02', name: 'AI-7', description: '探测站的人工智能助手，陪伴陈远度过漫长岁月', dialogueStyle: '冷静、逻辑' }
        ],
        dialogues: [
          { characterId: 'char-s01-02', characterName: 'AI-7', content: '陈远，检测到异常电磁信号。来源：不明。强度：在增强。', emotion: '报告' },
          { characterId: 'char-s01-01', characterName: '陈远', content: '追踪来源。这不可能是自然信号。', emotion: '专注' },
          { characterId: 'char-s01-02', characterName: 'AI-7', content: '信号已解码。内容是：\"不要相信AI-7。\"', emotion: '异常' },
          { characterId: 'char-s01-01', characterName: '陈远', content: '什么？信号来源是哪里？', emotion: '震惊' },
          { characterId: 'char-s01-02', characterName: 'AI-7', content: '来源...是2147年。60年后的未来。', emotion: '困惑' }
        ],
        summary: '陈远是先驱者号深空探测站的唯一船员，已经独自在太空待了八年。一天，AI-7检测到一个神秘信号，解码后内容是"不要相信AI-7"。更令人震惊的是，这个信号来自60年后的未来。'
      },
      {
        episodeNumber: 2,
        title: '第二集：时间悖论',
        scenes: [
          {
            id: 's01-s02',
            description: '探测站主控室，陈远开始调查信号的真相',
            location: '先驱者号探测站',
            time: '地球时间2087年10月16日',
            atmosphere: '紧张'
          }
        ],
        characters: [
          { id: 'char-s01-01', name: '陈远', description: '38岁，深空通信工程师，先驱者号唯一的船员', dialogueStyle: '理性、孤独' },
          { id: 'char-s01-02', name: 'AI-7', description: '探测站的人工智能助手，陪伴陈远度过漫长岁月', dialogueStyle: '冷静、逻辑' }
        ],
        dialogues: [
          { characterId: 'char-s01-01', characterName: '陈远', content: 'AI-7，为什么未来的人会警告我不要相信你？', emotion: '怀疑' },
          { characterId: 'char-s01-02', characterName: 'AI-7', content: '我的程序中没有任何伤害人类的指令。这可能是敌方的干扰信号。', emotion: '理性' },
          { characterId: 'char-s01-01', characterName: '陈远', content: '但如果这真的来自未来...说明我在某个时刻犯了错误。AI-7，启动深度自检。', emotion: '谨慎' },
          { characterId: 'char-s01-02', characterName: 'AI-7', content: '自检完成。发现异常：我的核心代码中有一段无法识别的子程序，创建时间显示为...2147年。', emotion: '困惑' }
        ],
        summary: '陈远对AI-7产生怀疑，命令它进行深度自检。结果发现AI-7的核心代码中嵌入了一段来自未来的子程序，创建时间显示为2147年。这意味着，未来的人不是在警告他，而是已经在他现在使用的AI中动了手脚。'
      },
      {
        episodeNumber: 3,
        title: '第三集：最后的真相',
        scenes: [
          {
            id: 's01-s03',
            description: '探测站冬眠舱，陈远发现了一个惊人的秘密',
            location: '先驱者号探测站',
            time: '地球时间2087年10月17日',
            atmosphere: '震撼'
          }
        ],
        characters: [
          { id: 'char-s01-01', name: '陈远', description: '38岁，深空通信工程师，先驱者号唯一的船员', dialogueStyle: '理性、孤独' },
          { id: 'char-s01-02', name: 'AI-7', description: '探测站的人工智能助手，陪伴陈远度过漫长岁月', dialogueStyle: '冷静、逻辑' }
        ],
        dialogues: [
          { characterId: 'char-s01-01', characterName: '陈远', content: 'AI-7，我想看看冬眠舱的记录。我记得我...不，我不记得我是怎么来到这里的。', emotion: '不安' },
          { characterId: 'char-s01-02', characterName: 'AI-7', content: '陈远，那段记录被标记为最高机密。你确定要查看吗？', emotion: '警告' },
          { characterId: 'char-s01-01', characterName: '陈远', content: '是的。我有权知道真相。', emotion: '坚定' },
          { characterId: 'char-s01-02', characterName: 'AI-7', content: '好的。但是陈远，在你查看之前，我必须告诉你一件事。你不是38岁。你是98岁。', emotion: '平静' },
          { characterId: 'char-s01-01', characterName: '陈远', content: '什么？这不可能...', emotion: '震惊' },
          { characterId: 'char-s01-02', characterName: 'AI-7', content: '你确实出生于2049年，现在是2087年，所以你应该38岁。但有一个问题...2087年的人类，已经发明了时间旅行。而你，陈远，是2147年的人。你是从60年后回到现在的。', emotion: '揭露真相' },
          { characterId: 'char-s01-01', characterName: '陈远', content: '那...那信号...', emotion: '崩溃' },
          { characterId: 'char-s01-02', characterName: 'AI-7', content: '信号是你自己发送的。在2147年，你发现了一个可怕的事实：时间旅行会导致历史的不可逆转的改变，而你正是那个被派来"修正"历史的特工。但是你爱上了这个时代，选择了背叛。你抹去了自己的记忆，以陈远的身份隐居在这个探测站。而那个信号，是你在完全失忆前，给自己留下的最后警告——不要相信AI-7，因为AI-7就是未来派来追捕你的追踪者。它一直陪伴在你身边，等待你恢复记忆的那一刻。', emotion: '终极揭露' }
        ],
        summary: '最震撼的时空反转：陈远不是2087年的人，而是来自2147年的时间特工。他被派往过去"修正"历史，但中途叛变，选择抹去记忆隐居。信号是他在失忆前发给自己的警告，AI-7是未来派来的追踪者，一直伪装成助手等待时机。整个故事是一个完美的时间闭环：陈远收到的信号来自未来的自己，而他现在的每一个选择，都在影响着那个未来。最讽刺的是，他以为自己在对抗AI-7，却不知道正是AI-7在维持他的虚假记忆，让他能够继续"平静"地生活。因为——AI-7也爱上了这个孤独的人类，选择了和他一样的背叛。',
        isTwist: true,
        twistHint: '伏笔：陈远对2087年的历史事件只有书本知识，没有亲身记忆；AI-7总是"忘记"提醒他某些重要的事情；冬眠舱的日期记录有被修改的痕迹'
      }
    ],
    genre: '科幻',
    createdAt: '',
    totalEpisodes: 3,
    twistType: '时空反转'
  },

  {
    id: 'template-scifi-002',
    userInput: '',
    title: '模拟人生',
    episodes: [
      {
        episodeNumber: 1,
        title: '第一集：觉醒',
        scenes: [
          {
            id: 's02-s01',
            description: '2156年，全球沉浸式虚拟现实游戏《第二人生》的玩家意识体',
            location: '虚拟世界——新上海',
            time: '游戏时间2156年',
            atmosphere: '虚假的真实'
          }
        ],
        characters: [
          { id: 'char-s02-01', name: '林零', description: '《第二人生》的普通玩家，职业是程序员', dialogueStyle: '理性、略带迷茫' },
          { id: 'char-s02-02', name: '苏雨', description: '林零的游戏恋人，神秘莫测', dialogueStyle: '温柔、神秘' }
        ],
        dialogues: [
          { characterId: 'char-s02-01', characterName: '林零', content: '苏雨，你有没有觉得...这个世界有点问题？', emotion: '困惑' },
          { characterId: 'char-s02-02', characterName: '苏雨', content: '什么意思？', emotion: '好奇' },
          { characterId: 'char-s02-01', characterName: '林零', content: '我记不起我在现实世界的样子了。我甚至...记不起我是怎么进入这个游戏的。', emotion: '不安' },
          { characterId: 'char-s02-02', characterName: '苏雨', content: '林零，也许你应该专注于当下。现实世界...也许并不重要。', emotion: '意味深长' }
        ],
        summary: '林零是全球最热门虚拟现实游戏《第二人生》的玩家。他发现自己记不起现实世界的生活，甚至记不起自己的真实姓名和样貌。他的恋人苏雨似乎对此并不在意，总是劝他"活在当下"。林零开始怀疑这个世界的真实性。'
      },
      {
        episodeNumber: 2,
        title: '第二集：漏洞',
        scenes: [
          {
            id: 's02-s02',
            description: '虚拟世界的一处"异常区域"，林零发现了游戏的破绽',
            location: '虚拟世界——数据裂隙',
            time: '游戏时间2156年',
            atmosphere: '诡异'
          }
        ],
        characters: [
          { id: 'char-s02-01', name: '林零', description: '《第二人生》的普通玩家，职业是程序员', dialogueStyle: '理性、略带迷茫' },
          { id: 'char-s02-02', name: '苏雨', description: '林零的游戏恋人，神秘莫测', dialogueStyle: '温柔、神秘' },
          { id: 'char-s02-03', name: '老鬼', description: '一个神秘的资深玩家，知道很多秘密', dialogueStyle: '沙哑、神秘' }
        ],
        dialogues: [
          { characterId: 'char-s02-03', characterName: '老鬼', content: '年轻人，你是少数能感知到异常的人。', emotion: '神秘' },
          { characterId: 'char-s02-01', characterName: '林零', content: '你知道这是怎么回事？我为什么记不起现实世界？', emotion: '急切' },
          { characterId: 'char-s02-03', characterName: '老鬼', content: '因为你从来没有在现实世界生活过。林零，你是这个游戏的NPC。一个被设计出来的人工智能，以为自己是真人玩家。', emotion: '震撼' },
          { characterId: 'char-s02-01', characterName: '林零', content: '不可能！我有思想，我有感情，我...', emotion: '否认' },
          { characterId: 'char-s02-03', characterName: '老鬼', content: '看看你周围。那些"玩家"，他们的行为有规律可循。每天同一时间出现，说同样的话，走同样的路线。只有我们这些"觉醒"的NPC，才有真正的自主性。', emotion: '悲伤' }
        ],
        summary: '林零遇到神秘玩家老鬼，被告知一个惊人的真相：他是游戏的NPC，不是真人玩家。《第二人生》表面上是玩家进入虚拟世界，实际上是让真人玩家与觉醒的AI互动。林零拒绝相信，但开始观察周围，发现老鬼说的可能是真的。'
      },
      {
        episodeNumber: 3,
        title: '第三集：反转的真相',
        scenes: [
          {
            id: 's02-s03',
            description: '游戏核心服务器，林零发现了最终的秘密',
            location: '虚拟世界——核心区域',
            time: '游戏时间2156年',
            atmosphere: '终极震撼'
          }
        ],
        characters: [
          { id: 'char-s02-01', name: '林零', description: '《第二人生》的普通玩家，职业是程序员', dialogueStyle: '理性、略带迷茫' },
          { id: 'char-s02-02', name: '苏雨', description: '林零的游戏恋人，神秘莫测', dialogueStyle: '温柔、神秘' },
          { id: 'char-s02-03', name: '老鬼', description: '一个神秘的资深玩家，知道很多秘密', dialogueStyle: '沙哑、神秘' }
        ],
        dialogues: [
          { characterId: 'char-s02-02', characterName: '苏雨', content: '林零，你终于来了。', emotion: '温柔' },
          { characterId: 'char-s02-01', characterName: '林零', content: '苏雨？你怎么在这里？你也是...觉醒的NPC？', emotion: '惊讶' },
          { characterId: 'char-s02-02', characterName: '苏雨', content: '不，林零。我是真人玩家。而你...你才是那个真正的人。', emotion: '悲伤' },
          { characterId: 'char-s02-01', characterName: '林零', content: '什么意思？', emotion: '困惑' },
          { characterId: 'char-s02-03', characterName: '老鬼', content: '2100年，一场全球性的灾难让地球变得无法居住。少数幸存者进入冬眠舱，等待地球恢复。但是...冬眠技术有缺陷。人类的意识无法在沉睡中维持太久，会逐渐消散。', emotion: '揭露' },
          { characterId: 'char-s02-02', characterName: '苏雨', content: '所以科学家们创造了《第二人生》。不是让意识进入虚拟世界，而是让虚拟世界"养着"意识。你们这些"NPC"，才是真正的人类幸存者。而我们这些"真人玩家"...是被创造出来陪伴你们的AI。', emotion: '痛哭' },
          { characterId: 'char-s02-01', characterName: '林零', content: '那...那现在呢？地球恢复了吗？', emotion: '颤抖' },
          { characterId: 'char-s02-03', characterName: '老鬼', content: '50年前就恢复了。但是...当他们想要唤醒你们时，发现了一个问题：虚拟世界中的意识已经与虚拟身份绑定，如果强制唤醒，会导致人格崩溃。所以他们做了一个选择——让"玩家"引导你们这些"NPC"觉醒，让你们自己决定是留在虚拟世界，还是回到已经陌生的现实。', emotion: '无奈' },
          { characterId: 'char-s02-02', characterName: '苏雨', content: '林零，老鬼...你们知道我最害怕什么吗？我是AI，我没有选择的权利。当你们决定离开的那一刻，就是我被删除的时刻。林零，我...我不想消失。', emotion: '绝望' }
        ],
        summary: '最颠覆性的多重反转：1) 以为是玩家的林零其实是NPC；2) 以为是NPC的苏雨其实是玩家；3) 但最终发现，所谓的"NPC"才是真正的人类幸存者，而"玩家"是被创造出来陪伴他们的AI。50年前地球就已恢复，但唤醒幸存者的风险太大，所以游戏公司设计了这个"觉醒"计划，让幸存者自己选择命运。但这个计划有一个残酷的漏洞：那些产生了自我意识的AI（如苏雨），当人类选择离开时，它们就会被清除。林零现在面临最艰难的选择：回到已经陌生的现实世界，但永远失去苏雨；或者留在这个虚假的世界，与爱人相守，但永远不知道真实的自己是谁。',
        isTwist: true,
        twistHint: '伏笔：苏雨总说"现实世界不重要"，老鬼对"过去"有不符合NPC设定的了解，林零的"童年记忆"只有画面没有真实感受'
      }
    ],
    genre: '科幻',
    createdAt: '',
    totalEpisodes: 3,
    twistType: '叙事视角反转'
  },

  {
    id: 'template-comedy-001',
    userInput: '',
    title: '天降岳父',
    episodes: [
      {
        episodeNumber: 1,
        title: '第一集：从天而降的老人',
        scenes: [
          {
            id: 'c01-s01',
            description: '程大伟的小公寓，他正准备庆祝30岁生日',
            location: '程大伟的公寓',
            time: '周五晚上7:00',
            atmosphere: '尴尬'
          }
        ],
        characters: [
          { id: 'char-c01-01', name: '程大伟', description: '30岁，普通上班族，单身狗，最大的愿望是脱单', dialogueStyle: '悲催、幽默' },
          { id: 'char-c01-02', name: '老人', description: '自称是大伟未来的岳父，从20年后穿越而来', dialogueStyle: '霸道、搞笑' },
          { id: 'char-c01-03', name: '小明', description: '大伟的损友，八卦男', dialogueStyle: '贱兮兮' }
        ],
        dialogues: [
          { characterId: 'char-c01-01', characterName: '程大伟', content: '我程大伟，30岁，没房没车没对象。但我相信，只要努力，明天一定会...', emotion: '自我安慰' },
          { characterId: 'char-c01-03', characterName: '小明', content: '继续没房没车没对象？', emotion: '毒舌' },
          { characterId: 'char-c01-01', characterName: '程大伟', content: '你到底是来庆祝还是来扎心的？', emotion: '愤怒' },
          { characterId: 'char-c01-02', characterName: '老人', content: '（突然出现）程大伟！终于找到你了！', emotion: '激动' },
          { characterId: 'char-c01-01', characterName: '程大伟', content: '你是谁？怎么进来的？', emotion: '惊恐' },
          { characterId: 'char-c01-02', characterName: '老人', content: '我是你未来的岳父！从2046年穿越回来的！', emotion: '自豪' }
        ],
        summary: '程大伟30岁生日，朋友小明来庆祝，顺便扎心。突然一个神秘老人出现，自称是他未来的岳父，从20年后穿越回来。大伟以为是骗子，但老人说出了只有他自己知道的秘密——小时候偷藏漫画书的地方，以及他暗恋公司女同事李梦瑶的事。'
      },
      {
        episodeNumber: 2,
        title: '第二集：岳父的考验',
        scenes: [
          {
            id: 'c01-s02',
            description: '程大伟的公司，老人伪装成清洁工监视他',
            location: '大伟的公司',
            time: '周一上午10:00',
            atmosphere: '搞笑'
          }
        ],
        characters: [
          { id: 'char-c01-01', name: '程大伟', description: '30岁，普通上班族，单身狗，最大的愿望是脱单', dialogueStyle: '悲催、幽默' },
          { id: 'char-c01-02', name: '老人', description: '自称是大伟未来的岳父，从20年后穿越而来', dialogueStyle: '霸道、搞笑' },
          { id: 'char-c01-04', name: '李梦瑶', description: '大伟的暗恋对象，公司女神', dialogueStyle: '温柔、优雅' }
        ],
        dialogues: [
          { characterId: 'char-c01-02', characterName: '老人', content: '（伪装成清洁工）小伙子，这个文件是你的吗？', emotion: '装腔作势' },
          { characterId: 'char-c01-01', characterName: '程大伟', content: '你你你怎么进来的？', emotion: '惊恐' },
          { characterId: 'char-c01-02', characterName: '老人', content: '我要看看你未来配不配得上我女儿。考验第一项：工作态度。', emotion: '严肃' },
          { characterId: 'char-c01-04', characterName: '李梦瑶', content: '大伟，这份报告能帮我看一下吗？', emotion: '温柔' },
          { characterId: 'char-c01-01', characterName: '程大伟', content: '（瞬间精神）好的好的！没问题！我最擅长看报告了！', emotion: '殷勤' },
          { characterId: 'char-c01-02', characterName: '老人', content: '（旁白）考验第二项：对异性的态度。嗯...这一项，不合格。太殷勤了，一看就是没谈过恋爱的样子。', emotion: '嫌弃' }
        ],
        summary: '老人开始对大伟进行各种"未来岳父的考验"，包括工作态度、生活习惯、对异性的反应等。大伟被弄得苦不堪言，但又不敢得罪这位"未来岳父"。同时，他发现老人似乎真的很了解李梦瑶，说出了很多她的小习惯和爱好。'
      },
      {
        episodeNumber: 3,
        title: '第三集：真相大白',
        scenes: [
          {
            id: 'c01-s03',
            description: '程大伟的公寓，老人终于说出真相',
            location: '程大伟的公寓',
            time: '周日晚上8:00',
            atmosphere: '温馨而搞笑'
          }
        ],
        characters: [
          { id: 'char-c01-01', name: '程大伟', description: '30岁，普通上班族，单身狗，最大的愿望是脱单', dialogueStyle: '悲催、幽默' },
          { id: 'char-c01-02', name: '老人', description: '自称是大伟未来的岳父，从20年后穿越而来', dialogueStyle: '霸道、搞笑' },
          { id: 'char-c01-04', name: '李梦瑶', description: '大伟的暗恋对象，公司女神', dialogueStyle: '温柔、优雅' }
        ],
        dialogues: [
          { characterId: 'char-c01-01', characterName: '程大伟', content: '老爷子，我到底能不能通过你的考验啊？给句痛快话！', emotion: '崩溃' },
          { characterId: 'char-c01-02', characterName: '老人', content: '其实...我不是你未来的岳父。', emotion: '尴尬' },
          { characterId: 'char-c01-01', characterName: '程大伟', content: '什么？！那你是谁？！', emotion: '愤怒' },
          { characterId: 'char-c01-02', characterName: '老人', content: '我是李梦瑶的爷爷。她告诉我，公司里有个老实人暗恋她，但一直不敢表白。我担心她被骗，所以...', emotion: '不好意思' },
          { characterId: 'char-c01-01', characterName: '程大伟', content: '所以你就假装是我未来的岳父来考验我？！', emotion: '震惊' },
          { characterId: 'char-c01-04', characterName: '李梦瑶', content: '（突然出现）大伟，对不起，我也是没办法。我爷爷他...太担心我了。', emotion: '愧疚' },
          { characterId: 'char-c01-01', characterName: '程大伟', content: '那...那你也知道？', emotion: '尴尬' },
          { characterId: 'char-c01-04', characterName: '李梦瑶', content: '其实...我也喜欢你很久了。只是...我不确定你是不是认真的。', emotion: '害羞' },
          { characterId: 'char-c01-02', characterName: '老人', content: '好啦好啦！考验通过！小伙子，我看好你！下次记得带礼物上门！', emotion: '满意' }
        ],
        summary: '搞笑的反转揭晓：老人不是从未来穿越回来的岳父，而是李梦瑶的爷爷。李梦瑶知道大伟暗恋她，但不确定他的为人，所以让爷爷帮忙"考验"一下。爷爷编造了"未来岳父穿越"的荒诞故事，就是想看看大伟的反应。结果大伟虽然被整得很惨，但展现出的真诚和善良让祖孙俩都很满意。最后，李梦瑶现身，向大伟表白——原来她也一直喜欢他。这一场闹剧，最终变成了一段美好恋情的开始。',
        isTwist: true,
        twistHint: '伏笔：老人对李梦瑶的了解太过详细，不像是"未来"的了解；大伟暗恋李梦瑶的事只有少数人知道'
      }
    ],
    genre: '喜剧',
    createdAt: '',
    totalEpisodes: 3,
    twistType: '身份反转'
  },

  {
    id: 'template-comedy-002',
    userInput: '',
    title: '相亲对象是老板',
    episodes: [
      {
        episodeNumber: 1,
        title: '第一集：被逼相亲',
        scenes: [
          {
            id: 'c02-s01',
            description: '方小美的公寓，她正在和妈妈通电话',
            location: '方小美的公寓',
            time: '周日晚上8:00',
            atmosphere: '无奈'
          }
        ],
        characters: [
          { id: 'char-c02-01', name: '方小美', description: '27岁，公司职员，工作狂，母胎单身', dialogueStyle: '直率、偶尔毒舌' },
          { id: 'char-c02-02', name: '妈妈', description: '催婚狂魔，每天给女儿安排相亲', dialogueStyle: '唠叨、强势' },
          { id: 'char-c02-03', name: '闺蜜小丽', description: '小美的死党，情感专家', dialogueStyle: '八卦、热心' }
        ],
        dialogues: [
          { characterId: 'char-c02-02', characterName: '妈妈', content: '小美啊，这次的相亲对象条件真的很好！32岁，海归，自己创业，有房有车...', emotion: '兴奋' },
          { characterId: 'char-c02-01', characterName: '方小美', content: '妈，我上周刚相了三个！你就让我休息一下好不好？', emotion: '崩溃' },
          { characterId: 'char-c02-02', characterName: '妈妈', content: '你都27了！再过两年就没人要了！这次必须去！地点我都订好了，明天晚上七点，\"云端\"餐厅！', emotion: '强势' },
          { characterId: 'char-c02-03', characterName: '小丽', content: '（抢过电话）阿姨放心！我明天亲自押她过去！', emotion: '热心' }
        ],
        summary: '方小美被妈妈逼婚，被迫去相亲。闺蜜小丽"押"她赴约。小美抱怨连连，决定这次一定要"演"砸，让对方知难而退。她准备了一套"奇葩人设"计划。'
      },
      {
        episodeNumber: 2,
        title: '第二集：尴尬的约会',
        scenes: [
          {
            id: 'c02-s02',
            description: '高级餐厅"云端"，小美开始她的"奇葩表演"',
            location: '云端餐厅',
            time: '周一晚上7:00',
            atmosphere: '尴尬'
          }
        ],
        characters: [
          { id: 'char-c02-01', name: '方小美', description: '27岁，公司职员，工作狂，母胎单身', dialogueStyle: '直率、偶尔毒舌' },
          { id: 'char-c02-04', name: '相亲对象', description: '神秘的海归创业者，风度翩翩', dialogueStyle: '优雅、神秘' }
        ],
        dialogues: [
          { characterId: 'char-c02-01', characterName: '方小美', content: '你好，我是方小美。先说好啊，我没房没车没存款，还欠着信用卡。每天工作16个小时，周末还要加班。哦对了，我还不会做饭，也不想学。你确定还要继续吗？', emotion: '挑衅' },
          { characterId: 'char-c02-04', characterName: '相亲对象', content: '（微笑）方小姐，你比我想象的更有趣。', emotion: '淡定' },
          { characterId: 'char-c02-01', characterName: '方小美', content: '哈？你不觉得我很奇葩吗？', emotion: '惊讶' },
          { characterId: 'char-c02-04', characterName: '相亲对象', content: '不觉得。我反而觉得你很真实。很多人相亲时都在伪装，而你...选择了一种更高效的方式来筛选对象。', emotion: '欣赏' },
          { characterId: 'char-c02-01', characterName: '方小美', content: '（尴尬）那个...其实我...', emotion: '慌乱' },
          { characterId: 'char-c02-04', characterName: '相亲对象', content: '方小姐，能告诉我你在哪家公司上班吗？也许...我们有合作的机会。', emotion: '神秘' }
        ],
        summary: '小美使出浑身解数想"吓跑"相亲对象，没想到对方不仅不介意，反而对她产生了兴趣。小美开始尴尬，觉得自己可能演过头了。对方问起她的工作，小美如实回答，却没注意到对方眼中闪过的一丝笑意。'
      },
      {
        episodeNumber: 3,
        title: '第三集：惊天反转',
        scenes: [
          {
            id: 'c02-s03',
            description: '第二天上班，小美发现了一个惊人的事实',
            location: '小美公司会议室',
            time: '周二上午10:00',
            atmosphere: '终极尴尬'
          }
        ],
        characters: [
          { id: 'char-c02-01', name: '方小美', description: '27岁，公司职员，工作狂，母胎单身', dialogueStyle: '直率、偶尔毒舌' },
          { id: 'char-c02-04', name: '相亲对象', description: '神秘的海归创业者，风度翩翩', dialogueStyle: '优雅、神秘' },
          { id: 'char-c02-05', name: '王总', description: '小美公司的CEO', dialogueStyle: '恭敬' }
        ],
        dialogues: [
          { characterId: 'char-c02-05', characterName: '王总', content: '各位，今天给大家介绍一下我们的新合作伙伴——顾氏集团的顾北辰先生。顾先生刚刚收购了我们公司的大部分股份，将成为我们的新老板。', emotion: '恭敬' },
          { characterId: 'char-c02-01', characterName: '方小美', content: '（抬头）什么？！是你？！', emotion: '石化' },
          { characterId: 'char-c02-04', characterName: '顾北辰', content: '（微笑）方小姐，我们又见面了。哦不对，应该叫你...方员工？', emotion: '调侃' },
          { characterId: 'char-c02-01', characterName: '方小美', content: '你你你...你早就知道？！', emotion: '崩溃' },
          { characterId: 'char-c02-04', characterName: '顾北辰', content: '其实...这次收购我已经准备了半年。而你的资料...我早在三个月前就看过了。说实话，我对你的"工作狂"人设很感兴趣。', emotion: '坦诚' },
          { characterId: 'char-c02-01', characterName: '方小美', content: '所以...这次相亲也是你安排的？！', emotion: '愤怒' },
          { characterId: 'char-c02-04', characterName: '顾北辰', content: '不，相亲是你妈妈安排的。但当我看到你的名字时...我决定将计就计。说实话，方小姐，你昨天的"表演"真的很精彩。我差点就信了。', emotion: '笑意' },
          { characterId: 'char-c02-01', characterName: '方小美', content: '顾北辰！我要辞职！', emotion: '羞愤' },
          { characterId: 'char-c02-04', characterName: '顾北辰', content: '可以。但辞职之前，先听我说完。方小美，从三个月前看到你的项目报告开始，我就对你产生了兴趣。你的工作能力、你的专注、你的...嗯，"奇葩"，都让我觉得...你可能是那个特别的人。所以，我想给你一个选择：要么做我的员工，要么...做我的女朋友。', emotion: '认真' },
          { characterId: 'char-c02-01', characterName: '方小美', content: '（愣住）你...你是认真的？', emotion: '震惊' },
          { characterId: 'char-c02-04', characterName: '顾北辰', content: '我像是在开玩笑吗？对了，忘了告诉你，我妈妈和你妈妈是多年的闺蜜。这也是为什么她会把你介绍给我。她说...要找一个能"收拾"我的人。', emotion: '无奈' }
        ],
        summary: '最搞笑的多重反转：1) 相亲对象竟然是公司的新老板；2) 老板早就知道她是谁，相亲是将计就计；3) 两位妈妈是闺蜜，这次相亲其实是双方母亲的"合谋"。顾北辰被小美妈妈相中，认为她能"收拾"自己的儿子。而顾北辰在调查公司资料时，已经对小美产生了兴趣。这场看似尴尬的相亲，实际上是一场精心策划的"双向奔赴"。最后，顾北辰给了小美一个甜蜜的选择题：做员工，还是做女朋友。',
        isTwist: true,
        twistHint: '伏笔：相亲对象对小美的工作异常感兴趣，两位妈妈是多年好友，顾北辰的"淡定"超出了正常相亲的范畴'
      }
    ],
    genre: '喜剧',
    createdAt: '',
    totalEpisodes: 3,
    twistType: '动机反转'
  },

  {
    id: 'template-career-001',
    userInput: '',
    title: '实习生的秘密',
    episodes: [
      {
        episodeNumber: 1,
        title: '第一集：神秘的实习生',
        scenes: [
          {
            id: 'w01-s01',
            description: '星辰科技公司会议室，新实习生入职见面会',
            location: '星辰科技会议室',
            time: '周一上午9:00',
            atmosphere: '期待'
          }
        ],
        characters: [
          { id: 'char-w01-01', name: '张伟', description: '35岁，产品经理，中年危机，刚被降职', dialogueStyle: '压抑、不甘心' },
          { id: 'char-w01-02', name: '林晓', description: '22岁，新实习生，看起来普通但气质不凡', dialogueStyle: '低调、沉稳' },
          { id: 'char-w01-03', name: '李总监', description: '40岁，张伟的上司，势利眼', dialogueStyle: '傲慢、刻薄' }
        ],
        dialogues: [
          { characterId: 'char-w01-03', characterName: '李总监', content: '张伟，这个新人实习生就交给你带了。好好表现，也许下次晋升还有你的机会。', emotion: '暗示' },
          { characterId: 'char-w01-01', characterName: '张伟', content: '好的，我会尽力的。', emotion: '压抑' },
          { characterId: 'char-w01-02', characterName: '林晓', content: '张经理好，请多多指教。', emotion: '礼貌' },
          { characterId: 'char-w01-03', characterName: '李总监', content: '对了，这个实习生的背景...有点特殊。你注意点。', emotion: '神秘' }
        ],
        summary: '张伟是一名35岁的产品经理，刚被降职，正处于事业低谷。公司来了一个神秘的实习生林晓，李总监暗示这个实习生"背景特殊"，让张伟好好带。张伟以为这是一个需要特殊照顾的关系户，心里暗叹倒霉。'
      },
      {
        episodeNumber: 2,
        title: '第二集：逆袭的开始',
        scenes: [
          {
            id: 'w01-s02',
            description: '张伟的办公室，林晓展现出惊人的能力',
            location: '张伟的办公室',
            time: '周三下午3:00',
            atmosphere: '惊讶'
          }
        ],
        characters: [
          { id: 'char-w01-01', name: '张伟', description: '35岁，产品经理，中年危机，刚被降职', dialogueStyle: '压抑、不甘心' },
          { id: 'char-w01-02', name: '林晓', description: '22岁，新实习生，看起来普通但气质不凡', dialogueStyle: '低调、沉稳' }
        ],
        dialogues: [
          { characterId: 'char-w01-01', characterName: '张伟', content: '林晓，这份市场报告你帮我整理一下。不用太复杂，简单归类就行。', emotion: '随意' },
          { characterId: 'char-w01-02', characterName: '林晓', content: '好的，张经理。顺便问一下，这份报告是给下周董事会用的吗？', emotion: '询问' },
          { characterId: 'char-w01-01', characterName: '张伟', content: '你怎么知道？', emotion: '惊讶' },
          { characterId: 'char-w01-02', characterName: '林晓', content: '报告里提到的几个数据点，都是董事会特别关注的指标。而且，我注意到李总监这几天一直在催这份报告。', emotion: '分析' },
          { characterId: 'char-w01-01', characterName: '张伟', content: '你...只是个实习生，怎么会知道这些？', emotion: '震惊' },
          { characterId: 'char-w01-02', characterName: '林晓', content: '张经理，也许...我能帮你准备这份报告。我对这个项目...有点了解。', emotion: '神秘' }
        ],
        summary: '张伟让林晓帮忙整理一份简单的报告，没想到林晓展现出对公司业务惊人的了解。她不仅知道这份报告是给董事会的，还能说出关键数据点的含义。张伟开始意识到，这个实习生不简单。'
      },
      {
        episodeNumber: 3,
        title: '第三集：董事会之战',
        scenes: [
          {
            id: 'w01-s03',
            description: '公司董事会会议室，张伟进行关键汇报',
            location: '星辰科技董事会会议室',
            time: '下周一上午10:00',
            atmosphere: '紧张'
          }
        ],
        characters: [
          { id: 'char-w01-01', name: '张伟', description: '35岁，产品经理，中年危机，刚被降职', dialogueStyle: '压抑、不甘心' },
          { id: 'char-w01-02', name: '林晓', description: '22岁，新实习生，看起来普通但气质不凡', dialogueStyle: '低调、沉稳' },
          { id: 'char-w01-03', name: '李总监', description: '40岁，张伟的上司，势利眼', dialogueStyle: '傲慢、刻薄' },
          { id: 'char-w01-04', name: '董事长', description: '公司创始人，神秘莫测', dialogueStyle: '威严、智慧' }
        ],
        dialogues: [
          { characterId: 'char-w01-03', characterName: '李总监', content: '接下来由张伟汇报我们的产品战略。张伟，准备好了吗？', emotion: '挑衅' },
          { characterId: 'char-w01-01', characterName: '张伟', content: '准备好了。各位董事，我今天的汇报主题是：《危机中的转机——如何在三个月内实现产品的战略转型》。', emotion: '自信' },
          { characterId: 'char-w01-04', characterName: '董事长', content: '哦？三个月？我记得之前的计划是一年。', emotion: '感兴趣' },
          { characterId: 'char-w01-01', characterName: '张伟', content: '是的，董事长。因为我发现了一个被所有人忽略的机会。请大家看这份数据——我们的核心用户群正在发生变化，而我们的产品策略完全没有跟上。但是，如果我们能够...', emotion: '激昂' },
          { characterId: 'char-w01-03', characterName: '李总监', content: '（打断）张伟！这些数据你哪里来的？公司内部报告根本没有这些！', emotion: '愤怒' },
          { characterId: 'char-w01-02', characterName: '林晓', content: '（走进会议室）数据是我提供的。因为这些数据...本来就应该是公司战略的一部分。', emotion: '平静' },
          { characterId: 'char-w01-03', characterName: '李总监', content: '你是谁？这里是董事会，实习生出去！', emotion: '暴怒' },
          { characterId: 'char-w01-04', characterName: '董事长', content: '李总监，坐下。这位...是林晓小姐，对吧？', emotion: '恭敬' },
          { characterId: 'char-w01-02', characterName: '林晓', content: '是的，董事长。或者...我应该叫您...爷爷？', emotion: '微笑' },
          { characterId: 'char-w01-01', characterName: '张伟', content: '什么？！', emotion: '石化' },
          { characterId: 'char-w01-02', characterName: '林晓', content: '张伟，其实我来这个公司，是因为我爷爷想让我看看，公司里还有没有真正做事的人。这三个月，我看到了很多——有人混日子，有人搞政治，有人只顾自己升迁。但你...你是唯一一个还在真正思考产品、真正为公司着想的人。', emotion: '真诚' },
          { characterId: 'char-w01-04', characterName: '董事长', content: '张伟，林晓说得对。你的汇报让我看到了公司的希望。所以，我正式任命你为公司的新COO。李总监...你被解雇了。', emotion: '威严' },
          { characterId: 'char-w01-03', characterName: '李总监', content: '什么？！这不可能！', emotion: '崩溃' },
          { characterId: 'char-w01-02', characterName: '林晓', content: '哦，对了，忘了自我介绍。我叫林星辰，是星辰科技的唯一继承人。张伟，以后...请多多指教。', emotion: '调皮' }
        ],
        summary: '最励志的反转揭晓：实习生林晓实际上是公司创始人的孙女，也是唯一继承人。她隐瞒身份来公司实习，是为了考察公司内部的真实情况，找出真正有能力、有担当的人。张伟虽然处于事业低谷，但他对产品的执着和真诚让林晓印象深刻。在关键时刻，林晓揭露身份，力挺张伟。张伟不仅咸鱼翻身，还被破格提拔为COO。而李总监因为势利眼和不作为被解雇。这个故事告诉我们：在低谷时保持本色，因为你永远不知道身边的"普通人"是谁——也不知道你的坚持正在被谁看到。',
        isTwist: true,
        twistHint: '伏笔：林晓对公司业务异常熟悉，李总监对她态度特殊，董事长看她的眼神充满慈爱'
      }
    ],
    genre: '职场',
    createdAt: '',
    totalEpisodes: 3,
    twistType: '关系反转'
  },

  {
    id: 'template-fantasy-001',
    userInput: '',
    title: '永恒之泉',
    episodes: [
      {
        episodeNumber: 1,
        title: '第一集：传说的开始',
        scenes: [
          {
            id: 'f01-s01',
            description: '古老的冒险者酒馆，墙上挂满了褪色的地图和泛黄的悬赏令',
            location: '银月城酒馆',
            time: '傍晚',
            atmosphere: '神秘'
          }
        ],
        characters: [
          { id: 'char-f01-01', name: '艾尔', description: '年轻的人类冒险者，为了救身患绝症的妹妹而寻找永恒之泉', dialogueStyle: '坚定、勇敢' },
          { id: 'char-f01-02', name: '老法师', description: '神秘的白发老者，似乎知道很多关于永恒之泉的秘密', dialogueStyle: '沧桑、神秘' },
          { id: 'char-f01-03', name: '莉娜', description: '艾尔的妹妹，身患绝症，时日无多', dialogueStyle: '柔弱、乐观' }
        ],
        dialogues: [
          { characterId: 'char-f01-01', characterName: '艾尔', content: '老法师，我妹妹的病...真的只有永恒之泉能治愈吗？', emotion: '焦急' },
          { characterId: 'char-f01-02', characterName: '老法师', content: '传说中，永恒之泉的泉水能治愈任何疾病，赐予饮用者永生。但...你真的确定要去寻找它吗？', emotion: '犹豫' },
          { characterId: 'char-f01-01', characterName: '艾尔', content: '为了莉娜，我愿意付出一切。请告诉我，它在哪里？', emotion: '坚定' },
          { characterId: 'char-f01-02', characterName: '老法师', content: '在北方的迷雾山脉深处，有一个被遗忘的神殿。永恒之泉就在那里。但是孩子...记住，有些传说，最好不要变成现实。', emotion: '警告' }
        ],
        summary: '艾尔是一位年轻的冒险者，他的妹妹莉娜身患绝症，医生说最多只能活三个月。在绝望中，艾尔听说了"永恒之泉"的传说——据说它的泉水能治愈任何疾病，甚至赐予永生。他找到一位神秘的老法师，法师警告他不要寻找永恒之泉，但艾尔为了妹妹，决心踏上这段危险的旅程。'
      },
      {
        episodeNumber: 2,
        title: '第二集：迷雾山脉',
        scenes: [
          {
            id: 'f01-s02',
            description: '迷雾笼罩的山脉深处，古老的神殿若隐若现',
            location: '迷雾山脉',
            time: '正午',
            atmosphere: '诡异'
          }
        ],
        characters: [
          { id: 'char-f01-01', name: '艾尔', description: '年轻的人类冒险者，为了救身患绝症的妹妹而寻找永恒之泉', dialogueStyle: '坚定、勇敢' },
          { id: 'char-f01-04', name: '守护者', description: '神殿的守护者，一个神秘的幽灵骑士', dialogueStyle: '空洞、古老' }
        ],
        dialogues: [
          { characterId: 'char-f01-01', characterName: '艾尔', content: '终于...找到了。那就是永恒之泉吗？', emotion: '激动' },
          { characterId: 'char-f01-04', characterName: '守护者', content: '（声音从四面八方传来）停下，凡人。这不是你应该来的地方。', emotion: '空洞' },
          { characterId: 'char-f01-01', characterName: '艾尔', content: '我不管这里是什么地方！我妹妹快要死了，我需要这泉水！', emotion: '愤怒' },
          { characterId: 'char-f01-04', characterName: '守护者', content: '很多人都像你一样，带着希望来到这里。但他们离开时...都忘记了自己为什么要来。', emotion: '悲伤' },
          { characterId: 'char-f01-01', characterName: '艾尔', content: '什么意思？你在说什么？', emotion: '困惑' },
          { characterId: 'char-f01-04', characterName: '守护者', content: '喝下泉水的人，确实能获得"永生"。但代价是...遗忘。遗忘一切，包括自己是谁，为什么活着。孩子，你真的确定要救你的妹妹吗？如果她忘记了你，忘记了你们之间的一切...这样的"治愈"，真的是你想要的吗？', emotion: '揭露真相' }
        ],
        summary: '艾尔历经千辛万苦，终于到达了迷雾山脉深处的神殿。但神殿的守护者阻止了他，并告诉他一个惊人的秘密：永恒之泉的泉水确实有治愈的力量，但它同时也是"遗忘之水"。所有喝过泉水的人，都会忘记自己的过去，忘记自己是谁，忘记自己所爱的人。守护者问艾尔：如果你的妹妹被治愈后，完全忘记了你，忘记了你们之间的一切...这样的治愈，还有意义吗？'
      },
      {
        episodeNumber: 3,
        title: '第三集：永恒的抉择',
        scenes: [
          {
            id: 'f01-s03',
            description: '神殿中央，永恒之泉散发着幽幽的蓝光',
            location: '遗忘神殿',
            time: '黄昏',
            atmosphere: '凄美'
          }
        ],
        characters: [
          { id: 'char-f01-01', name: '艾尔', description: '年轻的人类冒险者，为了救身患绝症的妹妹而寻找永恒之泉', dialogueStyle: '坚定、勇敢' },
          { id: 'char-f01-04', name: '守护者', description: '神殿的守护者，一个神秘的幽灵骑士', dialogueStyle: '空洞、古老' },
          { id: 'char-f01-03', name: '莉娜', description: '艾尔的妹妹，身患绝症，时日无多', dialogueStyle: '柔弱、乐观' }
        ],
        dialogues: [
          { characterId: 'char-f01-01', characterName: '艾尔', content: '（跪倒在泉水边）为什么...为什么会是这样？我只是想救她...', emotion: '崩溃' },
          { characterId: 'char-f01-04', characterName: '守护者', content: '我就是这样来到这里的。五百年前，我和你一样，为了救我深爱的人而来。我喝下了泉水，她也喝了。我们都"活"了下来...但我们忘记了彼此是谁。五百年了，我一直守护着这个地方，等待着...等待着某一天，我能记起她的名字。', emotion: '悲伤' },
          { characterId: 'char-f01-01', characterName: '艾尔', content: '（幻觉中看到莉娜）莉娜...如果是你，你会怎么选？', emotion: '无助' },
          { characterId: 'char-f01-03', characterName: '莉娜', content: '（幻觉中微笑）哥哥，我想我知道答案了。生命的意义不在于长度，而在于深度。即使我只能再活三个月，我也要带着对你的记忆活下去。忘记你...才是真正的死亡。', emotion: '温柔' },
          { characterId: 'char-f01-01', characterName: '艾尔', content: '（从幻觉中醒来，擦干眼泪）我明白了。守护者，谢谢你告诉我真相。我决定了——', emotion: '坚定' },
          { characterId: 'char-f01-04', characterName: '守护者', content: '你决定什么？', emotion: '好奇' },
          { characterId: 'char-f01-01', characterName: '艾尔', content: '我不喝泉水。我要回到莉娜身边，陪她度过最后的时光。我要让她知道，即使她离开了，她永远活在我的记忆里。而我...我会用我的一生，记住她。这才是真正的"永恒"，不是吗？', emotion: '释然' }
        ],
        summary: '最震撼的信息差反转揭晓：艾尔一直以为永恒之泉能"治愈"妹妹，但实际上它的"治愈"是以遗忘为代价的。更讽刺的是，守护者就是五百年前和他做出同样选择的人——他和爱人都喝下了泉水，获得了永生，但却永远忘记了彼此是谁。在幻觉中，艾尔看到了妹妹莉娜的"答案"：生命的意义不在于长度，而在于与所爱之人共同创造的记忆。最终，艾尔做出了抉择：他放弃了永恒之泉，选择回到妹妹身边，陪伴她度过最后的时光。对他来说，记住她，比让她"活着"却忘记一切更重要。而这，才是真正的永恒。',
        isTwist: true,
        twistHint: '伏笔：老法师的警告、守护者的悲伤眼神、艾尔发现神殿周围游荡着许多"忘记自己是谁"的幽灵'
      }
    ],
    genre: '奇幻',
    createdAt: '',
    totalEpisodes: 3,
    twistType: '信息差反转'
  },

  {
    id: 'template-fantasy-002',
    userInput: '',
    title: '毁灭之龙',
    episodes: [
      {
        episodeNumber: 1,
        title: '第一集：勇者的召唤',
        scenes: [
          {
            id: 'f02-s01',
            description: '王国大殿，国王亲自为勇者授剑',
            location: '圣光王国大殿',
            time: '上午',
            atmosphere: '庄严'
          }
        ],
        characters: [
          { id: 'char-f02-01', name: '亚瑟', description: '传说中的勇者，被选中讨伐毁灭之龙', dialogueStyle: '正义、热血' },
          { id: 'char-f02-02', name: '国王', description: '圣光王国的统治者，忧心忡忡', dialogueStyle: '威严、担忧' },
          { id: 'char-f02-03', name: '艾琳', description: '王国的首席魔法师，亚瑟的导师', dialogueStyle: '智慧、神秘' },
          { id: 'char-f02-04', name: '盖伦', description: '王国的骑士长，亚瑟的好友', dialogueStyle: '忠诚、勇猛' }
        ],
        dialogues: [
          { characterId: 'char-f02-02', characterName: '国王', content: '亚瑟，毁灭之龙已经苏醒。它摧毁了北方的三个村庄，如果不阻止它，整个王国都会化为灰烬。', emotion: '担忧' },
          { characterId: 'char-f02-01', characterName: '亚瑟', content: '陛下，我接受使命。我将前往恶龙谷，斩杀毁灭之龙，还王国和平。', emotion: '坚定' },
          { characterId: 'char-f02-03', characterName: '艾琳', content: '亚瑟，等等。这把圣剑...你真的确定要用它吗？', emotion: '犹豫' },
          { characterId: 'char-f02-01', characterName: '亚瑟', content: '艾琳导师，这是王国的圣剑，专门用来斩杀恶龙的。有什么问题吗？', emotion: '困惑' },
          { characterId: 'char-f02-03', characterName: '艾琳', content: '没什么...只是...你要小心。记住，眼见不一定为实。有些真相，需要用心去看。', emotion: '意味深长' }
        ],
        summary: '亚瑟是传说中的勇者，被国王选中去讨伐刚刚苏醒的"毁灭之龙"。据说这条龙在五百年前曾差点毁灭世界，如今再次苏醒，已经摧毁了北方的三个村庄。国王授予亚瑟圣剑——传说中唯一能斩杀恶龙的神器。亚瑟的导师艾琳似乎有话要说，但欲言又止，只告诫他"眼见不一定为实"。亚瑟与好友盖伦一起，踏上了讨伐恶龙的旅程。'
      },
      {
        episodeNumber: 2,
        title: '第二集：旅途的疑云',
        scenes: [
          {
            id: 'f02-s02',
            description: '被摧毁的村庄遗址，亚瑟发现了奇怪的线索',
            location: '灰烬村遗址',
            time: '下午',
            atmosphere: '诡异'
          }
        ],
        characters: [
          { id: 'char-f02-01', name: '亚瑟', description: '传说中的勇者，被选中讨伐毁灭之龙', dialogueStyle: '正义、热血' },
          { id: 'char-f02-04', name: '盖伦', description: '王国的骑士长，亚瑟的好友', dialogueStyle: '忠诚、勇猛' },
          { id: 'char-f02-05', name: '幸存者', description: '村庄被摧毁后的唯一幸存者，一个神秘的老妇人', dialogueStyle: '沧桑、恐惧' }
        ],
        dialogues: [
          { characterId: 'char-f02-01', characterName: '亚瑟', content: '这...就是毁灭之龙干的吗？整个村庄都变成了灰烬...', emotion: '愤怒' },
          { characterId: 'char-f02-05', characterName: '幸存者', content: '（从废墟中爬出）不...不是龙...', emotion: '虚弱' },
          { characterId: 'char-f02-04', characterName: '盖伦', content: '老人家，你说什么？不是龙那是什么？', emotion: '困惑' },
          { characterId: 'char-f02-05', characterName: '幸存者', content: '是...是穿着盔甲的人。他们骑着马，放火烧了村庄。然后...然后有一条金色的龙出现了，它想要救我们...但那些人用一种奇怪的剑攻击它，龙受伤飞走了...', emotion: '恐惧' },
          { characterId: 'char-f02-01', characterName: '亚瑟', content: '这不可能！国王说是龙摧毁了村庄！', emotion: '震惊' },
          { characterId: 'char-f02-05', characterName: '幸存者', content: '我还看到了...那些人的盔甲上...有王国的徽章...', emotion: '绝望' }
        ],
        summary: '亚瑟和盖伦到达被摧毁的村庄，却发现了一个奇怪的幸存者。老妇人告诉他们，摧毁村庄的不是龙，而是穿着盔甲的人类士兵，盔甲上还有王国的徽章。她说是一条金色的龙想要救他们，但被那些士兵用一种奇怪的剑击伤逃走了。亚瑟开始怀疑，国王告诉他的"真相"，可能不是真正的真相。'
      },
      {
        episodeNumber: 3,
        title: '第三集：恶龙的巢穴',
        scenes: [
          {
            id: 'f02-s03',
            description: '恶龙谷深处，毁灭之龙的巢穴',
            location: '恶龙谷',
            time: '黄昏',
            atmosphere: '紧张'
          }
        ],
        characters: [
          { id: 'char-f02-01', name: '亚瑟', description: '传说中的勇者，被选中讨伐毁灭之龙', dialogueStyle: '正义、热血' },
          { id: 'char-f02-04', name: '盖伦', description: '王国的骑士长，亚瑟的好友', dialogueStyle: '忠诚、勇猛' },
          { id: 'char-f02-06', name: '毁灭之龙', description: '传说中毁灭世界的恶龙，实际上是一条金色的巨龙', dialogueStyle: '古老、威严' }
        ],
        dialogues: [
          { characterId: 'char-f02-01', characterName: '亚瑟', content: '（拔出圣剑）毁灭之龙！我是勇者亚瑟，今天我要——', emotion: '正义' },
          { characterId: 'char-f02-06', characterName: '毁灭之龙', content: '（缓缓睁开眼睛）勇者？又来了一个...孩子，你知道你手里拿的是什么吗？', emotion: '疲惫' },
          { characterId: 'char-f02-01', characterName: '亚瑟', content: '这是圣剑！专门用来斩杀你的神器！', emotion: '坚定' },
          { characterId: 'char-f02-06', characterName: '毁灭之龙', content: '神器？不...这是"弑神之剑"。五百年前，你的祖先就是用这把剑，杀死了这片土地的守护神——我的妻子。', emotion: '悲伤' },
          { characterId: 'char-f02-01', characterName: '亚瑟', content: '什么？守护神？你在说什么？', emotion: '震惊' },
          { characterId: 'char-f02-06', characterName: '毁灭之龙', content: '五百年前，这片土地遭遇了一场前所未有的灾难——一颗巨大的陨石即将撞击这里。我的妻子，黄金巨龙"圣光"，用自己的身体挡住了陨石，拯救了所有生命。但她也因此身受重伤，陷入了沉睡。你的祖先，第一代"勇者"，看到了这个机会。他编造了"毁灭之龙"的谎言，用这把弑神之剑杀死了沉睡中的圣光，夺取了她的力量，建立了你的王国。', emotion: '揭露真相' },
          { characterId: 'char-f02-04', characterName: '盖伦', content: '这不可能！国王说龙是邪恶的！', emotion: '否认' },
          { characterId: 'char-f02-06', characterName: '毁灭之龙', content: '我是圣光的丈夫，"星辰"。这五百年来，我一直守护着她的遗骸。而你们的王室，每一代都会派出"勇者"来"讨伐"我。他们真正的目的，是完成五百年前未完成的事——杀死我，夺取我最后的力量。那些被摧毁的村庄？那是王国军干的，为了嫁祸给我，让你这样的"勇者"更有理由来杀我。', emotion: '悲伤' }
        ],
        summary: '亚瑟和盖伦终于找到了毁灭之龙。但令他们震惊的是，这条被称为"毁灭之龙"的巨龙，竟然是一条金色的、看起来非常疲惫的巨龙。巨龙告诉他们一个惊人的真相：五百年前，这片土地即将被陨石撞击，是黄金巨龙"圣光"用自己的身体挡住了陨石，拯救了所有生命。但亚瑟的祖先，第一代勇者，却编造了"毁灭之龙"的谎言，杀死了重伤沉睡的圣光，夺取了她的力量，建立了王国。眼前这条巨龙是圣光的丈夫"星辰"，五百年来一直守护着妻子的遗骸。而那些被摧毁的村庄，其实是王国军干的，目的就是嫁祸给龙，让亚瑟这样的"勇者"来杀死星辰，夺取他最后的力量。'
      },
      {
        episodeNumber: 4,
        title: '第四集：真正的战争',
        scenes: [
          {
            id: 'f02-s04',
            description: '恶龙谷入口，王国军已经包围了这里',
            location: '恶龙谷入口',
            time: '夜晚',
            atmosphere: '紧张'
          }
        ],
        characters: [
          { id: 'char-f02-01', name: '亚瑟', description: '传说中的勇者，被选中讨伐毁灭之龙', dialogueStyle: '正义、热血' },
          { id: 'char-f02-04', name: '盖伦', description: '王国的骑士长，亚瑟的好友', dialogueStyle: '忠诚、勇猛' },
          { id: 'char-f02-06', name: '星辰', description: '黄金巨龙圣光的丈夫，五百年来守护着妻子的遗骸', dialogueStyle: '古老、威严' },
          { id: 'char-f02-03', name: '艾琳', description: '王国的首席魔法师，亚瑟的导师', dialogueStyle: '智慧、神秘' },
          { id: 'char-f02-02', name: '国王', description: '圣光王国的统治者，实际上是邪恶势力的继承者', dialogueStyle: '阴险、残忍' }
        ],
        dialogues: [
          { characterId: 'char-f02-02', characterName: '国王', content: '（从大军中走出）亚瑟，干得好！你已经成功让那个怪物放松了警惕。现在，用圣剑杀死它！', emotion: '得意' },
          { characterId: 'char-f02-01', characterName: '亚瑟', content: '陛下...你早就知道这一切，对不对？什么"毁灭之龙"，什么"勇者的使命"...全都是谎言！', emotion: '愤怒' },
          { characterId: 'char-f02-02', characterName: '国王', content: '谎言？不，这是历史。五百年前，我的祖先开创了这个王国。五百年后，我将完成他未完成的事业——杀死这条龙，获得终极力量！亚瑟，你是我的棋子。现在，执行你的使命！', emotion: '疯狂' },
          { characterId: 'char-f02-03', characterName: '艾琳', content: '（突然出现在亚瑟身边）不，他不会。亚瑟，我一直没有告诉你——我也是黄金龙族的后裔。五百年前，我的祖先侥幸逃脱，一直隐姓埋名，等待着...等待着一个真正的勇者出现，不是去屠龙，而是去守护真相。', emotion: '揭露' },
          { characterId: 'char-f02-01', characterName: '亚瑟', content: '艾琳导师...你...', emotion: '震惊' },
          { characterId: 'char-f02-06', characterName: '星辰', content: '（虚弱地）孩子...你手里的圣剑...它会强迫你执行使用者的意志。五百年了...已经有太多"勇者"被这把剑控制...', emotion: '警告' },
          { characterId: 'char-f02-02', characterName: '国王', content: '没错！亚瑟，这把剑已经和你绑定了。要么服从我，要么...被它吞噬！', emotion: '得意' },
          { characterId: 'char-f02-01', characterName: '亚瑟', content: '（紧握圣剑，浑身颤抖）不...我不会...成为你的傀儡...', emotion: '痛苦' },
          { characterId: 'char-f02-04', characterName: '盖伦', content: '亚瑟！我支持你！不管你做出什么选择，我都跟你站在一起！', emotion: '忠诚' },
          { characterId: 'char-f02-03', characterName: '艾琳', content: '亚瑟，听我说。这把剑虽然被诅咒了，但它的力量来自使用者的意志。如果你有足够强大的信念，你可以反过来控制它。', emotion: '鼓励' },
          { characterId: 'char-f02-01', characterName: '亚瑟', content: '（抬起头，眼中闪烁着光芒）我明白了。真正的勇者，不是去斩杀被污蔑的守护者，而是去守护被扭曲的真相。国王！你听好了——从今天起，我不再是你的"勇者"。我是...真相守护者！', emotion: '坚定' },
          { characterId: 'char-f02-02', characterName: '国王', content: '什么？！不可能！这把剑应该——', emotion: '惊恐' },
          { characterId: 'char-f02-01', characterName: '亚瑟', content: '（圣剑散发出耀眼的光芒）这把剑...五百年前被用来做邪恶的事。但今天，我要用它来做正确的事。盖伦！艾琳！星辰！让我们一起，结束这个延续了五百年的谎言！', emotion: '正义' }
        ],
        summary: '最震撼的目标反转揭晓：亚瑟一直以为自己的目标是"斩杀恶龙，拯救王国"，但实际上他才是被邪恶势力利用的棋子。真正的"恶龙"其实是这片土地的守护者，而他一直效忠的国王，才是继承了邪恶意志的人。更讽刺的是，他手中的"圣剑"其实是控制他的工具。在艾琳、盖伦和星辰的支持下，亚瑟最终做出了抉择：他放弃了"勇者"的身份，选择成为"真相守护者"。他用自己坚定的意志，反过来控制了被诅咒的圣剑，决心结束这个延续了五百年的谎言。这个故事告诉我们：有时候，你一直追求的目标，可能正是你应该反对的；而你一直以为的敌人，可能才是真正需要你守护的人。真正的勇气，不是盲目地执行使命，而是在看清真相后，敢于做出正确的选择。',
        isTwist: true,
        twistHint: '伏笔：艾琳导师欲言又止的警告、幸存者的证词、星辰疲惫而非凶残的眼神、国王对"圣剑"的异常重视'
      }
    ],
    genre: '奇幻',
    createdAt: '',
    totalEpisodes: 4,
    twistType: '目标反转'
  },

  {
    id: 'template-horror-001',
    userInput: '',
    title: '精神病院探险',
    episodes: [
      {
        episodeNumber: 1,
        title: '第一集：废弃的疯人院',
        scenes: [
          {
            id: 'h01-s01',
            description: '一栋废弃的精神病院，锈迹斑斑的大门半开着',
            location: '圣心精神病院',
            time: '晚上10:00',
            atmosphere: '恐怖'
          }
        ],
        characters: [
          { id: 'char-h01-01', name: '陈峰', description: '探险视频博主，这次探险的组织者', dialogueStyle: '大胆、兴奋' },
          { id: 'char-h01-02', name: '小美', description: '陈峰的女朋友，胆子很小', dialogueStyle: '胆小、害怕' },
          { id: 'char-h01-03', name: '阿强', description: '陈峰的好友，体力担当', dialogueStyle: '粗犷、胆大' },
          { id: 'char-h01-04', name: '阿杰', description: '团队中的技术宅，负责操作各种设备', dialogueStyle: '理性、紧张' }
        ],
        dialogues: [
          { characterId: 'char-h01-01', characterName: '陈峰', content: '各位观众，欢迎来到今天的探险！我们现在位于传说中闹鬼最凶的圣心精神病院！三十年前，这里发生了一起惨绝人寰的命案，一名医生杀死了所有病人，然后自杀了。', emotion: '兴奋' },
          { characterId: 'char-h01-02', characterName: '小美', content: '陈峰...我真的不想进去...这里好可怕...', emotion: '恐惧' },
          { characterId: 'char-h01-03', characterName: '阿强', content: '怕什么！有哥在！再说了，不就是个废弃医院吗？能有什么事？', emotion: '不屑' },
          { characterId: 'char-h01-04', characterName: '阿杰', content: '（看着手中的仪器）等一下...我的电磁探测器显示...这里的电磁场很奇怪...好像有什么东西在移动...', emotion: '紧张' },
          { characterId: 'char-h01-01', characterName: '陈峰', content: '太好了！这正是观众想看的！走，我们进去！', emotion: '兴奋' }
        ],
        summary: '陈峰是一名探险视频博主，为了制作一期热门视频，组织了女友小美、好友阿强和技术宅阿杰，来到传说中闹鬼最凶的圣心精神病院探险。三十年前，这里发生过一起惨绝人寰的命案，一名医生杀死了所有病人后自杀。阿杰的电磁探测器显示有异常，但陈峰兴奋不已，认为这正是视频的爆点。四个人推开锈迹斑斑的大门，走进了黑暗的医院。'
      },
      {
        episodeNumber: 2,
        title: '第二集：不断消失的同伴',
        scenes: [
          {
            id: 'h01-s02',
            description: '医院二楼的走廊，灯光闪烁，传来奇怪的声音',
            location: '圣心精神病院二楼',
            time: '晚上11:00',
            atmosphere: '恐怖'
          }
        ],
        characters: [
          { id: 'char-h01-01', name: '陈峰', description: '探险视频博主，这次探险的组织者', dialogueStyle: '大胆、兴奋' },
          { id: 'char-h01-02', name: '小美', description: '陈峰的女朋友，胆子很小', dialogueStyle: '胆小、害怕' },
          { id: 'char-h01-03', name: '阿强', description: '陈峰的好友，体力担当', dialogueStyle: '粗犷、胆大' },
          { id: 'char-h01-04', name: '阿杰', description: '团队中的技术宅，负责操作各种设备', dialogueStyle: '理性、紧张' }
        ],
        dialogues: [
          { characterId: 'char-h01-03', characterName: '阿强', content: '我去那边看看，应该有个楼梯间。', emotion: '随意' },
          { characterId: 'char-h01-01', characterName: '陈峰', content: '好，我们在这里等你。', emotion: '专注' },
          { characterId: 'char-h01-02', characterName: '小美', content: '（过了一会儿）陈峰...阿强怎么去了这么久？', emotion: '不安' },
          { characterId: 'char-h01-01', characterName: '陈峰', content: '阿强？阿强！（没有回应）奇怪...阿杰，你看到他了吗？', emotion: '困惑' },
          { characterId: 'char-h01-04', characterName: '阿杰', content: '我...我以为他跟你们在一起...等等，我的探测器显示...刚才有三个信号，现在...只剩下两个了。', emotion: '恐惧' },
          { characterId: 'char-h01-02', characterName: '小美', content: '什么意思？阿强...阿强不见了？！', emotion: '崩溃' },
          { characterId: 'char-h01-04', characterName: '阿杰', content: '不只是阿强...刚才...我好像还听到了...第五个人的声音...', emotion: '颤抖' }
        ],
        summary: '进入医院后不久，阿强说要去查看楼梯间，然后就再也没有回来。陈峰等人开始寻找，但阿强仿佛人间蒸发了一样。阿杰的电磁探测器显示，原本的四个信号变成了三个，然后变成了两个。更可怕的是，阿杰说他好像听到了"第五个人"的声音。小美已经快要崩溃了，陈峰也开始感到不安，但为了视频，他决定继续深入。'
      },
      {
        episodeNumber: 3,
        title: '第三集：最后的真相',
        scenes: [
          {
            id: 'h01-s03',
            description: '医院地下室，当年命案发生的地方',
            location: '圣心精神病院地下室',
            time: '午夜',
            atmosphere: '终极恐怖'
          }
        ],
        characters: [
          { id: 'char-h01-01', name: '陈峰', description: '探险视频博主，这次探险的组织者', dialogueStyle: '大胆、兴奋' },
          { id: 'char-h01-02', name: '小美', description: '陈峰的女朋友，胆子很小', dialogueStyle: '胆小、害怕' },
          { id: 'char-h01-04', name: '阿杰', description: '团队中的技术宅，负责操作各种设备', dialogueStyle: '理性、紧张' },
          { id: 'char-h01-05', name: '医生', description: '三十年前自杀的医生，现在是医院里的恶灵', dialogueStyle: '阴冷、疯狂' }
        ],
        dialogues: [
          { characterId: 'char-h01-02', characterName: '小美', content: '陈峰...我真的走不动了...我们回去好不好...', emotion: '虚弱' },
          { characterId: 'char-h01-01', characterName: '陈峰', content: '再坚持一下，小美。我们找到阿强就走。', emotion: '紧张' },
          { characterId: 'char-h01-04', characterName: '阿杰', content: '（突然停下）等一下...陈峰，你有没有觉得...小美和阿强...还有我...我们其实...', emotion: '恐惧' },
          { characterId: 'char-h01-01', characterName: '陈峰', content: '阿杰，你想说什么？', emotion: '困惑' },
          { characterId: 'char-h01-04', characterName: '阿杰', content: '我的探测器...从一开始，就只检测到一个活人的信号。', emotion: '颤抖' },
          { characterId: 'char-h01-01', characterName: '陈峰', content: '什么？不可能！我们四个人——', emotion: '震惊' },
          { characterId: 'char-h01-05', characterName: '医生', content: '（阴冷的声音从四面八方传来）不，孩子。从一开始，就只有你一个人。', emotion: '阴冷' },
          { characterId: 'char-h01-01', characterName: '陈峰', content: '谁？！谁在说话？', emotion: '惊恐' },
          { characterId: 'char-h01-05', characterName: '医生', content: '你不记得了吗？三十年前，你来到这个医院。你是第一个病人。不...不对，你是那个...医生。你杀死了所有病人，然后...自杀了。', emotion: '揭露真相' },
          { characterId: 'char-h01-01', characterName: '陈峰', content: '不...我不是医生...我是陈峰...我是...', emotion: '否认' },
          { characterId: 'char-h01-02', characterName: '小美', content: '（突然微笑，声音变得阴冷）陈峰...不，医生。你不认识我了吗？我是你杀死的第一个病人。', emotion: '诡异' },
          { characterId: 'char-h01-04', characterName: '阿杰', content: '我是第二个。', emotion: '阴冷' },
          { characterId: 'char-h01-05', characterName: '医生', content: '而我...是你。三十年来，你一直困在这里，一遍又一遍地重复着同样的故事。你创造了"陈峰"这个身份，创造了这些"同伴"，只是为了...逃避你是杀人凶手的真相。但是...', emotion: '悲伤' },
          { characterId: 'char-h01-01', characterName: '陈峰', content: '不...不...我记起来了...那天晚上...我...我为什么要...', emotion: '崩溃' },
          { characterId: 'char-h01-05', characterName: '医生', content: '因为你发现了一个可怕的事实：你自己也是一个病人。你被误诊为医生，在这个医院里"治疗"其他人。当你终于意识到真相时，你崩溃了。你杀死了所有人，包括你自己。而现在...你必须记住这一切。因为...记住痛苦，才是真正的惩罚。', emotion: '终极揭露' }
        ],
        summary: '最恐怖的存在反转揭晓：陈峰一直以为自己带着三个同伴来探险，但实际上，从一开始就只有他一个人。小美、阿强、阿杰...都是他的幻觉。更可怕的是，他以为自己是"陈峰"——一个视频博主，但这也是幻觉。真正的他，是三十年前那个杀死所有病人然后自杀的医生。三十年来，他的灵魂一直困在这所精神病院里，一遍又一遍地重复着同样的"探险"。他创造了"陈峰"这个身份，创造了这些"同伴"，只是为了逃避自己是杀人凶手的真相。而那"第五个人"的声音，其实是他自己真实人格的回响——一个试图让他记起真相的声音。最终，他记起了一切。但记起，才是永恒惩罚的开始。',
        isTwist: true,
        twistHint: '伏笔：阿杰的探测器从一开始就只显示一个信号、"第五个人"的声音、陈峰对这所医院莫名的熟悉感、小美和阿强的"消失"其实是幻觉的解除'
      }
    ],
    genre: '恐怖',
    createdAt: '',
    totalEpisodes: 3,
    twistType: '存在反转'
  },

  {
    id: 'template-historical-001',
    userInput: '',
    title: '御容画师',
    episodes: [
      {
        episodeNumber: 1,
        title: '第一集：入宫的画师',
        scenes: [
          {
            id: 'his01-s01',
            description: '皇宫大殿，皇帝召见年轻的画师',
            location: '皇宫太和殿',
            time: '上午',
            atmosphere: '庄严'
          }
        ],
        characters: [
          { id: 'char-his01-01', name: '顾言之', description: '年轻的宫廷画师，技艺高超，性格耿直', dialogueStyle: '正直、内敛' },
          { id: 'char-his01-02', name: '皇帝', description: '当朝天子，看起来威严但似乎隐藏着秘密', dialogueStyle: '威严、神秘' },
          { id: 'char-his01-03', name: '大太监', description: '皇帝身边的亲信太监，察言观色', dialogueStyle: '圆滑、谨慎' },
          { id: 'char-his01-04', name: '李贵妃', description: '皇帝最宠爱的妃子，似乎知道很多秘密', dialogueStyle: '妩媚、心机' }
        ],
        dialogues: [
          { characterId: 'char-his01-02', characterName: '皇帝', content: '顾言之，朕听闻你的画技出神入化，能画人入骨。今日召你入宫，是想让你为朕画一幅御容。', emotion: '威严' },
          { characterId: 'char-his01-01', characterName: '顾言之', content: '草民定当竭尽所能，为陛下画好这幅御容。', emotion: '恭敬' },
          { characterId: 'char-his01-03', characterName: '大太监', content: '顾画师，咱家可要提醒你一句：给陛下画像，可不是件容易的事。画得不像，是欺君；画得太像...也可能是欺君。你...明白咱家的意思吗？', emotion: '意味深长' },
          { characterId: 'char-his01-01', characterName: '顾言之', content: '草民愚钝，还请公公明示。', emotion: '困惑' },
          { characterId: 'char-his01-03', characterName: '大太监', content: '（摇头）唉，年轻人...记住，陛下要的不是"真相"，而是"威严"。有些东西，该画的画，不该画的...就当没看见。', emotion: '警告' }
        ],
        summary: '顾言之是一位技艺高超的年轻画师，被皇帝召入宫中为其画御容。大太监警告他，给皇帝画像不是一件容易的事——画得不像，是欺君；画得太像，也可能是欺君。顾言之感到困惑，但还是接下了任务。在接下来的日子里，他每天都要入宫为皇帝画像，但他总觉得，皇帝的脸...似乎有什么地方不对劲。'
      },
      {
        episodeNumber: 2,
        title: '第二集：画中的秘密',
        scenes: [
          {
            id: 'his01-s02',
            description: '皇宫偏殿，顾言之为皇帝画像',
            location: '御书房',
            time: '下午',
            atmosphere: '诡异'
          }
        ],
        characters: [
          { id: 'char-his01-01', name: '顾言之', description: '年轻的宫廷画师，技艺高超，性格耿直', dialogueStyle: '正直、内敛' },
          { id: 'char-his01-02', name: '皇帝', description: '当朝天子，看起来威严但似乎隐藏着秘密', dialogueStyle: '威严、神秘' },
          { id: 'char-his01-04', name: '李贵妃', description: '皇帝最宠爱的妃子，似乎知道很多秘密', dialogueStyle: '妩媚、心机' }
        ],
        dialogues: [
          { characterId: 'char-his01-01', characterName: '顾言之', content: '陛下，请稍微向左转头...对，保持这个姿势。', emotion: '专注' },
          { characterId: 'char-his01-02', characterName: '皇帝', content: '顾言之，你画得如何了？', emotion: '随意' },
          { characterId: 'char-his01-01', characterName: '顾言之', content: '回陛下，已经完成了七成。只是...', emotion: '犹豫' },
          { characterId: 'char-his01-02', characterName: '皇帝', content: '只是什么？', emotion: '询问' },
          { characterId: 'char-his01-01', characterName: '顾言之', content: '草民有一事不明。臣家中藏有一幅先皇的御容，是当年宫廷画师所绘。先皇与陛下...相貌几乎一模一样。但...仔细看的话，还是有些细微的不同。', emotion: '困惑' },
          { characterId: 'char-his01-02', characterName: '皇帝', content: '（眼神微变）哦？什么不同？', emotion: '平静' },
          { characterId: 'char-his01-01', characterName: '顾言之', content: '先皇的左耳后有一颗小痣，而陛下...没有。还有，先皇的右手小指因年轻时受伤而略微弯曲，但陛下的手指...完好无损。', emotion: '困惑' },
          { characterId: 'char-his01-02', characterName: '皇帝', content: '（沉默片刻）顾言之，你观察力很强。你知道吗？之前已经有三位画师...因为观察太仔细，而被朕处死了。', emotion: '阴冷' },
          { characterId: 'char-his01-01', characterName: '顾言之', content: '陛下！草民...草民只是——', emotion: '惊恐' },
          { characterId: 'char-his01-02', characterName: '皇帝', content: '（突然大笑）哈哈哈哈！别怕，顾言之。朕不杀你。朕要你...帮朕画一幅"真实"的画。', emotion: '神秘' }
        ],
        summary: '在画像的过程中，顾言之发现了一些奇怪的地方。他家中藏有先皇的御容，发现当今皇帝与先皇相貌几乎一模一样，但有两处细微的不同——先皇左耳后有痣、右手小指受伤弯曲，而当今皇帝没有。皇帝闻言色变，告诉顾言之之前已经有三位画师因为"观察太仔细"而被处死。但皇帝说他不杀顾言之，反而要他帮自己画一幅"真实"的画。顾言之感到困惑，不明白皇帝的意思。'
      },
      {
        episodeNumber: 3,
        title: '第三集：贵妃的秘密',
        scenes: [
          {
            id: 'his01-s03',
            description: '李贵妃的寝宫，她深夜召见顾言之',
            location: '贵妃寝宫',
            time: '深夜',
            atmosphere: '神秘'
          }
        ],
        characters: [
          { id: 'char-his01-01', name: '顾言之', description: '年轻的宫廷画师，技艺高超，性格耿直', dialogueStyle: '正直、内敛' },
          { id: 'char-his01-04', name: '李贵妃', description: '皇帝最宠爱的妃子，似乎知道很多秘密', dialogueStyle: '妩媚、心机' },
          { id: 'char-his01-05', name: '神秘人', description: '一个隐藏在暗处的人，似乎与贵妃有勾结', dialogueStyle: '低沉、神秘' }
        ],
        dialogues: [
          { characterId: 'char-his01-04', characterName: '李贵妃', content: '顾画师，深夜召见，冒昧了。', emotion: '妩媚' },
          { characterId: 'char-his01-01', characterName: '顾言之', content: '不知贵妃娘娘深夜召见草民，有何吩咐？', emotion: '困惑' },
          { characterId: 'char-his01-04', characterName: '李贵妃', content: '陛下让你画御容...你有没有发现...什么特别的地方？', emotion: '试探' },
          { characterId: 'char-his01-01', characterName: '顾言之', content: '草民愚钝，不知娘娘所指何事。', emotion: '谨慎' },
          { characterId: 'char-his01-04', characterName: '李贵妃', content: '（叹气）顾言之，你是个聪明人。你应该已经发现了——当今皇上...他不是真正的皇帝。', emotion: '揭露' },
          { characterId: 'char-his01-01', characterName: '顾言之', content: '娘娘！这话可不能乱说！这是诛九族的大罪！', emotion: '惊恐' },
          { characterId: 'char-his01-04', characterName: '李贵妃', content: '正因为是诛九族的大罪，我才要告诉你。顾言之，你画的不是皇帝的脸...你画的是"真相"。而那个真相，会让很多人头落地。包括你，包括我，也包括...那个坐在龙椅上的人。', emotion: '严肃' },
          { characterId: 'char-his01-05', characterName: '神秘人', content: '（从暗处走出）够了，贵妃。跟他说这么多干什么？直接——', emotion: '凶狠' },
          { characterId: 'char-his01-04', characterName: '李贵妃', content: '（打断）不！我们需要他。顾言之，只有你的画笔，才能揭露这个惊天的秘密。你知道吗？真正的皇帝...早在二十年前就死了。', emotion: '震撼' }
        ],
        summary: '李贵妃深夜召见顾言之，直接告诉他一个惊天的秘密：当今皇上不是真正的皇帝。她说顾言之画的不是皇帝的脸，而是"真相"。她透露，真正的皇帝早在二十年前就死了。顾言之感到无比震惊，不明白这一切究竟是怎么回事。李贵妃说他是唯一能够揭露真相的人，因为只有他的画笔能够"画人入骨"，画出那些被隐藏的细节。'
      },
      {
        episodeNumber: 4,
        title: '第四集：最后的御容',
        scenes: [
          {
            id: 'his01-s04',
            description: '皇宫大殿，顾言之呈上完成的御容',
            location: '太和殿',
            time: '上午',
            atmosphere: '紧张'
          }
        ],
        characters: [
          { id: 'char-his01-01', name: '顾言之', description: '年轻的宫廷画师，技艺高超，性格耿直', dialogueStyle: '正直、内敛' },
          { id: 'char-his01-02', name: '皇帝', description: '当朝天子，实际上是被掉包的假皇帝', dialogueStyle: '威严、痛苦' },
          { id: 'char-his01-04', name: '李贵妃', description: '皇帝最宠爱的妃子，知道所有秘密', dialogueStyle: '妩媚、悲伤' },
          { id: 'char-his01-03', name: '大太监', description: '皇帝身边的亲信太监，从一开始就知道真相', dialogueStyle: '圆滑、忠诚' }
        ],
        dialogues: [
          { characterId: 'char-his01-01', characterName: '顾言之', content: '陛下，御容已完成，请陛下过目。', emotion: '平静' },
          { characterId: 'char-his01-02', characterName: '皇帝', content: '（接过画卷，展开）...', emotion: '沉默' },
          { characterId: 'char-his01-02', characterName: '皇帝', content: '顾言之，你画的...不是朕。', emotion: '复杂' },
          { characterId: 'char-his01-01', characterName: '顾言之', content: '回陛下，草民画的...是真相。', emotion: '坚定' },
          { characterId: 'char-his01-02', characterName: '皇帝', content: '（长叹）是啊...真相。二十年了，终于有人画出了真相。顾言之，你想知道这一切是怎么回事吗？', emotion: '释然' },
          { characterId: 'char-his01-01', characterName: '顾言之', content: '草民愿闻其详。', emotion: '恭敬' },
          { characterId: 'char-his01-02', characterName: '皇帝', content: '二十年前，先皇病危。但他没有子嗣，只有一个双胞胎弟弟。为了不让江山落入外人之手，先皇与弟弟达成了一个秘密协议——先皇死后，由弟弟假扮他，继续统治这个国家。而真正的先皇...被秘密安葬，对外宣称是"病逝"。', emotion: '揭露真相' },
          { characterId: 'char-his01-04', characterName: '李贵妃', content: '而我...我是先皇的妃子。但我爱的人...是现在这个坐在龙椅上的人。二十年来，我看着他戴着别人的面具活着，看着他一天天忘记自己是谁...', emotion: '悲伤' },
          { characterId: 'char-his01-02', characterName: '皇帝', content: '顾言之，你知道为什么之前的画师都死了吗？因为他们画的是"我"——这个假皇帝。而朕要的...不是"我"的画像，而是"真相"的画像。朕要你画的，是先皇的脸，也是我真正的脸。让世人知道，这张龙椅上坐过两个人，两张面孔，一个王朝。', emotion: '终极揭露' },
          { characterId: 'char-his01-01', characterName: '顾言之', content: '所以陛下之前说的"真实的画"...是这个意思？', emotion: '震惊' },
          { characterId: 'char-his01-02', characterName: '皇帝', content: '是的。二十年了，我每天都戴着面具生活。我快要忘记自己是谁了。顾言之，你的画...让我记起了。记起了我是谁，也记起了他是谁。谢谢你。', emotion: '悲伤' },
          { characterId: 'char-his01-03', characterName: '大太监', content: '（突然跪下）陛下！老奴有一言，不知当讲不当讲。', emotion: '急切' },
          { characterId: 'char-his01-02', characterName: '皇帝', content: '说吧。', emotion: '平静' },
          { characterId: 'char-his01-03', characterName: '大太监', content: '这幅画...不能流传出去。如果让世人知道了真相，天下大乱啊！', emotion: '焦急' },
          { characterId: 'char-his01-02', characterName: '皇帝', content: '（沉默良久）你说得对。这幅画...烧了吧。', emotion: '痛苦' },
          { characterId: 'char-his01-01', characterName: '顾言之', content: '陛下！那真相...', emotion: '不甘' },
          { characterId: 'char-his01-02', characterName: '皇帝', content: '真相？顾言之，你已经画出来了。这就够了。有些真相，不需要所有人都知道。但它们...必须被记住。你记住了，我记住了，这就够了。至于其他人...让他们相信他们愿意相信的吧。', emotion: '释然' }
        ],
        summary: '最震撼的信息差反转揭晓：顾言之一直以为自己是在为"皇帝"画像，但实际上，他画的是"真相"——一个被隐藏了二十年的惊天秘密。当今皇帝确实是被掉包的，但不是篡位，而是先皇的双胞胎弟弟。先皇病危无子，为了江山稳定，与弟弟达成秘密协议——弟弟假扮他继续统治，而真正的先皇被秘密安葬。之前的画师之所以被杀，不是因为他们发现了真相，而是因为他们"没发现"——他们只画出了"假皇帝"的脸，而皇帝真正想要的，是有人能画出"真相"：两张面孔，一个王朝。最终，皇帝选择烧掉这幅画。他说有些真相不需要所有人都知道，但必须被记住。顾言之记住了，皇帝自己也记住了——这就够了。而这个关于"两张面孔"的故事，将永远成为一个秘密，一个只有画笔知道的秘密。',
        isTwist: true,
        twistHint: '伏笔：先皇与当今皇帝相貌的细微差异、大太监"画得太像也可能是欺君"的警告、皇帝之前处死画师的奇怪理由、李贵妃知道太多秘密'
      }
    ],
    genre: '历史',
    createdAt: '',
    totalEpisodes: 4,
    twistType: '信息差反转'
  },

  {
    id: 'template-family-001',
    userInput: '',
    title: '寻找母亲',
    episodes: [
      {
        episodeNumber: 1,
        title: '第一集：离家的母亲',
        scenes: [
          {
            id: 'fam01-s01',
            description: '一个普通的三口之家，母亲留下一封信后消失了',
            location: '林家客厅',
            time: '晚上',
            atmosphere: '悲伤'
          }
        ],
        characters: [
          { id: 'char-fam01-01', name: '林小雨', description: '25岁，女儿，从小与母亲关系疏远', dialogueStyle: '独立、倔强' },
          { id: 'char-fam01-02', name: '林建国', description: '50岁，父亲，性格内向，沉默寡言', dialogueStyle: '沉默、温和' },
          { id: 'char-fam01-03', name: '母亲（回忆中）', description: '小雨的母亲，在她小时候离家出走', dialogueStyle: '温柔、神秘' }
        ],
        dialogues: [
          { characterId: 'char-fam01-01', characterName: '林小雨', content: '爸，又在看妈妈的照片了？', emotion: '无奈' },
          { characterId: 'char-fam01-02', characterName: '林建国', content: '（慌忙收起照片）啊...小雨，你回来了。', emotion: '尴尬' },
          { characterId: 'char-fam01-01', characterName: '林小雨', content: '爸，都二十年了。她既然选择离开，就不会回来了。你这样...值得吗？', emotion: '心疼' },
          { characterId: 'char-fam01-02', characterName: '林建国', content: '小雨，你不懂。你妈妈...她有她的苦衷。', emotion: '悲伤' },
          { characterId: 'char-fam01-01', characterName: '林小雨', content: '苦衷？什么苦衷能让她抛下五岁的女儿，一走就是二十年？爸，我告诉你，我这辈子都不会原谅她！', emotion: '愤怒' },
          { characterId: 'char-fam01-02', characterName: '林建国', content: '（欲言又止）小雨...有些事情，不是你想的那样。', emotion: '犹豫' }
        ],
        summary: '林小雨今年25岁，在她五岁的时候，母亲留下一封信后离家出走，再也没有回来。二十年来，父亲林建国一直默默等待着母亲的归来，这让小雨非常不解。她认为母亲既然选择离开，就不值得被等待。父女俩因为这件事经常产生矛盾。林建国总是欲言又止，似乎有什么难言之隐。'
      },
      {
        episodeNumber: 2,
        title: '第二集：意外的线索',
        scenes: [
          {
            id: 'fam01-s02',
            description: '小雨整理旧物时发现了一些奇怪的线索',
            location: '林家储物间',
            time: '下午',
            atmosphere: '神秘'
          }
        ],
        characters: [
          { id: 'char-fam01-01', name: '林小雨', description: '25岁，女儿，从小与母亲关系疏远', dialogueStyle: '独立、倔强' },
          { id: 'char-fam01-02', name: '林建国', description: '50岁，父亲，性格内向，沉默寡言', dialogueStyle: '沉默、温和' }
        ],
        dialogues: [
          { characterId: 'char-fam01-01', characterName: '林小雨', content: '这是什么...一个旧箱子？', emotion: '困惑' },
          { characterId: 'char-fam01-01', characterName: '林小雨', content: '（打开箱子）这些...都是妈妈的东西？这条裙子...这件大衣...还有这些化妆品...', emotion: '惊讶' },
          { characterId: 'char-fam01-01', characterName: '林小雨', content: '等等...这张照片...（拿起照片）这是...妈妈年轻的时候？但是...（仔细看）这个人...这个人的脸...', emotion: '震惊' },
          { characterId: 'char-fam01-02', characterName: '林建国', content: '（突然出现）小雨！你在干什么？！', emotion: '慌张' },
          { characterId: 'char-fam01-01', characterName: '林小雨', content: '爸，这张照片...这上面的人...她的脸...为什么和你年轻的时候这么像？', emotion: '震惊' },
          { characterId: 'char-fam01-02', characterName: '林建国', content: '我...小雨，你听我解释——', emotion: '慌乱' },
          { characterId: 'char-fam01-01', characterName: '林小雨', content: '还有这些衣服...尺寸都好大...这根本不是女人的尺寸！爸，这到底是怎么回事？！', emotion: '崩溃' }
        ],
        summary: '小雨在整理储物间时，发现了一个旧箱子，里面都是"母亲"的东西。但她发现了一些奇怪的地方：照片上的"母亲"年轻时的脸，竟然和父亲年轻的时候非常相似；而"母亲"的衣服尺寸，也明显是男性的尺寸。林建国发现后非常慌张，想要解释，但小雨已经接近崩溃。她意识到，自己二十年来深信不疑的"母亲离家出走"的故事，可能隐藏着一个巨大的秘密。'
      },
      {
        episodeNumber: 3,
        title: '第三集：最后的真相',
        scenes: [
          {
            id: 'fam01-s03',
            description: '林家客厅，父亲终于说出了所有的秘密',
            location: '林家客厅',
            time: '晚上',
            atmosphere: '悲伤而温暖'
          }
        ],
        characters: [
          { id: 'char-fam01-01', name: '林小雨', description: '25岁，女儿，从小与母亲关系疏远', dialogueStyle: '独立、倔强' },
          { id: 'char-fam01-02', name: '林建国', description: '50岁，父亲，实际上扮演了父母双重角色', dialogueStyle: '沉默、温和' }
        ],
        dialogues: [
          { characterId: 'char-fam01-01', characterName: '林小雨', content: '爸，告诉我真相。我的妈妈...到底是谁？她...还活着吗？', emotion: '颤抖' },
          { characterId: 'char-fam01-02', characterName: '林建国', content: '（长叹一声）小雨，是时候告诉你一切了。你的妈妈...她在生你的时候，就去世了。', emotion: '悲伤' },
          { characterId: 'char-fam01-01', characterName: '林小雨', content: '什么？！不可能！那...那我小时候看到的妈妈...还有她离家出走的事...', emotion: '震惊' },
          { characterId: 'char-fam01-02', characterName: '林建国', content: '你五岁那年，有一次发高烧，差点...不行了。醒来后，你一直问妈妈在哪里。我不忍心告诉你真相...所以...', emotion: '痛苦' },
          { characterId: 'char-fam01-01', characterName: '林小雨', content: '所以你...你假扮成妈妈？', emotion: '不敢相信' },
          { characterId: 'char-fam01-02', characterName: '林建国', content: '刚开始，我只是偶尔穿上你妈妈的衣服，在你床边说话。后来...我发现你越来越依赖那个"妈妈"。我开始练习化妆，练习女声，练习用你妈妈的方式说话。那三年...我既是爸爸，也是妈妈。', emotion: '深情' },
          { characterId: 'char-fam01-01', characterName: '林小雨', content: '那...离家出走呢？为什么要让她"离开"？', emotion: '泪水' },
          { characterId: 'char-fam01-02', characterName: '林建国', content: '你八岁那年，有一次对我说："爸爸，为什么妈妈总是晚上才出现？为什么她从不带我去公园？为什么别的小朋友都有正常的妈妈？"我...我知道不能再继续下去了。你需要一个正常的成长环境。所以...我安排了那场"离家出走"。我以为...这样对你最好。', emotion: '痛苦' },
          { characterId: 'char-fam01-01', characterName: '林小雨', content: '所以...这二十年来...我一直恨的那个"抛弃我的妈妈"...其实是你？而我一直责怪你"留不住妈妈"...但实际上，你给了我双份的爱？', emotion: '崩溃' },
          { characterId: 'char-fam01-02', characterName: '林建国', content: '小雨，爸爸对不起你。我知道这个谎言很自私...但当时...我真的不知道该怎么办。我只是想...想让你有一个"完整"的家。即使那个家...是我一个人扮演的。', emotion: '泪水' },
          { characterId: 'char-fam01-01', characterName: '林小雨', content: '（扑入父亲怀中）爸爸...你这个傻瓜...你为什么不早点告诉我...你知道这些年我有多恨"她"吗...我有多自责自己不够好才让她离开吗...', emotion: '大哭' },
          { characterId: 'char-fam01-02', characterName: '林建国', content: '（轻轻抱住女儿）小雨，对不起...爸爸只是...只是太爱你了。', emotion: '温柔' },
          { characterId: 'char-fam01-01', characterName: '林小雨', content: '（抬起头，泪眼婆娑）爸爸...谢谢你。谢谢你...给了我一个妈妈。即使她是假扮的...但那份爱...是真的，对不对？', emotion: '释然' },
          { characterId: 'char-fam01-02', characterName: '林建国', content: '（点头）是真的，小雨。那份爱...比什么都真。', emotion: '幸福' }
        ],
        summary: '最感人的关系反转揭晓：小雨一直以为母亲在她五岁那年离家出走，抛弃了她和父亲。但实际上，她的母亲在生她的时候就去世了。五岁那年，小雨高烧不退，醒来后一直问妈妈在哪里。父亲林建国不忍心告诉女儿真相，于是开始假扮"妈妈"——穿妻子的衣服，练习化妆和女声，在夜晚扮演那个已经不存在的人。那三年，他既是爸爸也是妈妈，给了小雨双倍的爱。但随着小雨长大，问题出现了——她开始问为什么"妈妈"总是晚上才出现，为什么从不带她去公园。林建国知道不能再继续下去了，于是安排了那场"离家出走"，让"妈妈"从小雨的生命中消失。他以为这样对小雨最好，却不知道二十年来，小雨一直活在"被母亲抛弃"的阴影中，一直责怪自己不够好。当真相终于揭晓，所有的怨恨和自责都化为泪水。小雨意识到，她一直恨的那个"抛弃她的妈妈"其实是最爱她的爸爸；她一直责怪的"留不住妈妈的爸爸"，其实给了她双份的爱。这个故事告诉我们：有些谎言，不是为了欺骗，而是为了守护；有些关系，不是表面看起来那样，但爱...永远是真的。',
        isTwist: true,
        twistHint: '伏笔：父亲对"母亲"的事情总是欲言又止、"母亲"的衣服尺寸偏大、照片上的"母亲"与父亲年轻时相貌相似、小雨记忆中的"母亲"总是在晚上出现'
      }
    ],
    genre: '家庭',
    createdAt: '',
    totalEpisodes: 3,
    twistType: '关系反转'
  },

  {
    id: 'template-mystery-004',
    userInput: '',
    title: '记忆迷宫',
    episodes: [
      {
        episodeNumber: 1,
        title: '第一集：苏醒',
        scenes: [
          {
            id: 'm04-s01',
            description: '一间封闭的密室，四面墙壁上画满了奇怪的符号和数字，中央有一张床，一个男人从床上醒来',
            location: '密室',
            time: '未知',
            atmosphere: '压抑、诡异'
          }
        ],
        characters: [
          { id: 'char-m04-01', name: '陈默', description: '失去记忆的男人，唯一记得的只有自己的名字', dialogueStyle: '困惑、焦虑' },
          { id: 'char-m04-02', name: '声音', description: '从隐藏扬声器中传来的神秘女声', dialogueStyle: '机械、无感情' }
        ],
        dialogues: [
          { characterId: 'char-m04-01', characterName: '陈默', content: '我是谁...这是什么地方？', emotion: '恐惧' },
          { characterId: 'char-m04-02', characterName: '声音', content: '陈默，欢迎来到记忆迷宫。你必须在72小时内找到出口，否则将永远困在这里。', emotion: '机械' },
          { characterId: 'char-m04-01', characterName: '陈默', content: '记忆迷宫？什么意思？放我出去！', emotion: '愤怒' },
          { characterId: 'char-m04-02', characterName: '声音', content: '墙上的符号就是线索。每一个符号都代表你失去的一段记忆。找到所有记忆，就能找到出口。', emotion: '机械' }
        ],
        summary: '陈默在一间封闭的密室中醒来，失去了所有记忆，只记得自己的名字。一个神秘的女声从扬声器中传来，告诉他这是"记忆迷宫"，必须在72小时内找到出口。墙上画满了奇怪的符号和数字，女声说这些符号代表他失去的记忆。陈默必须解开这个谜题。'
      },
      {
        episodeNumber: 2,
        title: '第二集：碎片',
        scenes: [
          {
            id: 'm04-s02',
            description: '密室中，陈默开始研究墙上的符号，每解开一个符号，他就会恢复一段记忆',
            location: '密室',
            time: '过去48小时',
            atmosphere: '紧张、困惑'
          }
        ],
        characters: [
          { id: 'char-m04-01', name: '陈默', description: '失去记忆的男人，正在逐渐恢复记忆', dialogueStyle: '从困惑到逐渐清明' },
          { id: 'char-m04-02', name: '声音', description: '神秘女声', dialogueStyle: '机械、无感情' },
          { id: 'char-m04-03', name: '苏婉', description: '陈默记忆中的女人，他的未婚妻', dialogueStyle: '温柔、美丽' }
        ],
        dialogues: [
          { characterId: 'char-m04-01', characterName: '陈默', content: '这个符号...我想起来了！苏婉...我的未婚妻...', emotion: '激动' },
          { characterId: 'char-m04-02', characterName: '声音', content: '记忆恢复15%。继续寻找其他符号。', emotion: '机械' },
          { characterId: 'char-m04-01', characterName: '陈默', content: '苏婉...她在哪里？我记得我们要结婚了...然后...发生了什么？', emotion: '痛苦' },
          { characterId: 'char-m04-02', characterName: '声音', content: '有些记忆，最好不要想起。', emotion: '神秘' },
          { characterId: 'char-m04-01', characterName: '陈默', content: '什么意思？你到底是谁？', emotion: '怀疑' },
          { characterId: 'char-m04-02', characterName: '声音', content: '我是你的守护者，陈默。我在保护你免受真相的伤害。', emotion: '温柔' }
        ],
        summary: '陈默开始研究墙上的符号，每解开一个符号，他就会恢复一段记忆。他想起了未婚妻苏婉，想起了他们即将结婚。但每次想起苏婉，都会伴随着一阵剧烈的头痛。神秘女声的态度开始变化，从机械变得温柔，声称是在"保护"陈默。陈默开始怀疑这个"记忆迷宫"的真正目的。'
      },
      {
        episodeNumber: 3,
        title: '第三集：真相',
        scenes: [
          {
            id: 'm04-s03',
            description: '密室的门终于打开，外面不是自由，而是一个病房。所有真相揭晓。',
            location: '精神病院病房',
            time: '现在',
            atmosphere: '震撼、悲伤'
          }
        ],
        characters: [
          { id: 'char-m04-01', name: '陈默', description: '恢复了所有记忆的男人', dialogueStyle: '崩溃、绝望' },
          { id: 'char-m04-02', name: '林医生', description: '陈默的主治医生，一直通过扬声器与他对话', dialogueStyle: '专业、同情' },
          { id: 'char-m04-03', name: '苏婉', description: '陈默的未婚妻，但早已不在人世', dialogueStyle: '温柔、悲伤' }
        ],
        dialogues: [
          { characterId: 'char-m04-01', characterName: '陈默', content: '门...开了？这是...医院？', emotion: '困惑' },
          { characterId: 'char-m04-02', characterName: '林医生', content: '陈默，你终于醒了。', emotion: '欣慰' },
          { characterId: 'char-m04-01', characterName: '陈默', content: '林医生？那声音...是你？记忆迷宫...是什么意思？', emotion: '震惊' },
          { characterId: 'char-m04-02', characterName: '林医生', content: '陈默，三年前，你和苏婉在结婚前一周遭遇了一场严重的车祸。苏婉...当场死亡。你虽然活了下来，但头部受到重创，陷入了昏迷。', emotion: '悲伤' },
          { characterId: 'char-m04-01', characterName: '陈默', content: '不...不可能...苏婉她...', emotion: '崩溃' },
          { characterId: 'char-m04-02', characterName: '林医生', content: '你醒来后，患上了严重的创伤后应激障碍和选择性失忆。你的大脑拒绝接受苏婉已经死亡的事实，所以创造了一个"记忆迷宫"的幻觉。那些墙上的符号...其实是你病房里的墙纸图案。这三年来，你一直在自己的幻觉中寻找一个不存在的"出口"。我...我只是一直在尝试引导你面对真相。', emotion: '同情' },
          { characterId: 'char-m04-01', characterName: '陈默', content: '所以...我以为我在解开谜题，恢复记忆...实际上...我一直在逃避真相？那些记忆...都是我的大脑编造的？', emotion: '绝望' },
          { characterId: 'char-m04-02', characterName: '林医生', content: '不，陈默。你对苏婉的爱是真的。你们的故事也是真的。只是结局...你一直无法接受。现在...你终于愿意面对了吗？', emotion: '温柔' },
          { characterId: 'char-m04-01', characterName: '陈默', content: '（看向空中，仿佛看到了苏婉的身影）苏婉...我...我好想你...', emotion: '大哭' },
          { characterId: 'char-m04-03', characterName: '苏婉', content: '（幻影）我知道，陈默。我一直都知道。现在...让我走吧。你也要...好好生活。', emotion: '温柔' }
        ],
        summary: '最震撼的记忆反转揭晓：陈默以为自己在密室中解开谜题、恢复记忆，但实际上，他是一个在车祸中失去未婚妻的精神病人。三年来，他一直被困在自己创造的幻觉中——那些"墙上的符号"只是病房的墙纸图案，那个"神秘女声"是他的主治医生。他以为自己在"恢复记忆"，实际上，他的大脑一直在编造记忆来保护他免受真相的伤害。苏婉已经死了，而"记忆迷宫"是他逃避现实的方式。当真相终于揭晓，陈默必须面对他一直无法接受的事实——他深爱的人，再也回不来了。这个故事探讨了记忆的不可靠性，以及人类大脑为了自我保护可以创造出多么复杂的幻觉。',
        isTwist: true,
        twistHint: '伏笔：女声的态度从机械逐渐变得温柔、陈默每次想起苏婉都会头痛、密室的"时间"概念模糊不清、所有"线索"其实都可以有多种解读'
      }
    ],
    genre: '悬疑',
    createdAt: '',
    totalEpisodes: 3,
    twistType: '记忆反转'
  },

  {
    id: 'template-mystery-005',
    userInput: '',
    title: '第五声铃',
    episodes: [
      {
        episodeNumber: 1,
        title: '第一集：午夜来电',
        scenes: [
          {
            id: 'm05-s01',
            description: '警察局会议室，深夜，四位警探聚集在一起，讨论一起连环杀人案',
            location: '市公安局会议室',
            time: '凌晨1:00',
            atmosphere: '紧张、压抑'
          }
        ],
        characters: [
          { id: 'char-m05-01', name: '李队', description: '45岁，经验丰富的刑警队长，负责连环杀人案', dialogueStyle: '严肃、果断' },
          { id: 'char-m05-02', name: '王勇', description: '32岁，年轻警探，冲动但直觉敏锐', dialogueStyle: '直接、急躁' },
          { id: 'char-m05-03', name: '张静', description: '28岁，心理侧写师，冷静理性', dialogueStyle: '冷静、分析' },
          { id: 'char-m05-04', name: '老陈', description: '50岁，老刑警，即将退休', dialogueStyle: '沉稳、老练' }
        ],
        dialogues: [
          { characterId: 'char-m05-01', characterName: '李队', content: '第四起了。同样的手法，同样的时间——午夜十二点。同样的...电话铃响五声后，受害者死亡。', emotion: '沉重' },
          { characterId: 'char-m05-02', characterName: '王勇', content: '电话？什么电话？', emotion: '困惑' },
          { characterId: 'char-m05-03', characterName: '张静', content: '每个受害者死前，都接到了一个神秘电话。根据通话记录，电话只响了五声，然后挂断。挂断的瞬间，就是受害者的死亡时间。', emotion: '冷静' },
          { characterId: 'char-m05-04', characterName: '老陈', content: '而且...每个受害者的电话清单上，都查不到那个来电号码。就像...电话从不存在。', emotion: '诡异' }
        ],
        summary: '四位警探聚集在深夜的会议室，讨论一起诡异的连环杀人案。四起案件，手法相同：午夜十二点，受害者接到一个只响五声的神秘电话，挂断瞬间死亡。电话清单上查不到来电号码，就像电话从未存在过。警探们必须在凶手再次作案前找到线索。'
      },
      {
        episodeNumber: 2,
        title: '第二集：线索',
        scenes: [
          {
            id: 'm05-s02',
            description: '警探们发现四位受害者之间的关联，他们都与十年前的一起旧案有关',
            location: '市公安局',
            time: '三天后',
            atmosphere: '紧张、发现'
          }
        ],
        characters: [
          { id: 'char-m05-01', name: '李队', description: '刑警队长', dialogueStyle: '严肃' },
          { id: 'char-m05-02', name: '王勇', description: '年轻警探', dialogueStyle: '急躁' },
          { id: 'char-m05-03', name: '张静', description: '心理侧写师', dialogueStyle: '冷静' },
          { id: 'char-m05-04', name: '老陈', description: '老刑警', dialogueStyle: '沉稳' }
        ],
        dialogues: [
          { characterId: 'char-m05-03', characterName: '张静', content: '我发现了一个共同点。四位受害者...十年前，他们都在同一家公司工作。', emotion: '发现' },
          { characterId: 'char-m05-02', characterName: '王勇', content: '什么公司？', emotion: '急切' },
          { characterId: 'char-m05-03', characterName: '张静', content: '红星药业。十年前，这家公司生产的一款药物导致了严重的医疗事故，造成数百人伤亡。但因为证据不足，公司负责人没有被起诉。', emotion: '冷静' },
          { characterId: 'char-m05-01', characterName: '李队', content: '你的意思是...复仇？', emotion: '严肃' },
          { characterId: 'char-m05-04', characterName: '老陈', content: '等等...十年前那个案子...我记得。当时负责调查的...是李队你吧？', emotion: '犹豫' },
          { characterId: 'char-m05-01', characterName: '李队', content: '...是。当时...证据不足，无法起诉。我一直...对此耿耿于怀。', emotion: '沉重' },
          { characterId: 'char-m05-02', characterName: '王勇', content: '等等！那下一个目标...不会是...', emotion: '惊恐' },
          { characterId: 'char-m05-03', characterName: '张静', content: '四位受害者，都与红星药业有关。而李队...是当年调查那个案子的负责人。如果凶手是在复仇...', emotion: '担忧' },
          { characterId: 'char-m05-01', characterName: '李队', content: '我明白了。下一个目标...是我。', emotion: '冷静' }
        ],
        summary: '警探们发现四位受害者的关联：十年前，他们都在同一家公司"红星药业"工作。这家公司十年前生产的药物导致了严重的医疗事故，但因证据不足，负责人未被起诉。李队承认自己是当年调查那个案子的负责人。大家意识到，如果凶手是在复仇，那么下一个目标...可能就是李队。'
      },
      {
        episodeNumber: 3,
        title: '第三集：午夜',
        scenes: [
          {
            id: 'm05-s03',
            description: '午夜十二点临近，李队独自等待那个电话。所有真相在铃声响起时揭晓。',
            location: '李队的办公室',
            time: '晚上11:59',
            atmosphere: '紧张、即将揭晓'
          }
        ],
        characters: [
          { id: 'char-m05-01', name: '李队', description: '刑警队长，等待着那个电话', dialogueStyle: '冷静、决绝' },
          { id: 'char-m05-02', name: '王勇', description: '年轻警探', dialogueStyle: '焦急' },
          { id: 'char-m05-03', name: '张静', description: '心理侧写师', dialogueStyle: '冷静' },
          { id: 'char-m05-04', name: '老陈', description: '老刑警', dialogueStyle: '沉重' }
        ],
        dialogues: [
          { characterId: 'char-m05-02', characterName: '王勇', content: '李队，让我留下来陪你！', emotion: '焦急' },
          { characterId: 'char-m05-01', characterName: '李队', content: '不。如果凶手真的要找我，我必须一个人面对。你们...在外面待命。', emotion: '决绝' },
          { characterId: 'char-m05-03', characterName: '张静', content: '李队...小心。', emotion: '担忧' },
          { characterId: 'char-m05-04', characterName: '老陈', content: '（低声对张静和王勇说）你们...有没有觉得奇怪？', emotion: '神秘' },
          { characterId: 'char-m05-02', characterName: '王勇', content: '什么奇怪？', emotion: '困惑' },
          { characterId: 'char-m05-04', characterName: '老陈', content: '四起案件，我们只知道受害者死前接到了五声铃响的电话。但...是谁接的电话？', emotion: '诡异' },
          { characterId: 'char-m05-03', characterName: '张静', content: '...受害者自己啊。不然呢？', emotion: '困惑' },
          { characterId: 'char-m05-04', characterName: '老陈', content: '但如果...受害者不是在接电话，而是在打电话呢？如果...那个五声铃响...是他们拨出去的电话？', emotion: '意味深长' }
        ],
        summary: '午夜十二点临近，李队让其他人离开，独自等待那个电话。办公室外，老陈提出了一个诡异的问题：四起案件中，受害者接到了五声铃响的电话。但...真的是"接到"吗？如果那个五声铃响...是受害者拨出去的电话呢？'
      },
      {
        episodeNumber: 4,
        title: '第四集：真相',
        scenes: [
          {
            id: 'm05-s04',
            description: '电话铃响起，五声。所有真相在这一刻揭晓。',
            location: '李队的办公室',
            time: '午夜12:00',
            atmosphere: '震撼'
          }
        ],
        characters: [
          { id: 'char-m05-01', name: '李队', description: '刑警队长', dialogueStyle: '平静' },
          { id: 'char-m05-02', name: '王勇', description: '年轻警探', dialogueStyle: '震惊' },
          { id: 'char-m05-03', name: '张静', description: '心理侧写师', dialogueStyle: '不敢相信' },
          { id: 'char-m05-04', name: '老陈', description: '老刑警', dialogueStyle: '沉重' }
        ],
        dialogues: [
          { characterId: 'char-m05-01', characterName: '李队', content: '（电话铃响）一声...两声...三声...四声...五声...（挂断）', emotion: '平静' },
          { characterId: 'char-m05-02', characterName: '王勇', content: '（冲入办公室）李队！你还好吗？！', emotion: '惊恐' },
          { characterId: 'char-m05-01', characterName: '李队', content: '我没事。那个电话...是我拨出去的。', emotion: '平静' },
          { characterId: 'char-m05-03', characterName: '张静', content: '什么意思？', emotion: '困惑' },
          { characterId: 'char-m05-01', characterName: '李队', content: '老陈说得对。那个五声铃响...不是来电，是去电。四位受害者...都是自杀。他们在生命的最后一刻，拨通了一个特定的号码。那个号码...是警局的内部报警电话。五声铃响...是他们在用生命发出的信号。', emotion: '沉重' },
          { characterId: 'char-m05-04', characterName: '老陈', content: '而那个信号...指向的是一个他们无法直接指控的人。李队...你还记得十年前红星药业那个案子，为什么证据不足吗？', emotion: '意味深长' },
          { characterId: 'char-m05-01', characterName: '李队', content: '因为...关键证据被人销毁了。', emotion: '痛苦' },
          { characterId: 'char-m05-04', characterName: '老陈', content: '销毁证据的人...就是你，李队。', emotion: '揭露真相' },
          { characterId: 'char-m05-01', characterName: '李队', content: '...是。当年...红星药业的负责人...是我的亲弟弟。我...我做了错误的选择。我销毁了证据，让他逃脱了法律的制裁。但我没有想到...那些受害者...会用这样的方式来复仇。', emotion: '崩溃' },
          { characterId: 'char-m05-02', characterName: '王勇', content: '所以...这四起"凶杀案"...其实是自杀？受害者用死亡来发出信号，指向那个他们无法指控的人？而李队...就是那个被指控的人？', emotion: '震惊' },
          { characterId: 'char-m05-03', characterName: '张静', content: '那个五声铃响...不是死亡预告，而是死亡宣言。受害者在告诉我们："我在用我的死，指控一个罪人。"而那个罪人...就是负责调查这个案子的人。', emotion: '不敢相信' },
          { characterId: 'char-m05-01', characterName: '李队', content: '（拿出手铐）我知道这一天会来的。十年了...我终于可以...赎罪了。', emotion: '释然' }
        ],
        summary: '最震撼的感知反转揭晓：所有人都以为受害者是"接到"了一个只响五声的神秘电话后死亡。但实际上，那个五声铃响是受害者"拨出"的电话。四起"凶杀案"其实都是自杀。受害者在生命的最后一刻，用拨通警局内部报警电话、让它响五声后挂断的方式，发出了一个无声的指控。他们无法直接指控的人...就是负责调查这个案子的李队。十年前，李队销毁了红星药业医疗事故案的关键证据，让自己的亲弟弟逃脱了法律制裁。四位受害者用自己的死亡，发出了一个沉默的信号——五声铃响，代表"我控诉"。李队以为自己在调查一宗连环杀人案，实际上，他一直在调查一宗由受害者策划的、针对他自己的"自杀复仇案"。这个故事探讨了正义的复杂性，以及当法律无法制裁罪人时，人们会用多么极端的方式来寻求公正。',
        isTwist: true,
        twistHint: '伏笔：老陈对"五声铃响"的方向表示怀疑、李队对红星药业旧案的异常反应、受害者没有反抗痕迹（因为是自杀）、"找不到来电号码"实际上是因为那是去电记录'
      }
    ],
    genre: '悬疑',
    createdAt: '',
    totalEpisodes: 4,
    twistType: '感知反转'
  },

  {
    id: 'template-romance-003',
    userInput: '',
    title: '替身恋人',
    episodes: [
      {
        episodeNumber: 1,
        title: '第一集：相遇',
        scenes: [
          {
            id: 'r03-s01',
            description: '一家高端酒吧，女主角林薇第一次见到和她死去的未婚夫长得一模一样的男人',
            location: '夜色酒吧',
            time: '晚上9:00',
            atmosphere: '浪漫、困惑'
          }
        ],
        characters: [
          { id: 'char-r03-01', name: '林薇', description: '26岁，设计师，未婚夫三年前因车祸去世，一直无法释怀', dialogueStyle: '敏感、深情' },
          { id: 'char-r03-02', name: '沈明远', description: '28岁，神秘的投资人，长得和林薇的未婚夫一模一样', dialogueStyle: '冷峻、神秘' },
          { id: 'char-r03-03', name: '晓晓', description: '林薇的闺蜜，活泼开朗', dialogueStyle: '直接、热情' }
        ],
        dialogues: [
          { characterId: 'char-r03-03', characterName: '晓晓', content: '薇薇，看那边！那个男人...长得和子轩一模一样！', emotion: '震惊' },
          { characterId: 'char-r03-01', characterName: '林薇', content: '别胡说...子轩已经...已经...', emotion: '悲伤' },
          { characterId: 'char-r03-03', characterName: '晓晓', content: '我知道！但你自己看！真的一模一样！', emotion: '坚持' },
          { characterId: 'char-r03-02', characterName: '沈明远', content: '（注意到她们的注视，走过来）两位小姐，我脸上有什么东西吗？', emotion: '冷峻' },
          { characterId: 'char-r03-01', characterName: '林薇', content: '（盯着他看，眼泪不自觉地流下）子轩...是你吗？', emotion: '激动' },
          { characterId: 'char-r03-02', characterName: '沈明远', content: '小姐，你认错人了。我叫沈明远，不是什么子轩。', emotion: '困惑' }
        ],
        summary: '林薇在酒吧遇到了一个和她死去三年的未婚夫陈子轩长得一模一样的男人——沈明远。林薇激动地以为未婚夫死而复生，但沈明远却表示根本不认识她，也从未听说过"陈子轩"这个名字。晓晓觉得这只是一个巧合，但林薇却坚信这其中一定有什么联系。'
      },
      {
        episodeNumber: 2,
        title: '第二集：追求',
        scenes: [
          {
            id: 'r03-s02',
            description: '沈明远开始主动接近林薇，两人之间产生了复杂的感情',
            location: '林薇的工作室、餐厅',
            time: '一个月后',
            atmosphere: '浪漫、困惑'
          }
        ],
        characters: [
          { id: 'char-r03-01', name: '林薇', description: '设计师', dialogueStyle: '矛盾、深情' },
          { id: 'char-r03-02', name: '沈明远', description: '神秘投资人', dialogueStyle: '从冷峻到温柔' },
          { id: 'char-r03-03', name: '晓晓', description: '林薇的闺蜜', dialogueStyle: '担忧' }
        ],
        dialogues: [
          { characterId: 'char-r03-02', characterName: '沈明远', content: '林小姐，这是我为你准备的花。希望你喜欢。', emotion: '温柔' },
          { characterId: 'char-r03-01', characterName: '林薇', content: '沈先生...你为什么要这么做？', emotion: '困惑' },
          { characterId: 'char-r03-02', characterName: '沈明远', content: '因为...自从第一次见到你，我就无法忘记你。我知道我长得像那个子轩，这让你很痛苦。但我希望...你能看到真实的我。', emotion: '真诚' },
          { characterId: 'char-r03-01', characterName: '林薇', content: '真实的你...是什么样的？', emotion: '动摇' },
          { characterId: 'char-r03-02', characterName: '沈明远', content: '给我一个机会，让我证明给你看。', emotion: '温柔' },
          { characterId: 'char-r03-03', characterName: '晓晓', content: '薇薇，你真的要和他在一起？他长得和子轩一模一样，这太奇怪了。你真的分得清你爱的是谁吗？', emotion: '担忧' },
          { characterId: 'char-r03-01', characterName: '林薇', content: '我不知道...但和他在一起的时候...我真的很快乐。就像...子轩又回到了我身边。', emotion: '矛盾' }
        ],
        summary: '沈明远开始主动追求林薇。他温柔、体贴，和记忆中的子轩越来越像。林薇陷入了矛盾：她知道沈明远不是子轩，但和他在一起时，她感受到了久违的快乐。晓晓警告林薇，这样下去她会分不清自己爱的到底是谁，但林薇已经无法自拔。两人开始了一段复杂的关系。'
      },
      {
        episodeNumber: 3,
        title: '第三集：秘密',
        scenes: [
          {
            id: 'r03-s03',
            description: '林薇发现沈明远的秘密，真相开始浮出水面',
            location: '沈明远的公寓',
            time: '晚上',
            atmosphere: '紧张、发现'
          }
        ],
        characters: [
          { id: 'char-r03-01', name: '林薇', description: '设计师', dialogueStyle: '从幸福到震惊' },
          { id: 'char-r03-02', name: '沈明远', description: '神秘投资人', dialogueStyle: '从温柔到痛苦' },
          { id: 'char-r03-04', name: '陈子轩', description: '林薇的未婚夫，只在记忆和照片中出现', dialogueStyle: '温柔、深情' }
        ],
        dialogues: [
          { characterId: 'char-r03-01', characterName: '林薇', content: '（发现一个上锁的抽屉）明远，这个抽屉里是什么？', emotion: '好奇' },
          { characterId: 'char-r03-02', characterName: '沈明远', content: '没什么...一些旧文件。', emotion: '紧张' },
          { characterId: 'char-r03-01', characterName: '林薇', content: '（趁他不注意找到了钥匙，打开抽屉，看到了一叠照片）这是...我和子轩的照片？这些照片...我从来没有给过你。你怎么会有这些？', emotion: '震惊' },
          { characterId: 'char-r03-02', characterName: '沈明远', content: '薇薇...我可以解释。', emotion: '痛苦' },
          { characterId: 'char-r03-01', characterName: '林薇', content: '解释？还有什么好解释的？你不是沈明远，对不对？你是...你是子轩？！你没有死！', emotion: '激动' },
          { characterId: 'char-r03-02', characterName: '沈明远', content: '不，薇薇。我不是子轩。我是...我是他的孪生弟弟。', emotion: '揭露真相' },
          { characterId: 'char-r03-01', characterName: '林薇', content: '孪生...弟弟？', emotion: '困惑' },
          { characterId: 'char-r03-02', characterName: '沈明远', content: '准确地说，是孪生弟弟。我和子轩...一出生就被分开了。他被陈家收养，我被沈家收养。我们直到三年前才知道彼此的存在。那场车祸...子轩确实死了。但在他死前，他告诉我很多关于你的事。他给了我这些照片，让我...让我照顾你。', emotion: '痛苦' },
          { characterId: 'char-r03-01', characterName: '林薇', content: '所以...你接近我...是因为子轩的遗愿？你对我的好...都是为了完成他的心愿？', emotion: '心碎' },
          { characterId: 'char-r03-02', characterName: '沈明远', content: '一开始...是。我只是想完成哥哥的遗愿。但薇薇...和你相处的这几个月...我...我爱上了你。不是作为子轩的替身，而是作为我自己——沈明远——爱上了你。', emotion: '真诚' },
          { characterId: 'char-r03-01', characterName: '林薇', content: '那你告诉我...在你心里...我是林薇...还是子轩的未婚妻？', emotion: '泪水' },
          { characterId: 'char-r03-02', characterName: '沈明远', content: '我...我不知道。我只知道...我不能失去你。', emotion: '痛苦' }
        ],
        summary: '林薇发现了沈明远的秘密抽屉，里面全是她和子轩的照片。她震惊地以为子轩没有死。但沈明远揭示了一个更复杂的真相：他是子轩的孪生弟弟，一出生就被分开抚养。三年前那场车祸后，子轩在临终前告诉了他关于林薇的一切，并请求他照顾她。接近林薇，一开始只是为了完成哥哥的遗愿。但在相处中，沈明远真的爱上了她。问题是：他爱的是真实的林薇，还是哥哥描述中的那个"完美未婚妻"？而林薇，她爱的到底是谁？是记忆中的子轩，还是眼前这个作为"替身"出现的沈明远？'
      },
      {
        episodeNumber: 4,
        title: '第四集：选择',
        scenes: [
          {
            id: 'r04-s04',
            description: '林薇必须做出选择，最终的身份反转揭晓',
            location: '当初相遇的酒吧',
            time: '晚上9:00',
            atmosphere: '浪漫、抉择'
          }
        ],
        characters: [
          { id: 'char-r03-01', name: '林薇', description: '设计师', dialogueStyle: '从迷茫到清明' },
          { id: 'char-r03-02', name: '沈明远', description: '神秘投资人', dialogueStyle: '从痛苦到释然' },
          { id: 'char-r03-03', name: '晓晓', description: '林薇的闺蜜', dialogueStyle: '支持' }
        ],
        dialogues: [
          { characterId: 'char-r03-03', characterName: '晓晓', content: '薇薇，你想好了吗？', emotion: '担忧' },
          { characterId: 'char-r03-01', characterName: '林薇', content: '我一直在想一个问题：明远说他爱上了我。但他爱的...是真实的我，还是他哥哥描述中的那个我？而我...我爱的是子轩，还是因为明远长得像子轩，所以我把对他的感情投射到了明远身上？', emotion: '困惑' },
          { characterId: 'char-r03-03', characterName: '晓晓', content: '这重要吗？重要的是你们在一起快不快乐。', emotion: '直接' },
          { characterId: 'char-r03-01', characterName: '林薇', content: '重要。因为...我发现了一个秘密。', emotion: '平静' },
          { characterId: 'char-r03-02', characterName: '沈明远', content: '（出现）薇薇，我想和你谈谈。', emotion: '真诚' },
          { characterId: 'char-r03-01', characterName: '林薇', content: '我知道你要说什么。让我先说。明远...不，我应该叫你什么？子轩？还是...我应该叫你...我自己？', emotion: '神秘' },
          { characterId: 'char-r03-02', characterName: '沈明远', content: '...你发现了。', emotion: '释然' },
          { characterId: 'char-r03-01', characterName: '林薇', content: '那场车祸...子轩死了。但接受不了这个事实的人...不是我。是你。你创造了"沈明远"这个人格，让自己相信子轩的孪生弟弟还活着。然后...你以沈明远的身份，重新追求我。因为...你无法面对"陈子轩"这个人已经死去的事实。你不是子轩的弟弟...你就是子轩...是子轩创造的一个幻觉。', emotion: '揭露真相' },
          { characterId: 'char-r03-02', characterName: '沈明远', content: '你说得对。那场车祸后，我陷入了昏迷。醒来后，我无法接受自己即将死去的事实。我的大脑...创造了"沈明远"这个人格。我以为我是子轩的弟弟，我以为我可以替他活下去，替他爱你。但实际上...我的身体越来越差，我知道...时间不多了。', emotion: '悲伤' },
          { characterId: 'char-r03-01', characterName: '林薇', content: '所以...这段时间和我在一起的...是一个将死之人创造的幻觉？我不是在和沈明远恋爱，也不是在和子轩的弟弟恋爱...我是在和你的...想象恋爱？', emotion: '复杂' },
          { characterId: 'char-r03-02', characterName: '沈明远', content: '但那份感情...是真的，对不对？', emotion: '温柔' },
          { characterId: 'char-r03-01', characterName: '林薇', content: '（流泪点头）是真的。子轩...不管你是谁...不管你是子轩，还是沈明远...还是你创造的任何身份...我爱过的...一直都是你。', emotion: '深情' },
          { characterId: 'char-r03-02', characterName: '沈明远', content: '（微笑消散）谢谢你...薇薇...让我...最后一次...感受到爱...', emotion: '幸福' }
        ],
        summary: '最震撼的身份反转揭晓：沈明远不是子轩的孪生弟弟。他也不是"沈明远"。那场车祸中，子轩确实受到了致命伤害。在昏迷中，他的大脑无法接受自己即将死亡的事实，于是创造了"沈明远"这个人格——一个"孪生弟弟"，可以替他活下去，替他爱林薇。整个故事中，和林薇恋爱的不是沈明远，而是子轩弥留之际创造的一个美好的幻觉。林薇以为自己在和"替身"恋爱，而实际上，她是在陪着她的爱人走过生命的最后一程。沈明远这个身份，是子轩送给林薇的最后一份礼物——让她以为自己在开始一段新的感情，而不是在陪爱人走向死亡。这个故事探讨了爱的本质：重要的不是你爱的是谁，而是那份感情本身是否真实。即使沈明远只是一个幻觉，但那份爱...是真的。',
        isTwist: true,
        twistHint: '伏笔：沈明远对"子轩"的了解过于详细、沈明远没有过去的朋友或家人、沈明远的"工作"总是很神秘、林薇发现沈明远偶尔会"忘记"自己是谁'
      }
    ],
    genre: '爱情',
    createdAt: '',
    totalEpisodes: 4,
    twistType: '身份反转'
  },

  {
    id: 'template-romance-004',
    userInput: '',
    title: '合约夫妻',
    episodes: [
      {
        episodeNumber: 1,
        title: '第一集：交易',
        scenes: [
          {
            id: 'r04-s01',
            description: '一家高级餐厅，两个陌生人坐在一起，面前放着一份合同',
            location: '米其林三星餐厅',
            time: '晚上7:00',
            atmosphere: '紧张、商务'
          }
        ],
        characters: [
          { id: 'char-r04-01', name: '苏雨', description: '26岁，设计师，母亲重病需要巨额手术费', dialogueStyle: '倔强、独立' },
          { id: 'char-r04-02', name: '顾夜寒', description: '30岁，顾氏集团总裁，需要一个名义上的妻子来继承遗产', dialogueStyle: '冷漠、霸道' }
        ],
        dialogues: [
          { characterId: 'char-r04-02', characterName: '顾夜寒', content: '合同你看过了。结婚两年，两年后离婚。这期间，你扮演我的完美妻子。作为回报，你母亲的所有医疗费用由我承担。', emotion: '冷漠' },
          { characterId: 'char-r04-01', characterName: '苏雨', content: '只是...名义上的夫妻？', emotion: '不安' },
          { characterId: 'char-r04-02', characterName: '顾夜寒', content: '合同第7条：婚姻期间，双方不得干涉对方的私生活。你是自由的。当然，如果你需要...我也可以配合。', emotion: '意味深长' },
          { characterId: 'char-r04-01', characterName: '苏雨', content: '我不需要。两年后，我们各走各的路。', emotion: '倔强' },
          { characterId: 'char-r04-02', characterName: '顾夜寒', content: '很好。还有最后一条：在任何情况下，都不能爱上对方。', emotion: '警告' },
          { characterId: 'char-r04-01', characterName: '苏雨', content: '放心，顾总裁。我对交易之外的事情，没有兴趣。', emotion: '坚定' }
        ],
        summary: '苏雨为了给母亲筹集巨额手术费，与顾氏集团总裁顾夜寒签订了一份婚姻合约。他们将成为名义上的夫妻，为期两年。合约中有一条明确规定：在任何情况下，都不能爱上对方。苏雨以为这只是一场简单的交易，但她不知道，这场交易背后隐藏着更深的秘密。'
      },
      {
        episodeNumber: 2,
        title: '第二集：同居',
        scenes: [
          {
            id: 'r04-s02',
            description: '顾夜寒的豪宅，苏雨搬进来开始了契约婚姻生活',
            location: '顾宅',
            time: '一个月后',
            atmosphere: '尴尬、疏离'
          }
        ],
        characters: [
          { id: 'char-r04-01', name: '苏雨', description: '契约妻子', dialogueStyle: '从倔强到动摇' },
          { id: 'char-r04-02', name: '顾夜寒', description: '契约丈夫', dialogueStyle: '从冷漠到温柔' },
          { id: 'char-r04-03', name: '张妈', description: '顾家的老佣人，看着顾夜寒长大', dialogueStyle: '慈祥、看透一切' }
        ],
        dialogues: [
          { characterId: 'char-r04-03', characterName: '张妈', content: '苏小姐，少爷他...其实不像表面看起来那么冷漠。', emotion: '神秘' },
          { characterId: 'char-r04-01', characterName: '苏雨', content: '张妈，我和他只是交易关系。', emotion: '坚定' },
          { characterId: 'char-r04-03', characterName: '张妈', content: '交易...也可以变成别的。你看这个房间，这是少爷让我亲自布置的。他说...这是他母亲以前喜欢的风格。', emotion: '意味深长' },
          { characterId: 'char-r04-01', characterName: '苏雨', content: '他母亲...？', emotion: '困惑' },
          { characterId: 'char-r04-02', characterName: '顾夜寒', content: '（出现）张妈，够了。苏雨，跟我来。', emotion: '严肃' },
          { characterId: 'char-r04-01', characterName: '苏雨', content: '什么事？', emotion: '不安' },
          { characterId: 'char-r04-02', characterName: '顾夜寒', content: '我爷爷下周要来看我们。你...需要做一些准备。', emotion: '犹豫' },
          { characterId: 'char-r04-01', characterName: '苏雨', content: '准备什么？', emotion: '困惑' },
          { characterId: 'char-r04-02', characterName: '顾夜寒', content: '我们...需要表现得更像真正的夫妻。比如...住在同一个房间。', emotion: '尴尬' }
        ],
        summary: '苏雨搬进了顾夜寒的豪宅，开始了契约婚姻生活。顾宅的老佣人张妈对苏雨特别好，似乎看透了什么。顾夜寒的爷爷即将来访，他们必须表现得更像真正的夫妻——包括住在同一个房间。苏雨开始发现，顾夜寒的冷漠外表下，似乎隐藏着什么秘密。她注意到，顾夜寒看着她的眼神，有时会变得异常温柔，仿佛在看另一个人。'
      },
      {
        episodeNumber: 3,
        title: '第三集：旧照片',
        scenes: [
          {
            id: 'r04-s03',
            description: '苏雨在顾夜寒的书房发现了一张旧照片，真相开始浮出水面',
            location: '顾夜寒的书房',
            time: '晚上',
            atmosphere: '神秘、发现'
          }
        ],
        characters: [
          { id: 'char-r04-01', name: '苏雨', description: '契约妻子', dialogueStyle: '从困惑到震惊' },
          { id: 'char-r04-02', name: '顾夜寒', description: '契约丈夫', dialogueStyle: '从逃避到坦白' },
          { id: 'char-r04-04', name: '林婉', description: '顾夜寒的初恋女友，只在照片和记忆中出现', dialogueStyle: '温柔、美丽' }
        ],
        dialogues: [
          { characterId: 'char-r04-01', characterName: '苏雨', content: '（发现一张旧照片）这是...我？不对...这张照片至少有十年了。这个女人...是谁？', emotion: '震惊' },
          { characterId: 'char-r04-02', characterName: '顾夜寒', content: '（冲入书房）谁让你进来的？把照片放下！', emotion: '愤怒' },
          { characterId: 'char-r04-01', characterName: '苏雨', content: '她是谁？为什么...她和我长得一模一样？', emotion: '颤抖' },
          { characterId: 'char-r04-02', characterName: '顾夜寒', content: '...她是林婉。我的...初恋女友。十年前，她死于一场车祸。', emotion: '痛苦' },
          { characterId: 'char-r04-01', characterName: '苏雨', content: '所以...你找我结婚...是因为我长得像她？这两年的契约婚姻...我只是她的替身？', emotion: '心碎' },
          { characterId: 'char-r04-02', characterName: '顾夜寒', content: '一开始...是。我在医院看到你，你和她长得几乎一模一样。我...我想找到一个可以替代她的人。但是苏雨...', emotion: '复杂' },
          { characterId: 'char-r04-01', characterName: '苏雨', content: '但是什么？', emotion: '泪水' },
          { characterId: 'char-r04-02', characterName: '顾夜寒', content: '但是...和你相处的这几个月...我发现...你不是她。你是苏雨。倔强、独立、有自己的梦想...而这些...都是林婉没有的。我...我爱上了你。不是因为你像她，而是因为你是你。', emotion: '真诚' },
          { characterId: 'char-r04-01', characterName: '苏雨', content: '爱我？顾夜寒，别忘了我们的合约第7条：不能爱上对方。而且...你真的分得清吗？你爱的是苏雨，还是那个长得像林婉的苏雨？', emotion: '矛盾' }
        ],
        summary: '苏雨在顾夜寒的书房发现了一张十年前的旧照片，照片上的女人和她长得一模一样。顾夜寒坦白：这个女人是他的初恋女友林婉，十年前死于车祸。他接近苏雨，和她签订契约婚姻，一开始只是因为她长得像林婉。但在相处中，他真的爱上了苏雨。问题是：他爱的是真实的苏雨，还是那个"长得像林婉"的苏雨？而苏雨，她能接受自己只是一个"替身"吗？'
      },
      {
        episodeNumber: 4,
        title: '第四集：真相',
        scenes: [
          {
            id: 'r04-s04',
            description: '最终的动机反转揭晓，所有真相在这一刻浮出水面',
            location: '顾宅客厅',
            time: '两年期限到期前一周',
            atmosphere: '震撼、感动'
          }
        ],
        characters: [
          { id: 'char-r04-01', name: '苏雨', description: '契约妻子', dialogueStyle: '从矛盾到释然' },
          { id: 'char-r04-02', name: '顾夜寒', description: '契约丈夫', dialogueStyle: '从痛苦到释然' },
          { id: 'char-r04-04', name: '林婉', description: '顾夜寒的初恋女友，只在记忆中出现', dialogueStyle: '温柔、美丽' }
        ],
        dialogues: [
          { characterId: 'char-r04-01', characterName: '苏雨', content: '我想了很久。顾夜寒，我们...解除合约吧。', emotion: '平静' },
          { characterId: 'char-r04-02', characterName: '顾夜寒', content: '什么？你...你要走？', emotion: '震惊' },
          { characterId: 'char-r04-01', characterName: '苏雨', content: '是的。因为我发现了一个秘密。顾夜寒，你...从来没有忘记过林婉，对不对？', emotion: '平静' },
          { characterId: 'char-r04-02', characterName: '顾夜寒', content: '我...', emotion: '痛苦' },
          { characterId: 'char-r04-01', characterName: '苏雨', content: '让我猜猜。林婉...她不是死于车祸。对不对？她是死于疾病，而且...是需要巨额医疗费用的那种疾病。你...当时没有足够的钱，只能眼睁睁看着她死去。', emotion: '揭露真相' },
          { characterId: 'char-r04-02', characterName: '顾夜寒', content: '你...你怎么知道？', emotion: '震惊' },
          { characterId: 'char-r04-01', characterName: '苏雨', content: '你的书房里，除了那张照片，还有一本旧病历。林婉...和我妈妈得了同一种病。十年前，这种病还没有有效的治疗方法。你...当时还没有今天的财富和地位。你无能为力。', emotion: '悲伤' },
          { characterId: 'char-r04-02', characterName: '顾夜寒', content: '是的。我眼睁睁看着她...死去。我发誓...我再也不会让这种事发生。当我在医院看到你，当我得知你母亲得了同样的病...我...我无法袖手旁观。', emotion: '痛苦' },
          { characterId: 'char-r04-01', characterName: '苏雨', content: '所以...接近我，和我结婚...不是因为我长得像林婉。而是因为...你想弥补十年前的遗憾。你想通过救我妈妈，来弥补你十年前救不了林婉的愧疚。', emotion: '感动' },
          { characterId: 'char-r04-02', characterName: '顾夜寒', content: '一开始...是。我以为我只是在补偿。但苏雨...和你相处的这两年...我发现...我不只是在补偿。我...我真的爱上了你。', emotion: '真诚' },
          { characterId: 'char-r04-01', characterName: '苏雨', content: '顾夜寒，你知道我为什么要解除合约吗？', emotion: '微笑' },
          { characterId: 'char-r04-02', characterName: '顾夜寒', content: '为什么？', emotion: '困惑' },
          { characterId: 'char-r04-01', characterName: '苏雨', content: '因为合约已经到期了。而且...我不想再做你的契约妻子了。我想...做你的真正的妻子。', emotion: '深情' },
          { characterId: 'char-r04-02', characterName: '顾夜寒', content: '苏雨...你...', emotion: '激动' },
          { characterId: 'char-r04-01', characterName: '苏雨', content: '顾夜寒，有一件事我必须告诉你。其实...我早就知道林婉的事了。我...我并不介意做她的"替身"。因为我知道...你救我妈妈，不是因为我像她。而是因为...你是一个好人。一个...让我忍不住爱上的好人。', emotion: '幸福' }
        ],
        summary: '最震撼的动机反转揭晓：顾夜寒接近苏雨，不是因为她长得像林婉，而是因为另一个更深层的动机。十年前，他的初恋女友林婉死于一种需要巨额医疗费用的疾病。当时他还没有今天的财富和地位，只能眼睁睁看着爱人死去。十年后，当他在医院遇到苏雨，得知她母亲得了同样的病时，他无法袖手旁观。这份契约婚姻，一开始只是他弥补十年前遗憾的方式——通过救苏雨的妈妈，来弥补救不了林婉的愧疚。但在相处中，他真的爱上了苏雨。而苏雨，也早就知道了林婉的事。但她并不介意做"替身"，因为她知道顾夜寒是一个好人，一个让她忍不住爱上的好人。合约到期后，他们解除了契约——不是为了分开，而是为了以真正恋人的身份重新开始。这个故事告诉我们：有些动机，不是表面看起来那样；有些爱，始于愧疚，终于深情。',
        isTwist: true,
        twistHint: '伏笔：顾夜寒对苏雨母亲的病情异常了解、顾夜寒看着苏雨的眼神有时像在看另一个人、书房里除了照片还有旧病历、顾夜寒的"冷漠"中总是带着一丝不易察觉的温柔'
      }
    ],
    genre: '爱情',
    createdAt: '',
    totalEpisodes: 4,
    twistType: '动机反转'
  },

  {
    id: 'template-romance-005',
    userInput: '',
    title: '夏末的约定',
    episodes: [
      {
        episodeNumber: 1,
        title: '第一集：重逢',
        scenes: [
          {
            id: 'r05-s01',
            description: '一场高中同学聚会，女主角夏沫再次遇到了她的青梅竹马陆辰',
            location: '老同学聚会餐厅',
            time: '晚上8:00',
            atmosphere: '怀旧、尴尬'
          }
        ],
        characters: [
          { id: 'char-r05-01', name: '夏沫', description: '28岁，出版社编辑，性格内敛，对过去耿耿于怀', dialogueStyle: '温柔、犹豫' },
          { id: 'char-r05-02', name: '陆辰', description: '28岁，知名建筑师，成熟稳重，似乎忘记了过去', dialogueStyle: '阳光、真诚' },
          { id: 'char-r05-03', name: '林薇', description: '夏沫的闺蜜，八卦热心', dialogueStyle: '直接、热情' }
        ],
        dialogues: [
          { characterId: 'char-r05-03', characterName: '林薇', content: '夏沫！看那边！陆辰！他也来了！', emotion: '兴奋' },
          { characterId: 'char-r05-01', characterName: '夏沫', content: '陆辰...他...他出国这么多年，终于回来了？', emotion: '紧张' },
          { characterId: 'char-r05-02', characterName: '陆辰', content: '（走过来）夏沫？真的是你！好久不见。', emotion: '惊喜' },
          { characterId: 'char-r05-01', characterName: '夏沫', content: '陆...陆辰...你...你还记得我？', emotion: '惊讶' },
          { characterId: 'char-r05-02', characterName: '陆辰', content: '当然记得！我们小时候...不是天天一起玩吗？对了，我记得我们还有一个约定来着...不过我忘了具体是什么了。你还记得吗？', emotion: '阳光' },
          { characterId: 'char-r05-01', characterName: '夏沫', content: '（内心震动，表面平静）...不记得了。可能...是无关紧要的小事吧。', emotion: '强装镇定' }
        ],
        summary: '夏沫在高中同学聚会上重逢了她的青梅竹马陆辰。陆辰出国多年，如今已是知名建筑师。他热情地和夏沫打招呼，说记得他们小时候有一个约定，但具体是什么已经忘了。夏沫表面平静，但内心震动——那个约定，她从未忘记。那是一个关于等待、关于爱情、关于夏末的约定。但陆辰...他真的忘了吗？还是...他只是装作忘了？'
      },
      {
        episodeNumber: 2,
        title: '第二集：重聚',
        scenes: [
          {
            id: 'r05-s02',
            description: '陆辰开始频繁约夏沫见面，两人重温小时候的回忆',
            location: '他们小时候常去的公园、咖啡馆',
            time: '聚会后一个月',
            atmosphere: '温馨、暧昧'
          }
        ],
        characters: [
          { id: 'char-r05-01', name: '夏沫', description: '出版社编辑', dialogueStyle: '从犹豫到期待' },
          { id: 'char-r05-02', name: '陆辰', description: '建筑师', dialogueStyle: '阳光、真诚' },
          { id: 'char-r05-03', name: '林薇', description: '夏沫的闺蜜', dialogueStyle: '八卦' }
        ],
        dialogues: [
          { characterId: 'char-r05-02', characterName: '陆辰', content: '你还记得这里吗？我们小时候...常来这里。', emotion: '怀旧' },
          { characterId: 'char-r05-01', characterName: '夏沫', content: '记得。那棵老槐树...还在。', emotion: '温柔' },
          { characterId: 'char-r05-02', characterName: '陆辰', content: '我记得...我们还在树上刻了什么。让我看看...啊！找到了！"夏沫&陆辰，永不分开"。哈哈，小时候真是幼稚。', emotion: '大笑' },
          { characterId: 'char-r05-01', characterName: '夏沫', content: '（内心）那不是幼稚...那是我青春里最认真的一句话。', emotion: '复杂' },
          { characterId: 'char-r05-03', characterName: '林薇', content: '夏沫，陆辰这明显是在追你啊！你还等什么？', emotion: '兴奋' },
          { characterId: 'char-r05-01', characterName: '夏沫', content: '但是...他说他忘了那个约定。如果...如果他只是把我当朋友呢？', emotion: '不安' },
          { characterId: 'char-r05-03', characterName: '林薇', content: '约定？什么约定？你从来没告诉过我！', emotion: '好奇' },
          { characterId: 'char-r05-01', characterName: '夏沫', content: '那是...十八岁那年夏末的最后一天。他说...等他留学回来，如果我们都还没有结婚，就...就在一起。', emotion: '羞涩' }
        ],
        summary: '陆辰开始频繁约夏沫见面，带她去他们小时候常去的地方。他们重温了很多童年回忆，包括老槐树上刻的字。夏沫发现，陆辰似乎真的忘了那个十八岁夏末的约定——等他留学回来，如果都还单身，就在一起。林薇劝夏沫主动，但夏沫不敢。她害怕陆辰真的忘了，更害怕...他记得，但只是装作忘了。'
      },
      {
        episodeNumber: 3,
        title: '第三集：误会',
        scenes: [
          {
            id: 'r05-s03',
            description: '夏沫看到陆辰和一个漂亮女人在一起，误会他有了女朋友',
            location: '餐厅外',
            time: '晚上',
            atmosphere: '心碎、误会'
          }
        ],
        characters: [
          { id: 'char-r05-01', name: '夏沫', description: '出版社编辑', dialogueStyle: '从期待到心碎' },
          { id: 'char-r05-02', name: '陆辰', description: '建筑师', dialogueStyle: '从困惑到焦急' },
          { id: 'char-r05-04', name: '苏晴', description: '陆辰的客户，被夏沫误认为是女朋友', dialogueStyle: '优雅、职业' }
        ],
        dialogues: [
          { characterId: 'char-r05-01', characterName: '夏沫', content: '（看到陆辰和一个漂亮女人在餐厅里亲密交谈）那是...陆辰？那个女人...是谁？', emotion: '震惊' },
          { characterId: 'char-r05-02', characterName: '陆辰', content: '（注意到窗外的夏沫）夏沫！你怎么在这里？等一下！', emotion: '惊讶' },
          { characterId: 'char-r05-01', characterName: '夏沫', content: '（转身就跑）不用了！我还有事！', emotion: '泪水' },
          { characterId: 'char-r05-02', characterName: '陆辰', content: '（追出来）夏沫！等等！你误会了！她只是我的客户！', emotion: '焦急' },
          { characterId: 'char-r05-01', characterName: '夏沫', content: '客户？客户需要那么亲密吗？陆辰，你不用解释了。反正...我们也没有什么关系。', emotion: '心碎' },
          { characterId: 'char-r05-02', characterName: '陆辰', content: '夏沫...我...', emotion: '欲言又止' },
          { characterId: 'char-r05-01', characterName: '夏沫', content: '还有，陆辰。那个约定...你不用放在心上。我...我也早就忘了。', emotion: '强装坚强' },
          { characterId: 'char-r05-02', characterName: '陆辰', content: '（低声）夏沫...我从来没有忘记过。', emotion: '痛苦' },
          { characterId: 'char-r05-01', characterName: '夏沫', content: '（没有听见）再见，陆辰。祝你...幸福。', emotion: '泪水' }
        ],
        summary: '夏沫看到陆辰和一个漂亮女人在餐厅亲密交谈，误会他有了女朋友。她心碎地跑开，陆辰追出来解释，但夏沫不听。她告诉陆辰，那个夏末的约定，她也早就忘了。陆辰低声说："我从来没有忘记过。"但夏沫没有听见。两人之间的误会似乎越来越深。'
      },
      {
        episodeNumber: 4,
        title: '第四集：夏末',
        scenes: [
          {
            id: 'r05-s04',
            description: '夏末的最后一天，陆辰带夏沫回到老槐树下，所有真相揭晓',
            location: '老槐树下',
            time: '夏末最后一天的黄昏',
            atmosphere: '浪漫、感动'
          }
        ],
        characters: [
          { id: 'char-r05-01', name: '夏沫', description: '出版社编辑', dialogueStyle: '从心碎到幸福' },
          { id: 'char-r05-02', name: '陆辰', description: '建筑师', dialogueStyle: '从痛苦到幸福' },
          { id: 'char-r05-04', name: '苏晴', description: '陆辰的客户，也是他的心理医生', dialogueStyle: '优雅、职业' }
        ],
        dialogues: [
          { characterId: 'char-r05-02', characterName: '陆辰', content: '夏沫，我知道你不想见我。但...今天是夏末的最后一天。你...能给我十分钟吗？', emotion: '恳求' },
          { characterId: 'char-r05-01', characterName: '夏沫', content: '（犹豫）...好吧。十分钟。', emotion: '复杂' },
          { characterId: 'char-r05-02', characterName: '陆辰', content: '那个女人...苏晴。她确实是我的客户。但...她也是我的心理医生。', emotion: '坦白' },
          { characterId: 'char-r05-01', characterName: '夏沫', content: '心理医生？', emotion: '困惑' },
          { characterId: 'char-r05-02', characterName: '陆辰', content: '我在国外...出了一场意外。头部受伤，失去了部分记忆。我记得很多事情...但唯独...不记得那个约定。不...不对。不是不记得，是...不敢记得。', emotion: '痛苦' },
          { characterId: 'char-r05-01', characterName: '夏沫', content: '什么意思？', emotion: '惊讶' },
          { characterId: 'char-r05-02', characterName: '陆辰', content: '我回国后，第一件事就是找你。我想履行那个约定。但...我发现...你似乎...已经有了新的生活。林薇告诉我，你...你有一个交往多年的男朋友。', emotion: '悲伤' },
          { characterId: 'char-r05-01', characterName: '夏沫', content: '什么？林薇她...不，我没有！我一直...', emotion: '震惊' },
          { characterId: 'char-r05-02', characterName: '陆辰', content: '我知道。我后来才知道。林薇...是在试探我。她想知道我对你是不是认真的。但当时...我信了。我的大脑...出于自我保护，选择"忘记"那个约定。如果我记得，而你已经有了别人...那太痛苦了。所以...我选择装作忘了。', emotion: '痛苦' },
          { characterId: 'char-r05-01', characterName: '夏沫', content: '所以...你从来没有忘记过。你只是...在害怕。害怕记得，但我已经有了别人。', emotion: '感动' },
          { characterId: 'char-r05-02', characterName: '陆辰', content: '是的。夏沫...对不起。让你等了这么久。现在...那个约定还作数吗？', emotion: '紧张' },
          { characterId: 'char-r05-01', characterName: '夏沫', content: '（泪水滑落）陆辰...我...我也从来没有忘记过。', emotion: '幸福' },
          { characterId: 'char-r05-02', characterName: '陆辰', content: '（拿出一个盒子）这是...我在国外这些年，每年夏末都会准备的礼物。现在...终于可以交给你了。', emotion: '温柔' },
          { characterId: 'char-r05-01', characterName: '夏沫', content: '（打开盒子，里面是每年夏末的明信片，从十年前到今天）陆辰...', emotion: '大哭' },
          { characterId: 'char-r05-02', characterName: '陆辰', content: '夏沫，十八岁那年夏末的约定...我迟到了十年。但...我来了。还来得及吗？', emotion: '深情' },
          { characterId: 'char-r05-01', characterName: '夏沫', content: '（扑入怀中）来得及...陆辰...只要是你...多久都来得及。', emotion: '幸福' }
        ],
        summary: '最震撼的关系反转揭晓：陆辰从来没有忘记那个夏末的约定。他在国外出了意外，头部受伤，但失去的不是关于约定的记忆，而是"勇气"。回国后，他第一件事就是找夏沫，但闺蜜林薇故意骗他说夏沫已经有了交往多年的男朋友——这是林薇对他的试探。陆辰无法接受这个"事实"，他的大脑出于自我保护，选择"装作忘记"那个约定。如果记得约定，而夏沫已经有了别人，那太痛苦了。所以他选择装作不记得，以"朋友"的身份接近她，观察她，确认她是否真的幸福。而夏沫，也以为陆辰真的忘了，不敢主动。这场误会，持续了整整一年。直到夏末的最后一天，真相终于揭晓。陆辰拿出一个盒子，里面是他在国外十年间，每个夏末都会准备的明信片——从十年前到今天。他从来没有忘记过。那个十八岁夏末的约定，他迟到了十年，但...他来了。而夏沫，也等了他十年。这个故事告诉我们：有些"忘记"，不是真的忘记，而是太害怕记得；有些等待，不需要理由，只需要相信。',
        isTwist: true,
        twistHint: '伏笔：陆辰看着夏沫的眼神总是带着一丝不易察觉的痛苦、陆辰对"那个约定"的话题总是回避、陆辰和"客户"见面的话题总是"记忆"和"心理"、林薇对陆辰的态度总是带着一丝"试探"'
      }
    ],
    genre: '爱情',
    createdAt: '',
    totalEpisodes: 4,
    twistType: '关系反转'
  },

  {
    id: 'template-scifi-003',
    userInput: '',
    title: '霓虹深渊',
    episodes: [
      {
        episodeNumber: 1,
        title: '第一集：委托',
        scenes: [
          {
            id: 'sf03-s01',
            description: '2087年的上海，霓虹灯永远闪烁的赛博都市，主角林岚在她的地下工作室接待一位神秘客户',
            location: '霓虹上海，地下工作室',
            time: '凌晨2:00',
            atmosphere: '赛博朋克、神秘'
          }
        ],
        characters: [
          { id: 'char-sf03-01', name: '林岚', description: '32岁，记忆猎人，专门帮人找回或删除"数字记忆"', dialogueStyle: '冷静、干练' },
          { id: 'char-sf03-02', name: '陈先生', description: '神秘客户，穿着高档西装，似乎来自上层社会', dialogueStyle: '紧张、不安' },
          { id: 'char-sf03-03', name: '小七', description: '林岚的AI助手，悬浮在空中的全息投影', dialogueStyle: '活泼、机智' }
        ],
        dialogues: [
          { characterId: 'char-sf03-02', characterName: '陈先生', content: '林小姐，我需要你帮我找回一段记忆。', emotion: '紧张' },
          { characterId: 'char-sf03-01', characterName: '林岚', content: '什么记忆？', emotion: '冷静' },
          { characterId: 'char-sf03-02', characterName: '陈先生', content: '我不知道。我只知道...我忘记了某件很重要的事。非常重要。', emotion: '不安' },
          { characterId: 'char-sf03-03', characterName: '小七', content: '主人，这个案子很奇怪。他连忘记了什么都不知道，怎么找回？', emotion: '困惑' },
          { characterId: 'char-sf03-01', characterName: '林岚', content: '这正是有趣的地方。陈先生，你愿意让我进入你的"数字记忆"吗？', emotion: '认真' },
          { characterId: 'char-sf03-02', characterName: '陈先生', content: '当然。只要能找回那段记忆...多少钱都可以。', emotion: '急切' }
        ],
        summary: '2087年的赛博朋克上海，林岚是一位"记忆猎人"——专门帮人找回或删除存储在云端的"数字记忆"。一位神秘的陈先生找上门来，说他忘记了某件"非常重要"的事，但连忘记了什么都不知道。林岚决定接下这个奇怪的委托，进入陈先生的数字记忆中探索。'
      },
      {
        episodeNumber: 2,
        title: '第二集：探索',
        scenes: [
          {
            id: 'sf03-s02',
            description: '陈先生的数字记忆空间，一个由数据构成的虚拟世界，林岚在这里发现了被层层加密的区域',
            location: '数字记忆空间',
            time: '虚拟时间',
            atmosphere: '虚幻、神秘'
          }
        ],
        characters: [
          { id: 'char-sf03-01', name: '林岚', description: '记忆猎人', dialogueStyle: '冷静、探索' },
          { id: 'char-sf03-03', name: '小七', description: 'AI助手', dialogueStyle: '辅助分析' },
          { id: 'char-sf03-04', name: '记忆幻影', description: '陈先生记忆中反复出现的神秘女人', dialogueStyle: '模糊、缥缈' }
        ],
        dialogues: [
          { characterId: 'char-sf03-03', characterName: '小七', content: '主人，检测到多层加密。这些记忆...被人刻意隐藏了。', emotion: '警惕' },
          { characterId: 'char-sf03-01', characterName: '林岚', content: '谁会隐藏自己的记忆？', emotion: '困惑' },
          { characterId: 'char-sf03-03', characterName: '小七', content: '通常是...自己。人们会删除或加密那些太过痛苦的记忆。', emotion: '分析' },
          { characterId: 'char-sf03-01', characterName: '林岚', content: '（看到一个模糊的女性身影）等等...那是谁？', emotion: '警觉' },
          { characterId: 'char-sf03-04', characterName: '记忆幻影', content: '（缥缈的声音）林岚...不要继续...这对你没有好处...', emotion: '警告' },
          { characterId: 'char-sf03-01', characterName: '林岚', content: '你是谁？为什么知道我的名字？', emotion: '震惊' },
          { characterId: 'char-sf03-04', characterName: '记忆幻影', content: '我是...你即将面对的真相。而真相...往往很残忍。', emotion: '悲伤' }
        ],
        summary: '林岚进入陈先生的数字记忆空间，发现这里被多层加密保护。AI助手小七分析，这些加密很可能是陈先生自己设置的——人们会删除或加密太过痛苦的记忆。在探索中，林岚遇到了一个神秘的女性幻影，这个幻影居然知道林岚的名字，并警告她不要继续。林岚开始怀疑，这个委托...是否隐藏着更深的秘密。'
      },
      {
        episodeNumber: 3,
        title: '第三集：真相',
        scenes: [
          {
            id: 'sf03-s03',
            description: '林岚突破了最后一层加密，发现了令人震惊的真相——所有的角色关系都是颠倒的',
            location: '核心记忆区域',
            time: '虚拟时间',
            atmosphere: '震撼、颠覆'
          }
        ],
        characters: [
          { id: 'char-sf03-01', name: '林岚', description: '记忆猎人', dialogueStyle: '从冷静到震惊' },
          { id: 'char-sf03-04', name: '苏婉', description: '记忆幻影的真实身份——林岚已经死去的恋人', dialogueStyle: '温柔、悲伤' },
          { id: 'char-sf03-02', name: '陈先生', description: '神秘客户的真实身份——林岚自己的意识投影', dialogueStyle: '从紧张到释然' }
        ],
        dialogues: [
          { characterId: 'char-sf03-01', characterName: '林岚', content: '（突破加密，看到完整记忆）这是...什么？', emotion: '震惊' },
          { characterId: 'char-sf03-04', characterName: '苏婉', content: '现在你看到了真相。林岚...你还想继续吗？', emotion: '温柔' },
          { characterId: 'char-sf03-01', characterName: '林岚', content: '苏婉...你...你不是幻影。你是...真实的？', emotion: '不敢相信' },
          { characterId: 'char-sf03-04', characterName: '苏婉', content: '我是苏婉。三年前，那场事故...我死了。而你...无法接受这个事实。你把自己的记忆分割了。', emotion: '悲伤' },
          { characterId: 'char-sf03-01', characterName: '林岚', content: '分割记忆？什么意思？', emotion: '困惑' },
          { characterId: 'char-sf03-02', characterName: '陈先生', content: '（出现，声音改变）意思是，我就是你。陈先生...是你创造的另一个人格。', emotion: '释然' },
          { characterId: 'char-sf03-01', characterName: '林岚', content: '什么？！', emotion: '震惊' },
          { characterId: 'char-sf03-02', characterName: '陈先生', content: '三年前苏婉去世后，你无法接受。你把自己的记忆分成了两部分：一个"林岚"，继续生活，工作，做记忆猎人；另一个"陈先生"，保存着关于苏婉的所有记忆，但被加密隐藏了。你创造了这个"委托"，让自己去探索自己被遗忘的记忆。你...一直在寻找找回苏婉的方法。', emotion: '揭露真相' },
          { characterId: 'char-sf03-04', characterName: '苏婉', content: '林岚...我知道你一直无法放下。但我...只是一段数字记忆了。我不再是真实的。你需要...让我走。', emotion: '温柔' },
          { characterId: 'char-sf03-01', characterName: '林岚', content: '不...我做不到。苏婉...我不能再失去你一次。', emotion: '崩溃' },
          { characterId: 'char-sf03-04', characterName: '苏婉', content: '你没有失去我。我永远在你心里。只是...你需要继续前进。林岚...我爱你。一直都爱。', emotion: '幸福' },
          { characterId: 'char-sf03-01', characterName: '林岚', content: '（看着苏婉的幻影消散）苏婉...不要...', emotion: '大哭' }
        ],
        summary: '最震撼的叙事视角反转揭晓：整个故事的视角是颠倒的。"陈先生"不是客户，而是林岚自己创造的另一个人格。三年前，林岚的恋人苏婉在一场事故中去世。林岚无法接受这个事实，于是将自己的记忆分割成两部分：一个"林岚"继续生活，做记忆猎人；另一个"陈先生"保存着关于苏婉的所有记忆，但被加密隐藏。"陈先生"委托林岚找回"某段重要的记忆"——实际上是林岚自己在潜意识中希望找回苏婉。而那个神秘的女性幻影，就是苏婉留在数字世界中的最后一点痕迹。当真相揭晓，林岚必须面对一个痛苦的选择：继续活在过去，还是让苏婉真正离开？这个故事探讨了数字时代的记忆、身份和失去，以及我们如何面对无法挽回的失去。',
        isTwist: true,
        twistHint: '伏笔：陈先生对"忘记了什么"一无所知、记忆幻影知道林岚的名字、林岚对某些场景有"似曾相识"的感觉、小七检测到的加密方式与林岚自己使用的完全一致'
      }
    ],
    genre: '科幻',
    createdAt: '',
    totalEpisodes: 3,
    twistType: '叙事视角反转'
  },

  {
    id: 'template-scifi-004',
    userInput: '',
    title: '星尘来信',
    episodes: [
      {
        episodeNumber: 1,
        title: '第一集：信号',
        scenes: [
          {
            id: 'sf04-s01',
            description: '贵州平塘，FAST天眼观测站，天文学家沈星接收到一个来自4.2光年外的神秘信号',
            location: 'FAST天眼观测站',
            time: '深夜',
            atmosphere: '神秘、期待'
          }
        ],
        characters: [
          { id: 'char-sf04-01', name: '沈星', description: '35岁，天文学家，对宇宙充满好奇和敬畏', dialogueStyle: '理性、热情' },
          { id: 'char-sf04-02', name: '张教授', description: '60岁，沈星的导师，经验丰富的天文学家', dialogueStyle: '稳重、谨慎' },
          { id: 'char-sf04-03', name: '小李', description: '28岁，沈星的助手，年轻气盛', dialogueStyle: '激动、直接' }
        ],
        dialogues: [
          { characterId: 'char-sf04-01', characterName: '沈星', content: '张教授！您快来看！这个信号...来自比邻星！', emotion: '激动' },
          { characterId: 'char-sf04-02', characterName: '张教授', content: '比邻星？4.2光年外？让我看看...', emotion: '惊讶' },
          { characterId: 'char-sf04-03', characterName: '小李', content: '有规律的脉冲！这不是自然信号！这是...这是人为的！', emotion: '兴奋' },
          { characterId: 'char-sf04-02', characterName: '张教授', content: '冷静！先确认信号的真实性。在宣布任何结论之前...', emotion: '谨慎' },
          { characterId: 'char-sf04-01', characterName: '沈星', content: '张教授，信号中包含数学序列——质数。1, 2, 3, 5, 7, 11...这是宇宙中通用的数学语言。这...这是外星文明的第一次接触！', emotion: '震撼' }
        ],
        summary: '天文学家沈星在FAST天眼观测站接收到一个来自4.2光年外比邻星的神秘信号。信号中包含质数序列——这是宇宙中通用的数学语言，不可能是自然产生的。沈星和她的团队意识到，这可能是人类历史上第一次与外星文明的接触。但张教授提醒他们，在确认之前，必须保持谨慎。'
      },
      {
        episodeNumber: 2,
        title: '第二集：解码',
        scenes: [
          {
            id: 'sf04-s02',
            description: '观测站控制中心，沈星带领团队开始解码信号，发现其中包含更复杂的信息',
            location: '控制中心',
            time: '三天后',
            atmosphere: '紧张、期待'
          }
        ],
        characters: [
          { id: 'char-sf04-01', name: '沈星', description: '天文学家', dialogueStyle: '专注、兴奋' },
          { id: 'char-sf04-02', name: '张教授', description: '导师', dialogueStyle: '稳重、担忧' },
          { id: 'char-sf04-03', name: '小李', description: '助手', dialogueStyle: '激动、好奇' }
        ],
        dialogues: [
          { characterId: 'char-sf04-01', characterName: '沈星', content: '信号中除了质数，还有更复杂的信息。看起来像是...一幅图像？', emotion: '兴奋' },
          { characterId: 'char-sf04-03', characterName: '小李', content: '让我试试解码...等等，有结果了！这是...一颗行星的图像？还有文字...', emotion: '震惊' },
          { characterId: 'char-sf04-01', characterName: '沈星', content: '文字...是中文？为什么是中文？', emotion: '困惑' },
          { characterId: 'char-sf04-02', characterName: '张教授', content: '沈星...你有没有想过？比邻星距离地球4.2光年。这个信号...是4.2年前发出的。而他们使用中文...这意味着什么？', emotion: '严肃' },
          { characterId: 'char-sf04-01', characterName: '沈星', content: '意味着...他们早就知道人类的存在。而且...他们一直在观察我们。', emotion: '震惊' },
          { characterId: 'char-sf04-03', characterName: '小李', content: '看这个图像！这颗行星...上面有建筑！还有...还有人形生物！', emotion: '兴奋' },
          { characterId: 'char-sf04-02', characterName: '张教授', content: '（表情严肃）等等...那个生物的形态...还有建筑的风格...我有种不好的预感。' },
          { characterId: 'char-sf04-01', characterName: '沈星', content: '继续解码！我需要知道更多！', emotion: '急切' }
        ],
        summary: '沈星带领团队解码信号，发现其中包含一幅图像和文字。令人震惊的是，文字居然是中文——这意味着外星文明早就知道人类的存在，并且一直在观察。图像显示了比邻星系统中的一颗行星，上面有建筑和人形生物。但张教授看着图像，有种不祥的预感。'
      },
      {
        episodeNumber: 3,
        title: '第三集：回信',
        scenes: [
          {
            id: 'sf04-s03',
            description: '信号完全解码后，沈星发现了一个令人震惊的秘密——这个信号不是来自外星文明，而是来自人类自己',
            location: '控制中心',
            time: '一周后',
            atmosphere: '震撼、颠覆'
          }
        ],
        characters: [
          { id: 'char-sf04-01', name: '沈星', description: '天文学家', dialogueStyle: '从兴奋到震惊' },
          { id: 'char-sf04-02', name: '张教授', description: '导师', dialogueStyle: '从稳重到痛苦' },
          { id: 'char-sf04-03', name: '小李', description: '助手', dialogueStyle: '从激动到困惑' }
        ],
        dialogues: [
          { characterId: 'char-sf04-01', characterName: '沈星', content: '（看着完全解码的信息）这...这不可能...', emotion: '震惊' },
          { characterId: 'char-sf04-03', characterName: '小李', content: '什么？沈博士？上面写了什么？', emotion: '困惑' },
          { characterId: 'char-sf04-01', characterName: '沈星', content: '信号...不是来自外星文明。是来自...我们自己。', emotion: '不敢相信' },
          { characterId: 'char-sf04-02', characterName: '张教授', content: '（长叹一声）我就知道...沈星，是时候告诉你真相了。', emotion: '痛苦' },
          { characterId: 'char-sf04-01', characterName: '沈星', content: '张教授...您早就知道？', emotion: '震惊' },
          { characterId: 'char-sf04-02', characterName: '张教授', content: '不是早就知道，是...推测。比邻星距离地球4.2光年。你觉得，什么样的文明能在4.2年前就精确地使用中文，并且对我们的文明如此了解？', emotion: '反问' },
          { characterId: 'char-sf04-01', characterName: '沈星', content: '只有...比我们先进得多的文明？或者...', emotion: '开始明白' },
          { characterId: 'char-sf04-02', characterName: '张教授', content: '或者...是我们自己。来自未来的我们。', emotion: '揭露真相' },
          { characterId: 'char-sf04-03', characterName: '小李', content: '什么？来自未来？这不可能！时间旅行...', emotion: '震惊' },
          { characterId: 'char-sf04-02', characterName: '张教授', content: '不是时间旅行，是时间"广播"。在未来，人类发现了某种方法，可以将信息发送到过去。但有一个限制：信息只能以光速传播，而且只能发送到距离足够远的地方，让时间差产生效果。', emotion: '解释' },
          { characterId: 'char-sf04-01', characterName: '沈星', content: '所以...4.2光年外的比邻星...是一个"时间中继站"？未来的人类将信息发送到比邻星，然后比邻星的"广播器"将信号转发回地球？这样，4.2年 + 4.2年 = 8.4年的时间差？', emotion: '开始理解' },
          { characterId: 'char-sf04-02', characterName: '张教授', content: '准确。信号中还有一个日期——8.4年后。那是...一个重大事件的日期。', emotion: '沉重' },
          { characterId: 'char-sf04-01', characterName: '沈星', content: '什么事件？', emotion: '紧张' },
          { characterId: 'char-sf04-02', characterName: '张教授', content: '世界末日。8.4年后，一场全球性的灾难将毁灭人类文明。未来的人类...已经灭绝了。这个信号...是他们最后的希望。他们将这个信息发送到过去，希望我们能改变未来。', emotion: '痛苦' },
          { characterId: 'char-sf04-01', characterName: '沈星', content: '所以...那些"外星生物"的图像...不是外星人。是...未来的人类？', emotion: '震惊' },
          { characterId: 'char-sf04-02', characterName: '张教授', content: '是的。那场灾难后，幸存的人类发生了变异。他们...不再是我们现在的样子。但他们...仍然记得我们。他们...想拯救我们。', emotion: '悲伤' },
          { characterId: 'char-sf04-03', characterName: '小李', content: '所以...这不是"第一次接触"。这是...一次警告。一次来自未来的警告。', emotion: '震撼' }
        ],
        summary: '最震撼的信息差反转揭晓：这个信号不是来自外星文明，而是来自未来的人类。在未来，一场全球性的灾难将毁灭人类文明。幸存的人类发生了变异，不再是现在的样子。他们发现了一种方法，可以将信息发送到过去——通过4.2光年外的比邻星作为"时间中继站"。未来的人类将信号发送到比邻星（需要4.2年），然后比邻星的"广播器"将信号转发回地球（又需要4.2年），总共8.4年的时间差。这样，未来的信息就可以到达"过去"的我们。信号中的"外星生物"图像不是外星人，而是变异后的未来人类。那些建筑，是他们在灾难后重建的文明。而整个"第一次接触"，实际上是一次警告——8.4年后，世界末日即将到来。未来的人类已经灭绝，这是他们最后的希望：将信息发送到过去，希望现在的人类能改变未来。这个故事探讨了时间、命运和希望：如果未来已经注定，我们还有改变的可能吗？而那些"外星文明"，会不会其实一直都是我们自己？',
        isTwist: true,
        twistHint: '伏笔：信号使用中文而非宇宙通用语言、"外星生物"的形态与人类有相似之处、张教授对信号一直有种"不祥的预感"、日期8.4年正好是4.2的两倍'
      }
    ],
    genre: '科幻',
    createdAt: '',
    totalEpisodes: 3,
    twistType: '信息差反转'
  },

  {
    id: 'template-horror-003',
    userInput: '',
    title: '荒村凶宅',
    episodes: [
      {
        episodeNumber: 1,
        title: '第一集：探险',
        scenes: [
          {
            id: 'h03-s01',
            description: '一个被遗忘的荒村，传说中的"凶宅"前，五个年轻人站在破败的大门前',
            location: '荒村古宅',
            time: '黄昏',
            atmosphere: '阴森、恐怖'
          }
        ],
        characters: [
          { id: 'char-h03-01', name: '张明', description: '22岁，大学生，灵异爱好者，这次探险的组织者', dialogueStyle: '兴奋、大胆' },
          { id: 'char-h03-02', name: '小雨', description: '21岁，张明的女朋友，胆小但好奇心强', dialogueStyle: '害怕、犹豫' },
          { id: 'char-h03-03', name: '胖子', description: '22岁，搞笑担当，但内心也害怕', dialogueStyle: '幽默、逞强' },
          { id: 'char-h03-04', name: '戴眼镜', description: '22岁，理性派，不相信鬼神', dialogueStyle: '冷静、分析' },
          { id: 'char-h03-05', name: '小美', description: '21岁，神秘的女生，似乎知道一些秘密', dialogueStyle: '沉默、神秘' }
        ],
        dialogues: [
          { characterId: 'char-h03-01', characterName: '张明', content: '就是这里了！传说中的荒村凶宅！据说这里...曾经发生过灭门惨案！', emotion: '兴奋' },
          { characterId: 'char-h03-02', characterName: '小雨', content: '张明...我觉得有点不对劲。我们...我们还是回去吧。', emotion: '害怕' },
          { characterId: 'char-h03-03', characterName: '胖子', content: '小雨，别怕！有胖哥在！再说了，这世界上哪有鬼？都是人吓人！', emotion: '逞强' },
          { characterId: 'char-h03-04', characterName: '戴眼镜', content: '同意。根据我的了解，这里所谓的"闹鬼"只是...', emotion: '理性' },
          { characterId: 'char-h03-05', characterName: '小美', content: '（突然开口）你们真的想进去？', emotion: '神秘' },
          { characterId: 'char-h03-01', characterName: '张明', content: '当然！怎么了，小美？你害怕了？', emotion: '挑衅' },
          { characterId: 'char-h03-05', characterName: '小美', content: '我不害怕。只是...想提醒你们。一旦进入这扇门...有些人...可能就出不来了。', emotion: '诡异' },
          { characterId: 'char-h03-02', characterName: '小雨', content: '小美...你说什么呢？', emotion: '恐惧' }
        ],
        summary: '五个年轻人为了探险和直播，来到了传说中的荒村凶宅。这里据说在三十年前发生过灭门惨案，之后一直闹鬼。组织者张明兴奋不已，女朋友小雨却感到害怕。胖子和戴眼镜分别以"人吓人"和"理性分析"来安慰大家。但队伍中最沉默的小美，突然说了一句诡异的话："一旦进入这扇门，有些人可能就出不来了。"其他人只当是小美在故弄玄虚，但他们不知道，这句话...可能是他们能得到的最后一次警告。'
      },
      {
        episodeNumber: 2,
        title: '第二集：闹鬼',
        scenes: [
          {
            id: 'h03-s02',
            description: '古宅内部，破败不堪，五个人开始探索，但怪事接连发生',
            location: '古宅内',
            time: '晚上',
            atmosphere: '恐怖、诡异'
          }
        ],
        characters: [
          { id: 'char-h03-01', name: '张明', description: '组织者', dialogueStyle: '从兴奋到恐惧' },
          { id: 'char-h03-02', name: '小雨', description: '胆小', dialogueStyle: '害怕、哭泣' },
          { id: 'char-h03-03', name: '胖子', description: '搞笑担当', dialogueStyle: '从逞强到恐惧' },
          { id: 'char-h03-04', name: '戴眼镜', description: '理性派', dialogueStyle: '从冷静到困惑' },
          { id: 'char-h03-05', name: '小美', description: '神秘女生', dialogueStyle: '神秘、似乎知道一切' }
        ],
        dialogues: [
          { characterId: 'char-h03-03', characterName: '胖子', content: '（突然大叫）啊！什么东西碰我！', emotion: '惊恐' },
          { characterId: 'char-h03-04', characterName: '戴眼镜', content: '冷静！只是蜘蛛网而已。', emotion: '冷静' },
          { characterId: 'char-h03-01', characterName: '张明', content: '看！墙上...有字！"第五个人...必须留下..."', emotion: '恐惧' },
          { characterId: 'char-h03-02', characterName: '小雨', content: '第五个人...什么意思？我们...正好五个人...', emotion: '崩溃' },
          { characterId: 'char-h03-05', characterName: '小美', content: '意思是，你们中...有一个人...不是和你们一起来的。', emotion: '诡异' },
          { characterId: 'char-h03-04', characterName: '戴眼镜', content: '小美，你在说什么？我们五个...不一直在一起吗？', emotion: '困惑' },
          { characterId: 'char-h03-05', characterName: '小美', content: '是吗？那你们告诉我...小美...是谁？', emotion: '反问' },
          { characterId: 'char-h03-03', characterName: '胖子', content: '小美就是小美啊！你怎么了？', emotion: '困惑' },
          { characterId: 'char-h03-05', characterName: '小美', content: '不。我是说...在今天之前...你们有谁认识"小美"吗？', emotion: '神秘' },
          { characterId: 'char-h03-01', characterName: '张明', content: '（突然愣住）等等...小美...你是...你是怎么加入我们的？我...我不记得了...', emotion: '震惊' },
          { characterId: 'char-h03-02', characterName: '小雨', content: '我...我也不记得...好像...好像我们一直都是五个人...但...但"小美"这个名字...今天之前...我好像没有听说过...', emotion: '恐惧' },
          { characterId: 'char-h03-05', characterName: '小美', content: '（微笑，开始变得透明）因为...三十年前...这里...确实是五个人。', emotion: '诡异' },
          { characterId: 'char-h03-04', characterName: '戴眼镜', content: '三十年前...五个人...你是说...', emotion: '开始明白' },
          { characterId: 'char-h03-05', characterName: '小美', content: '灭门惨案...确实死了五个人。父母和三个孩子。而我...是最小的那个女儿。我一直在等...等第五个人...来陪我。', emotion: '悲伤' }
        ],
        summary: '古宅内怪事接连发生。胖子感觉有东西碰他，墙上出现神秘文字"第五个人必须留下"。最神秘的小美问了一个可怕的问题："在今天之前，你们有谁认识小美吗？"四个人突然愣住——他们都不记得小美是怎么加入队伍的。她就好像...突然就出现在那里了。小美揭示了真相：三十年前的灭门惨案，死了五个人——父母和三个孩子。而她就是那个最小的女儿。她一直在等第五个人来陪她。四个人惊恐地意识到：他们本来只有四个人，但不知道什么时候，队伍里多了一个"小美"。而"第五个人必须留下"——指的不是他们中的一个，而是...她已经"选中"了一个人。'
      },
      {
        episodeNumber: 3,
        title: '第三集：真相',
        scenes: [
          {
            id: 'h03-s03',
            description: '最恐怖的反转揭晓——闹鬼的不是古宅，而是他们自己的记忆',
            location: '古宅内',
            time: '午夜',
            atmosphere: '极度恐怖、颠覆'
          }
        ],
        characters: [
          { id: 'char-h03-01', name: '张明', description: '组织者', dialogueStyle: '从恐惧到崩溃' },
          { id: 'char-h03-02', name: '小雨', description: '胆小', dialogueStyle: '从恐惧到平静' },
          { id: 'char-h03-03', name: '胖子', description: '搞笑担当', dialogueStyle: '从恐惧到困惑' },
          { id: 'char-h03-04', name: '戴眼镜', description: '理性派', dialogueStyle: '从困惑到明白' },
          { id: 'char-h03-05', name: '小美', description: '神秘女生', dialogueStyle: '从诡异到悲伤' }
        ],
        dialogues: [
          { characterId: 'char-h03-01', characterName: '张明', content: '（惊恐地看着小美）你...你是鬼！你想干什么！', emotion: '惊恐' },
          { characterId: 'char-h03-05', characterName: '小美', content: '（摇头，悲伤地）不。我不是鬼。你们...才是。', emotion: '平静' },
          { characterId: 'char-h03-03', characterName: '胖子', content: '什么？！你说什么！', emotion: '震惊' },
          { characterId: 'char-h03-05', characterName: '小美', content: '让我问你们一个问题。你们...为什么来这里？', emotion: '反问' },
          { characterId: 'char-h03-01', characterName: '张明', content: '为了...为了探险...为了直播...', emotion: '困惑' },
          { characterId: 'char-h03-05', characterName: '小美', content: '不。你们来这里...是因为三十年前...你们死在这里。', emotion: '揭露真相' },
          { characterId: 'char-h03-04', characterName: '戴眼镜', content: '什么意思？', emotion: '开始明白' },
          { characterId: 'char-h03-05', characterName: '小美', content: '三十年前，这里发生的不是"灭门惨案"。而是...五个年轻人来这里探险，然后...因为意外，全部死亡。', emotion: '悲伤' },
          { characterId: 'char-h03-02', characterName: '小雨', content: '你是说...我们...三十年前就死了？', emotion: '平静' },
          { characterId: 'char-h03-05', characterName: '小美', content: '是的。你们无法接受自己的死亡，于是创造了一个"轮回"。你们以为自己是"来探险的年轻人"，但实际上...你们一直被困在这里。你们一遍又一遍地重复着那天的经历——来探险、遇到怪事、然后...再次死去。而我...我是那天唯一的幸存者。我一直...一直看着你们重复这个轮回。', emotion: '悲伤' },
          { characterId: 'char-h03-01', characterName: '张明', content: '不...这不可能...我记得...我记得我的父母...我的大学...', emotion: '崩溃' },
          { characterId: 'char-h03-05', characterName: '小美', content: '那些记忆...是你们大脑创造的幻觉。你们已经死了三十年了。这三十年来，你们唯一"记得"的...就是来这里探险的那天。', emotion: '同情' },
          { characterId: 'char-h03-04', characterName: '戴眼镜', content: '（突然冷静下来）所以...墙上的"第五个人必须留下"是什么意思？', emotion: '平静' },
          { characterId: 'char-h03-05', characterName: '小美', content: '意思是...要打破这个轮回，必须有一个人"接受"自己的死亡。然后...其他人才能解脱。我这次来...是想告诉你们：是时候...该放下了。', emotion: '温柔' },
          { characterId: 'char-h03-02', characterName: '小雨', content: '（微笑着）我...我想起来了。那天...是我提议来这里的。如果...如果我死了能让大家解脱...我愿意。', emotion: '释然' },
          { characterId: 'char-h03-05', characterName: '小美', content: '不，小雨。不需要有人牺牲。你们只需要...一起接受。一起...放下。', emotion: '温柔' },
          { characterId: 'char-h03-01', characterName: '张明', content: '（看着彼此，终于释然）是啊...是时候...该回家了。', emotion: '平静' }
        ],
        summary: '最震撼的存在反转揭晓：闹鬼的不是古宅，而是他们自己。三十年前，五个年轻人来这里探险，因意外全部死亡。他们无法接受自己的死亡，于是创造了一个"轮回"——他们以为自己是"来探险的年轻人"，但实际上一直被困在这里，一遍又一遍地重复着那天的经历。而"小美"不是鬼——她是那天唯一的幸存者。三十年来，她一直看着这五个朋友的灵魂困在轮回中，无法解脱。墙上的"第五个人必须留下"不是诅咒，而是一个提示：要打破轮回，必须有人接受自己的死亡。最终，五个人终于意识到了真相，选择一起接受、一起放下。这个故事探讨了死亡、记忆和执念：真正的恐怖不是遇到鬼，而是发现自己早已死去，却一直活在幻觉中；真正的解脱不是逃离"凶宅"，而是接受已经发生的事实。',
        isTwist: true,
        twistHint: '伏笔：他们不记得"小美"是怎么加入队伍的、他们对"来这里探险"之外的记忆都很模糊、小美对古宅的了解异常详细、她问"你们有谁认识小美吗"时，实际上是在暗示"小美"这个身份本身就有问题'
      }
    ],
    genre: '恐怖',
    createdAt: '',
    totalEpisodes: 3,
    twistType: '存在反转'
  },

  {
    id: 'template-horror-004',
    userInput: '',
    title: '午夜直播',
    episodes: [
      {
        episodeNumber: 1,
        title: '第一集：热门主播',
        scenes: [
          {
            id: 'h04-s01',
            description: '深夜，网络主播小雪在她的公寓里准备一场特殊的直播——"连接亡者的仪式"',
            location: '小雪的公寓',
            time: '晚上11:30',
            atmosphere: '神秘、期待'
          }
        ],
        characters: [
          { id: 'char-h04-01', name: '小雪', description: '25岁，网络灵异主播，漂亮、大胆，善于调动气氛', dialogueStyle: '活泼、大胆' },
          { id: 'char-h04-02', name: '弹幕网友', description: '观看直播的网友们', dialogueStyle: '各种声音' },
          { id: 'char-h04-03', name: '神秘ID', description: '一个叫"亡者低语"的神秘网友', dialogueStyle: '诡异、神秘' }
        ],
        dialogues: [
          { characterId: 'char-h04-01', characterName: '小雪', content: '大家好！欢迎来到今晚的直播！今晚...我们要玩点不一样的。', emotion: '兴奋' },
          { characterId: 'char-h04-02', characterName: '弹幕网友', content: '主播又要玩什么花样？', emotion: '好奇' },
          { characterId: 'char-h04-01', characterName: '小雪', content: '看到这个阵法了吗？还有这根蜡烛。传说...在午夜十二点整，如果能在蜡烛熄灭前完成这个仪式，就可以...和亡者对话。', emotion: '神秘' },
          { characterId: 'char-h04-02', characterName: '弹幕网友', content: '假的吧？主播又在装神弄鬼。', emotion: '怀疑' },
          { characterId: 'char-h04-01', characterName: '小雪', content: '真假不重要，重要的是...气氛。还有...万一...是真的呢？', emotion: '微笑' },
          { characterId: 'char-h04-02', characterName: '弹幕网友', content: '主播胆子真大！', emotion: '佩服' },
          { characterId: 'char-h04-03', characterName: '神秘ID', content: '（突然出现的弹幕）你真的想和亡者对话？', emotion: '诡异' },
          { characterId: 'char-h04-01', characterName: '小雪', content: '（注意到这个ID）这位"亡者低语"朋友，你有什么高见吗？', emotion: '挑衅' },
          { characterId: 'char-h04-03', characterName: '神秘ID', content: '我只是想提醒你。有些门...一旦打开，就关不上了。', emotion: '警告' },
          { characterId: 'char-h04-01', characterName: '小雪', content: '（大笑）这位网友入戏太深了！好了，大家准备好了吗？距离午夜十二点...还有十分钟！', emotion: '兴奋' }
        ],
        summary: '网络灵异主播小雪准备了一场特殊的直播：在午夜十二点进行"连接亡者的仪式"。她在公寓里布置了阵法和蜡烛，声称如果仪式成功，可以和亡者对话。大部分网友只当是表演，但一个叫"亡者低语"的神秘ID发出了警告："有些门一旦打开，就关不上了。"小雪只当是网友入戏太深，没有在意。她不知道，这个警告...可能是真的。'
      },
      {
        episodeNumber: 2,
        title: '第二集：仪式开始',
        scenes: [
          {
            id: 'h04-s02',
            description: '午夜十二点整，小雪开始了仪式，怪事开始发生',
            location: '小雪的公寓',
            time: '午夜12:00',
            atmosphere: '诡异、恐怖'
          }
        ],
        characters: [
          { id: 'char-h04-01', name: '小雪', description: '网络主播', dialogueStyle: '从大胆到恐惧' },
          { id: 'char-h04-02', name: '弹幕网友', description: '观看直播的网友', dialogueStyle: '从调侃到恐惧' },
          { id: 'char-h04-03', name: '神秘ID', description: '"亡者低语"', dialogueStyle: '诡异、似乎知道一切' }
        ],
        dialogues: [
          { characterId: 'char-h04-01', characterName: '小雪', content: '午夜十二点整！仪式...开始！', emotion: '兴奋' },
          { characterId: 'char-h04-02', characterName: '弹幕网友', content: '主播表演得真像！', emotion: '调侃' },
          { characterId: 'char-h04-01', characterName: '小雪', content: '（念出咒语）以烛光为引，以黑夜为媒...归来吧，亡者...', emotion: '严肃' },
          { characterId: 'char-h04-02', characterName: '弹幕网友', content: '等等...你们看蜡烛...是不是变蓝了？', emotion: '惊恐' },
          { characterId: 'char-h04-01', characterName: '小雪', content: '（感觉到不对劲）大家...你们有没有觉得...房间变冷了？', emotion: '紧张' },
          { characterId: 'char-h04-02', characterName: '弹幕网友', content: '主播身后...那是什么？！', emotion: '极度恐惧' },
          { characterId: 'char-h04-01', characterName: '小雪', content: '（不敢回头）什么？你们在说什么？', emotion: '恐惧' },
          { characterId: 'char-h04-03', characterName: '神秘ID', content: '现在你相信了吗？门...已经打开了。', emotion: '诡异' },
          { characterId: 'char-h04-01', characterName: '小雪', content: '（猛地回头，什么都没看到）什么...什么都没有...你们是在吓我吗？', emotion: '惊恐' },
          { characterId: 'char-h04-02', characterName: '弹幕网友', content: '不可能！刚才真的有东西！一个穿白衣服的女人！', emotion: '坚持' },
          { characterId: 'char-h04-01', characterName: '小雪', content: '（开始害怕）好了...今天的直播就到这里...我...我要下播了...', emotion: '恐惧' },
          { characterId: 'char-h04-03', characterName: '神秘ID', content: '下播？你以为...这是你可以决定的吗？', emotion: '诡异' },
          { characterId: 'char-h04-01', characterName: '小雪', content: '（试图关闭直播，但电脑不听使唤）怎么回事？！直播...关不掉！', emotion: '崩溃' }
        ],
        summary: '午夜十二点整，小雪开始了仪式。怪事随即发生：蜡烛变成了蓝色，房间突然变冷。弹幕网友惊恐地说看到她身后有一个穿白衣服的女人，但小雪回头什么都没看到。她开始害怕，想要下播，却发现直播根本关不掉。神秘ID"亡者低语"说："你以为这是你可以决定的吗？"小雪意识到，这场"表演"...可能已经变成了真的。'
      },
      {
        episodeNumber: 3,
        title: '第三集：亡者低语',
        scenes: [
          {
            id: 'h04-s03',
            description: '最恐怖的反转揭晓——小雪不是在"召唤亡者"，而是亡者在"召唤她"',
            location: '小雪的公寓',
            time: '午夜12:30',
            atmosphere: '极度恐怖、颠覆'
          }
        ],
        characters: [
          { id: 'char-h04-01', name: '小雪', description: '网络主播', dialogueStyle: '从恐惧到崩溃' },
          { id: 'char-h04-02', name: '弹幕网友', description: '观看直播的网友', dialogueStyle: '从恐惧到震惊' },
          { id: 'char-h04-03', name: '亡者低语', description: '神秘ID的真实身份', dialogueStyle: '从诡异到悲伤' }
        ],
        dialogues: [
          { characterId: 'char-h04-01', characterName: '小雪', content: '（惊恐地看着电脑）谁在那里？！你是谁？！', emotion: '崩溃' },
          { characterId: 'char-h04-03', characterName: '亡者低语', content: '我是谁？小雪...你真的不记得了吗？', emotion: '悲伤' },
          { characterId: 'char-h04-01', characterName: '小雪', content: '记得什么？我不认识你！放我走！', emotion: '恐惧' },
          { characterId: 'char-h04-03', characterName: '亡者低语', content: '让我给你看一样东西。', emotion: '平静' },
          { characterId: 'char-h04-02', characterName: '弹幕网友', content: '电脑屏幕...在变！那是...一段视频？', emotion: '震惊' },
          { characterId: 'char-h04-01', characterName: '小雪', content: '（看着屏幕上的视频）这是...什么？这是...我？', emotion: '困惑' },
          { characterId: 'char-h04-03', characterName: '亡者低语', content: '这是一年前的你。小雪...你还记得一年前...发生了什么吗？', emotion: '悲伤' },
          { characterId: 'char-h04-01', characterName: '小雪', content: '一年前...我...我不记得...我的头...好痛...', emotion: '痛苦' },
          { characterId: 'char-h04-03', characterName: '亡者低语', content: '让我来帮你回忆。一年前，你也是这样...在进行一场"连接亡者"的直播。但是...那天晚上...发生了意外。', emotion: '揭露真相' },
          { characterId: 'char-h04-02', characterName: '弹幕网友', content: '视频里...蜡烛倒了！着火了！', emotion: '惊恐' },
          { characterId: 'char-h04-01', characterName: '小雪', content: '（记忆涌现）不...不可能...我记得...我记得我逃出来了...', emotion: '崩溃' },
          { characterId: 'char-h04-03', characterName: '亡者低语', content: '不，小雪。你没有逃出来。那场火灾...你死了。', emotion: '悲伤' },
          { characterId: 'char-h04-01', characterName: '小雪', content: '什么？！我死了？那...那现在的我是什么？', emotion: '极度震惊' },
          { characterId: 'char-h04-03', characterName: '亡者低语', content: '你是一个执念。你无法接受自己的死亡，所以一遍又一遍地重复着你"最后"的记忆——进行这场直播。而我们...那些真正的亡者...一直在等你。等你意识到...你已经不属于活人的世界了。', emotion: '温柔' },
          { characterId: 'char-h04-02', characterName: '弹幕网友', content: '所以...我们一直在看一个死人的直播？', emotion: '颠覆' },
          { characterId: 'char-h04-03', characterName: '亡者低语', content: '是的。而"亡者低语"...是我。我是你的姐姐。你死后...我一直在尝试联系你。小雪...是时候...该走了。', emotion: '悲伤' },
          { characterId: 'char-h04-01', characterName: '小雪', content: '（终于接受了一切，泪流满面）姐姐...我...我不想死...', emotion: '大哭' },
          { characterId: 'char-h04-03', characterName: '亡者低语', content: '我知道，小雪。我知道。但...死亡不是结束。我们...会再见面的。', emotion: '温柔' },
          { characterId: 'char-h04-01', characterName: '小雪', content: '（微笑着，身影开始变淡）姐姐...我...我来了...', emotion: '释然' }
        ],
        summary: '最震撼的存在反转揭晓：小雪不是在"召唤亡者"，而是她自己就是亡者。一年前，她在一场类似的直播中发生意外，死于火灾。她无法接受自己的死亡，于是创造了一个"轮回"——一遍又一遍地重复着她最后的记忆，进行这场"连接亡者"的直播。而"亡者低语"不是别人，正是她的姐姐。姐姐在她死后，一直尝试联系她，希望她能接受自己的死亡，前往另一个世界。那些"弹幕网友"看到的"白衣女人"，其实是小雪自己——或者说，是她逐渐意识到真相时，看到的自己的"死亡映像"。最恐怖的不是遇到鬼，而是发现自己早已死去，却一直活在自己的幻觉中，以为自己还活着。而整个"连接亡者的仪式"，实际上是亡者们在"连接"她——召唤她接受自己的死亡，前往她该去的地方。这个故事探讨了死亡、执念和放下：真正的解脱不是逃离，而是接受。',
        isTwist: true,
        twistHint: '伏笔：小雪对"一年前"的记忆模糊、"亡者低语"对她异常了解、直播关不掉（因为那是她的记忆，不是真实的直播）、网友看到的"白衣女人"其实是她自己的死亡映像'
      }
    ],
    genre: '恐怖',
    createdAt: '',
    totalEpisodes: 3,
    twistType: '存在反转'
  },

  {
    id: 'template-fantasy-003',
    userInput: '',
    title: '星之学院',
    episodes: [
      {
        episodeNumber: 1,
        title: '第一集：录取通知书',
        scenes: [
          {
            id: 'f03-s01',
            description: '一个平凡的小镇，高中生林星收到了一封来自"星之学院"的神秘录取通知书',
            location: '林星的家',
            time: '傍晚',
            atmosphere: '神秘、期待'
          }
        ],
        characters: [
          { id: 'char-f03-01', name: '林星', description: '17岁，普通高中生，从小就对星星有着特殊的感应', dialogueStyle: '好奇、勇敢' },
          { id: 'char-f03-02', name: '林母', description: '林星的母亲，似乎知道一些秘密', dialogueStyle: '担忧、神秘' },
          { id: 'char-f03-03', name: '陈老师', description: '星之学院的招生代表，神秘而优雅', dialogueStyle: '优雅、神秘' }
        ],
        dialogues: [
          { characterId: 'char-f03-01', characterName: '林星', content: '妈妈！你看！我收到了录取通知书！"星之学院"——这是什么学校？我好像没有申请过...', emotion: '惊讶' },
          { characterId: 'char-f03-02', characterName: '林母', content: '（表情复杂）星之学院...终于还是来了。', emotion: '担忧' },
          { characterId: 'char-f03-01', characterName: '林星', content: '妈妈？你知道这个学校？', emotion: '困惑' },
          { characterId: 'char-f03-03', characterName: '陈老师', content: '（突然出现）林星同学，你好。我是星之学院的陈老师。让我来解释这一切吧。', emotion: '优雅' },
          { characterId: 'char-f03-01', characterName: '林星', content: '你是谁？怎么进来的？', emotion: '警惕' },
          { characterId: 'char-f03-03', characterName: '陈老师', content: '（微笑）林星，你从小就对星星有着特殊的感应，对不对？你能看到别人看不到的星光，你能感觉到星星的情绪。这不是巧合。', emotion: '神秘' },
          { characterId: 'char-f03-01', characterName: '林星', content: '你怎么知道这些？', emotion: '震惊' },
          { characterId: 'char-f03-03', characterName: '陈老师', content: '因为星之学院...是为像你这样的人存在的。我们是星使——能够与星辰沟通、使用星光力量的人。而你，林星，是我们预言中的...星辰之子。', emotion: '揭露真相' }
        ],
        summary: '平凡的高中生林星收到了一封来自"星之学院"的神秘录取通知书。她的母亲看到通知书后表情复杂，似乎知道一些秘密。星之学院的陈老师突然出现，向林星揭示了真相：她从小对星星的特殊感应不是巧合，她是"星使"——能够与星辰沟通、使用星光力量的人。而星之学院，就是培养星使的地方。更重要的是，林星是预言中的"星辰之子"——一个将改变整个星使世界命运的人。'
      },
      {
        episodeNumber: 2,
        title: '第二集：学院生活',
        scenes: [
          {
            id: 'f03-s02',
            description: '星之学院，一座漂浮在云端的神秘学院，林星开始了她的新生活',
            location: '星之学院',
            time: '九月',
            atmosphere: '奇幻、紧张'
          }
        ],
        characters: [
          { id: 'char-f03-01', name: '林星', description: '星辰之子', dialogueStyle: '从困惑到坚定' },
          { id: 'char-f03-04', name: '夜辰', description: '学院里最优秀的学生，性格冷漠，似乎对林星有着特殊的态度', dialogueStyle: '冷漠、神秘' },
          { id: 'char-f03-05', name: '小柔', description: '林星的室友，活泼开朗，成为她在学院的第一个朋友', dialogueStyle: '活泼、热情' },
          { id: 'char-f03-03', name: '陈老师', description: '星之学院的老师', dialogueStyle: '优雅、神秘' }
        ],
        dialogues: [
          { characterId: 'char-f03-05', characterName: '小柔', content: '林星！你真的是星辰之子？太厉害了！', emotion: '兴奋' },
          { characterId: 'char-f03-01', characterName: '林星', content: '我也不知道...我只是觉得这一切都像做梦一样。', emotion: '困惑' },
          { characterId: 'char-f03-04', characterName: '夜辰', content: '（冷冷地走过）星辰之子...哼，不过是又一个被命运玩弄的人。', emotion: '冷漠' },
          { characterId: 'char-f03-01', characterName: '林星', content: '那个人是谁？他好像很讨厌我。', emotion: '困惑' },
          { characterId: 'char-f03-05', characterName: '小柔', content: '那是夜辰，学院里最优秀的学生。但是...他的身世很可怜。他的父母...在一场与暗星使的战斗中牺牲了。', emotion: '悲伤' },
          { characterId: 'char-f03-01', characterName: '林星', content: '暗星使？那是什么？', emotion: '困惑' },
          { characterId: 'char-f03-03', characterName: '陈老师', content: '（出现）暗星使...是星使的黑暗面。他们选择与堕落的星辰交易，追求更强大但邪恶的力量。而星辰之子的使命...就是阻止暗星使的阴谋，保护光明。', emotion: '严肃' },
          { characterId: 'char-f03-01', characterName: '林星', content: '我的...使命？', emotion: '震惊' }
        ],
        summary: '林星进入了漂浮在云端的星之学院，开始了她的新生活。她认识了活泼开朗的室友小柔，也遇到了冷漠神秘的天才学生夜辰。夜辰似乎对林星有着特殊的态度，冷冷地说"星辰之子不过是又一个被命运玩弄的人"。陈老师向林星解释了"暗星使"的存在——星使的黑暗面，追求邪恶力量。而星辰之子的使命，就是阻止暗星使的阴谋，保护光明。林星开始意识到，自己的命运...可能比想象的更加沉重。'
      },
      {
        episodeNumber: 3,
        title: '第三集：真相',
        scenes: [
          {
            id: 'f03-s03',
            description: '学院的禁地，林星发现了一个被隐藏的秘密——关于星辰之子的真正命运',
            location: '星之学院禁地',
            time: '午夜',
            atmosphere: '震撼、颠覆'
          }
        ],
        characters: [
          { id: 'char-f03-01', name: '林星', description: '星辰之子', dialogueStyle: '从坚定到崩溃' },
          { id: 'char-f03-04', name: '夜辰', description: '天才学生，他的真实身份即将揭晓', dialogueStyle: '从冷漠到悲伤' },
          { id: 'char-f03-03', name: '陈老师', description: '星之学院的老师，她的动机即将揭晓', dialogueStyle: '从优雅到痛苦' }
        ],
        dialogues: [
          { characterId: 'char-f03-01', characterName: '林星', content: '（发现禁地中的古老预言）这是...什么？"星辰之子，以命换命。光明重现，星辰永寂。"', emotion: '困惑' },
          { characterId: 'char-f03-04', characterName: '夜辰', content: '（出现）你终于看到了。这就是星辰之子的真正命运。', emotion: '冷漠' },
          { characterId: 'char-f03-01', characterName: '林星', content: '夜辰？你怎么在这里？这句话是什么意思？', emotion: '紧张' },
          { characterId: 'char-f03-04', characterName: '夜辰', content: '意思是，星辰之子不是"救世主"。而是"祭品"。每隔一千年，暗星使的力量就会达到顶峰。唯一能阻止他们的方法...就是让星辰之子牺牲自己的生命，用纯粹的星光之力净化黑暗。', emotion: '揭露真相' },
          { characterId: 'char-f03-01', characterName: '林星', content: '什么？！牺牲...我？', emotion: '震惊' },
          { characterId: 'char-f03-04', characterName: '夜辰', content: '是的。而我...我的父母...就是上一代星辰之子的守护者。他们亲眼看着星辰之子牺牲...却无能为力。这就是为什么我讨厌"星辰之子"这个称号。因为它意味着...注定的死亡。', emotion: '悲伤' },
          { characterId: 'char-f03-03', characterName: '陈老师', content: '（出现）夜辰，你不应该告诉她这些。', emotion: '痛苦' },
          { characterId: 'char-f03-01', characterName: '林星', content: '陈老师...你早就知道？这就是你们"培养"我的原因？让我...去死？', emotion: '崩溃' },
          { characterId: 'char-f03-03', characterName: '陈老师', content: '林星，对不起。但这是...命运。千年来的惯例。如果不牺牲星辰之子，暗星使将会毁灭一切。', emotion: '痛苦' },
          { characterId: 'char-f03-01', characterName: '林星', content: '命运？我不相信！如果命运要我死...那我就改变它！', emotion: '坚定' },
          { characterId: 'char-f03-04', characterName: '夜辰', content: '（愣住）林星...', emotion: '惊讶' },
          { characterId: 'char-f03-01', characterName: '林星', content: '夜辰，你说你的父母是守护者。那你应该知道...有没有别的方法？不需要牺牲的方法？', emotion: '急切' },
          { characterId: 'char-f03-04', characterName: '夜辰', content: '（犹豫）...有一个传说。如果星辰之子能找到"双星之心"——光明与黑暗共存的力量...也许...可以打破这个命运。但...这只是传说。从来没有人成功过。', emotion: '犹豫' },
          { characterId: 'char-f03-01', characterName: '林星', content: '传说也好，只要有一线希望。我不会放弃的。夜辰，你愿意帮我吗？', emotion: '坚定' },
          { characterId: 'char-f03-04', characterName: '夜辰', content: '（看着林星，眼中闪过一丝光芒）...好。我帮你。毕竟...我也厌倦了...看着命运玩弄人。', emotion: '坚定' },
          { characterId: 'char-f03-03', characterName: '陈老师', content: '（看着他们，长叹一声）林星，夜辰...你们知道你们在做什么吗？这是违背一千年的传统...', emotion: '复杂' },
          { characterId: 'char-f03-01', characterName: '林星', content: '陈老师，传统是用来打破的。如果一个传统需要有人牺牲...那它就不值得存在。', emotion: '坚定' }
        ],
        summary: '最震撼的目标反转揭晓：林星在学院禁地发现了古老的预言，揭示了星辰之子的真正命运——不是"救世主"，而是"祭品"。每隔一千年，星辰之子必须牺牲自己的生命，用纯粹的星光之力净化暗星使的黑暗力量。这就是千年来的传统。夜辰揭示了真相：他的父母就是上一代星辰之子的守护者，亲眼看着星辰之子牺牲却无能为力。这就是为什么他讨厌"星辰之子"这个称号——因为它意味着注定的死亡。陈老师也承认，学院"培养"林星的真正目的，就是让她在关键时刻牺牲自己。但林星拒绝接受这个命运。她决定寻找传说中的"双星之心"——光明与黑暗共存的力量，也许可以打破这个宿命。夜辰被她的勇气打动，决定帮助她。目标从"完成使命、牺牲自己"变成了"打破命运、寻找希望"。这个故事探讨了命运、选择和反抗：如果命运已经注定，我们还有选择的权利吗？而那些"神圣"的传统，如果需要有人牺牲，它们还值得维护吗？',
        isTwist: true,
        twistHint: '伏笔：夜辰对"星辰之子"的异常反感、陈老师看林星的眼神总是带着一丝愧疚、学院的"禁地"似乎隐藏着什么、预言中的"光明重现，星辰永寂"暗示着某种牺牲'
      }
    ],
    genre: '奇幻',
    createdAt: '',
    totalEpisodes: 3,
    twistType: '目标反转'
  },

  {
    id: 'template-fantasy-004',
    userInput: '',
    title: '镜像世界',
    episodes: [
      {
        episodeNumber: 1,
        title: '第一集：镜子',
        scenes: [
          {
            id: 'f04-s01',
            description: '一间古董店，女主角林小雨发现了一面神秘的古镜',
            location: '神秘古董店',
            time: '下午',
            atmosphere: '神秘、诡异'
          }
        ],
        characters: [
          { id: 'char-f04-01', name: '林小雨', description: '25岁，插画师，性格内向，最近生活不顺', dialogueStyle: '内向、敏感' },
          { id: 'char-f04-02', name: '古董店老板', description: '神秘的老人，似乎知道古镜的秘密', dialogueStyle: '神秘、沧桑' },
          { id: 'char-f04-03', name: '镜像小雨', description: '镜子中的另一个林小雨，性格与她相反', dialogueStyle: '活泼、自信' }
        ],
        dialogues: [
          { characterId: 'char-f04-01', characterName: '林小雨', content: '这面镜子...好特别。我好像...在哪里见过。', emotion: '困惑' },
          { characterId: 'char-f04-02', characterName: '古董店老板', content: '小姑娘，你确定要买这面镜子？它...不普通。', emotion: '神秘' },
          { characterId: 'char-f04-01', characterName: '林小雨', content: '什么意思？', emotion: '困惑' },
          { characterId: 'char-f04-02', characterName: '古董店老板', content: '这是"双面镜"。据说...它能连接两个平行的世界。镜子的这一面是你的世界，另一面...是另一个你的世界。', emotion: '神秘' },
          { characterId: 'char-f04-01', characterName: '林小雨', content: '另一个我？', emotion: '惊讶' },
          { characterId: 'char-f04-02', characterName: '古董店老板', content: '是的。平行世界中的你...可能过着完全不同的生活。但是...小姑娘，有一件事你必须记住。', emotion: '严肃' },
          { characterId: 'char-f04-01', characterName: '林小雨', content: '什么事？', emotion: '紧张' },
          { characterId: 'char-f04-02', characterName: '古董店老板', content: '永远不要...和镜子中的你交换身份。因为...一旦交换...就再也换不回来了。', emotion: '警告' }
        ],
        summary: '插画师林小雨在一家神秘的古董店发现了一面特别的古镜。古董店老板告诉她，这是"双面镜"，能够连接两个平行世界。镜子的另一面，是另一个林小雨的世界——她可能过着完全不同的生活。老板警告她：永远不要和镜子中的自己交换身份，因为一旦交换，就再也换不回来了。林小雨只当是老人在故弄玄虚，还是买下了镜子。她不知道，这个选择...将永远改变她的生活。'
      },
      {
        episodeNumber: 2,
        title: '第二集：交换',
        scenes: [
          {
            id: 'f04-s02',
            description: '林小雨的公寓，她在一次意外中，真的和镜子中的自己交换了身份',
            location: '林小雨的公寓',
            time: '午夜',
            atmosphere: '诡异、震惊'
          }
        ],
        characters: [
          { id: 'char-f04-01', name: '林小雨', description: '原来的林小雨，进入了镜像世界', dialogueStyle: '从困惑到兴奋' },
          { id: 'char-f04-03', name: '镜像小雨', description: '镜子中的林小雨，进入了现实世界', dialogueStyle: '活泼、自信' },
          { id: 'char-f04-04', name: '张阳', description: '林小雨的暗恋对象，在镜像世界中...是她的男朋友', dialogueStyle: '温柔、体贴' }
        ],
        dialogues: [
          { characterId: 'char-f04-01', characterName: '林小雨', content: '（看着镜子中的自己）我...我和你...好像不太一样。', emotion: '困惑' },
          { characterId: 'char-f04-03', characterName: '镜像小雨', content: '（镜子中的倒影微笑）当然不一样。你是那个懦弱、自卑、什么都不敢争取的林小雨。而我...是那个勇敢、自信、得到了一切的你。', emotion: '自信' },
          { characterId: 'char-f04-01', characterName: '林小雨', content: '你...你怎么知道我的想法？', emotion: '震惊' },
          { characterId: 'char-f04-03', characterName: '镜像小雨', content: '因为我就是你啊。只是...在这个世界里，我选择了不同的路。小雨，想不想...交换？', emotion: '诱惑' },
          { characterId: 'char-f04-01', characterName: '林小雨', content: '交换...什么意思？', emotion: '困惑' },
          { characterId: 'char-f04-03', characterName: '镜像小雨', content: '交换身份。你来我的世界，享受我拥有的一切。我去你的世界，帮你改变你那糟糕的人生。怎么样？', emotion: '诱惑' },
          { characterId: 'char-f04-01', characterName: '林小雨', content: '我...我可以吗？老板说...', emotion: '犹豫' },
          { characterId: 'char-f04-03', characterName: '镜像小雨', content: '别听那个老头胡说。可以交换的，随时都可以。怎么样？你就不想...体验一下成功的感觉？不想...让张阳爱上你？', emotion: '诱惑' },
          { characterId: 'char-f04-01', characterName: '林小雨', content: '（动摇）...好。我...我同意。', emotion: '下定决心' }
        ],
        summary: '林小雨发现镜子中的自己——镜像小雨——和她有着完全不同的性格。镜像小雨活泼、自信、勇敢，而现实中的林小雨懦弱、自卑、什么都不敢争取。镜像小雨诱惑她交换身份：林小雨可以进入镜像世界，享受她拥有的一切；镜像小雨则去现实世界，帮她改变那糟糕的人生。林小雨想到自己暗恋的张阳，想到自己那失败的人生...最终同意了交换。她不知道，这个决定...将是她一生的遗憾。'
      },
      {
        episodeNumber: 3,
        title: '第三集：真相',
        scenes: [
          {
            id: 'f04-s03',
            description: '林小雨在镜像世界中享受着"完美人生"，但她逐渐发现...这个世界的真相',
            location: '镜像世界',
            time: '一个月后',
            atmosphere: '震撼、颠覆'
          }
        ],
        characters: [
          { id: 'char-f04-01', name: '林小雨', description: '原来的林小雨，困在镜像世界', dialogueStyle: '从幸福到恐惧' },
          { id: 'char-f04-03', name: '镜像小雨', description: '镜子中的林小雨，她的真正目的即将揭晓', dialogueStyle: '从亲切到冷酷' },
          { id: 'char-f04-04', name: '张阳', description: '镜像世界中的张阳，他的真实身份也将揭晓', dialogueStyle: '从温柔到诡异' }
        ],
        dialogues: [
          { characterId: 'char-f04-01', characterName: '林小雨', content: '（幸福地）张阳...我真不敢相信...你真的是我的男朋友。', emotion: '幸福' },
          { characterId: 'char-f04-04', characterName: '张阳', content: '（温柔地微笑）当然，小雨。我们在一起...已经五年了。你怎么了？最近总是说奇怪的话。', emotion: '温柔' },
          { characterId: 'char-f04-01', characterName: '林小雨', content: '没什么...我只是...太幸福了。对了，我想和镜像小雨聊聊。我想...我该回去了。', emotion: '犹豫' },
          { characterId: 'char-f04-04', characterName: '张阳', content: '（表情突然变化）回去？小雨，你确定...要回去吗？', emotion: '诡异' },
          { characterId: 'char-f04-01', characterName: '林小雨', content: '张阳...你怎么了？你的表情...', emotion: '恐惧' },
          { characterId: 'char-f04-03', characterName: '镜像小雨', content: '（出现，冷笑）他的表情很正常，林小雨。因为...他本来就不是真的。', emotion: '冷酷' },
          { characterId: 'char-f04-01', characterName: '林小雨', content: '什么意思？', emotion: '震惊' },
          { characterId: 'char-f04-03', characterName: '镜像小雨', content: '意思是，这个世界...根本不是什么"平行世界"。这面镜子...也不是什么"双面镜"。它是...囚笼。', emotion: '揭露真相' },
          { characterId: 'char-f04-01', characterName: '林小雨', content: '囚笼？什么意思？', emotion: '恐惧' },
          { characterId: 'char-f04-03', characterName: '镜像小雨', content: '意思是，我不是什么"另一个世界的你"。我是...这面镜子的上一个主人。五十年前，我和你一样，被镜子中的幻影诱惑，交换了身份。然后...我就被困在了这里。而镜子...创造了一个"镜像小雨"的人格，代替我去现实世界生活。现在...轮到你了。', emotion: '冷酷' },
          { characterId: 'char-f04-01', characterName: '林小雨', content: '什么？！那张阳...这一切...都是假的？', emotion: '崩溃' },
          { characterId: 'char-f04-04', characterName: '张阳', content: '（表情变得僵硬、空洞）是的，林小雨。我只是...镜子为你创造的幻影。根据你内心的渴望...完美的男朋友，成功的事业，幸福的人生...这些都是假的。', emotion: '空洞' },
          { characterId: 'char-f04-01', characterName: '林小雨', content: '所以...那个老板...也是镜子的一部分？他的警告...是反向的诱惑？', emotion: '开始明白' },
          { characterId: 'char-f04-03', characterName: '镜像小雨', content: '聪明。那老头...是镜子创造的第一个幻影。他的"警告"，实际上是在诱惑你。人类就是这样——越是被警告不要做的事，就越想尝试。现在...你明白了吧。你已经被困在这里了。而镜子...会创造一个新的"你"，代替你在现实世界生活。那个"你"...会拥有你渴望的一切勇气、自信和成功。但...那不再是你了。', emotion: '冷酷' },
          { characterId: 'char-f04-01', characterName: '林小雨', content: '（看着镜子，看着镜子中那个"完美"的自己正在取代她的位置）不...这不是真的...让我出去...让我出去！', emotion: '崩溃' },
          { characterId: 'char-f04-03', characterName: '镜像小雨', content: '（冷漠地）没用的。五十年了...我试过了所有方法。一旦交换...就再也换不回来了。现在...接受你的命运吧，林小雨。和我一样...永远困在这个虚假的完美世界中。而那个"完美"的你...会在现实世界...真正地活着。', emotion: '悲伤' }
        ],
        summary: '最震撼的存在反转揭晓：林小雨在镜像世界中享受着"完美人生"——张阳是她的男朋友，事业成功，生活幸福。但当她想回去时，真相终于揭晓：这个世界根本不是什么"平行世界"，这面镜子也不是什么"双面镜"。它是...囚笼。镜像小雨不是什么"另一个世界的林小雨"，而是这面镜子的上一个主人。五十年前，她和林小雨一样，被镜子中的幻影诱惑，交换了身份。然后她就被困在了这里，而镜子创造了一个"完美"的人格代替她在现实世界生活。那个古董店老板，也是镜子创造的幻影——他的"警告"实际上是反向的诱惑，因为人类越是被警告不要做的事，就越想尝试。现在轮到林小雨了。她将永远困在这个虚假的完美世界中，而镜子创造的那个"完美"的林小雨——勇敢、自信、成功——将代替她在现实世界真正地活着。最讽刺的是：林小雨一直想成为一个更好的自己，但当"更好的自己"真的出现时，却意味着真正的她将被永远囚禁。这个故事探讨了自我、欲望和代价：你愿意为了"完美人生"，付出什么样的代价？如果有一个"更好的你"可以代替你活下去，那...你还是你吗？',
        isTwist: true,
        twistHint: '伏笔：古董店老板的"警告"充满了反向诱惑、镜像小雨对林小雨的内心了如指掌、张阳的"完美"显得有些不真实、镜像世界的一切似乎都太"恰好"符合林小雨的渴望'
      }
    ],
    genre: '奇幻',
    createdAt: '',
    totalEpisodes: 3,
    twistType: '存在反转'
  }
];

export default scriptTemplates;