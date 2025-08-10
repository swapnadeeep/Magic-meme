import { type MemeTemplate, type InsertMemeTemplate, type GeneratedMeme, type InsertGeneratedMeme } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Meme templates
  getMemeTemplates(): Promise<MemeTemplate[]>;
  saveMemeTemplates(templates: InsertMemeTemplate[]): Promise<void>;
  
  // Generated memes
  saveGeneratedMeme(meme: InsertGeneratedMeme): Promise<GeneratedMeme>;
  getGeneratedMemes(limit?: number): Promise<GeneratedMeme[]>;
  getGeneratedMeme(id: string): Promise<GeneratedMeme | undefined>;
}

export class MemStorage implements IStorage {
  private memeTemplates: Map<string, MemeTemplate>;
  private generatedMemes: Map<string, GeneratedMeme>;

  constructor() {
    this.memeTemplates = new Map();
    this.generatedMemes = new Map();
  }

  async getMemeTemplates(): Promise<MemeTemplate[]> {
    return Array.from(this.memeTemplates.values());
  }

  async saveMemeTemplates(templates: InsertMemeTemplate[]): Promise<void> {
    templates.forEach(template => {
      // Keep the original template ID for Imgflip API compatibility
      const memeTemplate: MemeTemplate = { ...template };
      this.memeTemplates.set(template.id, memeTemplate);
    });
  }

  async saveGeneratedMeme(insertMeme: InsertGeneratedMeme): Promise<GeneratedMeme> {
    const id = randomUUID();
    const meme: GeneratedMeme = {
      id,
      templateId: insertMeme.templateId,
      templateName: insertMeme.templateName,
      topText: insertMeme.topText || null,
      bottomText: insertMeme.bottomText || null,
      imageUrl: insertMeme.imageUrl,
      createdAt: new Date(),
    };
    this.generatedMemes.set(id, meme);
    return meme;
  }

  async getGeneratedMemes(limit: number = 20): Promise<GeneratedMeme[]> {
    const memes = Array.from(this.generatedMemes.values())
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
    return memes.slice(0, limit);
  }

  async getGeneratedMeme(id: string): Promise<GeneratedMeme | undefined> {
    return this.generatedMemes.get(id);
  }
}

export const storage = new MemStorage();
