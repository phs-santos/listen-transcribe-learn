import { useEffect, useMemo, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, Music, BarChart3, LogOut, X } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { cx } from "@/lib/utils";

type NavItemDef = {
    to: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    label: string;
};

type SidebarProps = {
    open: boolean;
    onClose: () => void;
    onToggle?: () => void;
};

function useBodyScrollLock(locked: boolean) {
    useEffect(() => {
        const { body } = document;
        if (!locked) return;
        const prev = body.style.overflow;
        body.style.overflow = "hidden";
        return () => {
            body.style.overflow = prev;
        };
    }, [locked]);
}

export const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
    const { user, signOut } = useAuthStore();
    const navigate = useNavigate();

    const drawerRef = useRef<HTMLDivElement>(null);
    const firstItemRef = useRef<HTMLAnchorElement>(null);

    const navItems: NavItemDef[] = useMemo(
        () => [
            { to: "/admin/users", icon: Users, label: "Usuários" },
            { to: "/admin/audios", icon: Music, label: "Áudios" },
            { to: "/admin/analytics", icon: BarChart3, label: "Analytics" },
        ],
        []
    );

    const initials = (user?.email || "A").slice(0, 2).toUpperCase();

    const handleLogout = () => {
        signOut();
        navigate("/");
        onClose();
    };

    // lock scroll quando aberto
    useBodyScrollLock(open);

    // foco no primeiro item ao abrir
    useEffect(() => {
        if (!open) return;
        const t = setTimeout(() => firstItemRef.current?.focus(), 80);
        return () => clearTimeout(t);
    }, [open]);

    // esc fecha
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    // swipe-to-close simples
    useEffect(() => {
        if (!open) return;
        const el = drawerRef.current;
        if (!el) return;
        let startX = 0,
            dx = 0,
            dragging = false;

        const start = (e: TouchEvent) => {
            startX = e.touches[0].clientX;
            dragging = startX < 36;
            el.style.willChange = "transform";
        };
        const move = (e: TouchEvent) => {
            if (!dragging) return;
            dx = Math.max(0, e.touches[0].clientX - startX);
            el.style.transform = `translate3d(${dx}px,0,0)`;
            el.style.transition = "none";
        };
        const end = () => {
            if (!dragging) return;
            el.style.transition = "";
            if (dx > 96) onClose();
            else el.style.transform = "";
            dragging = false;
            dx = 0;
            startX = 0;
            el.style.willChange = "auto";
        };

        el.addEventListener("touchstart", start, { passive: true });
        el.addEventListener("touchmove", move, { passive: true });
        el.addEventListener("touchend", end);
        return () => {
            el.removeEventListener("touchstart", start);
            el.removeEventListener("touchmove", move);
            el.removeEventListener("touchend", end);
        };
    }, [open, onClose]);

    const NavItem: React.FC<
        NavItemDef & { innerRef?: React.Ref<HTMLAnchorElement> }
    > = ({ to, icon: Icon, label, innerRef }) => (
        <NavLink
            ref={innerRef as any}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
                cx(
                    "group relative flex items-center gap-3 rounded-xl px-4 py-3 transition-all outline-none",
                    "ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    "text-base",
                    isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )
            }
            end
        >
            {({ isActive }) => (
                <>
                    <span
                        aria-hidden
                        className={cx(
                            "absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full transition-colors",
                            isActive
                                ? "bg-primary-foreground/90"
                                : "bg-transparent group-hover:bg-foreground/20"
                        )}
                    />
                    <Icon className="h-5 w-5 shrink-0" />
                    <span className="truncate">{label}</span>
                </>
            )}
        </NavLink>
    );

    return (
        <aside
            id="sidebar"
            ref={drawerRef}
            className={cx(
                "fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border",
                "h-screen overflow-y-auto",
                "transform transition-transform duration-200 ease-out motion-reduce:transition-none lg:transform-none",
                open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
                "lg:sticky lg:top-0"
            )}
            role={open ? "dialog" : "navigation"}
            aria-modal={open ? "true" : undefined}
            aria-label="Menu administrativo"
        >
            <div className="flex h-full flex-col pb-[env(safe-area-inset-bottom)]">
                {/* header da sidebar */}
                <div className="px-6 py-5 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-primary text-primary-foreground grid place-items-center font-bold">
                            AD
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-base font-semibold leading-tight">
                                Admin Panel
                            </h2>
                            <p className="text-xs text-muted-foreground leading-tight truncate">
                                {user?.email}
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="ml-auto lg:hidden"
                            aria-label="Fechar menu"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* navegação */}
                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item, i) => (
                        <NavItem
                            key={item.to}
                            {...item}
                            innerRef={i === 0 ? firstItemRef : undefined}
                        />
                    ))}
                </nav>

                {/* rodapé */}
                <div className="mt-auto p-4 border-t border-border">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 rounded-full bg-muted grid place-items-center text-sm font-semibold">
                            {initials}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium truncate">
                                {user?.email}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                                Logado
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-destructive hover:text-destructive"
                        onClick={handleLogout}
                    >
                        <LogOut className="h-5 w-5 mr-2" />
                        Sair
                    </Button>
                </div>
            </div>
        </aside>
    );
};
