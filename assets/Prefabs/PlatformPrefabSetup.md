# Platform Prefab Creation Steps (Cocos Creator)

This document outlines the manual steps to create a `PlatformPrefab` in the Cocos Creator editor, including its swinging behavior and boundary colliders.

1.  **Create an Empty Node for the Prefab Root**:
    *   In the `Hierarchy` panel, right-click and select `Create Empty Node`.
    *   Rename this node to `PlatformPrefab`. This will be the root of our prefab and will have the `Platform.ts` script attached.

2.  **Add 3D Cube Model for the Platform Surface**:
    *   Right-click on the `PlatformPrefab` node in the `Hierarchy` panel.
    *   Select `Create > 3D Object > Cube`. This will create a cube as a child of `PlatformPrefab`.
    *   Rename this `Cube` to `PlatformSurface`.
    *   Select the `PlatformSurface` node.
    *   In the `Inspector` panel, adjust its `Scale` to form the main platform area (e.g., `X: 5, Y: 0.2, Z: 4`).
    *   **Initial Tilt**: To encourage coins to slide, you can give the `PlatformSurface` a slight initial rotation. For instance, set its `Rotation` to `(X: -5, Y: 0, Z: 0)`. This tilts it downwards along its local X-axis. The script-driven swing will be applied to the parent `PlatformPrefab` node's Y-axis.

3.  **Attach `Platform.ts` Script**:
    *   Select the root `PlatformPrefab` node in the `Hierarchy`.
    *   In the `Inspector` panel, click the `Add Component` button.
    *   Search for `Platform` (the script we created) and select it.
    *   The `Platform.ts` script is now attached. You can adjust `Swing Angle` and `Swing Speed` properties in the Inspector.

4.  **Add `RigidBody` Component to Root**:
    *   Select the root `PlatformPrefab` node.
    *   In the `Inspector` panel, click `Add Component`.
    *   Search for and add `RigidBody` (3D version).
    *   Configure its properties:
        *   `Type`: Set to `KINEMATIC`. This is crucial. Kinematic rigid bodies are not affected by forces or gravity but can affect other (dynamic) rigid bodies. Their motion is controlled by script/animation.
        *   `Group`: Set an appropriate collision group (e.g., "Platform" or "Environment").

5.  **Add `BoxCollider` Component for the Platform Surface**:
    *   Select the `PlatformSurface` child node.
    *   In the `Inspector` panel, click `Add Component`.
    *   Search for and add `BoxCollider` (3D version).
    *   Configure its properties:
        *   `Material` (Physics Material): Assign if you have a specific physics material for friction/bounce.
        *   `IsTrigger`: Ensure this is **unchecked**.
        *   `Size`: This should automatically match the `Cube` primitive's initial size. If you scaled the `PlatformSurface` node itself (instead of using a primitive with a specific size), ensure the `BoxCollider`'s `Size` property is adjusted to accurately cover the visual mesh (e.g., `X: 5, Y: 0.2, Z: 4` if the node's scale is 1,1,1 but the mesh itself was scaled, or if these are the dimensions of the scaled node). Ideally, the node's scale is 1,1,1 and the collider size matches the mesh.

6.  **Create and Assign Material for Platform Surface**:
    *   In the `Assets` panel, navigate to `assets/Materials/`.
    *   Right-click and select `Create > Material`. Name it `WoodenPlatformMaterial`.
    *   Select `WoodenPlatformMaterial`. In the `Inspector`:
        *   Shader: Use a standard PBR shader (e.g., `builtin-standard`).
        *   `Albedo`: Choose a suitable brown color for wood.
        *   **Texture (Optional)**: If you have a wood texture (e.g., `wood_texture.png`) in `assets/Textures/`, you can assign it. Drag the texture from the `Assets` panel to the `Albedo Map` slot (or similar, e.g., `Diffuse Map`) of the material.
    *   Select the `PlatformSurface` node in the `Hierarchy`.
    *   In its `MeshRenderer` component, drag `WoodenPlatformMaterial` to the `Materials` array.

7.  **Add Boundary Colliders (Side Walls)**:
    *   These will prevent coins from easily falling off the edges. They will be children of `PlatformPrefab` so they swing along with it.
    *   **Example for one side wall (e.g., along positive Z edge)**:
        *   Right-click `PlatformPrefab` -> `Create Empty Node`. Rename it `Boundary_PositiveZ`.
        *   Select `Boundary_PositiveZ`.
        *   Add a `BoxCollider` component to it. Ensure `IsTrigger` is false.
        *   **Positioning and Scaling the Collider**:
            *   Assume `PlatformSurface` has size `(X: 5, Y: 0.2, Z: 4)`.
            *   `Position`: `(X: 0, Y: (0.2/2) + (wallHeight/2), Z: 4/2)`. For `wallHeight` of 0.5, this would be `(X:0, Y:0.35, Z:2)`. (Adjust Y based on desired wall height and platform thickness).
            *   `Size` (of the BoxCollider): `(X: 5, Y: 0.5, Z: 0.1)`. (Width of platform, height of wall, thickness of wall).
        *   Repeat for other boundaries (NegativeZ, PositiveX, NegativeX), adjusting position and collider size/orientation.
            *   `Boundary_NegativeZ`: Position `(X:0, Y:0.35, Z:-2)`, Size `(X:5, Y:0.5, Z:0.1)`
            *   `Boundary_PositiveX`: Position `(X:5/2, Y:0.35, Z:0)`, Size `(X:0.1, Y:0.5, Z:4)`
            *   `Boundary_NegativeX`: Position `(X:-5/2, Y:0.35, Z:0)`, Size `(X:0.1, Y:0.5, Z:4)`
    *   These boundary nodes do **not** need their own `RigidBody`. They will use the kinematic `RigidBody` of the parent `PlatformPrefab`.

8.  **Save as Prefab**:
    *   Drag the configured `PlatformPrefab` node from the `Hierarchy` panel into the `assets/Prefabs/` directory in the `Assets` panel.
    *   This creates `PlatformPrefab.prefab`. The node in the Hierarchy will turn blue.
    *   You can delete the instance from the Hierarchy.

This setup provides a basic swinging platform with boundaries. The script controls the swing, and the kinematic Rigidbody ensures it can push other physics objects like coins. The tilt on the `PlatformSurface` helps coins slide. Remember to adjust dimensions and properties to fit your game's specific design.
