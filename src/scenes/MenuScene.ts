import { Text, Graphics } from "pixi.js";
import { BaseScene } from "./BaseScene";
import { Button } from "../components/Button";
import { GameManager } from "../GameManager";
import { AceOfShadowsScene } from "./AceOfShadowsScene";
import { MagicWordsScene } from "./MagicWordsScene";
import { PhoenixFlameScene } from "./PhoenixFlameScene";

export class MenuScene extends BaseScene {
  private title: Text;
  private buttons: Button[] = [];
  private fullScreenButton!: Button;

  constructor(gm: GameManager) {
    super(gm);

    const background = new Graphics();
    background.rect(0, 0, this.DESIGN_WIDTH, this.DESIGN_HEIGHT);
    background.fill({ color: 0x1a1a2e });
    this.addChildAt(background, 0);

    this.title = new Text({
      text: "SOFT GAMES TEST",
      style: {
        fontFamily: "Arial",
        fontSize: 48,
        fill: 0xffffff,
        fontWeight: "bold",
        align: "center",
      },
    });
    this.title.anchor.set(0.5);
    this.title.position.set(this.DESIGN_WIDTH / 2, 150);
    this.addChild(this.title);

    const subtitle = new Text({
      text: "Select a scene to play",
      style: {
        fontFamily: "Arial",
        fontSize: 24,
        fill: 0xaaaaaa,
        align: "center",
      },
    });
    subtitle.anchor.set(0.5);
    subtitle.position.set(this.DESIGN_WIDTH / 2, 220);
    this.addChild(subtitle);

    this.createButtons();
    this.createFullScreenButton();
  }

  private createButtons(): void {
    const buttonWidth = 300;
    const buttonHeight = 60;
    const startY = 300;
    const spacing = 80;

    const aceButton = new Button("Ace of Shadows", buttonWidth, buttonHeight);
    aceButton.position.set((this.DESIGN_WIDTH - buttonWidth) / 2, startY);
    aceButton.on("pointerup", () => {
      this.gm.changeScene(AceOfShadowsScene);
    });
    this.addChild(aceButton);
    this.buttons.push(aceButton);

    const magicButton = new Button("Magic Words", buttonWidth, buttonHeight);
    magicButton.position.set(
      (this.DESIGN_WIDTH - buttonWidth) / 2,
      startY + spacing,
    );
    magicButton.on("pointerup", () => {
      this.gm.changeScene(MagicWordsScene);
    });
    this.addChild(magicButton);
    this.buttons.push(magicButton);

    const phoenixButton = new Button(
      "Phoenix Flame",
      buttonWidth,
      buttonHeight,
    );
    phoenixButton.position.set(
      (this.DESIGN_WIDTH - buttonWidth) / 2,
      startY + spacing * 2,
    );
    phoenixButton.on("pointerup", () => {
      this.gm.changeScene(PhoenixFlameScene);
    });
    this.addChild(phoenixButton);
    this.buttons.push(phoenixButton);
  }

  private createFullScreenButton(): void {
    const buttonWidth = 50;
    const buttonHeight = 50;
    const padding = 20;

    this.fullScreenButton = new Button("⛶", buttonWidth, buttonHeight);
    this.fullScreenButton.position.set(
      this.DESIGN_WIDTH - buttonWidth - padding,
      padding,
    );
    this.fullScreenButton.on("pointerup", () => {
      this.gm.toggleFullScreen();
      this.updateFullScreenButtonText();
    });
    this.addChild(this.fullScreenButton);
    this.updateFullScreenButtonText();
  }

  private updateFullScreenButtonText(): void {
    this.fullScreenButton.setText(this.gm.isFullScreen() ? "⛶" : "⛶");
  }

  public onEnter(): void {
    super.onEnter();
    console.log("[MenuScene] Entered menu");
  }

  public onExit(): void {
    console.log("[MenuScene] Exiting menu");
    super.onExit();
  }
}
