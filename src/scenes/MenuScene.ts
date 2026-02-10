import { Text, Graphics } from "pixi.js";
import { BaseScene } from "./BaseScene";
import { Button } from "../components/Button";
import { GameManager } from "../GameManager";
import { AceOfShadowsScene } from "./AceOfShadowsScene";
import { MagicWordsScene } from "./MagicWordsScene";
import { PhoenixFlameScene } from "./PhoenixFlameScene";

/**
 * MenuScene - Main menu for navigating between game scenes
 */
export class MenuScene extends BaseScene {
  private title: Text;
  private buttons: Button[] = [];

  constructor(gm: GameManager) {
    super(gm);

    // Create background
    const background = new Graphics();
    background.rect(0, 0, this.DESIGN_WIDTH, this.DESIGN_HEIGHT);
    background.fill({ color: 0x1a1a2e });
    this.addChildAt(background, 0);

    // Create title
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

    // Create subtitle
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

    // Create buttons
    this.createButtons();
  }

  private createButtons(): void {
    const buttonWidth = 300;
    const buttonHeight = 60;
    const startY = 300;
    const spacing = 80;

    // Ace of Shadows button
    const aceButton = new Button("Ace of Shadows", buttonWidth, buttonHeight);
    aceButton.position.set((this.DESIGN_WIDTH - buttonWidth) / 2, startY);
    aceButton.on("pointerup", () => {
      this.gm.changeScene(AceOfShadowsScene);
    });
    this.addChild(aceButton);
    this.buttons.push(aceButton);

    // Magic Words button
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

    // Phoenix Flame button
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

  public onEnter(): void {
    super.onEnter();
    console.log("[MenuScene] Entered menu");
  }

  public onExit(): void {
    console.log("[MenuScene] Exiting menu");
    super.onExit();
  }
}
