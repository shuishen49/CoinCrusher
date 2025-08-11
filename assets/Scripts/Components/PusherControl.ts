import { _decorator, Component, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PusherControl')
export class PusherControl extends Component {

    @property
    speed = 0.5; // 移动速度

    @property
    moveDistance = 1; // 来回移动的总距离

    private _startPos: Vec3 = null!;
    private _direction = 1; // 1 表示向前, -1 表示向后

    start() {
        // 记录初始位置
        this._startPos = this.node.getPosition().clone();
    }

    update(deltaTime: number) {
        // 获取当前位置
        const currentPos = this.node.getPosition();
        
        // 移动节点
        const newPos = currentPos.add(new Vec3(0, 0, this._direction * this.speed * deltaTime));
        this.node.setPosition(newPos);

        // 检查是否到达终点或起点，如果到达则反向
        const distance = Vec3.distance(this._startPos, newPos);
        if (distance >= this.moveDistance) {
            this._direction = -1; // 向后移动
        } else if (newPos.z <= this._startPos.z) {
            this._direction = 1; // 向前移动
            this.node.setPosition(this._startPos); // 防止超出
        }
    }
}