import {
  LayoutDashboard, UserPlus, Stethoscope, FlaskConical, Pill,
  FileText, Syringe, Receipt, Package, CalendarDays, LogOut, PawPrint
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const allItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, roles: ["doctor", "receptionist"] },
  { title: "Registration", url: "/registration", icon: UserPlus, roles: ["doctor", "receptionist"] },
  { title: "Clinical Exam", url: "/clinical-exam", icon: Stethoscope, roles: ["doctor"] },
  { title: "Diagnosis & Tests", url: "/diagnosis", icon: FlaskConical, roles: ["doctor"] },
  { title: "Treatment", url: "/treatment", icon: Pill, roles: ["doctor"] },
  { title: "Prescription", url: "/prescription", icon: FileText, roles: ["doctor"] },
  { title: "Vaccination", url: "/vaccination", icon: Syringe, roles: ["doctor", "receptionist"] },
  { title: "Billing", url: "/billing", icon: Receipt, roles: ["doctor", "receptionist"] },
  { title: "Stock", url: "/stock", icon: Package, roles: ["doctor", "receptionist"] },
  { title: "Appointments", url: "/appointments", icon: CalendarDays, roles: ["doctor", "receptionist"] },
];

export function AppSidebar() {
  const { signOut } = useAuth();
  const { role } = useRole();

  const items = allItems.filter((i) => !role || i.roles.includes(role));

  return (
    <Sidebar className="w-60 border-r-0">
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary">
          <PawPrint className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-sidebar-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
            Royal Pet Clinic
          </h2>
          <p className="text-xs text-sidebar-foreground/60 capitalize">{role ?? "Staff"}</p>
        </div>
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 text-xs uppercase tracking-wider">
            Modules
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-semibold"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={signOut}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
