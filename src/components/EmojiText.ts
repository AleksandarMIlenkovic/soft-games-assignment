import { Text, Container, Sprite, Texture } from "pixi.js";

interface TextPart {
  type: "text" | "emoji";
  content: string;
  textElement?: Text;
  sprite?: Sprite;
}

interface Line {
  parts: TextPart[];
  totalWidth: number;
}

export class EmojiText extends Container {
  private textElements: Text[] = [];
  private emojiSprites: Map<string, Sprite> = new Map();
  private customEmojiTextures: Map<string, Texture> = new Map();
  private currentText: string = "";
  private useCustomEmojis: boolean = false;
  private fallbackEmoji: string = "👍";
  private maxCharsPerLine: number = 30;
  private lines: Line[] = [];

  constructor() {
    super();
  }

  public setCustomEmojiTextures(emojiTextures: Map<string, Texture>): void {
    this.customEmojiTextures = new Map(emojiTextures);
  }

  public setUseCustomEmojis(useCustom: boolean): void {
    this.useCustomEmojis = useCustom;
    this.renderText();
  }

  public setMaxCharsPerLine(maxChars: number): void {
    this.maxCharsPerLine = maxChars;
    this.renderText();
  }

  public setText(text: string): void {
    this.currentText = text;
    this.renderText();
  }

  private renderText(): void {
    this.textElements.forEach((el) => {
      this.removeChild(el);
      el.destroy();
    });
    this.textElements = [];

    this.emojiSprites.forEach((sprite) => {
      this.removeChild(sprite);
      sprite.destroy();
    });
    this.emojiSprites.clear();

    this.lines = [];

    if (this.useCustomEmojis) {
      const parts = this.parseCustomEmojis(this.currentText);

      this.lines = this.groupPartsIntoLines(parts);

      this.renderLines();
    } else {
      const textElement = new Text({
        text: this.currentText,
        style: {
          fontFamily: "Arial",
          fontSize: 24,
          fill: 0xffffff,
          align: "center",
          wordWrap: true,
          wordWrapWidth: 400,
        },
      });
      textElement.anchor.set(0.5, 0.5);
      textElement.position.set(0, 0);
      this.addChild(textElement);
      this.textElements.push(textElement);
    }
  }

  private groupPartsIntoLines(parts: TextPart[]): Line[] {
    const lines: Line[] = [];
    let currentLine: TextPart[] = [];
    let currentCharCount = 0;

    for (const part of parts) {
      const partCharCount = part.type === "emoji" ? 1 : part.content.length;

      if (
        currentCharCount + partCharCount > this.maxCharsPerLine &&
        currentLine.length > 0
      ) {
        lines.push({ parts: currentLine, totalWidth: 0 });
        currentLine = [];
        currentCharCount = 0;
      }

      currentLine.push(part);
      currentCharCount += partCharCount;
    }

    if (currentLine.length > 0) {
      lines.push({ parts: currentLine, totalWidth: 0 });
    }

    return lines;
  }

  private renderLines(): void {
    const fontSize = 24;
    const emojiSize = fontSize * 1.2;
    const lineHeight = fontSize * 1.5;
    const letterSpacing = 2;

    for (const line of this.lines) {
      let totalWidth = 0;
      for (const part of line.parts) {
        if (part.type === "text") {
          const tempText = new Text({
            text: part.content,
            style: {
              fontFamily: "Arial",
              fontSize: fontSize,
              fill: 0xffffff,
            },
          });
          totalWidth += tempText.width;
          tempText.destroy();
        } else {
          totalWidth += emojiSize;
        }
        totalWidth += letterSpacing;
      }
      line.totalWidth = totalWidth;
    }

    let startY = -((this.lines.length - 1) * lineHeight) / 2;

    for (let lineIndex = 0; lineIndex < this.lines.length; lineIndex++) {
      const line = this.lines[lineIndex];
      let xOffset = -line.totalWidth / 2;

      for (const part of line.parts) {
        if (part.type === "text") {
          const textElement = new Text({
            text: part.content,
            style: {
              fontFamily: "Arial",
              fontSize: fontSize,
              fill: 0xffffff,
            },
          });
          textElement.anchor.set(0, 0.5);
          textElement.position.set(xOffset, startY);
          this.addChild(textElement);
          this.textElements.push(textElement);
          part.textElement = textElement;
          xOffset += textElement.width + letterSpacing;
        } else if (part.type === "emoji") {
          const texture = this.customEmojiTextures.get(part.content);
          if (texture) {
            const sprite = new Sprite(texture);
            sprite.width = emojiSize;
            sprite.height = emojiSize;
            sprite.anchor.set(0.5, 0.5);
            sprite.position.set(xOffset + emojiSize / 2, startY);
            this.addChild(sprite);
            this.emojiSprites.set(part.content, sprite);
            part.sprite = sprite;
            xOffset += emojiSize + letterSpacing;
          } else {
            const textElement = new Text({
              text: this.fallbackEmoji,
              style: {
                fontFamily: "Arial",
                fontSize: fontSize,
                fill: 0xffffff,
              },
            });
            textElement.anchor.set(0, 0.5);
            textElement.position.set(xOffset, startY);
            this.addChild(textElement);
            this.textElements.push(textElement);
            part.textElement = textElement;
            xOffset += textElement.width + letterSpacing;
          }
        }
      }

      startY += lineHeight;
    }
  }

  private parseCustomEmojis(text: string): TextPart[] {
    const parts: TextPart[] = [];
    let currentText = "";
    let i = 0;

    while (i < text.length) {
      if (text[i] === "{" && i + 1 < text.length) {
        const endIndex = text.indexOf("}", i);
        if (endIndex !== -1) {
          if (currentText.length > 0) {
            parts.push({ type: "text", content: currentText });
            currentText = "";
          }
          const emojiName = text.substring(i + 1, endIndex);
          parts.push({ type: "emoji", content: emojiName });
          i = endIndex + 1;
        } else {
          currentText += text[i];
          i++;
        }
      } else {
        currentText += text[i];
        i++;
      }
    }

    if (currentText.length > 0) {
      parts.push({ type: "text", content: currentText });
    }

    return parts;
  }

  public setFontSize(_size: number): void {
    this.renderText();
  }

  public setColor(color: number): void {
    this.textElements.forEach((el) => {
      el.style.fill = color;
    });
  }

  public setFontFamily(_fontFamily: string): void {
    this.renderText();
  }

  public setMaxWidth(width: number): void {
    const fontSize = 24;
    const avgCharWidth = fontSize * 0.6; // Approximate average character width
    this.maxCharsPerLine = Math.floor(width / avgCharWidth);
    this.renderText();
  }
}
