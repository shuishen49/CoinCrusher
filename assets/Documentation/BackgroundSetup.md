# Background Setup Guide (Neon Style)

This guide describes methods to achieve a "霓虹灯风格边框 + 暗色背景" (Neon light style border + dark background) for the Coin Dozer game, as inspired by the aesthetic in `https://i.imgur.com/coin_demo.jpg`.

## Method 1: Using UI Elements (Recommended for 2D/Canvas Background)

This method is generally simpler for UI-centric games or when a flat background is desired.

1.  **Dark Background Sprite**:
    *   Ensure you have a `Canvas` node in your scene.
    *   As a child of the `Canvas`, create a `Sprite` node: Right-click `Canvas -> UI -> Sprite`.
    *   Name it `BackgroundSprite`.
    *   **Order**: Make sure this `BackgroundSprite` is the first child of the `Canvas` or has the lowest `priority` / `Z-index` (if applicable in your Cocos Creator version's UI system) so it renders behind all other UI elements.
    *   **Size**: Configure its `UITransform` component to be full screen:
        *   Set Anchors (Min X, Min Y, Max X, Max Y) to `(0, 0, 1, 1)`.
        *   Set Left, Right, Top, Bottom offsets to `0`.
    *   **Appearance**:
        *   In the `Sprite` component, set its `Color` to a dark grey or black (e.g., R:30, G:30, B:30, A:255).
        *   You can leave `SpriteFrame` empty if using a solid color, or assign a subtle dark texture.

2.  **Neon Border Sprites**:
    *   Create several thin `Sprite` nodes as children of the `Canvas` (or a dedicated "BorderContainer" node under Canvas).
    *   **Appearance**:
        *   Set their `Color` to bright neon colors (e.g., magenta: #FF00FF, cyan: #00FFFF, lime green: #32CD32).
        *   For `SpriteFrame`, you can use a simple white square texture (often a default asset) and tint it with the neon color. Alternatively, if you have specific neon line/glow textures, use those.
    *   **Arrangement**:
        *   **Top Border**: Scale and position one sprite to be a thin horizontal line at the top edge of the screen.
        *   **Bottom Border**: Another for the bottom edge.
        *   **Left Border**: Another for the left edge (thin vertical line).
        *   **Right Border**: Another for the right edge.
    *   **Example Sprite Dimensions for a Border**:
        *   Horizontal border: Height = 5-10 pixels, Width = Screen Width.
        *   Vertical border: Width = 5-10 pixels, Height = Screen Height.
    *   **9-Sliced Sprites**: If you have a flexible neon border texture (one that can stretch nicely at the center and keep corners intact), set the `Sprite` component's `Type` to `SLICED`. Configure the `insetLeft`, `insetRight`, `insetTop`, `insetBottom` properties in the SpriteFrame editor to define the non-scalable parts of your texture. Then, you can resize the Sprite to fit the screen edges, and it will scale correctly.

3.  **Enhancing Neon Glow (Post-Processing)**:
    *   To make the bright neon colors truly "glow", a Bloom post-processing effect is highly recommended.
    *   In Cocos Creator, find the post-processing settings, usually associated with the main `Camera` component or in `Project -> Project Settings -> PostProcessing` (path may vary by version).
    *   Enable `Bloom`.
    *   Adjust `Threshold` (determines how bright a pixel needs to be to bloom), `Intensity` (strength of the bloom), and `Radius` (spread of the bloom) to achieve the desired neon glow effect on your border sprites.

## Method 2: Using 3D Elements (If a 3D Background is Preferred)

This method is suitable if your game has a more 3D perspective or if you want depth in your background.

1.  **Large 3D Quad/Plane**:
    *   Create a 3D Quad or Plane: In the `Hierarchy`, right-click `-> Create 3D Object -> Quad` or `Plane`.
    *   Scale it to be very large, ensuring it fills the camera's view from a distance.
    *   Position it far behind your main game elements (e.g., adjust its Z position).
    *   Create a new `Material` for this object.
        *   In the `Assets` panel, right-click `-> Create -> Material`. Name it `DarkBackgroundMaterial`.
        *   Select the material. If you don't want it affected by scene lighting, try to find an `Unlit` shader option (e.g., `builtin-unlit` or a custom unlit shader).
        *   Set its `Albedo Color` (or main color property) to dark grey/black.
        *   Assign this material to the Quad/Plane.

2.  **Neon Border in 3D**:
    *   **Textured Quad**: The simplest way is to create a texture that includes both the dark background and the neon border design. Apply this texture to the `DarkBackgroundMaterial`'s Albedo/Main Texture slot.
    *   **Emissive 3D Objects**:
        *   Create thin 3D Cubes or Planes.
        *   Position and scale them to form a border at the edges of your camera's far view.
        *   Create a new `Material` for these border objects (e.g., `NeonBorderMaterial`).
        *   Set its `Emissive` color (or `Emission` property) to a bright neon color. If using a PBR shader, you might set Albedo to a neon color and increase Emission intensity.
        *   Assign this material to the border objects.
        *   A Bloom post-processing effect (as described in Method 1) will significantly enhance these emissive borders.

3.  **Skybox**:
    *   This is an advanced option but provides a complete surrounding environment.
    *   Create a Skybox material: In `Assets`, right-click `-> Create -> Material`. In the material's inspector, select a Skybox shader.
    *   You'll need a Cubemap texture. This texture should depict a dark scene with your desired neon elements already baked into it. Creating custom cubemaps can be complex.
    *   Assign this Skybox material to your main Camera's `Skybox` property (in the `Camera` component).

## Reference Image

For the target aesthetic, refer to: `https://i.imgur.com/coin_demo.jpg`. Note the dark, slightly textured background and the distinct, bright neon outlines.

Choose the method that best fits your project's 2D/3D nature and your available assets. For most UI-heavy or 2.5D games, **Method 1 (UI Elements)** is often the most straightforward and performant for achieving this style. Remember to enable Bloom for the best neon effect.
