/**
 * Live2D 桌面模型 - Electron 主进程
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

// 模型配置数据 - 从 Vue 组件迁移
const modelConfigs = {
  idol: {
    name: '偶像',
    path: '/models/idol/ldol.model3.json',
    motions: [
      { name: '姿势1', file: '1.motion3.json' }
    ],
    expressions: [
      { name: '问号', file: '1.exp3.json', index: 0 },
      { name: '生气', file: '2.exp3.json', index: 1 },
      { name: '黑脸', file: '3.exp3.json', index: 2 },
      { name: '表情4', file: '4.exp3.json', index: 3 },
      { name: '表情5', file: '5.exp3.json', index: 4 },
      { name: '表情6', file: '6.exp3.json', index: 5 },
      { name: '表情7', file: '7.exp3.json', index: 6 },
      { name: '表情8', file: '8.exp3.json', index: 7 }
    ],
    sounds: []
  },
  lanhei: {
    name: '蓝黑',
    path: '/models/lanhei/lanhei.model3.json',
    motions: [
      { name: '场景1', file: 'Scene1.motion3.json' }
    ],
    expressions: [
      { name: '棒棒糖', file: 'bangbangtang.exp3.json', index: 0 },
      { name: '唱歌', file: 'changge.exp3.json', index: 1 },
      { name: '打游戏', file: 'dayouxi.exp3.json', index: 2 },
      { name: '黑脸', file: 'heilian.exp3.json', index: 3 },
      { name: '黑衣', file: 'heiyi.exp3.json', index: 4 },
      { name: '哭', file: 'ku.exp3.json', index: 5 },
      { name: '脸红', file: 'lianhong.exp3.json', index: 6 },
      { name: '圈圈', file: 'quanquan.exp3.json', index: 7 },
      { name: '生气', file: 'shengqi.exp3.json', index: 8 },
      { name: '手表', file: 'shoubiao.exp3.json', index: 9 },
      { name: '星星', file: 'xingxing.exp3.json', index: 10 }
    ],
    sounds: []
  },
  hibiki: {
    name: 'Hibiki',
    path: '/models/hibiki/hibiki.model3.json',
    motions: [
      { name: '动作1', file: 'hibiki_01.motion3.json', sound: 'sounds/hibiki_01.wav' },
      { name: '动作2', file: 'hibiki_02.motion3.json', sound: 'sounds/hibiki_02.wav' },
      { name: '动作3', file: 'hibiki_03.motion3.json', sound: 'sounds/hibiki_03.wav' },
      { name: '动作4', file: 'hibiki_04.motion3.json', sound: 'sounds/hibiki_04.wav' },
      { name: '动作5', file: 'hibiki_05.motion3.json', sound: 'sounds/hibiki_05.wav' }
    ],
    expressions: [
      { name: '普通', file: 'Normal.exp3.json', index: 0 },
      { name: '生气', file: 'Angry.exp3.json', index: 1 },
      { name: '脸红', file: 'Blushing.exp3.json', index: 2 },
      { name: '悲伤', file: 'Sad.exp3.json', index: 3 },
      { name: '惊讶', file: 'Surprised.exp3.json', index: 4 },
      { name: '特殊', file: 'f01.exp3.json', index: 5 }
    ],
    sounds: [
      { name: '动作1音频', file: 'sounds/hibiki_01.wav' },
      { name: '动作2音频', file: 'sounds/hibiki_02.wav' },
      { name: '动作3音频', file: 'sounds/hibiki_03.wav' },
      { name: '动作4音频', file: 'sounds/hibiki_04.wav' },
      { name: '动作5音频', file: 'sounds/hibiki_05.wav' }
    ]
  },
  hiyori: {
    name: 'Hiyori',
    path: '/models/hiyori/hiyori_free_t08.model3.json',
    motions: [
      { name: '动作1', file: 'hiyori_m01.motion3.json' },
      { name: '动作2', file: 'hiyori_m02.motion3.json' },
      { name: '动作3', file: 'hiyori_m03.motion3.json' },
      { name: '动作4', file: 'hiyori_m04.motion3.json' },
      { name: '动作5', file: 'hiyori_m05.motion3.json' },
      { name: '动作6', file: 'hiyori_m06.motion3.json' },
      { name: '动作7', file: 'hiyori_m07.motion3.json' },
      { name: '动作8', file: 'hiyori_m08.motion3.json' }
    ],
    expressions: [],
    sounds: []
  },
  mark: {
    name: 'Mark',
    path: '/models/mark/mark_free_t04.model3.json',
    motions: [
      { name: '动作1', file: 'mark_m01.motion3.json' },
      { name: '动作2', file: 'mark_m02.motion3.json' },
      { name: '动作3', file: 'mark_m03.motion3.json' },
      { name: '动作4', file: 'mark_m04.motion3.json' },
      { name: '动作5', file: 'mark_m05.motion3.json' },
      { name: '动作6', file: 'mark_m06.motion3.json' }
    ],
    expressions: [],
    sounds: []
  },
  natori: {
    name: 'Natori',
    path: '/models/natori/natori_pro_t06.model3.json',
    motions: [
      { name: '动作0', file: 'mtn_00.motion3.json' },
      { name: '动作1', file: 'mtn_01.motion3.json' },
      { name: '动作2', file: 'mtn_02.motion3.json' },
      { name: '动作3', file: 'mtn_03.motion3.json' },
      { name: '动作4', file: 'mtn_04.motion3.json' },
      { name: '动作5', file: 'mtn_05.motion3.json' },
      { name: '动作6', file: 'mtn_06.motion3.json' },
      { name: '动作7', file: 'mtn_07.motion3.json' }
    ],
    expressions: [
      { name: '普通', file: 'Normal.exp3.json', index: 0 },
      { name: '生气', file: 'Angry.exp3.json', index: 1 },
      { name: '脸红', file: 'Blushing.exp3.json', index: 2 },
      { name: '悲伤', file: 'Sad.exp3.json', index: 3 },
      { name: '微笑', file: 'Smile.exp3.json', index: 4 },
      { name: '惊讶', file: 'Surprised.exp3.json', index: 5 },
      { name: '表情1', file: 'exp_01.exp3.json', index: 6 },
      { name: '表情2', file: 'exp_02.exp3.json', index: 7 },
      { name: '表情3', file: 'exp_03.exp3.json', index: 8 },
      { name: '表情4', file: 'exp_04.exp3.json', index: 9 },
      { name: '表情5', file: 'exp_05.exp3.json', index: 10 }
    ],
    sounds: []
  },
  kei_basic: {
    name: 'Kei Basic',
    path: '/models/kei_basic/kei_basic_free.model3.json',
    motions: [
      { name: '英语', file: '01_kei_en.motion3.json', sound: 'sounds/01_kei_en.wav' },
      { name: '日语', file: '01_kei_jp.motion3.json', sound: 'sounds/01_kei_jp.wav' },
      { name: '韩语', file: '01_kei_ko.motion3.json', sound: 'sounds/01_kei_ko.wav' },
      { name: '中文', file: '01_kei_zh.motion3.json', sound: 'sounds/01_kei_zh.wav' }
    ],
    expressions: [],
    sounds: [
      { name: '英语音频', file: 'sounds/01_kei_en.wav' },
      { name: '日语音频', file: 'sounds/01_kei_jp.wav' },
      { name: '韩语音频', file: 'sounds/01_kei_ko.wav' },
      { name: '中文音频', file: 'sounds/01_kei_zh.wav' }
    ]
  },
  kei_vowels: {
    name: 'Kei Vowels Pro',
    path: '/models/kei_vowels/kei_vowels_pro.model3.json',
    motions: [
      { name: '英语', file: '01_kei_en.motion3.json', sound: 'sounds/01_kei_en.wav' },
      { name: '日语', file: '01_kei_jp.motion3.json', sound: 'sounds/01_kei_jp.wav' },
      { name: '韩语', file: '01_kei_ko.motion3.json', sound: 'sounds/01_kei_ko.wav' },
      { name: '中文', file: '01_kei_zh.motion3.json', sound: 'sounds/01_kei_zh.wav' }
    ],
    expressions: [],
    sounds: [
      { name: '英语音频', file: 'sounds/01_kei_en.wav' },
      { name: '日语音频', file: 'sounds/01_kei_jp.wav' },
      { name: '韩语音频', file: 'sounds/01_kei_ko.wav' },
      { name: '中文音频', file: 'sounds/01_kei_zh.wav' }
    ]
  },
  youyou: {
    name: '悠悠',
    path: '/models/youyou/youyou.model3.json',
    motions: [
      { name: '基础动画', file: 'jichudonghua.motion3.json', group: 'Idle', index: 0 },
      { name: '睡眠', file: 'sleep.motion3.json', group: 'Idle', index: 1 },
      { name: '挥手', file: 'huishou.motion3.json', group: 'TapBody', index: 0 },
      { name: '点头', file: 'diantou.motion3.json', group: 'TapBody', index: 1 },
      { name: '摇头', file: 'yaotou.motion3.json', group: 'TapBody', index: 2 },
      { name: '眼珠子', file: 'yanzhuzi.motion3.json', group: 'TapHead', index: 0 },
      { name: '睡觉', file: 'shuijiao.motion3.json', group: 'TapHead', index: 1 }
    ],
    expressions: [
      { name: '傲娇', file: 'aojiao.exp3.json', index: 0 },
      { name: '抱胸', file: 'baoxiong.exp3.json', index: 1 },
      { name: '叉腰', file: 'chayao.exp3.json', index: 2 },
      { name: '电脑', file: 'diannao.exp3.json', index: 3 },
      { name: '电脑发光', file: 'diannaofaguang.exp3.json', index: 4 },
      { name: '鬼脸', file: 'guilian.exp3.json', index: 5 },
      { name: '哈哈大笑', file: 'hahadadxiao.exp3.json', index: 6 },
      { name: '害羞', file: 'haixiu.exp3.json', index: 7 },
      { name: '挥手表情', file: 'huishou.exp3.json', index: 8 },
      { name: '键盘抬起', file: 'jianpantaiqi.exp3.json', index: 9 },
      { name: '惊喜', file: 'jingxi.exp3.json', index: 10 },
      { name: '惊讶', file: 'jingya.exp3.json', index: 11 },
      { name: '脸红', file: 'lianhong.exp3.json', index: 12 },
      { name: '落泪', file: 'luolei.exp3.json', index: 13 },
      { name: '眯眯眼', file: 'mimiyan.exp3.json', index: 14 },
      { name: '生气', file: 'shengqi.exp3.json', index: 15 },
      { name: '托腮', file: 'tuosai.exp3.json', index: 16 },
      { name: '委屈', file: 'weiqu.exp3.json', index: 17 },
      { name: '温柔的笑', file: 'wenroudexiao.exp3.json', index: 18 }
    ],
    sounds: []
  }
}

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

// 应用状态管理 - 从 Vue 组件迁移
let appState = {
  currentModel: 'idol',
  modelScale: 100,
  opacity: 100,
  isAlwaysOnTop: true,
  isPositionLocked: false,
  isSpeaking: false,
  lipSyncSensitivity: 80,
  selectedMotion: '',
  selectedExpression: ''
}

/**
 * 构建模型选择菜单
 * 动态生成所有可用模型的菜单项
 */
function buildModelMenu() {
  const modelMenuItems = Object.keys(modelConfigs).map(modelKey => ({
    label: modelConfigs[modelKey].name,
    type: 'radio',
    checked: appState.currentModel === modelKey,
    click: () => {
      console.log(`=== 开始切换模型到: ${modelKey} ===`)
      console.log(`切换前状态: 模型=${appState.currentModel}, 表情=${appState.selectedExpression}, 动作=${appState.selectedMotion}`)

      // 更新模型状态
      appState.currentModel = modelKey

      // 重置选中的动作和表情（因为新模型可能没有相同的表情/动作）
      appState.selectedMotion = ''
      appState.selectedExpression = ''

      console.log(`切换后状态: 模型=${appState.currentModel}, 表情=${appState.selectedExpression}, 动作=${appState.selectedMotion}`)

      // 通知渲染进程切换模型
      if (mainWindow) {
        mainWindow.webContents.send('change-model', modelKey)
      }

      // 重新构建菜单以更新表情和动作列表
      console.log('开始重新构建托盘菜单...')
      updateTrayMenu()
      console.log('=== 模型切换完成 ===')
    }
  }))

  return modelMenuItems
}

/**
 * 构建表情选择菜单
 * 根据当前选中的模型动态生成表情菜单项
 */
function buildExpressionMenu() {
  const currentConfig = modelConfigs[appState.currentModel]

  if (!currentConfig) {
    console.log(`警告: 未找到模型配置 ${appState.currentModel}`)
    return [{ label: '模型配置错误', enabled: false }]
  }

  if (!currentConfig.expressions || currentConfig.expressions.length === 0) {
    return [{ label: '当前模型无表情', enabled: false }]
  }
  const expressionMenuItems = currentConfig.expressions.map(expression => ({
    label: expression.name,
    type: 'radio',
    checked: appState.selectedExpression === expression.file,
    click: () => {
      console.log(`切换表情到: ${expression.name}`)
      appState.selectedExpression = expression.file
      // 通知渲染进程播放表情
      if (mainWindow) {
        mainWindow.webContents.send('play-expression', expression.file)
      }
      updateTrayMenu()
    }
  }))

  return expressionMenuItems
}

/**
 * 构建动作选择菜单
 * 根据当前选中的模型动态生成动作菜单项
 */
function buildMotionMenu() {
  const currentConfig = modelConfigs[appState.currentModel]

  if (!currentConfig) {
    console.log(`警告: 未找到模型配置 ${appState.currentModel}`)
    return [{ label: '模型配置错误', enabled: false }]
  }

  if (!currentConfig.motions || currentConfig.motions.length === 0) {
    return [{ label: '当前模型无动作', enabled: false }]
  }
  const motionMenuItems = currentConfig.motions.map(motion => ({
    label: motion.name,
    type: 'radio',
    checked: appState.selectedMotion === motion.file,
    click: () => {
      console.log(`播放动作: ${motion.name}`)
      appState.selectedMotion = motion.file
      // 通知渲染进程播放动作
      if (mainWindow) {
        mainWindow.webContents.send('play-motion', motion.file)
      }
      updateTrayMenu()
    }
  }))

  return motionMenuItems
}

/**
 * 构建口型同步菜单
 * 包含开始说话、停止说话、敏感度设置等选项
 */
function buildLipSyncMenu() {
  return [
    {
      label: '开始说话',
      enabled: !appState.isSpeaking,
      click: () => {
        console.log('开始口型同步')
        appState.isSpeaking = true
        if (mainWindow) {
          mainWindow.webContents.send('start-speaking')
        }
        updateTrayMenu()
      }
    },
    {
      label: '停止说话',
      enabled: appState.isSpeaking,
      click: () => {
        console.log('停止口型同步')
        appState.isSpeaking = false
        if (mainWindow) {
          mainWindow.webContents.send('stop-speaking')
        }
        updateTrayMenu()
      }
    },
    { type: 'separator' },
    {
      label: '敏感度设置',
      submenu: [
        {
          label: '低敏感度 (20)',
          type: 'radio',
          checked: appState.lipSyncSensitivity === 20,
          click: () => {
            appState.lipSyncSensitivity = 20
            if (mainWindow) {
              mainWindow.webContents.send('set-lip-sync-sensitivity', 20)
            }
            updateTrayMenu()
          }
        },
        {
          label: '中等敏感度 (50)',
          type: 'radio',
          checked: appState.lipSyncSensitivity === 50,
          click: () => {
            appState.lipSyncSensitivity = 50
            if (mainWindow) {
              mainWindow.webContents.send('set-lip-sync-sensitivity', 50)
            }
            updateTrayMenu()
          }
        },
        {
          label: '高敏感度 (80)',
          type: 'radio',
          checked: appState.lipSyncSensitivity === 80,
          click: () => {
            appState.lipSyncSensitivity = 80
            if (mainWindow) {
              mainWindow.webContents.send('set-lip-sync-sensitivity', 80)
            }
            updateTrayMenu()
          }
        },
        {
          label: '超高敏感度 (100)',
          type: 'radio',
          checked: appState.lipSyncSensitivity === 100,
          click: () => {
            appState.lipSyncSensitivity = 100
            if (mainWindow) {
              mainWindow.webContents.send('set-lip-sync-sensitivity', 100)
            }
            updateTrayMenu()
          }
        }
      ]
    }
  ]
}

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
 * 配置透明、无边框、置顶的桌面模型窗口
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

    // === 桌面模型特性配置 ===
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
          title: 'Live2D 桌面模型',
          content: '应用已最小化到系统托盘'
        })
      }
    }
  })

  console.log('主窗口创建完成')
}

/**
 * 更新托盘菜单
 * 根据当前应用状态重新构建托盘菜单
 */
function updateTrayMenu() {
  if (!tray) {
    console.log('警告: 托盘对象不存在，无法更新菜单')
    return
  }

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示模型',
      click: () => {
        if (mainWindow) {
          mainWindow.show()
          mainWindow.focus()
        }
      }
    },
    {
      label: '隐藏模型',
      click: () => {
        if (mainWindow) {
          mainWindow.hide()
        }
      }
    },
    { type: 'separator' },
    {
      label: '选择模型',
      submenu: buildModelMenu()
    },
    {
      label: '选择表情',
      submenu: buildExpressionMenu()
    },
    {
      label: '选择动作',
      submenu: buildMotionMenu()
    },
    {
      label: '口型同步',
      submenu: buildLipSyncMenu()
    },
    { type: 'separator' },
    {
      label: '模型设置',
      submenu: [
        {
          label: '模型缩放',
          submenu: [
            {
              label: '50%',
              type: 'radio',
              checked: appState.modelScale === 50,
              click: () => {
                appState.modelScale = 50
                if (mainWindow) {
                  mainWindow.webContents.send('set-model-scale', 0.5)
                }
                updateTrayMenu()
              }
            },
            {
              label: '75%',
              type: 'radio',
              checked: appState.modelScale === 75,
              click: () => {
                appState.modelScale = 75
                if (mainWindow) {
                  mainWindow.webContents.send('set-model-scale', 0.75)
                }
                updateTrayMenu()
              }
            },
            {
              label: '100%',
              type: 'radio',
              checked: appState.modelScale === 100,
              click: () => {
                appState.modelScale = 100
                if (mainWindow) {
                  mainWindow.webContents.send('set-model-scale', 1.0)
                }
                updateTrayMenu()
              }
            },
            {
              label: '150%',
              type: 'radio',
              checked: appState.modelScale === 150,
              click: () => {
                appState.modelScale = 150
                if (mainWindow) {
                  mainWindow.webContents.send('set-model-scale', 1.5)
                }
                updateTrayMenu()
              }
            },
            {
              label: '200%',
              type: 'radio',
              checked: appState.modelScale === 200,
              click: () => {
                appState.modelScale = 200
                if (mainWindow) {
                  mainWindow.webContents.send('set-model-scale', 2.0)
                }
                updateTrayMenu()
              }
            }
          ]
        },
        {
          label: '透明度',
          submenu: [
            {
              label: '20%',
              type: 'radio',
              checked: appState.opacity === 20,
              click: () => {
                appState.opacity = 20
                if (mainWindow) {
                  mainWindow.webContents.send('set-opacity', 0.2)
                }
                updateTrayMenu()
              }
            },
            {
              label: '50%',
              type: 'radio',
              checked: appState.opacity === 50,
              click: () => {
                appState.opacity = 50
                if (mainWindow) {
                  mainWindow.webContents.send('set-opacity', 0.5)
                }
                updateTrayMenu()
              }
            },
            {
              label: '75%',
              type: 'radio',
              checked: appState.opacity === 75,
              click: () => {
                appState.opacity = 75
                if (mainWindow) {
                  mainWindow.webContents.send('set-opacity', 0.75)
                }
                updateTrayMenu()
              }
            },
            {
              label: '100%',
              type: 'radio',
              checked: appState.opacity === 100,
              click: () => {
                appState.opacity = 100
                if (mainWindow) {
                  mainWindow.webContents.send('set-opacity', 1.0)
                }
                updateTrayMenu()
              }
            }
          ]
        },
        { type: 'separator' },
        {
          label: '重新调整模型大小',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('refit-model')
            }
          }
        }
      ]
    },
    { type: 'separator' },
    {
      label: '始终置顶',
      type: 'checkbox',
      checked: appState.isAlwaysOnTop,
      click: (menuItem) => {
        appState.isAlwaysOnTop = menuItem.checked
        if (mainWindow) {
          mainWindow.setAlwaysOnTop(menuItem.checked)
          windowConfig.alwaysOnTop = menuItem.checked
          saveWindowConfig()
        }
        updateTrayMenu()
      }
    },
    {
      label: '锁定位置',
      type: 'checkbox',
      checked: appState.isPositionLocked,
      click: (menuItem) => {
        appState.isPositionLocked = menuItem.checked
        windowConfig.isLocked = menuItem.checked
        saveWindowConfig()

        // 通知渲染进程位置锁定状态变化
        if (mainWindow) {
          mainWindow.webContents.send('position-lock-changed', menuItem.checked)
        }
        updateTrayMenu()
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
          title: '关于 Live2D 桌面模型',
          message: 'Live2D 桌面模型 v1.0.0',
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
    tray.setToolTip('Live2D 桌面模型')

    // 初始化托盘菜单
    updateTrayMenu()

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
      tray.setToolTip(`Live2D 桌面模型 - 下载更新中 ${percent}%`)
    }
  })

  autoUpdater.on('update-downloaded', () => {
    console.log('更新下载完成')

    // 重置托盘提示
    if (tray) {
      tray.setToolTip('Live2D 桌面模型')
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
    appState.isAlwaysOnTop = !currentState
    saveWindowConfig()
    updateTrayMenu()
    return !currentState
  }
  return false
})

// 新增的 IPC 处理程序 - 处理从渲染进程发来的状态更新

// 处理模型加载完成通知
ipcMain.handle('model-loaded', (event, modelName) => {
  console.log(`模型加载完成: ${modelName}`)
  appState.currentModel = modelName
  updateTrayMenu()
  return true
})

// 处理口型同步状态变化
ipcMain.handle('speaking-state-changed', (event, isSpeaking) => {
  console.log(`口型同步状态变化: ${isSpeaking}`)
  appState.isSpeaking = isSpeaking
  updateTrayMenu()
  return true
})

// 处理表情播放完成通知
ipcMain.handle('expression-played', (event, expressionFile) => {
  console.log(`表情播放完成: ${expressionFile}`)
  appState.selectedExpression = expressionFile
  updateTrayMenu()
  return true
})

// 处理动作播放完成通知
ipcMain.handle('motion-played', (event, motionFile) => {
  console.log(`动作播放完成: ${motionFile}`)
  appState.selectedMotion = motionFile
  updateTrayMenu()
  return true
})

// 处理模型缩放变化
ipcMain.handle('model-scale-changed', (event, scale) => {
  console.log(`模型缩放变化: ${scale}`)
  appState.modelScale = Math.round(scale * 100)
  updateTrayMenu()
  return true
})

// 处理透明度变化
ipcMain.handle('opacity-changed', (event, opacity) => {
  console.log(`透明度变化: ${opacity}`)
  appState.opacity = Math.round(opacity * 100)
  updateTrayMenu()
  return true
})

// 处理位置锁定状态变化
ipcMain.handle('position-lock-changed', (event, isLocked) => {
  console.log(`位置锁定状态变化: ${isLocked}`)
  appState.isPositionLocked = isLocked
  windowConfig.isLocked = isLocked
  saveWindowConfig()
  updateTrayMenu()
  return true
})

// 处理口型同步敏感度变化
ipcMain.handle('lip-sync-sensitivity-changed', (event, sensitivity) => {
  console.log(`口型同步敏感度变化: ${sensitivity}`)
  appState.lipSyncSensitivity = sensitivity
  updateTrayMenu()
  return true
})

// 获取当前应用状态
ipcMain.handle('get-app-state', () => {
  return appState
})

// 获取模型配置
ipcMain.handle('get-model-configs', () => {
  return modelConfigs
})



console.log('Electron 主进程初始化完成')
