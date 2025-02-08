import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  currentRound: integer("current_round").notNull().default(1),
  score: integer("score").notNull().default(0),
  isDisqualified: boolean("is_disqualified").notNull().default(false),
  lastSubmissionTime: timestamp("last_submission_time"),
});

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  round: integer("round").notNull(),
  questionNumber: integer("question_number").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  answer: text("answer").notNull(),
  timeLimit: integer("time_limit").notNull(), // in seconds
  testCases: jsonb("test_cases").notNull().$type<{input: string, output: string}[]>(),
});

export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  questionId: integer("question_id").notNull(),
  answer: text("answer").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  submittedAt: timestamp("submitted_at").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertQuestionSchema = createInsertSchema(questions);
export const insertSubmissionSchema = createInsertSchema(submissions);

export type User = typeof users.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type Submission = typeof submissions.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
