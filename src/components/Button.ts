import { Container, Graphics, Text } from "pixi.js";

/**
 * Button - Interactive button component for UI
 */
export class Button extends Container {
  private background: Graphics;
  private labelText: Text;
  private isHovered: boolean = false;
  private isPressed: boolean = false;

  private readonly buttonWidth: number;
  private readonly buttonHeight: number;
  private readonly normalColor: number = 0x4a90e2;
  private readonly hoverColor: number = 0x357abd;
  private readonly pressedColor: number = 0x2a5f8f;
  private readonly textColor: number = 0xffffff;

  constructor(
    text: string,
    buttonWidth: number = 200,
    buttonHeight: number = 50,
  ) {
    super();
    this.buttonWidth = buttonWidth;
    this.buttonHeight = buttonHeight;

    // Create background
    this.background = new Graphics();
    this.drawBackground(this.normalColor);
    this.addChild(this.background);

    // Create label
    this.labelText = new Text({
      text: text,
      style: {
        fontFamily: "Arial",
        fontSize: 20,
        fill: this.textColor,
        fontWeight: "bold",
      },
    });
    this.labelText.anchor.set(0.5);
    this.labelText.position.set(buttonWidth / 2, buttonHeight / 2);
    this.addChild(this.labelText);

    // Setup interaction
    this.eventMode = "static";
    this.cursor = "pointer";

    this.on("pointerenter", this.onPointerEnter.bind(this));
    this.on("pointerleave", this.onPointerLeave.bind(this));
    this.on("pointerdown", this.onPointerDown.bind(this));
    this.on("pointerup", this.onPointerUp.bind(this));
    this.on("pointerupoutside", this.onPointerUp.bind(this));
  }

  private drawBackground(color: number): void {
    this.background.clear();
    this.background.roundRect(0, 0, this.buttonWidth, this.buttonHeight, 10);
    this.background.fill({ color: color });
    this.background.stroke({ width: 2, color: 0xffffff, alpha: 0.3 });
  }

  private onPointerEnter(): void {
    this.isHovered = true;
    if (!this.isPressed) {
      this.drawBackground(this.hoverColor);
    }
  }

  private onPointerLeave(): void {
    this.isHovered = false;
    if (!this.isPressed) {
      this.drawBackground(this.normalColor);
    }
  }

  private onPointerDown(): void {
    this.isPressed = true;
    this.drawBackground(this.pressedColor);
    this.labelText.position.set(
      this.buttonWidth / 2 + 2,
      this.buttonHeight / 2 + 2,
    );
  }

  private onPointerUp(): void {
    this.isPressed = false;
    this.labelText.position.set(this.buttonWidth / 2, this.buttonHeight / 2);
    if (this.isHovered) {
      this.drawBackground(this.hoverColor);
    } else {
      this.drawBackground(this.normalColor);
    }
  }

  /**
   * Set the button text
   */
  public setText(text: string): void {
    this.labelText.text = text;
  }
}
