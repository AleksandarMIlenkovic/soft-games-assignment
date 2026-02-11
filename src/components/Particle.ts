import { Sprite, Texture } from "pixi.js";

/**
 * Particle - Represents a single fire particle
 */
export class Particle extends Sprite {
  private velocity: { x: number; y: number };
  private life: number;
  private maxLife: number;
  private initialScale: number;
  private initialAlpha: number;

  constructor(texture: Texture) {
    super(texture);

    this.velocity = { x: 0, y: 0 };
    this.life = 0;
    this.maxLife = 100;
    this.initialScale = 1;
    this.initialAlpha = 1;

    this.anchor.set(0.5);

    this.blendMode = "add";

    this.width = 30;
    this.height = 30;
  }

  /**
   * Initialize particle with random properties
   */
  public initialize(x: number, y: number): void {
    this.position.set(x, y);

    this.velocity = {
      x: (Math.random() - 0.5) * 2, // -1 to 1
      y: -Math.random() * 3 - 1, // -1 to -4 (upward)
    };

    this.maxLife = 60 + Math.random() * 60; // 60-120 frames
    this.life = this.maxLife;

    this.initialScale = 0.5 + Math.random() * 0.5; // 0.5 to 1
    this.scale.set(this.initialScale);

    this.initialAlpha = 0.7 + Math.random() * 0.3; // 0.7 to 1
    this.alpha = this.initialAlpha;

    const color = this.getFireColor();
    this.tint = color;
  }

  /**
   * Update particle state
   * @returns true if particle is still alive, false if it should be recycled
   */
  public update(): boolean {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    this.life--;

    const lifeRatio = this.life / this.maxLife;
    this.scale.set(this.initialScale * lifeRatio);

    this.alpha = this.initialAlpha * lifeRatio;

    this.updateColor(lifeRatio);

    return this.life > 0;
  }

  /**
   * Get a random fire color (yellow to red)
   */
  private getFireColor(): number {
    const r = 255;
    const g = Math.floor(Math.random() * 200); // 0-200
    const b = 0;
    return (r << 16) | (g << 8) | b;
  }

  /**
   * Update color based on life ratio
   */
  private updateColor(lifeRatio: number): void {
    const r = 255;
    let g = 0;
    const b = 0;

    if (lifeRatio > 0.7) {
      g = Math.floor(200 * ((lifeRatio - 0.7) / 0.3));
    } else if (lifeRatio > 0.3) {
      g = Math.floor(100 * ((lifeRatio - 0.3) / 0.4));
    }

    this.tint = (r << 16) | (g << 8) | b;
  }

  public isAlive(): boolean {
    return this.life > 0;
  }
}
