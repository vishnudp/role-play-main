import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Users, Building2, Bot, Calendar, CalendarCheck, FileText, UserCheck } from "lucide-react";

const Dashboard = () => {
  const stats = [
    { title: "Total Organisations", value: "24", icon: Building2 },
    { title: "Total Users", value: "1,456", icon: Users },
    { title: "Total Active Users", value: "1,234", icon: UserCheck },
    { title: "Total Avatars", value: "156", icon: Bot },
    { title: "Past Sessions", value: "2,847", icon: Calendar },
    { title: "Upcoming Sessions", value: "89", icon: CalendarCheck },
    { title: "Total Pre-call Plans", value: "42", icon: FileText },
  ];

  return (
    <DashboardLayout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Welcome back! Here's an overview of your platform.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.title} className="border-border/50 hover:shadow-lg transition-all duration-300 group">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription className="text-sm font-medium">{stat.title}</CardDescription>
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
