import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function getMemeCaption(topic) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `Write a short, funny meme caption about: ${topic}. 
                  Make it in two parts separated by a dash (-).`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}
