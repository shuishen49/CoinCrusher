
import { _decorator, Component, Node, Prefab, instantiate, BoxCollider, Vec3, Quat, RigidBody, math } from 'cc';

const { ccclass, property } = _decorator;

/**
 * @class InitialCoinVolume
 * @description 在一个附加了BoxCollider的节点所定义的立方体体积内，随机生成指定数量的初始金币。
 *              此脚本应挂载到一个可见或不可见的立方体上。
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

    // --- 私有变量 ---
    private _boxCollider: BoxCollider | null = null;

    // --- 生命周期函数 ---

    onLoad() {
        // 在加载时获取此节点上的 BoxCollider 组件
        this._boxCollider = this.getComponent(BoxCollider);

        if (!this._boxCollider) {
            console.error('错误：InitialCoinVolume 脚本所在的节点上没有找到 BoxCollider 组件！请添加一个 BoxCollider3D。');
        }
    }

    start() {
        // 确保所有组件都已加载后再执行生成逻辑
        this.generateInitialCoins();
    }

    // --- 核心方法 ---

    /**
     * 在 BoxCollider 定义的体积内生成初始金币
     */
    private generateInitialCoins(): void {
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

        console.log(`[InitialCoinVolume] 开始在指定的立方体区域内生成 ${this.coinCount} 个金币...`);

        const center = this._boxCollider.center; // 立方体的中心点（相对于本节点）
        const size = this._boxCollider.size;     // 立方体的尺寸

        // 计算出立方体在本地坐标系中的最小和最大顶点
        const min = new Vec3(center.x - size.x / 2, center.y - size.y / 2, center.z - size.z / 2);
        const max = new Vec3(center.x + size.x / 2, center.y + size.y / 2, center.z + size.z / 2);

        for (let i = 0; i < this.coinCount; i++) {
            // 1. 从数组中随机选择一个预制体
            const randomIndex = Math.floor(Math.random() * this.coinPrefabs.length);
            const selectedPrefab = this.coinPrefabs[randomIndex];
            const coin = instantiate(selectedPrefab);

            // 2. 计算一个在立方体边界内的随机本地坐标
            const randomX = math.lerp(min.x, max.x, Math.random());
            const randomY = math.lerp(min.y, max.y, Math.random());
            const randomZ = math.lerp(min.z, max.z, Math.random());
            const localPos = new Vec3(randomX, randomY, randomZ);

            // 3. 将金币的父节点先设置为本节点（立方体），并应用本地坐标
            coin.setParent(this.node);
            coin.setPosition(localPos);

            // 4. 【重要】获取金币现在的世界坐标，然后将其移动到最终的容器中
            const worldPos = coin.getWorldPosition();
            coin.setParent(this.coinContainer);
            coin.setWorldPosition(worldPos); // 使用世界坐标重新设置，保证位置不变

            // 5. 设置随机旋转
            const randomQuat = new Quat();
            Quat.fromEuler(randomQuat, Math.random() * 360, Math.random() * 360, Math.random() * 360);
            coin.setRotation(randomQuat);

            // 6. 激活其物理属性，让其可以下落和堆叠
            const rb = coin.getComponent(RigidBody);
            if (rb) {
                rb.isKinematic = false;
                rb.useGravity = true;
            }
        }

        console.log(`[InitialCoinVolume] 成功生成了 ${this.coinCount} 个金币。`);
        
        // （可选）生成完毕后，可以禁用此脚本甚至销毁此节点，因为它已经完成了使命
        this.enabled = false; 
    }
}

