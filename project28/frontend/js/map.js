const API_BASE_URL = 'http://localhost:8000/api';
const CHINA_GEOJSON_URL = 'https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json';
const PROVINCE_GEOJSON_BASE = 'https://geo.datav.aliyun.com/areas_v3/bound/';

const provinceAdcodeMap = {
    '北京市': '110000',
    '天津市': '120000',
    '河北省': '130000',
    '山西省': '140000',
    '内蒙古自治区': '150000',
    '辽宁省': '210000',
    '吉林省': '220000',
    '黑龙江省': '230000',
    '上海市': '310000',
    '江苏省': '320000',
    '浙江省': '330000',
    '安徽省': '340000',
    '福建省': '350000',
    '江西省': '360000',
    '山东省': '370000',
    '河南省': '410000',
    '湖北省': '420000',
    '湖南省': '430000',
    '广东省': '440000',
    '广西壮族自治区': '450000',
    '海南省': '460000',
    '重庆市': '500000',
    '四川省': '510000',
    '贵州省': '520000',
    '云南省': '530000',
    '西藏自治区': '540000',
    '陕西省': '610000',
    '甘肃省': '620000',
    '青海省': '630000',
    '宁夏回族自治区': '640000',
    '新疆维吾尔自治区': '650000',
    '台湾省': '710000',
    '香港特别行政区': '810000',
    '澳门特别行政区': '820000'
};

let mapChart = null;
let currentLevel = 'national';
let currentProvince = null;
let currentProvinceCode = null;
let refreshInterval = null;
let currentProvinceData = [];
let currentOverviewData = {};
let previousRankData = [];
let refreshCount = 0;
let countdownInterval = null;
let countdownSeconds = 60;

function formatNumberUnit(num) {
    if (num >= 100000000) {
        return {
            value: (num / 100000000).toFixed(2),
            unit: '亿'
        };
    } else if (num >= 10000) {
        return {
            value: (num / 10000).toFixed(2),
            unit: '万'
        };
    }
    return {
        value: num.toLocaleString(),
        unit: ''
    };
}

function createFlipAnimation(element, finalValue, unit) {
    const finalStr = finalValue.toString();
    const digits = finalStr.split('');
    
    element.innerHTML = '';
    
    digits.forEach((digit, index) => {
        const span = document.createElement('span');
        span.className = 'digit';
        span.textContent = digit;
        span.style.animationDelay = `${index * 0.08}s`;
        element.appendChild(span);
    });
    
    if (unit) {
        const unitSpan = document.createElement('span');
        unitSpan.className = 'metric-unit';
        unitSpan.textContent = unit;
        element.appendChild(unitSpan);
    }
}

function animateValue(element, start, end, duration = 1500, formatUnit = false) {
    const range = end - start;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(start + range * easeProgress);
        
        if (formatUnit) {
            const formatted = formatNumberUnit(current);
            createFlipAnimation(element, formatted.value, formatted.unit);
        } else {
            element.textContent = current.toLocaleString();
        }
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

function updateMetrics(data) {
    const metric1 = document.getElementById('metric1');
    const metric2 = document.getElementById('metric2');
    const metric3 = document.getElementById('metric3');
    const metric4 = document.getElementById('metric4');
    
    const start1 = parseInt(metric1.dataset.value || '0');
    const start2 = parseInt(metric2.dataset.value || '0');
    const start3 = parseInt(metric3.dataset.value || '0');
    const start4 = parseInt(metric4.dataset.value || '0');
    
    const end1 = Math.floor(data.totalGMV || 0);
    const end2 = data.totalOrders || 0;
    const end3 = Math.floor(data.avgPrice || 0);
    const end4 = data.onlineUsers || 0;
    
    metric1.dataset.value = end1;
    metric2.dataset.value = end2;
    metric3.dataset.value = end3;
    metric4.dataset.value = end4;
    
    animateValue(metric1, start1, end1, 1500, true);
    animateValue(metric2, start2, end2, 1500, true);
    animateValue(metric3, start3, end3, 1500, false);
    animateValue(metric4, start4, end4, 1500, true);
}

function updateRankList(data) {
    const sortedData = [...data].sort((a, b) => b.value - a.value);
    const rankList = document.getElementById('rankList');
    const maxValue = Math.max(...sortedData.map(d => d.value));
    
    const prevRankMap = {};
    previousRankData.forEach((item, idx) => {
        prevRankMap[item.name] = idx;
    });
    
    rankList.innerHTML = '';
    
    sortedData.slice(0, 10).forEach((item, index) => {
        const rankItem = document.createElement('div');
        rankItem.className = 'rank-item highlight';
        
        let rankClass = 'normal';
        if (index === 0) rankClass = 'top1';
        else if (index === 1) rankClass = 'top2';
        else if (index === 2) rankClass = 'top3';
        
        const prevIndex = prevRankMap[item.name];
        let rankChangeClass = 'same';
        let rankChangeSymbol = '-';
        
        if (prevIndex !== undefined) {
            if (index < prevIndex) {
                rankChangeClass = 'up';
                rankChangeSymbol = '▲';
            } else if (index > prevIndex) {
                rankChangeClass = 'down';
                rankChangeSymbol = '▼';
            }
        }
        
        const progressPercent = ((item.value / maxValue) * 100).toFixed(1);
        const formatted = formatNumberUnit(item.value * 10000);
        
        rankItem.innerHTML = `
            <span class="rank-index ${rankClass}">${index + 1}</span>
            <span class="rank-change ${rankChangeClass}">${rankChangeSymbol}</span>
            <div class="rank-info">
                <span class="rank-name">${item.name}</span>
                <div class="rank-progress-bar">
                    <div class="rank-progress-fill" style="width: ${progressPercent}%"></div>
                </div>
            </div>
            <span class="rank-value">${formatted.value}${formatted.unit}</span>
        `;
        rankList.appendChild(rankItem);
    });
    
    previousRankData = sortedData;
}

function initParticles() {
    const canvas = document.getElementById('particlesBg');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    const particleCount = 100;
    
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 2 + 1,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            color: Math.random() > 0.5 ? 'rgba(255, 0, 102, 0.6)' : 'rgba(0, 242, 255, 0.6)'
        });
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach((p, i) => {
            p.x += p.vx;
            p.y += p.vy;
            
            if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
            
            particles.slice(i + 1).forEach(p2 => {
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 150) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(255, 215, 0, ${0.2 * (1 - dist / 150)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            });
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
    
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

function getMapOption(mapName, data, title, visualMapMax = 50000) {
    return {
        tooltip: {
            trigger: 'item',
            backgroundColor: 'rgba(20, 10, 40, 0.95)',
            borderColor: '#ff0066',
            borderWidth: 2,
            textStyle: {
                color: '#fff',
                fontSize: 14
            },
            formatter: function(params) {
                const formatted = formatNumberUnit((params.value || 0) * 10000);
                return `<strong style="color:#ffd700">${params.name}</strong><br/>交易额: ${formatted.value}${formatted.unit}`;
            },
            extraCssText: 'box-shadow: 0 0 20px rgba(255, 0, 102, 0.5);'
        },
        visualMap: {
            min: 0,
            max: visualMapMax,
            left: 20,
            bottom: 30,
            text: ['高', '低'],
            textStyle: {
                color: '#ffd700',
                fontSize: 12
            },
            inRange: {
                color: ['#1a0a30', '#660066', '#ff0066', '#ffd700']
            },
            calculable: true,
            transition: true,
            duration: 1000,
            itemWidth: 16,
            itemHeight: 120,
            itemGap: 10,
            showLabel: true
        },
        geo: {
            map: mapName,
            roam: true,
            zoom: 1.1,
            center: [104, 36],
            label: {
                show: true,
                color: '#ffd700',
                fontSize: 12,
                fontWeight: 'bold'
            },
            itemStyle: {
                areaColor: 'rgba(26, 10, 48, 0.8)',
                borderColor: '#ff0066',
                borderWidth: 2,
                shadowColor: 'rgba(255, 0, 102, 0.3)',
                shadowBlur: 20
            },
            emphasis: {
                itemStyle: {
                    areaColor: 'rgba(255, 0, 102, 0.6)',
                    shadowColor: 'rgba(255, 215, 0, 0.6)',
                    shadowBlur: 30
                },
                label: {
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: 14
                }
            }
        },
        series: [
            {
                name: '区域数据',
                type: 'map',
                map: mapName,
                geoIndex: 0,
                data: data,
                animationDurationUpdate: 1500,
                animationEasingUpdate: 'cubicOut'
            }
        ]
    };
}

function initChinaMap() {
    initParticles();
    
    const mapDom = document.getElementById('china-map');
    mapChart = echarts.init(mapDom);

    fetch(CHINA_GEOJSON_URL)
        .then(response => response.json())
        .then(chinaJson => {
            console.log('全国地图数据加载完成');
            
            echarts.registerMap('china', chinaJson);
            
            loadNationalData();
            setupMapEvents();
            setupBackButton();
            startAutoRefresh();
            
            console.log('地图初始化完成！');
        })
        .catch(error => {
            console.error('地图数据加载失败:', error);
        });
}

function loadNationalData() {
    console.log('开始加载全国数据...');
    
    Promise.all([
        fetch(`${API_BASE_URL}/overview`).then(res => res.json()),
        fetch(`${API_BASE_URL}/region/national/china`).then(res => res.json())
    ]).then(([overviewRes, regionRes]) => {
        console.log('全国总览数据:', overviewRes);
        console.log('全国区域数据:', regionRes);
        
        currentOverviewData = overviewRes.data || {};
        currentProvinceData = (regionRes.data || []).map(item => ({
            name: item.name,
            value: Math.floor(item.gmv / 10000),
            gmv: item.gmv,
            orders: item.orders,
            code: item.code
        }));
        currentLevel = 'national';
        currentProvince = null;
        currentProvinceCode = null;
        
        updateMetrics(currentOverviewData);
        
        const option = getMapOption('china', currentProvinceData, '全国分布地图', 50000);
        mapChart.setOption(option, true);
        
        updateRankList(currentProvinceData);
        document.getElementById('mapTitle').textContent = '全国分布地图';
        document.getElementById('rankTitle').textContent = '省份排行榜';
        document.querySelector('.refresh-hint').textContent = '💡 点击省份可下钻查看市级数据';
        document.getElementById('backToNationalBtn').style.display = 'none';
        
        console.log('全国地图渲染完成！');
    }).catch(error => {
        console.error('加载全国数据失败:', error);
        loadDefaultData();
    });
}

function loadDefaultData() {
    const defaultProvinceData = [
        {name: '北京市', value: 13763},
        {name: '天津市', value: 19963},
        {name: '河北省', value: 12677},
        {name: '山西省', value: 6548},
        {name: '广东省', value: 20336}
    ];
    
    const defaultOverview = {
        totalGMV: 3990150500,
        totalOrders: 795435,
        avgPrice: 5016,
        onlineUsers: 82004
    };
    
    updateMetrics(defaultOverview);
    const option = getMapOption('china', defaultProvinceData, '全国分布地图', 50000);
    mapChart.setOption(option, true);
    updateRankList(defaultProvinceData);
}

function setupMapEvents() {
    mapChart.on('click', function(params) {
        if (currentLevel === 'national' && params.componentType === 'series') {
            const provinceName = params.name;
            const provinceCode = provinceAdcodeMap[provinceName];
            
            if (provinceCode) {
                console.log(`点击省份: ${provinceName}, 代码: ${provinceCode}`);
                drillDownToProvince(provinceName, provinceCode);
            } else {
                console.log(`该省份暂不支持下钻: ${provinceName}`);
            }
        }
    });
}

function drillDownToProvince(provinceName, provinceCode) {
    console.log(`下钻到 ${provinceName} 市级地图...`);
    
    const geojsonUrl = `${PROVINCE_GEOJSON_BASE}${provinceCode}_full.json`;
    
    Promise.all([
        fetch(geojsonUrl).then(res => res.json()),
        fetch(`${API_BASE_URL}/region/province/${provinceCode}`).then(res => res.json())
    ]).then(([geoJson, regionRes]) => {
        console.log(`${provinceName}地图数据加载完成`);
        console.log(`${provinceName}市级数据:`, regionRes);
        
        const mapName = `province_${provinceCode}`;
        echarts.registerMap(mapName, geoJson);
        
        const cityData = (regionRes.data || []).map(item => ({
            name: item.name,
            value: Math.floor(item.gmv / 10000),
            gmv: item.gmv,
            orders: item.orders,
            code: item.code
        }));
        const maxValue = Math.max(...cityData.map(d => d.value), 10000);
        
        currentLevel = 'province';
        currentProvince = provinceName;
        currentProvinceCode = provinceCode;
        
        const option = getMapOption(mapName, cityData, `${provinceName}分布地图`, maxValue);
        mapChart.setOption(option, true);
        
        updateRankList(cityData);
        document.getElementById('mapTitle').textContent = `${provinceName}分布地图`;
        document.getElementById('rankTitle').textContent = `${provinceName}市排行榜`;
        document.querySelector('.refresh-hint').textContent = '💡 点击右上角按钮返回全国地图';
        document.getElementById('backToNationalBtn').style.display = 'block';
        
        console.log(`${provinceName}市级地图渲染完成！`);
    }).catch(error => {
        console.error(`加载${provinceName}数据失败:`, error);
    });
}

function setupBackButton() {
    const backBtn = document.getElementById('backToNationalBtn');
    backBtn.addEventListener('click', function() {
        console.log('返回全国地图');
        loadNationalData();
    });
}

function updateCountdown() {
    const countdownEl = document.getElementById('refreshCountdown');
    if (countdownEl) {
        countdownEl.textContent = `下次刷新: ${countdownSeconds}秒`;
        countdownEl.style.color = countdownSeconds <= 10 ? '#ff0066' : '#00f2ff';
        countdownEl.style.fontWeight = countdownSeconds <= 10 ? 'bold' : 'normal';
    }
}

function startAutoRefresh() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    
    countdownSeconds = 60;
    updateCountdown();
    
    console.log('===== 数据刷新机制已启动 =====');
    console.log('✓ 正式刷新间隔: 60秒/次');
    console.log('✓ 地图下钻功能: 已启用 (点击省份即可下钻)');
    console.log('✓ 倒计时显示: 已启用 (页面右上角)');
    console.log('=============================');
    
    countdownInterval = setInterval(() => {
        countdownSeconds--;
        updateCountdown();
        
        if (countdownSeconds <= 0) {
            countdownSeconds = 60;
        }
    }, 1000);
    
    refreshInterval = setInterval(() => {
        const time = new Date().toLocaleTimeString();
        console.log(`\n========== [数据自动刷新] ==========`);
        console.log(`刷新时间: ${time}`);
        console.log(`当前视图: ${currentLevel === 'national' ? '全国地图' : currentProvince + ' 市级地图'}`);
        
        if (currentLevel === 'national') {
            refreshNationalData();
        } else if (currentLevel === 'province' && currentProvinceCode) {
            refreshProvinceData();
        }
        
        console.log(`✓ 数据已刷新，地图颜色同步更新`);
        console.log(`====================================`);
    }, 60000);
}

function refreshNationalData() {
    Promise.all([
        fetch(`${API_BASE_URL}/overview`).then(res => res.json()),
        fetch(`${API_BASE_URL}/region/national/china`).then(res => res.json())
    ]).then(([overviewRes, regionRes]) => {
        refreshCount++;
        console.log(`[刷新 ${refreshCount}] 刷新全国数据:`, new Date().toLocaleTimeString());
        
        currentOverviewData = overviewRes.data || {};
        currentProvinceData = (regionRes.data || []).map(item => ({
            name: item.name,
            value: Math.floor(item.gmv / 10000),
            gmv: item.gmv,
            orders: item.orders,
            code: item.code
        }));
        
        updateMetrics(currentOverviewData);
        
        mapChart.setOption({
            series: [{
                data: currentProvinceData
            }]
        });
        
        updateRankList(currentProvinceData);
        document.getElementById('rankTitle').textContent = '省份排行榜';
        console.log(`[刷新 ${refreshCount}] 数据刷新完成！地图颜色已随数据实时更新`);
        
        if (refreshCount >= 5) {
            console.log('✓ 已完成5次数据刷新测试');
        }
    }).catch(error => {
        console.error('刷新数据失败:', error);
    });
}

function refreshProvinceData() {
    fetch(`${API_BASE_URL}/region/province/${currentProvinceCode}`)
        .then(res => res.json())
        .then(regionRes => {
            console.log(`刷新${currentProvince}数据:`, new Date().toLocaleTimeString());
            
            const cityData = (regionRes.data || []).map(item => ({
                name: item.name,
                value: Math.floor(item.gmv / 10000),
                gmv: item.gmv,
                orders: item.orders,
                code: item.code
            }));
            
            mapChart.setOption({
                series: [{
                    data: cityData
                }]
            });
            
            updateRankList(cityData);
            document.getElementById('rankTitle').textContent = `${currentProvince}市排行榜`;
            console.log(`${currentProvince}数据刷新完成！地图颜色已随数据实时更新`);
        }).catch(error => {
            console.error(`刷新${currentProvince}数据失败:`, error);
        });
}

function initMetrics() {
    const metrics = [
        {id: 'metric1', value: 0},
        {id: 'metric2', value: 0},
        {id: 'metric3', value: 0},
        {id: 'metric4', value: 0}
    ];
    
    metrics.forEach(metric => {
        const element = document.getElementById(metric.id);
        element.textContent = '0';
    });
}

window.addEventListener('resize', function() {
    mapChart && mapChart.resize();
});
