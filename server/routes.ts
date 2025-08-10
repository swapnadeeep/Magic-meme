import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { createMemeSchema, generateCaptionSchema } from "@shared/schema";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

const IMGFLIP_USERNAME = process.env.IMGFLIP_USERNAME || "testuser";
const IMGFLIP_PASSWORD = process.env.IMGFLIP_PASSWORD || "testpass";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Clear template cache
  app.post("/api/templates/clear-cache", async (req, res) => {
    try {
      // Clear the cache by resetting the maps
      (storage as any).memeTemplates.clear();
      (storage as any).generatedMemes.clear();
      res.json({ message: "Cache cleared successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to clear cache" });
    }
  });

  // Get popular meme templates
  app.get("/api/templates", async (req, res) => {
    try {
      // First check if we have cached templates
      const cachedTemplates = await storage.getMemeTemplates();
      if (cachedTemplates.length > 0) {
        return res.json(cachedTemplates);
      }

      // Fetch from Imgflip API
      const response = await fetch("https://api.imgflip.com/get_memes");
      const data = await response.json();
      
      if (!data.success) {
        throw new Error("Failed to fetch templates from Imgflip");
      }

      // Transform and cache the templates
      const templates = data.data.memes.map((meme: any) => ({
        id: meme.id,
        name: meme.name,
        url: meme.url,
        width: meme.width,
        height: meme.height,
        boxCount: meme.box_count,
      }));

      await storage.saveMemeTemplates(templates);
      res.json(templates);
    } catch (error) {
      console.error("Error fetching meme templates:", error);
      res.status(500).json({ 
        message: "Failed to fetch meme templates",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Generate a meme
  app.post("/api/memes/generate", async (req, res) => {
    try {
      const validatedData = createMemeSchema.parse(req.body);
      const { templateId, topText = "", bottomText = "" } = validatedData;

      // Create form data for Imgflip API
      const formData = new URLSearchParams({
        template_id: templateId,
        username: IMGFLIP_USERNAME,
        password: IMGFLIP_PASSWORD,
        text0: topText,
        text1: bottomText,
      });

      // Call Imgflip caption_image API
      const response = await fetch("https://api.imgflip.com/caption_image", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error_message || "Failed to generate meme");
      }

      // Get template name for storage
      const templates = await storage.getMemeTemplates();
      const template = templates.find(t => t.id === templateId);
      const templateName = template?.name || "Unknown Template";

      // Save the generated meme
      const generatedMeme = await storage.saveGeneratedMeme({
        templateId,
        templateName,
        topText: topText || null,
        bottomText: bottomText || null,
        imageUrl: data.data.url,
      });

      res.json({
        id: generatedMeme.id,
        url: data.data.url,
        templateId,
        templateName,
        topText,
        bottomText,
      });
    } catch (error) {
      console.error("Error generating meme:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid request data",
          errors: error.errors,
        });
      }
      res.status(500).json({
        message: "Failed to generate meme",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get recent generated memes
  app.get("/api/memes/recent", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 12;
      const memes = await storage.getGeneratedMemes(limit);
      res.json(memes);
    } catch (error) {
      console.error("Error fetching recent memes:", error);
      res.status(500).json({
        message: "Failed to fetch recent memes",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  // Get a specific generated meme
  app.get("/api/memes/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const meme = await storage.getGeneratedMeme(id);
      
      if (!meme) {
        return res.status(404).json({ message: "Meme not found" });
      }
      
      res.json(meme);
    } catch (error) {
      console.error("Error fetching meme:", error);
      res.status(500).json({
        message: "Failed to fetch meme",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Generate AI meme caption
  app.post("/api/captions/generate", async (req, res) => {
    try {
      const validatedData = generateCaptionSchema.parse(req.body);
      const { topic, templateName } = validatedData;

      // Initialize Google Generative AI
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // Create prompt for meme caption generation
      const prompt = `Write a short, witty meme caption about: ${topic}${templateName ? ` for a ${templateName} meme` : ''}. 
      Keep it under 12 words, funny, and internet-style. Provide two options:
      1. Top text
      2. Bottom text
      
      Return in format:
      Top: [text]
      Bottom: [text]`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();

      // Parse the response to extract top and bottom text
      const lines = response.split('\n').filter(line => line.trim());
      let topText = "";
      let bottomText = "";

      for (const line of lines) {
        if (line.toLowerCase().includes('top:')) {
          topText = line.replace(/^.*top:\s*/i, '').trim();
        } else if (line.toLowerCase().includes('bottom:')) {
          bottomText = line.replace(/^.*bottom:\s*/i, '').trim();
        }
      }

      // Fallback if parsing fails
      if (!topText && !bottomText) {
        const sentences = response.split(/[.!?]/).filter(s => s.trim());
        topText = sentences[0]?.trim() || response.substring(0, 50);
        bottomText = sentences[1]?.trim() || "";
      }

      res.json({
        topText: topText.replace(/['"]/g, ''),
        bottomText: bottomText.replace(/['"]/g, ''),
        originalResponse: response
      });
    } catch (error) {
      console.error("Error generating caption:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid request data",
          errors: error.errors,
        });
      }
      res.status(500).json({
        message: "Failed to generate caption",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}





