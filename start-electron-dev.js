#!/usr/bin/env node

/**
 * 开发环境Electron启动脚本
 * 不依赖wait-on和concurrently，内置等待逻辑
 */

import { spawn } from 'child_process'
import http from 'http'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('🚀 启动Live2D桌面宠物开发环境...')

let viteProcess = null
let electronProcess = null

// 启动Vite开发服务器
function startViteServer() {
  console.log('📦 启动Vite开发服务器...')
  
  viteProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'pipe',
    shell: true,
    cwd: __dirname
  })

  viteProcess.stdout.on('data', (data) => {
    const output = data.toString()
    console.log('[Vite]', output.trim())
    
    // 检测服务器启动成功
    if (output.includes('Local:') && output.includes('localhost:5174') && !electronProcess) {
      console.log('✅ Vite服务器启动成功')
      // 等待一秒后启动Electron
      setTimeout(startElectronDirectly, 1000)
    }
  })

  viteProcess.stderr.on('data', (data) => {
    console.error('[Vite Error]', data.toString().trim())
  })

  viteProcess.on('close', (code) => {
    console.log(`[Vite] 进程退出，退出码: ${code}`)
    if (electronProcess) {
      electronProcess.kill()
    }
  })
}

// 检查服务器是否可用
function checkServer(url, callback, maxAttempts = 30) {
  let attempts = 0
  
  function check() {
    attempts++
    console.log(`🔍 检查服务器状态 (${attempts}/${maxAttempts})...`)
    
    const req = http.get(url, (res) => {
      console.log('✅ 服务器响应正常')
      callback(true)
    })
    
    req.on('error', (err) => {
      if (attempts >= maxAttempts) {
        console.error('❌ 服务器启动超时')
        callback(false)
      } else {
        setTimeout(check, 1000)
      }
    })
    
    req.setTimeout(1000, () => {
      req.destroy()
      if (attempts >= maxAttempts) {
        console.error('❌ 服务器启动超时')
        callback(false)
      } else {
        setTimeout(check, 1000)
      }
    })
  }
  
  check()
}

// 直接启动Electron（无需重复检查）
function startElectronDirectly() {
  console.log('🖥️ 启动Electron桌面应用...')

  // 设置开发环境
  const env = {
    ...process.env,
    NODE_ENV: 'development'
  }

  electronProcess = spawn('node', ['start-electron.js'], {
    stdio: 'inherit',
    shell: true,
    cwd: __dirname,
    env: env
  })

  electronProcess.on('close', (code) => {
    console.log(`[Electron] 进程退出，退出码: ${code}`)
    if (viteProcess) {
      viteProcess.kill()
    }
    process.exit(code)
  })

  electronProcess.on('error', (err) => {
    console.error('[Electron Error]', err.message)
    if (viteProcess) {
      viteProcess.kill()
    }
    process.exit(1)
  })
}

// 启动Electron（带服务器检查）
function startElectron() {
  console.log('🔍 等待服务器完全就绪...')

  checkServer('http://localhost:5174', (success) => {
    if (!success) {
      console.error('❌ 无法连接到开发服务器')
      process.exit(1)
      return
    }

    startElectronDirectly()
  })
}

// 处理进程信号
process.on('SIGINT', () => {
  console.log('\n🛑 收到中断信号，正在关闭所有进程...')
  if (electronProcess) electronProcess.kill('SIGINT')
  if (viteProcess) viteProcess.kill('SIGINT')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\n🛑 收到终止信号，正在关闭所有进程...')
  if (electronProcess) electronProcess.kill('SIGTERM')
  if (viteProcess) viteProcess.kill('SIGTERM')
  process.exit(0)
})

// 启动开发环境
startViteServer()
