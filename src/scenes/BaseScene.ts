import { Container, Graphics } from "pixi.js";
import { GameManager } from "../GameManager";
import { DESIGN_WIDTH, DESIGN_HEIGHT } from "../../constants";

export enum ScaleMode {
  FIT = "fit",
  FILL = "fill",
  STRETCH = "stretch",
  FIT_WIDTH = "fit_width",
  FIT_HEIGHT = "fit_height",
}

export abstract class BaseScene extends Container {
  static requiredAssets: { alias: string; src: string }[] = [];
  public gm: GameManager;
  public layoutBounds: Graphics; // Public for easy access by child elements if needed
  public readonly DESIGN_WIDTH = DESIGN_WIDTH;
  public readonly DESIGN_HEIGHT = DESIGN_HEIGHT;
  protected scaleMode: ScaleMode = ScaleMode.FIT;

  constructor(gm: GameManager) {
    super();
    this.gm = gm;
    this.eventMode = "static";

    this.layoutBounds = new Graphics();
    this.addChild(this.layoutBounds);
    this.layoutBounds.eventMode = "none";

    const strokeWidth = 5;
    this.layoutBounds.clear();
    this.layoutBounds.rect(
      strokeWidth / 2,
      strokeWidth / 2,
      DESIGN_WIDTH - strokeWidth,
      DESIGN_HEIGHT - strokeWidth,
    );
    this.layoutBounds.fill({ color: 0xffffff }); // Fill the shape for the mask to work
    this.layoutBounds.stroke({ width: strokeWidth, color: 0xff0000, alpha: 0 });
    this.mask = this.layoutBounds;
  }

  public setScaleMode(mode: ScaleMode): void {
    this.scaleMode = mode;
    this.updateDimensions();
  }

  public getScaleMode(): ScaleMode {
    return this.scaleMode;
  }

  public updateDimensions(): void {
    const screenWidth = this.gm.app.screen.width;
    const screenHeight = this.gm.app.screen.height;

    const scaleX = screenWidth / DESIGN_WIDTH;
    const scaleY = screenHeight / DESIGN_HEIGHT;

    let finalScaleX: number;
    let finalScaleY: number;
    let finalX: number;
    let finalY: number;

    switch (this.scaleMode) {
      case ScaleMode.FIT: {
        const fitScale = Math.min(scaleX, scaleY);
        finalScaleX = fitScale;
        finalScaleY = fitScale;
        finalX = screenWidth / 2;
        finalY = screenHeight / 2;
        break;
      }

      case ScaleMode.FILL: {
        const fillScale = Math.max(scaleX, scaleY);
        finalScaleX = fillScale;
        finalScaleY = fillScale;
        finalX = screenWidth / 2;
        finalY = screenHeight / 2;
        break;
      }

      case ScaleMode.STRETCH:
        finalScaleX = scaleX;
        finalScaleY = scaleY;
        finalX = screenWidth / 2;
        finalY = screenHeight / 2;
        break;

      case ScaleMode.FIT_WIDTH:
        finalScaleX = scaleX;
        finalScaleY = scaleX;
        finalX = screenWidth / 2;
        finalY = screenHeight / 2;
        break;

      case ScaleMode.FIT_HEIGHT:
        finalScaleX = scaleY;
        finalScaleY = scaleY;
        finalX = screenWidth / 2;
        finalY = screenHeight / 2;
        break;

      default: {
        // Default to FIT mode
        const defaultScale = Math.min(scaleX, scaleY);
        finalScaleX = defaultScale;
        finalScaleY = defaultScale;
        finalX = screenWidth / 2;
        finalY = screenHeight / 2;
        break;
      }
    }

    this.pivot.set(DESIGN_WIDTH / 2, DESIGN_HEIGHT / 2);
    this.scale.set(finalScaleX, finalScaleY);
    this.position.set(finalX, finalY);
  }

  public onEnter(): void {
    this.updateDimensions();
  }

  public onExit(): void {
    this.destroy({ children: true, texture: true, textureSource: true });
  }

  /**
   * Optional update method to be called by the game loop.
   * @param _delta The time elapsed since the last frame (from PIXI.Ticker.deltaMS or similar).
   */
  public update(_delta: number): void {
    // This method can be overridden by subclasses
  }
}
