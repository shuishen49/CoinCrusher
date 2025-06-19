import { _decorator, Component, Node, Vec3, Quat, math } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Platform')
export class Platform extends Component {
    @property({ tooltip: "Maximum swing angle in degrees around Y-axis" })
    swingAngle: number = 5;

    @property({ tooltip: "Speed of the swing cycle" })
    swingSpeed: number = 1;

    private _initialRotation: Quat = new Quat();
    private _time: number = 0;

    onLoad() {
        // Store the initial rotation of the platform
        this.node.getRotation(this._initialRotation);
        // console.log('Platform onLoad: Initial rotation stored.');
    }

    update(deltaTime: number) {
        this._time += deltaTime * this.swingSpeed;

        // Calculate the current swing rotation around Y-axis
        // math.toRadian is used because Quat.fromEuler expects radians
        const angleInRadians = math.toRadian(Math.sin(this._time) * this.swingAngle);

        const swingRotation = new Quat();
        // Quat.fromEuler creates a quaternion from Euler angles (pitch, yaw, roll) - Y is yaw.
        Quat.fromEuler(swingRotation, 0, math.toDegree(angleInRadians), 0); // Note: fromEuler in some versions might expect degrees. CC 3.x uses degrees.
                                                                      // Let's stick to degrees for fromEuler as it's more common in editor.
                                                                      // So, the direct angle `Math.sin(this._time) * this.swingAngle` can be used.

        const currentAngleDegrees = Math.sin(this._time) * this.swingAngle;
        Quat.fromEuler(swingRotation, 0, currentAngleDegrees, 0);


        // Combine the swing rotation with the initial rotation.
        // This ensures that any initial orientation (like a tilt) is preserved and the swing is applied on top of that.
        const finalRotation = new Quat();
        Quat.multiply(finalRotation, this._initialRotation, swingRotation);

        this.node.setRotation(finalRotation);
    }
}
