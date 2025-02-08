import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useAntiCheat } from "@/hooks/use-anti-cheat";
import { useState } from "react";
import { Loader2, Timer } from "lucide-react";
import { useLocation } from "wouter";
import { type Question } from "@shared/schema";

export default function QuizPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const [answer, setAnswer] = useState("");
  useAntiCheat();

  const { data: question, isLoading } = useQuery<Omit<Question, "answer">>({
    queryKey: ["/api/question"],
  });

  const submitMutation = useMutation({
    mutationFn: async ({ questionId, answer }: { questionId: number; answer: string }) => {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, answer }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to submit answer");
      return res.json();
    },
    onSuccess: (data) => {
      if (data.isCorrect) {
        toast({
          title: "Correct!",
          description: "Moving to next round...",
        });
        setTimeout(() => setLocation("/leaderboard"), 1500);
      } else {
        toast({
          title: "Incorrect",
          description: "Try again",
          variant: "destructive",
        });
      }
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center">No more questions available!</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Round {user?.currentRound} - Question {question.questionNumber}</CardTitle>
              <div className="flex items-center gap-2">
                <Timer className="h-5 w-5" />
                <span>{Math.floor(question.timeLimit / 60)}:00</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">{question.content}</h3>
              {question.imageUrl && (
                <img
                  src={question.imageUrl}
                  alt="Question"
                  className="w-full max-h-64 object-cover rounded-md mb-4"
                />
              )}
            </div>

            <div className="space-y-4">
              <Textarea
                placeholder="Type your answer here..."
                className="min-h-[150px]"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
              />
              <Button
                className="w-full"
                onClick={() =>
                  submitMutation.mutate({ questionId: question.id, answer })
                }
                disabled={submitMutation.isPending}
              >
                {submitMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Submit Answer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
