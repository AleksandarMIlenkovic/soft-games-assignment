import { Text, Container } from "pixi.js";

/**
 * FPSCounter - Displays the current FPS in the top-left corner
 * Positioned as a UI overlay, not affected by scene scaling
 */
export class FPSCounter extends Container {
  private fpsText: Text;
  private lastUpdate: number = 0;
  private updateInterval: number = 500; // Update every 500ms

  constructor() {
    super();

    // Create FPS text
    this.fpsText = new Text({
      text: "FPS: 60",
      style: {
        fontFamily: "Arial",
        fontSize: 16,
        fill: 0x00ff00,
        fontWeight: "bold",
      },
    });

    // Position in top-left corner
    this.fpsText.position.set(10, 10);

    // Add to container
    this.addChild(this.fpsText);
  }

  /**
   * Update the FPS display
   * @param fps Current FPS value
   */
  public update(fps: number): void {
    const now = Date.now();

    // Only update text periodically to avoid flickering
    if (now - this.lastUpdate > this.updateInterval) {
      this.fpsText.text = `FPS: ${Math.round(fps)}`;
      this.lastUpdate = now;

      // Change color based on FPS
      if (fps >= 55) {
        this.fpsText.style.fill = 0x00ff00; // Green
      } else if (fps >= 30) {
        this.fpsText.style.fill = 0xffff00; // Yellow
      } else {
        this.fpsText.style.fill = 0xff0000; // Red
      }
    }
  }
}
