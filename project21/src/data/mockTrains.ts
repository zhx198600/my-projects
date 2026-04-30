import { Train } from '../types/train';

const lines = [
  { line: 'TWL', lineName: '荃湾线', stations: ['中环', '金钟', '尖沙咀', '油麻地', '旺角', '太子', '深水埗', '长沙湾', '荔枝角', '美孚', '荔景', '葵芳', '葵兴', '大窝口', '荃湾'] },
  { line: 'ISL', lineName: '港岛线', stations: ['柴湾', '杏花邨', '筲箕湾', '西湾河', '太古城', '鲗鱼涌', '北角', '炮台山', '天后', '铜锣湾', '湾仔', '金钟', '中环', '上环', '西营盘', '香港大学', '坚尼地城'] },
  { line: 'KTL', lineName: '观塘线', stations: ['黄埔', '何文田', '油麻地', '旺角', '太子', '石硖尾', '九龙塘', '乐富', '黄大仙', '钻石山', '彩虹', '九龙湾', '牛头角', '观塘', '蓝田', '油塘', '调景岭'] },
  { line: 'TKL', lineName: '将军澳线', stations: ['北角', '鲗鱼涌', '油塘', '调景岭', '将军澳', '坑口', '宝琳', '康城'] },
  { line: 'EAL', lineName: '东铁线', stations: ['金钟', '会展', '红磡', '旺角东', '九龙塘', '大围', '沙田', '火炭', '大学', '大埔墟', '太和', '粉岭', '上水', '罗湖', '落马洲'] },
  { line: 'WRL', lineName: '西铁线', stations: ['红磡', '柯士甸', '尖东', '南昌', '美孚', '荃湾西', '锦上路', '元朗', '朗屏', '天水围', '兆康', '屯门'] },
  { line: 'TCL', lineName: '东涌线', stations: ['香港', '九龙', '奥运', '南昌', '荔景', '青衣', '欣澳', '东涌'] },
  { line: 'DRL', lineName: '迪士尼线', stations: ['欣澳', '迪士尼'] },
  { line: 'AEL', lineName: '机场快线', stations: ['香港', '九龙', '青衣', '机场', '博览馆'] },
];

const lineColors: Record<string, string> = {
  TWL: '#D32F2F',
  ISL: '#0070C0',
  KTL: '#2E7D32',
  TKL: '#7B1FA2',
  EAL: '#5D4037',
  WRL: '#8D6E63',
  TCL: '#F57C00',
  DRL: '#EB1468',
  AEL: '#00A1DE',
};

const linePositions: Record<string, { baseX: number; baseY: number; rangeX: number; rangeY: number }> = {
  TWL: { baseX: 150, baseY: 300, rangeX: 400, rangeY: 250 },
  ISL: { baseX: 100, baseY: 330, rangeX: 1000, rangeY: 40 },
  KTL: { baseX: 100, baseY: 200, rangeX: 900, rangeY: 380 },
  TKL: { baseX: 500, baseY: 260, rangeX: 550, rangeY: 50 },
  EAL: { baseX: 400, baseY: 100, rangeX: 700, rangeY: 200 },
  WRL: { baseX: 50, baseY: 350, rangeX: 450, rangeY: 200 },
  TCL: { baseX: 50, baseY: 200, rangeX: 450, rangeY: 150 },
  DRL: { baseX: 450, baseY: 180, rangeX: 100, rangeY: 50 },
  AEL: { baseX: 300, baseY: 180, rangeX: 300, rangeY: 100 },
};

export function generateMockTrains(count: number = 60): Train[] {
  const trains: Train[] = [];

  for (let i = 0; i < count; i++) {
    const lineData = lines[i % lines.length];
    const stationIndex = i % (lineData.stations.length - 1);
    const isDelayed = Math.random() < 0.12;
    const posConfig = linePositions[lineData.line] || linePositions.ISL;
    
    const progress = (i % 8) / 8;
    const positionX = posConfig.baseX + progress * posConfig.rangeX + (Math.random() - 0.5) * 60;
    const positionY = posConfig.baseY + ((Math.floor(i / 8) % 3) / 3) * posConfig.rangeY + (Math.random() - 0.5) * 30;
    
    trains.push({
      id: `train-${String(i + 1).padStart(3, '0')}`,
      trainNumber: `${lineData.line}${String(((i % 9) + 1) * 100 + Math.floor(i / lines.length) + 1)}`,
      line: lineData.line,
      lineName: lineData.lineName,
      lineColor: lineColors[lineData.line] || '#22C55E',
      positionX: Math.max(60, Math.min(1140, positionX)),
      positionY: Math.max(60, Math.min(640, positionY)),
      status: isDelayed ? 'delayed' : (Math.random() > 0.25 ? 'running' : 'stopped'),
      isDelayed,
      delayMinutes: isDelayed ? Math.floor(Math.random() * 12) + 2 : 0,
      currentStation: lineData.stations[stationIndex],
      nextStation: lineData.stations[stationIndex + 1],
      direction: Math.random() > 0.5 ? 'up' : 'down',
      speed: Math.floor(Math.random() * 40) + 60,
      passengerCount: Math.floor(Math.random() * 1500) + 500,
    });
  }

  return trains;
}
