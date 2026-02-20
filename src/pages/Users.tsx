import { useEffect, useState } from "react";
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
import { fetchOrganizations } from "../api/apiService";
import { fetchDocuments, uploadDocument, deleteDocument, fetchUsers, fetchRoles, addUser, updateUserAPi, deleteUserApi, fetchRolePlays } from "../api/apiService";
import { getOrganizationName, getUserName, formatToLongDate, formatFileSize, handleView, handleDownload } from "../lib/lookupUtils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
interface User {
  id: string;
  name: string;
  email: string;
  organization: string;
  role: {
    "id": string,
    "name": string,
    "key": string,
    "description": string,
    "is_system": string,
    "parent_id": string,
    "created_at": string,
    "updated_at": string,
    "created_by": string | null,
    "updated_by": string | null
  };
  is_active: boolean;
  userType: "Admin" | "Mobile";
  password?: string;
  loginUsername?: string;
}

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([

  ]);

  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [rolePlays, setRolePlays] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOrganization, setFilterOrganization] = useState("");
  const [filterRole, setFilterRole] = useState("");
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

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        await fetchOrganizations()
          .then((orgs) => setOrganizations(Array.isArray(orgs) ? orgs : []))
          .catch(() => setOrganizations([]));
        await fetchDocuments()
          .then((docs) => setDocuments(Array.isArray(docs) ? docs : []))
          .catch(() => setDocuments([]));
        await fetchRoles()
          .then((roles) => setRoles(Array.isArray(roles) ? roles : []))
          .catch(() => setRoles([]));
        await fetchRolePlays()
          .then((rolePlays) => setRolePlays(Array.isArray(rolePlays) ? rolePlays : []))
          .catch(() => setRolePlays([]));
        await fetchUsers()
          .then((users) => setUsers(Array.isArray(users) ? users : []))
          .catch(() => setUsers([]));
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();

    const searchMatch =
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      getOrganizationName(organizations, user.parent.id).toLowerCase().includes(query);

    const orgMatch = filterOrganization ? user.organization === filterOrganization : true;
    const roleMatch = filterRole ? user.role.id === filterRole : true;

    return searchMatch && orgMatch && roleMatch;
  });

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.role || !newUser.userType) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!newUser.password) {
      toast.error("Password is required");
      return;
    }

    try {
      const payload = {
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        role_id: newUser.role,
        role_type: newUser.userType === "Admin" ? "ADMIN" : "MOBILE",
        parent_id: newUser.organization, // assuming org admin id
        is_active: newUser.status === "Active"
      };

      const createdUser = await addUser(payload);

      setUsers(prev => [...prev, createdUser]);

      setIsAddSheetOpen(false);
      setNewUser({
        name: "",
        email: "",
        organization: "",
        role: "",
        status: "Active",
        userType: "",
        password: "",
        loginUsername: ""
      });

      toast.success("User created successfully");
    } catch (error) {
      toast.error("Failed to create user");
    }
  };


  const handleEditUser = async () => {
    if (!selectedUser) return;

    if (!editUser.name || !editUser.email || !editUser.role || !editUser.userType) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      const payload: any = {
        name: editUser.name,
        email: editUser.email,
        role_id: editUser.role,
        role_type: editUser.userType === "Admin" ? "ADMIN" : "MOBILE",
        parent_id: editUser.organization,
        is_active: editUser.status === "Active"
      };

      if (editUser.password) {
        payload.password = editUser.password;
      }

      const updatedUser = await updateUserAPi(selectedUser.id, payload);

      setUsers(prev =>
        prev.map(u => (u.id === selectedUser.id ? updatedUser : u))
      );

      setIsEditSheetOpen(false);
      setSelectedUser(null);

      toast.success("User updated successfully");
    } catch (error) {
      toast.error("Failed to update user");
    }
  };


  const handleDeleteUser = async () => {
    if (!deleteUserId) return;

    try {
      await deleteUserApi(deleteUserId);

      setUsers(prev => prev.filter(u => u.id !== deleteUserId));
      setDeleteUserId(null);

      toast.success("User deleted successfully");
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  const openEditSheet = (user: User) => {
    setSelectedUser(user);
    setEditUser({
      name: user.name,
      email: user.email,
      organization: user.organization_id || "",
      role: user.role_id || "",
      status: user.is_active ? "Active" : "Inactive",
      userType: user.role_type === "ADMIN" ? "Admin" : "Mobile",
      loginUsername: user.email || "",  // ✅ map email
      password: "" // ✅ NEVER populate hashed password
    });
    setIsEditSheetOpen(true);
  };

  const getRoleBadgeVariant = (role: string) => {
    if (role === "Super Admin" || role === "Org Admin") return "default";
    if (role === "Trainer" || role === "Evaluator") return "secondary";
    return "outline";
  };

  // const organizations = ["TechCorp", "HealthPlus", "MediCare", "PharmaCo"];
  // const roles = ["Super Admin", "Org Admin", "Doctor", "Sales Rep", "Healthcare Worker", "Trainer", "Evaluator"];

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
            {/* <Button variant="outline" className="h-11 border-border/50">
              <Upload className="h-4 w-4 mr-2" />
              Bulk Upload
            </Button> */}
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
                  <p className="text-sm text-muted-foreground font-medium">Active Role Plays</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{fetchRolePlays.length}</p>
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
                  <p className="text-3xl font-bold text-foreground mt-2">{organizations.length}</p>
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
                <Input placeholder="Search users by name, email, or organization..." className="pl-10 h-11 bg-background border-border/50"
                  value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <Select value={filterOrganization} onValueChange={setFilterOrganization}>
                <SelectTrigger className="h-11 bg-background border-border/50">
                  <SelectValue placeholder="Filter by Organization" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="h-11 bg-background border-border/50">
                  <SelectValue placeholder="Filter by Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
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
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border-2 border-border/50">
                            {/* <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} /> */}
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
                          <span className="font-medium text-foreground">{user?.organization}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="font-normal">
                          {user.role_type === "Super Admin" || user.role_type === "Org Admin" ? "Admin" : "Mobile App"}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant={getRoleBadgeVariant(user.role_type)}>
                          {user.role_type}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant={user.is_active ? "default" : "secondary"} className="font-normal">
                          {user.is_active ? "Active" : "Inactive"}
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
                              {/* <DropdownMenuItem>View Profile</DropdownMenuItem>
                              <DropdownMenuItem>Change Role</DropdownMenuItem>
                              <DropdownMenuItem>Reset Password</DropdownMenuItem> */}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem
                                    onSelect={(e) => {
                                      e.preventDefault();
                                      setDeleteUserId(user.id);
                                    }}
                                    className="text-destructive"
                                  >
                                    Delete
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>

                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will permanently delete the user.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>

                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={handleDeleteUser}
                                      className="bg-destructive text-white hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>

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
                    <SelectItem key={org?.id} value={org?.id}>{org?.name}</SelectItem>
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
                    <SelectItem key={role?.id} value={role?.id}>{role?.name}</SelectItem>
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
                    <SelectItem key={org?.id} value={org?.id}>{org?.name}</SelectItem>
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
                    <SelectItem key={role?.id} value={role?.id}>{role?.name}</SelectItem>
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
