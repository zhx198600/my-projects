const express = require('express');
const cors = require('cors');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const { initDb, getDb } = require('./db');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

app.get('/', (req, res) => {
  res.json({ message: '防晒衣销售数据可视化平台 API 服务已启动' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

function normalizeDate(dateStr) {
  if (!dateStr) return null;
  
  const cleanDate = dateStr.trim();
  
  if (/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(cleanDate)) {
    const [year, month, day] = cleanDate.split('/');
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
  
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(cleanDate)) {
    const [year, month, day] = cleanDate.split('-');
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
  
  return cleanDate;
}

function getRowValue(row, possibleKeys) {
  for (const key of possibleKeys) {
    if (row[key] !== undefined) {
      return row[key];
    }
    const trimmedKey = key.trim();
    for (const rowKey of Object.keys(row)) {
      if (rowKey.trim() === trimmedKey) {
        return row[rowKey];
      }
    }
  }
  return undefined;
}

app.post('/api/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: '未上传文件'
    });
  }

  const filePath = req.file.path;
  const results = [];
  let successCount = 0;
  let failCount = 0;
  const errors = [];

  try {
    const db = await getDb();

    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', resolve)
        .on('error', reject);
    });

    if (results.length === 0) {
      fs.unlinkSync(filePath);
      return res.json({
        success: true,
        total: 0,
        successCount: 0,
        failCount: 0,
        message: 'CSV文件为空'
      });
    }

    await db.run('DELETE FROM sales');

    const stmt = await db.prepare(
      'INSERT INTO sales (date, region, product, quantity, amount) VALUES (?, ?, ?, ?, ?)'
    );

    for (let i = 0; i < results.length; i++) {
      const row = results[i];
      try {
        const rawDate = getRowValue(row, ['date', '日期', 'Date']);
        const rawRegion = getRowValue(row, ['region', '地区', 'Region']);
        const rawProduct = getRowValue(row, ['product', '商品', 'Product', '商品名称']);
        const rawQuantity = getRowValue(row, ['quantity', '数量', 'Quantity', '销售数量']);
        const rawAmount = getRowValue(row, ['amount', '金额', 'Amount', '销售金额']);

        const date = normalizeDate(rawDate);
        const region = rawRegion?.trim();
        const product = rawProduct?.trim();
        const quantity = parseInt(String(rawQuantity).trim(), 10);
        const amount = parseFloat(String(rawAmount).trim());

        if (!date || !region || !product || isNaN(quantity) || isNaN(amount)) {
          failCount++;
          errors.push(`行${i + 1}: 字段缺失或格式错误`);
          continue;
        }

        await stmt.run(date, region, product, quantity, amount);
        successCount++;
      } catch (err) {
        failCount++;
        errors.push(`行${i + 1}: ${err.message}`);
      }
    }

    await stmt.finalize();

    fs.unlinkSync(filePath);

    res.json({
      success: true,
      total: results.length,
      successCount,
      failCount,
      message: failCount > 0 ? `导入完成，${failCount}条数据格式错误` : '导入完成',
      errors: errors.slice(0, 10)
    });
  } catch (error) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    res.status(500).json({
      success: false,
      message: '导入失败: ' + error.message
    });
  }
});

function buildFilterQuery(query) {
  const whereClauses = [];
  const params = [];

  if (query.startDate) {
    whereClauses.push('date >= ?');
    params.push(query.startDate);
  }

  if (query.endDate) {
    whereClauses.push('date <= ?');
    params.push(query.endDate);
  }

  if (query.regions) {
    const regionList = query.regions.split(',').map(r => r.trim());
    const placeholders = regionList.map(() => '?').join(', ');
    whereClauses.push(`region IN (${placeholders})`);
    params.push(...regionList);
  }

  if (query.products) {
    const productList = query.products.split(',').map(p => p.trim());
    const placeholders = productList.map(() => '?').join(', ');
    whereClauses.push(`product IN (${placeholders})`);
    params.push(...productList);
  }

  const whereSql = whereClauses.length > 0 
    ? 'WHERE ' + whereClauses.join(' AND ') 
    : '';

  return { whereSql, params };
}

app.get('/api/stats/time', async (req, res) => {
  try {
    const db = await getDb();
    const { whereSql, params } = buildFilterQuery(req.query);
    const groupBy = req.query.groupBy === 'month' ? 'month' : 'day';

    let dateFormat, groupField;
    if (groupBy === 'month') {
      dateFormat = '%Y-%m';
      groupField = "strftime('%Y-%m', date)";
    } else {
      dateFormat = '%Y-%m-%d';
      groupField = "strftime('%Y-%m-%d', date)";
    }

    const sql = `
      SELECT 
        ${groupField} AS date,
        SUM(amount) AS amount
      FROM sales
      ${whereSql}
      GROUP BY ${groupField}
      ORDER BY date ASC
    `;

    const results = await db.all(sql, params);
    const formattedResults = results.map(row => ({
      date: row.date,
      amount: Math.round(row.amount || 0)
    }));

    res.json(formattedResults);
  } catch (error) {
    console.error('时间统计查询失败:', error);
    res.status(500).json({
      success: false,
      message: '查询失败: ' + error.message
    });
  }
});

app.get('/api/stats/region', async (req, res) => {
  try {
    const db = await getDb();
    const { whereSql, params } = buildFilterQuery(req.query);

    const sql = `
      SELECT 
        region,
        SUM(amount) AS amount
      FROM sales
      ${whereSql}
      GROUP BY region
      ORDER BY amount DESC
    `;

    const results = await db.all(sql, params);
    const formattedResults = results.map(row => ({
      region: row.region,
      amount: Math.round(row.amount || 0)
    }));

    res.json(formattedResults);
  } catch (error) {
    console.error('地区统计查询失败:', error);
    res.status(500).json({
      success: false,
      message: '查询失败: ' + error.message
    });
  }
});

app.get('/api/stats/product', async (req, res) => {
  try {
    const db = await getDb();
    const { whereSql, params } = buildFilterQuery(req.query);

    const sql = `
      SELECT 
        product,
        SUM(quantity) AS quantity
      FROM sales
      ${whereSql}
      GROUP BY product
      ORDER BY quantity DESC
    `;

    const results = await db.all(sql, params);
    const formattedResults = results.map(row => ({
      product: row.product,
      quantity: row.quantity || 0
    }));

    res.json(formattedResults);
  } catch (error) {
    console.error('商品统计查询失败:', error);
    res.status(500).json({
      success: false,
      message: '查询失败: ' + error.message
    });
  }
});

app.get('/api/filters/options', async (req, res) => {
  try {
    const db = await getDb();

    const regionsResult = await db.all('SELECT DISTINCT region FROM sales ORDER BY region');
    const regions = regionsResult.map(row => row.region);

    const productsResult = await db.all('SELECT DISTINCT product FROM sales ORDER BY product');
    const products = productsResult.map(row => row.product);

    const dateRangeResult = await db.get('SELECT MIN(date) as minDate, MAX(date) as maxDate FROM sales');
    const dateRange = {
      minDate: dateRangeResult.minDate,
      maxDate: dateRangeResult.maxDate
    };

    res.json({
      regions,
      products,
      dateRange
    });
  } catch (error) {
    console.error('获取筛选选项失败:', error);
    res.status(500).json({
      success: false,
      message: '获取筛选选项失败: ' + error.message
    });
  }
});

app.get('/api/stats/overview', async (req, res) => {
  try {
    const db = await getDb();
    const { whereSql, params } = buildFilterQuery(req.query);

    const totalResult = await db.get(`
      SELECT 
        COUNT(*) as orderCount,
        SUM(amount) as totalAmount,
        SUM(quantity) as totalQuantity
      FROM sales
      ${whereSql}
    `, params);

    const regionCountResult = await db.get(`
      SELECT COUNT(DISTINCT region) as regionCount
      FROM sales
      ${whereSql}
    `, params);

    const productCountResult = await db.get(`
      SELECT COUNT(DISTINCT product) as productCount
      FROM sales
      ${whereSql}
    `, params);

    res.json({
      totalAmount: Math.round(totalResult.totalAmount || 0),
      orderCount: totalResult.orderCount || 0,
      totalQuantity: totalResult.totalQuantity || 0,
      regionCount: regionCountResult.regionCount || 0,
      productCount: productCountResult.productCount || 0
    });
  } catch (error) {
    console.error('获取统计概览失败:', error);
    res.status(500).json({
      success: false,
      message: '获取统计概览失败: ' + error.message
    });
  }
});

app.get('/api/stats/forecast', async (req, res) => {
  try {
    const db = await getDb();
    const { regions, products } = req.query;
    const { whereSql, params } = buildFilterQuery(req.query);

    const monthData = await db.all(`
      SELECT 
        strftime('%Y-%m', date) as month,
        SUM(quantity) as quantity,
        SUM(amount) as amount
      FROM sales
      ${whereSql}
      GROUP BY strftime('%Y-%m', date)
      ORDER BY month ASC
    `, params);

    if (monthData.length === 0) {
      return res.json({
        historical: [],
        forecast: [],
        totalForecast: { quantity: 0, amount: 0 }
      });
    }

    const productMonthData = await db.all(`
      SELECT 
        product,
        strftime('%Y-%m', date) as month,
        SUM(quantity) as quantity,
        SUM(amount) as amount
      FROM sales
      ${whereSql}
      GROUP BY product, strftime('%Y-%m', date)
      ORDER BY product, month ASC
    `, params);

    const productsList = [...new Set(productMonthData.map(d => d.product))];
    
    const lastMonth = monthData[monthData.length - 1].month;
    const [year, month] = lastMonth.split('-').map(Number);
    const nextMonthDate = new Date(year, month, 1);
    const nextMonth = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}`;

    function forecastNextMonth(data) {
      if (data.length === 0) return { quantity: 0, amount: 0 };
      if (data.length === 1) return { quantity: data[0].quantity, amount: data[0].amount };
      
      const recent = data.slice(-Math.min(3, data.length));
      const weights = recent.map((_, i) => i + 1);
      const totalWeight = weights.reduce((a, b) => a + b, 0);
      
      const weightedQty = recent.reduce((sum, d, i) => sum + d.quantity * weights[i], 0) / totalWeight;
      const weightedAmt = recent.reduce((sum, d, i) => sum + d.amount * weights[i], 0) / totalWeight;
      
      const trend = data.length >= 2 ? 
        (data[data.length - 1].quantity - data[0].quantity) / data.length : 0;
      
      return {
        quantity: Math.round(weightedQty + trend * 0.5),
        amount: Math.round(weightedAmt + trend * (weightedAmt / weightedQty) * 0.5)
      };
    }

    const productForecast = productsList.map(product => {
      const productData = productMonthData.filter(d => d.product === product);
      const forecast = forecastNextMonth(productData);
      const lastMonthData = productData.find(d => d.month === lastMonth) || { quantity: 0, amount: 0 };
      return {
        product,
        lastMonth: {
          quantity: lastMonthData.quantity,
          amount: lastMonthData.amount
        },
        nextMonth: {
          month: nextMonth,
          quantity: forecast.quantity,
          amount: forecast.amount
        },
        growth: lastMonthData.quantity > 0 ? 
          Math.round(((forecast.quantity - lastMonthData.quantity) / lastMonthData.quantity) * 100) : 0
      };
    });

    const totalForecast = forecastNextMonth(monthData);
    const lastMonthTotal = monthData[monthData.length - 1];

    res.json({
      historical: monthData.map(d => ({
        month: d.month,
        quantity: d.quantity,
        amount: d.amount,
        type: 'actual'
      })),
      productForecast,
      totalForecast: {
        month: nextMonth,
        quantity: totalForecast.quantity,
        amount: totalForecast.amount,
        lastMonthQuantity: lastMonthTotal.quantity,
        lastMonthAmount: lastMonthTotal.amount,
        growth: lastMonthTotal.quantity > 0 ? 
          Math.round(((totalForecast.quantity - lastMonthTotal.quantity) / lastMonthTotal.quantity) * 100) : 0
      }
    });
  } catch (error) {
    console.error('预测查询失败:', error);
    res.status(500).json({
      success: false,
      message: '查询失败: ' + error.message
    });
  }
});

app.get('/api/stats/anomalies', async (req, res) => {
  try {
    const db = await getDb();
    const { regions, products, threshold = 30 } = req.query;
    const thresholdValue = parseFloat(threshold) || 30;
    const { whereSql, params } = buildFilterQuery(req.query);

    const dailyData = await db.all(`
      SELECT 
        date,
        product,
        region,
        quantity,
        amount
      FROM sales
      ${whereSql}
      ORDER BY date ASC
    `, params);

    if (dailyData.length < 5) {
      return res.json({
        anomalies: [],
        totalAnomalies: 0,
        threshold: thresholdValue
      });
    }

    const productDailyData = {};
    dailyData.forEach(row => {
      const key = `${row.product}|${row.region}`;
      if (!productDailyData[key]) {
        productDailyData[key] = [];
      }
      productDailyData[key].push(row);
    });

    function detectAnomalies(data, threshold) {
      const anomalies = [];
      if (data.length < 5) return anomalies;

      for (let i = 2; i < data.length; i++) {
        const current = data[i];
        const prev1 = data[i - 1];
        const prev2 = data[i - 2];
        
        const avgPrev = (prev1.quantity + prev2.quantity) / 2;
        
        if (avgPrev > 0) {
          const changePercent = ((current.quantity - avgPrev) / avgPrev) * 100;
          
          if (Math.abs(changePercent) >= threshold) {
            anomalies.push({
              date: current.date,
              product: current.product,
              region: current.region,
              quantity: current.quantity,
              amount: current.amount,
              prevQuantity: Math.round(avgPrev),
              changePercent: Math.round(changePercent),
              type: changePercent > 0 ? 'surge' : 'drop'
            });
          }
        }
      }
      return anomalies;
    }

    let allAnomalies = [];
    Object.values(productDailyData).forEach(data => {
      allAnomalies = allAnomalies.concat(detectAnomalies(data, thresholdValue));
    });

    allAnomalies.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      anomalies: allAnomalies,
      totalAnomalies: allAnomalies.length,
      threshold: thresholdValue,
      surgeCount: allAnomalies.filter(a => a.type === 'surge').length,
      dropCount: allAnomalies.filter(a => a.type === 'drop').length
    });
  } catch (error) {
    console.error('异常查询失败:', error);
    res.status(500).json({
      success: false,
      message: '查询失败: ' + error.message
    });
  }
});

async function startServer() {
  try {
    await initDb();
    app.listen(PORT, () => {
      console.log(`服务器运行在 http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('服务器启动失败:', error);
    process.exit(1);
  }
}

startServer();
