/**
 * 主题管理器
 * 支持多种主题切换和自定义配色方案
 */

export class ThemeManager {
  constructor() {
    this.currentTheme = 'auto'
    this.themes = {
      light: {
        name: '明亮主题',
        colors: {
          primary: '#007bff',
          secondary: '#6c757d',
          success: '#28a745',
          warning: '#ffc107',
          danger: '#dc3545',
          background: 'rgba(255, 255, 255, 0.95)',
          surface: 'rgba(255, 255, 255, 0.8)',
          text: '#212529',
          textSecondary: '#6c757d',
          border: 'rgba(0, 0, 0, 0.1)',
          shadow: 'rgba(0, 0, 0, 0.1)'
        }
      },
      dark: {
        name: '深色主题',
        colors: {
          primary: '#0d6efd',
          secondary: '#6c757d',
          success: '#198754',
          warning: '#fd7e14',
          danger: '#dc3545',
          background: 'rgba(33, 37, 41, 0.95)',
          surface: 'rgba(52, 58, 64, 0.8)',
          text: '#f8f9fa',
          textSecondary: '#adb5bd',
          border: 'rgba(255, 255, 255, 0.1)',
          shadow: 'rgba(0, 0, 0, 0.3)'
        }
      },
      neon: {
        name: '霓虹主题',
        colors: {
          primary: '#00ffff',
          secondary: '#ff00ff',
          success: '#00ff00',
          warning: '#ffff00',
          danger: '#ff0080',
          background: 'rgba(10, 10, 30, 0.95)',
          surface: 'rgba(20, 20, 50, 0.8)',
          text: '#ffffff',
          textSecondary: '#cccccc',
          border: 'rgba(0, 255, 255, 0.3)',
          shadow: 'rgba(0, 255, 255, 0.2)'
        }
      },
      sakura: {
        name: '樱花主题',
        colors: {
          primary: '#ff69b4',
          secondary: '#ffc0cb',
          success: '#98fb98',
          warning: '#ffd700',
          danger: '#ff6b6b',
          background: 'rgba(255, 240, 245, 0.95)',
          surface: 'rgba(255, 228, 225, 0.8)',
          text: '#2d1b2e',
          textSecondary: '#8b5a8c',
          border: 'rgba(255, 105, 180, 0.2)',
          shadow: 'rgba(255, 105, 180, 0.1)'
        }
      }
    }
    
    this.init()
  }

  /**
   * 初始化主题管理器
   */
  init() {
    // 从本地存储加载主题设置
    const savedTheme = localStorage.getItem('desktop-pet-theme')
    if (savedTheme && this.themes[savedTheme]) {
      this.currentTheme = savedTheme
    } else {
      // 自动检测系统主题
      this.currentTheme = this.detectSystemTheme()
    }
    
    this.applyTheme(this.currentTheme)
    
    // 监听系统主题变化
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (this.currentTheme === 'auto') {
          this.applyTheme(this.detectSystemTheme())
        }
      })
    }
  }

  /**
   * 检测系统主题
   */
  detectSystemTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    return 'light'
  }

  /**
   * 应用主题
   */
  applyTheme(themeName) {
    let actualTheme = themeName
    
    if (themeName === 'auto') {
      actualTheme = this.detectSystemTheme()
    }
    
    const theme = this.themes[actualTheme]
    if (!theme) {
      console.warn(`主题 ${themeName} 不存在`)
      return
    }

    // 应用CSS变量
    const root = document.documentElement
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--theme-${key}`, value)
    })

    // 添加主题类名
    document.body.className = document.body.className.replace(/theme-\w+/g, '')
    document.body.classList.add(`theme-${actualTheme}`)

    console.log(`已应用主题: ${theme.name}`)
  }

  /**
   * 切换主题
   */
  setTheme(themeName) {
    if (themeName === this.currentTheme) return
    
    this.currentTheme = themeName
    this.applyTheme(themeName)
    
    // 保存到本地存储
    localStorage.setItem('desktop-pet-theme', themeName)
    
    // 触发主题变化事件
    window.dispatchEvent(new CustomEvent('themeChanged', {
      detail: { theme: themeName }
    }))
  }

  /**
   * 获取当前主题
   */
  getCurrentTheme() {
    return this.currentTheme
  }

  /**
   * 获取所有可用主题
   */
  getAvailableThemes() {
    return Object.keys(this.themes).map(key => ({
      key,
      name: this.themes[key].name
    }))
  }

  /**
   * 获取主题颜色
   */
  getThemeColor(colorName, themeName = null) {
    const theme = themeName ? this.themes[themeName] : this.themes[this.currentTheme]
    return theme?.colors[colorName] || null
  }

  /**
   * 创建自定义主题
   */
  createCustomTheme(name, colors) {
    this.themes[name] = {
      name: name,
      colors: { ...this.themes.light.colors, ...colors }
    }
  }
}

// 创建全局主题管理器实例
export const themeManager = new ThemeManager()

// 导出主题相关的工具函数
export function useTheme() {
  return {
    currentTheme: themeManager.getCurrentTheme(),
    setTheme: (theme) => themeManager.setTheme(theme),
    getAvailableThemes: () => themeManager.getAvailableThemes(),
    getThemeColor: (color) => themeManager.getThemeColor(color)
  }
}
