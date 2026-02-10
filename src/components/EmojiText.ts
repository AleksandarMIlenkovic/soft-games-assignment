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

/**
 * EmojiText - Renders text with native emoji support and custom emoji images
 * Supports emojis directly in the text string (e.g., "Hello 🎉🚀✨")
 * Also supports custom emoji placeholders (e.g., "Hello {smile}") that are replaced with images
 * Handles inline emojis by creating multiple text fields and positioning them accordingly
 */
export class EmojiText extends Container {
  private textElements: Text[] = [];
  private emojiSprites: Map<string, Sprite> = new Map();
  private customEmojiTextures: Map<string, Texture> = new Map();
  private currentText: string = "";
  private useCustomEmojis: boolean = false;
  private fallbackEmoji: string = "👍";
  private maxCharsPerLine: number = 30; // Will be adjusted based on trial and error
  private lines: Line[] = [];

  constructor() {
    super();
  }

  /**
   * Set custom emoji textures (name -> texture mapping)
   * @param emojiTextures Map of emoji name to pre-loaded texture
   */
  public setCustomEmojiTextures(emojiTextures: Map<string, Texture>): void {
    this.customEmojiTextures = new Map(emojiTextures);
  }

  /**
   * Enable or disable custom emoji rendering
   * @param useCustom If true, custom emoji images will be used; otherwise native emojis
   */
  public setUseCustomEmojis(useCustom: boolean): void {
    this.useCustomEmojis = useCustom;
    this.renderText();
  }

  /**
   * Set the maximum characters per line before wrapping
   * @param maxChars Maximum characters per line
   */
  public setMaxCharsPerLine(maxChars: number): void {
    this.maxCharsPerLine = maxChars;
    this.renderText();
  }

  /**
   * Set the text content with emoji support
   * @param text The text to render (may contain native emojis or custom emoji placeholders)
   */
  public setText(text: string): void {
    this.currentText = text;
    this.renderText();
  }

  /**
   * Render the text with appropriate emoji handling
   */
  private renderText(): void {
    // Clear existing text elements and emoji sprites
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
      // Parse text for custom emoji placeholders {emoji_name}
      const parts = this.parseCustomEmojis(this.currentText);

      // Group parts into lines based on character count
      this.lines = this.groupPartsIntoLines(parts);

      // Render each line
      this.renderLines();
    } else {
      // Use native emojis - just set the text directly
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

  /**
   * Group text parts into lines based on character count
   * @param parts Array of text and emoji parts
   * @returns Array of lines with their parts
   */
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
        // Start a new line
        lines.push({ parts: currentLine, totalWidth: 0 });
        currentLine = [];
        currentCharCount = 0;
      }

      currentLine.push(part);
      currentCharCount += partCharCount;
    }

    // Add the last line if it has content
    if (currentLine.length > 0) {
      lines.push({ parts: currentLine, totalWidth: 0 });
    }

    return lines;
  }

  /**
   * Render all lines with proper positioning
   */
  private renderLines(): void {
    const fontSize = 24;
    const emojiSize = fontSize * 1.2;
    const lineHeight = fontSize * 1.5;
    const letterSpacing = 2;

    // Calculate widths for each line
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

    // Calculate starting Y position (center all lines vertically)
    let startY = -((this.lines.length - 1) * lineHeight) / 2;

    // Render each line
    for (let lineIndex = 0; lineIndex < this.lines.length; lineIndex++) {
      const line = this.lines[lineIndex];
      let xOffset = -line.totalWidth / 2;

      for (const part of line.parts) {
        if (part.type === "text") {
          // Create text element
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
          // Create emoji sprite
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
            // Emoji not found, use fallback emoji
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

  /**
   * Parse text for custom emoji placeholders
   * @param text The text to parse
   * @returns Array of parts (text or emoji)
   */
  private parseCustomEmojis(text: string): TextPart[] {
    const parts: TextPart[] = [];
    let currentText = "";
    let i = 0;

    while (i < text.length) {
      if (text[i] === "{" && i + 1 < text.length) {
        // Found potential emoji placeholder
        const endIndex = text.indexOf("}", i);
        if (endIndex !== -1) {
          // Save any accumulated text
          if (currentText.length > 0) {
            parts.push({ type: "text", content: currentText });
            currentText = "";
          }
          // Extract emoji name
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

    // Save any remaining text
    if (currentText.length > 0) {
      parts.push({ type: "text", content: currentText });
    }

    return parts;
  }

  /**
   * Set the font size
   * @param size The font size in pixels
   */
  public setFontSize(_size: number): void {
    this.renderText();
  }

  /**
   * Set the text color
   * @param color The color value (hex number)
   */
  public setColor(color: number): void {
    this.textElements.forEach((el) => {
      el.style.fill = color;
    });
  }

  /**
   * Set the font family
   * @param fontFamily The font family name
   */
  public setFontFamily(_fontFamily: string): void {
    this.renderText();
  }

  /**
   * Set the maximum width for text wrapping
   * @param width The maximum width in pixels
   */
  public setMaxWidth(width: number): void {
    // Calculate approximate max chars based on width and font size
    const fontSize = 24;
    const avgCharWidth = fontSize * 0.6; // Approximate average character width
    this.maxCharsPerLine = Math.floor(width / avgCharWidth);
    this.renderText();
  }

  /**
   * Set text alignment
   * @param align The alignment ('left', 'center', 'right')
   */
  public setAlign(_align: "left" | "center" | "right"): void {
    // Alignment is handled by centering all content
    // For left/right alignment, additional logic would be needed
  }
}
