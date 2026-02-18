import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Search, MoreVertical, Mail, Building2, Upload, Shield, Users } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  organization: string;
  role: string;
  status: string;
  userType: "Admin" | "Mobile";
  password?: string;
  loginUsername?: string;
}

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      name: "Sarah Johnson",
      email: "sarah.j@techcorp.com",
      organization: "TechCorp",
      role: "Super Admin",
      status: "Active",
      userType: "Admin"
    },
    {
      id: "2",
      name: "Mike Chen",
      email: "mike.c@healthplus.com",
      organization: "HealthPlus",
      role: "Org Admin",
      status: "Active",
      userType: "Admin"
    },
    {
      id: "3",
      name: "Emma Wilson",
      email: "emma.w@techcorp.com",
      organization: "TechCorp",
      role: "Doctor",
      status: "Active",
      userType: "Mobile",
      loginUsername: "emma.wilson"
    },
    {
      id: "4",
      name: "James Brown",
      email: "james.b@healthplus.com",
      organization: "HealthPlus",
      role: "Sales Rep",
      status: "Inactive",
      userType: "Mobile",
      loginUsername: "james.brown"
    },
    {
      id: "5",
      name: "Lisa Anderson",
      email: "lisa.a@techcorp.com",
      organization: "TechCorp",
      role: "Healthcare Worker",
      status: "Active",
      userType: "Mobile",
      loginUsername: "lisa.anderson"
    },
  ]);

  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form state for add
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    organization: "",
    role: "",
    status: "Active",
    userType: "" as "Admin" | "Mobile" | "",
    password: "",
    loginUsername: ""
  });

  // Form state for edit
  const [editUser, setEditUser] = useState({
    name: "",
    email: "",
    organization: "",
    role: "",
    status: "Active",
    userType: "" as "Admin" | "Mobile" | "",
    password: "",
    loginUsername: ""
  });

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email || !newUser.organization || !newUser.role || !newUser.userType) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate based on user type
    if (newUser.userType === "Admin" && !newUser.password) {
      toast.error("Password is required for Admin users");
      return;
    }
    if (newUser.userType === "Mobile" && (!newUser.loginUsername || !newUser.password)) {
      toast.error("Login Username and Password are required for Mobile users");
      return;
    }

    const user: User = {
      id: Date.now().toString(),
      name: newUser.name,
      email: newUser.email,
      organization: newUser.organization,
      role: newUser.role,
      status: newUser.status,
      userType: newUser.userType as "Admin" | "Mobile",
      password: newUser.password,
      loginUsername: newUser.loginUsername
    };

    setUsers([...users, user]);
    setNewUser({ name: "", email: "", organization: "", role: "", status: "Active", userType: "", password: "", loginUsername: "" });
    setIsAddSheetOpen(false);
    toast.success("User added successfully");
  };

  const handleEditUser = () => {
    if (!selectedUser) return;
    
    if (!editUser.name || !editUser.email || !editUser.organization || !editUser.role || !editUser.userType) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate based on user type
    if (editUser.userType === "Admin" && !editUser.password) {
      toast.error("Password is required for Admin users");
      return;
    }
    if (editUser.userType === "Mobile" && (!editUser.loginUsername || !editUser.password)) {
      toast.error("Login Username and Password are required for Mobile users");
      return;
    }

    setUsers(users.map(u => 
      u.id === selectedUser.id 
        ? { 
            ...u, 
            name: editUser.name,
            email: editUser.email,
            organization: editUser.organization,
            role: editUser.role,
            status: editUser.status,
            userType: editUser.userType as "Admin" | "Mobile",
            password: editUser.password,
            loginUsername: editUser.loginUsername
          }
        : u
    ));
    setIsEditSheetOpen(false);
    setSelectedUser(null);
    toast.success("User updated successfully");
  };

  const openEditSheet = (user: User) => {
    setSelectedUser(user);
    setEditUser({
      name: user.name,
      email: user.email,
      organization: user.organization,
      role: user.role,
      status: user.status,
      userType: user.userType,
      password: user.password || "",
      loginUsername: user.loginUsername || ""
    });
    setIsEditSheetOpen(true);
  };

  const getRoleBadgeVariant = (role: string) => {
    if (role === "Super Admin" || role === "Org Admin") return "default";
    if (role === "Trainer" || role === "Evaluator") return "secondary";
    return "outline";
  };

  const organizations = ["TechCorp", "HealthPlus", "MediCare", "PharmaCo"];
  const roles = ["Super Admin", "Org Admin", "Doctor", "Sales Rep", "Healthcare Worker", "Trainer", "Evaluator"];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground tracking-tight">User Management</h1>
            <p className="text-muted-foreground mt-2">Manage users, roles, and permissions across organizations</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="h-11 border-border/50">
              <Upload className="h-4 w-4 mr-2" />
              Bulk Upload
            </Button>
            <Button 
              className="bg-gradient-primary hover:shadow-glow transition-all duration-300 h-11 px-6"
              onClick={() => setIsAddSheetOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-border/50 hover:shadow-md transition-all">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Total Users</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{users.length}</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 hover:shadow-md transition-all">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Active Sessions</p>
                  <p className="text-3xl font-bold text-foreground mt-2">342</p>
                </div>
                <div className="p-3 bg-success/10 rounded-lg">
                  <Shield className="h-6 w-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 hover:shadow-md transition-all">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Organizations</p>
                  <p className="text-3xl font-bold text-foreground mt-2">24</p>
                </div>
                <div className="p-3 bg-accent/10 rounded-lg">
                  <Building2 className="h-6 w-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-border/50 shadow-sm">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search users by name, email, or organization..." className="pl-10 h-11 bg-background border-border/50" />
              </div>
              <Select>
                <SelectTrigger className="h-11 bg-background border-border/50">
                  <SelectValue placeholder="Filter by Organization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Organizations</SelectItem>
                  <SelectItem value="techcorp">TechCorp</SelectItem>
                  <SelectItem value="healthplus">HealthPlus</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="h-11 bg-background border-border/50">
                  <SelectValue placeholder="Filter by Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="sales">Sales Rep</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="border-border/50 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/30 border-b border-border/50">
                  <tr>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">User</th>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Organization</th>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Role Type</th>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Role</th>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Status</th>
                    <th className="text-right p-4 text-sm font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border-2 border-border/50">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} />
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-foreground">{user.name}</p>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-sm">
                          <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-medium text-foreground">{user.organization}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="font-normal">
                          {user.role === "Super Admin" || user.role === "Org Admin" ? "Admin" : "Mobile App"}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant={user.status === "Active" ? "default" : "secondary"} className="font-normal">
                          {user.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 text-xs hover:bg-primary/10 hover:text-primary"
                            onClick={() => openEditSheet(user)}
                          >
                            Edit
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View Profile</DropdownMenuItem>
                              <DropdownMenuItem>Change Role</DropdownMenuItem>
                              <DropdownMenuItem>Reset Password</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">Deactivate</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add User Sheet */}
      <Sheet open={isAddSheetOpen} onOpenChange={setIsAddSheetOpen}>
        <SheetContent className="sm:max-w-lg flex flex-col">
          <SheetHeader>
            <SheetTitle>Add New User</SheetTitle>
            <SheetDescription>Create a new user account with role assignment</SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto space-y-6 py-6">
            <div className="space-y-2">
              <Label htmlFor="add-userType">User Type *</Label>
              <Select
                value={newUser.userType}
                onValueChange={(value) => setNewUser({ ...newUser, userType: value as "Admin" | "Mobile", password: "", loginUsername: "" })}
              >
                <SelectTrigger id="add-userType">
                  <SelectValue placeholder="Select user type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Mobile">Mobile</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-name">Full Name *</Label>
              <Input
                id="add-name"
                placeholder="Enter full name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-email">Email Address *</Label>
              <Input
                id="add-email"
                type="email"
                placeholder="Enter email address"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-organization">Organization *</Label>
              <Select
                value={newUser.organization}
                onValueChange={(value) => setNewUser({ ...newUser, organization: value })}
              >
                <SelectTrigger id="add-organization">
                  <SelectValue placeholder="Select organization" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org} value={org}>{org}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-role">Role *</Label>
              <Select
                value={newUser.role}
                onValueChange={(value) => setNewUser({ ...newUser, role: value })}
              >
                <SelectTrigger id="add-role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {newUser.userType === "Admin" && (
              <div className="space-y-2">
                <Label htmlFor="add-password">Password *</Label>
                <Input
                  id="add-password"
                  type="password"
                  placeholder="Enter password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                />
              </div>
            )}
            {newUser.userType === "Mobile" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="add-loginUsername">Login Username *</Label>
                  <Input
                    id="add-loginUsername"
                    placeholder="Enter login username"
                    value={newUser.loginUsername}
                    onChange={(e) => setNewUser({ ...newUser, loginUsername: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-mobile-password">Password *</Label>
                  <Input
                    id="add-mobile-password"
                    type="password"
                    placeholder="Enter password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  />
                </div>
              </>
            )}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Active Status</Label>
                <p className="text-sm text-muted-foreground">User can access the platform</p>
              </div>
              <Switch
                checked={newUser.status === "Active"}
                onCheckedChange={(checked) => setNewUser({ ...newUser, status: checked ? "Active" : "Inactive" })}
              />
            </div>
          </div>
          <SheetFooter className="border-t pt-4 mt-auto">
            <Button variant="outline" onClick={() => setIsAddSheetOpen(false)}>Cancel</Button>
            <Button onClick={handleAddUser}>Add User</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Edit User Sheet */}
      <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
        <SheetContent className="sm:max-w-lg flex flex-col">
          <SheetHeader>
            <SheetTitle>Edit User</SheetTitle>
            <SheetDescription>Update user information and role assignment</SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto space-y-6 py-6">
            <div className="space-y-2">
              <Label htmlFor="edit-userType">User Type *</Label>
              <Select
                value={editUser.userType}
                onValueChange={(value) => setEditUser({ ...editUser, userType: value as "Admin" | "Mobile", password: "", loginUsername: "" })}
              >
                <SelectTrigger id="edit-userType">
                  <SelectValue placeholder="Select user type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Mobile">Mobile</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name *</Label>
              <Input
                id="edit-name"
                placeholder="Enter full name"
                value={editUser.name}
                onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email Address *</Label>
              <Input
                id="edit-email"
                type="email"
                placeholder="Enter email address"
                value={editUser.email}
                onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-organization">Organization *</Label>
              <Select
                value={editUser.organization}
                onValueChange={(value) => setEditUser({ ...editUser, organization: value })}
              >
                <SelectTrigger id="edit-organization">
                  <SelectValue placeholder="Select organization" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org} value={org}>{org}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role *</Label>
              <Select
                value={editUser.role}
                onValueChange={(value) => setEditUser({ ...editUser, role: value })}
              >
                <SelectTrigger id="edit-role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {editUser.userType === "Admin" && (
              <div className="space-y-2">
                <Label htmlFor="edit-password">Password *</Label>
                <Input
                  id="edit-password"
                  type="password"
                  placeholder="Enter password"
                  value={editUser.password}
                  onChange={(e) => setEditUser({ ...editUser, password: e.target.value })}
                />
              </div>
            )}
            {editUser.userType === "Mobile" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="edit-loginUsername">Login Username *</Label>
                  <Input
                    id="edit-loginUsername"
                    placeholder="Enter login username"
                    value={editUser.loginUsername}
                    onChange={(e) => setEditUser({ ...editUser, loginUsername: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-mobile-password">Password *</Label>
                  <Input
                    id="edit-mobile-password"
                    type="password"
                    placeholder="Enter password"
                    value={editUser.password}
                    onChange={(e) => setEditUser({ ...editUser, password: e.target.value })}
                  />
                </div>
              </>
            )}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Active Status</Label>
                <p className="text-sm text-muted-foreground">User can access the platform</p>
              </div>
              <Switch
                checked={editUser.status === "Active"}
                onCheckedChange={(checked) => setEditUser({ ...editUser, status: checked ? "Active" : "Inactive" })}
              />
            </div>
          </div>
          <SheetFooter className="border-t pt-4 mt-auto">
            <Button variant="outline" onClick={() => setIsEditSheetOpen(false)}>Cancel</Button>
            <Button onClick={handleEditUser}>Update User</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  );
};

export default UsersPage;
