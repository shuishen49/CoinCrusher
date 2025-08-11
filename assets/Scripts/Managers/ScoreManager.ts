import { _decorator, Component, director, EventTarget, Node } from 'cc';
const { ccclass, property } = _decorator;

export const scoreManagerEventTarget = new EventTarget();

export enum ScoreEvent {
    SCORE_UPDATED = "score-updated",
    TARGET_REACHED = "target-reached" // Optional
}

@ccclass('ScoreManager')
export class ScoreManager extends Component {
    @property
    private _currentScore: number = 0;
    public get currentScore(): number {
        return this._currentScore;
    }

    @property({ tooltip: "Score needed to win the game. Set to 0 or less for endless mode." })
    public targetScore: number = 100;

    private static _instance: ScoreManager | null = null;
    public static get instance(): ScoreManager | null {
        if (!ScoreManager._instance) {
            // Attempt to find it in the scene if not yet set.
            // This is a fallback, ideally it's set in onLoad of the primary instance.
            const scene = director.getScene();
            if (scene) {
                // Common practice: name the node containing the ScoreManager "ScoreManager" or "GameManager"
                const smNode = scene.getChildByName("ScoreManagerNode") || scene.getChildByName("ScoreManager") || scene.getChildByName("GameManager");
                if (smNode) {
                    ScoreManager._instance = smNode.getComponent(ScoreManager);
                }
            }
        }
        return ScoreManager._instance;
    }

    onLoad() {
        if (ScoreManager._instance && ScoreManager._instance !== this) {
            console.warn("Duplicate ScoreManager instance detected. Destroying this one.", this.node.name);
            this.destroy();
            return;
        }
        ScoreManager._instance = this;

        // To make it persist across scene loads (if needed):
        // if (this.node.scene.name !== "_PERSISTENT_NODE_") { // Check if it's not already in the persistent scene
        //     director.addPersistRootNode(this.node);
        // }

        this._currentScore = 0; // Ensure score is reset on load/initialization
        console.log("ScoreManager initialized. Current score: 0");
    }

    public addScore(points: number): void {
        if (points <= 0) {
            console.warn("Attempted to add zero or negative points.");
            return;
        }
        this._currentScore += points;
        console.log(`Score: ${this._currentScore} (Added: ${points})`);
        scoreManagerEventTarget.emit(ScoreEvent.SCORE_UPDATED, this._currentScore, points); // Emit new total and points added

        if (this.targetScore > 0 && this._currentScore >= this.targetScore) {
            console.log(`Target score of ${this.targetScore} reached!`);
            scoreManagerEventTarget.emit(ScoreEvent.TARGET_REACHED, this._currentScore);
            // Further game win logic can be handled by a GameManager listening to this event.
        }
    }

    public getScore(): number {
        return this._currentScore;
    }

    public resetScore(): void {
        this._currentScore = 0;
        console.log("Score reset to 0.");
        scoreManagerEventTarget.emit(ScoreEvent.SCORE_UPDATED, this._currentScore, 0); // Emit new total and 0 points added
    }

    onDestroy() {
        if (ScoreManager._instance === this) {
            ScoreManager._instance = null;
            console.log("ScoreManager instance destroyed.");
        }
        // scoreManagerEventTarget.off(ScoreEvent.SCORE_UPDATED); // Clean up listeners if any were added to it directly
        // scoreManagerEventTarget.off(ScoreEvent.TARGET_REACHED);
    }
}
