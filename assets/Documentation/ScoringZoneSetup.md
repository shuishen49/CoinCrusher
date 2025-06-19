# Scoring Zone Setup Guide (Cocos Creator)

This guide explains how to set up Scoring Zones in your Coin Dozer game scene using the `ScoringZone.ts` component. These zones detect when coins enter them and award points via the `ScoreManager`.

## Prerequisites

1.  **`ScoringZone.ts` Script**: Ensure the `ScoringZone.ts` script (located in `assets/Scripts/Components/`) is present in your project.
2.  **`ScoreManager.ts` Script**: Ensure the `ScoreManager.ts` script (located in `assets/Scripts/Managers/`) is present.
3.  **`ScoreManager` in Scene**: An instance of `ScoreManager` must exist in your scene for scoring to work. Typically, you would:
    *   Create an empty node named `ScoreManagerNode` (or similar, like `GameManager`).
    *   Attach the `ScoreManager.ts` script to this node.
    *   The `ScoreManager` uses a singleton pattern, so one instance should be accessible globally.

## Setting Up a Scoring Zone

1.  **Create an Empty Node**:
    *   In the `Hierarchy` panel, right-click and select `Create Empty Node`.
    *   Rename this node to something descriptive, e.g., `FrontScoringZone`, `SidePocketScoringZone`, or `OutOfBoundsZone`.
    *   Position this node in your scene where you want to detect coins (e.g., just off the front edge of the platform, or in a collection bin).

2.  **Add a Collider Component**:
    *   Select the newly created Empty Node for your scoring zone.
    *   In the `Inspector` panel, click `Add Component`.
    *   Choose an appropriate 3D collider type. For typical scoring areas, a `BoxCollider` is often suitable. For a circular hole, a `SphereCollider` or `CylinderCollider` might be used.
        *   Example: `Physics -> Collider -> BoxCollider`.

3.  **Configure the Collider**:
    *   **Size and Position**: Adjust the `Center` (offset from the Empty Node's origin) and `Size` (for BoxCollider) or `Radius`/`Height` (for Sphere/CylinderCollider) of the collider. Visually align it in the scene editor to cover the exact area where coins should be scored.
    *   **Is Trigger**: This is **CRITICAL**. In the `Collider` component's properties, check the `Is Trigger` box. This makes the collider detect intersections without causing physical collisions. The `ScoringZone.ts` script relies on trigger events (`onTriggerEnter`).

4.  **Attach `ScoringZone.ts` Script**:
    *   With the Scoring Zone node still selected, click `Add Component` in the `Inspector`.
    *   Search for `ScoringZone` and add it.

5.  **Configure `ScoringZone` Properties**:
    *   In the `Inspector`, find the `Scoring Zone` component section.
    *   `Points To Award`: Set the number of points this specific zone should award when a coin enters it (e.g., `10`, `50`).

## Important Considerations:

*   **Coin Setup**: Ensure your `CoinPrefab` has a `RigidBody` and a `Collider` component, and is tagged or has the `Coin.ts` script attached so that `ScoringZone.ts` can identify it. The current `ScoringZone.ts` script identifies coins by checking for the `Coin` component.
*   **Multiple Zones**: You can create multiple scoring zones. For instance:
    *   A main zone at the front of the platform for regular scoring.
    *   Side zones or "gutters" that might award fewer points or even penalize the player (by awarding negative points, though the current `ScoreManager.addScore` filters out <=0 points unless modified).
    *   An "out of bounds" zone far below the platform to catch and destroy any coins that fall off in unexpected ways, awarding 0 points.
*   **Visualization**: Colliders are invisible during gameplay by default. During setup, the green wireframe of the collider is visible in the editor. You might want to add a semi-transparent visual mesh temporarily during development to confirm the zone's area, or just rely on the collider wireframe.
*   **Performance**: While a few box colliders as triggers are generally fine, avoid overly complex collider shapes or an excessive number of trigger zones if performance becomes an issue on target devices.
*   **Coin Destruction**: The `ScoringZone.ts` script is set up to destroy the coin once it's scored. This is important to prevent the same coin from awarding points multiple times.

By following these steps, you can effectively implement scoring areas in your coin dozer game, linking them to the central `ScoreManager` for score accumulation. Remember to test thoroughly to ensure coins are detected correctly and points are awarded as expected.
