import { _decorator, Component, Node, Label, Button, director } from 'cc';
import { ScoreManager, scoreManagerEventTarget, ScoreEvent } from './ScoreManager';
import { GameManager, gameManagerEventTarget, GameEvent, GameState } from './GameManager';

const { ccclass, property } = _decorator;

@ccclass('UIManager')
export class UIManager extends Component {
    @property({
        type: Label,
        tooltip: "Label to display the current score."
    })
    scoreLabel: Label | null = null;

    @property({
        type: Label,
        tooltip: "Label to display the remaining coin count."
    })
    coinCountLabel: Label | null = null;

    @property({
        type: Node,
        tooltip: "Parent node of the power bar UI, used for visibility control."
    })
    powerBarContainer: Node | null = null;

    @property({
        type: Node,
        tooltip: "Root node of the Game Over screen."
    })
    gameOverScreenNode: Node | null = null;

    @property({
        type: Label,
        tooltip: "Label on the Game Over screen to display win/loss status."
    })
    gameOverStatusLabel: Label | null = null;

    @property({
        type: Label,
        tooltip: "Label on the Game Over screen to display the final score."
    })
    gameOverScoreLabel: Label | null = null;

    @property({
        type: Button,
        tooltip: "Button to restart the game from the Game Over screen."
    })
    restartButton: Button | null = null;

    onLoad() {
        // Null checks for essential components
        if (!this.scoreLabel) console.warn("UIManager: Score Label (scoreLabel) not assigned in the editor.");
        if (!this.coinCountLabel) console.warn("UIManager: Coin Count Label (coinCountLabel) not assigned in the editor.");
        if (!this.gameOverScreenNode) console.warn("UIManager: Game Over Screen Node (gameOverScreenNode) not assigned.");
        if (!this.gameOverStatusLabel) console.warn("UIManager: Game Over Status Label (gameOverStatusLabel) not assigned.");
        if (!this.gameOverScoreLabel) console.warn("UIManager: Game Over Score Label (gameOverScoreLabel) not assigned.");
        if (!this.restartButton) console.warn("UIManager: Restart Button (restartButton) not assigned.");
        if (!this.powerBarContainer) console.warn("UIManager: Power Bar Container (powerBarContainer) not assigned. Visibility control might be affected.");

        if (this.gameOverScreenNode) {
            this.gameOverScreenNode.active = false; // Ensure it's hidden initially
        }

        // Subscribe to relevant events
        scoreManagerEventTarget.on(ScoreEvent.SCORE_UPDATED, this.onScoreUpdated, this);
        gameManagerEventTarget.on(GameEvent.COIN_COUNT_UPDATED, this.onCoinCountUpdated, this);
        gameManagerEventTarget.on(GameEvent.GAME_STATE_CHANGED, this.onGameStateChanged, this);

        if (this.restartButton) {
            this.restartButton.node.on(Button.EventType.CLICK, this.onRestartButtonClicked, this);
        }

        // Perform an initial sync of UI elements with current game data
        // This is useful if UIManager is loaded after other managers or if the scene is reloaded.
        this.scheduleOnce(this.initialUISync, 0); // Schedule to run in the next frame to ensure other managers are loaded
    }

    initialUISync() {
        console.log("UIManager: Performing initial UI sync.");
        if (ScoreManager.instance) {
            this.onScoreUpdated(ScoreManager.instance.currentScore, 0); // Pass pointsDelta as 0 or undefined
        } else {
            console.warn("UIManager: ScoreManager instance not found during initial sync.");
            if(this.scoreLabel) this.scoreLabel.string = "Score: N/A";
        }

        if (GameManager.instance) {
            this.onCoinCountUpdated(GameManager.instance.currentCoinCount);
            this.onGameStateChanged(GameManager.instance.gameState, GameState.Initializing); // Pass a default oldState
        } else {
            console.warn("UIManager: GameManager instance not found during initial sync.");
            if(this.coinCountLabel) this.coinCountLabel.string = "Coins: N/A";
        }
    }

    onScoreUpdated(score: number, pointsDelta?: number) { // ScoreManager emits score and points added
        if (this.scoreLabel) {
            this.scoreLabel.string = `Score: ${score}`;
        }
    }

    onCoinCountUpdated(count: number) {
        if (this.coinCountLabel) {
            this.coinCountLabel.string = `Coins: ${count}`;
        }
    }

    onGameStateChanged(newState: GameState, oldState?: GameState) {
        console.log(`UIManager: Game state changed to ${GameState[newState]}`);
        if (newState === GameState.GameOverWin || newState === GameState.GameOverLose) {
            const finalScore = ScoreManager.instance ? ScoreManager.instance.currentScore : 0;
            this.showGameOverScreen(newState === GameState.GameOverWin, finalScore);
            if (this.powerBarContainer) this.powerBarContainer.active = false;
        } else if (newState === GameState.Playing) {
            this.hideGameOverScreen();
            if (this.powerBarContainer) this.powerBarContainer.active = true;
        } else if (newState === GameState.Initializing) {
            this.hideGameOverScreen();
            // Power bar visibility can be true or false based on design for initializing state
            if (this.powerBarContainer) this.powerBarContainer.active = true;
        }
    }

    showGameOverScreen(didWin: boolean, finalScore: number) {
        if (this.gameOverScreenNode) {
            if (this.gameOverStatusLabel) {
                this.gameOverStatusLabel.string = didWin ? "YOU WIN!" : "GAME OVER!";
            }
            if (this.gameOverScoreLabel) {
                this.gameOverScoreLabel.string = `Final Score: ${finalScore}`;
            }
            this.gameOverScreenNode.active = true;
            console.log(`UIManager: Game Over screen shown. Win: ${didWin}, Score: ${finalScore}`);
        } else {
            console.warn("UIManager: gameOverScreenNode is null. Cannot show game over screen.");
        }
    }

    hideGameOverScreen() {
        if (this.gameOverScreenNode) {
            this.gameOverScreenNode.active = false;
            console.log("UIManager: Game Over screen hidden.");
        }
    }

    onRestartButtonClicked() {
        console.log("UIManager: Restart button clicked.");
        if (GameManager.instance) {
            GameManager.instance.resetGame();
        } else {
            console.error("UIManager: GameManager instance not found. Cannot restart game.");
        }
        // Hiding the game over screen is now handled by the onGameStateChanged(GameState.Playing)
    }

    onDestroy() {
        // Unsubscribe from all events to prevent memory leaks
        scoreManagerEventTarget.off(ScoreEvent.SCORE_UPDATED, this.onScoreUpdated, this);
        gameManagerEventTarget.off(GameEvent.COIN_COUNT_UPDATED, this.onCoinCountUpdated, this);
        gameManagerEventTarget.off(GameEvent.GAME_STATE_CHANGED, this.onGameStateChanged, this);

        if (this.restartButton && this.restartButton.node.isValid) { // Check if node is still valid
            this.restartButton.node.off(Button.EventType.CLICK, this.onRestartButtonClicked, this);
        }
        console.log("UIManager: Destroyed and listeners cleaned up.");
    }
}
