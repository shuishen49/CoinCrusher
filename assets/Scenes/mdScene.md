### mdScene（主场景）节点结构与挂载指南

> 说明：以下命名已对齐现有脚本的“自动查找”逻辑。若更改命名，请在 `Inspector` 手动拖拽引用到脚本属性中。

- 关键命名约束（强烈建议遵循）
  - `Canvas`：必须命名为 `Canvas`（`CoinLauncher` 通过 `find('Canvas')` 注册触摸输入）。
  - `CoinLauncherNode`：必须位于“场景根节点”的直系子节点（`GameManager` 通过 `director.getScene().getChildByName('CoinLauncherNode')` 查找）。
  - `GameManager` 或 `GameManagerNode`：若使用该名称，可被 `GameManager.instance` 与 `ScoreManager.instance` 回退查找捕获。
  - `ScoreManagerNode`（可选）：`ScoreManager.instance` 的回退查找也会尝试该名称。

### 场景层级（建议）

```
mdScene (你的主场景)
│
├── Main Camera (主摄像机)
│
├── Directional Light (主光源)
│
├── game (空节点，作为所有游戏元素的根)
│   │
│   ├── MachineBody (游戏机静态主体)
│   │   ├── Floor (地面)
│   │   ├── Wall_Back (后墙)
│   │   ├── Wall_Left (左墙)
│   │   ├── Wall_Right (右墙)
│   │   └── Glass_Front (前玻璃，可选)
│   │
│   ├── Pusher (往复移动的推板)
│   │
│   ├── CoinContainer (空节点，用于组织场景中的硬币实例)
│   │   └─ (运行时会生成很多硬币)
│   │
│   └── Generators (空节点，管理生成与检测区域)
│       ├── CoinSpawnPoint (硬币发射/生成位置)
│       ├── WinZone (触发器 - 得分区)
│       └── LoseZone (触发器 - 失败区/掉落区)
│
├── CoinLauncherNode (发射器节点，需放在“场景根”下)
│
├── GameManager (或 GameManagerNode)（主逻辑）
│
└── Canvas (UI根节点；如之前命名为 UICanvas，需改名为 Canvas)
    ├── UI_Root (空节点，组织UI)
    │   ├── ScoreLabel (Label)
    │   ├── CoinCountLabel (Label)
    │   ├── PowerBarBackground (Sprite，可选)
    │   │   └── PowerBarFill (ProgressBar 或 Sprite[FILLED])
    │   └── GameOverScreen (根节点，初始隐藏)
    │       ├── GameOverStatusLabel (Label)
    │       ├── GameOverScoreLabel (Label)
    │       └── RestartButton (Button)
    └── (其它按钮/UI元素…)
```

### 关键节点与组件挂载

- Main Camera
  - Camera、AudioListener（按需）

- Directional Light
  - Light（类型：Directional）

- game/MachineBody 及子节点（Floor/Wall_*/Glass_Front）
  - 每个可见几何体：MeshRenderer（材质按需）
  - 物理：为每个静态体添加 `BoxCollider`/`MeshCollider`。
    - 是否需要 `RigidBody`：可不加（作为静态碰撞体使用）；如添加请设置 `RigidBody.Type = STATIC`。
  - 尺寸与位置：确保围成可玩区域，不与 `Pusher`、`Platform` 等穿插。

- game/Pusher（往复推板）
  - 可见几何体：Cube + MeshRenderer
  - 物理：`RigidBody(Type = KINEMATIC)` + `BoxCollider(IsTrigger = false)`
  - 驱动：
    - 可使用动画（Animation/Animator）做位移往复；或后续添加自定义脚本实现匀速往复。

- game/CoinContainer
  - 仅作为组织节点。当前 `CoinLauncher` 默认把硬币直接加到“场景根”。如需归档到此节点，后续可微调 `CoinLauncher` 逻辑。

- game/Generators/CoinSpawnPoint
  - 空节点；位置与朝向决定发射初始位置与方向。
  - 提示：Cocos 3D 中 Node 的“forward”为本地 -Z 方向；调整旋转以指向需要的发射方向。

- game/Generators/WinZone（得分区）
  - `BoxCollider`（或其它形状），`IsTrigger = true`
  - 挂载脚本：`ScoringZone.ts`
    - `pointsToAward`: 设置单枚硬币加分（默认 10）

- game/Generators/LoseZone（失败区）
  - `BoxCollider`（或其它形状），`IsTrigger = true`
  - 逻辑两种选择：
    1) 暂不挂脚本，仅作为收纳触发器（待后续实现销毁/扣分脚本）。
    2) 临时复用 `ScoringZone.ts` 且 `pointsToAward = 0`：会销毁硬币，但 `ScoreManager.addScore(0)` 会产生一次警告日志（无功能性问题）。

- CoinLauncherNode（必须在场景根节点下）
  - 挂载脚本：`CoinLauncher.ts`
    - `coinPrefab`: 指向 `assets/Prefabs/` 中创建好的硬币 Prefab（参考 `assets/Prefabs/CoinPrefabSetup.md`）
    - `launchPositionNode`: 指向 `game/Generators/CoinSpawnPoint`
    - `powerBar`: 指向 UI 中的 `PowerBarFill`（支持 `ProgressBar` 或 `Sprite`[Type=FILLED]）
    - `minLaunchForce`/`maxLaunchForce`/`chargeTime`/`launchAngleY`/`launchAngleXOffset`: 按需调整
  - 说明：脚本会通过 `find('Canvas')` 注册触摸输入，需保证 UI 根节点命名为 `Canvas`。
  - 说明：当前发射生成的硬币会添加到“场景根”下（非 `CoinContainer`）。

- GameManager（或 GameManagerNode）
  - 挂载脚本：`GameManager.ts`
    - `initialCoinCount`: 初始硬币数（默认 20）
    - `scoreManager`: 指向同节点上的 `ScoreManager` 组件（推荐同节点绑定，便于回退查找）
    - `coinLauncher`: 指向场景根下的 `CoinLauncherNode`（或直接拖拽其组件）
  - 同节点再挂载：`ScoreManager.ts`
    - `targetScore`: 目标分数（>0 启用胜利判定；≤0 为无尽模式）
  - 事件：
    - `ScoreManager` 达到目标分数后触发胜利；当硬币数降至 0 且未达标则判负。

- Canvas（UI根节点，命名必须为 `Canvas`）
  - UI 结构（建议）：见上方层级树
  - 能量条两种做法（二选一，详见 `assets/Scripts/Managers/PowerBarUISetup.md`）
    1) `ProgressBar` 组件：把 `PowerBarFill` 节点上的 `ProgressBar` 拖到 `CoinLauncher.powerBar`
    2) `Sprite` 组件（Type=FILLED，Fill=Horizontal）：把 `PowerBarFill` 的节点拖到 `CoinLauncher.powerBar`
  - 可选：挂载 `UIManager.ts`（若使用该脚本，需要在其 Inspector 中绑定 `Label/Button` 等引用；当前 `GameManager` 中对 UIManager 的调用是注释状态，可按需接入。）

### 快速校验清单

- [ ] `Canvas` 名称为 `Canvas`（非 `UICanvas`）
- [ ] `CoinLauncherNode` 位于场景根节点
- [ ] `CoinLauncher.launchPositionNode` 指向 `game/Generators/CoinSpawnPoint`
- [ ] `WinZone` 的 Collider 勾选 `IsTrigger`，且挂载 `ScoringZone.ts`
- [ ] `LoseZone` 已决定使用何种处理方式（空触发器/临时 `ScoringZone(0)`/后续自定义脚本）
- [ ] `GameManager` 与 `ScoreManager` 已挂载，且 `GameManager.coinLauncher`、`GameManager.scoreManager` 已正确引用
- [ ] 物理静态体（Floor/Walls/Glass）已正确加 Collider（必要时加 `RigidBody(Static)`）
- [ ] `Pusher` 为 `RigidBody(Kinematic)+BoxCollider`，并具备位移动画或脚本

### 参考文档
- 硬币 Prefab 配置：`assets/Prefabs/CoinPrefabSetup.md`
- 平台/推板 Prefab 配置：`assets/Prefabs/PlatformPrefabSetup.md`
- 能量条 UI 配置：`assets/Scripts/Managers/PowerBarUISetup.md` 