<template>
  <div v-if="loadingState.isLoading" class="loading-overlay">
    <div class="loading-container">
      <div class="loading-spinner">
        <div class="spinner"></div>
      </div>
      
      <div class="loading-info">
        <h3 class="loading-title">加载Live2D模型</h3>
        <p class="loading-step">{{ loadingState.currentStep }}</p>
        
        <div class="progress-container">
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: loadingState.progress + '%' }"
            ></div>
          </div>
          <span class="progress-text">{{ loadingState.progress }}%</span>
        </div>
        
        <div class="step-indicator">
          <span class="step-current">{{ loadingState.currentStepIndex + 1 }}</span>
          <span class="step-separator">/</span>
          <span class="step-total">{{ loadingState.totalSteps }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject } from 'vue'

// 注入加载状态
const loadingState = inject('loadingState')
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(5px);
}

.loading-container {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  min-width: 300px;
  max-width: 400px;
}

.loading-spinner {
  margin-bottom: 24px;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-info {
  color: #333;
}

.loading-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #2c3e50;
}

.loading-step {
  font-size: 14px;
  color: #666;
  margin: 0 0 20px 0;
  min-height: 20px;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #007bff, #0056b3);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  font-weight: 600;
  color: #007bff;
  min-width: 40px;
}

.step-indicator {
  font-size: 12px;
  color: #666;
}

.step-current {
  font-weight: 600;
  color: #007bff;
}

.step-separator {
  margin: 0 4px;
}

.step-total {
  color: #999;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .loading-container {
    margin: 20px;
    padding: 24px;
    min-width: auto;
  }
  
  .loading-title {
    font-size: 18px;
  }
  
  .spinner {
    width: 40px;
    height: 40px;
  }
}

/* 暗色主题支持 */
@media (prefers-color-scheme: dark) {
  .loading-container {
    background: rgba(30, 30, 30, 0.95);
    color: #fff;
  }
  
  .loading-title {
    color: #fff;
  }
  
  .loading-step {
    color: #ccc;
  }
  
  .progress-bar {
    background: #444;
  }
  
  .step-indicator {
    color: #ccc;
  }
  
  .step-total {
    color: #666;
  }
}
</style>
