// 测试用简化组件
export default function TestApp() {
  return (
    <div style={{ padding: '40px', fontSize: '24px' }}>
      <h1>✅ 测试页面加载成功！</h1>
      <p>如果看到这个，说明 React 渲染正常</p>
      <p style={{ color: 'green' }}>后端 API 配置：8081 (应该是 8080)</p>
    </div>
  )
}
