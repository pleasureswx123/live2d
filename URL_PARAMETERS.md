# Live2D 桌面模型 - URL 参数说明

本文档详细说明了 Live2D 桌面模型应用支持的所有 URL 参数。

## 🎯 默认行为

当没有任何 URL 参数时，应用默认以 **web 模式** 运行：

```
http://localhost:5175/
```

等同于：

```
http://localhost:5175/?mode=web
```

## 📋 支持的参数

### 1. 模式参数 (`mode`)

控制应用的运行模式：

| 值 | 描述 | 示例 |
|---|---|---|
| `web` | 传统网页模式（**默认**） | `?mode=web` |
| `traditional` | 传统网页模式（同web） | `?mode=traditional` |
| `pet` | 桌面模型模式（启用模拟器） | `?mode=pet` |
| `simulator` | 桌面模型模拟器模式（同pet） | `?mode=simulator` |

### 2. 模型参数 (`model`)

设置初始加载的模型：

| 值 | 描述 | 示例 |
|---|---|---|
| `idol` | 偶像模型（**默认**） | `?model=idol` |
| `lanhei` | 兰黑模型 | `?model=lanhei` |
| `hibiki` | 响模型 | `?model=hibiki` |
| `hiyori` | 日和模型 | `?model=hiyori` |
| `mark` | 马克模型 | `?model=mark` |
| `natori` | 名取模型 | `?model=natori` |
| `kei_basic` | Kei基础模型 | `?model=kei_basic` |
| `kei_vowels` | Kei元音模型 | `?model=kei_vowels` |

### 3. 调试参数 (`debug`)

启用调试模式：

| 值 | 描述 | 示例 |
|---|---|---|
| `true` | 启用调试模式（显示边框和调试信息） | `?debug=true` |
| `false` | 禁用调试模式（**默认**） | `?debug=false` |

### 4. 性能参数 (`fps`)

设置目标帧率：

| 值 | 描述 | 示例 |
|---|---|---|
| `30` | 30 FPS（节能模式） | `?fps=30` |
| `60` | 60 FPS（**默认**） | `?fps=60` |
| `120` | 120 FPS（高性能模式） | `?fps=120` |

### 5. 外观参数

#### 缩放参数 (`scale`)

设置初始模型缩放比例：

| 范围 | 描述 | 示例 |
|---|---|---|
| `0.5-2.0` | 缩放比例范围 | `?scale=1.5` |

#### 透明度参数 (`opacity`)

设置初始模型透明度：

| 范围 | 描述 | 示例 |
|---|---|---|
| `0.1-1.0` | 透明度范围 | `?opacity=0.8` |

### 6. 兼容性参数

支持旧版本的参数格式：

| 参数 | 描述 | 示例 |
|---|---|---|
| `pet` | 启用桌面模型模式 | `?pet=true` |
| `desktop-pet` | 启用桌面模型模式 | `?desktop-pet=true` |

## 🚀 使用示例

### 基础用法

```bash
# 默认web模式
http://localhost:5175/

# 明确指定web模式
http://localhost:5175/?mode=web

# 桌面模型模式
http://localhost:5175/?mode=pet
```

### 指定模型

```bash
# web模式 + hiyori模型
http://localhost:5175/?model=hiyori

# 桌面模型模式 + natori模型
http://localhost:5175/?mode=pet&model=natori
```

### 调试模式

```bash
# 启用调试边框
http://localhost:5175/?mode=pet&debug=true

# 调试模式 + 指定模型
http://localhost:5175/?mode=pet&model=hibiki&debug=true
```

### 性能优化

```bash
# 低帧率节能模式
http://localhost:5175/?mode=pet&fps=30

# 高性能模式
http://localhost:5175/?mode=pet&fps=120
```

### 外观定制

```bash
# 自定义缩放和透明度
http://localhost:5175/?mode=pet&scale=1.5&opacity=0.7

# 大尺寸半透明模型
http://localhost:5175/?mode=pet&model=hiyori&scale=2.0&opacity=0.5
```

### 组合参数

```bash
# 完整配置示例
http://localhost:5175/?mode=pet&model=natori&scale=1.2&opacity=0.8&fps=60&debug=true

# 兼容性格式
http://localhost:5175/?pet=true&model=hibiki
```

## 🔧 特殊功能

### 自动参数验证

- 无效的参数值会被自动限制在安全范围内
- 例如：`scale=5.0` 会被限制为 `scale=2.0`

### 开发模式帮助

在开发模式下，控制台会自动显示所有支持的参数说明。

### 向后兼容

支持旧版本的参数格式，确保现有链接继续有效。

## 📝 注意事项

1. **默认模式**：没有参数时默认为 web 模式
2. **参数组合**：可以同时使用多个参数
3. **大小写敏感**：参数名和值都区分大小写
4. **URL编码**：特殊字符需要进行URL编码
5. **开发环境**：某些功能（如调试信息）仅在开发模式下可用

## 🎨 模式对比

| 特性 | Web 模式 | 桌面模型模式 |
|---|---|---|
| 界面 | 完整的控制界面 | 简化的状态显示 |
| 尺寸 | 600x600 | 300x400 |
| 背景 | 黑色背景 | 透明背景 |
| 拖拽 | 不支持 | 支持窗口拖拽 |
| 调试边框 | 不显示 | 可选显示 |
| 适用场景 | 网页演示、开发测试 | 桌面宠物、Electron应用 |
