import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Shield, Lock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { insertUserSchema, loginSchema, type InsertUser, type LoginUser, type User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { saveAuth, saveRSAKeys } from "@/lib/auth";
import { generateRSAKeyPair } from "@/lib/crypto";
import { Badge } from "@/components/ui/badge";

interface AuthPageProps {
  onAuthSuccess: () => void;
}

export default function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const { toast } = useToast();

  const form = useForm<InsertUser | LoginUser>({
    resolver: zodResolver(isLogin ? loginSchema : insertUserSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const authMutation = useMutation({
    mutationFn: async (data: InsertUser | LoginUser) => {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const result = await apiRequest<{ user: User; token: string }>("POST", endpoint, data);
      return result;
    },
    onSuccess: async (data) => {
      let rsaKeys = await generateRSAKeyPair();
      
      saveRSAKeys(rsaKeys);
      
      await apiRequest("POST", "/api/auth/public-key", { 
        publicKey: rsaKeys.publicKey,
        userId: data.user.id
      });
      
      saveAuth({ user: data.user, token: data.token });
      toast({
        title: isLogin ? "Welcome back!" : "Account created",
        description: isLogin ? "You've successfully logged in." : "Your account has been created securely.",
      });
      onAuthSuccess();
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Authentication failed",
        description: error.message,
      });
    },
  });

  const onSubmit = (data: InsertUser | LoginUser) => {
    authMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-semibold">SecureChat</CardTitle>
            <CardDescription className="mt-2">
              {isLogin ? "Welcome back! Sign in to continue." : "Create your secure account"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your username"
                        {...field}
                        data-testid="input-username"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        {...field}
                        data-testid="input-password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={authMutation.isPending}
                data-testid="button-submit"
              >
                {authMutation.isPending ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
              </Button>
            </form>
          </Form>

          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => {
                setIsLogin(!isLogin);
                form.reset();
              }}
              data-testid="button-toggle-auth"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </Button>
          </div>

          <div className="pt-4 border-t">
            <Badge variant="outline" className="w-full justify-center py-2 gap-2">
              <Lock className="h-3 w-3" />
              <span className="text-xs">End-to-End Encrypted</span>
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
