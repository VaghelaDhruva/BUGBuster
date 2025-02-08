import { users, questions, submissions, type User, type InsertUser, type Question, type Submission } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserScore(userId: number, newScore: number): Promise<void>;
  updateUserRound(userId: number, round: number): Promise<void>;
  disqualifyUser(userId: number): Promise<void>;
  getLeaderboard(): Promise<User[]>;
  
  // Question operations
  getQuestion(round: number, questionNumber: number): Promise<Question | undefined>;
  validateAnswer(questionId: number, answer: string): Promise<boolean>;
  
  // Submission operations
  createSubmission(submission: Omit<Submission, "id">): Promise<Submission>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private questions: Map<number, Question>;
  private submissions: Map<number, Submission>;
  sessionStore: session.SessionStore;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.questions = new Map();
    this.submissions = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    
    // Add some sample questions
    this.initializeQuestions();
  }

  private initializeQuestions() {
    const sampleQuestions: Omit<Question, "id">[] = [
      {
        round: 1,
        questionNumber: 1,
        content: "Find and fix the bug in this code snippet",
        imageUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4",
        answer: "Missing semicolon on line 5",
        timeLimit: 300,
        testCases: [
          { input: "test1", output: "test1 output" },
          { input: "test2", output: "test2 output" }
        ]
      },
      // Add more sample questions as needed
    ];

    sampleQuestions.forEach((q) => {
      const id = this.currentId++;
      this.questions.set(id, { ...q, id });
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = {
      ...insertUser,
      id,
      currentRound: 1,
      score: 0,
      isDisqualified: false,
      lastSubmissionTime: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserScore(userId: number, newScore: number): Promise<void> {
    const user = await this.getUser(userId);
    if (user) {
      user.score = newScore;
      this.users.set(userId, user);
    }
  }

  async updateUserRound(userId: number, round: number): Promise<void> {
    const user = await this.getUser(userId);
    if (user) {
      user.currentRound = round;
      this.users.set(userId, user);
    }
  }

  async disqualifyUser(userId: number): Promise<void> {
    const user = await this.getUser(userId);
    if (user) {
      user.isDisqualified = true;
      this.users.set(userId, user);
    }
  }

  async getLeaderboard(): Promise<User[]> {
    return Array.from(this.users.values())
      .filter((user) => !user.isDisqualified)
      .sort((a, b) => b.score - a.score);
  }

  async getQuestion(round: number, questionNumber: number): Promise<Question | undefined> {
    return Array.from(this.questions.values()).find(
      (q) => q.round === round && q.questionNumber === questionNumber,
    );
  }

  async validateAnswer(questionId: number, answer: string): Promise<boolean> {
    const question = this.questions.get(questionId);
    if (!question) return false;
    return answer.toLowerCase().trim() === question.answer.toLowerCase().trim();
  }

  async createSubmission(submission: Omit<Submission, "id">): Promise<Submission> {
    const id = this.currentId++;
    const newSubmission: Submission = { ...submission, id };
    this.submissions.set(id, newSubmission);
    return newSubmission;
  }
}

export const storage = new MemStorage();
