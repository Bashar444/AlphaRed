import type { Express } from "express";
import { createServer, type Server } from "http";
import path from "path";
import express from "express";

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve the CV file for download
  app.get("/cv-dr-bashar-al-agha.docx", (req, res) => {
    const cvPath = path.join(process.cwd(), "attached_assets", "cv Dr.Bashar Al Agha with research projects listed_1749475683532.docx");
    res.download(cvPath, "CV-Dr-Bashar-Al-Agha.docx", (err) => {
      if (err) {
        console.error("Error downloading CV:", err);
        res.status(404).json({ message: "CV file not found" });
      }
    });
  });

  // Contact form handler (for future implementation)
  app.post("/api/contact", express.json(), (req, res) => {
    const { name, email, subject, message } = req.body;
    
    // Here you would typically:
    // 1. Validate the input
    // 2. Save to database
    // 3. Send email notification
    // For now, we'll just return success
    
    console.log("Contact form submission:", { name, email, subject, message });
    
    res.json({ message: "Message sent successfully" });
  });

  const httpServer = createServer(app);
  return httpServer;
}
