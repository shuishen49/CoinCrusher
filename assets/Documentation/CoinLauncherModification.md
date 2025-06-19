# `CoinLauncher.ts` Modification for GameManager Integration

To allow the `GameManager` to track the number of launched coins and manage game state accordingly, the `CoinLauncher.ts` script needs a minor modification.

## Required Change

The `CoinLauncher` should notify the `GameManager` each time a coin is successfully launched. This is achieved by calling a public method on the `GameManager` instance.

**File to Modify**: `assets/Scripts/Managers/CoinLauncher.ts`

**Steps**:

1.  **Import `GameManager`**:
    Add the following import statement at the top of `CoinLauncher.ts`:

    ```typescript
    // Add this among other imports
    import { GameManager } from './GameManager'; // Assuming GameManager.ts is in the same Managers folder
    ```
    *If `GameManager.ts` is in a different location relative to `CoinLauncher.ts`, adjust the path accordingly.* For example, if `CoinLauncher.ts` is in `assets/Scripts/Components/` and `GameManager.ts` is in `assets/Scripts/Managers/`, the import would be `import { GameManager } from '../Managers/GameManager';`.
    *(Self-correction: The prompt placed CoinLauncher in `assets/Scripts/Managers/`, so the same folder import `./GameManager` is correct as per the prompt's plan)*


2.  **Call `onCoinLaunched()` in `GameManager`**:
    In the `launchCoin()` method of `CoinLauncher.ts`, after the coin has been instantiated and the impulse has been applied (i.e., the launch is successful), add a call to the `GameManager`.

    Locate this section in `launchCoin()` (or similar):

    ```typescript
    // ... existing code ...
            const rigidBody = coinNode.getComponent(RigidBody);
            if (rigidBody) {
                rigidBody.applyImpulse(launchDirection.multiplyScalar(launchForceValue));
            } else {
                console.warn("Launched coin prefab does not have a RigidBody component.");
            }
    // ... existing code ...
    ```

    **After** this block (or a similar part that confirms the coin is launched), add the following lines:

    ```typescript
    // ... after applying impulse ...
            if (GameManager.instance) {
                GameManager.instance.onCoinLaunched();
            } else {
                console.warn("CoinLauncher: GameManager instance not found. Cannot notify of coin launch.");
            }
        } // This might be the end of the launchCoin method or just before a reset of charge etc.
    ```

## Example Snippet of `launchCoin()` (modified section):

```typescript
// In CoinLauncher.ts

// ... other imports ...
import { GameManager } from './GameManager'; // Ensure correct path

// ... class definition ...

        launchCoin() {
            if (!this.coinPrefab) {
                console.error("CoinLauncher: Coin Prefab not assigned. Cannot launch.");
                return;
            }
            if (!this.launchPositionNode) {
                console.error("CoinLauncher: Launch Position Node not assigned. Cannot launch.");
                return;
            }

            const coinNode = instantiate(this.coinPrefab);
            director.getScene()?.addChild(coinNode);

            coinNode.setWorldPosition(this.launchPositionNode.worldPosition);
            // ... (rest of your position/rotation setup) ...

            const launchForceValue = lerp(this.minLaunchForce, this.maxLaunchForce, this._currentCharge);
            // ... (launch direction calculation) ...
            let launchDirection = Vec3.transformQuat(new Vec3(), baseForward, combinedRotationQuat);
            launchDirection.normalize();

            const rigidBody = coinNode.getComponent(RigidBody);
            if (rigidBody) {
                rigidBody.applyImpulse(launchDirection.multiplyScalar(launchForceValue));

                // ---- ADDED SECTION ----
                if (GameManager.instance) {
                    GameManager.instance.onCoinLaunched();
                } else {
                    console.warn("CoinLauncher: GameManager instance not found. Cannot notify of coin launch.");
                }
                // ---- END ADDED SECTION ----

            } else {
                console.warn("Launched coin prefab does not have a RigidBody component.");
            }

            // Reset charge and other states AFTER confirming launch and notification
            // this._isCharging = false; // This might be in onTouchEnd
            // this._currentCharge = 0;
            // this.updatePowerBarVisual(0);
        }
// ... rest of the class ...
```

This modification ensures that the `GameManager` is aware of each coin launch, allowing it to correctly manage the `currentCoinCount` and trigger game over conditions. The actual application of this change to `CoinLauncher.ts` would be done in a subsequent step if this were a multi-turn process involving file edits. This document serves as the instruction for that change.
