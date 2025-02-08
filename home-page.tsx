import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Code2, Trophy, LogOut } from "lucide-react";
import { Link } from "wouter";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Welcome, {user?.username}!</h1>
          <Button
            variant="outline"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code2 className="h-6 w-6" />
                Start Challenge
              </CardTitle>
              <CardDescription>
                Begin or continue your debugging challenge
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Current Round: {user?.currentRound}
                <br />
                Your Score: {user?.score}
              </p>
              <Link href="/quiz">
                <Button className="w-full">
                  {user?.currentRound === 1 ? "Start Challenge" : "Continue Challenge"}
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-6 w-6" />
                Leaderboard
              </CardTitle>
              <CardDescription>
                See how you rank against other participants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/leaderboard">
                <Button className="w-full" variant="outline">
                  View Leaderboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <img
            src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6"
            alt="Coding Challenge"
            className="w-full h-48 object-cover rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}
