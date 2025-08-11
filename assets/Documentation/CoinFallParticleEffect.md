# Coin Fall Particle Effect Setup Guide

This guide explains how to create a "闪光效果" (sparkling flash effect) particle system in Cocos Creator and trigger it from the `ScoringZone.ts` script when a coin is scored.

## 1. Creating the Particle Effect Prefab

1.  **Create Particle System**:
    *   In the Cocos Creator `Assets` panel, right-click where you want to save the particle effect (e.g., a new folder `assets/Effects/Particles/` or directly in `assets/Prefabs/`).
    *   Select `Create -> Particle System`. Cocos Creator offers different types of particle systems (e.g., ParticleSystem for 3D, or potentially a 2D specific one if your project is heavily 2D). For a 3D coin dozer, use the 3D Particle System.
    *   Name the created particle system asset `CoinSparkleEffect`.

2.  **Configure Particle Properties**:
    *   Select the `CoinSparkleEffect` asset in the `Assets` panel. The `Inspector` will show its properties.
    *   Adjust the following properties to create a short, bright, sparkling burst:
        *   **General**:
            *   `Duration`: `0.5` (effect lasts for 0.5 seconds).
            *   `Looping`: `false` (the effect plays once).
            *   `Play On Awake`: `true` (starts automatically when the node is created/activated).
        *   **Emission Module**:
            *   `Rate over Time` (or `Emission Rate`): `0` (if using bursts).
            *   `Bursts`: Add a burst element.
                *   `Time`: `0.0` (burst happens at the start).
                *   `Count`: `30` to `50` (number of particles in the burst).
        *   **Shape Module** (defines where particles are emitted from):
            *   `ShapeType`: `Sphere` or `Cone` can work well for an outward burst.
            *   `Radius` (for Sphere/Cone): Small, e.g., `0.1` to `0.5`.
            *   `Emit from`: `Volume` or `Edge` depending on desired look.
        *   **Particle Properties (Initial values for each particle)**:
            *   `Start Lifetime`: `0.3` to `0.7` seconds (how long each particle lives).
            *   `Start Speed`: `1` to `5` (initial speed of particles).
            *   `Start Size`: `0.05` to `0.2` (initial size of particles). Can also use "Random Between Two Constants" for size variation.
            *   `Start Rotation`: Can be random if using non-circular textures.
            *   `Start Color`: Bright yellow, gold, or white. Use "Random Between Two Colors" for variation (e.g., between a bright yellow and a pale gold, or white and light yellow).
        *   **Renderer Module**:
            *   `RenderMode`: `Billboard` (particles always face the camera).
            *   `Material`:
                *   Assign a suitable particle material. You might need to create one.
                *   The material should use a texture. For sparkles, a small dot, star, or a "plus" shape texture works well. If you don't have one, a default white square particle texture can be used, but custom shapes enhance the effect. Ensure the texture has some transparency.
        *   **Optional Modules for Enhancement**:
            *   `Color over Lifetime`: Fade out the alpha (transparency) of particles towards the end of their life. (e.g., Alpha gradient from 100% to 0%).
            *   `Size over Lifetime`: Optionally shrink particles over their lifetime.
            *   `Limit Velocity over Lifetime` or `Damping`: Can help control particle spread.
            *   `Gravity Modifier`: `0` (no gravity) or a very small negative value if you want them to float up slightly.

3.  **Save as Prefab**:
    *   After configuring the particle system asset, drag it from the `Assets` panel into your scene to preview it.
    *   Once satisfied, drag the `CoinSparkleEffect` node from the `Hierarchy` panel back into the `Assets` panel (e.g., into `assets/Prefabs/`). This creates a prefab.
    *   Name the prefab `CoinSparkleEffect.prefab`. You can delete the instance from the scene.

## 2. Modifying `ScoringZone.ts` to Trigger the Effect

1.  **Open `ScoringZone.ts`**:
    *   Navigate to `assets/Scripts/Components/ScoringZone.ts` and open it in your code editor.

2.  **Add Prefab Property**:
    *   Add a new `@property` to the `ScoringZone` class to hold a reference to the particle effect prefab:

    ```typescript
    import { _decorator, Component, Collider, ITriggerEvent, Node, Prefab, instantiate, director } from 'cc'; // Added Prefab, instantiate, director
    import { Coin } from './Coin';
    import { ScoreManager } from '../Managers/ScoreManager';

    const { ccclass, property } = _decorator;

    @ccclass('ScoringZone')
    export class ScoringZone extends Component {
        @property({ tooltip: "Points awarded when a coin enters this zone." })
        pointsToAward: number = 10;

        @property({  // <<< ADD THIS SECTION
            type: Prefab,
            tooltip: "Particle effect to play when a coin scores."
        })
        coinFallEffectPrefab: Prefab | null = null; // <<< ADD THIS LINE

        private _collider: Collider | null = null;

        // ... (onLoad method remains the same) ...
    ```

3.  **Instantiate Effect in `onTriggerEnterListener`**:
    *   Modify the `onTriggerEnterListener` method. After confirming a coin has entered and before destroying the coin, instantiate and position the particle effect.

    ```typescript
        onTriggerEnterListener(event: ITriggerEvent) {
            const otherNode = event.otherCollider.node;
            if (!otherNode || !otherNode.isValid) {
                return;
            }

            const coinComponent = otherNode.getComponent(Coin);

            if (coinComponent) {
                if (ScoreManager.instance) {
                    ScoreManager.instance.addScore(this.pointsToAward);
                } else {
                    console.error(`ScoringZone '${this.node.name}': ScoreManager instance not found! Cannot award points.`);
                }

                // --- BEGIN PARTICLE EFFECT INSTANTIATION ---
                if (this.coinFallEffectPrefab && event.otherCollider) {
                    try {
                        const effectNode = instantiate(this.coinFallEffectPrefab);
                        // Parent it to the scene root or a dedicated container for effects
                        director.getScene()?.addChild(effectNode);

                        // Position the effect where the coin was
                        effectNode.setWorldPosition(otherNode.worldPosition);

                        // The particle system should play automatically if 'Play On Awake' is true in its settings.
                        // If not, you might need to get the component and call play():
                        // const particleSys = effectNode.getComponent(ParticleSystemComponent); // Or ParticleSystem
                        // if (particleSys) {
                        //     particleSys.play();
                        // }

                        // Optional: Automatically destroy the particle effect node after some time
                        // This time should be longer than the particle system's duration + lifetime of particles
                        setTimeout(() => {
                            if (effectNode && effectNode.isValid) {
                                effectNode.destroy();
                            }
                        }, 2000); // Adjust time (2 seconds in this example)
                    } catch (e) {
                        console.error("Error instantiating particle effect:", e);
                    }
                }
                // --- END PARTICLE EFFECT INSTANTIATION ---

                otherNode.destroy();
                // console.log(`Coin '${otherNode.name}' entered scoring zone '${this.node.name}', awarded ${this.pointsToAward} points. Coin destroyed.`);
            }
        }
    // ... (onDestroy method remains the same) ...
    }
    ```
    *Note: Added `Prefab`, `instantiate`, `director` to the `cc` import.*

## 3. Assign Prefab in Editor

1.  **Select Scoring Zones**:
    *   In the Cocos Creator editor, select each Node in your scene that has the `ScoringZone.ts` script attached.

2.  **Assign Prefab**:
    *   In the `Inspector` panel, find the `Scoring Zone` component.
    *   You will see a new property slot named `Coin Fall Effect Prefab`.
    *   Drag the `CoinSparkleEffect.prefab` from the `Assets` panel (e.g., from `assets/Prefabs/`) into this slot.

Now, when a coin enters a scoring zone, the assigned particle effect should play at the coin's position just before the coin is destroyed. Remember to test and adjust particle properties and effect duration for the best visual result.
