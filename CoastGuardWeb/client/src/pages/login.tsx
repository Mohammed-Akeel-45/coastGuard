import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, registerSchema, type LoginInput, type RegisterInput } from "@shared/schema";
import { useAuthStore } from "@/lib/store";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Waves, Loader2 } from "lucide-react";

export default function LoginPage() {
    const [, setLocation] = useLocation();
    const { setAuth } = useAuthStore();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const loginForm = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    });

    const registerForm = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema),
        defaultValues: { userName: "", email: "", password: "", phone: "", locationName: "" },
    });

    async function onLogin(data: LoginInput) {
        setIsLoading(true);
        try {
            const response = await apiRequest<{ data: { token: string, userName: string; role: string } }>(
                "POST",
                "/auth/login",
                data
            );
            const token = response.data.token;
            setAuth({
                token: response.data.token,
                userName: response.data.userName,
                role: response.data.role as any,
            });
            localStorage.setItem("token", token);

            toast({ title: "Welcome back!", description: "Logged in successfully" });
            setLocation("/");
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Login failed",
                description: error.message || "Invalid email or password",
            });
        } finally {
            setIsLoading(false);
        }
    }

    async function onRegister(data: RegisterInput) {
        setIsLoading(true);
        try {
            const response = await apiRequest<{ user: { token: string; userName: string; role: string } }>(
                "POST",
                "/auth/register",
                data
            );
            setAuth({
                token: response.data.token,
                userName: response.data.userName,
                role: response.data.role as any,
            });
            toast({ title: "Account created!", description: "Registration successful" });
            setLocation("/");
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Registration failed",
                description: error.message || "Could not create account",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md">
                <div className="flex flex-col items-center mb-8 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
                            <Waves className="h-7 w-7 text-primary-foreground" />
                        </div>
                        <h1 className="text-3xl font-bold">CoastGuard</h1>
                    </div>
                    <p className="text-muted-foreground text-center">
                        Coastal hazard monitoring and reporting platform
                    </p>
                </div>

                <Tabs defaultValue="login" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="login" data-testid="tab-login">Login</TabsTrigger>
                        <TabsTrigger value="register" data-testid="tab-register">Register</TabsTrigger>
                    </TabsList>

                    <TabsContent value="login">
                        <Card>
                            <CardHeader>
                                <CardTitle>Sign In</CardTitle>
                                <CardDescription>Enter your credentials to access your account</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="login-email">Email</Label>
                                        <Input
                                            id="login-email"
                                            type="email"
                                            placeholder="you@example.com"
                                            data-testid="input-login-email"
                                            {...loginForm.register("email")}
                                        />
                                        {loginForm.formState.errors.email && (
                                            <p className="text-sm text-destructive">{loginForm.formState.errors.email.message}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="login-password">Password</Label>
                                        <Input
                                            id="login-password"
                                            type="password"
                                            placeholder="••••••••"
                                            data-testid="input-login-password"
                                            {...loginForm.register("password")}
                                        />
                                        {loginForm.formState.errors.password && (
                                            <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>
                                        )}
                                    </div>
                                    <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-login">
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Signing in...
                                            </>
                                        ) : (
                                            "Sign In"
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="register">
                        <Card>
                            <CardHeader>
                                <CardTitle>Create Account</CardTitle>
                                <CardDescription>Register to start reporting coastal hazards</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="register-name">Name</Label>
                                        <Input
                                            id="register-name"
                                            placeholder="John Doe"
                                            data-testid="input-register-name"
                                            {...registerForm.register("userName")}
                                        />
                                        {registerForm.formState.errors.userName && (
                                            <p className="text-sm text-destructive">{registerForm.formState.errors.userName.message}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="register-email">Email</Label>
                                        <Input
                                            id="register-email"
                                            type="email"
                                            placeholder="you@example.com"
                                            data-testid="input-register-email"
                                            {...registerForm.register("email")}
                                        />
                                        {registerForm.formState.errors.email && (
                                            <p className="text-sm text-destructive">{registerForm.formState.errors.email.message}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="register-password">Password</Label>
                                        <Input
                                            id="register-password"
                                            type="password"
                                            placeholder="••••••••"
                                            data-testid="input-register-password"
                                            {...registerForm.register("password")}
                                        />
                                        {registerForm.formState.errors.password && (
                                            <p className="text-sm text-destructive">{registerForm.formState.errors.password.message}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="register-phone">Phone (optional)</Label>
                                        <Input
                                            id="register-phone"
                                            type="tel"
                                            placeholder="+1234567890"
                                            data-testid="input-register-phone"
                                            {...registerForm.register("phone")}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="register-location">Location (optional)</Label>
                                        <Input
                                            id="register-location"
                                            placeholder="City, State"
                                            data-testid="input-register-location"
                                            {...registerForm.register("locationName")}
                                        />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-register">
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Creating account...
                                            </>
                                        ) : (
                                            "Create Account"
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
