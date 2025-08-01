/**
 * 简单的 Electron 启动脚本
 * 用于在没有完整安装 Electron 依赖的情况下测试基本功能
 */

import { spawn } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function startElectronApp() {
  console.log('🚀 启动 Live2D 桌面宠物应用...')

  // 检查是否安装了 Electron
try {
  // 检查 electron 可执行文件是否存在
  const fs = await import('fs')
  const path = await import('path')

  // 检查 node_modules 中的 electron
  const electronPath = path.join(process.cwd(), 'node_modules', '.bin', 'electron')
  const electronPathCmd = path.join(process.cwd(), 'node_modules', '.bin', 'electron.cmd')

  if (fs.existsSync(electronPath) || fs.existsSync(electronPathCmd)) {
    console.log('✅ 检测到 Electron 已安装')
  } else {
    throw new Error('Electron not found')
  }
} catch (error) {
  console.log('❌ 未检测到 Electron，请先安装依赖:')
  console.log('   npm install electron --save-dev')
  console.log('   或者')
  console.log('   pnpm add -D electron')
  process.exit(1)
}

// 设置环境变量
process.env.NODE_ENV = 'development'

// 启动 Electron 应用
const mainPath = path.join(__dirname, 'electron', 'main.cjs')

console.log('📂 主进程文件:', mainPath)
console.log('🔧 启动模式: 开发模式')

// 使用npx来运行electron，避免安装问题
const electronProcess = spawn('npx', ['electron', mainPath], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    NODE_ENV: 'development'
  }
})

electronProcess.on('close', (code) => {
  console.log(`\n🏁 Electron 进程退出，退出码: ${code}`)
  process.exit(code)
})

electronProcess.on('error', (error) => {
  console.error('❌ 启动 Electron 失败:', error)
  process.exit(1)
})

// 处理进程信号
process.on('SIGINT', () => {
  console.log('\n🛑 收到中断信号，正在关闭应用...')
  electronProcess.kill('SIGINT')
})

process.on('SIGTERM', () => {
  console.log('\n🛑 收到终止信号，正在关闭应用...')
  electronProcess.kill('SIGTERM')
})
}

// 启动应用
startElectronApp().catch(error => {
  console.error('❌ 启动失败:', error)
  process.exit(1)
})
