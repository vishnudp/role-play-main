// src/layouts/DashboardLayout.tsx
import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { logout } from "@/api/apiClient";
import {
  LayoutDashboard,
  Users,
  Building2,
  Clock,
  Bot,
  ClipboardList,
  Shield,
  ShieldCheck,
  BarChart3,
  FileText,
  LogOut,
  Settings,
  FolderTree,
  Target,
  ChevronDown
} from "lucide-react";

// Import shadcn/ui Dialog components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PERMISSIONS } from '@/constants/permissions';
import { usePermission } from "@/hooks/usePermission";

interface DashboardLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, permission: PERMISSIONS.USER_READ },
  { name: "Organizations", href: "/organizations", icon: Building2, permission: PERMISSIONS.ORG_READ },
  { name: "Role Management", href: "/roles", icon: Shield, permission: PERMISSIONS.ROLE_READ },
  { name: "User Management", href: "/users", icon: Users, permission: PERMISSIONS.USER_READ },
  { name: "Categories", href: "/categories", icon: FolderTree, permission: PERMISSIONS.CATEGORY_READ },
  { name: "Roleplays", href: "/role-plays", icon: Clock, permission: PERMISSIONS.ROLEPLAY_READ },
  { name: "Assignment", href: "/assignment", icon: Target, permission: PERMISSIONS.ASSIGNMENT_READ },
  { name: "Avatar Builder", href: "/avatars", icon: Bot, permission: PERMISSIONS.AVATAR_READ },
  { name: "Pre-call Plans", href: "/precall-plans", icon: ClipboardList, permission: PERMISSIONS.PRE_CALL_PLAN_READ },
  { name: "Guardrails", href: "/guardrails", icon: ShieldCheck, permission: PERMISSIONS.GUARDRAIL_READ },
  { name: "Documents", href: "/documents", icon: FileText, permission: PERMISSIONS.DOCUMENT_READ },
  { name: "Certifications", href: "/certifications", icon: FileText, permission: PERMISSIONS.CERTIFICATION_READ },
];

const settingsRoutes = [
  {
    name: "Avatar Configuration",
    href: "/avatar-configuration",
    permission: PERMISSIONS.AVATAR_CONFIG_READ,
  },
];

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { can } = usePermission();
  const location = useLocation();
  const navigate = useNavigate();

   // Filter navigation items based on permission
  const accessibleNav = navigation.filter((item) => !item.permission || can(item.permission));

  const accessibleSettings = settingsRoutes.filter(
  (item) => !item.permission || can(item.permission)
);

const allAccessibleRoutes = [...accessibleNav, ...accessibleSettings];

  // Redirect on initial load if current path is not accessible
  useEffect(() => {
    if (allAccessibleRoutes.length === 0) return; // no accessible routes

    const currentAccessible = allAccessibleRoutes.find((item) => location.pathname.startsWith(item.href));
    if (!currentAccessible) {
      // Redirect to the first accessible route
      navigate(allAccessibleRoutes[0].href, { replace: true });
    }
  }, [allAccessibleRoutes, location.pathname, navigate]);

  // Dialog state
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Logout handler
  const handleLogout = async () => {
    try {
      setLoading(true);
      const result = await logout(); // call apiClient logout
      if (result) {
        navigate("/login");
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
        <div className="p-6 border-b border-sidebar-border">
          <Logo size="md" className="text-sidebar-foreground" />
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navigation.map((item: any) => {
            if (item.permission && !can(item.permission)) return null;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer: Settings + Logout */}
        <div className="p-4 border-t border-sidebar-border space-y-1">
          {/* Settings main item */}
          <button
            type="button"
            onClick={() => setSettingsOpen(!settingsOpen)}
            className="w-full flex justify-between items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <Settings className="h-5 w-5" />
              Settings
            </div>
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                settingsOpen ? "rotate-180" : "rotate-0"
              )}
            />
          </button>

          {/* Submenu items */}
          {settingsOpen && (
            <div className="pl-10 flex flex-col gap-1">
              {/* Only show if user has ROLE_CREATE or ORG_CREATE permission */}
              {can(PERMISSIONS.AVATAR_CONFIG_READ) && (
                <Link
                  to="/avatar-configuration"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-all duration-200"
                >
                  Avatar Configuration
                </Link>
              )}
              {/* Add more submenu items here with similar permission checks */}
            </div>
          )}


          {/* React Dialog Logout */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              >
                <LogOut className="h-5 w-5" />
                Logout
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Logout</DialogTitle>
                <DialogDescription>
                  Are you sure you want to logout from your account?
                </DialogDescription>
              </DialogHeader>

              <DialogFooter className="gap-2 sm:justify-end">
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleLogout}
                  disabled={loading}
                >
                  {loading ? "Logging out..." : "Logout"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
};

export default DashboardLayout;
