import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "./use-toast";
import { Question } from "@shared/schema";
import { useLocation } from "wouter";

export function useQuizState() {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [_, setLocation] = useLocation();
  const { toast } = useToast();

  // Fetch current question
  const { data: question } = useQuery<Omit<Question, "answer">>({
    queryKey: ["/api/question"],
  });

  // Initialize or update timer when question changes
  useEffect(() => {
    if (question?.timeLimit) {
      setTimeLeft(question.timeLimit);
    }
  }, [question?.id]);

  // Timer countdown logic
  useEffect(() => {
    if (timeLeft === null) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          // Time's up
          clearInterval(timer);
          toast({
            title: "Time's up!",
            description: "Moving to leaderboard...",
            variant: "destructive",
          });
          setLocation("/leaderboard");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, toast, setLocation]);

  // Format time for display
  const formatTime = useCallback((seconds: number | null) => {
    if (seconds === null) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  }, []);

  return {
    timeLeft,
    formattedTime: formatTime(timeLeft),
    question,
    isLoading: !question,
    roundProgress: {
      currentRound: question?.round || 1,
      questionNumber: question?.questionNumber || 1,
    },
  };
}
