# Power Bar UI Setup (Cocos Creator)

This document describes how to set up a simple UI Power Bar that can be controlled by the `CoinLauncher.ts` script.

## Method 1: Using a ProgressBar Component

1.  **Ensure Canvas**:
    *   Make sure you have a `Canvas` node in your scene. If not, right-click in the `Hierarchy` -> `Create UI -> Canvas`. This Canvas will be the root for UI elements. The `CoinLauncher` script attempts to find a node named "Canvas" to register input events.

2.  **Add ProgressBar**:
    *   Right-click on your `Canvas` node (or a child UI panel) in the `Hierarchy`.
    *   Select `Create UI -> ProgressBar`.
    *   Rename this new node to something descriptive, like `LaunchPowerBar`.

3.  **Position and Size**:
    *   Select `LaunchPowerBar`.
    *   In the `Inspector`, adjust its `Position` (e.g., bottom-center of the screen). You might need to adjust anchors for responsive layout. For example:
        *   Anchor: `(0.5, 0)` (bottom-center)
        *   Position: `(0, 50)` (50 pixels up from the bottom)
    *   Adjust `Width` and `Height` of the ProgressBar node as desired (e.g., `Width: 200`, `Height: 20`).

4.  **Style Bar Sprite**:
    *   The `ProgressBar` component has a `Bar Sprite` property. This is a `Sprite` node that is a child of the `ProgressBar` node (often named `bar`).
    *   Select this child `bar` Sprite.
    *   You can change its color or assign a custom sprite frame to it.
    *   Ensure its `Type` is usually `SLICED` or `SIMPLE` depending on your bar's appearance.
    *   The `ProgressBar` component will control the width or fill of this `Bar Sprite`.

5.  **Configure ProgressBar Component**:
    *   Select the `LaunchPowerBar` node again.
    *   In the `ProgressBar` component settings:
        *   `Mode`: Typically `HORIZONTAL`.
        *   `Progress`: Set to `0` initially. The `CoinLauncher` script will update this.
        *   `Total Length`: This is usually 1, representing 100%.

6.  **Assign to CoinLauncher**:
    *   Select the node in your scene that has the `CoinLauncher.ts` script attached (e.g., a `GameManagerNode` or the `CoinLauncher` itself if it's a standalone entity).
    *   In the `Inspector`, find the `Coin Launcher` component.
    *   Drag the `LaunchPowerBar` node from the `Hierarchy` panel to the `Power Bar` property slot in the `Coin Launcher` component.

## Method 2: Using a Sprite with Filled Type

1.  **Ensure Canvas**: (Same as step 1 above)

2.  **Add UI Sprite for Background (Optional)**:
    *   You might want a background for your power bar. Create a `Sprite` node (`Create UI -> Sprite`) for this. Size and position it. Name it `PowerBarBackground`.

3.  **Add UI Sprite for Fill**:
    *   Create another `Sprite` node, possibly as a child of `PowerBarBackground` or directly under the Canvas. Name it `PowerBarFill`.
    *   Position and size it to fit within/over the background.

4.  **Configure Fill Sprite**:
    *   Select `PowerBarFill`.
    *   In the `Sprite` component settings:
        *   `Type`: Set to `FILLED`.
        *   `Fill Type`: Set to `HORIZONTAL`.
        *   `Fill Start`: Set to `0`. This means the fill will start from the left edge.
        *   `Fill Range`: Set to `0` initially. The `CoinLauncher` script will update this property from `0` to `1`.
    *   Assign a `SpriteFrame` (image/color) for the fill.

5.  **Assign to CoinLauncher**:
    *   Select the node with the `CoinLauncher.ts` script.
    *   Drag the `PowerBarFill` node from the `Hierarchy` to the `Power Bar` property slot in the `Coin Launcher` component.

**Usage Notes**:

*   The `CoinLauncher.ts` script is designed to work with either a `ProgressBar` or a `Sprite` (with `Type = FILLED`). It checks for `ProgressBar` first.
*   If using a simple `Sprite` and controlling its `scale.x` instead of `fillRange`, ensure the node's anchor is set to the left (`Anchor X = 0`). The provided script prioritizes `ProgressBar` and `Sprite.fillRange`.

This setup provides a visual indication of the launch power controlled by the player's touch duration.
