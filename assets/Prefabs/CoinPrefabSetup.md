# Coin Prefab Creation Steps (Cocos Creator)

This document outlines the manual steps to create a `CoinPrefab` in the Cocos Creator editor.

1.  **Create an Empty Node for the Prefab Root**:
    *   In the `Hierarchy` panel, right-click and select `Create Empty Node`.
    *   Rename this node to `CoinPrefab`. This will be the root of our prefab.

2.  **Add 3D Sphere Model**:
    *   Right-click on the `CoinPrefab` node in the `Hierarchy` panel.
    *   Select `Create > 3D Object > Sphere`. This will create a sphere as a child of `CoinPrefab`.
    *   Select the newly created `Sphere` node.
    *   In the `Inspector` panel, adjust its `Scale` if necessary. A common coin-like appearance might be `(X: 0.5, Y: 0.5, Z: 0.5)` if you want a 0.5 unit radius, or you could make it flatter e.g. `(X: 0.5, Y: 0.1, Z: 0.5)` if using a cylinder (though here we specified sphere). For a sphere, `(X: 0.5, Y: 0.5, Z: 0.5)` implies a diameter of 0.5. Let's assume a radius of 0.5 for now, so the default scale of `(1,1,1)` for a standard sphere primitive with radius 0.5 is fine. If the default sphere primitive is 1 unit radius, scale to `(X: 0.5, Y: 0.5, Z: 0.5)`. *Adjust based on the default primitive size in your Cocos Creator version.*

3.  **Attach `Coin.ts` Script**:
    *   Select the root `CoinPrefab` node in the `Hierarchy`.
    *   In the `Inspector` panel, click the `Add Component` button.
    *   Search for `Coin` (the script we created) and select it.
    *   The `Coin.ts` script (from `assets/Scripts/Components/Coin.ts`) is now attached. You should see its `Value` property in the Inspector.

4.  **Add `RigidBody` Component**:
    *   Select the root `CoinPrefab` node.
    *   In the `Inspector` panel, click `Add Component`.
    *   Search for and add `RigidBody`. (Ensure it's the 3D version, usually just `RigidBody`).
    *   Configure its properties in the `Inspector`:
        *   `Group`: Set an appropriate collision group if you have defined them (e.g., "Coin"). Default is fine for now.
        *   `Mass`: Set to a small value suitable for a coin, e.g., `0.1`.
        *   `Linear Damping`: Set to `0.2` (helps simulate air resistance).
        *   `Angular Damping`: Set to `0.2` (helps prevent endless spinning).
        *   `Use Gravity`: Ensure this is **checked** (enabled).

5.  **Add `SphereCollider` Component**:
    *   Select the root `CoinPrefab` node.
    *   In the `Inspector` panel, click `Add Component`.
    *   Search for and add `SphereCollider`. (Ensure it's the 3D version).
    *   Configure its properties in the `Inspector`:
        *   `Material` (Physics Material): Leave as `None` for now, or assign a physics material if you have one for bounce/friction.
        *   `IsTrigger`: Ensure this is **unchecked** (disabled) so it collides physically.
        *   `Center`: Keep at `(X:0, Y:0, Z:0)` (relative to the `CoinPrefab` root).
        *   `Radius`: Adjust this to match the visual radius of your `Sphere` model. If the Sphere model has a scale of `(0.5, 0.5, 0.5)` and its inherent radius is 0.5, then the collider radius should be `0.25`. If the sphere model has a radius of 0.5 units (e.g. default sphere scaled to 0.5), then the collider radius should be `0.5`. **Crucially, this must match the visual mesh.**

6.  **Create and Assign Material**:
    *   In the `Assets` panel, navigate to `assets/Materials/`.
    *   Right-click in the `Materials` folder and select `Create > Material`.
    *   Name the new material `MetallicCoinMaterial`.
    *   Select `MetallicCoinMaterial`. In the `Inspector`, adjust its properties:
        *   Find the shader dropdown, ensure a standard PBR shader is selected (e.g., `builtin-standard` or `surfacing`).
        *   `Metallic`: Set to a high value, e.g., `0.8` to `1.0`.
        *   `Roughness`: Set to a low to medium value, e.g., `0.2` to `0.4`.
        *   `Albedo`: Choose a yellowish/gold color for the coin.
    *   Select the `Sphere` child node under `CoinPrefab` in the `Hierarchy`.
    *   In the `Inspector`, find the `MeshRenderer` component.
    *   Expand the `Materials` array.
    *   Drag `MetallicCoinMaterial` from the `Assets` panel to the `Material` slot (usually `Element 0`) in the `MeshRenderer`.

7.  **Save as Prefab**:
    *   Once the `CoinPrefab` node is configured with the model, script, RigidBody, Collider, and material, drag the `CoinPrefab` node from the `Hierarchy` panel into the `assets/Prefabs/` directory in the `Assets` panel.
    *   This will create a prefab file named `CoinPrefab.prefab`. The node in the Hierarchy should turn blue, indicating it's an instance of a prefab.
    *   You can now delete the `CoinPrefab` instance from the Hierarchy if you wish, as the prefab is saved in your assets.

This setup provides a basic, physically simulated coin. Further adjustments to physics properties, material, and script logic can be made by editing the prefab or its components.
