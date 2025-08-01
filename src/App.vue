<script setup>
import * as PIXI from 'pixi.js'
import { Live2DModel, SoundManager, MotionPriority } from 'pixi-live2d-display'
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import DesktopPetControls from './components/DesktopPetControls.vue'
import IconShowcase from './components/IconShowcase.vue'
import { initDesktopPetSimulator, shouldUseSimulator } from './utils/desktopPetSimulator.js'

window.PIXI = PIXI

// 检测是否在 Electron 环境中运行
const isElectron = ref(false)
const isDesktopPetMode = ref(false)
const isSimulatorMode = ref(false)

// 开发模式检测
const isDevelopmentMode = ref(import.meta.env.DEV)

import testAudioUrl from '@/assets/test.wav'
const audioFile = ref(testAudioUrl);

const canvas = ref(null)
const isModelLoaded = ref(false)
const currentModelName = ref('idol')

let app
let model
let audioContext

// 模型配置
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
  }
}

// 当前模型配置
const currentConfig = computed(() => modelConfigs[currentModelName.value])
const currentModelConfig = computed(() => modelConfigs[currentModelName.value])

// 选中的动作和表情
const selectedMotion = ref('')
const selectedExpression = ref('')

// 音频相关状态
const selectedSound = ref('')
const currentAudio = ref(null)
const isPlaying = ref(false)
const isPaused = ref(false)
const audioVolume = ref(0.7)
const audioProgress = ref(0)
const audioDuration = ref(0)
const audioCurrentTime = ref(0)

// ==================== 口型同步相关状态 ====================

/**
 * 口型同步播放状态
 * - true: 正在进行口型同步（音频播放中，嘴部动画运行中）
 * - false: 口型同步待机状态（未播放音频，嘴部参数为默认值）
 * 用于控制UI按钮状态和防止重复启动口型同步
 */
const isSpeaking = ref(false)

/**
 * 口型同步敏感度设置 (范围: 10-100)
 * 控制音频音量到嘴部开合程度的映射比例
 * - 值越小(10): 敏感度越低，需要更大的音量才能张开嘴巴
 * - 值越大(100): 敏感度越高，较小的音量就能产生明显的嘴部动作
 * 计算公式: mouthOpen = Math.min(1, volume / lipSyncSensitivity.value)
 */
const lipSyncSensitivity = ref(80)

/**
 * 当前音频上下文对象 (Web Audio API)
 * 用于音频解码、播放和实时分析
 * - null: 未初始化或已关闭
 * - AudioContext: 活跃的音频上下文，可以处理音频操作
 * 在startSpeaking时创建，在stopSpeaking时可能保留以便复用
 */
let currentAudioContext = null

/**
 * 当前音频源节点 (AudioBufferSource)
 * Web Audio API中用于播放音频缓冲区的节点
 * - null: 没有正在播放的音频
 * - AudioBufferSource: 正在播放的音频源，可以用于停止播放
 * 每次播放新音频时都会创建新的源节点（AudioBufferSource只能使用一次）
 */
let currentAudioSource = null

/**
 * 口型同步动画帧ID
 * requestAnimationFrame返回的ID，用于控制60FPS的嘴部动画循环
 * - null: 没有正在运行的动画循环
 * - number: 活跃的动画帧ID，可以用cancelAnimationFrame取消
 * 用于在停止口型同步时取消动画循环，避免不必要的计算
 */
let lipSyncAnimationId = null

// 计算属性：当前模型是否支持音频
const hasAudioSupport = computed(() => {
  return currentConfig.value.sounds && currentConfig.value.sounds.length > 0
})

/**
 * 获取当前Live2D模型支持的嘴部参数列表
 *
 * 功能说明:
 * - 动态检测模型支持的口型参数，确保跨版本兼容性
 * - 支持Cubism 2.x和4.x的不同参数命名规范
 * - 支持基础口型参数和高级元音参数
 *
 * 参数类型说明:
 * 1. 基础口型参数:
 *    - ParamMouthOpenY/PARAM_MOUTH_OPEN_Y: 嘴部垂直开合程度 (0=闭合, 1=完全张开)
 *    - ParamMouthForm/PARAM_MOUTH_FORM: 嘴部形状变化 (影响嘴角和嘴唇形状)
 *
 * 2. 高级元音参数 (用于精细口型同步):
 *    - ParamA: 元音"啊"的口型 (大张口，适合低频/大音量)
 *    - ParamI: 元音"咿"的口型 (横向拉伸，适合高频)
 *    - ParamU: 元音"呜"的口型 (嘴唇前突，适合中低频)
 *    - ParamE: 元音"诶"的口型 (中等开口，适合中频)
 *    - ParamO: 元音"哦"的口型 (圆形开口，适合中低频)
 *
 * @returns {string[]} 模型支持的嘴部参数名称数组
 */
function getMouthParameters() {
  // 检查模型是否已加载
  if (!model || !model.internalModel) {
    console.warn('模型未加载，无法获取嘴部参数')
    return []
  }

  const supportedParams = []
  const coreModel = model.internalModel.coreModel

  // 定义所有可能的嘴部参数名称
  // 按照优先级排序：基础参数 -> 高级元音参数
  const commonMouthParams = [
    // === Cubism 4.x 标准参数 ===
    'ParamMouthOpenY',     // 嘴部垂直开合 (主要参数)
    'ParamMouthForm',      // 嘴部形状变化 (辅助参数)

    // === Cubism 2.x 兼容参数 ===
    'PARAM_MOUTH_OPEN_Y',  // 嘴部垂直开合 (旧版本)
    'PARAM_MOUTH_FORM',    // 嘴部形状变化 (旧版本)

    // === 高级口型同步参数 (元音系统) ===
    // 这些参数通常用于专业的口型同步模型，如Kei Vowels Pro
    'ParamA',  // 元音A - 大开口，适合表现强烈的声音
    'ParamI',  // 元音I - 横向拉伸，适合表现尖锐的声音
    'ParamU',  // 元音U - 嘴唇前突，适合表现低沉的声音
    'ParamE',  // 元音E - 中等开口，适合表现中性的声音
    'ParamO'   // 元音O - 圆形开口，适合表现圆润的声音
  ]

  // 逐个检查参数是否存在于当前模型中
  for (const paramName of commonMouthParams) {
    try {
      // 尝试获取参数的当前值来验证参数是否存在
      // 如果参数不存在，getParameterValueById会抛出异常或返回undefined
      const value = coreModel.getParameterValueById(paramName)

      // 只有当参数确实存在且有有效值时才添加到支持列表
      if (value !== undefined && value !== null) {
        supportedParams.push(paramName)
      }
    } catch (error) {
      // 参数不存在于当前模型中，静默忽略
      // 这是正常情况，因为不同模型支持的参数集合不同
    }
  }

  // 输出检测结果，便于调试和了解模型能力
  console.log(`模型支持的嘴部参数 (${supportedParams.length}个):`, supportedParams)

  return supportedParams
}

/**
 * speaking 函数：播放音频并根据音频强度控制Live2D模型的嘴部动画
 * 实现原理：通过Web Audio API分析音频频率数据，将音量强度映射到嘴部开合程度
 */
const speaking = async () => {
  try {
    // === 第0步：检查模型和获取支持的嘴部参数 ===
    if (!model || !isModelLoaded.value) {
      throw new Error('模型未加载')
    }

    const mouthParams = getMouthParameters()
    if (mouthParams.length === 0) {
      throw new Error('当前模型不支持嘴部参数控制')
    }

    console.log(`开始口型同步，支持的参数: ${mouthParams.join(', ')}`)

    // === 第一步：获取音频文件 ===
    // 从服务器获取音频文件，audioFile.value 是音频文件的URL路径
    const response = await fetch(audioFile.value);

    // 检查HTTP请求是否成功（状态码200-299）
    if (!response.ok) {
      // 如果请求失败，抛出错误并包含状态码信息
      throw new Error(`Failed to fetch audio: ${response.status}`);
    }

    // === 第二步：处理音频数据 ===
    // 将HTTP响应转换为ArrayBuffer（二进制数据格式）
    const audioData = await response.arrayBuffer();

    // 使用Web Audio API解码音频数据，转换为AudioBuffer对象
    // AudioBuffer包含了音频的采样率、声道数、音频样本等信息
    const audioBuffer = await currentAudioContext.decodeAudioData(audioData);

    // 创建音频源节点，用于播放音频
    const source = currentAudioContext.createBufferSource();
    currentAudioSource = source // 保存引用以便停止

    // 创建分析器节点，用于分析音频的频率和音量数据
    const analyser = currentAudioContext.createAnalyser();

    // === 第三步：配置音频分析器 ===
    // 设置FFT（快速傅里叶变换）的大小为256
    // FFT用于将时域信号转换为频域信号，256表示分析的频率分辨率
    // 值越大分析越精细，但计算量也越大
    analyser.fftSize = 256;

    // 设置平滑时间常数为0.8（范围0-1）
    // 用于平滑音频分析数据，避免数值跳动过于剧烈
    // 值越大平滑效果越强，嘴部动画越柔和
    analyser.smoothingTimeConstant = 0.8;

    // === 第四步：连接音频节点 ===
    // 将解码后的音频数据设置到音频源节点
    source.buffer = audioBuffer;

    // 连接音频流：音频源 → 分析器 → 音频输出
    // 这样音频既能播放出来，又能被分析器实时分析
    source.connect(analyser);           // 音频源连接到分析器
    analyser.connect(currentAudioContext.destination);  // 分析器连接到音频输出（扬声器）

    // === 第五步：设置播放状态管理 ===
    // 播放状态标志，用于控制嘴部动画循环
    let isPlaying = true;

    // 监听音频播放结束事件
    source.onended = () => {
      // 音频播放结束时，停止嘴部动画
      isPlaying = false;
      isSpeaking.value = false;

      // 重置Live2D模型的嘴部参数到默认状态（闭嘴）
      if (model && model.internalModel && model.internalModel.coreModel) {
        try {
          // 重置所有支持的嘴部参数到默认值
          for (const paramName of mouthParams) {
            model.internalModel.coreModel.setParameterValueById(paramName, 0);
          }
          console.log('嘴部参数已重置到默认状态')
        } catch (paramError) {
          // 如果参数设置失败，记录警告但不中断程序
          console.warn('重置嘴部参数失败:', paramError);
        }
      }
    };

    // === 第六步：开始播放音频 ===
    source.start();

    // === 第七步：定义嘴部动画更新函数 ===
    const updateMouth = () => {
      // 检查是否应该继续更新动画
      // 条件：音频还在播放 && 音频上下文正在运行 && 模型存在 && 用户没有手动停止
      if (!isPlaying || currentAudioContext.state !== 'running' || !model || !isSpeaking.value) {
        return; // 如果任一条件不满足，停止动画更新
      }

      try {
        // === 实时音频分析部分 ===
        //
        // 技术原理:
        // 使用Web Audio API的AnalyserNode进行实时频谱分析
        // 通过FFT(快速傅里叶变换)将时域音频信号转换为频域数据
        // 分析不同频率范围的能量分布，计算整体音量强度

        // 第1步: 创建频率数据存储数组
        // 数组大小 = analyser.frequencyBinCount = analyser.fftSize / 2
        // 当前配置: fftSize=256, 所以 frequencyBinCount=128
        // 每个元素代表一个频率区间的能量值(0-255)
        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        // 第2步: 获取当前帧的频率域数据
        // getByteFrequencyData(): 获取实时的频率能量分布
        // 返回值范围: 0-255 (8位无符号整数)
        // 数组索引对应频率: index * (sampleRate/2) / frequencyBinCount
        // 例如: 44.1kHz采样率下，index=1对应约172Hz
        analyser.getByteFrequencyData(dataArray);

        // 第3步: 计算整体音量强度
        // 方法: 对所有频率区间的能量值求平均
        // reduce((a, b) => a + b, 0): 累加所有频率能量
        // 除以数组长度: 得到平均能量值 (0-255)
        //
        // 优化空间: 可以考虑加权平均，重点关注人声频率范围(85Hz-255Hz)
        const volume = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;

        // 第4步: 音量到口型的智能映射
        //
        // 映射公式: mouthOpen = min(1, volume / sensitivity)
        //
        // 参数说明:
        // - volume: 当前音量强度 (0-255)
        // - sensitivity: 用户设置的敏感度 (10-100)
        // - mouthOpen: 最终的嘴部开合程度 (0-1)
        //
        // 敏感度效果:
        // - 低敏感度(10): 需要很大音量才能张嘴，适合嘈杂环境
        // - 中敏感度(50): 平衡的响应，适合一般语音
        // - 高敏感度(100): 轻微声音就有反应，适合安静环境
        //
        // Math.min(1, ...): 确保结果不超过1，防止过度张嘴
        const sensitivityFactor = lipSyncSensitivity.value
        const mouthOpen = Math.min(1, volume / sensitivityFactor);

        // 调试信息 (可选，在开发时启用)
        // console.log(`音量: ${volume.toFixed(1)}, 敏感度: ${sensitivityFactor}, 开口度: ${mouthOpen.toFixed(3)}`);

        // === Live2D参数更新部分 ===
        // 智能口型映射系统：根据参数类型和音频特征进行差异化处理
        //
        // 设计理念:
        // 1. 不同类型的参数有不同的表现特点和适用场景
        // 2. 通过系数调整实现更自然的口型变化
        // 3. 支持多参数协同工作，创造丰富的口型表现
        //
        // 映射策略:
        // - 基础参数: 直接映射，提供主要的开合动作
        // - 形状参数: 减半映射，提供细微的形状变化
        // - 元音参数: 分层映射，模拟不同发音的口型特征

        for (const paramName of mouthParams) {
          try {
            // === 基础嘴部开合参数 ===
            if (paramName.includes('MouthOpen') || paramName.includes('MOUTH_OPEN')) {
              // 主要的嘴部垂直开合控制
              // 系数: 1.0 (完整映射)
              // 作用: 控制嘴巴张开的程度，是最重要的口型参数
              // 适用: 所有类型的音频，提供基础的开合动作
              model.internalModel.coreModel.setParameterValueById(paramName, mouthOpen);

            } else if (paramName.includes('MouthForm') || paramName.includes('MOUTH_FORM')) {
              // 嘴部形状和轮廓控制
              // 系数: 0.5 (减半映射)
              // 作用: 控制嘴唇形状、嘴角位置等细节
              // 适用: 提供更细腻的口型变化，避免过度夸张
              model.internalModel.coreModel.setParameterValueById(paramName, mouthOpen * 0.5);

            // === 高级元音参数系统 ===
            } else if (paramName === 'ParamA') {
              // 元音"A"(/a/) - 大开口音
              // 系数: 0.8 (强映射)
              // 特征: 嘴巴大张，舌位低，适合表现强烈、响亮的声音
              // 音频特征: 通常对应较大的音量和较低的频率
              // 使用场景: 歌唱中的高音、感叹词、强调音节
              model.internalModel.coreModel.setParameterValueById(paramName, mouthOpen * 0.8);

            } else if (['ParamI', 'ParamE'].includes(paramName)) {
              // 元音"I"(/i/)和"E"(/e/) - 中高位音
              // 系数: 0.6 (中等映射)
              // 特征:
              //   - ParamI: 嘴角向两侧拉伸，嘴型较扁，舌位高
              //   - ParamE: 嘴型介于I和A之间，舌位中高
              // 音频特征: 通常对应中等音量和中高频率
              // 使用场景: 日常对话、清晰发音、中等强度的表达
              model.internalModel.coreModel.setParameterValueById(paramName, mouthOpen * 0.6);

            } else if (['ParamU', 'ParamO'].includes(paramName)) {
              // 元音"U"(/u/)和"O"(/o/) - 圆唇音
              // 系数: 0.4 (轻映射)
              // 特征:
              //   - ParamU: 嘴唇前突成圆形，开口最小，舌位高后
              //   - ParamO: 嘴唇圆形，开口中等，舌位中后
              // 音频特征: 通常对应较小的音量和较低的频率
              // 使用场景: 轻柔的语调、低声细语、温柔的表达
              model.internalModel.coreModel.setParameterValueById(paramName, mouthOpen * 0.4);
            }

          } catch (paramError) {
            // 参数设置失败处理
            // 可能原因: 参数超出范围、模型状态异常、API调用错误
            console.warn(`设置参数 ${paramName} 失败:`, paramError);
          }
        }

        // === 动画循环部分 ===
        // 请求下一帧动画更新（通常60FPS）
        // 这样就形成了连续的动画循环
        lipSyncAnimationId = requestAnimationFrame(updateMouth);

      } catch (error) {
        // 如果更新过程中出现错误，记录错误并停止动画
        console.error('更新嘴部动画失败:', error);
        isPlaying = false; // 停止动画循环
      }
    };

    // === 第八步：启动嘴部动画 ===
    // 开始第一次动画更新，后续通过requestAnimationFrame循环调用
    updateMouth();

  } catch (error) {
    // 捕获整个函数执行过程中的任何错误
    console.error('音频播放和嘴部同步失败:', error);
    // 确保状态重置
    isSpeaking.value = false
  }
}

/**
 * 开始说话：启动口型同步功能
 *
 * 功能流程:
 * 1. 检查当前状态，防止重复启动
 * 2. 验证音频文件是否可用
 * 3. 初始化或恢复Web Audio API上下文
 * 4. 调用speaking函数开始实际的音频播放和口型同步
 *
 * 状态管理:
 * - 设置isSpeaking为true，更新UI状态
 * - 创建或复用AudioContext
 * - 处理浏览器的音频策略限制
 *
 * 错误处理:
 * - 防止重复启动
 * - 验证必要条件
 * - 异常时自动重置状态
 */
async function startSpeaking() {
  // === 第一步：状态检查和验证 ===

  // 防止重复启动口型同步
  if (isSpeaking.value) {
    console.warn('已经在说话中，请先停止当前的口型同步')
    return
  }

  // 检查音频文件是否已正确加载
  if (!audioFile.value) {
    console.error('没有可用的音频文件')
    return
  }

  try {
    console.log('开始口型同步...')

    // === 第二步：更新状态 ===
    // 立即设置为说话状态，更新UI显示
    isSpeaking.value = true

    // === 第三步：音频上下文管理 ===

    // 创建新的音频上下文（如果不存在或已关闭）
    // AudioContext是Web Audio API的核心，管理所有音频操作
    if (!currentAudioContext || currentAudioContext.state === 'closed') {
      currentAudioContext = new AudioContext()
      console.log('创建新的AudioContext')
    }

    // 处理浏览器音频策略限制
    // 现代浏览器要求用户交互后才能播放音频，可能导致AudioContext被暂停
    if (currentAudioContext.state === 'suspended') {
      await currentAudioContext.resume()
      console.log('恢复被暂停的AudioContext')
    }

    // === 第四步：启动口型同步 ===
    // 调用speaking函数开始实际的音频播放和嘴部动画
    await speaking()

  } catch (error) {
    // === 错误处理 ===
    console.error('启动口型同步失败:', error)

    // 发生错误时重置状态，确保UI正确显示
    isSpeaking.value = false

    // 可以在这里添加用户友好的错误提示
    // 例如：显示Toast消息或更新UI错误状态
  }
}

/**
 * 停止说话：停止口型同步功能
 *
 * 功能说明:
 * 完全停止当前的口型同步，包括音频播放、动画循环和参数重置
 * 确保所有相关资源被正确清理，避免内存泄漏和状态混乱
 *
 * 清理步骤:
 * 1. 停止音频播放 (AudioBufferSource)
 * 2. 取消动画循环 (requestAnimationFrame)
 * 3. 重置所有嘴部参数到默认值
 * 4. 更新UI状态
 *
 * 安全性:
 * - 每个步骤都有独立的错误处理
 * - 即使部分步骤失败，也会继续执行其他清理操作
 * - 最终确保状态被重置
 */
function stopSpeaking() {
  try {
    console.log('停止口型同步...')

    // === 第一步：停止音频播放 ===
    if (currentAudioSource) {
      try {
        // 停止当前正在播放的音频源
        // AudioBufferSource.stop()会立即停止音频播放
        currentAudioSource.stop()
        console.log('音频播放已停止')
      } catch (audioError) {
        // 音频可能已经自然结束，忽略停止错误
        console.warn('停止音频时出现错误:', audioError)
      }

      // 清除音频源引用，释放资源
      // AudioBufferSource是一次性的，停止后不能重用
      currentAudioSource = null
    }

    // === 第二步：取消动画循环 ===
    if (lipSyncAnimationId) {
      // 取消requestAnimationFrame循环，停止嘴部动画更新
      cancelAnimationFrame(lipSyncAnimationId)
      lipSyncAnimationId = null
      console.log('动画循环已取消')
    }

    // === 第三步：重置嘴部参数 ===
    if (model && model.internalModel && model.internalModel.coreModel) {
      // 获取当前模型支持的所有嘴部参数
      const mouthParams = getMouthParameters()

      // 将所有嘴部参数重置为默认值(0)
      // 这样模型的嘴巴会回到闭合状态
      for (const paramName of mouthParams) {
        try {
          model.internalModel.coreModel.setParameterValueById(paramName, 0)
        } catch (paramError) {
          // 某些参数可能在特定状态下无法设置，记录警告但继续
          console.warn(`重置参数 ${paramName} 失败:`, paramError)
        }
      }
      console.log(`已重置 ${mouthParams.length} 个嘴部参数`)
    }

    // === 第四步：更新UI状态 ===
    // 重置说话状态，这会触发UI更新
    // - "开始说话"按钮变为可用
    // - "停止说话"按钮变为禁用
    // - 状态显示变为"待机中"
    isSpeaking.value = false

    console.log('口型同步已完全停止')

  } catch (error) {
    // === 全局错误处理 ===
    console.error('停止口型同步失败:', error)

    // 即使出现错误，也要强制重置状态
    // 确保UI不会卡在"正在说话"状态
    isSpeaking.value = false

    // 在生产环境中，可以在这里添加用户通知
    // 例如：显示"停止时出现问题，但已强制重置"的消息
  }
}

// ==================== 性能监控相关 ====================

/**
 * 性能监控数据
 */
const performanceStats = ref({
  fps: 0,
  memoryUsage: 0,
  renderTime: 0,
  lastUpdate: Date.now()
})

/**
 * 启动性能监控
 */
function startPerformanceMonitoring() {
  if (!app) return

  let frameCount = 0
  let lastTime = performance.now()

  const updateStats = () => {
    const currentTime = performance.now()
    frameCount++

    // 每秒更新一次统计
    if (currentTime - lastTime >= 1000) {
      performanceStats.value.fps = Math.round(frameCount * 1000 / (currentTime - lastTime))

      // 获取内存使用情况（如果可用）
      if (performance.memory) {
        performanceStats.value.memoryUsage = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)
      }

      performanceStats.value.renderTime = app.ticker.deltaMS
      performanceStats.value.lastUpdate = Date.now()

      frameCount = 0
      lastTime = currentTime
    }

    requestAnimationFrame(updateStats)
  }

  updateStats()
  console.log('性能监控已启动')
}

// 等待Canvas元素准备就绪
async function waitForCanvasReady() {
  console.log('等待Canvas元素准备就绪...')

  const maxAttempts = 50 // 最多等待5秒
  let attempts = 0

  while (attempts < maxAttempts) {
    if (canvas.value) {
      const rect = canvas.value.getBoundingClientRect()
      console.log(`Canvas检查 ${attempts + 1}: 元素存在=${!!canvas.value}, 尺寸=${rect.width}x${rect.height}`)

      if (rect.width > 0 && rect.height > 0) {
        console.log('✅ Canvas元素准备就绪')
        return true
      }
    }

    attempts++
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  console.warn('⚠️ Canvas元素准备超时，继续使用默认配置')
  return false
}

// 检查Live2D核心库是否正确加载
function checkLive2DLibraries() {
  console.log('=== 检查Live2D库 ===')

  // 检查Live2D核心库
  if (typeof window.Live2DCubismCore === 'undefined') {
    console.error('❌ Live2DCubismCore未加载！请检查live2dcubismcore.min.js是否正确加载')
    return false
  }
  console.log('✅ Live2DCubismCore已加载')

  // 检查PIXI Live2D插件
  if (typeof Live2DModel === 'undefined') {
    console.error('❌ Live2DModel未定义！请检查pixi-live2d-display库是否正确加载')
    return false
  }
  console.log('✅ Live2DModel已加载')

  // 检查PIXI
  if (typeof PIXI === 'undefined') {
    console.error('❌ PIXI未定义！请检查pixi.js库是否正确加载')
    return false
  }
  console.log('✅ PIXI已加载，版本:', PIXI.VERSION)

  console.log('=== Live2D库检查完成 ===')
  return true
}

onMounted(async () => {
  try {
    console.log('=== 应用开始初始化 ===')

    // === 检查依赖库 ===
    if (!checkLive2DLibraries()) {
      throw new Error('Live2D依赖库检查失败，请刷新页面重试')
    }

    // === 检测运行环境 ===
    // 检查是否应该使用模拟器
    if (shouldUseSimulator()) {
      console.log('🎭 启动桌面宠物模拟器模式')
      initDesktopPetSimulator()
      isSimulatorMode.value = true
      isDesktopPetMode.value = true
    } else {
      // 检查是否在真实的 Electron 环境中运行
      isElectron.value = !!(window.desktopPet || window.electronAPI)
      isDesktopPetMode.value = isElectron.value
    }

    console.log('运行环境检测:', {
      isElectron: isElectron.value,
      isDesktopPetMode: isDesktopPetMode.value,
      isSimulatorMode: isSimulatorMode.value,
      userAgent: navigator.userAgent
    })

    // === 桌面宠物模式初始化 ===
    if (isDesktopPetMode.value) {
      // 设置透明背景和桌面宠物模式类
      document.body.classList.add('desktop-pet-mode')
      document.body.style.background = 'transparent'
      document.body.style.margin = '0'
      document.body.style.padding = '0'

      // 启用窗口拖拽
      if (window.desktopPet) {
        window.desktopPet.enableWindowDrag()
        console.log('桌面宠物模式已启用')
      }
    }

    audioContext = new AudioContext();

    // === 等待DOM完全渲染 ===
    await nextTick()

    // === 等待Canvas元素准备就绪 ===
    await waitForCanvasReady()

    // === 检查必要的依赖 ===
    console.log('检查依赖库...')
    console.log('PIXI版本:', PIXI.VERSION)
    console.log('Live2DModel可用:', typeof Live2DModel !== 'undefined')
    console.log('Canvas元素:', canvas.value)

    if (!canvas.value) {
      throw new Error('Canvas元素未找到')
    }

    // === PIXI 应用配置 ===
    const pixiConfig = {
      view: canvas.value,
      width: isDesktopPetMode.value ? 300 : 600,
      height: isDesktopPetMode.value ? 400 : 600,
      backgroundColor: isDesktopPetMode.value ? 0x000000 : 0x000000,
      backgroundAlpha: isDesktopPetMode.value ? 0 : 1,
      autoDensity: true,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      // === 性能优化配置 ===
      powerPreference: 'high-performance', // 使用高性能GPU
      preserveDrawingBuffer: false, // 减少内存占用
      clearBeforeRender: true, // 确保每帧清理
      forceCanvas: false, // 优先使用WebGL
    }

    console.log('PIXI 应用配置:', pixiConfig)

    // 创建PIXI应用
    app = new PIXI.Application(pixiConfig)

    if (!app) {
      throw new Error('PIXI应用创建失败')
    }

    console.log('PIXI应用创建成功')
    console.log('PIXI渲染器:', app.renderer.type === PIXI.RENDERER_TYPE.WEBGL ? 'WebGL' : 'Canvas')
    console.log('Canvas实际尺寸:', app.view.width, 'x', app.view.height)
    console.log('Canvas CSS尺寸:', app.view.style.width, 'x', app.view.style.height)

    // 配置 SoundManager
    SoundManager.volume = audioVolume.value

    // 添加模型更新循环
    app.ticker.add(() => {
      if (model) {
        model.update(app.ticker.deltaMS)
      }
    })

    // 添加窗口大小变化监听器
    window.addEventListener('resize', handleResize)

    // 启动性能监控
    if (isDevelopmentMode.value) {
      startPerformanceMonitoring()
    }

    // 加载默认模型
    await loadModel(currentModelName.value)
  } catch (error) {
    console.error('应用初始化失败:', error)
  }
})

// ==================== 桌面宠物模式处理方法 ====================

/**
 * 处理模型缩放变化
 * @param {number} scale - 新的缩放比例 (0.5 - 2.0)
 */
function handleScaleChange(scale) {
  if (model) {
    model.scale.set(scale)
    console.log(`模型缩放已调整为: ${scale}`)
  }
}

/**
 * 处理透明度变化
 * @param {number} opacity - 新的透明度 (0.2 - 1.0)
 */
function handleOpacityChange(opacity) {
  if (model) {
    model.alpha = opacity
    console.log(`模型透明度已调整为: ${opacity}`)
  }
}

/**
 * 处理位置锁定状态变化
 * @param {boolean} isLocked - 是否锁定位置
 */
function handlePositionLockChange(isLocked) {
  console.log(`位置锁定状态: ${isLocked ? '已锁定' : '已解锁'}`)

  // 可以在这里添加额外的位置锁定逻辑
  if (isLocked) {
    // 锁定时可以显示一个小图标或提示
    console.log('位置已锁定，拖拽功能已禁用')
  } else {
    console.log('位置已解锁，可以拖拽移动')
  }
}

/**
 * 处理始终置顶状态变化
 * @param {boolean} isOnTop - 是否始终置顶
 */
function handleAlwaysOnTopChange(isOnTop) {
  console.log(`始终置顶状态: ${isOnTop ? '已启用' : '已禁用'}`)

  // 可以在这里添加UI反馈
  if (window.desktopPet) {
    window.desktopPet.showNotification(
      '桌面宠物',
      `始终置顶已${isOnTop ? '启用' : '禁用'}`
    )
  }
}

onUnmounted(() => {
  console.log('=== 开始清理应用资源 ===')

  // 停止口型同步
  stopSpeaking()

  // 停止音频播放
  stopAudio()

  // 清理音频上下文
  if (currentAudioContext && currentAudioContext.state !== 'closed') {
    currentAudioContext.close()
    currentAudioContext = null
  }

  // 清理事件监听器
  window.removeEventListener('resize', handleResize)

  // 清理模型和应用
  if (model) {
    console.log('销毁Live2D模型')
    model.destroy({ children: true, texture: true, baseTexture: true })
    model = null
  }

  if (app) {
    console.log('销毁PIXI应用')
    app.destroy(true, { children: true, texture: true, baseTexture: true })
    app = null
  }

  // 强制垃圾回收（如果可用）
  if (window.gc) {
    window.gc()
  }

  console.log('=== 应用资源清理完成 ===')
})

// 获取 Canvas 的逻辑尺寸（CSS 尺寸，不受 devicePixelRatio 影响）
function getCanvasLogicalSize() {
  try {
    const defaultWidth = isDesktopPetMode.value ? 300 : 600
    const defaultHeight = isDesktopPetMode.value ? 400 : 600

    // 优先使用原始canvas元素
    if (canvas.value) {
      const rect = canvas.value.getBoundingClientRect()
      console.log('Canvas原始元素尺寸:', rect.width, 'x', rect.height)

      if (rect.width > 0 && rect.height > 0) {
        return {
          width: rect.width,
          height: rect.height
        }
      }
    }

    // 备用方案：使用PIXI应用的view
    if (app && app.view) {
      const rect = app.view.getBoundingClientRect()
      console.log('PIXI view尺寸:', rect.width, 'x', rect.height)

      if (rect.width > 0 && rect.height > 0) {
        return {
          width: rect.width,
          height: rect.height
        }
      }
    }

    console.warn('无法获取有效的Canvas尺寸，使用默认尺寸:', defaultWidth, 'x', defaultHeight)
    return {
      width: defaultWidth,
      height: defaultHeight
    }
  } catch (error) {
    console.error('获取Canvas尺寸失败:', error)
    const defaultWidth = isDesktopPetMode.value ? 300 : 600
    const defaultHeight = isDesktopPetMode.value ? 400 : 600
    return {
      width: defaultWidth,
      height: defaultHeight
    }
  }
}

// 处理窗口大小变化
function handleResize() {
  if (!model || !isModelLoaded.value || !app) return

  // 防抖处理，避免频繁调整
  clearTimeout(handleResize.timeoutId)
  handleResize.timeoutId = setTimeout(() => {
    console.log('窗口大小变化，重新调整模型')
    const { width: canvasWidth, height: canvasHeight } = getCanvasLogicalSize()
    console.log(`Canvas 逻辑尺寸: ${canvasWidth} x ${canvasHeight}, 设备像素比: ${window.devicePixelRatio}`)
    autoFitModel(model, canvasWidth, canvasHeight)
  }, 300)
}

// 加载模型函数
// 自动计算模型缩放比例
function calculateAutoScale(model, canvasWidth, canvasHeight) {
  try {
    // 先设置一个基础缩放来获取准确的边界框
    model.scale.set(1.0)

    // 获取模型的边界框
    const bounds = model.getBounds()
    console.log('模型边界框:', bounds)

    if (!bounds || bounds.width === 0 || bounds.height === 0) {
      console.warn('无法获取模型边界框，使用默认缩放')
      return getDefaultScale(currentModelName.value)
    }

    // 计算模型原始尺寸
    const modelWidth = bounds.width
    const modelHeight = bounds.height

    // 设置目标尺寸（留出边距）
    const targetWidth = canvasWidth * 1  // 使用 canvas 75% 的宽度
    const targetHeight = canvasHeight * 1 // 使用 canvas 85% 的高度

    // 计算缩放比例（取较小值以确保模型完全显示）
    const scaleX = targetWidth / modelWidth
    const scaleY = targetHeight / modelHeight
    const scale = Math.min(scaleX, scaleY)

    console.log(`模型尺寸: ${modelWidth.toFixed(2)} x ${modelHeight.toFixed(2)}`)
    console.log(`目标尺寸: ${targetWidth.toFixed(2)} x ${targetHeight.toFixed(2)}`)
    console.log(`计算缩放: scaleX=${scaleX.toFixed(4)}, scaleY=${scaleY.toFixed(4)}, 最终=${scale.toFixed(4)}`)

    // 限制缩放范围，避免过大或过小
    const finalScale = Math.max(0.01, Math.min(1.5, scale))

    // 如果计算出的缩放过小，使用默认值
    if (finalScale < 0.02) {
      console.warn('计算出的缩放过小，使用默认缩放')
      return getDefaultScale(currentModelName.value)
    }

    return finalScale
  } catch (error) {
    console.error('计算自动缩放失败:', error)
    return getDefaultScale(currentModelName.value)
  }
}

// 获取模型的默认缩放值
function getDefaultScale(modelName) {
  const defaultScales = {
    'idol': 0.08,
    'lanhei': 0.12,
    'hibiki': 0.15,
    'hiyori': 0.18,
    'mark': 0.16,
    'natori': 0.14,
    'kei_basic': 0.20,
    'kei_vowels': 0.20
  }
  return defaultScales[modelName] || 0.1
}

// 自动调整模型位置和缩放
function autoFitModel(model, canvasWidth, canvasHeight) {
  try {
    // 计算自动缩放
    const autoScale = calculateAutoScale(model, canvasWidth, canvasHeight)
    model.scale.set(autoScale)

    // 等待一帧以确保缩放生效
    requestAnimationFrame(() => {
      try {
        // 重新获取缩放后的边界框
        const scaledBounds = model.getBounds()

        // 计算居中位置
        const centerX = canvasWidth / 2
        const centerY = canvasHeight / 2

        // 设置模型位置
        model.position.set(
          centerX - scaledBounds.width / 2,
          centerY - scaledBounds.height / 2
        )

        console.log(`模型自动调整完成: scale=${autoScale.toFixed(4)}, position=(${model.position.x.toFixed(2)}, ${model.position.y.toFixed(2)})`)
        console.log(`缩放后边界框: width=${scaledBounds.width.toFixed(2)}, height=${scaledBounds.height.toFixed(2)}`)
      } catch (error) {
        console.error('设置模型位置失败:', error)
        // 使用简单的居中方案
        model.position.set(canvasWidth / 2, canvasHeight / 2)
      }
    })
  } catch (error) {
    console.error('自动调整模型失败:', error)
    // 使用备用方案
    const defaultScale = getDefaultScale(currentModelName.value)
    model.scale.set(defaultScale)
    model.position.set(canvasWidth / 2, canvasHeight / 2)
  }
}

async function loadModel(modelName) {
  try {
    console.log(`=== 开始加载模型: ${modelName} ===`)
    isModelLoaded.value = false

    // 检查必要的依赖
    if (!app) {
      throw new Error('PIXI应用未初始化')
    }

    if (!Live2DModel) {
      throw new Error('Live2DModel未定义，请检查pixi-live2d-display库是否正确加载')
    }

    // 移除旧模型
    if (model) {
      console.log('移除旧模型')
      app.stage.removeChild(model)
      model.destroy()
      model = null
    }

    const config = modelConfigs[modelName]
    if (!config) {
      throw new Error(`未找到模型配置: ${modelName}`)
    }

    console.log(`模型配置:`, config)
    console.log(`模型路径: ${config.path}`)

    // 检查模型文件是否存在
    try {
      const response = await fetch(config.path)
      if (!response.ok) {
        throw new Error(`模型文件不存在或无法访问: ${config.path} (状态码: ${response.status})`)
      }
      console.log('模型文件检查通过')
    } catch (fetchError) {
      throw new Error(`无法访问模型文件: ${fetchError.message}`)
    }

    // 加载模型
    console.log('开始加载Live2D模型...')
    model = await Live2DModel.from(config.path)

    if (!model) {
      throw new Error('模型加载返回null')
    }

    console.log('模型加载成功:', model)
    console.log('模型内部结构:', model.internalModel)

    // 添加事件监听器
    if (model.internalModel && model.internalModel.motionManager) {
      // 添加动作开始事件监听器
      model.internalModel.motionManager.on('motionStart', (group, index, audio) => {
        console.log(`动作开始: 组=${group}, 索引=${index}`)
        if (audio) {
          console.log('动作包含音频，已自动播放')
        }
      })

      // 添加动作结束事件监听器
      model.internalModel.motionManager.on('motionFinish', (group, index) => {
        console.log(`动作结束: 组=${group}, 索引=${index}`)
      })
    }

    // 添加到舞台
    console.log('添加模型到PIXI舞台')
    app.stage.addChild(model)

    // 等待多帧以确保模型完全渲染
    await new Promise(resolve => {
      let frameCount = 0
      const waitFrame = () => {
        frameCount++
        if (frameCount < 3) {
          requestAnimationFrame(waitFrame)
        } else {
          resolve()
        }
      }
      requestAnimationFrame(waitFrame)
    })

    // 检查模型是否正确添加到舞台
    if (!app.stage.children.includes(model)) {
      throw new Error('模型未能正确添加到PIXI舞台')
    }

    console.log('模型已添加到舞台，开始调整位置和缩放')

    // 自动调整模型缩放和位置
    const { width: canvasWidth, height: canvasHeight } = getCanvasLogicalSize()
    console.log(`Canvas 逻辑尺寸: ${canvasWidth} x ${canvasHeight}`)

    if (canvasWidth > 0 && canvasHeight > 0) {
      autoFitModel(model, canvasWidth, canvasHeight)
    } else {
      console.warn('Canvas尺寸无效，使用默认位置和缩放')
      const defaultScale = getDefaultScale(modelName)
      model.scale.set(defaultScale)
      model.position.set(canvasWidth / 2, canvasHeight / 2)
    }

    // 重置选择
    selectedMotion.value = ''
    selectedExpression.value = ''
    selectedSound.value = ''

    // 停止当前音频
    stopAudio()

    isModelLoaded.value = true
    console.log(`=== 模型 ${config.name} 加载完成 ===`)

    // 强制渲染多次确保显示
    for (let i = 0; i < 3; i++) {
      await new Promise(resolve => requestAnimationFrame(resolve))
      if (app.renderer) {
        app.renderer.render(app.stage)
      }
    }

    // 验证模型是否可见
    console.log('模型最终状态:')
    console.log('- 位置:', model.position.x, model.position.y)
    console.log('- 缩放:', model.scale.x, model.scale.y)
    console.log('- 可见性:', model.visible)
    console.log('- 透明度:', model.alpha)
    console.log('- 舞台子元素数量:', app.stage.children.length)

  } catch (error) {
    console.error('=== 模型加载失败 ===')
    console.error('错误详情:', error)
    console.error('错误堆栈:', error.stack)
    isModelLoaded.value = false

    // 清理可能的残留状态
    if (model) {
      try {
        if (app && app.stage && app.stage.children.includes(model)) {
          app.stage.removeChild(model)
        }
        model.destroy()
      } catch (cleanupError) {
        console.error('清理模型时出错:', cleanupError)
      }
      model = null
    }
  }
}

const randomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// 切换模型
async function changeModel(modelName) {
  console.log('切换模型请求:', modelName)

  // 如果传入了模型名称，更新当前模型名称
  if (modelName && typeof modelName === 'string') {
    currentModelName.value = modelName
    console.log('更新currentModelName为:', modelName)
  }

  // 加载模型
  await loadModel(currentModelName.value)
}

// 播放指定动作
async function playMotion() {
  if (!model || !isModelLoaded.value || !selectedMotion.value) {
    console.warn('模型未加载或未选择动作')
    return
  }

  try {
    console.log(`播放动作: ${selectedMotion.value}`)

    // 停止当前所有动作
    model.internalModel.motionManager.stopAllMotions()

    // 检查模型是否有预定义的动作组
    const hasPreDefinedMotions = model.internalModel.settings.motions &&
                                Object.keys(model.internalModel.settings.motions).length > 0

    if (hasPreDefinedMotions) {
      // 对于有预定义动作组的模型（如 hibiki, hiyori）
      // 查找动作在哪个组中
      const motions = model.internalModel.settings.motions
      let foundGroup = null
      let foundIndex = -1

      for (const [groupName, motionList] of Object.entries(motions)) {
        const index = motionList.findIndex(motion => motion.File === selectedMotion.value)
        if (index !== -1) {
          foundGroup = groupName
          foundIndex = index
          break
        }
      }

      if (foundGroup !== null) {
        console.log(`使用预定义动作组: ${foundGroup}, 索引: ${foundIndex}`)
        await model.motion(foundGroup, foundIndex, MotionPriority.NORMAL)
      } else {
        console.warn('在预定义动作组中未找到指定动作')
      }
    } else {
      // 对于只有独立动作文件的模型（如 idol, lanhei）
      // 需要动态加载动作文件
      const motionPath = `/models/${currentModelName.value}/${selectedMotion.value}`
      console.log(`加载独立动作文件: ${motionPath}`)

      try {
        const response = await fetch(motionPath)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const motionData = await response.json()

        // 使用 motionManager 直接播放动作
        await model.internalModel.motionManager.startMotion(
          'custom', // 自定义组名
          0, // 索引
          MotionPriority.NORMAL,
          null, // onFinish callback
          motionData // 直接传入动作数据
        )

        console.log('独立动作文件播放成功')
      } catch (fetchError) {
        console.error('加载动作文件失败:', fetchError)
        return
      }
    }

    // 如果动作有对应的音频，自动播放
    const motions = currentConfig.value.motions
    const selectedMotionData = motions.find(motion => motion.file === selectedMotion.value)
    if (selectedMotionData && selectedMotionData.sound) {
      playAudioFile(selectedMotionData.sound)
    }

    console.log('动作播放成功')
  } catch (error) {
    console.error('播放动作失败:', error)
  }
}

// 直接播放指定动作文件
async function playMotionFile(motionFile) {
  if (!model || !isModelLoaded.value) {
    console.warn('模型还未加载完成')
    return
  }

  try {
    console.log(`直接播放动作文件: ${motionFile}`)

    // 设置选中的动作
    selectedMotion.value = motionFile

    // 调用播放动作函数
    await playMotion()
  } catch (error) {
    console.error('播放动作文件失败:', error)
  }
}

// 播放随机动作
async function playRandomMotion() {
  if (!model || !isModelLoaded.value) {
    console.warn('模型还未加载完成')
    return
  }

  const motions = currentConfig.value.motions
  if (motions.length === 0) return

  const randomMotion = motions[randomInt(0, motions.length - 1)]
  selectedMotion.value = randomMotion.file

  // 调用修复后的 playMotion 函数
  await playMotion()
}

// 重置所有表情参数到默认值
async function resetAllExpressionParameters() {
  if (!model || !isModelLoaded.value) return

  try {
    const coreModel = model.internalModel.coreModel

    // 获取所有表情文件中涉及的参数ID
    const allExpressionParams = new Set()

    // 遍历当前模型的所有表情文件
    const expressions = currentConfig.value.expressions
    for (const exp of expressions) {
      if (exp.file) {
        try {
          const expressionPath = `/models/${currentModelName.value}/${exp.file}`
          const response = await fetch(expressionPath)
          if (response.ok) {
            const data = await response.json()
            if (data.Parameters) {
              data.Parameters.forEach(param => allExpressionParams.add(param.Id))
            }
          }
        } catch (error) {
          console.warn(`加载表情文件 ${exp.file} 失败:`, error.message)
        }
      }
    }

    console.log(`找到 ${allExpressionParams.size} 个表情参数需要重置`)

    // 将所有表情参数重置为默认值
    allExpressionParams.forEach(paramId => {
      try {
        let paramIndex = -1

        // 尝试不同的获取参数索引的方法
        if (typeof coreModel.getParameterIndexById === 'function') {
          paramIndex = coreModel.getParameterIndexById(paramId)
        } else if (typeof coreModel.getParameterIndex === 'function') {
          paramIndex = coreModel.getParameterIndex(paramId)
        }

        if (paramIndex >= 0) {
          // 获取默认值
          let defaultValue = 0
          if (typeof coreModel.getParameterDefaultValueByIndex === 'function') {
            defaultValue = coreModel.getParameterDefaultValueByIndex(paramIndex)
          } else if (typeof coreModel.getParameterDefaultValue === 'function') {
            defaultValue = coreModel.getParameterDefaultValue(paramIndex)
          }

          // 设置为默认值
          if (typeof coreModel.setParameterValueByIndex === 'function') {
            coreModel.setParameterValueByIndex(paramIndex, defaultValue)
            console.log(`重置参数 ${paramId} (索引${paramIndex}) = ${defaultValue}`)
          } else if (typeof coreModel.setParameterValue === 'function') {
            coreModel.setParameterValue(paramIndex, defaultValue)
            console.log(`重置参数 ${paramId} (索引${paramIndex}) = ${defaultValue}`)
          } else {
            // 备用方法：使用 setParameterValueById
            coreModel.setParameterValueById(paramId, defaultValue)
            console.log(`重置参数 ${paramId} = ${defaultValue} (使用ID方法)`)
          }
        } else {
          console.warn(`未找到参数索引: ${paramId}`)
        }
      } catch (error) {
        console.warn(`重置参数 ${paramId} 失败:`, error.message)
      }
    })

    console.log('表情参数已重置到默认值')
  } catch (error) {
    console.error('重置表情参数失败:', error)
  }
}

// 从文件应用表情
async function applyExpressionFromFile(expressionFile) {
  try {
    const expressionPath = `/models/${currentModelName.value}/${expressionFile}`
    console.log(`加载表情文件: ${expressionPath}`)

    const response = await fetch(expressionPath)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const expressionData = await response.json()

    if (expressionData.Type !== 'Live2D Expression' || !expressionData.Parameters) {
      throw new Error('无效的表情文件格式')
    }

    // 应用表情参数
    const coreModel = model.internalModel.coreModel

    for (const param of expressionData.Parameters) {
      try {
        let newValue = param.Value

        // 处理不同的混合模式
        if (param.Blend === 'Add') {
          const currentValue = coreModel.getParameterValueById(param.Id)
          newValue = currentValue + param.Value
        } else if (param.Blend === 'Multiply') {
          const currentValue = coreModel.getParameterValueById(param.Id)
          newValue = currentValue * param.Value
        }
        // 默认是 'Overwrite' 模式，直接设置值

        coreModel.setParameterValueById(param.Id, newValue)
        console.log(`设置参数 ${param.Id} = ${newValue} (模式: ${param.Blend || 'Overwrite'})`)
      } catch (error) {
        console.warn(`设置参数失败 ${param.Id}:`, error)
      }
    }

    console.log('表情文件应用成功')
  } catch (error) {
    console.error('应用表情文件失败:', error)
    throw error
  }
}

// 播放指定表情
async function playExpression() {
  if (!model || !isModelLoaded.value || !selectedExpression.value) {
    console.warn('模型未加载或未选择表情')
    return
  }

  const expressions = currentConfig.value.expressions
  const selectedExp = expressions.find(exp => exp.file === selectedExpression.value)

  if (!selectedExp) {
    console.warn('未找到选中的表情')
    return
  }

  try {
    console.log(`播放表情: ${selectedExp.name} (${selectedExp.file})`)
    
    // 检查模型是否有预定义的表情
    const hasPreDefinedExpressions = model.internalModel.settings.expressions &&
                                   model.internalModel.settings.expressions.length > 0

    if (hasPreDefinedExpressions) {
      // 对于预定义表情，不需要重置参数，直接应用表情
      // 对于有预定义表情的模型（如 hibiki, natori）
      const expressions = model.internalModel.settings.expressions
      const foundExpression = expressions.find(exp => exp.File === selectedExpression.value)

      if (foundExpression) {
        console.log(`使用预定义表情: ${foundExpression.Name}`)

        // 尝试不同的表情应用方法
        try {
          // 方法1: 直接使用表情管理器
          const expressionManager = model.internalModel.motionManager.expressionManager
          if (expressionManager && typeof expressionManager.setExpression === 'function') {
            expressionManager.setExpression(foundExpression.Name)
            console.log(`通过表情管理器设置表情: ${foundExpression.Name}`)
          } else {
            // 方法2: 使用模型的表情方法
            const result = model.expression(foundExpression.Name)
            if (result && typeof result.play === 'function') {
              result.play()
              console.log(`通过 expression().play() 设置表情: ${foundExpression.Name}`)
            } else {
              console.log(`通过 expression() 设置表情: ${foundExpression.Name}`)
            }
          }
        } catch (error) {
          console.error('设置预定义表情失败:', error)
          // 备用方法：尝试使用索引
          if (selectedExp.index !== undefined) {
            model.expression(selectedExp.index)
          }
        }
      } else {
        // 尝试使用索引
        if (selectedExp.index !== undefined) {
          model.expression(selectedExp.index)
        } else {
          console.warn('在预定义表情中未找到指定表情')
        }
      }
    } else {
      // 对于只有独立表情文件的模型（如 idol, lanhei）
      console.log('使用独立表情文件')

      // 第一步：重置所有表情参数
      await resetAllExpressionParameters()

      // 第二步：应用新的表情
      await applyExpressionFromFile(selectedExpression.value)
    }

    console.log('表情切换成功')
  } catch (error) {
    console.error('表情切换失败:', error)
  }
}

// 播放随机表情
async function playRandomExpression() {
  if (!model || !isModelLoaded.value) {
    console.warn('模型还未加载完成')
    return
  }

  const expressions = currentConfig.value.expressions
  if (expressions.length === 0) return

  const randomExp = expressions[randomInt(0, expressions.length - 1)]
  selectedExpression.value = randomExp.file

  // 调用修复后的 playExpression 函数
  await playExpression()
}

// 设置表情（通过索引）
async function setExpression(expressionIndex) {
  if (!model || !isModelLoaded.value) {
    console.warn('模型还未加载完成')
    return
  }

  try {
    console.log(`设置表情索引: ${expressionIndex}`)

    // 检查模型是否有预定义的表情
    const hasPreDefinedExpressions = model.internalModel.settings.expressions &&
                                   model.internalModel.settings.expressions.length > 0

    if (hasPreDefinedExpressions) {
      // 对于有预定义表情的模型
      const expressions = model.internalModel.settings.expressions
      if (expressionIndex < expressions.length) {
        const expression = expressions[expressionIndex]
        console.log(`使用预定义表情: ${expression.Name}`)

        try {
          // 方法1: 直接使用表情管理器
          const expressionManager = model.internalModel.motionManager.expressionManager
          if (expressionManager && typeof expressionManager.setExpression === 'function') {
            expressionManager.setExpression(expression.Name)
            console.log(`通过表情管理器设置表情: ${expression.Name}`)
          } else {
            // 方法2: 使用模型的表情方法
            const result = model.expression(expression.Name)
            if (result && typeof result.play === 'function') {
              result.play()
              console.log(`通过 expression().play() 设置表情: ${expression.Name}`)
            } else {
              console.log(`通过 expression() 设置表情: ${expression.Name}`)
            }
          }
        } catch (error) {
          console.error('设置预定义表情失败:', error)
          // 备用方法：使用索引
          model.expression(expressionIndex)
        }
      }
    } else {
      // 对于没有预定义表情的模型，使用文件方式
      const expressions = currentConfig.value.expressions
      if (expressionIndex < expressions.length) {
        const expression = expressions[expressionIndex]
        selectedExpression.value = expression.file
        await playExpression()
      }
    }
  } catch (error) {
    console.error('设置表情失败:', error)
  }
}

// 重置表情到默认状态
async function resetExpression() {
  if (!model || !isModelLoaded.value) {
    console.warn('模型还未加载完成')
    return
  }

  try {
    console.log('重置表情到默认状态')

    // 检查模型是否有预定义的表情
    const hasPreDefinedExpressions = model.internalModel.settings.expressions &&
                                   model.internalModel.settings.expressions.length > 0

    if (hasPreDefinedExpressions) {
      // 对于有预定义表情的模型，使用表情管理器重置
      try {
        model.internalModel.motionManager.expressionManager.setExpression(null)
        console.log('使用表情管理器重置成功')
      } catch (error) {
        // 备用方法：设置第一个表情或随机表情
        model.expression(0)
        console.log('使用备用方法重置表情')
      }
    } else {
      // 对于只有独立表情文件的模型，重置所有参数到默认值
      await resetAllExpressionParameters()
      console.log('重置独立表情参数成功')
    }

    // 清除选中的表情
    selectedExpression.value = ''

    console.log('表情重置成功')
  } catch (error) {
    console.error('表情重置失败:', error)
  }
}

// 手动重新调整模型大小和位置
function refitModel() {
  if (!model || !isModelLoaded.value || !app) {
    console.warn('模型未加载或应用未初始化')
    return
  }

  try {
    console.log('手动重新调整模型')
    const { width: canvasWidth, height: canvasHeight } = getCanvasLogicalSize()
    console.log(`手动调整 Canvas 逻辑尺寸: ${canvasWidth} x ${canvasHeight}`)
    autoFitModel(model, canvasWidth, canvasHeight)
    console.log('模型重新调整完成')
  } catch (error) {
    console.error('重新调整模型失败:', error)
  }
}

// ==================== 音频控制函数 ====================

// 播放指定音频文件
function playAudioFile(soundPath) {
  try {
    // 停止当前音频
    stopAudio()

    // 创建新的音频对象
    const audioPath = `/models/${currentModelName.value}/${soundPath}`
    console.log(`播放音频: ${audioPath}`)

    currentAudio.value = new Audio(audioPath)
    currentAudio.value.volume = audioVolume.value

    // 设置音频事件监听器
    setupAudioEventListeners()

    // 播放音频
    currentAudio.value.play()
    isPlaying.value = true
    isPaused.value = false

    console.log('音频播放成功')
  } catch (error) {
    console.error('播放音频失败:', error)
  }
}

// 播放选中的音频
function playSelectedAudio() {
  if (!selectedSound.value) {
    console.warn('未选择音频文件')
    return
  }

  playAudioFile(selectedSound.value)
}

// 暂停音频
function pauseAudio() {
  if (currentAudio.value && isPlaying.value) {
    currentAudio.value.pause()
    isPlaying.value = false
    isPaused.value = true
    console.log('音频已暂停')
  }
}

// 恢复播放音频
function resumeAudio() {
  if (currentAudio.value && isPaused.value) {
    currentAudio.value.play()
    isPlaying.value = true
    isPaused.value = false
    console.log('音频已恢复播放')
  }
}

// 停止音频
function stopAudio() {
  if (currentAudio.value) {
    currentAudio.value.pause()
    currentAudio.value.currentTime = 0
    isPlaying.value = false
    isPaused.value = false
    audioProgress.value = 0
    audioCurrentTime.value = 0
    console.log('音频已停止')
  }
}

// 设置音频音量
function setVolume(volume) {
  audioVolume.value = volume

  // 同时设置 SoundManager 的全局音量
  SoundManager.volume = volume

  if (currentAudio.value) {
    currentAudio.value.volume = volume
  }
}

// 更新全局音量（桌面模式使用）
function updateGlobalVolume() {
  setVolume(audioVolume.value)
}

// 显示用户友好的错误提示
function showUserError(message, details = null) {
  console.error('用户错误:', message, details)

  // 在桌面模式下，可以显示更友好的错误提示
  if (isDesktopPetMode.value) {
    // 可以在这里添加桌面通知或其他用户反馈机制
    if (window.desktopPet && typeof window.desktopPet.showNotification === 'function') {
      window.desktopPet.showNotification(message, 'error')
    }
  } else {
    // Web模式下可以使用alert或其他方式
    alert(`错误: ${message}`)
  }
}

// 显示成功提示
function showUserSuccess(message) {
  console.log('成功:', message)

  if (isDesktopPetMode.value) {
    if (window.desktopPet && typeof window.desktopPet.showNotification === 'function') {
      window.desktopPet.showNotification(message, 'success')
    }
  }
}

// 设置音频播放位置
function seekAudio(progress) {
  if (currentAudio.value && audioDuration.value > 0) {
    const newTime = (progress / 100) * audioDuration.value
    currentAudio.value.currentTime = newTime
    audioProgress.value = progress
    audioCurrentTime.value = newTime
  }
}

// 设置音频事件监听器
function setupAudioEventListeners() {
  if (!currentAudio.value) return

  // 音频加载完成
  currentAudio.value.addEventListener('loadedmetadata', () => {
    audioDuration.value = currentAudio.value.duration
  })

  // 音频播放进度更新
  currentAudio.value.addEventListener('timeupdate', () => {
    if (currentAudio.value) {
      audioCurrentTime.value = currentAudio.value.currentTime
      if (audioDuration.value > 0) {
        audioProgress.value = (currentAudio.value.currentTime / audioDuration.value) * 100
      }
    }
  })

  // 音频播放结束
  currentAudio.value.addEventListener('ended', () => {
    isPlaying.value = false
    isPaused.value = false
    audioProgress.value = 0
    audioCurrentTime.value = 0
    console.log('音频播放完成')
  })

  // 音频播放错误
  currentAudio.value.addEventListener('error', (e) => {
    console.error('音频播放错误:', e)
    isPlaying.value = false
    isPaused.value = false
  })
}

// 格式化时间显示
function formatTime(seconds) {
  if (isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
</script>

<template>
  <!-- 桌面宠物模式 -->
  <div v-if="isDesktopPetMode" class="desktop-pet-container">
    <!-- Live2D 模型显示区域 -->
    <div class="model-display">
      <canvas
        ref="canvas"
        class="live2d-canvas"
        :width="300"
        :height="400"
        style="width: 300px; height: 400px; display: block;"
      ></canvas>

      <!-- 模型状态指示器 -->
      <div class="model-status" v-if="!isModelLoaded">
        <div class="loading-spinner"></div>
        <span>加载中...</span>
      </div>
    </div>

    <!-- 桌面宠物控制组件 -->
    <DesktopPetControls
      :selected-model="currentModelName"
      :is-model-loaded="isModelLoaded"
      @model-change="changeModel"
      @scale-change="handleScaleChange"
      @opacity-change="handleOpacityChange"
      @position-lock-change="handlePositionLockChange"
      @always-on-top-change="handleAlwaysOnTopChange"
      @refit-model="refitModel"
    >
      <!-- 表情控制内容 -->
      <template #expressions-content>
        <div class="expressions-controls">
          <!-- 表情选择 -->
          <div class="control-group">
            <label>选择表情:</label>
            <select v-model="selectedExpression" :disabled="!isModelLoaded">
              <option value="">-- 请选择表情 --</option>
              <option
                v-for="expression in currentConfig.expressions"
                :key="expression.file"
                :value="expression.file"
              >
                {{ expression.name }}
              </option>
            </select>
          </div>

          <!-- 表情控制按钮 -->
          <div class="control-group">
            <div class="button-row">
              <button
                @click="playExpression"
                :disabled="!isModelLoaded || !selectedExpression"
                class="control-btn primary"
              >
                播放表情
              </button>
              <button
                @click="playRandomExpression"
                :disabled="!isModelLoaded"
                class="control-btn secondary"
              >
                随机表情
              </button>
              <button
                @click="resetExpression"
                :disabled="!isModelLoaded"
                class="control-btn tertiary"
              >
                重置表情
              </button>
            </div>
          </div>

          <!-- 表情网格（快速选择） -->
          <div class="expressions-grid">
            <button
              v-for="expression in currentModelConfig.expressions"
              :key="expression.index"
              @click="setExpression(expression.index)"
              class="expression-btn"
              :disabled="!isModelLoaded"
            >
              {{ expression.name }}
            </button>
          </div>
        </div>
      </template>

      <!-- 动作控制内容 -->
      <template #motions-content>
        <div class="motions-controls">
          <!-- 动作选择 -->
          <div class="control-group">
            <label>选择动作:</label>
            <select v-model="selectedMotion" :disabled="!isModelLoaded">
              <option value="">-- 请选择动作 --</option>
              <option
                v-for="motion in currentConfig.motions"
                :key="motion.file"
                :value="motion.file"
              >
                {{ motion.name }}
              </option>
            </select>
          </div>

          <!-- 动作控制按钮 -->
          <div class="control-group">
            <div class="button-row">
              <button
                @click="playMotion"
                :disabled="!isModelLoaded || !selectedMotion"
                class="control-btn primary"
              >
                播放动作
              </button>
              <button
                @click="playRandomMotion"
                :disabled="!isModelLoaded"
                class="control-btn secondary"
              >
                随机动作
              </button>
            </div>
          </div>

          <!-- 动作网格（快速选择） -->
          <div class="motions-grid">
            <button
              v-for="motion in currentModelConfig.motions"
              :key="motion.file"
              @click="playMotionFile(motion.file)"
              class="motion-btn"
              :disabled="!isModelLoaded"
            >
              {{ motion.name }}
            </button>
          </div>
        </div>
      </template>

      <!-- 音频控制内容 -->
      <template #audio-content>
        <div class="audio-controls">
          <!-- 音频选择 -->
          <div class="control-group" v-if="hasAudioSupport">
            <label>选择音频:</label>
            <select v-model="selectedSound" :disabled="!isModelLoaded">
              <option value="">-- 请选择音频 --</option>
              <option
                v-for="sound in currentConfig.sounds"
                :key="sound.file"
                :value="sound.file"
              >
                {{ sound.name }}
              </option>
            </select>
          </div>

          <!-- 播放控制按钮 -->
          <div class="control-group" v-if="hasAudioSupport">
            <div class="button-row">
              <button
                @click="playSelectedAudio"
                :disabled="!isModelLoaded || !selectedSound"
                class="control-btn primary"
              >
                ▶️ 播放
              </button>
              <button
                @click="isPaused ? resumeAudio() : pauseAudio()"
                :disabled="!isModelLoaded || !currentAudio"
                class="control-btn secondary"
              >
                {{ isPaused ? '▶️ 继续' : '⏸️ 暂停' }}
              </button>
              <button
                @click="stopAudio"
                :disabled="!isModelLoaded || !currentAudio"
                class="control-btn danger"
              >
                ⏹️ 停止
              </button>
            </div>
          </div>

          <!-- 音量控制 -->
          <div class="control-group">
            <label>音量: {{ Math.round(audioVolume * 100) }}%</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              v-model="audioVolume"
              @input="updateGlobalVolume"
            >
          </div>

          <!-- 播放进度 -->
          <div class="control-group" v-if="currentAudio">
            <label>进度: {{ formatTime(audioCurrentTime) }} / {{ formatTime(audioDuration) }}</label>
            <input
              type="range"
              min="0"
              max="100"
              v-model="audioProgress"
              @input="seekAudio(audioProgress)"
            >
          </div>

          <!-- 播放状态 -->
          <div class="control-group status-display">
            <span v-if="isPlaying" class="status playing">🎵 正在播放</span>
            <span v-else-if="isPaused" class="status paused">⏸️ 已暂停</span>
            <span v-else class="status stopped">⏹️ 已停止</span>
          </div>

          <!-- 无音频支持提示 -->
          <div v-if="!hasAudioSupport" class="control-group">
            <p class="no-audio-message">当前模型不支持音频功能</p>
          </div>
        </div>
      </template>

      <!-- 状态信息内容 -->
      <template #status-content>
        <div class="status-info">
          <div class="status-item">
            <span class="label">当前模型:</span>
            <span class="value">{{ currentConfig.name }}</span>
          </div>
          <div class="status-item">
            <span class="label">模型状态:</span>
            <span class="value" :class="{ 'loaded': isModelLoaded, 'loading': !isModelLoaded }">
              {{ isModelLoaded ? '✅ 已加载' : '⏳ 加载中' }}
            </span>
          </div>
          <div class="status-item">
            <span class="label">动作数量:</span>
            <span class="value">{{ currentConfig.motions.length }}</span>
          </div>
          <div class="status-item">
            <span class="label">表情数量:</span>
            <span class="value">{{ currentConfig.expressions.length }}</span>
          </div>
          <div class="status-item">
            <span class="label">音频数量:</span>
            <span class="value">{{ currentConfig.sounds.length }}</span>
          </div>
          <div class="status-item">
            <span class="label">音频支持:</span>
            <span class="value">{{ hasAudioSupport ? '✅ 是' : '❌ 否' }}</span>
          </div>
          <div class="status-item" v-if="model">
            <span class="label">模型缩放:</span>
            <span class="value">{{ model.scale.x.toFixed(2) }}</span>
          </div>
          <div class="status-item" v-if="model">
            <span class="label">模型位置:</span>
            <span class="value">({{ model.position.x.toFixed(0) }}, {{ model.position.y.toFixed(0) }})</span>
          </div>
        </div>
      </template>

      <!-- 口型同步内容 -->
      <template #lipsync-content>
        <div class="lipsync-controls">
          <!-- 音频文件信息 -->
          <div class="control-group">
            <label>测试音频:</label>
            <span class="audio-info">{{ audioFile ? 'test.wav (内置测试音频)' : '未加载音频文件' }}</span>
          </div>

          <!-- 口型同步控制按钮 -->
          <div class="control-group">
            <div class="button-row">
              <button
                @click="startSpeaking"
                :disabled="!model || !isModelLoaded || isSpeaking || !audioFile"
                class="lipsync-btn primary"
              >
                {{ isSpeaking ? '正在说话...' : '🎤 开始说话' }}
              </button>
              <button
                @click="stopSpeaking"
                :disabled="!isSpeaking"
                class="lipsync-btn secondary"
              >
                🛑 停止说话
              </button>
            </div>
          </div>

          <!-- 敏感度调节 -->
          <div class="control-group">
            <label>口型敏感度: {{ lipSyncSensitivity }}</label>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              v-model="lipSyncSensitivity"
            >
            <div class="sensitivity-labels">
              <span>低敏感度</span>
              <span>高敏感度</span>
            </div>
          </div>

          <!-- 状态指示器 -->
          <div class="control-group status-display">
            <span v-if="isSpeaking" class="status speaking">🎙️ 正在分析音频并同步口型</span>
            <span v-else class="status idle">💤 口型同步待机中</span>
          </div>
        </div>
      </template>
    </DesktopPetControls>
  </div>

  <!-- 传统 Web 模式 -->
  <div v-else style="padding: 20px; font-family: Arial, sans-serif;">
    <!-- 图标展示区域（开发模式） -->
    <div v-if="isDevelopmentMode" style="margin-bottom: 20px; padding: 15px; border: 1px solid #007bff; border-radius: 8px; background-color: #f0f8ff;">
      <IconShowcase />
    </div>

    <!-- 模型选择区域 -->
    <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
      <h3 style="margin: 0 0 10px 0; color: #333;">模型选择</h3>
      <div style="display: flex; align-items: center; gap: 10px;">
        <label for="modelSelect" style="font-weight: bold;">选择模型:</label>
        <select
          id="modelSelect"
          v-model="currentModelName"
          @change="changeModel"
          style="padding: 5px 10px; border: 1px solid #ccc; border-radius: 4px;"
        >
          <option value="idol">{{ modelConfigs.idol.name }}</option>
          <option value="lanhei">{{ modelConfigs.lanhei.name }}</option>
          <option value="hibiki">{{ modelConfigs.hibiki.name }}</option>
          <option value="hiyori">{{ modelConfigs.hiyori.name }}</option>
          <option value="mark">{{ modelConfigs.mark.name }}</option>
          <option value="natori">{{ modelConfigs.natori.name }}</option>
          <option value="kei_basic">{{ modelConfigs.kei_basic.name }}</option>
          <option value="kei_vowels">{{ modelConfigs.kei_vowels.name }}</option>
        </select>
        <span v-if="!isModelLoaded" style="color: #666; font-size: 14px;">加载中...</span>
        <span v-else style="color: #28a745; font-size: 14px;">✓ 已加载</span>
      </div>
    </div>

    <!-- Live2D 画布 -->
    <div style="text-align: center; margin-bottom: 20px;">
      <canvas
        ref="canvas"
        :width="600"
        :height="600"
        style="
          width: 600px;
          height: 600px;
          border: 2px solid #333;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          display: block;
          margin: 0 auto;
        "
      ></canvas>
    </div>
    
    

    <!-- 控制面板 -->
    <div class="control-grid" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px;">
      <!-- 动作控制 -->
      <div style="padding: 15px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
        <h4 style="margin: 0 0 15px 0; color: #333;">动作控制</h4>

        <div style="margin-bottom: 10px;">
          <label for="motionSelect" style="display: block; margin-bottom: 5px; font-weight: bold;">选择动作:</label>
          <select
            id="motionSelect"
            v-model="selectedMotion"
            :disabled="!isModelLoaded"
            style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;"
          >
            <option value="">-- 请选择动作 --</option>
            <option
              v-for="motion in currentConfig.motions"
              :key="motion.file"
              :value="motion.file"
            >
              {{ motion.name }}
            </option>
          </select>
        </div>

        <div style="display: flex; gap: 10px;">
          <button
            @click="playMotion"
            :disabled="!isModelLoaded || !selectedMotion"
            style="flex: 1; padding: 8px 16px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;"
            :style="{ opacity: (!isModelLoaded || !selectedMotion) ? 0.5 : 1 }"
          >
            播放动作
          </button>
          <button
            @click="playRandomMotion"
            :disabled="!isModelLoaded"
            style="flex: 1; padding: 8px 16px; background-color: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;"
            :style="{ opacity: !isModelLoaded ? 0.5 : 1 }"
          >
            随机动作
          </button>
        </div>
      </div>

      <!-- 表情控制 -->
      <div style="padding: 15px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
        <h4 style="margin: 0 0 15px 0; color: #333;">表情控制</h4>

        <div style="margin-bottom: 10px;">
          <label for="expressionSelect" style="display: block; margin-bottom: 5px; font-weight: bold;">选择表情:</label>
          <select
            id="expressionSelect"
            v-model="selectedExpression"
            :disabled="!isModelLoaded"
            style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;"
          >
            <option value="">-- 请选择表情 --</option>
            <option
              v-for="expression in currentConfig.expressions"
              :key="expression.file"
              :value="expression.file"
            >
              {{ expression.name }}
            </option>
          </select>
        </div>

        <div style="display: flex; gap: 10px;">
          <button
            @click="playExpression"
            :disabled="!isModelLoaded || !selectedExpression"
            style="flex: 1; padding: 8px 16px; background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;"
            :style="{ opacity: (!isModelLoaded || !selectedExpression) ? 0.5 : 1 }"
          >
            播放表情
          </button>
          <button
            @click="playRandomExpression"
            :disabled="!isModelLoaded"
            style="flex: 1; padding: 8px 16px; background-color: #ffc107; color: #212529; border: none; border-radius: 4px; cursor: pointer;"
            :style="{ opacity: !isModelLoaded ? 0.5 : 1 }"
          >
            随机表情
          </button>
          <button
            @click="resetExpression"
            :disabled="!isModelLoaded"
            style="flex: 1; padding: 8px 16px; background-color: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;"
            :style="{ opacity: !isModelLoaded ? 0.5 : 1 }"
          >
            重置表情
          </button>
        </div>
      </div>

      <!-- 音频控制 -->
      <div v-if="hasAudioSupport" style="padding: 15px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
        <h4 style="margin: 0 0 15px 0; color: #333;">音频控制</h4>

        <div style="margin-bottom: 15px;">
          <label for="soundSelect" style="display: block; margin-bottom: 5px; font-weight: bold;">选择音频:</label>
          <select
            id="soundSelect"
            v-model="selectedSound"
            :disabled="!isModelLoaded"
            style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;"
          >
            <option value="">-- 请选择音频 --</option>
            <option
              v-for="sound in currentConfig.sounds"
              :key="sound.file"
              :value="sound.file"
            >
              {{ sound.name }}
            </option>
          </select>
        </div>

        <!-- 播放控制按钮 -->
        <div style="display: flex; gap: 8px; margin-bottom: 15px;">
          <button
            @click="playSelectedAudio"
            :disabled="!isModelLoaded || !selectedSound"
            style="flex: 1; padding: 6px 12px; background-color: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;"
            :style="{ opacity: (!isModelLoaded || !selectedSound) ? 0.5 : 1 }"
          >
            ▶️ 播放
          </button>
          <button
            @click="isPaused ? resumeAudio() : pauseAudio()"
            :disabled="!isModelLoaded || !currentAudio"
            style="flex: 1; padding: 6px 12px; background-color: #ffc107; color: #212529; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;"
            :style="{ opacity: (!isModelLoaded || !currentAudio) ? 0.5 : 1 }"
          >
            {{ isPaused ? '▶️ 继续' : '⏸️ 暂停' }}
          </button>
          <button
            @click="stopAudio"
            :disabled="!isModelLoaded || !currentAudio"
            style="flex: 1; padding: 6px 12px; background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;"
            :style="{ opacity: (!isModelLoaded || !currentAudio) ? 0.5 : 1 }"
          >
            ⏹️ 停止
          </button>
        </div>

        <!-- 音量控制 -->
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold; font-size: 12px;">
            音量: {{ Math.round(audioVolume * 100) }}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            v-model="audioVolume"
            @input="setVolume(audioVolume)"
            style="width: 100%;"
          />
        </div>

        <!-- 播放进度 -->
        <div v-if="currentAudio" style="margin-bottom: 10px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold; font-size: 12px;">
            进度: {{ formatTime(audioCurrentTime) }} / {{ formatTime(audioDuration) }}
          </label>
          <input
            type="range"
            min="0"
            max="100"
            v-model="audioProgress"
            @input="seekAudio(audioProgress)"
            style="width: 100%;"
          />
        </div>

        <!-- 播放状态 -->
        <div style="text-align: center; font-size: 12px; color: #666;">
          <span v-if="isPlaying" style="color: #28a745;">🎵 正在播放</span>
          <span v-else-if="isPaused" style="color: #ffc107;">⏸️ 已暂停</span>
          <span v-else style="color: #6c757d;">⏹️ 已停止</span>
        </div>
      </div>

      <!-- 无音频支持时的占位 -->
      <div v-else style="padding: 15px; border: 1px solid #ddd; border-radius: 8px; background-color: #f8f9fa; opacity: 0.6;">
        <h4 style="margin: 0 0 15px 0; color: #6c757d;">音频控制</h4>
        <p style="margin: 0; color: #6c757d; font-size: 14px; text-align: center;">
          当前模型不支持音频功能
        </p>
      </div>

      <!--
        口型同步控制面板

        功能说明:
        - 提供口型同步功能的用户界面
        - 支持开始/停止口型同步
        - 提供敏感度调节功能
        - 显示实时状态信息

        设计特点:
        - 独立的功能区域，与其他控制分离
        - 清晰的视觉层次和状态反馈
        - 响应式的按钮状态管理
        - 用户友好的参数调节界面
      -->
      <div style="padding: 15px; border: 1px solid #ddd; border-radius: 8px; background-color: #f0f8ff; margin-top: 15px;">
        <h4 style="margin: 0 0 15px 0; color: #333;">🗣️ 口型同步测试</h4>

        <!-- 音频文件信息显示 -->
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold;">测试音频:</label>
          <!-- 动态显示音频文件状态，帮助用户了解当前可用的音频资源 -->
          <span style="color: #666; font-size: 14px;">{{ audioFile ? 'test.wav (内置测试音频)' : '未加载音频文件' }}</span>
        </div>

        <!--
          口型同步控制按钮组

          设计原则:
          - 双按钮设计：开始/停止，状态互斥
          - 智能禁用：根据系统状态自动启用/禁用
          - 视觉反馈：通过透明度和文字变化提供状态反馈
          - 防误操作：严格的状态检查防止重复操作
        -->
        <div style="display: flex; gap: 10px; margin-bottom: 15px;">
          <!--
            开始说话按钮

            启用条件 (所有条件必须同时满足):
            - model: Live2D模型已加载
            - isModelLoaded: 模型加载完成标志
            - !isSpeaking: 当前未在进行口型同步
            - audioFile: 音频文件已正确加载

            状态变化:
            - 待机时: "🎤 开始说话" (绿色，可点击)
            - 运行时: "正在说话..." (灰色，禁用)
            - 异常时: 禁用状态 (半透明)
          -->
          <button
            @click="startSpeaking"
            :disabled="!model || !isModelLoaded || isSpeaking || !audioFile"
            style="flex: 1; padding: 8px 16px; background-color: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;"
            :style="{ opacity: (!model || !isModelLoaded || isSpeaking || !audioFile) ? 0.5 : 1 }"
          >
            {{ isSpeaking ? '正在说话...' : '🎤 开始说话' }}
          </button>

          <!--
            停止说话按钮

            启用条件:
            - isSpeaking: 当前正在进行口型同步

            功能:
            - 立即停止音频播放
            - 取消动画循环
            - 重置所有嘴部参数
            - 更新UI状态

            状态变化:
            - 运行时: "🛑 停止说话" (红色，可点击)
            - 待机时: 禁用状态 (半透明)
          -->
          <button
            @click="stopSpeaking"
            :disabled="!isSpeaking"
            style="flex: 1; padding: 8px 16px; background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;"
            :style="{ opacity: !isSpeaking ? 0.5 : 1 }"
          >
            🛑 停止说话
          </button>
        </div>

        <!--
          口型敏感度调节控制

          功能说明:
          - 允许用户实时调节口型同步的敏感度
          - 范围: 10-100，步长: 5
          - 实时生效，无需重启口型同步

          敏感度效果:
          - 10 (低敏感度): 需要很大音量才能张嘴，适合嘈杂环境或响亮音频
          - 50 (中等敏感度): 平衡的响应，适合一般语音和音乐
          - 100 (高敏感度): 轻微声音就有反应，适合安静环境或轻柔音频

          技术实现:
          - 双向绑定到 lipSyncSensitivity 响应式变量
          - 在音频分析中作为除数使用: mouthOpen = volume / sensitivity
          - 实时更新，立即影响口型计算
        -->
        <div style="margin-bottom: 10px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold;">
            口型敏感度: {{ lipSyncSensitivity }}
          </label>
          <input
            type="range"
            min="10"
            max="100"
            step="5"
            v-model="lipSyncSensitivity"
            style="width: 100%;"
          >
          <!-- 敏感度范围提示，帮助用户理解调节方向 -->
          <div style="display: flex; justify-content: space-between; font-size: 12px; color: #666; margin-top: 2px;">
            <span>低敏感度</span>
            <span>高敏感度</span>
          </div>
        </div>

        <!--
          口型同步状态指示器

          功能说明:
          - 实时显示当前口型同步的工作状态
          - 提供清晰的视觉反馈
          - 帮助用户了解系统当前状态

          状态类型:
          - 运行状态: "🎙️ 正在分析音频并同步口型" (绿色)
            * 表示音频正在播放，嘴部动画正在运行
            * 系统正在实时分析音频并更新Live2D参数

          - 待机状态: "💤 口型同步待机中" (灰色)
            * 表示系统空闲，等待用户启动口型同步
            * 所有嘴部参数处于默认状态

          设计特点:
          - 使用表情符号增强视觉识别
          - 颜色编码：绿色=活跃，灰色=待机
          - 居中显示，突出状态信息
        -->
        <div style="text-align: center; font-size: 12px; color: #666;">
          <span v-if="isSpeaking" style="color: #28a745;">🎙️ 正在分析音频并同步口型</span>
          <span v-else style="color: #6c757d;">💤 口型同步待机中</span>
        </div>
      </div>
    </div>

    <!-- 额外控制按钮 -->
    <div v-if="isModelLoaded" style="margin-top: 20px; text-align: center;">
      <button
        @click="refitModel"
        style="padding: 8px 16px; background-color: #17a2b8; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px;"
      >
        🔄 重新调整模型大小
      </button>
      <span style="font-size: 12px; color: #666;">
        如果模型显示异常，点击此按钮重新调整
      </span>
    </div>

    <!-- 状态信息 -->
    <div v-if="isModelLoaded" style="margin-top: 20px; padding: 10px; background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 4px; color: #155724;">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; font-size: 14px;">
        <div><strong>当前模型:</strong> {{ currentConfig.name }}</div>
        <div><strong>动作数量:</strong> {{ currentConfig.motions.length }}</div>
        <div><strong>表情数量:</strong> {{ currentConfig.expressions.length }}</div>
        <div><strong>音频数量:</strong> {{ currentConfig.sounds.length }}</div>
        <div><strong>Canvas尺寸:</strong> 640x480</div>
        <div v-if="model"><strong>模型缩放:</strong> {{ model.scale.x.toFixed(4) }}</div>
        <div v-if="model"><strong>模型位置:</strong> ({{ model.position.x.toFixed(0) }}, {{ model.position.y.toFixed(0) }})</div>
        <div><strong>音频支持:</strong> {{ hasAudioSupport ? '✅ 是' : '❌ 否' }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 按钮悬停效果 */
button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  transition: all 0.2s ease;
}

button:active:not(:disabled) {
  transform: translateY(0);
}

/* 选择框样式 */
select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .control-grid {
    grid-template-columns: 1fr 1fr !important;
  }
}

@media (max-width: 768px) {
  .control-grid {
    grid-template-columns: 1fr !important;
  }
}

/* ==================== 桌面宠物模式样式 ==================== */

.desktop-pet-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: transparent;
  margin: 0;
  padding: 0;
}

.model-display {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.live2d-canvas {
  display: block;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  /* 允许拖拽整个画布区域 */
  -webkit-app-region: drag;
}

.model-status {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  pointer-events: none;
}

/* 桌面宠物控制面板样式 */
.control-group {
  margin-bottom: 12px;
}

.control-group label {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
  font-size: 12px;
  color: #333;
}

.control-group select {
  width: 100%;
  padding: 4px 6px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
}

.button-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.control-btn {
  flex: 1;
  padding: 6px 8px;
  border: none;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 60px;
}

.control-btn.primary {
  background-color: #007bff;
  color: white;
}

.control-btn.secondary {
  background-color: #28a745;
  color: white;
}

.control-btn.tertiary {
  background-color: #6c757d;
  color: white;
}

.control-btn.danger {
  background-color: #dc3545;
  color: white;
}

.control-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  opacity: 0.9;
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.motions-grid,
.expressions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 4px;
  margin-top: 8px;
}

.motion-btn,
.expression-btn {
  padding: 4px 6px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #f8f9fa;
  font-size: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.motion-btn:hover:not(:disabled),
.expression-btn:hover:not(:disabled) {
  background: #e9ecef;
  transform: translateY(-1px);
}

.motion-btn:disabled,
.expression-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.status-display {
  text-align: center;
  font-size: 11px;
}

.status.playing {
  color: #28a745;
}

.status.paused {
  color: #ffc107;
}

.status.stopped {
  color: #6c757d;
}

.status.speaking {
  color: #28a745;
}

.status.idle {
  color: #6c757d;
}

.audio-info {
  font-size: 11px;
  color: #666;
}

.no-audio-message {
  text-align: center;
  color: #6c757d;
  font-size: 11px;
  margin: 0;
}

.sensitivity-labels {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: #666;
  margin-top: 2px;
}

.refit-btn {
  width: 100%;
  padding: 6px 8px;
  background-color: #17a2b8;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.refit-btn:hover {
  background-color: #138496;
  transform: translateY(-1px);
}

.loading-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* === 桌面宠物控制面板内容样式 === */

.expressions-grid,
.motions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.expression-btn,
.motion-btn {
  padding: 8px 12px;
  background: rgba(52, 152, 219, 0.8);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.expression-btn:hover,
.motion-btn:hover {
  background: rgba(52, 152, 219, 1);
  transform: translateY(-1px);
}

.audio-controls,
.lipsync-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.control-group label {
  font-size: 12px;
  font-weight: 500;
  color: #333;
}

.control-group input[type="range"] {
  width: 100%;
  height: 4px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
  outline: none;
  -webkit-appearance: none;
}

.control-group input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  background: #3498db;
  border-radius: 50%;
  cursor: pointer;
}

.lipsync-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.lipsync-btn.primary {
  background: #27ae60;
  color: white;
}

.lipsync-btn.primary:hover:not(:disabled) {
  background: #2ecc71;
}

.lipsync-btn.secondary {
  background: #e74c3c;
  color: white;
}

.lipsync-btn.secondary:hover:not(:disabled) {
  background: #c0392b;
}

.lipsync-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* === 桌面宠物模式下的全局样式调整 === */

body.desktop-pet-mode {
  margin: 0;
  padding: 0;
  background: transparent !important;
  overflow: hidden;
  -webkit-app-region: drag;
}

body.desktop-pet-mode * {
  -webkit-app-region: no-drag;
}

body.desktop-pet-mode .live2d-canvas {
  -webkit-app-region: drag;
}

/* === 响应式调整 === */
@media (max-width: 400px) {
  .expressions-grid,
  .motions-grid {
    grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
  }

  .expression-btn,
  .motion-btn {
    padding: 6px 8px;
    font-size: 11px;
  }
}
</style>
