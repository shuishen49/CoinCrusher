import { _decorator, Component, Node, Prefab, instantiate, Vec3, RigidBody, input, Input, EventTouch, math, lerp, director, Canvas, find, Sprite, ProgressBar, Quat } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CoinLauncher')
export class CoinLauncher extends Component {
    @property(Prefab)
    coinPrefab: Prefab | null = null;

    @property(Node)
    launchPositionNode: Node | null = null; // Assign an empty node for launch position & initial orientation

    @property(Node)
    powerBar: Node | null = null; // Assign a UI Sprite or ProgressBar

    @property
    minLaunchForce: number = 5;

    @property
    maxLaunchForce: number = 20;

    @property({ tooltip: "Time in seconds to reach max force" })
    chargeTime: number = 1.5;

    @property({ tooltip: "Angle in degrees for the upward launch, relative to launchPositionNode's forward direction on its XZ plane" })
    launchAngleY: number = 30; // Vertical angle

    @property({ tooltip: "Horizontal launch angle offset in degrees, relative to launchPositionNode's forward. 0 is straight."})
    launchAngleXOffset: number = 0;

    private _isCharging: boolean = false;
    private _currentCharge: number = 0; // 0 to 1

    onLoad() {
        if (!this.coinPrefab) console.warn("CoinLauncher: Coin Prefab not assigned!");
        if (!this.launchPositionNode) console.warn("CoinLauncher: Launch Position Node not assigned!");

        this.updatePowerBarVisual(0); // Initialize power bar

        // Use a full-screen node for input detection. Often the Canvas itself.
        // Ensure your Canvas node is named 'Canvas' or adjust.
        const inputNode = find('Canvas'); // Default canvas name in Cocos Creator
        if (inputNode) {
            inputNode.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
            inputNode.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
            inputNode.on(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this); // Treat cancel like touch end
        } else {
            console.warn("CoinLauncher: Could not find default 'Canvas' node for input. Input will not work unless a different input node is used and events are manually registered.");
        }
    }

    update(deltaTime: number) {
        if (this._isCharging) {
            this._currentCharge += deltaTime / this.chargeTime;
            this._currentCharge = math.clamp01(this._currentCharge);
            this.updatePowerBarVisual(this._currentCharge);
        }
    }

    onTouchStart(event: EventTouch) {
        // Optional: Check if touch is over a specific UI element to prevent launching
        // if (event.target && event.target.name === "SomeUIButtonToIgnore") return;
        this._isCharging = true;
        this._currentCharge = 0; // Reset charge on new touch
        this.updatePowerBarVisual(this._currentCharge);
    }

    onTouchEnd(event: EventTouch) {
        if (this._isCharging) {
            this.launchCoin();
            this._isCharging = false;
            // Keep _currentCharge at the value it was upon launch for a moment if needed,
            // or reset immediately. Resetting here:
            this._currentCharge = 0;
            this.updatePowerBarVisual(this._currentCharge);
        }
    }

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
        // It's good practice to add the coin to a specific container in your scene
        // For now, adding to the scene root.
        director.getScene()?.addChild(coinNode);

        coinNode.setWorldPosition(this.launchPositionNode.worldPosition);
        // Optionally, match coin's initial orientation to the launcher node if desired
        // coinNode.setWorldRotation(this.launchPositionNode.worldRotation);


        const launchForceValue = lerp(this.minLaunchForce, this.maxLaunchForce, this._currentCharge);

        // Determine launch direction based on launchPositionNode's orientation and launch angles
        let baseForward = new Vec3();
        this.launchPositionNode.getForward(baseForward); // This is the node's local -Z direction

        // Quaternion for vertical angle (around node's local X-axis)
        let verticalRotationQuat = new Quat();
        Quat.fromAxisAngle(verticalRotationQuat, Vec3.RIGHT, math.toRadian(-this.launchAngleY));
        // Negative angle because positive rotation around X would tilt it downwards if Z is forward.
        // We want to tilt upwards.

        // Quaternion for horizontal angle offset (around node's local Y-axis)
        let horizontalRotationQuat = new Quat();
        Quat.fromAxisAngle(horizontalRotationQuat, Vec3.UP, math.toRadian(this.launchAngleXOffset));

        // Combine rotations: apply horizontal offset first, then vertical tilt
        let combinedRotationQuat = new Quat();
        Quat.multiply(combinedRotationQuat, horizontalRotationQuat, verticalRotationQuat);

        // Transform the base forward vector by this combined rotation
        let launchDirection = Vec3.transformQuat(new Vec3(), baseForward, combinedRotationQuat);
        launchDirection.normalize(); // Ensure it's a unit vector

        const rigidBody = coinNode.getComponent(RigidBody);
        if (rigidBody) {
            rigidBody.applyImpulse(launchDirection.multiplyScalar(launchForceValue));
        } else {
            console.warn("Launched coin prefab does not have a RigidBody component.");
        }
    }

    updatePowerBarVisual(chargePercentage: number) {
        if (this.powerBar) {
            const progressBarComponent = this.powerBar.getComponent(ProgressBar);
            if (progressBarComponent) {
                progressBarComponent.progress = chargePercentage;
                return;
            }

            const spriteComponent = this.powerBar.getComponent(Sprite);
            if (spriteComponent && spriteComponent.type === Sprite.Type.FILLED) {
                spriteComponent.fillRange = chargePercentage;
                return;
            }

            // Fallback to scaling if neither ProgressBar nor filled Sprite is found
            // Assumes the bar's anchor is on the left for horizontal scaling.
            // this.powerBar.scale = new Vec3(chargePercentage, this.powerBar.scale.y, this.powerBar.scale.z);
            // console.log("CoinLauncher: Power bar updated via scale (ensure anchor is appropriate).");
        }
    }

    onDestroy() {
        const inputNode = find('Canvas');
        if (inputNode) {
            inputNode.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
            inputNode.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
            inputNode.off(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        }
    }
}
