import { Text, Graphics, Assets, Texture } from "pixi.js";
import { BaseScene } from "./BaseScene";
import { Particle } from "../components/Particle";
import { Button } from "../components/Button";
import { MenuScene } from "./MenuScene";
import { GameManager } from "../GameManager";
import { DESIGN_WIDTH, DESIGN_HEIGHT } from "../../constants";

export class PhoenixFlameScene extends BaseScene {
  private static readonly MAX_PARTICLES = 10;
  private static readonly SPAWN_INTERVAL = 5; // Spawn every 5 frames

  private title: Text;
  private backButton: Button;
  private fullScreenButton: Button;
  private particles: Particle[] = [];
  private particleTexture: Texture | null = null;
  private spawnCounter: number = 0;

  constructor(gm: GameManager) {
    super(gm);

    const background = new Graphics();
    background.rect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);
    background.fill({ color: 0x0a0a0a });
    this.addChildAt(background, 0);

    this.title = new Text({
      text: "Phoenix Flame",
      style: {
        fontFamily: "Arial",
        fontSize: 36,
        fill: 0xffffff,
        fontWeight: "bold",
      },
    });
    this.title.anchor.set(0.5);
    this.title.position.set(DESIGN_WIDTH / 2, 50);
    this.addChild(this.title);

    const subtitle = new Text({
      text: `Max ${PhoenixFlameScene.MAX_PARTICLES} particles - Fire effect`,
      style: {
        fontFamily: "Arial",
        fontSize: 18,
        fill: 0xaaaaaa,
      },
    });
    subtitle.anchor.set(0.5);
    subtitle.position.set(DESIGN_WIDTH / 2, 90);
    this.addChild(subtitle);

    this.backButton = new Button("Back to Menu", 150, 40);
    this.backButton.position.set(20, 20);
    this.backButton.on("pointerup", () => {
      this.gm.changeScene(MenuScene);
    });
    this.addChild(this.backButton);

    this.fullScreenButton = new Button("⛶", 50, 50);
    this.fullScreenButton.position.set(DESIGN_WIDTH - 70, 20);
    this.fullScreenButton.on("pointerup", () => {
      this.gm.toggleFullScreen();
    });
    this.addChild(this.fullScreenButton);

    const fireBase = new Graphics();
    fireBase.ellipse(DESIGN_WIDTH / 2, DESIGN_HEIGHT * 0.8, 100, 30);
    fireBase.fill({ color: 0x331100 });
    this.addChild(fireBase);
  }

  public async onEnter(): Promise<void> {
    super.onEnter();

    try {
      this.particleTexture = await Assets.load("/assets/bunny.png");
      console.log("[PhoenixFlameScene] Particle texture loaded");
    } catch (error) {
      console.error(
        "[PhoenixFlameScene] Failed to load particle texture:",
        error,
      );
    }

    this.initializeParticlePool();

    console.log("[PhoenixFlameScene] Scene entered");
  }

  private initializeParticlePool(): void {
    this.particles.forEach((p) => p.destroy());
    this.particles = [];

    for (let i = 0; i < PhoenixFlameScene.MAX_PARTICLES; i++) {
      if (this.particleTexture) {
        const particle = new Particle(this.particleTexture);
        particle.visible = false; // Hide initially
        this.addChild(particle);
        this.particles.push(particle);
      }
    }
  }

  public update(_delta: number): void {
    this.spawnCounter++;
    if (this.spawnCounter >= PhoenixFlameScene.SPAWN_INTERVAL) {
      this.spawnParticle();
      this.spawnCounter = 0;
    }

    this.particles.forEach((particle) => {
      if (particle.visible) {
        const alive = particle.update();
        if (!alive) {
          particle.visible = false;
        }
      }
    });
  }

  private spawnParticle(): void {
    const inactiveParticle = this.particles.find((p) => !p.visible);

    if (inactiveParticle) {
      const spawnX = DESIGN_WIDTH / 2 + (Math.random() - 0.5) * 100;
      const spawnY = DESIGN_HEIGHT * 0.8;

      inactiveParticle.initialize(spawnX, spawnY);
      inactiveParticle.visible = true;
    }
  }

  public onExit(): void {
    this.particles.forEach((p) => p.destroy());
    this.particles = [];
    this.particleTexture = null;
    this.spawnCounter = 0;

    super.onExit();
  }
}
