# Physics Tuning Guide for Coin Dozer Game

Achieving realistic and satisfying physics interactions is crucial for a coin dozer game. This guide provides recommendations for tuning physics properties on various game elements. Remember that these are starting points, and iterative testing is key.

## 1. General Physics Settings (Project Settings)

Access these via `Project -> Project Settings -> Physics` (or similar path depending on Cocos Creator version).

*   **Gravity**:
    *   The default `(X:0, Y:-9.8, Z:0)` (or a higher value like -10 or -20 for more "punch") is usually a good starting point for standard Earth-like gravity.
    *   Adjust this if you want coins to feel heavier/lighter or fall faster/slower globally.
*   **Default Physics Material Properties**:
    *   `DefaultFriction`: While you can set a global default, it's generally better to define friction on individual colliders or via specific Physics Materials for more control.
    *   `DefaultRestitution`: Similar to friction, per-object settings are preferred.
    *   It's often best to create specific Physics Materials (see below) rather than relying heavily on these defaults.
*   **Sleep Thresholds**:
    *   `SleepThresholdLinear` / `SleepThresholdAngular`: Default values are usually fine. These control when rigid bodies can "go to sleep" (stop being simulated) if they are not moving much, which is good for performance. If objects seem to stop moving too abruptly or jitter, these might need slight adjustments, but it's rare.

## 2. Physics Materials

Creating and assigning specific Physics Materials is highly recommended for fine-grained control over friction and restitution.

*   **Create Physics Material**:
    *   In the `Assets` panel, right-click `Create -> Physics Material`.
    *   Name them descriptively, e.g., `CoinPhysicsMaterial`, `PlatformPhysicsMaterial`, `BoundaryPhysicsMaterial`.
*   **Assign to Colliders**:
    *   Select a Node with a Collider component.
    *   In the `Collider` component (e.g., `SphereCollider`, `BoxCollider`), there's a `Material` property. Drag your created Physics Material here.

## 3. Coin Prefab (`CoinPrefab`)

Refer to `CoinPrefabSetup.md` for initial setup. The following are tuning suggestions for its physics components.

*   **`RigidBody` Component**:
    *   `Enabled`: Must be checked.
    *   `Type`: Should be `DYNAMIC`.
    *   `Mass`: Crucial for stacking and interaction.
        *   If too light, coins might behave erratically, be pushed too easily by the platform's movement, or float.
        *   If too heavy, they might not be pushed effectively by newly launched coins or the platform.
        *   **Suggestion**: Start around `0.1` to `0.5`. Test how they interact with each other and the launcher force.
    *   `LinearDamping`: Helps coins settle and stop sliding.
        *   **Suggestion**: `0.1` to `0.5`. Higher values make them stop sooner.
    *   `AngularDamping`: Helps coins stop spinning.
        *   **Suggestion**: `0.1` to `0.5`. Higher values reduce spin more quickly.
    *   `UseGravity`: Must be checked.
    *   `IsKinematic`: Must be unchecked.
    *   `LinearFactor` / `AngularFactor`: Usually `(1,1,1)` unless you want to restrict motion/rotation on certain axes.

*   **`SphereCollider` Component**:
    *   `Enabled`: Must be checked.
    *   `IsTrigger`: Must be unchecked.
    *   `Center`: Usually `(0,0,0)` relative to the coin's visual center.
    *   `Radius`: **Critically important**. This must accurately match the visual radius of your coin model. If it's too small, coins will visually overlap before colliding. If too large, they'll appear to float or interact before touching.
    *   `Material` (Physics Material assigned here):
        *   `Friction`: Important for how coins slide against each other and the platform.
            *   **Suggestion**: `0.3` to `0.7`. Higher friction = less sliding, better stacking. Too high might make them stick unnaturally.
        *   `Restitution` (Bounciness): How much energy is returned after a collision.
            *   **Suggestion**: Generally low for coins, `0.1` to `0.3`, to prevent excessive bouncing. Too high and they'll act like rubber balls.

## 4. Platform Prefab (`PlatformPrefab`)

Refer to `PlatformPrefabSetup.md` for initial setup.

*   **Root `PlatformPrefab` Node (with `Platform.ts` script)**:
    *   `RigidBody` Component:
        *   `Type`: `KINEMATIC` (as planned for the swinging platform). Its motion is controlled by the script.
        *   `UseGravity`: Unchecked.
        *   `IsKinematic`: Checked.
        *   Kinematic bodies don't have mass in the same way dynamic bodies do, but their movement will push dynamic objects.

*   **`PlatformSurface` Child Node (the actual Cube/surface coins sit on)**:
    *   `BoxCollider` Component:
        *   `Enabled`: Must be checked.
        *   `IsTrigger`: Must be unchecked.
        *   `Size`: Must accurately match the visual dimensions of the platform surface.
        *   `Material` (Physics Material assigned here for the main surface):
            *   `Friction`: How coins slide on the platform. A wooden or slightly rough surface might have moderate friction.
                *   **Suggestion**: `0.4` to `0.6`. Adjust based on desired coin slide.
            *   `Restitution`: Typically low.
                *   **Suggestion**: `0.1` to `0.3`.

*   **Boundary Colliders (Side Walls of the Platform)**:
    *   These are child nodes of `PlatformPrefab`, each with its own `BoxCollider`.
    *   `BoxCollider` Components:
        *   `Enabled`: Must be checked.
        *   `IsTrigger`: Must be unchecked.
        *   `Size`: Must accurately form the "walls".
        *   `Material` (Physics Material assigned here, can be same as platform or a different one):
            *   `Friction`: Can be similar to the platform or slightly higher to prevent coins from "climbing" them too easily.
                *   **Suggestion**: `0.4` to `0.7`.
            *   `Restitution`: Low, to absorb impact.
                *   **Suggestion**: `0.1` to `0.2`.

## 5. Testing and Iteration - The Golden Rule

*   **Start with Suggestions**: Use the values above as initial settings.
*   **Observe Interactions**:
    *   Launch coins: Do they fly realistically?
    *   Coin-Platform: Do coins slide too much? Not enough? Do they bounce oddly?
    *   Coin-Coin: Do they stack naturally? Do they pass through each other (collider size/shape issue or very high forces)? Do they jitter excessively (could be mass, friction, or too many active objects)?
    *   Platform Swing: Does the platform push coins convincingly?
*   **Adjust One Property at a Time**: This is crucial. If you change mass, friction, and restitution all at once, you won't know which change had what effect.
    *   Example: If coins slide too much, try increasing `Friction` on the `CoinPhysicsMaterial` or `PlatformPhysicsMaterial`.
    *   Example: If coins are too bouncy, decrease `Restitution`.
    *   Example: If coins don't stack well or are pushed too easily, experiment with `Mass` on the `CoinPrefab`.
*   **Scale Matters**: The physical scale of your models impacts how these values feel. A "mass" of 0.1 for a tiny coin might feel different than for a large coin if other forces (like launch force) aren't scaled accordingly.
*   **Test Frequently**: Make small adjustments and test immediately. This iterative process is key to achieving the desired game feel.

By carefully tuning these properties and observing the results, you can create a coin dozer game with satisfying and believable physics.
