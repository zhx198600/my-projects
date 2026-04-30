import { useState, useEffect } from 'react'
import MRTSvgMap from './components/MRTSvgMap'

function App() {
  const [currentTime, setCurrentTime] = useState('')
  const [lastRefreshTime, setLastRefreshTime] = useState('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const timeStr = now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      })
      setCurrentTime(timeStr)
    }

    updateTime()
    const timer = setInterval(updateTime, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleRefresh = (timestamp: string) => {
    setLastRefreshTime(timestamp)
  }

  return (
    <div className="w-full min-w-dashboard min-h-dashboard h-full flex flex-col dark dashboard-grid-bg text-dashboard-text-primary">
      <header className="w-full px-8 py-4 bg-dashboard-bg-secondary/80 backdrop-blur-sm border-b border-dashboard-border shadow-glow">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-2 h-10 bg-gradient-to-b from-dashboard-accent to-dashboard-accent-secondary rounded-full shadow-glow"></div>
            <h1 className="text-[clamp(1.5rem,3vw,2.5rem)] font-bold tracking-wider text-shadow-glow bg-gradient-to-r from-dashboard-accent via-white to-dashboard-accent-secondary bg-clip-text text-transparent">
              香港地铁实时监测系统
            </h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 px-5 py-2 bg-dashboard-bg/60 rounded-lg border border-dashboard-border">
              <div className="w-3 h-3 rounded-full bg-dashboard-success status-pulse"></div>
              <span className="text-dashboard-text-secondary text-sm">数据正常</span>
              {lastRefreshTime && (
                <span className="text-dashboard-text-secondary text-xs ml-2">
                  最后刷新: {lastRefreshTime}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 px-5 py-2 bg-dashboard-bg/60 rounded-lg border border-dashboard-border">
              <svg className="w-5 h-5 text-dashboard-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-mono text-lg tracking-wide text-dashboard-text-primary">
                {currentTime}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col overflow-hidden p-6">
        <div className="flex-1 w-full h-full border-gradient rounded-xl bg-dashboard-bg-secondary/30 p-6 overflow-hidden">
          <MRTSvgMap onRefresh={handleRefresh} />
        </div>
      </main>

      <footer className="w-full px-8 py-3 bg-dashboard-bg-secondary/60 border-t border-dashboard-border">
        <div className="w-full flex items-center justify-center gap-4 text-dashboard-text-secondary text-sm">
          <span>© 2024 香港地铁实时监测系统</span>
          <span className="w-1 h-1 rounded-full bg-dashboard-border"></span>
          <span>分辨率自适应 · 深色主题</span>
        </div>
      </footer>
    </div>
  )
}

export default App
