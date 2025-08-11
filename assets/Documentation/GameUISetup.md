# Game UI Setup Guide (Cocos Creator)

This guide details the UI elements required by `UIManager.ts` and how to set them up in the Cocos Creator editor. A well-structured UI is key for player feedback and interaction.

## Prerequisites

*   **`UIManager.ts`**: Ensure the script from `assets/Scripts/Managers/UIManager.ts` is in your project.
*   **`GameManager.ts` & `ScoreManager.ts`**: These managers should also be in your project and typically configured on nodes like `GameManagerNode` and `ScoreManagerNode` respectively.

## UI Structure Overview

All UI elements should typically be children of a `Canvas` node to ensure proper scaling and rendering.

```
Canvas
├── UIManagerNode (with UIManager.ts script)
├── InGameUI (Node)
│   ├── ScoreDisplayLabel (Label)
│   ├── CoinCountDisplayLabel (Label)
│   └── PowerBarContainer (Node) // Contains the actual power bar elements
│       └── ... (ProgressBar or Sprite for power bar, as per PowerBarUISetup.md)
└── GameOverScreen (Node, initially inactive)
    ├── Background (Sprite, optional)
    ├── StatusText (Label: "YOU WIN!" / "GAME OVER")
    ├── FinalScoreText (Label: "Final Score: X")
    └── RestartGameButton (Button)
        └── Label (Text: "Restart")
```

## Setup Steps

1.  **Canvas Node**:
    *   If you don't have one, create a `Canvas` node: Right-click in `Hierarchy -> Create UI -> Canvas`.
    *   The `Canvas` component on this node handles screen fitting. Default settings are usually fine to start.

2.  **UIManager Node**:
    *   Create an Empty Node as a child of the `Canvas` (or at the root, though under Canvas is common for UI managers). Name it `UIManagerNode`.
    *   Attach the `UIManager.ts` script to this `UIManagerNode`.
    *   The properties of this `UIManager` component will be assigned in the following steps.

3.  **In-Game UI Elements**:
    *   It's good practice to group active game UI under an Empty Node, e.g., `InGameUI`.
    *   **Score Label**:
        *   Create a Label: Right-click `Canvas` (or `InGameUI`) `-> UI -> Label`.
        *   Name it `ScoreDisplayLabel`.
        *   Position it (e.g., top-left of the screen via Anchors and Position properties).
        *   Customize font, size, color as needed. Initial text can be "Score: 0".
        *   Drag `ScoreDisplayLabel` from the Hierarchy to the `Score Label` property slot in the `UIManager` component (on `UIManagerNode`).
    *   **Coin Count Label**:
        *   Create another Label: Right-click `Canvas` (or `InGameUI`) `-> UI -> Label`.
        *   Name it `CoinCountDisplayLabel`.
        *   Position it (e.g., top-right or below score). Initial text "Coins: X".
        *   Drag `CoinCountDisplayLabel` to the `Coin Count Label` property slot in `UIManager`.
    *   **Power Bar Container** (for visibility control):
        *   The actual power bar (ProgressBar or Sprite) should have been set up as per `PowerBarUISetup.md` for the `CoinLauncher`.
        *   To allow `UIManager` to hide/show it (e.g., on game over), ensure the power bar elements are grouped under a single parent Node. This parent node is what you'll assign. For example, if your `LaunchPowerBar` (from `PowerBarUISetup.md`) is the root of the power bar, assign it here.
        *   Name this parent node (e.g., `PowerBarContainerNode` or use your existing power bar root node).
        *   Drag this node to the `Power Bar Container` property slot in `UIManager`.

4.  **Game Over Screen**:
    *   Create an Empty Node as a child of `Canvas`. Name it `GameOverScreen`.
    *   Set this node to be **inactive** by default (uncheck the box next to its name in the `Inspector`). `UIManager` will activate it when needed.
    *   You might add a background Sprite to this node to dim the game screen (e.g., a dark, semi-transparent image).
    *   Drag `GameOverScreen` from Hierarchy to the `Game Over Screen Node` property slot in `UIManager`.
    *   **Children of `GameOverScreen`**:
        *   **Status Label**:
            *   Create a Label as a child of `GameOverScreen`. Name it `StatusText`.
            *   Position it centrally. Text will be set by `UIManager` (e.g., "GAME OVER!").
            *   Drag `StatusText` to the `Game Over Status Label` slot in `UIManager`.
        *   **Final Score Label**:
            *   Create another Label as a child of `GameOverScreen`. Name it `FinalScoreText`.
            *   Position it below `StatusText`. Text "Final Score: 0".
            *   Drag `FinalScoreText` to the `Game Over Score Label` slot in `UIManager`.
        *   **Restart Button**:
            *   Create a Button: Right-click `GameOverScreen` `-> UI -> Button`.
            *   Name it `RestartGameButton`. Position it below `FinalScoreText`.
            *   The Button node will have a child Label by default. Change its text to "Restart" or "Play Again".
            *   Drag `RestartGameButton` (the parent Button node, not its child Label) to the `Restart Button` slot in `UIManager`.

## Final Check

*   Select `UIManagerNode`.
*   In the `Inspector`, verify that all property slots of the `UIManager` component are correctly assigned with the nodes you've created.
*   Ensure `ScoreManagerNode` and `GameManagerNode` (or however they are named) are present in the scene with their respective scripts.

This setup provides the `UIManager` with all the necessary references to update the game's UI dynamically based on events from other managers. Remember to adjust positions, fonts, colors, and graphics to match your game's visual style.
