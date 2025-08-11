import { _decorator, Component, Node, Prefab, instantiate, input, Input, EventTouch, Vec3, math, Quat, RigidBody, Button } from 'cc';

const { ccclass, property } = _decorator;

/**
 * @class CoinGenerator
 * @description 允许玩家通过触摸移动一个生成点，并在点击UI按钮时，释放当前预览的金币，
 *              然后立即在生成点生成下一个待预览的金币。
 */
@ccclass('CoinGenerator')
export class CoinGenerator extends Component {

    // --- 属性定义 ---

    @property({
        type: [Prefab],
        tooltip: '请将多种金币的预制体（Prefab）拖拽到这里'
    })
    public coinPrefabs: Prefab[] = [];

    @property({
        type: Node,
        tooltip: '所有生成的金币最终都将放在这个节点下'
    })
    public coinContainer: Node = null!;

    // 【新增】需要将UI按钮拖拽到这里，以便在延迟期间禁用它
    @property({
        type: Button,
        tooltip: '"落下"按钮，用于在延迟期间禁用它'
    })
    public dropButton: Button = null!;
    
    // 移动范围限制（仅Z轴）
    @property({ group: { name: '移动范围 (Movement Bounds)' }, tooltip: 'Z轴最小坐标' })
    public minZ: number = -5.019;

    @property({ group: { name: '移动范围 (Movement Bounds)' }, tooltip: 'Z轴最大坐标' })
    public maxZ: number = -2.003;

    @property({ group: { name: '移动灵敏度' }, tooltip: '手指在屏幕上移动时，生成点移动的快慢' })
    public moveSensitivity: number = 0.01;

    // 【新增】物理效果相关属性
    @property({ group: { name: '物理效果 (Physics)' }, tooltip: '下落时随机角速度因子的最小值（建议为1）' })
    public minAngularFactor: number = 1;

    @property({ group: { name: '物理效果 (Physics)' }, tooltip: '下落时随机角速度因子的最大值（建议3-8）' })
    public maxAngularFactor: number = 5;


    // --- 私有变量 ---
    private _previewCoin: Node | null = null; // 用于存储当前正在预览的金币节点
    private _isDropping: boolean = false; // 【新增】状态标记，防止在延迟期间重复触发

    // --- 生命周期函数 ---

    start() {
        // 游戏一开始，就生成第一个预览金币
        this.generateNextPreview();
    }
    
    onLoad() {
        // 监听触摸移动事件，用于移动生成点
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
    }

    onDestroy() {
        // 移除监听，防止内存泄漏
        input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
    }

    // --- 核心方法 ---

    /**
     * 【已修改】生成下一个待预览的金币，并立即赋予随机旋转
     */
    private generateNextPreview(): void {
        if (!this.coinPrefabs || this.coinPrefabs.length === 0) {
            console.warn('金币预制体数组 (coinPrefabs) 未设置或为空！');
            return;
        }

        // 1. 从数组中随机选择一个预制体
        const randomIndex = Math.floor(Math.random() * this.coinPrefabs.length);
        const selectedPrefab = this.coinPrefabs[randomIndex];

        // 2. 实例化新的预览金币
        const newPreview = instantiate(selectedPrefab);

        // 3. 将其父节点设置为本节点（CoinSpawnPoint），这样它就会跟随我们移动
        newPreview.setParent(this.node);
        // 位置设置为(0,0,0)，即与父节点完全重合
        newPreview.setPosition(Vec3.ZERO); 

        // 【核心修改 1】在预览时就赋予其随机旋转
        const randomRotX = Math.random() * 360;
        const randomRotY = Math.random() * 360;
        const randomRotZ = Math.random() * 360;
        const randomQuat = new Quat();
        Quat.fromEuler(randomQuat, randomRotX, randomRotY, randomRotZ);
        newPreview.setRotation(randomQuat);

        // 4. 【重要】禁用物理效果，让它只是一个"幻象"
        const rb = newPreview.getComponent(RigidBody);
        if (rb) {
            rb.useGravity = false; // 关闭重力
            rb.isKinematic = true; // 设置为运动学刚体，不受力的影响，只能通过代码移动
        }
        
        // 5. 保存对这个预览金币的引用
        this._previewCoin = newPreview;
        console.log(`生成了下一个预览金币: ${selectedPrefab.name}`);
    }

    /**
     * 【已修改】公开方法：落下金币，并设置其角速度因子
     */
    public dropCoin(): void {
        // 【修改】如果正在落下过程中，则直接返回，不执行任何操作
        if (this._isDropping || !this._previewCoin) return;

        // 【修改】开始落下流程，设置状态标记并禁用按钮
        this._isDropping = true;
        if (this.dropButton) {
            this.dropButton.interactable = false;
        }

        // --- 以下为原有的落下逻辑 ---
        if (!this.coinContainer) {
            console.warn('金币容器 (coinContainer) 未设置！');
            return;
        }
        const coinToDrop = this._previewCoin;
        this._previewCoin = null;
        const worldPos = coinToDrop.getWorldPosition();
        coinToDrop.setParent(this.coinContainer);
        coinToDrop.setWorldPosition(worldPos);
        
        // 【核心修改 2】移除此处的旋转代码，因为创建时已经旋转好了

        const rb = coinToDrop.getComponent(RigidBody);
        if (rb) {
            // 【核心修改 3】赋予随机的角速度因子，让金币下落时可以翻滚
            // 定义一个辅助函数，用于在最小和最大值之间生成一个随机数
            const randomFactor = () => math.lerp(this.minAngularFactor, this.maxAngularFactor, Math.random());
            // 设置角速度因子，每个轴都使用一个独立的随机值
            rb.angularFactor = new Vec3(randomFactor(), randomFactor(), randomFactor());

            // 激活物理
            rb.isKinematic = false;
            rb.useGravity = true;
        }

        // 【修改】使用setTimeout延迟0.5秒后再执行后续操作
        setTimeout(() => {
            this.generateNextPreview(); // 延迟后生成下一个预览金币
            this._isDropping = false;   // 重置状态标记
            if (this.dropButton) {      // 重新启用按钮
                this.dropButton.interactable = true;
            }
        }, 600); // 500毫秒 = 0.5秒
    }

    /**
     * 当手指在屏幕上移动时调用
     */
    private onTouchMove(event: EventTouch): void {
        const delta = event.getDelta();

        // 【核心修改】使用手指左右滑动（delta.x）来改变Z轴位置
        const moveDelta = new Vec3(0, 0, delta.x * this.moveSensitivity);

        const newPos = this.node.position.add(moveDelta);
        newPos.z = math.clamp(newPos.z, this.minZ, this.maxZ);
        this.node.setPosition(newPos);
    }
}