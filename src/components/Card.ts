import { Sprite, Spritesheet, Texture } from "pixi.js";


export class Card extends Sprite {
  private frontTexture: Texture;
  private backTexture: Texture;
  private isShowingBack: boolean = true;

  constructor(
    spritesheet: Spritesheet,
    frameName: string,
    backTexture?: Texture,
  ) {
    const frontTex = spritesheet.textures[frameName];

    const backTex =
      backTexture ||
      Card.createDefaultBackTexture(frontTex.width, frontTex.height);

    const initialTexture = backTex;
    super(initialTexture);
    this.frontTexture = frontTex;
    this.backTexture = backTex;
    this.anchor.set(0.5);
    this.eventMode = "static";
  }


  private static createDefaultBackTexture(
    width: number,
    height: number,
  ): Texture {
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(width);
    canvas.height = Math.ceil(height);
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return Texture.WHITE;
    }

    ctx.fillStyle = "#1a237e";
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = "#3949ab";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, width, height);

    ctx.strokeStyle = "#5c6bc0";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < width; i += 6) {
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
    }
    for (let i = 0; i < height; i += 6) {
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
    }
    ctx.stroke();

    ctx.strokeStyle = "#7986cb";
    ctx.lineWidth = 1;
    ctx.strokeRect(3, 3, width - 6, height - 6);

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 4;

    ctx.fillStyle = "#283593";
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#9fa8da";
    ctx.lineWidth = 2;
    ctx.stroke();

    return Texture.from(canvas);
  }

  public setBackTexture(texture: Texture): void {
    this.backTexture = texture;
    if (this.isShowingBack) {
      this.texture = this.backTexture;
    }
  }

  public showBack(): void {
    this.isShowingBack = true;
    this.texture = this.backTexture;
  }

  public showFront(): void {
    this.isShowingBack = false;
    this.texture = this.frontTexture;
  }


  public isBack(): boolean {
    return this.isShowingBack;
  }

  public flip(): void {
    if (this.isShowingBack) {
      this.showFront();
    } else {
      this.showBack();
    }
  }

  public getCardWidth(): number {
    return this.width;
  }

  public getCardHeight(): number {
    return this.height;
  }

  public static createSpritesheet(
    texture: Texture,
    cardWidth: number,
    cardHeight: number,
    cols: number,
    rows: number,
  ): Spritesheet {
    const frames: Record<
      string,
      { frame: { x: number; y: number; w: number; h: number } }
    > = {};

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const frameName = `card_${row}_${col}`;
        frames[frameName] = {
          frame: {
            x: col * cardWidth,
            y: row * cardHeight,
            w: cardWidth,
            h: cardHeight,
          },
        };
      }
    }

    return new Spritesheet(texture, {
      frames: frames,
      animations: {},
      meta: {
        scale: "1",
      },
    });
  }
}
