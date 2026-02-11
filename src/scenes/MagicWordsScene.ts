import { Text, Graphics, Sprite, Texture } from "pixi.js";
import { BaseScene } from "./BaseScene";
import { EmojiText } from "../components/EmojiText";
import { Button } from "../components/Button";
import { MenuScene } from "./MenuScene";
import { GameManager } from "../GameManager";

export class MagicWordsScene extends BaseScene {
  private title: Text;
  private backButton: Button;
  private fullScreenButton: Button;
  private dialogueContainer: Graphics;
  private characterNameLeft: Text;
  private characterNameRight: Text;
  private dialogueText: EmojiText;
  private nextButton: Button;
  private prevButton: Button;

  private dialogues: Array<{ character: string; text: string }> = [];
  private emojies: Array<{ name: string; url: string }> = [];
  private avatars: Record<string, { url: string; position: string }> = {};
  private avatarSprites: Map<string, Sprite> = new Map(); // character name -> sprite
  private currentDialogueIndex: number = 0;

  constructor(gm: GameManager) {
    super(gm);

    const background = new Graphics();
    background.rect(0, 0, this.DESIGN_WIDTH, this.DESIGN_HEIGHT);
    background.fill({ color: 0x1a1a2e });
    this.addChildAt(background, 0);

    this.title = new Text({
      text: "Magic Words",
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

    this.dialogueContainer = new Graphics();
    this.dialogueContainer.roundRect(
      100,
      150,
      this.DESIGN_WIDTH - 200,
      500,
      20,
    );
    this.dialogueContainer.fill({ color: 0x2d2d44 });
    this.dialogueContainer.stroke({ width: 3, color: 0x4a90e2 });
    this.addChild(this.dialogueContainer);

    this.characterNameLeft = new Text({
      text: "Loading...",
      style: {
        fontFamily: "Arial",
        fontSize: 28,
        fill: 0x4a90e2,
        fontWeight: "bold",
      },
    });
    this.characterNameLeft.position.set(130, 180);
    this.addChild(this.characterNameLeft);

    this.characterNameRight = new Text({
      text: "Loading...",
      style: {
        fontFamily: "Arial",
        fontSize: 28,
        fill: 0x4a90e2,
        fontWeight: "bold",
      },
    });
    this.characterNameRight.anchor.set(1, 0);
    this.characterNameRight.position.set(1150, 180);
    this.characterNameRight.alpha = 0;
    this.addChild(this.characterNameRight);

    this.dialogueText = new EmojiText();
    this.dialogueText.position.set(640, 400);
    this.addChild(this.dialogueText);

    this.prevButton = new Button("Previous", 120, 40);
    this.prevButton.position.set(150, 580);
    this.prevButton.on("pointerup", () => {
      this.showPreviousDialogue();
    });
    this.addChild(this.prevButton);

    this.nextButton = new Button("Next", 120, 40);
    this.nextButton.position.set(this.DESIGN_WIDTH - 270, 580);
    this.nextButton.on("pointerup", () => {
      this.showNextDialogue();
    });
    this.addChild(this.nextButton);

    const pageIndicator = new Text({
      text: "Use buttons to navigate",
      style: {
        fontFamily: "Arial",
        fontSize: 16,
        fill: 0xaaaaaa,
      },
    });
    pageIndicator.anchor.set(0.5);
    pageIndicator.position.set(this.DESIGN_WIDTH / 2, 600);
    this.addChild(pageIndicator);
  }

  public async onEnter(): Promise<void> {
    super.onEnter();

    await this.fetchDialogues();

    this.displayDialogue(0);

    console.log("scene enter");
  }

  private async fetchDialogues(): Promise<void> {
    try {
      const response = await fetch(
        "https://private-624120-softgamesassignment.apiary-mock.com/v2/magicwords",
      );
      const data = await response.json();
      console.log("!!!dialog", data.dialogue);
      data.dialogue.forEach((item: { name: string; text: string }) => {
        if (item.name && item.text) {
          this.dialogues.push({
            character: item.name,
            text: item.text,
          });
        } else {
          console.warn("item:", item);
        }
      });
      data.emojies.forEach((item: { name: string; url: string }) => {
        if (item.name && item.url) {
          this.emojies.push({
            name: item.name,
            url: item.url,
          });
        } else {
          console.warn("emoji item no data", item);
        }
      });
      data.avatars.forEach(
        (item: { name: string; url: string; position: string }) => {
          if (item.name && item.url && item.position) {
            this.avatars[item.name] = {
              url: item.url,
              position: item.position,
            };
          } else {
            console.warn("avatar item:", item);
          }
        },
      );

      await this.preloadEmojiTextures();

      await this.createAvatarSprites();
    } catch (error) {
      console.error("Failed to fetch dialogues:", error);
      this.dialogues = this.getSampleDialogues();
    }
  }

  private async preloadEmojiTextures(): Promise<void> {
    const emojiTextures = new Map<string, Texture>();

    for (const emoji of this.emojies) {
      try {
        const response = await fetch(emoji.url);
        const blob = await response.blob();
        const image = new Image();
        const imageUrl = URL.createObjectURL(blob);

        await new Promise<void>((resolve, reject) => {
          image.onload = () => {
            URL.revokeObjectURL(imageUrl);
            resolve();
          };
          image.onerror = () => {
            URL.revokeObjectURL(imageUrl);
            reject(new Error("Failed to load image"));
          };
          image.src = imageUrl;
        });

        const texture = Texture.from(image);
        emojiTextures.set(emoji.name, texture);
      } catch (error) {
        console.warn(
          `[MagicWordsScene] Failed to pre-load emoji: ${emoji.name}`,
          error,
        );
      }
    }

    this.dialogueText.setCustomEmojiTextures(emojiTextures);

    this.dialogueText.setUseCustomEmojis(true);
  }

  private async createAvatarSprites(): Promise<void> {
    const avatarSize = 110;
    const avatarY = 250;
    const avatarXleft = 190;
    const avatarXright = 1100;
    for (const [characterName, avatarData] of Object.entries(this.avatars)) {
      try {
        const response = await fetch(avatarData.url);
        const blob = await response.blob();
        const image = new Image();
        const imageUrl = URL.createObjectURL(blob);

        await new Promise<void>((resolve, reject) => {
          image.onload = () => {
            URL.revokeObjectURL(imageUrl);
            resolve();
          };
          image.onerror = () => {
            URL.revokeObjectURL(imageUrl);
            reject(new Error("Failed to load image"));
          };
          image.src = imageUrl;
        });

        const texture = Texture.from(image);
        const sprite = new Sprite(texture);
        sprite.width = avatarSize;
        sprite.height = avatarSize;
        sprite.anchor.set(0.5);

        if (avatarData.position === "left") {
          sprite.position.set(avatarXleft, avatarY);
        } else if (avatarData.position === "right") {
          sprite.position.set(avatarXright, avatarY);
        } else {
          sprite.position.set(this.DESIGN_WIDTH / 2, avatarY);
        }

        sprite.alpha = 0;

        this.addChild(sprite);
        this.avatarSprites.set(characterName, sprite);

        console.log(
          `created avatar for ${characterName} at ${avatarData.position}`,
        );
      } catch (error) {
        console.warn(`failed to load avatar for ${characterName}:`, error);
      }
    }
  }

  private updateAvatarAlphas(speakingCharacter: string): void {
    const targetAlpha = 1; // speaking character
    const hiddenAlpha = 0; // non-speaking characters

    this.avatarSprites.forEach((sprite, characterName) => {
      const isSpeaking = characterName === speakingCharacter;
      const target = isSpeaking ? targetAlpha : hiddenAlpha;

      const startAlpha = sprite.alpha;
      const alphaDiff = target - startAlpha;
      const steps = 30;
      const alphaStep = alphaDiff / steps;
      let currentStep = 0;

      const animateAlpha = () => {
        if (currentStep < steps) {
          sprite.alpha += alphaStep;
          currentStep++;
          requestAnimationFrame(animateAlpha);
        } else {
          sprite.alpha = target;
        }
      };

      animateAlpha();
    });
  }

  private getSampleDialogues(): Array<{ character: string; text: string }> {
    return [
      {
        character: "Hero",
        text: "lorem😊",
      },
      {
        character: "Villain",
        text: "ipsum 🔥🔥",
      },
      {
        character: "Hero",
        text: "dorat ❤️",
      },
      {
        character: "Villain",
        text: "blabla 😢",
      },
      {
        character: "Hero",
        text: "blabla 🐰",
      },
    ];
  }

  private displayDialogue(index: number): void {
    if (index < 0 || index >= this.dialogues.length) return;

    this.currentDialogueIndex = index;
    const dialogue = this.dialogues[index];

    // Get the avatar position for the current speaker
    const avatarData = this.avatars[dialogue.character];
    const speakerPosition = avatarData?.position || "left";

    // Update both name displays
    this.characterNameLeft.text = dialogue.character;
    this.characterNameRight.text = dialogue.character;

    // Show/hide based on speaker position
    if (speakerPosition === "right") {
      this.characterNameLeft.alpha = 0;
      this.characterNameRight.alpha = 1;
    } else {
      this.characterNameLeft.alpha = 1;
      this.characterNameRight.alpha = 0;
    }

    this.dialogueText.setText(dialogue.text);

    console.log(`dialogue for ${dialogue.character} at ${speakerPosition}`);
    console.log(`Available avatars:`, Array.from(this.avatarSprites.keys()));
    this.updateAvatarAlphas(dialogue.character);

    this.prevButton.alpha = index === 0 ? 0.5 : 1;
    this.prevButton.eventMode = index === 0 ? "none" : "static";

    this.nextButton.alpha = index === this.dialogues.length - 1 ? 0.5 : 1;
    this.nextButton.eventMode =
      index === this.dialogues.length - 1 ? "none" : "static";
  }

  private showPreviousDialogue(): void {
    if (this.currentDialogueIndex > 0) {
      this.displayDialogue(this.currentDialogueIndex - 1);
    }
  }

  private showNextDialogue(): void {
    if (this.currentDialogueIndex < this.dialogues.length - 1) {
      this.displayDialogue(this.currentDialogueIndex + 1);
    }
  }

  public onExit(): void {
    this.avatarSprites.forEach((sprite) => {
      this.removeChild(sprite);
      sprite.destroy();
    });
    this.avatarSprites.clear();

    this.dialogues = [];
    this.emojies = [];
    this.avatars = {};
    this.currentDialogueIndex = 0;

    super.onExit();
  }
}
