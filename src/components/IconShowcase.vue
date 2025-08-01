<!--
  图标展示组件
  用于展示和测试 Iconify 图标系统
-->

<template>
  <div class="icon-showcase">
    <h3>🎨 Iconify 图标展示</h3>
    
    <!-- 控制图标组 -->
    <div class="icon-group">
      <h4>控制图标</h4>
      <div class="icon-grid">
        <div class="icon-item" v-for="icon in controlIcons" :key="icon.name">
          <Icon :icon="icon.icon" class="showcase-icon" />
          <span class="icon-name">{{ icon.name }}</span>
          <code class="icon-code">{{ icon.code }}</code>
        </div>
      </div>
    </div>

    <!-- 图标说明 -->
    <div class="icon-group">
      <h4>✨ 图标特色</h4>
      <div style="padding: 12px; background: #f0f8ff; border-radius: 6px; font-size: 12px; line-height: 1.4;">
        <p style="margin: 0 0 8px 0;"><strong>🎯 离线图标包</strong> - 无需网络请求，在 Electron 环境中完美运行</p>
        <p style="margin: 0 0 8px 0;"><strong>🎨 Fluent UI 设计</strong> - 微软设计风格，适合桌面应用</p>
        <p style="margin: 0 0 8px 0;"><strong>⚡ 高性能</strong> - SVG 矢量图标，支持任意缩放</p>
        <p style="margin: 0;"><strong>🌈 智能主题</strong> - 支持悬浮变色和状态指示</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'

// 导入离线图标
import settingsRegular from '@iconify-icons/fluent/settings-24-regular'
import settingsFilled from '@iconify-icons/fluent/settings-24-filled'
import emojiRegular from '@iconify-icons/fluent/emoji-24-regular'
import playRegular from '@iconify-icons/fluent/play-24-regular'
import pauseRegular from '@iconify-icons/fluent/pause-24-regular'
import stopRegular from '@iconify-icons/fluent/stop-24-regular'
import speakerRegular from '@iconify-icons/fluent/speaker-2-24-regular'
import speakerMuteRegular from '@iconify-icons/fluent/speaker-mute-24-regular'
import micRegular from '@iconify-icons/fluent/mic-24-regular'
import micOffRegular from '@iconify-icons/fluent/mic-off-24-regular'
import pinRegular from '@iconify-icons/fluent/pin-24-regular'
import pinFilled from '@iconify-icons/fluent/pin-24-filled'
import minimizeRegular from '@iconify-icons/fluent/minimize-24-regular'
import dismissRegular from '@iconify-icons/fluent/dismiss-24-regular'

// 控制图标
const controlIcons = [
  { name: '设置', icon: settingsRegular, code: 'fluent:settings-24-regular' },
  { name: '设置(填充)', icon: settingsFilled, code: 'fluent:settings-24-filled' },
  { name: '表情', icon: emojiRegular, code: 'fluent:emoji-24-regular' },
  { name: '播放', icon: playRegular, code: 'fluent:play-24-regular' },
  { name: '暂停', icon: pauseRegular, code: 'fluent:pause-24-regular' },
  { name: '停止', icon: stopRegular, code: 'fluent:stop-24-regular' },
  { name: '音频', icon: speakerRegular, code: 'fluent:speaker-2-24-regular' },
  { name: '静音', icon: speakerMuteRegular, code: 'fluent:speaker-mute-24-regular' },
  { name: '麦克风', icon: micRegular, code: 'fluent:mic-24-regular' },
  { name: '麦克风关闭', icon: micOffRegular, code: 'fluent:mic-off-24-regular' },
  { name: '置顶', icon: pinRegular, code: 'fluent:pin-24-regular' },
  { name: '置顶(填充)', icon: pinFilled, code: 'fluent:pin-24-filled' },
  { name: '最小化', icon: minimizeRegular, code: 'fluent:minimize-24-regular' },
  { name: '关闭', icon: dismissRegular, code: 'fluent:dismiss-24-regular' }
]

// 图标使用说明
const iconUsage = `
// 在组件中使用离线图标：
import { Icon } from '@iconify/vue'
import settingsRegular from '@iconify-icons/fluent/settings-24-regular'

// 模板中使用：
<Icon :icon="settingsRegular" />
`
</script>

<style scoped>
.icon-showcase {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  max-height: 400px;
  overflow-y: auto;
}

.icon-showcase h3 {
  margin: 0 0 20px 0;
  color: #333;
  text-align: center;
}

.icon-group {
  margin-bottom: 24px;
}

.icon-group h4 {
  margin: 0 0 12px 0;
  color: #666;
  font-size: 14px;
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 4px;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  transition: all 0.2s ease;
  cursor: pointer;
}

.icon-item:hover {
  border-color: #007bff;
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.1);
  transform: translateY(-1px);
}

.showcase-icon {
  font-size: 24px;
  color: #6c757d;
  margin-bottom: 6px;
  transition: color 0.2s ease;
}

.icon-item:hover .showcase-icon {
  color: #007bff;
}

.icon-name {
  font-size: 11px;
  color: #333;
  margin-bottom: 4px;
  text-align: center;
  font-weight: 500;
}

.icon-code {
  font-size: 9px;
  color: #6c757d;
  background: #f8f9fa;
  padding: 2px 4px;
  border-radius: 3px;
  text-align: center;
  word-break: break-all;
  line-height: 1.2;
}

.icon-item:hover .icon-code {
  color: #007bff;
  background: #e7f3ff;
}
</style>
