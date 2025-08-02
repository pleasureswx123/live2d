/**
 * 桌面模型模拟器
 * 在浏览器环境中模拟 Electron 桌面模型的功能
 * 用于开发和测试桌面模型界面和交互
 */

class DesktopPetSimulator {
  constructor() {
    this.isSimulated = true
    this.windowConfig = {
      x: window.innerWidth - 350,
      y: window.innerHeight - 450,
      width: 300,
      height: 400,
      alwaysOnTop: true,
      isLocked: false
    }

    // URL参数配置
    this.initialScale = null
    this.initialOpacity = null
    this.targetFPS = 60

    this.callbacks = {
      positionLock: new Set(),
      alwaysOnTop: new Set(),
      changeModel: new Set(),
      playExpression: new Set(),
      playMotion: new Set(),
      startSpeaking: new Set(),
      stopSpeaking: new Set(),
      setLipSyncSensitivity: new Set(),
      setModelScale: new Set(),
      setOpacity: new Set(),
      refitModel: new Set()
    }

    this.init()
  }

  /**
   * 初始化模拟器
   */
  init() {
    console.log('🎭 桌面模型模拟器已启动')

    // 处理URL参数
    this.processUrlParams()

    // 设置页面样式模拟桌面模型
    this.setupPetMode()

    // 添加拖拽功能
    this.setupDragFunctionality()

    // 添加键盘快捷键
    this.setupKeyboardShortcuts()

    // 模拟窗口控制
    this.setupWindowControls()
  }

  /**
   * 处理URL参数
   */
  processUrlParams() {
    const urlParams = new URLSearchParams(window.location.search)

    // 处理缩放参数
    const scale = urlParams.get('scale')
    if (scale && !isNaN(parseFloat(scale))) {
      const scaleValue = Math.max(0.5, Math.min(2.0, parseFloat(scale)))
      this.initialScale = scaleValue
      console.log(`从URL设置初始缩放: ${scaleValue}`)
    }

    // 处理透明度参数
    const opacity = urlParams.get('opacity')
    if (opacity && !isNaN(parseFloat(opacity))) {
      const opacityValue = Math.max(0.1, Math.min(1.0, parseFloat(opacity)))
      this.initialOpacity = opacityValue
      console.log(`从URL设置初始透明度: ${opacityValue}`)
    }

    // 处理FPS参数
    const fps = urlParams.get('fps')
    if (fps && !isNaN(parseInt(fps))) {
      const fpsValue = Math.max(15, Math.min(120, parseInt(fps)))
      this.targetFPS = fpsValue
      console.log(`从URL设置目标FPS: ${fpsValue}`)
    }

    // 输出所有URL参数（调试用）
    if (urlParams.toString()) {
      console.log('URL参数:', Object.fromEntries(urlParams))
    }
  }

  /**
   * 设置桌面模型模式样式
   */
  setupPetMode() {
    // 设置页面为桌面模型模式
    document.body.style.margin = '0'
    document.body.style.padding = '0'
    document.body.style.overflow = 'hidden'
    document.body.style.background = 'transparent'
    document.body.classList.add('desktop-pet-mode')

    // 创建模拟窗口边框（可选，用于调试）
    if (this.shouldShowDebugBorder()) {
      this.createDebugBorder()
    }

    // 设置窗口大小
    this.resizeWindow()
  }

  /**
   * 是否显示调试边框
   */
  shouldShowDebugBorder() {
    return new URLSearchParams(window.location.search).has('debug')
  }

  /**
   * 创建调试边框
   */
  createDebugBorder() {
    const border = document.createElement('div')
    border.id = 'debug-border'
    border.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border: 2px dashed #ff6b6b;
      pointer-events: none;
      z-index: 10000;
      background: rgba(255, 107, 107, 0.1);
    `

    const label = document.createElement('div')
    label.textContent = '桌面模型模拟模式'
    label.style.cssText = `
      position: absolute;
      top: 5px;
      left: 5px;
      background: #ff6b6b;
      color: white;
      padding: 2px 6px;
      font-size: 12px;
      border-radius: 3px;
    `

    border.appendChild(label)
    document.body.appendChild(border)
  }

  /**
   * 调整窗口大小
   */
  resizeWindow() {
    // 在浏览器中模拟固定窗口大小
    const viewport = document.querySelector('meta[name=viewport]')
    if (viewport) {
      viewport.setAttribute('content', 'width=300, height=400, user-scalable=no')
    }
  }

  /**
   * 设置拖拽功能
   */
  setupDragFunctionality() {
    let isDragging = false
    let dragOffset = { x: 0, y: 0 }

    // 监听鼠标事件实现拖拽
    document.addEventListener('mousedown', (e) => {
      if (this.windowConfig.isLocked) return

      // 检查是否点击在可拖拽区域
      if (this.isDraggableArea(e.target)) {
        isDragging = true
        dragOffset.x = e.clientX
        dragOffset.y = e.clientY
        document.body.style.cursor = 'move'
        e.preventDefault()
      }
    })

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return

      const deltaX = e.clientX - dragOffset.x
      const deltaY = e.clientY - dragOffset.y

      // 模拟窗口移动（在实际应用中这会移动整个窗口）
      console.log(`模拟窗口移动: (${deltaX}, ${deltaY})`)

      // 更新拖拽起始点
      dragOffset.x = e.clientX
      dragOffset.y = e.clientY
    })

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false
        document.body.style.cursor = 'default'
        console.log('拖拽结束')
      }
    })
  }

  /**
   * 检查是否为可拖拽区域
   */
  isDraggableArea(element) {
    // 检查元素或其父元素是否有拖拽属性
    let current = element
    while (current && current !== document.body) {
      const appRegion = window.getComputedStyle(current).webkitAppRegion
      if (appRegion === 'no-drag') return false
      if (appRegion === 'drag') return true
      current = current.parentElement
    }

    // 默认情况下，canvas 和空白区域可拖拽
    return element.tagName === 'CANVAS' ||
           element === document.body ||
           element.classList.contains('model-display')
  }

  /**
   * 设置键盘快捷键
   */
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + T: 切换置顶状态
      if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault()
        this.toggleAlwaysOnTop()
      }

      // Ctrl/Cmd + L: 切换位置锁定
      if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault()
        this.togglePositionLock()
      }

      // Ctrl/Cmd + D: 切换调试模式
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault()
        this.toggleDebugMode()
      }

      // ESC: 隐藏所有面板
      if (e.key === 'Escape') {
        this.hideAllPanels()
      }
    })
  }

  /**
   * 设置窗口控制
   */
  setupWindowControls() {
    // 监听窗口大小变化
    window.addEventListener('resize', () => {
      console.log('窗口大小变化:', window.innerWidth, window.innerHeight)
    })

    // 监听页面可见性变化
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        console.log('窗口被隐藏')
      } else {
        console.log('窗口重新显示')
      }
    })
  }

  /**
   * 模拟 Electron API
   */
  getWindowConfig() {
    return Promise.resolve({ ...this.windowConfig })
  }

  saveWindowConfig(config) {
    this.windowConfig = { ...this.windowConfig, ...config }
    localStorage.setItem('desktop-pet-config', JSON.stringify(this.windowConfig))
    return Promise.resolve(true)
  }

  toggleAlwaysOnTop() {
    this.windowConfig.alwaysOnTop = !this.windowConfig.alwaysOnTop
    console.log('始终置顶状态:', this.windowConfig.alwaysOnTop)

    // 触发回调
    this.callbacks.alwaysOnTop.forEach(callback => {
      callback(this.windowConfig.alwaysOnTop)
    })

    return Promise.resolve(this.windowConfig.alwaysOnTop)
  }

  togglePositionLock() {
    this.windowConfig.isLocked = !this.windowConfig.isLocked
    console.log('位置锁定状态:', this.windowConfig.isLocked)

    // 触发回调
    this.callbacks.positionLock.forEach(callback => {
      callback(this.windowConfig.isLocked)
    })

    return this.windowConfig.isLocked
  }

  enableWindowDrag() {
    console.log('启用窗口拖拽')
    document.body.style.webkitAppRegion = 'drag'

    // 为交互元素设置 no-drag
    const interactiveElements = document.querySelectorAll('button, input, select, textarea, .interactive')
    interactiveElements.forEach(element => {
      element.style.webkitAppRegion = 'no-drag'
    })
  }

  disableWindowDrag() {
    console.log('禁用窗口拖拽')
    document.body.style.webkitAppRegion = 'no-drag'
  }

  onPositionLockChanged(callback) {
    this.callbacks.positionLock.add(callback)
  }

  removePositionLockListener(callback) {
    this.callbacks.positionLock.delete(callback)
  }

  showNotification(title, body, icon = null) {
    console.log(`通知: ${title} - ${body}`)

    // 使用浏览器通知 API
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon })
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(title, { body, icon })
        }
      })
    }
  }

  toggleDebugMode() {
    const border = document.getElementById('debug-border')
    if (border) {
      border.remove()
    } else {
      this.createDebugBorder()
    }
  }

  hideAllPanels() {
    // 触发隐藏所有面板的事件
    document.dispatchEvent(new CustomEvent('hide-all-panels'))
  }

  getPlatform() {
    return navigator.platform
  }

  isDevelopment() {
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  }

  // === 模型控制 API ===

  /**
   * 获取应用状态
   */
  getAppState() {
    return Promise.resolve({
      isModelLoaded: false,
      currentModel: null,
      isSpeaking: false
    })
  }

  /**
   * 获取模型配置
   */
  getModelConfigs() {
    return Promise.resolve({
      models: ['hiyori', 'koharu', 'haruto', 'natori', 'shizuku', 'wanko']
    })
  }

  /**
   * 通知模型加载完成
   */
  notifyModelLoaded(modelName) {
    console.log(`模型加载完成: ${modelName}`)
    return Promise.resolve(true)
  }

  /**
   * 通知口型同步状态变化
   */
  notifySpeakingStateChanged(isSpeaking) {
    console.log(`口型同步状态变化: ${isSpeaking}`)
    return Promise.resolve(true)
  }

  /**
   * 通知表情播放完成
   */
  notifyExpressionPlayed(expressionFile) {
    console.log(`表情播放完成: ${expressionFile}`)
    return Promise.resolve(true)
  }

  /**
   * 通知动作播放完成
   */
  notifyMotionPlayed(motionFile) {
    console.log(`动作播放完成: ${motionFile}`)
    return Promise.resolve(true)
  }

  /**
   * 通知模型缩放变化
   */
  notifyModelScaleChanged(scale) {
    console.log(`模型缩放变化: ${scale}`)
    return Promise.resolve(true)
  }

  /**
   * 通知透明度变化
   */
  notifyOpacityChanged(opacity) {
    console.log(`透明度变化: ${opacity}`)
    return Promise.resolve(true)
  }

  /**
   * 通知位置锁定状态变化
   */
  notifyPositionLockChanged(isLocked) {
    console.log(`位置锁定状态变化: ${isLocked}`)
    return Promise.resolve(true)
  }

  /**
   * 通知口型同步敏感度变化
   */
  notifyLipSyncSensitivityChanged(sensitivity) {
    console.log(`口型同步敏感度变化: ${sensitivity}`)
    return Promise.resolve(true)
  }

  // === 事件监听 API ===

  /**
   * 监听模型切换命令
   */
  onChangeModel(callback) {
    this.callbacks.changeModel.add(callback)
  }

  /**
   * 监听表情播放命令
   */
  onPlayExpression(callback) {
    this.callbacks.playExpression.add(callback)
  }

  /**
   * 监听动作播放命令
   */
  onPlayMotion(callback) {
    this.callbacks.playMotion.add(callback)
  }

  /**
   * 监听开始说话命令
   */
  onStartSpeaking(callback) {
    this.callbacks.startSpeaking.add(callback)
  }

  /**
   * 监听停止说话命令
   */
  onStopSpeaking(callback) {
    this.callbacks.stopSpeaking.add(callback)
  }

  /**
   * 监听口型同步敏感度设置命令
   */
  onSetLipSyncSensitivity(callback) {
    this.callbacks.setLipSyncSensitivity.add(callback)
  }

  /**
   * 监听模型缩放设置命令
   */
  onSetModelScale(callback) {
    this.callbacks.setModelScale.add(callback)
  }

  /**
   * 监听透明度设置命令
   */
  onSetOpacity(callback) {
    this.callbacks.setOpacity.add(callback)
  }

  /**
   * 监听重新调整模型大小命令
   */
  onRefitModel(callback) {
    this.callbacks.refitModel.add(callback)
  }

  // === 模拟触发事件的方法（用于测试） ===

  /**
   * 模拟触发模型切换
   */
  simulateChangeModel(modelName) {
    this.callbacks.changeModel.forEach(callback => callback(modelName))
  }

  /**
   * 模拟触发表情播放
   */
  simulatePlayExpression(expressionFile) {
    this.callbacks.playExpression.forEach(callback => callback(expressionFile))
  }

  /**
   * 模拟触发动作播放
   */
  simulatePlayMotion(motionFile) {
    this.callbacks.playMotion.forEach(callback => callback(motionFile))
  }

  /**
   * 模拟触发开始说话
   */
  simulateStartSpeaking() {
    this.callbacks.startSpeaking.forEach(callback => callback())
  }

  /**
   * 模拟触发停止说话
   */
  simulateStopSpeaking() {
    this.callbacks.stopSpeaking.forEach(callback => callback())
  }

  /**
   * 获取初始配置（从URL参数解析）
   */
  getInitialConfig() {
    return {
      scale: this.initialScale,
      opacity: this.initialOpacity,
      fps: this.targetFPS
    }
  }

  /**
   * 显示支持的URL参数帮助信息
   */
  showUrlParamsHelp() {
    const params = getSupportedUrlParams()
    console.group('🔗 支持的URL参数:')

    Object.entries(params).forEach(([param, config]) => {
      console.group(`📌 ${param}`)
      console.log(`描述: ${config.description}`)
      console.log(`示例: ${config.example}`)
      if (config.values) {
        console.log('可选值:')
        Object.entries(config.values).forEach(([value, desc]) => {
          console.log(`  • ${value}: ${desc}`)
        })
      }
      console.groupEnd()
    })

    console.groupEnd()

    // 显示当前URL参数
    const currentParams = new URLSearchParams(window.location.search)
    if (currentParams.toString()) {
      console.log('当前URL参数:', Object.fromEntries(currentParams))
    } else {
      console.log('当前没有URL参数')
    }
  }
}

// 创建全局模拟器实例
let simulator = null

/**
 * 初始化桌面模型模拟器
 */
export function initDesktopPetSimulator() {
  if (!simulator) {
    simulator = new DesktopPetSimulator()

    // 暴露到全局对象，模拟 Electron preload 脚本
    window.desktopPet = simulator
    window.electronAPI = {
      platform: simulator.getPlatform(),
      isDev: simulator.isDevelopment()
    }

    console.log('🎭 桌面模型模拟器已初始化')
  }

  return simulator
}

/**
 * 获取所有支持的URL参数说明
 */
export function getSupportedUrlParams() {
  return {
    // 模式参数
    mode: {
      description: '运行模式（默认：web）',
      values: {
        'pet': '桌面模型模式（启用模拟器）',
        'simulator': '桌面模型模拟器模式',
        'web': '传统网页模式（默认）',
        'traditional': '传统网页模式'
      },
      example: '?mode=pet',
      default: 'web'
    },

    // 模型参数
    model: {
      description: '初始加载的模型',
      values: {
        'idol': '偶像模型',
        'lanhei': '兰黑模型',
        'hibiki': '响模型',
        'hiyori': '日和模型',
        'mark': '马克模型',
        'natori': '名取模型',
        'kei_basic': 'Kei基础模型',
        'kei_vowels': 'Kei元音模型'
      },
      example: '?model=hiyori'
    },

    // 调试参数
    debug: {
      description: '启用调试模式（显示边框和调试信息）',
      values: {
        'true': '启用调试模式',
        'false': '禁用调试模式（默认）'
      },
      example: '?debug=true'
    },

    // 兼容性参数
    pet: {
      description: '启用桌面模型模式（兼容旧版本）',
      values: {
        'true': '启用桌面模型模式'
      },
      example: '?pet=true'
    },

    'desktop-pet': {
      description: '启用桌面模型模式（兼容旧版本）',
      values: {
        'true': '启用桌面模型模式'
      },
      example: '?desktop-pet=true'
    },

    // 性能参数
    fps: {
      description: '目标帧率',
      values: {
        '30': '30 FPS',
        '60': '60 FPS（默认）',
        '120': '120 FPS'
      },
      example: '?fps=30'
    },

    // 缩放参数
    scale: {
      description: '初始模型缩放比例',
      values: {
        '0.5-2.0': '缩放比例范围'
      },
      example: '?scale=1.2'
    },

    // 透明度参数
    opacity: {
      description: '初始模型透明度',
      values: {
        '0.1-1.0': '透明度范围'
      },
      example: '?opacity=0.8'
    }
  }
}

/**
 * 检查是否应该启用模拟器
 */
export function shouldUseSimulator() {
  // 检查 URL 参数
  const urlParams = new URLSearchParams(window.location.search)
  const mode = urlParams.get('mode')

  // 如果明确指定了模式
  if (mode === 'pet' || mode === 'simulator') {
    return true
  }

  if (mode === 'web' || mode === 'traditional') {
    return false
  }

  // 兼容旧的参数格式
  if (urlParams.has('pet') || urlParams.has('desktop-pet')) {
    return true
  }

  // 默认行为：如果没有指定任何模式参数，默认为web模式（不启用模拟器）
  // 只有在真正的 Electron 环境中才自动启用桌面模型功能
  return false
}

export default DesktopPetSimulator
