#!/usr/bin/env node

/**
 * 纯桌面端启动脚本
 * 不依赖浏览器开发服务器，直接运行Electron桌面应用
 */

const { spawn } = require('child_process')
const path = require('path')
const fs = require('fs')

console.log('🚀 启动Live2D桌面模型应用（纯桌面模式）...')

// 检查是否存在构建文件
const distPath = path.join(__dirname, 'dist')
const indexPath = path.join(distPath, 'index.html')

if (!fs.existsSync(indexPath)) {
  console.log('📦 首次运行，正在构建应用...')

  // 先构建应用
  const buildProcess = spawn('npm', ['run', 'build'], {
    stdio: 'inherit',
    shell: true,
    cwd: __dirname
  })

  buildProcess.on('close', (code) => {
    if (code === 0) {
      console.log('✅ 构建完成，启动桌面应用...')
      startElectron()
    } else {
      console.error('❌ 构建失败，退出码:', code)
      process.exit(1)
    }
  })

  buildProcess.on('error', (err) => {
    console.error('❌ 构建过程出错:', err.message)
    process.exit(1)
  })
} else {
  console.log('✅ 发现已构建文件，直接启动桌面应用...')
  startElectron()
}

function startElectron() {
  // 设置生产模式环境变量
  process.env.NODE_ENV = 'production'

  // 启动Electron
  const electronProcess = spawn('electron', ['.'], {
    stdio: 'inherit',
    shell: true,
    cwd: __dirname,
    env: {
      ...process.env,
      NODE_ENV: 'production'
    }
  })

  electronProcess.on('close', (code) => {
    console.log(`🔚 桌面应用已关闭，退出码: ${code}`)
    process.exit(code)
  })

  electronProcess.on('error', (err) => {
    if (err.code === 'ENOENT') {
      console.error('❌ 未找到Electron，请先安装:')
      console.error('   npm install electron --save-dev')
      console.error('   或者')
      console.error('   pnpm add -D electron')
    } else {
      console.error('❌ 启动Electron时出错:', err.message)
    }
    process.exit(1)
  })
}
