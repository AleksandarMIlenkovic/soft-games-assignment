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
  private boundHandleFullScreenChange: () => void;

  constructor() {
    this.app = new Application();
    this.sceneContainer = new Container();
    this.fpsCounter = new FPSCounter();
    this.boundHandleResize = this.handleResize.bind(this);
    this.boundHandleFullScreenChange = this.handleFullScreenChange.bind(this);
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

    // Add full screen change event listeners
    document.addEventListener(
      "fullscreenchange",
      this.boundHandleFullScreenChange,
    );
    document.addEventListener(
      "webkitfullscreenchange",
      this.boundHandleFullScreenChange,
    );
    document.addEventListener(
      "mozfullscreenchange",
      this.boundHandleFullScreenChange,
    );
    document.addEventListener(
      "MSFullscreenChange",
      this.boundHandleFullScreenChange,
    );

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

  /**
   * Check if full screen is currently active
   */
  public isFullScreen(): boolean {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const doc = document as any;
    return !!(
      document.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullScreenElement ||
      doc.msFullscreenElement
    );
  }

  /**
   * Toggle full screen mode
   */
  public toggleFullScreen(): void {
    if (this.isFullScreen()) {
      this.exitFullScreen();
    } else {
      this.enterFullScreen();
    }
  }

  /**
   * Enter full screen mode
   */
  private enterFullScreen(): void {
    const element = document.documentElement;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const el = element as any;
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen();
    } else if (el.mozRequestFullScreen) {
      el.mozRequestFullScreen();
    } else if (el.msRequestFullscreen) {
      el.msRequestFullscreen();
    }
  }

  /**
   * Exit full screen mode
   */
  private exitFullScreen(): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const doc = document as any;
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (doc.webkitExitFullscreen) {
      doc.webkitExitFullscreen();
    } else if (doc.mozCancelFullScreen) {
      doc.mozCancelFullScreen();
    } else if (doc.msExitFullscreen) {
      doc.msExitFullscreen();
    }
  }

  /**
   * Handle full screen change events
   */
  private handleFullScreenChange(): void {
    console.log("[GameManager] Full screen changed:", this.isFullScreen());
    // Trigger a resize to update dimensions when entering/exiting full screen
    this.handleResize();
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

    // Remove full screen change event listeners
    document.removeEventListener(
      "fullscreenchange",
      this.boundHandleFullScreenChange,
    );
    document.removeEventListener(
      "webkitfullscreenchange",
      this.boundHandleFullScreenChange,
    );
    document.removeEventListener(
      "mozfullscreenchange",
      this.boundHandleFullScreenChange,
    );
    document.removeEventListener(
      "MSFullscreenChange",
      this.boundHandleFullScreenChange,
    );

    console.log("[GameManager] Destroyed");
  }
}
