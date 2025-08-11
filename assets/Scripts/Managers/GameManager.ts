import { _decorator, Component, director, Node, EventTarget } from 'cc';
import { ScoreManager, scoreManagerEventTarget, ScoreEvent } from './ScoreManager';
import { CoinLauncher } from './CoinLauncher';
// import { UIManager } from './UIManager'; // Assuming UIManager exists for UI updates. Placeholder.

const { ccclass, property } = _decorator;

export enum GameState {
    Initializing,
    Playing,
    Paused, // Added for potential future use
    GameOverWin,
    GameOverLose
}

export const gameManagerEventTarget = new EventTarget();
export enum GameEvent {
    COIN_COUNT_UPDATED = "gm-coin-count-updated", // Prefixed to avoid clashes
    GAME_STATE_CHANGED = "gm-game-state-changed"
}

@ccclass('GameManager')
export class GameManager extends Component {
    @property({
        tooltip: "Initial number of coins the player starts with."
    })
    initialCoinCount: number = 20;

    @property({
        type: ScoreManager,
        tooltip: "Reference to the ScoreManager. Assign in editor or it will try to find an instance."
    })
    scoreManager: ScoreManager | null = null;

    @property({
        type: CoinLauncher,
        tooltip: "Reference to the CoinLauncher. Assign in editor or it will try to find an instance."
    })
    coinLauncher: CoinLauncher | null = null;

    // @property({
    //     type: Node, // Or specific UIManager class
    //     tooltip: "Reference to the UIManager node for UI updates (e.g., game over screens)."
    // })
    // uiManagerNode: Node | null = null;
    // private _uiManager: UIManager | null = null; // Actual UIManager component

    private _currentCoinCount: number = 0;
    public get currentCoinCount(): number {
        return this._currentCoinCount;
    }

    private _gameState: GameState = GameState.Initializing;
    public get gameState(): GameState {
        return this._gameState;
    }

    private static _instance: GameManager | null = null;
    public static get instance(): GameManager | null {
        if (!GameManager._instance) {
            const scene = director.getScene();
            if (scene) {
                // Common practice: name the node containing the GameManager "GameManager" or "GameManagerNode"
                const gmNode = scene.getChildByName("GameManager") || scene.getChildByName("GameManagerNode");
                if (gmNode) {
                    GameManager._instance = gmNode.getComponent(GameManager);
                } else {
                    console.warn("GameManager.instance: GameManager node not found in scene. Ensure a node with GameManager component exists and is named appropriately if relying on auto-find.");
                }
            }
        }
        return GameManager._instance;
    }

    onLoad() {
        if (GameManager._instance && GameManager._instance !== this) {
            console.warn("Duplicate GameManager instance detected. Destroying this one.", this.node.name);
            this.destroy();
            return;
        }
        GameManager._instance = this;

        // Optional: Persist across scenes
        // if (this.node.scene.name !== "_PERSISTENT_NODE_") {
        //     director.addPersistRootNode(this.node);
        // }

        // Attempt to find ScoreManager if not assigned
        if (!this.scoreManager) {
            this.scoreManager = ScoreManager.instance;
            if (!this.scoreManager) {
                console.error("GameManager: ScoreManager not found or assigned!");
            }
        }

        // Attempt to find CoinLauncher if not assigned
        if (!this.coinLauncher) {
            const clNode = director.getScene()?.getChildByName("CoinLauncherNode"); // Assuming a specific node name
            if (clNode) {
                this.coinLauncher = clNode.getComponent(CoinLauncher);
            }
            if (!this.coinLauncher) {
                console.error("GameManager: CoinLauncher not found or assigned!");
            }
        }

        // if (this.uiManagerNode) {
        //     this._uiManager = this.uiManagerNode.getComponent(UIManager);
        // }

        scoreManagerEventTarget.on(ScoreEvent.TARGET_REACHED, this.onTargetScoreReached, this);

        this.setGameState(GameState.Initializing); // Set initial state
        this.resetGame(); // Start or reset the game
    }

    public resetGame(): void {
        this._currentCoinCount = this.initialCoinCount;
        gameManagerEventTarget.emit(GameEvent.COIN_COUNT_UPDATED, this._currentCoinCount);

        if (this.scoreManager) {
            this.scoreManager.resetScore();
        } else {
            console.warn("GameManager: ScoreManager reference is missing. Cannot reset score.");
        }

        if (this.coinLauncher) {
            this.coinLauncher.enabled = true; // Ensure launcher is active
        } else {
            console.warn("GameManager: CoinLauncher reference is missing. Cannot enable launcher.");
        }

        // if (this._uiManager) {
        //     this._uiManager.hideGameOverScreen();
        //     this._uiManager.updateCoinCount(this._currentCoinCount);
        //     this._uiManager.updateScore(0); // Assuming UIManager has score update too
        // }
        this.setGameState(GameState.Playing);
        console.log(`GameManager: Game (re)started. Initial coins: ${this._currentCoinCount}. Target Score: ${this.scoreManager?.targetScore || 'N/A'}`);
    }

    public onCoinLaunched(): void {
        if (this._gameState !== GameState.Playing) return;

        this._currentCoinCount--;
        gameManagerEventTarget.emit(GameEvent.COIN_COUNT_UPDATED, this._currentCoinCount);
        // console.log(`GameManager: Coin launched. Remaining coins: ${this._currentCoinCount}`);

        // if (this._uiManager) {
        //     this._uiManager.updateCoinCount(this._currentCoinCount);
        // }
        this.checkGameOverConditions();
    }

    private onTargetScoreReached(): void {
        if (this._gameState !== GameState.Playing) return; // Only act if playing

        console.log("GameManager: Event - Target score reached!");
        this.handleGameOver(true); // True for win
    }

    private checkGameOverConditions(): void {
        if (this._gameState !== GameState.Playing) return;

        // Win condition is primarily handled by onTargetScoreReached listening to ScoreManager.
        // This check here is more for the loss condition (out of coins).
        if (this._currentCoinCount <= 0) {
            // Check if the target score was met simultaneously with the last coin.
            if (this.scoreManager && this.scoreManager.targetScore > 0 &&
                this.scoreManager.currentScore >= this.scoreManager.targetScore) {
                // This situation implies winning on the very last coin.
                // onTargetScoreReached should ideally fire and handle this.
                // If it hasn't for some reason (e.g. event timing), handle as win.
                if(this._gameState === GameState.Playing) this.handleGameOver(true);
            } else {
                // Out of coins and target score not met.
                console.log("GameManager: Out of coins. Target score not met.");
                this.handleGameOver(false); // False for lose
            }
        }
    }

    private handleGameOver(didWin: boolean): void {
        // Prevent multiple calls if already game over
        if (this._gameState !== GameState.Playing) {
            console.log(`GameManager: handleGameOver called but game not in Playing state (current: ${GameState[this._gameState]}). Ignoring.`);
            return;
        }

        this.setGameState(didWin ? GameState.GameOverWin : GameState.GameOverLose);

        if (this.coinLauncher) {
            this.coinLauncher.enabled = false; // Disable further launching
        }

        // if (this._uiManager) {
        //     this._uiManager.showGameOverScreen(didWin, this.scoreManager ? this.scoreManager.currentScore : 0);
        // }

        if (didWin) {
            console.log(`GameManager: Game Over - YOU WIN! Final Score: ${this.scoreManager?.currentScore || 0}`);
        } else {
            console.log(`GameManager: Game Over - YOU LOSE! Final Score: ${this.scoreManager?.currentScore || 0}. Coins Left: ${this._currentCoinCount}`);
        }
        // Consider adding a delay or prompt before allowing a resetGame() call.
    }

    public setGameState(newState: GameState): void {
        if (this._gameState === newState) return; // No change

        const oldState = this._gameState;
        this._gameState = newState;
        gameManagerEventTarget.emit(GameEvent.GAME_STATE_CHANGED, this._gameState, oldState);
        console.log(`GameManager: Game state changed from ${GameState[oldState]} to ${GameState[this._gameState]}`);
    }

    onDestroy() {
        scoreManagerEventTarget.off(ScoreEvent.TARGET_REACHED, this.onTargetScoreReached, this);
        if (GameManager._instance === this) {
            GameManager._instance = null;
            console.log("GameManager instance destroyed.");
        }
    }
}
