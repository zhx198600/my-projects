import { Card, Typography } from 'antd'
import './index.scss'

const { Title, Paragraph } = Typography

function Home() {
  return (
    <div className="home-container">
      <Card className="welcome-card">
        <Title level={2}>欢迎使用数据可视化大屏</Title>
        <Paragraph>
          这是一个基于 React + TypeScript + Vite + Ant Design 的数据可视化项目。
        </Paragraph>
        <Paragraph>
          项目已集成以下技术栈：
        </Paragraph>
        <ul>
          <li>React 19 + TypeScript</li>
          <li>Vite 6 构建工具</li>
          <li>Ant Design 5 UI 组件库</li>
          <li>React Router 7 路由管理</li>
          <li>Zustand 状态管理</li>
          <li>ECharts 图表库</li>
          <li>Sass/SCSS 样式预处理器</li>
        </ul>
      </Card>
    </div>
  )
}

export default Home
