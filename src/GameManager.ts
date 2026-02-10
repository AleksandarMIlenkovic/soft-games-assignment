import { Application, Container } from "pixi.js";
import { BaseScene } from "./scenes/BaseScene";
import { FPSCounter } from "./FPSCounter";

export class GameManager {
  public app: Application;
  public currentScene: BaseScene | null = null;
  public sceneContainer: Container;
  public fpsCounter: FPSCounter;

  private resizeTimeout: number | null = null;
  private readonly RESIZE_DEBOUNCE_MS = 100;
  private boundHandleResize: () => void;

  constructor() {
    this.app = new Application();
    this.sceneContainer = new Container();
    this.fpsCounter = new FPSCounter();
    this.boundHandleResize = this.handleResize.bind(this);
  }

  public async init(): Promise<void> {
    await this.app.init({
      background: "#1a1a2e",
      resizeTo: window,
      autoDensity: true,
      resolution: window.devicePixelRatio || 1,
      antialias: true,
      hello: true,
    });

    const container = document.getElementById("pixi-container");
    if (container) {
      container.appendChild(this.app.canvas);
    }

    this.app.stage.addChild(this.sceneContainer);
    this.app.stage.addChild(this.fpsCounter);

    window.addEventListener("resize", this.boundHandleResize, {
      passive: true,
    });

    window.addEventListener("orientationchange", this.boundHandleResize, {
      passive: true,
    });

    this.app.ticker.add(this.update.bind(this));

    console.log("[GameManager] Application initialized");
  }

  public changeScene(sceneClass: new (gm: GameManager) => BaseScene): void {
    if (this.currentScene) {
      this.currentScene.onExit();
      this.sceneContainer.removeChild(this.currentScene);
      this.currentScene = null;
    }

    const newScene = new sceneClass(this);
    this.currentScene = newScene;
    this.sceneContainer.addChild(newScene);
    newScene.onEnter();

    console.log(`[GameManager] Changed to scene: ${sceneClass.name}`);
  }

  private update(time: { deltaMS: number }): void {
    this.fpsCounter.update(this.app.ticker.FPS);

    if (this.currentScene) {
      this.currentScene.update(time.deltaMS);
    }
  }

  private handleResize(): void {
    if (this.resizeTimeout !== null) {
      clearTimeout(this.resizeTimeout);
    }

    this.resizeTimeout = window.setTimeout(() => {
      console.log("resize:", {
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio,
      });

      if (this.currentScene) {
        this.currentScene.updateDimensions();
      }

      this.resizeTimeout = null;
    }, this.RESIZE_DEBOUNCE_MS);
  }

  public getScreenDimensions(): { width: number; height: number } {
    return {
      width: this.app.screen.width,
      height: this.app.screen.height,
    };
  }

  public getDevicePixelRatio(): number {
    return window.devicePixelRatio || 1;
  }

  public destroy(): void {
    if (this.currentScene) {
      this.currentScene.onExit();
    }

    if (this.resizeTimeout !== null) {
      clearTimeout(this.resizeTimeout);
    }

    window.removeEventListener("resize", this.boundHandleResize);
    window.removeEventListener("orientationchange", this.boundHandleResize);

    console.log("[GameManager] Destroyed");
  }
}
