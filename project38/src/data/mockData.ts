export interface StatData {
  id: string;
  title: string;
  value: number;
  unit: string;
  icon: string;
  trend: number;
  trendLabel: string;
  color: string;
}

export const statsData: StatData[] = [
  {
    id: 'speed',
    title: '实时车速',
    value: 58.6,
    unit: 'km/h',
    icon: '🚗',
    trend: 5.2,
    trendLabel: '较昨日',
    color: '#00d4ff'
  },
  {
    id: 'congestion',
    title: '拥堵指数',
    value: 1.8,
    unit: '',
    icon: '📊',
    trend: -8.5,
    trendLabel: '较昨日',
    color: '#00f5d4'
  },
  {
    id: 'vehicles',
    title: '在途车辆数',
    value: 128456,
    unit: '辆',
    icon: '🚙',
    trend: 12.3,
    trendLabel: '较昨日',
    color: '#7b2cbf'
  },
  {
    id: 'accidents',
    title: '事故数量',
    value: 23,
    unit: '起',
    icon: '⚠️',
    trend: -15.6,
    trendLabel: '较昨日',
    color: '#ff6b6b'
  }
];

export type WarningLevel = '严重' | '一般' | '轻微';

export type CongestionLevel = '畅通' | '缓行' | '拥堵' | '严重拥堵';

export interface RoadData {
  id: string;
  name: string;
  coordinates: [number, number][];
  congestionLevel: CongestionLevel;
  congestionIndex: number;
}

export const congestionColors: Record<CongestionLevel, string> = {
  '畅通': '#00ff88',
  '缓行': '#ffdd00',
  '拥堵': '#ff8800',
  '严重拥堵': '#ff3333'
};

export const roadsData: RoadData[] = [
  {
    id: 'road1',
    name: '长安街',
    coordinates: [
      [116.1800, 39.9080],
      [116.2500, 39.9080],
      [116.3200, 39.9080],
      [116.4000, 39.9080],
      [116.4600, 39.9080],
      [116.5300, 39.9080]
    ],
    congestionLevel: '拥堵',
    congestionIndex: 2.5
  },
  {
    id: 'road2',
    name: '东三环',
    coordinates: [
      [116.4500, 39.8000],
      [116.4500, 39.8500],
      [116.4500, 39.8900],
      [116.4500, 39.9200],
      [116.4500, 39.9600],
      [116.4500, 40.0000]
    ],
    congestionLevel: '严重拥堵',
    congestionIndex: 3.8
  },
  {
    id: 'road3',
    name: '北四环',
    coordinates: [
      [116.2500, 39.9800],
      [116.3200, 39.9800],
      [116.4000, 39.9800],
      [116.4800, 39.9800],
      [116.5500, 39.9800]
    ],
    congestionLevel: '缓行',
    congestionIndex: 1.6
  },
  {
    id: 'road4',
    name: '西二环',
    coordinates: [
      [116.3400, 39.8200],
      [116.3400, 39.8600],
      [116.3400, 39.9000],
      [116.3400, 39.9400],
      [116.3400, 39.9700]
    ],
    congestionLevel: '畅通',
    congestionIndex: 1.1
  },
  {
    id: 'road5',
    name: '中关村大街',
    coordinates: [
      [116.3100, 39.9200],
      [116.3100, 39.9600],
      [116.3100, 40.0000],
      [116.3100, 40.0400]
    ],
    congestionLevel: '拥堵',
    congestionIndex: 2.8
  },
  {
    id: 'road6',
    name: '东二环',
    coordinates: [
      [116.4300, 39.8500],
      [116.4300, 39.8900],
      [116.4300, 39.9300],
      [116.4300, 39.9600]
    ],
    congestionLevel: '严重拥堵',
    congestionIndex: 3.5
  },
  {
    id: 'road7',
    name: '南三环',
    coordinates: [
      [116.3000, 39.8500],
      [116.3600, 39.8500],
      [116.4200, 39.8500],
      [116.4800, 39.8500]
    ],
    congestionLevel: '拥堵',
    congestionIndex: 2.3
  },
  {
    id: 'road8',
    name: '北三环',
    coordinates: [
      [116.3000, 39.9600],
      [116.3600, 39.9600],
      [116.4200, 39.9600],
      [116.4800, 39.9600]
    ],
    congestionLevel: '缓行',
    congestionIndex: 1.8
  },
  {
    id: 'road9',
    name: '京藏高速',
    coordinates: [
      [116.3500, 39.9800],
      [116.3300, 40.0300],
      [116.3100, 40.0800],
      [116.2900, 40.1300]
    ],
    congestionLevel: '畅通',
    congestionIndex: 1.0
  },
  {
    id: 'road10',
    name: '京通快速',
    coordinates: [
      [116.4600, 39.9100],
      [116.5200, 39.9100],
      [116.5800, 39.9100],
      [116.6400, 39.9100]
    ],
    congestionLevel: '缓行',
    congestionIndex: 1.7
  },
  {
    id: 'road11',
    name: '西三环',
    coordinates: [
      [116.3000, 39.8400],
      [116.3000, 39.8800],
      [116.3000, 39.9200],
      [116.3000, 39.9600]
    ],
    congestionLevel: '拥堵',
    congestionIndex: 2.4
  },
  {
    id: 'road12',
    name: '阜石路',
    coordinates: [
      [116.1500, 39.9200],
      [116.2200, 39.9200],
      [116.2900, 39.9200],
      [116.3600, 39.9200]
    ],
    congestionLevel: '畅通',
    congestionIndex: 1.2
  },
  {
    id: 'road13',
    name: '朝阳路',
    coordinates: [
      [116.4200, 39.9200],
      [116.4800, 39.9200],
      [116.5400, 39.9200],
      [116.6000, 39.9200]
    ],
    congestionLevel: '拥堵',
    congestionIndex: 2.6
  },
  {
    id: 'road14',
    name: '两广路',
    coordinates: [
      [116.3000, 39.8950],
      [116.3600, 39.8950],
      [116.4200, 39.8950],
      [116.4800, 39.8950]
    ],
    congestionLevel: '畅通',
    congestionIndex: 1.3
  },
  {
    id: 'road15',
    name: '学院路',
    coordinates: [
      [116.3500, 39.9400],
      [116.3500, 39.9800],
      [116.3500, 40.0200],
      [116.3500, 40.0600]
    ],
    congestionLevel: '缓行',
    congestionIndex: 1.9
  },
  {
    id: 'road16',
    name: '建国路',
    coordinates: [
      [116.4100, 39.9050],
      [116.4600, 39.9050],
      [116.5100, 39.9050],
      [116.5600, 39.9050]
    ],
    congestionLevel: '严重拥堵',
    congestionIndex: 3.6
  }
];

export type WarningType = '交通事故' | '道路拥堵' | '车辆故障' | '恶劣天气' | '交通管制';

export interface WarningData {
  id: string;
  location: string;
  type: WarningType;
  level: WarningLevel;
  time: string;
}

export const warningsData: WarningData[] = [
  {
    id: 'w1',
    location: '朝阳区建国门外大街',
    type: '交通事故',
    level: '严重',
    time: '2024-01-15 14:32:15'
  },
  {
    id: 'w2',
    location: '海淀区中关村大街',
    type: '道路拥堵',
    level: '一般',
    time: '2024-01-15 14:28:42'
  },
  {
    id: 'w3',
    location: '东城区王府井步行街',
    type: '交通管制',
    level: '轻微',
    time: '2024-01-15 14:25:10'
  },
  {
    id: 'w4',
    location: '西城区西单北大街',
    type: '车辆故障',
    level: '严重',
    time: '2024-01-15 14:20:33'
  },
  {
    id: 'w5',
    location: '丰台区南三环西路',
    type: '道路拥堵',
    level: '一般',
    time: '2024-01-15 14:15:58'
  },
  {
    id: 'w6',
    location: '通州区新华大街',
    type: '恶劣天气',
    level: '轻微',
    time: '2024-01-15 14:10:22'
  },
  {
    id: 'w7',
    location: '昌平区回龙观东大街',
    type: '交通事故',
    level: '一般',
    time: '2024-01-15 14:05:47'
  },
  {
    id: 'w8',
    location: '大兴区亦庄荣华中路',
    type: '道路拥堵',
    level: '严重',
    time: '2024-01-15 14:02:19'
  }
];

export interface SubwayStationData {
  id: string;
  name: string;
  coordinate: [number, number];
  lines: string[];
  isTransfer: boolean;
  passengerFlow: number;
}

export interface SubwayLineData {
  id: string;
  name: string;
  lineNumber: string;
  color: string;
  coordinates: [number, number][];
  stations: string[];
  passengerFlow: number;
  status: '正常' | '延误' | '停运';
}

export const subwayStationsData: SubwayStationData[] = [
  { id: 's1_1', name: '苹果园', coordinate: [116.1800, 39.9100], lines: ['1号线'], isTransfer: false, passengerFlow: 45000 },
  { id: 's1_2', name: '五棵松', coordinate: [116.2500, 39.9100], lines: ['1号线'], isTransfer: false, passengerFlow: 52000 },
  { id: 's1_3', name: '西单', coordinate: [116.3200, 39.9100], lines: ['1号线', '4号线'], isTransfer: true, passengerFlow: 98000 },
  { id: 's1_4', name: '天安门东', coordinate: [116.3900, 39.9100], lines: ['1号线'], isTransfer: false, passengerFlow: 67000 },
  { id: 's1_5', name: '王府井', coordinate: [116.4600, 39.9100], lines: ['1号线'], isTransfer: false, passengerFlow: 72000 },
  { id: 's1_6', name: '四惠', coordinate: [116.5300, 39.9100], lines: ['1号线'], isTransfer: false, passengerFlow: 58000 },
  
  { id: 's2_1', name: '崇文门', coordinate: [116.4100, 39.8950], lines: ['2号线', '5号线'], isTransfer: true, passengerFlow: 89000 },
  { id: 's2_2', name: '北京站', coordinate: [116.4250, 39.9050], lines: ['2号线'], isTransfer: false, passengerFlow: 76000 },
  { id: 's2_3', name: '朝阳门', coordinate: [116.4300, 39.9250], lines: ['2号线', '6号线'], isTransfer: true, passengerFlow: 82000 },
  { id: 's2_4', name: '东四十条', coordinate: [116.4200, 39.9350], lines: ['2号线'], isTransfer: false, passengerFlow: 55000 },
  { id: 's2_5', name: '雍和宫', coordinate: [116.4100, 39.9450], lines: ['2号线', '5号线'], isTransfer: true, passengerFlow: 71000 },
  { id: 's2_6', name: '安定门', coordinate: [116.3950, 39.9500], lines: ['2号线'], isTransfer: false, passengerFlow: 48000 },
  { id: 's2_7', name: '鼓楼大街', coordinate: [116.3800, 39.9450], lines: ['2号线', '8号线'], isTransfer: true, passengerFlow: 63000 },
  { id: 's2_8', name: '西直门', coordinate: [116.3500, 39.9350], lines: ['2号线', '4号线'], isTransfer: true, passengerFlow: 102000 },
  { id: 's2_9', name: '阜成门', coordinate: [116.3500, 39.9200], lines: ['2号线'], isTransfer: false, passengerFlow: 52000 },
  { id: 's2_10', name: '复兴门', coordinate: [116.3550, 39.9050], lines: ['2号线', '1号线'], isTransfer: true, passengerFlow: 95000 },
  { id: 's2_11', name: '宣武门', coordinate: [116.3700, 39.8950], lines: ['2号线', '4号线'], isTransfer: true, passengerFlow: 88000 },
  { id: 's2_12', name: '前门', coordinate: [116.3950, 39.8950], lines: ['2号线'], isTransfer: false, passengerFlow: 67000 },
  
  { id: 's4_1', name: '公益西桥', coordinate: [116.3500, 39.7800], lines: ['4号线'], isTransfer: false, passengerFlow: 38000 },
  { id: 's4_2', name: '角门西', coordinate: [116.3500, 39.8400], lines: ['4号线', '10号线'], isTransfer: true, passengerFlow: 75000 },
  { id: 's4_3', name: '动物园', coordinate: [116.3500, 39.9350], lines: ['4号线'], isTransfer: false, passengerFlow: 58000 },
  { id: 's4_4', name: '人民大学', coordinate: [116.3500, 39.9600], lines: ['4号线'], isTransfer: false, passengerFlow: 62000 },
  { id: 's4_5', name: '中关村', coordinate: [116.3500, 40.0200], lines: ['4号线'], isTransfer: false, passengerFlow: 81000 },
  
  { id: 's5_1', name: '宋家庄', coordinate: [116.4100, 39.8000], lines: ['5号线', '10号线'], isTransfer: true, passengerFlow: 92000 },
  { id: 's5_2', name: '磁器口', coordinate: [116.4100, 39.8900], lines: ['5号线', '7号线'], isTransfer: true, passengerFlow: 68000 },
  { id: 's5_3', name: '东单', coordinate: [116.4100, 39.9100], lines: ['5号线', '1号线'], isTransfer: true, passengerFlow: 91000 },
  { id: 's5_4', name: '北新桥', coordinate: [116.4100, 39.9400], lines: ['5号线'], isTransfer: false, passengerFlow: 54000 },
  { id: 's5_5', name: '和平西桥', coordinate: [116.4100, 39.9800], lines: ['5号线', '10号线'], isTransfer: true, passengerFlow: 73000 },
  { id: 's5_6', name: '天通苑北', coordinate: [116.4100, 40.0400], lines: ['5号线'], isTransfer: false, passengerFlow: 65000 },
  
  { id: 's10_1', name: '公主坟', coordinate: [116.3000, 39.9100], lines: ['10号线', '1号线'], isTransfer: true, passengerFlow: 87000 },
  { id: 's10_2', name: '海淀黄庄', coordinate: [116.3200, 39.9800], lines: ['10号线', '4号线'], isTransfer: true, passengerFlow: 94000 },
  { id: 's10_3', name: '知春路', coordinate: [116.3400, 39.9750], lines: ['10号线', '13号线'], isTransfer: true, passengerFlow: 83000 },
  { id: 's10_4', name: '芍药居', coordinate: [116.4300, 39.9700], lines: ['10号线', '13号线'], isTransfer: true, passengerFlow: 79000 },
  { id: 's10_5', name: '国贸', coordinate: [116.4600, 39.9100], lines: ['10号线', '1号线'], isTransfer: true, passengerFlow: 105000 },
  { id: 's10_6', name: '双井', coordinate: [116.4650, 39.8900], lines: ['10号线', '7号线'], isTransfer: true, passengerFlow: 76000 },
  
  { id: 's6_1', name: '金安桥', coordinate: [116.1500, 39.9250], lines: ['6号线'], isTransfer: false, passengerFlow: 42000 },
  { id: 's6_2', name: '车公庄', coordinate: [116.3600, 39.9250], lines: ['6号线', '2号线'], isTransfer: true, passengerFlow: 69000 },
  { id: 's6_3', name: '南锣鼓巷', coordinate: [116.4000, 39.9250], lines: ['6号线', '8号线'], isTransfer: true, passengerFlow: 85000 },
  { id: 's6_4', name: '东大桥', coordinate: [116.4500, 39.9250], lines: ['6号线'], isTransfer: false, passengerFlow: 57000 },
  { id: 's6_5', name: '青年路', coordinate: [116.5000, 39.9250], lines: ['6号线'], isTransfer: false, passengerFlow: 61000 },
  { id: 's6_6', name: '草房', coordinate: [116.5700, 39.9250], lines: ['6号线'], isTransfer: false, passengerFlow: 49000 },
  
  { id: 's8_1', name: '德茂', coordinate: [116.3850, 39.8600], lines: ['8号线'], isTransfer: false, passengerFlow: 35000 },
  { id: 's8_2', name: '珠市口', coordinate: [116.3850, 39.8900], lines: ['8号线', '7号线'], isTransfer: true, passengerFlow: 64000 },
  { id: 's8_3', name: '奥林匹克公园', coordinate: [116.3850, 40.0050], lines: ['8号线', '15号线'], isTransfer: true, passengerFlow: 77000 },
  { id: 's8_4', name: '霍营', coordinate: [116.3850, 40.0400], lines: ['8号线', '13号线'], isTransfer: true, passengerFlow: 80000 }
];

export const subwayLinesData: SubwayLineData[] = [
  {
    id: 'subway1',
    name: '1号线',
    lineNumber: '1',
    color: '#e60012',
    coordinates: [
      [116.1800, 39.9100],
      [116.2500, 39.9100],
      [116.3200, 39.9100],
      [116.3900, 39.9100],
      [116.4600, 39.9100],
      [116.5300, 39.9100]
    ],
    stations: ['苹果园', '五棵松', '西单', '天安门东', '王府井', '四惠'],
    passengerFlow: 856000,
    status: '正常'
  },
  {
    id: 'subway2',
    name: '2号线',
    lineNumber: '2',
    color: '#005baa',
    coordinates: [
      [116.3950, 39.8950],
      [116.4100, 39.8950],
      [116.4250, 39.9050],
      [116.4300, 39.9250],
      [116.4200, 39.9350],
      [116.4100, 39.9450],
      [116.3950, 39.9500],
      [116.3800, 39.9450],
      [116.3500, 39.9350],
      [116.3500, 39.9200],
      [116.3550, 39.9050],
      [116.3700, 39.8950],
      [116.3950, 39.8950]
    ],
    stations: ['前门', '崇文门', '北京站', '朝阳门', '东四十条', '雍和宫', '安定门', '鼓楼大街', '西直门', '阜成门', '复兴门', '宣武门'],
    passengerFlow: 723000,
    status: '正常'
  },
  {
    id: 'subway3',
    name: '4号线',
    lineNumber: '4',
    color: '#009b85',
    coordinates: [
      [116.3500, 39.7800],
      [116.3500, 39.8400],
      [116.3500, 39.9100],
      [116.3500, 39.9350],
      [116.3500, 39.9600],
      [116.3500, 40.0200]
    ],
    stations: ['公益西桥', '角门西', '西单', '动物园', '人民大学', '中关村'],
    passengerFlow: 945000,
    status: '延误'
  },
  {
    id: 'subway4',
    name: '5号线',
    lineNumber: '5',
    color: '#a50085',
    coordinates: [
      [116.4100, 39.8000],
      [116.4100, 39.8900],
      [116.4100, 39.9100],
      [116.4100, 39.9400],
      [116.4100, 39.9800],
      [116.4100, 40.0400]
    ],
    stations: ['宋家庄', '磁器口', '东单', '北新桥', '和平西桥', '天通苑北'],
    passengerFlow: 678000,
    status: '正常'
  },
  {
    id: 'subway5',
    name: '10号线',
    lineNumber: '10',
    color: '#0085c8',
    coordinates: [
      [116.3500, 39.8500],
      [116.4100, 39.8500],
      [116.4600, 39.8900],
      [116.4600, 39.9100],
      [116.4300, 39.9700],
      [116.3400, 39.9750],
      [116.3000, 39.9100],
      [116.3500, 39.8500]
    ],
    stations: ['角门西', '宋家庄', '双井', '国贸', '芍药居', '知春路', '海淀黄庄', '公主坟'],
    passengerFlow: 1234000,
    status: '正常'
  },
  {
    id: 'subway6',
    name: '6号线',
    lineNumber: '6',
    color: '#d98700',
    coordinates: [
      [116.1500, 39.9250],
      [116.3600, 39.9250],
      [116.4000, 39.9250],
      [116.4300, 39.9250],
      [116.4500, 39.9250],
      [116.5000, 39.9250],
      [116.5700, 39.9250]
    ],
    stations: ['金安桥', '车公庄', '南锣鼓巷', '朝阳门', '东大桥', '青年路', '草房'],
    passengerFlow: 892000,
    status: '正常'
  },
  {
    id: 'subway7',
    name: '8号线',
    lineNumber: '8',
    color: '#00964b',
    coordinates: [
      [116.3850, 39.8600],
      [116.3850, 39.8900],
      [116.3850, 39.9250],
      [116.3850, 40.0050],
      [116.3850, 40.0400]
    ],
    stations: ['德茂', '珠市口', '南锣鼓巷', '鼓楼大街', '奥林匹克公园', '霍营'],
    passengerFlow: 567000,
    status: '正常'
  }
];

export interface HourlyTrafficData {
  hour: string;
  flow: number;
}

export const hourlyTrafficData: HourlyTrafficData[] = [
  { hour: '00:00', flow: 12500 },
  { hour: '01:00', flow: 8200 },
  { hour: '02:00', flow: 5600 },
  { hour: '03:00', flow: 4100 },
  { hour: '04:00', flow: 3800 },
  { hour: '05:00', flow: 7200 },
  { hour: '06:00', flow: 18500 },
  { hour: '07:00', flow: 42300 },
  { hour: '08:00', flow: 68500 },
  { hour: '09:00', flow: 56200 },
  { hour: '10:00', flow: 41800 },
  { hour: '11:00', flow: 38500 },
  { hour: '12:00', flow: 45200 },
  { hour: '13:00', flow: 42800 },
  { hour: '14:00', flow: 39600 },
  { hour: '15:00', flow: 44100 },
  { hour: '16:00', flow: 52300 },
  { hour: '17:00', flow: 72500 },
  { hour: '18:00', flow: 65800 },
  { hour: '19:00', flow: 48200 },
  { hour: '20:00', flow: 36500 },
  { hour: '21:00', flow: 28900 },
  { hour: '22:00', flow: 21200 },
  { hour: '23:00', flow: 15600 }
];

export interface DistrictTrafficData {
  district: string;
  flow: number;
  congestion: number;
}

export const districtTrafficData: DistrictTrafficData[] = [
  { district: '朝阳区', flow: 185600, congestion: 2.8 },
  { district: '海淀区', flow: 162300, congestion: 2.5 },
  { district: '丰台区', flow: 128500, congestion: 2.1 },
  { district: '东城区', flow: 95200, congestion: 3.2 },
  { district: '西城区', flow: 102800, congestion: 3.0 },
  { district: '通州区', flow: 78600, congestion: 1.8 },
  { district: '大兴区', flow: 65400, congestion: 1.6 },
  { district: '昌平区', flow: 72300, congestion: 1.9 }
];
