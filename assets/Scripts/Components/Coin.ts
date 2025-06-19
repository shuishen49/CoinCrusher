import { _decorator, Component, Node, RigidBody, SphereCollider, Material } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Coin')
export class Coin extends Component {
    @property
    value: number = 1;

    // Store original material to reapply if needed, or for effects
    // private _material: Material = null!;

    onLoad() {
        // Optional: Get RigidBody and Collider if needed for script interactions
        // const rigidBody = this.getComponent(RigidBody);
        // const sphereCollider = this.getComponent(SphereCollider);
        // console.log('Coin onLoad: RigidBody and SphereCollider can be accessed here.');
    }

    start() {
        // console.log('Coin script started. Value: ' + this.value);
    }

    // Later, methods for when it's collected or falls into a scoring zone could be added here.
    // For example:
    // onCollisionEnter(other: Collider, self: Collider) {
    //     if (other.node.name === 'ScoringZone') {
    //         console.log('Coin collected!');
    //         // Add logic for scoring and removing the coin
    //         this.node.destroy();
    //     } else if (other.node.name === 'OutOfBoundsZone') {
    //         console.log('Coin out of bounds.');
    //         // Add logic for removing the coin
    //         this.node.destroy();
    //     }
    // }
}
