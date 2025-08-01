/**
 * Live2D 桌面宠物 - Electron 主进程
 *
 * 功能特性:
 * - 透明无边框窗口
 * - 始终置顶显示
 * - 全窗口拖拽支持
 * - 系统托盘集成
 * - 位置记忆保存
 */

const { app, BrowserWindow, Tray, Menu, ipcMain, screen, dialog } = require('electron')
const { autoUpdater } = require('electron-updater')
const path = require('path')
const fs = require('fs')

// 应用配置
const CONFIG = {
  // 窗口默认配置
  window: {
    width: 300,
    height: 400,
    defaultPosition: { x: -1, y: -1 }, // -1 表示使用默认位置（右下角）
  },
  // 配置文件路径
  configPath: path.join(app.getPath('userData'), 'live2d-pet-config.json'),
  // 是否开发模式
  isDev: process.env.NODE_ENV === 'development',
  // 自动更新配置
  autoUpdate: {
    enabled: !process.env.NODE_ENV === 'development',
    checkInterval: 24 * 60 * 60 * 1000, // 24小时检查一次
    allowPrerelease: false
  }
}

// 全局变量
let mainWindow = null
let tray = null
let windowConfig = {}

/**
 * 加载窗口配置
 * 从配置文件中读取窗口位置、大小等设置
 */
function loadWindowConfig() {
  try {
    if (fs.existsSync(CONFIG.configPath)) {
      const configData = fs.readFileSync(CONFIG.configPath, 'utf8')
      windowConfig = JSON.parse(configData)
      console.log('已加载窗口配置:', windowConfig)
    } else {
      // 使用默认配置
      windowConfig = {
        x: CONFIG.window.defaultPosition.x,
        y: CONFIG.window.defaultPosition.y,
        width: CONFIG.window.width,
        height: CONFIG.window.height,
        alwaysOnTop: true,
        isLocked: false
      }
      console.log('使用默认窗口配置')
    }
  } catch (error) {
    console.error('加载窗口配置失败:', error)
    windowConfig = CONFIG.window
  }
}

/**
 * 保存窗口配置
 * 将当前窗口状态保存到配置文件
 */
function saveWindowConfig() {
  try {
    if (mainWindow && !mainWindow.isDestroyed()) {
      const bounds = mainWindow.getBounds()
      windowConfig = {
        ...windowConfig,
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
        alwaysOnTop: mainWindow.isAlwaysOnTop()
      }

      fs.writeFileSync(CONFIG.configPath, JSON.stringify(windowConfig, null, 2))
      console.log('窗口配置已保存:', windowConfig)
    }
  } catch (error) {
    console.error('保存窗口配置失败:', error)
  }
}

/**
 * 计算默认窗口位置（屏幕右下角）
 */
function calculateDefaultPosition() {
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize

  return {
    x: screenWidth - CONFIG.window.width - 50,  // 距离右边缘50px
    y: screenHeight - CONFIG.window.height - 50 // 距离底边缘50px
  }
}

/**
 * 创建主窗口
 * 配置透明、无边框、置顶的桌面宠物窗口
 */
function createMainWindow() {
  // 计算窗口位置
  let windowPosition = {}
  if (windowConfig.x === -1 || windowConfig.y === -1) {
    windowPosition = calculateDefaultPosition()
  } else {
    windowPosition = { x: windowConfig.x, y: windowConfig.y }
  }

  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    // === 窗口基本配置 ===
    width: windowConfig.width || CONFIG.window.width,
    height: windowConfig.height || CONFIG.window.height,
    x: windowPosition.x,
    y: windowPosition.y,

    // === 桌面宠物特性配置 ===
    transparent: true,           // 透明背景
    frame: false,               // 无边框
    alwaysOnTop: windowConfig.alwaysOnTop !== false, // 始终置顶
    skipTaskbar: true,          // 不显示在任务栏
    resizable: false,           // 不可调整大小
    minimizable: false,         // 不可最小化
    maximizable: false,         // 不可最大化

    // === 窗口行为配置 ===
    show: false,                // 创建时不显示，等待ready-to-show
    focusable: true,            // 可以获得焦点

    // === Web 配置 ===
    webPreferences: {
      nodeIntegration: false,    // 安全：禁用 Node.js 集成
      contextIsolation: true,    // 安全：启用上下文隔离
      enableRemoteModule: false, // 安全：禁用远程模块
      preload: path.join(__dirname, 'preload.cjs'), // 预加载脚本
      webSecurity: !CONFIG.isDev // 开发模式下禁用 web 安全
    },

    // === 图标配置 ===
    icon: path.join(__dirname, '../public/icon.png') // 应用图标
  })

  // === 加载应用内容 ===
  if (CONFIG.isDev) {
    // 开发模式：加载开发服务器
    mainWindow.loadURL('http://localhost:5174')
    // 延迟打开开发者工具，减少启动时的警告
    setTimeout(() => {
      mainWindow.webContents.openDevTools({ mode: 'detach' })
    }, 2000)
  } else {
    // 生产模式：加载构建后的文件
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  // === 窗口事件处理 ===

  // 窗口准备显示时
  mainWindow.once('ready-to-show', () => {
    console.log('窗口准备就绪，开始显示')
    mainWindow.show()

    // 确保窗口在正确位置
    if (windowPosition.x !== undefined && windowPosition.y !== undefined) {
      mainWindow.setPosition(windowPosition.x, windowPosition.y)
    }
  })

  // 窗口关闭时
  mainWindow.on('closed', () => {
    console.log('主窗口已关闭')
    mainWindow = null
  })

  // 窗口移动时保存位置
  mainWindow.on('moved', () => {
    if (!windowConfig.isLocked) {
      saveWindowConfig()
    }
  })

  // 防止窗口被意外关闭
  mainWindow.on('close', (event) => {
    if (!app.isQuiting) {
      event.preventDefault()
      mainWindow.hide()

      // 显示托盘提示
      if (tray) {
        tray.displayBalloon({
          iconType: 'info',
          title: 'Live2D 桌面宠物',
          content: '应用已最小化到系统托盘'
        })
      }
    }
  })

  console.log('主窗口创建完成')
}

/**
 * 创建系统托盘
 * 提供右键菜单和快速操作
 */
function createTray() {
  try {
    // 创建托盘图标
    const trayIconPath = path.join(__dirname, '../public/tray-icon.png')
    tray = new Tray(trayIconPath)

    // 设置托盘提示
    tray.setToolTip('Live2D 桌面宠物')

    // 创建右键菜单
    const contextMenu = Menu.buildFromTemplate([
      {
        label: '显示宠物',
        click: () => {
          if (mainWindow) {
            mainWindow.show()
            mainWindow.focus()
          }
        }
      },
      {
        label: '隐藏宠物',
        click: () => {
          if (mainWindow) {
            mainWindow.hide()
          }
        }
      },
      { type: 'separator' },
      {
        label: '始终置顶',
        type: 'checkbox',
        checked: windowConfig.alwaysOnTop !== false,
        click: (menuItem) => {
          if (mainWindow) {
            mainWindow.setAlwaysOnTop(menuItem.checked)
            windowConfig.alwaysOnTop = menuItem.checked
            saveWindowConfig()
          }
        }
      },
      {
        label: '锁定位置',
        type: 'checkbox',
        checked: windowConfig.isLocked || false,
        click: (menuItem) => {
          windowConfig.isLocked = menuItem.checked
          saveWindowConfig()

          // 通知渲染进程位置锁定状态变化
          if (mainWindow) {
            mainWindow.webContents.send('position-lock-changed', menuItem.checked)
          }
        }
      },
      { type: 'separator' },
      {
        label: '重置位置',
        click: () => {
          if (mainWindow) {
            const defaultPos = calculateDefaultPosition()
            mainWindow.setPosition(defaultPos.x, defaultPos.y)
            saveWindowConfig()
          }
        }
      },
      {
        label: '关于',
        click: () => {
          dialog.showMessageBox(mainWindow, {
            type: 'info',
            title: '关于 Live2D 桌面宠物',
            message: 'Live2D 桌面宠物 v1.0.0',
            detail: '基于 Electron + Vue + PIXI.js 开发\n支持动作、表情、音频播放和口型同步',
            buttons: ['确定']
          })
        }
      },
      { type: 'separator' },
      {
        label: '退出',
        click: () => {
          app.isQuiting = true
          app.quit()
        }
      }
    ])

    // 设置托盘菜单
    tray.setContextMenu(contextMenu)

    // 双击托盘图标显示/隐藏窗口
    tray.on('double-click', () => {
      if (mainWindow) {
        if (mainWindow.isVisible()) {
          mainWindow.hide()
        } else {
          mainWindow.show()
          mainWindow.focus()
        }
      }
    })

    console.log('系统托盘创建完成')
  } catch (error) {
    console.error('创建系统托盘失败:', error)
  }
}

/**
 * 配置自动更新
 */
function setupAutoUpdater() {
  if (!CONFIG.autoUpdate.enabled) {
    console.log('自动更新已禁用')
    return
  }

  // 配置更新服务器
  autoUpdater.setFeedURL({
    provider: 'github',
    owner: 'your-username',
    repo: 'live2d-desktop-pet',
    private: false
  })

  // 自动下载更新
  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = true

  // 更新事件处理
  autoUpdater.on('checking-for-update', () => {
    console.log('正在检查更新...')
  })

  autoUpdater.on('update-available', (info) => {
    console.log('发现新版本:', info.version)

    // 显示更新提示
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: '发现新版本',
      message: `发现新版本 ${info.version}`,
      detail: '是否现在下载更新？',
      buttons: ['下载更新', '稍后提醒', '跳过此版本'],
      defaultId: 0,
      cancelId: 1
    }).then((result) => {
      if (result.response === 0) {
        autoUpdater.downloadUpdate()
      }
    })
  })

  autoUpdater.on('update-not-available', () => {
    console.log('当前已是最新版本')
  })

  autoUpdater.on('error', (err) => {
    console.error('自动更新错误:', err)
  })

  autoUpdater.on('download-progress', (progressObj) => {
    const percent = Math.round(progressObj.percent)
    console.log(`下载进度: ${percent}%`)

    // 更新托盘提示
    if (tray) {
      tray.setToolTip(`Live2D 桌面宠物 - 下载更新中 ${percent}%`)
    }
  })

  autoUpdater.on('update-downloaded', () => {
    console.log('更新下载完成')

    // 重置托盘提示
    if (tray) {
      tray.setToolTip('Live2D 桌面宠物')
    }

    // 提示重启安装
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: '更新已下载',
      message: '更新已下载完成',
      detail: '应用将在下次启动时自动安装更新。是否现在重启？',
      buttons: ['立即重启', '稍后重启'],
      defaultId: 0
    }).then((result) => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall()
      }
    })
  })

  // 启动时检查更新
  setTimeout(() => {
    autoUpdater.checkForUpdatesAndNotify()
  }, 5000) // 延迟5秒检查，避免影响启动速度

  // 定期检查更新
  setInterval(() => {
    autoUpdater.checkForUpdatesAndNotify()
  }, CONFIG.autoUpdate.checkInterval)

  console.log('自动更新已配置')
}

// === 应用事件处理 ===

// 应用准备就绪
app.whenReady().then(() => {
  console.log('Electron 应用启动')

  // 加载配置
  loadWindowConfig()

  // 创建主窗口
  createMainWindow()

  // 创建系统托盘
  createTray()

  // 配置自动更新
  setupAutoUpdater()

  // macOS 特殊处理
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow()
    }
  })
})

// 所有窗口关闭时
app.on('window-all-closed', () => {
  // macOS 上保持应用运行
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// 应用退出前
app.on('before-quit', () => {
  console.log('应用即将退出')
  app.isQuiting = true
  saveWindowConfig()
})

// === IPC 通信处理 ===

// 处理来自渲染进程的消息
ipcMain.handle('get-window-config', () => {
  return windowConfig
})

ipcMain.handle('save-window-config', (event, config) => {
  windowConfig = { ...windowConfig, ...config }
  saveWindowConfig()
  return true
})

ipcMain.handle('toggle-always-on-top', () => {
  if (mainWindow) {
    const currentState = mainWindow.isAlwaysOnTop()
    mainWindow.setAlwaysOnTop(!currentState)
    windowConfig.alwaysOnTop = !currentState
    saveWindowConfig()
    return !currentState
  }
  return false
})

console.log('Electron 主进程初始化完成')
