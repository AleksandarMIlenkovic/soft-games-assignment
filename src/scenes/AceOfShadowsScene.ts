import { Text, Graphics, Assets, Spritesheet } from "pixi.js";
import { BaseScene } from "./BaseScene";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { MenuScene } from "./MenuScene";
import { GameManager } from "../GameManager";

export class AceOfShadowsScene extends BaseScene {
  private static readonly CARD_COUNT = 144;
  private static readonly STACK_OFFSET_X = 2;
  private static readonly STACK_OFFSET_Y = 2;
  private static readonly MOVE_INTERVAL = 1000;
  private static readonly ANIMATION_DURATION = 2000;
  private static readonly AVAILABLE_FRAMES = 52;
  private sourceStack: Card[] = [];
  private destinationStack: Card[] = [];
  private title: Text;
  private backButton: Button;
  private fullScreenButton: Button;
  private lastMoveTime: number = 0;
  private animatingCard: Card | null = null;
  private animationStartTime: number = 0;
  private animationStartPos: { x: number; y: number } = { x: 0, y: 0 };
  private animationEndPos: { x: number; y: number } = { x: 0, y: 0 };
  private hasFlippedCard: boolean = false;

  constructor(gm: GameManager) {
    super(gm);

    // Create background
    const background = new Graphics();
    background.rect(0, 0, this.DESIGN_WIDTH, this.DESIGN_HEIGHT);
    background.fill({ color: 0x2d2d44 });
    this.addChildAt(background, 0);

    // Create title
    this.title = new Text({
      text: "Ace of Shadows",
      style: {
        fontFamily: "Arial",
        fontSize: 36,
        fill: 0xffffff,
        fontWeight: "bold",
      },
    });
    this.title.anchor.set(0.5);
    this.title.position.set(this.DESIGN_WIDTH / 2, 50);
    this.addChild(this.title);

    const subtitle = new Text({
      text: `${AceOfShadowsScene.CARD_COUNT} cards - Top card moves every 1s`,
      style: {
        fontFamily: "Arial",
        fontSize: 18,
        fill: 0xaaaaaa,
      },
    });
    subtitle.anchor.set(0.5);
    subtitle.position.set(this.DESIGN_WIDTH / 2, 90);
    this.addChild(subtitle);

    this.backButton = new Button("Back to Menu", 150, 40);
    this.backButton.position.set(20, 20);
    this.backButton.on("pointerup", () => {
      this.gm.changeScene(MenuScene);
    });
    this.addChild(this.backButton);

    this.fullScreenButton = new Button("⛶", 50, 50);
    this.fullScreenButton.position.set(this.DESIGN_WIDTH - 70, 20);
    this.fullScreenButton.on("pointerup", () => {
      this.gm.toggleFullScreen();
    });
    this.addChild(this.fullScreenButton);
  }

  public async onEnter(): Promise<void> {
    super.onEnter();

    const texture = await Assets.load(
      "/soft-games-assignment/assets/cards.png",
    );

    const spritesheet = Card.createSpritesheet(texture, 46, 72, 13, 4);

    await spritesheet.parse();

    this.createCards(spritesheet);

    this.positionStacks();

    console.log("[AceOfShadowsScene] Scene entered");
  }

  private createCards(spritesheet: Spritesheet): void {
    this.sourceStack.forEach((card) => card.destroy());
    this.destinationStack.forEach((card) => card.destroy());
    this.sourceStack = [];
    this.destinationStack = [];

    for (let i = 0; i < AceOfShadowsScene.CARD_COUNT; i++) {
      const frameIndex = i % AceOfShadowsScene.AVAILABLE_FRAMES;
      const row = Math.floor(frameIndex / 13);
      const col = frameIndex % 13;
      const frameName = `card_${row}_${col}`;
      const card = new Card(spritesheet, frameName);
      card.showBack();
      this.addChild(card);
      this.sourceStack.push(card);
    }

    this.stackCards(this.sourceStack, 0, 0);
  }

  private stackCards(stack: Card[], startX: number, startY: number): void {
    stack.forEach((card, index) => {
      card.position.set(
        startX + index * AceOfShadowsScene.STACK_OFFSET_X,
        startY + index * AceOfShadowsScene.STACK_OFFSET_Y,
      );
    });
  }

  private positionStacks(): void {
    const sourceX = this.DESIGN_WIDTH * 0.3 - 200;
    const sourceY = this.DESIGN_HEIGHT * 0.5;

    const destX = this.DESIGN_WIDTH * 0.7 - 200;
    const destY = this.DESIGN_HEIGHT * 0.5;

    this.stackCards(this.sourceStack, sourceX, sourceY);

    this.stackCards(this.destinationStack, destX, destY);
  }

  public update(_delta: number): void {
    const now = Date.now();

    if (
      !this.animatingCard &&
      this.sourceStack.length > 0 &&
      now - this.lastMoveTime > AceOfShadowsScene.MOVE_INTERVAL
    ) {
      this.startCardMove();
    }

    if (this.animatingCard) {
      this.updateAnimation(now);
    }
  }

  private startCardMove(): void {
    const topCard = this.sourceStack.pop();
    if (!topCard) return;

    this.animatingCard = topCard;
    this.lastMoveTime = Date.now();
    this.animationStartTime = Date.now();
    this.hasFlippedCard = false;

    this.removeChild(this.animatingCard);
    this.addChild(this.animatingCard);

    this.animatingCard.showBack();
    this.animatingCard.scale.x = 1;

    const sourceX = this.DESIGN_WIDTH * 0.3 - 200;
    const sourceY = this.DESIGN_HEIGHT * 0.5;
    const destX = this.DESIGN_WIDTH * 0.7 - 200;
    const destY = this.DESIGN_HEIGHT * 0.5;

    const sourceOffset =
      this.sourceStack.length * AceOfShadowsScene.STACK_OFFSET_X;
    const destOffset =
      this.destinationStack.length * AceOfShadowsScene.STACK_OFFSET_X;

    this.animationStartPos = {
      x: sourceX + sourceOffset,
      y: sourceY + this.sourceStack.length * AceOfShadowsScene.STACK_OFFSET_Y,
    };

    this.animationEndPos = {
      x: destX + destOffset,
      y:
        destY + this.destinationStack.length * AceOfShadowsScene.STACK_OFFSET_Y,
    };

    this.animatingCard.position.set(
      this.animationStartPos.x,
      this.animationStartPos.y,
    );
  }

  private updateAnimation(now: number): void {
    if (!this.animatingCard) return;

    const elapsed = now - this.animationStartTime;
    const progress = Math.min(
      elapsed / AceOfShadowsScene.ANIMATION_DURATION,
      1,
    );

    const easedProgress = 1 - Math.pow(1 - progress, 3);

    this.animatingCard.position.set(
      this.animationStartPos.x +
        (this.animationEndPos.x - this.animationStartPos.x) * easedProgress,
      this.animationStartPos.y +
        (this.animationEndPos.y - this.animationStartPos.y) * easedProgress,
    );

    if (progress < 0.5) {
      const flipProgress = progress * 2; // 0 to 1
      this.animatingCard.scale.x = 1 - flipProgress;
    } else {
      const flipProgress = (progress - 0.5) * 2; // 0 to 1

      if (!this.hasFlippedCard) {
        this.animatingCard.showFront();
        this.hasFlippedCard = true;
      }

      this.animatingCard.scale.x = flipProgress;
    }

    if (progress >= 1) {
      this.finishAnimation();
    }
  }

  private finishAnimation(): void {
    if (!this.animatingCard) return;

    this.animatingCard.scale.x = 1;
    this.animatingCard.showFront();

    this.destinationStack.push(this.animatingCard);
    this.animatingCard = null;
  }

  public onExit(): void {
    this.sourceStack.forEach((card) => card.destroy());
    this.destinationStack.forEach((card) => card.destroy());
    this.sourceStack = [];
    this.destinationStack = [];
    this.animatingCard = null;

    super.onExit();
  }
}
