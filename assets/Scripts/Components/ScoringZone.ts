import { _decorator, Component, Collider, ITriggerEvent, Node } from 'cc';
import { Coin } from './Coin'; // Correct: Coin.ts is in the same 'Components' folder
import { ScoreManager } from '../Managers/ScoreManager'; // Correct: ScoreManager.ts is in 'Managers' folder, one level up

const { ccclass, property } = _decorator;

@ccclass('ScoringZone')
export class ScoringZone extends Component {
    @property({ tooltip: "Points awarded when a coin enters this zone." })
    pointsToAward: number = 10;

    private _collider: Collider | null = null;

    onLoad() {
        this._collider = this.getComponent(Collider);
        if (!this._collider) {
            console.error(`ScoringZone on node '${this.node.name}' requires a Collider component on the same node. Disabling script.`);
            this.enabled = false; // Disable script if no collider
            return;
        }

        if (!this._collider.isTrigger) {
            console.warn(`Collider on ScoringZone '${this.node.name}' is not set to 'Is Trigger'. It might not work as expected for scoring. Please enable 'Is Trigger' in the editor.`);
            // Forcing it here could be an option, but it's better if the user sets it up correctly in the editor.
            // this._collider.isTrigger = true;
        }

        // Register the trigger event listener
        this._collider.on('onTriggerEnter', this.onTriggerEnterListener, this);
        console.log(`ScoringZone '${this.node.name}' loaded. Points: ${this.pointsToAward}. Listening for trigger events.`);
    }

    onTriggerEnterListener(event: ITriggerEvent) {
        const otherNode = event.otherCollider.node;
        // Check if the other node is still valid (it might have been destroyed by another script/zone simultaneously)
        if (!otherNode || !otherNode.isValid) {
            return;
        }

        const coinComponent = otherNode.getComponent(Coin);

        if (coinComponent) {
            // Ensure the ScoreManager instance is available
            if (ScoreManager.instance) {
                ScoreManager.instance.addScore(this.pointsToAward);
            } else {
                console.error(`ScoringZone '${this.node.name}': ScoreManager instance not found! Cannot award points.`);
            }

            // Optional: Instantiate a particle effect at the coin's position before destroying it.
            // e.g., if (this.scoreParticleEffectPrefab) { instantiate(this.scoreParticleEffectPrefab).worldPosition = otherNode.worldPosition; }

            // Deactivate or destroy the coin. Destroy is generally cleaner to prevent re-triggering or physics issues.
            otherNode.destroy();
            // console.log(`Coin '${otherNode.name}' entered scoring zone '${this.node.name}', awarded ${this.pointsToAward} points. Coin destroyed.`);
        }
    }

    onDestroy() {
        if (this._collider) {
            // Remove the trigger event listener when the component is destroyed
            this._collider.off('onTriggerEnter', this.onTriggerEnterListener, this);
        }
        // console.log(`ScoringZone '${this.node.name}' destroyed.`);
    }
}
