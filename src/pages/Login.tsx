import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Headphones, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth-store";

export const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const { signIn, loginLoading: isLoading } = useAuthStore();
    const { toast } = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            toast({
                title: "Campos obrigatórios",
                description: "Por favor, preencha todos os campos.",
                variant: "destructive",
            });
            return;
        }

        const { error, message } = await signIn(email, password);

        if (!error) {
            toast({
                title: "Login realizado com sucesso!",
                description: `Bem-vindo, ${email}!`,
            });

            navigate("/dashboard");
        } else {
            toast({
                title: "Erro no login",
                description: "Email ou senha inválidos.",
                variant: "destructive",
            });
        }
    };

    const isDev = true; //
    // const isDev = import.meta.env.NODE_ENV === "development";

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md">
                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl shadow-glow mb-4">
                        <Headphones className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                        AudioTranscribe
                    </h1>
                    <p className="text-muted-foreground">
                        Faça login para começar a transcrever seus áudios
                    </p>
                </div>

                {/* Login Card */}
                <Card className="p-8 bg-gradient-card border-border/50 shadow-card backdrop-blur-glass">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Field */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-foreground">
                                Email
                            </Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10 bg-background/50 border-border/50 focus:border-primary/50"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <Label
                                htmlFor="password"
                                className="text-foreground"
                            >
                                Senha
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Sua senha"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    className="pl-10 pr-10 bg-background/50 border-border/50 focus:border-primary/50"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-transparent"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                                    ) : (
                                        <Eye className="w-4 h-4 text-muted-foreground" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Login Button */}
                        <Button
                            type="submit"
                            className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-200 h-12"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                                    Entrando...
                                </div>
                            ) : (
                                "Entrar"
                            )}
                        </Button>
                    </form>

                    {/* Footer */}
                    {isDev && (
                        <div className="mt-6 text-center">
                            <p className="text-sm text-muted-foreground mb-2">
                                Credenciais de teste:
                            </p>
                            <div className="flex items-center gap-4 text-muted-foreground space-y-1">
                                <Button
                                    className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-200 h-12"
                                    onClick={() => {
                                        setEmail("paulo@agencia56k.com.br");
                                        setPassword("123456");
                                    }}
                                >
                                    admin
                                </Button>

                                <Button
                                    className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-200 h-12"
                                    onClick={() => {
                                        setEmail("roberval@agencia56k.com.br");
                                        setPassword("123456");
                                    }}
                                >
                                    usuario
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};
