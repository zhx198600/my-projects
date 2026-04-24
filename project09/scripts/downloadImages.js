import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_BASE_URL = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image';

const imagesDir = path.join(__dirname, '..', 'public', 'images');
const cardsDir = path.join(imagesDir, 'tarot', 'cards');

const tarotImages = [
  { id: 0, filename: '0-fool.jpg', prompt: '塔罗牌愚者，穿着彩色服装的年轻人站在悬崖边，仰望天空，手持白玫瑰，背包，小白狗，阳光山脉背景，神秘艺术风格' },
  { id: 1, filename: '1-magician.jpg', prompt: '塔罗牌魔术师，站在祭坛前，四元素符号，无限符号，神秘魔法氛围，艺术风格' },
  { id: 2, filename: '2-high-priestess.jpg', prompt: '塔罗牌女祭司，头戴月亮王冠，手持卷轴，身后有两根柱子，蓝色长袍，神秘智慧氛围，艺术风格' },
  { id: 3, filename: '3-empress.jpg', prompt: '塔罗牌皇后，坐在金色王座上，头戴十二星冠冕，手持权杖，周围环绕着大自然和麦穗，丰饶母性，艺术风格' },
  { id: 4, filename: '4-emperor.jpg', prompt: '塔罗牌皇帝，坐在石制王座上，手持权杖和圆球，红色长袍，胡须，权威稳定，艺术风格' },
  { id: 5, filename: '5-hierophant.jpg', prompt: '塔罗牌教皇，头戴三重冠，手持权杖，坐在宝座上，两位门徒在前方，传统信仰，艺术风格' },
  { id: 6, filename: '6-lovers.jpg', prompt: '塔罗牌恋人，一男一女站在天使面前，选择与和谐，爱情与价值观，神秘浪漫氛围，艺术风格' },
  { id: 7, filename: '7-chariot.jpg', prompt: '塔罗牌战车，胜利者驾驶着由狮身人面兽拉的战车，盔甲，胜利与决心，意志力与控制，艺术风格' },
  { id: 8, filename: '8-strength.jpg', prompt: '塔罗牌力量，温柔的女性用双手驯服狮子，无限符号，内在力量与勇气，耐心与同情心，艺术风格' },
  { id: 9, filename: '9-hermit.jpg', prompt: '塔罗牌隐士，身穿灰色斗篷的老者手持灯笼，站在雪山之巅，内省与孤独，智慧与寻求真理，艺术风格' },
  { id: 10, filename: '10-wheel-of-fortune.jpg', prompt: '塔罗牌命运之轮，巨大的转轮上有四个神秘生物，黄道十二宫符号，命运与机遇，变化与周期，艺术风格' },
  { id: 11, filename: '11-justice.jpg', prompt: '塔罗牌正义，手持天平与宝剑的女性，红色长袍，公正与平衡，真理与法律，艺术风格' },
  { id: 12, filename: '12-hanged-man.jpg', prompt: '塔罗牌倒吊人，男子被倒吊在T形架上，一条腿弯曲，双手在身后，光环围绕头部，暂停与牺牲，新视角与投降，艺术风格' },
  { id: 13, filename: '13-death.jpg', prompt: '塔罗牌死神，骑在白色战马上的骷髅，手持旗帜，日出背景，结束与转变，重生与释放，艺术风格' },
  { id: 14, filename: '14-temperance.jpg', prompt: '塔罗牌节制，天使站在水边，一只脚在水中一只脚在陆地，将液体从一个杯子倒入另一个杯子，平衡与调和，耐心与适度，艺术风格' },
  { id: 15, filename: '15-devil.jpg', prompt: '塔罗牌恶魔，长有蝙蝠翅膀和羊角的恶魔，站在基座上，一对被锁链束缚的男女在下方，束缚与物质主义，诱惑与阴影，艺术风格' },
  { id: 16, filename: '16-tower.jpg', prompt: '塔罗牌塔，高耸的塔楼被闪电击中，火焰从窗户喷出，人们从塔顶坠落，突变与混乱，启示与解放，艺术风格' },
  { id: 17, filename: '17-star.jpg', prompt: '塔罗牌星星，天空中有一颗大星和七颗小星，一个裸体女性在水边将水倒入水池和陆地，一只鸟在树上，希望与灵感，宁静与指引，艺术风格' },
  { id: 18, filename: '18-moon.jpg', prompt: '塔罗牌月亮，一轮明月高挂天空，两只狗和一只狼对着月亮嚎叫，一只小龙虾从水中爬出，两条小径通向远方，直觉与潜意识，幻觉与情绪，艺术风格' },
  { id: 19, filename: '19-sun.jpg', prompt: '塔罗牌太阳，灿烂的太阳在天空，一个裸体儿童骑在白色战马上，手持旗帜，向日葵在背景中，快乐与成功，活力与清晰，艺术风格' },
  { id: 20, filename: '20-judgement.jpg', prompt: '塔罗牌审判，大天使加百列吹响号角，复活的人们从坟墓中升起，双手合十祈祷，觉醒与重生，召唤与评估，艺术风格' },
  { id: 21, filename: '21-world.jpg', prompt: '塔罗牌世界，一个裸体女性在圆形花环中央，手持两根魔杖，四个角落有神秘生物，完成与整合，成就与圆满，艺术风格' },
];

const otherImages = [
  { filename: 'card-back.jpg', prompt: '神秘塔罗牌背面设计，深蓝色背景，金色神秘符号，五角星图案，装饰性边框，艺术风格，优雅神秘', dir: path.join(imagesDir, 'tarot') },
  { filename: 'background.jpg', prompt: '神秘星空背景，深蓝色紫色渐变，闪烁星星，月亮，神秘氛围，适合塔罗网站背景', dir: imagesDir },
];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function deleteOldImages() {
  console.log('删除旧图片...');
  
  if (fs.existsSync(cardsDir)) {
    const files = fs.readdirSync(cardsDir);
    files.forEach(file => {
      if (file.endsWith('.jpg')) {
        fs.unlinkSync(path.join(cardsDir, file));
        console.log(`  删除: ${file}`);
      }
    });
  }
  
  const cardBackPath = path.join(imagesDir, 'tarot', 'card-back.jpg');
  if (fs.existsSync(cardBackPath)) {
    fs.unlinkSync(cardBackPath);
    console.log('  删除: card-back.jpg');
  }
  
  const bgPath = path.join(imagesDir, 'background.jpg');
  if (fs.existsSync(bgPath)) {
    fs.unlinkSync(bgPath);
    console.log('  删除: background.jpg');
  }
}

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        return downloadImage(response.headers.location, filepath).then(resolve).catch(reject);
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }
      
      const fileStream = fs.createWriteStream(filepath);
      response.pipe(fileStream);
      
      fileStream.on('finish', () => {
        fileStream.close();
        resolve(filepath);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

function generateImageUrl(prompt) {
  const encodedPrompt = encodeURIComponent(prompt);
  return `${API_BASE_URL}?prompt=${encodedPrompt}&image_size=square_hd`;
}

async function downloadAllImages() {
  ensureDir(cardsDir);
  deleteOldImages();
  
  console.log('\n开始下载新图片...\n');
  
  const allImages = [
    ...tarotImages.map(img => ({ ...img, dir: cardsDir })),
    ...otherImages
  ];
  
  for (let i = 0; i < allImages.length; i++) {
    const img = allImages[i];
    const filepath = path.join(img.dir, img.filename);
    const url = generateImageUrl(img.prompt);
    
    console.log(`[${i + 1}/${allImages.length}] 下载: ${img.filename}`);
    
    try {
      await downloadImage(url, filepath);
      const stats = fs.statSync(filepath);
      console.log(`      成功! 大小: ${(stats.size / 1024).toFixed(1)} KB`);
    } catch (error) {
      console.log(`      失败: ${error.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n完成!');
}

downloadAllImages().catch(console.error);
