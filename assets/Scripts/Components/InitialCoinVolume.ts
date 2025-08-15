import { _decorator, Component, Node, Prefab, instantiate, BoxCollider, Vec3, Quat, RigidBody, math, Scheduler } from 'cc';

const { ccclass, property } = _decorator;

/**
 * @class InitialCoinVolume
 * @description 在一个附加了BoxCollider的节点所定义的体积内，随机位置上逐个生成指定数量的初始金币，
 *              以避免初始时的剧烈碰撞。
 * @version 4.0 - Random In Volume
 */
@ccclass('InitialCoinVolume')
export class InitialCoinVolume extends Component {

    // --- 属性定义 ---

    @property({
        type: [Prefab],
        tooltip: '请将多种金币的预制体（Prefab）拖拽到这里'
    })
    public coinPrefabs: Prefab[] = [];

    @property({
        type: Node,
        tooltip: '所有生成的金币最终都将放在这个节点下，以保持场景整洁'
    })
    public coinContainer: Node = null!;

    @property({
        tooltip: '在游戏开始时要生成的金币总数'
    })
    public coinCount: number = 100;

    @property({
        group: { name: "Generation", id: "1" },
        tooltip: '生成每个金币之间的时间间隔（秒），以防止物理碰撞。'
    })
    public generationInterval: number = 0.01;

    @property({
        group: { name: "Generation", id: "1" },
        tooltip: '是否让所有金币都朝向同一个方向？否则将保持随机旋转。'
    })
    public uniformRotation: boolean = true;


    // --- 私有变量 ---
    private _boxCollider: BoxCollider | null = null;
    private _generatedCount: number = 0;

    // --- 生命周期函数 ---

    onLoad() {
        this._boxCollider = this.getComponent(BoxCollider);
        if (!this._boxCollider) {
            console.error('错误：InitialCoinVolume 脚本所在的节点上没有找到 BoxCollider 组件！请添加一个 BoxCollider。');
        }
    }

    start() {
        this.generateCoinsRandomlyInVolume();
    }

    // --- 核心方法 ---

    /**
     * @description 启动调度器，在BoxCollider体积内随机生成金币。
     *              这个方法应该是公开的，由外部逻辑（如GameManager）在场景加载完毕后调用。
     */
    public generateCoinsRandomlyInVolume(): void {
        // 安全检查
        if (!this._boxCollider) {
            console.warn('因缺少 BoxCollider，无法生成初始金币。');
            return;
        }
        if (!this.coinPrefabs || this.coinPrefabs.length === 0) {
            console.warn('无法初始化金币：金币预制体数组 (coinPrefabs) 未设置或为空！');
            return;
        }
        if (!this.coinContainer) {
            console.warn('无法初始化金币：金币容器 (coinContainer) 未设置！');
            return;
        }

        console.log(`[InitialCoinVolume] 开始在BoxCollider体积内，以 ${this.generationInterval} 秒的间隔随机生成 ${this.coinCount} 个金币...`);

        this._generatedCount = 0;

        // 启动调度器来逐个生成金币
        this.schedule(this.generateOneCoinInVolume, this.generationInterval, this.coinCount - 1, 0);
    }

    /**
     * @description 在 BoxCollider 体积内随机位置生成单个金币。此方法由调度器调用。
     */
    private generateOneCoinInVolume(): void {
        // 1. 获取 BoxCollider 的中心点和尺寸
        const center = this._boxCollider!.center;
        const size = this._boxCollider!.size;

        // 2. 计算本地坐标的随机位置
        // 公式：随机位置 = 中心点 - 尺寸/2 + 随机值 * 尺寸
        const randomX = center.x - size.x / 2 + Math.random() * size.x;
        const randomY = center.y - size.y / 2 + Math.random() * size.y;
        const randomZ = center.z - size.z / 2 + Math.random() * size.z;
        
        const localPos = new Vec3(randomX, randomY, randomZ);

        // 3. 从数组中随机选择一个预制体并实例化
        const randomIndex = Math.floor(Math.random() * this.coinPrefabs.length);
        const selectedPrefab = this.coinPrefabs[randomIndex];
        const coin = instantiate(selectedPrefab);

        // 4. 使用标准的 "先设置父节点->设置本地坐标->再移到最终容器" 流程来确保位置正确
        coin.setParent(this.node); // 临时父节点为本节点
        coin.setPosition(localPos); // 应用计算出的本地坐标
        
        const worldPos = coin.getWorldPosition(); // 获取其对应的世界坐标
        coin.setParent(this.coinContainer); // 设置最终的父节点
        coin.setWorldPosition(worldPos); // 在新父节点下应用之前的世界坐标

        // 5. 设置旋转
        if (this.uniformRotation) {
            coin.setRotation(Quat.IDENTITY);
        } else {
            const randomQuat = new Quat();
            Quat.fromEuler(randomQuat, Math.random() * 360, Math.random() * 360, Math.random() * 360);
            coin.setRotation(randomQuat);
        }

        // 6. 激活其物理属性
        const rb = coin.getComponent(RigidBody);
        if (rb) {
            rb.isKinematic = false;
            rb.useGravity = true;
        }

        // 7. 更新计数器
        this._generatedCount++;
        
        // 8. 检查是否完成
        if (this._generatedCount >= this.coinCount) {
            console.log(`[InitialCoinVolume] 成功生成了全部 ${this.coinCount} 个金币。`);
            this.enabled = false; // 完成任务后禁用该组件
        }
    }

    /**
     * @description 启动一个调度器，以固定的时间间隔逐个生成金币
     * @deprecated 建议使用 generateCoinsRandomlyInVolume() 方法来获得更好的随机分布效果
     */
    public generateInitialCoinsWithDelay(): void {
        // 安全检查
        if (!this._boxCollider || !this.coinPrefabs || this.coinPrefabs.length === 0 || !this.coinContainer) {
            console.warn('因缺少必要的组件或设置，无法启动金币生成流程。请检查BoxCollider, coinPrefabs, 和 coinContainer。');
            return;
        }

        console.log(`[InitialCoinVolume] 开始以 ${this.generationInterval} 秒的间隔，逐个生成 ${this.coinCount} 个金币...`);

        // 初始化计数器
        this._generatedCount = 0;

        // 启动调度器
        // 参数1: 要重复执行的函数
        // 参数2: 执行间隔（秒）
        // 参数3: 重复次数。这里我们用 CC_JSB.REPEAT_FOREVER 或一个足够大的数，然后手动停止
        // 参数4: 初始延迟（秒），0表示立即开始
        this.schedule(this.generateOneCoin, this.generationInterval, this.coinCount -1, 0);
    }

    /**
     * @description 生成单个金币的逻辑。此方法由调度器调用。
     * @deprecated 建议使用 generateOneCoinInVolume() 方法来获得更好的随机分布效果
     */
    private generateOneCoin(): void {
        // 1. 从数组中随机选择一个预制体
        const randomIndex = Math.floor(Math.random() * this.coinPrefabs.length);
        const selectedPrefab = this.coinPrefabs[randomIndex];
        const coin = instantiate(selectedPrefab);

        // 将 BoxCollider 的中心点作为我们堆叠的基准XZ坐标
        const basePosition = this._boxCollider!.center;

        // 2. 计算金币的本地坐标
        // Y 坐标根据已生成的数量和间距向上递增
        const localPos = new Vec3(
            basePosition.x,
            basePosition.y + this._generatedCount * 0.5, // 使用固定的垂直间距
            basePosition.z
        );

        // 3. 将金币的父节点先设置为本节点，并应用本地坐标
        coin.setParent(this.node);
        coin.setPosition(localPos);
        
        // 4. 获取金币的世界坐标，然后将其移动到最终的容器中
        const worldPos = coin.getWorldPosition();
        coin.setParent(this.coinContainer);
        coin.setWorldPosition(worldPos);

        // 5. 设置旋转
        if (this.uniformRotation) {
            coin.setRotation(Quat.IDENTITY); 
        } else {
            const randomQuat = new Quat();
            Quat.fromEuler(randomQuat, Math.random() * 360, Math.random() * 360, Math.random() * 360);
            coin.setRotation(randomQuat);
        }

        // 6. 激活其物理属性
        const rb = coin.getComponent(RigidBody);
        if (rb) {
            rb.isKinematic = false;
            rb.useGravity = true;
        }

        // 7. 更新计数器
        this._generatedCount++;
        
        // 8. 检查是否已生成所有金币 (虽然调度器会自己停，但这是个好习惯)
        if (this._generatedCount >= this.coinCount) {
            console.log(`[InitialCoinVolume] 成功生成了全部 ${this.coinCount} 个金币。生成过程结束。`);
            // this.unschedule(this.generateOneCoin); // 当指定了重复次数后，调度器会自动停止，无需手动调用
            this.enabled = false; // 完成任务后禁用该组件
        }
    }

    /**
     * @description 以垂直堆叠的方式生成初始金币。现在是 public 方法。
     * @deprecated 建议使用 generateCoinsRandomlyInVolume() 方法来获得更好的随机分布效果
     */
    public generateInitialCoinsInStack(): void {
        // 安全检查
        if (!this._boxCollider) {
            console.warn('因缺少 BoxCollider，无法生成初始金币。');
            return;
        }
        if (!this.coinPrefabs || this.coinPrefabs.length === 0) {
            console.warn('无法初始化金币：金币预制体数组 (coinPrefabs) 未设置或为空！');
            return;
        }
        if (!this.coinContainer) {
            console.warn('无法初始化金币：金币容器 (coinContainer) 未设置！');
            return;
        }

        console.log(`[InitialCoinVolume] 开始以垂直堆叠方式生成 ${this.coinCount} 个金币...`);

        // 将 BoxCollider 的中心点作为我们堆叠的基准XZ坐标
        const basePosition = this._boxCollider.center;

        for (let i = 0; i < this.coinCount; i++) {
            // 1. 从数组中随机选择一个预制体
            const randomIndex = Math.floor(Math.random() * this.coinPrefabs.length);
            const selectedPrefab = this.coinPrefabs[randomIndex];
            const coin = instantiate(selectedPrefab);

            // 2. 计算金币的本地坐标
            // X 和 Z 坐标保持不变，使用基准点坐标
            // Y 坐标根据索引和间距向上递增
            const localPos = new Vec3(
                basePosition.x,
                basePosition.y + i * 0.5, // 使用固定的垂直间距
                basePosition.z
            );

            // 3. 将金币的父节点先设置为本节点（立方体），并应用本地坐标
            coin.setParent(this.node);
            coin.setPosition(localPos);
            
            // 4. 获取金币现在的世界坐标，然后将其移动到最终的容器中
            const worldPos = coin.getWorldPosition();
            coin.setParent(this.coinContainer);
            coin.setWorldPosition(worldPos);

            // 5. 设置旋转
            if (this.uniformRotation) {
                // 设置为统一的、无旋转或指定的旋转
                coin.setRotation(Quat.IDENTITY); 
            } else {
                // 保持随机旋转
                const randomQuat = new Quat();
                Quat.fromEuler(randomQuat, Math.random() * 360, Math.random() * 360, Math.random() * 360);
                coin.setRotation(randomQuat);
            }

            // 6. 激活其物理属性
            const rb = coin.getComponent(RigidBody);
            if (rb) {
                rb.isKinematic = false;
                rb.useGravity = true;
            }
        }

        console.log(`[InitialCoinVolume] 成功生成了 ${this.coinCount} 个金币。`);

        this.enabled = false;
    }
}