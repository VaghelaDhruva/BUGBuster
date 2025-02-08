import { useEffect } from "react";
import { useAuth } from "./use-auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "./use-toast";

export function useAntiCheat() {
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    const handleVisibilityChange = async () => {
      if (document.hidden) {
        try {
          await apiRequest("POST", "/api/disqualify");
          toast({
            title: "Disqualified",
            description: "You have been disqualified for leaving the page",
            variant: "destructive",
          });
        } catch (error) {
          console.error("Failed to disqualify user:", error);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user, toast]);
}
