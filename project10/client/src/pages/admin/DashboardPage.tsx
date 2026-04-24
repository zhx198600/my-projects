import { Card, Row, Col, Statistic } from 'antd'
import { BookOutlined, MessageOutlined, UserOutlined, TeamOutlined } from '@ant-design/icons'

const DashboardPage = () => {
  return (
    <div>
      <h3 style={{ marginBottom: 24 }}>欢迎使用客服管理系统</h3>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="知识库条目"
              value={128}
              prefix={<BookOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="对话记录"
              value={256}
              prefix={<MessageOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日对话"
              value={42}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="活跃用户"
              value={16}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
      </Row>
      <Card style={{ marginTop: 24 }} title="系统说明">
        <p>这是一个客服管理系统的仪表板页面，用于展示系统概览信息。</p>
        <ul>
          <li>知识库管理：用于管理客服知识条目，支持添加、编辑、删除操作</li>
          <li>对话记录：用于查看和管理用户与客服的对话历史</li>
        </ul>
      </Card>
    </div>
  )
}

export default DashboardPage
