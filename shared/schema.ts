import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const memeTemplates = pgTable("meme_templates", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  boxCount: integer("box_count").notNull(),
});

export const generatedMemes = pgTable("generated_memes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  templateId: varchar("template_id").notNull(),
  templateName: text("template_name").notNull(),
  topText: text("top_text"),
  bottomText: text("bottom_text"),
  imageUrl: text("image_url").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMemeTemplateSchema = createInsertSchema(memeTemplates);

export const insertGeneratedMemeSchema = createInsertSchema(generatedMemes).omit({
  id: true,
  createdAt: true,
});

export const createMemeSchema = z.object({
  templateId: z.string(),
  topText: z.string().optional(),
  bottomText: z.string().optional(),
});

export const generateCaptionSchema = z.object({
  topic: z.string().min(1, "Topic is required"),
  templateName: z.string().optional(),
});

export type MemeTemplate = typeof memeTemplates.$inferSelect;
export type InsertMemeTemplate = z.infer<typeof insertMemeTemplateSchema>;
export type GeneratedMeme = typeof generatedMemes.$inferSelect;
export type InsertGeneratedMeme = z.infer<typeof insertGeneratedMemeSchema>;
export type CreateMemeRequest = z.infer<typeof createMemeSchema>;
export type GenerateCaptionRequest = z.infer<typeof generateCaptionSchema>;
