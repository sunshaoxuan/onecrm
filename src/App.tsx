import { Button, ConfigProvider, theme } from 'antd'
import { Layout } from 'lucide-react'

function App() {
    return (
        <ConfigProvider
            theme={{
                algorithm: theme.defaultAlgorithm,
                token: {
                    colorPrimary: '#137fec',
                    borderRadius: 4,
                },
            }}
        >
            <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50">
                <div className="text-center p-12 bg-white rounded-2xl shadow-xl border border-slate-100">
                    <div className="flex justify-center mb-6 text-primary">
                        <Layout size={48} />
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 mb-4 uppercase tracking-tight">OneCRM</h1>
                    <p className="text-slate-500 mb-8 max-w-md">
                        React + Vite + Ant Design + Tailwind CSS 环境已成功初始化。
                    </p>
                    <div className="space-x-4">
                        <Button type="primary" size="large">立即开始</Button>
                        <Button size="large">访问文档</Button>
                    </div>
                </div>
            </div>
        </ConfigProvider>
    )
}

export default App
