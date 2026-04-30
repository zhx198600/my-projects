const { mockData, getNextId } = require('../data/mockData');

let pool = {
  query: async (sql, params) => {
    console.log('Mock DB Query:', sql.substring(0, 100) + '...');
    return [];
  },
  getConnection: async () => {
    return {
      query: async () => [],
      release: () => {}
    };
  }
};

async function query(sql, params) {
  return [];
}

async function getConnection() {
  return {
    query: async () => [],
    release: () => {}
  };
}

async function testConnection() {
  console.log('使用Mock数据库模式，跳过真实数据库连接');
  return true;
}

module.exports = {
  mockData,
  getNextId,
  pool,
  query,
  getConnection,
  testConnection
};
