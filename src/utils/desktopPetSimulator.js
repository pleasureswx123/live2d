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

    this.callbacks = {
      positionLock: new Set(),
      alwaysOnTop: new Set()
    }

    this.init()
  }

  /**
   * 初始化模拟器
   */
  init() {
    console.log('🎭 桌面模型模拟器已启动')

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

  // 默认行为：在浏览器环境中启用模拟器
  return !window.require && !window.electronAPI
}

export default DesktopPetSimulator
