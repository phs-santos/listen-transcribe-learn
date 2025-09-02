// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { RouteGuard } from "@/components/RouteGuard";
import { Recepcao } from "./pages/Recepcao";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { AdminUsers } from "./pages/admin/AdminUsers";
import { AdminAudios } from "./pages/admin/AdminAudios";
import { AdminAnalytics } from "./pages/admin/AdminAnalytics";
import { NotFound } from "./pages/NotFound";

import { AppShell } from "@/components/layout/AppShell";

const queryClient = new QueryClient();

const App = () => (
    <QueryClientProvider client={queryClient}>
        <AuthProvider>
            <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter
                    future={{
                        v7_startTransition: true,
                        v7_relativeSplatPath: true,
                    }}
                >
                    <Routes>
                        {/* Públicas */}
                        <Route path="/" element={<Recepcao />} />
                        <Route path="/login" element={<Login />} />

                        {/* ----- ÁREA LOGADA: RouteGuard + AppShell ----- */}
                        <Route
                            element={
                                <RouteGuard>
                                    <AppShell />
                                </RouteGuard>
                            }
                        >
                            <Route path="/dashboard" element={<Dashboard />} />

                            <Route path="/admin">
                                <Route index element={<AdminUsers />} />
                                <Route path="users" element={<AdminUsers />} />
                                <Route
                                    path="audios"
                                    element={<AdminAudios />}
                                />
                                <Route
                                    path="analytics"
                                    element={<AdminAnalytics />}
                                />
                            </Route>

                            {/* Exemplo: outras páginas logadas */}
                            {/* <Route path="/profile" element={<Profile />} /> */}
                            {/* <Route path="/settings" element={<Settings />} /> */}
                        </Route>

                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </BrowserRouter>
            </TooltipProvider>
        </AuthProvider>
    </QueryClientProvider>
);

export default App;
