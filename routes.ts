import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Get current question for user
  app.get("/api/question", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    
    const question = await storage.getQuestion(req.user.currentRound, 1);
    if (!question) {
      return res.status(404).json({ message: "No question found" });
    }
    
    // Don't send the answer to the client
    const { answer, ...questionWithoutAnswer } = question;
    res.json(questionWithoutAnswer);
  });

  // Submit answer
  app.post("/api/submit", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    if (req.user.isDisqualified) {
      return res.status(403).json({ message: "You have been disqualified" });
    }

    const { questionId, answer } = req.body;
    const isCorrect = await storage.validateAnswer(questionId, answer);

    const submission = await storage.createSubmission({
      userId: req.user.id,
      questionId,
      answer,
      isCorrect,
      submittedAt: new Date(),
    });

    if (isCorrect) {
      await storage.updateUserScore(req.user.id, req.user.score + 10);
      await storage.updateUserRound(req.user.id, req.user.currentRound + 1);
    }

    res.json({ isCorrect });
  });

  // Disqualify user
  app.post("/api/disqualify", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    
    await storage.disqualifyUser(req.user.id);
    res.sendStatus(200);
  });

  // Get leaderboard
  app.get("/api/leaderboard", async (_req, res) => {
    const leaderboard = await storage.getLeaderboard();
    res.json(leaderboard);
  });

  const httpServer = createServer(app);
  return httpServer;
}
