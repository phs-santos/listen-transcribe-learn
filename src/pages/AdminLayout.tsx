import { useState } from "react";
import { Outlet } from "react-router-dom";
import { cx } from "@/lib/utils";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background text-foreground antialiased">
            {/* Header mobile 100% width */}
            <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-background/95 border-b border-border backdrop-blur supports-[backdrop-filter]:bg-background/70">
                <div
                    className="flex items-center justify-between px-4 h-[56px]"
                    style={{ paddingTop: "env(safe-area-inset-top)" }}
                >
                    <h1 className="text-base font-semibold">Admin Panel</h1>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSidebarOpen(true)}
                        aria-label="Abrir menu"
                        aria-controls="sidebar"
                        aria-expanded={sidebarOpen}
                        className="h-10 w-10"
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                </div>
            </header>
            {/* spacer p/ header fixo */}
            <div className="lg:hidden h-[56px]" />

            <div className="flex">
                {/* Sidebar controlada */}
                <Sidebar
                    open={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    onToggle={() => setSidebarOpen((s) => !s)}
                />

                {/* Overlay mobile */}
                {sidebarOpen && (
                    <button
                        type="button"
                        aria-label="Fechar menu"
                        className="fixed inset-0 bg-background/70 backdrop-blur-sm z-40 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Conteúdo principal */}
                <main
                    id="main"
                    className={cx(
                        "flex-1",
                        // "lg:ml-72", // reserva espaço da sidebar no desktop
                        sidebarOpen &&
                            "pointer-events-none lg:pointer-events-auto" // bloqueia interação no mobile
                    )}
                    aria-hidden={sidebarOpen ? true : undefined}
                >
                    <div className="p-4 sm:p-6">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};
