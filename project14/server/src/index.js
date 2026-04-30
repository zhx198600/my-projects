import express from 'express';
import cors from 'cors';
import routes from './routes.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api', routes);

app.get('/', (req, res) => {
  res.json({ 
    message: '流程编排平台 API',
    endpoints: {
      login: 'POST /api/login',
      currentRole: 'GET /api/current-role',
      applications: {
        pending: 'GET /api/applications/pending',
        my: 'GET /api/applications/my',
        cc: 'GET /api/applications/cc',
        detail: 'GET /api/applications/:id',
        create: 'POST /api/applications',
        approve: 'PUT /api/applications/:id/approve',
        reject: 'PUT /api/applications/:id/reject',
        cc: 'PUT /api/applications/:id/cc',
      }
    }
  });
});

app.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`  流程编排平台后端服务已启动`);
  console.log(`========================================`);
  console.log(`  本地地址: http://localhost:${PORT}`);
  console.log(`  API 文档: http://localhost:${PORT}/`);
  console.log(`========================================\n`);
});
