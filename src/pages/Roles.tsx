import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Shield, Users } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";

interface Permission {
  module: string;
  view: boolean;
  edit: boolean;
  delete: boolean;
}

interface Role {
  id: number;
  name: string;
  organization: string;
  permissions: Permission[];
  usersCount: number;
  status: string;
}

const defaultPermissions: Permission[] = [
  { module: "Dashboard", view: true, edit: false, delete: false },
  { module: "Organizations", view: true, edit: false, delete: false },
  { module: "Users", view: true, edit: false, delete: false },
  { module: "Roles", view: true, edit: false, delete: false },
  { module: "Sessions", view: true, edit: false, delete: false },
  { module: "Avatars", view: true, edit: false, delete: false },
  { module: "Pre-call Plans", view: true, edit: false, delete: false },
  { module: "Guardrails", view: true, edit: false, delete: false },
  { module: "Evaluations", view: true, edit: false, delete: false },
  { module: "Documents", view: true, edit: false, delete: false },
];

const Roles = () => {
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [isViewSheetOpen, setIsViewSheetOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>(defaultPermissions);
  const [searchQuery, setSearchQuery] = useState("");
  const [orgFilter, setOrgFilter] = useState<string>("all");

  const organizations = [
    { id: 1, name: "TechCorp Solutions" },
    { id: 2, name: "HealthPlus Medical" },
    { id: 3, name: "InnovateTech Inc" },
  ];

  const roles: Role[] = [
    {
      id: 1,
      name: "Super Admin",
      organization: "All Organizations",
      permissions: defaultPermissions.map(p => ({ ...p, view: true, edit: true, delete: true })),
      usersCount: 3,
      status: "Active"
    },
    {
      id: 2,
      name: "Organization Admin",
      organization: "TechCorp Solutions",
      permissions: defaultPermissions.map(p => ({ ...p, view: true, edit: true, delete: false })),
      usersCount: 12,
      status: "Active"
    },
    {
      id: 3,
      name: "Session Manager",
      organization: "HealthPlus Medical",
      permissions: defaultPermissions.map((p, i) => ({ 
        ...p, 
        view: true, 
        edit: i === 4 || i === 5, // Sessions and Avatars
        delete: false 
      })),
      usersCount: 8,
      status: "Active"
    },
    {
      id: 4,
      name: "Content Viewer",
      organization: "TechCorp Solutions",
      permissions: defaultPermissions.map(p => ({ ...p, view: true, edit: false, delete: false })),
      usersCount: 45,
      status: "Active"
    },
    {
      id: 5,
      name: "Trainee",
      organization: "InnovateTech Inc",
      permissions: defaultPermissions.map((p, i) => ({ 
        ...p, 
        view: i === 0 || i === 4 || i === 5, // Dashboard, Sessions, Avatars
        edit: false, 
        delete: false 
      })),
      usersCount: 28,
      status: "Active"
    },
  ];

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setPermissions(role.permissions);
    setIsEditSheetOpen(true);
  };

  const handleViewRole = (role: Role) => {
    setSelectedRole(role);
    setIsViewSheetOpen(true);
  };

  const handlePermissionChange = (moduleIndex: number, permissionType: 'view' | 'edit' | 'delete', checked: boolean) => {
    setPermissions(prev => prev.map((p, i) => {
      if (i === moduleIndex) {
        const updated = { ...p, [permissionType]: checked };
        // If view is unchecked, uncheck edit and delete
        if (permissionType === 'view' && !checked) {
          updated.edit = false;
          updated.delete = false;
        }
        // If edit or delete is checked, ensure view is checked
        if ((permissionType === 'edit' || permissionType === 'delete') && checked) {
          updated.view = true;
        }
        return updated;
      }
      return p;
    }));
  };

  const resetPermissions = () => {
    setPermissions(defaultPermissions);
  };

  const handleOpenAddSheet = () => {
    resetPermissions();
    setIsAddSheetOpen(true);
  };

  const PermissionsTable = () => (
    <div className="border border-border/50 rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent bg-muted/30">
            <TableHead className="font-semibold">Module</TableHead>
            <TableHead className="font-semibold text-center w-20">View</TableHead>
            <TableHead className="font-semibold text-center w-20">Edit</TableHead>
            <TableHead className="font-semibold text-center w-20">Delete</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {permissions.map((permission, index) => (
            <TableRow key={permission.module} className="border-border/50">
              <TableCell className="font-medium">{permission.module}</TableCell>
              <TableCell className="text-center">
                <Checkbox 
                  checked={permission.view}
                  onCheckedChange={(checked) => handlePermissionChange(index, 'view', checked as boolean)}
                />
              </TableCell>
              <TableCell className="text-center">
                <Checkbox 
                  checked={permission.edit}
                  onCheckedChange={(checked) => handlePermissionChange(index, 'edit', checked as boolean)}
                />
              </TableCell>
              <TableCell className="text-center">
                <Checkbox 
                  checked={permission.delete}
                  onCheckedChange={(checked) => handlePermissionChange(index, 'delete', checked as boolean)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground tracking-tight">Role Management</h1>
            <p className="text-muted-foreground mt-2">Manage RBAC permissions and custom roles for organizations</p>
          </div>
          <Button 
            onClick={handleOpenAddSheet}
            className="bg-gradient-primary hover:shadow-glow transition-all duration-300 h-11 px-6"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Role
          </Button>
        </div>

        {/* Search & Filters */}
        <Card className="border-border/50 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search roles by name..." 
                  className="pl-10 h-11 bg-background border-border/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={orgFilter} onValueChange={setOrgFilter}>
                <SelectTrigger className="w-full md:w-[200px] h-11">
                  <SelectValue placeholder="Filter by organization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Organizations</SelectItem>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.name}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Roles List */}
        <Card className="border-border/50 shadow-sm">
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/50">
                  <TableHead className="font-semibold">Role Name</TableHead>
                  <TableHead className="font-semibold">Organization</TableHead>
                  <TableHead className="font-semibold">Users</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles
                  .filter((role) => {
                    const matchesSearch = role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      role.organization.toLowerCase().includes(searchQuery.toLowerCase());
                    const matchesOrg = orgFilter === "all" || role.organization === orgFilter || 
                      (orgFilter === "all" && role.organization === "All Organizations");
                    return matchesSearch && matchesOrg;
                  })
                  .map((role) => (
                  <TableRow key={role.id} className="border-border/50 hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        <p className="font-semibold text-foreground">{role.name}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{role.organization}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Users className="h-3.5 w-3.5" />
                        {role.usersCount}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={role.status === "Active" ? "default" : "secondary"}>
                        {role.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm" className="h-8" onClick={() => handleEditRole(role)}>
                          <Edit className="h-3.5 w-3.5 mr-1.5" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="h-8" onClick={() => handleViewRole(role)}>
                          View
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Add Role Sheet */}
        <Sheet open={isAddSheetOpen} onOpenChange={setIsAddSheetOpen}>
          <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto flex flex-col p-0">
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                <SheetHeader>
                  <SheetTitle className="text-2xl">Create Role</SheetTitle>
                  <SheetDescription>Define a new role with custom permissions</SheetDescription>
                </SheetHeader>
                
                <div className="space-y-6 py-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="role-name">Role Name *</Label>
                      <Input id="role-name" placeholder="Enter role name" required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="organization">Organization *</Label>
                      <Select>
                        <SelectTrigger id="organization">
                          <SelectValue placeholder="Select organization" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Organizations</SelectItem>
                          {organizations.map((org) => (
                            <SelectItem key={org.id} value={org.id.toString()}>
                              {org.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Permissions */}
                  <div className="space-y-4 border-t pt-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-foreground">Permissions</h3>
                      <Button variant="outline" size="sm" onClick={resetPermissions}>
                        Reset to Default
                      </Button>
                    </div>
                    <PermissionsTable />
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-between border-t pt-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="active-status">Active</Label>
                      <p className="text-sm text-muted-foreground">Enable this role</p>
                    </div>
                    <Switch id="active-status" defaultChecked />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer with Action Buttons */}
            <SheetFooter className="border-t bg-background p-6 mt-auto">
              <div className="flex gap-3 w-full">
                <Button variant="outline" className="flex-1" onClick={() => setIsAddSheetOpen(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 bg-gradient-primary">
                  Create Role
                </Button>
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {/* Edit Role Sheet */}
        <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
          <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto flex flex-col p-0">
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                <SheetHeader>
                  <SheetTitle className="text-2xl">Edit Role</SheetTitle>
                  <SheetDescription>Update role settings and permissions</SheetDescription>
                </SheetHeader>
                
                  {selectedRole && (
                  <div className="space-y-6 py-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-role-name">Role Name *</Label>
                        <Input id="edit-role-name" defaultValue={selectedRole.name} required />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-organization">Organization *</Label>
                        <Select defaultValue={selectedRole.organization === "All Organizations" ? "all" : "1"}>
                          <SelectTrigger id="edit-organization">
                            <SelectValue placeholder="Select organization" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Organizations</SelectItem>
                            {organizations.map((org) => (
                              <SelectItem key={org.id} value={org.id.toString()}>
                                {org.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Permissions */}
                    <div className="space-y-4 border-t pt-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-foreground">Permissions</h3>
                        <Button variant="outline" size="sm" onClick={resetPermissions}>
                          Reset to Default
                        </Button>
                      </div>
                      <PermissionsTable />
                    </div>

                    {/* Status */}
                    <div className="flex items-center justify-between border-t pt-4">
                      <div className="space-y-0.5">
                        <Label htmlFor="edit-active-status">Active</Label>
                        <p className="text-sm text-muted-foreground">Enable this role</p>
                      </div>
                      <Switch id="edit-active-status" defaultChecked={selectedRole.status === "Active"} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer with Action Buttons */}
            <SheetFooter className="border-t bg-background p-6 mt-auto">
              <div className="flex gap-3 w-full">
                <Button variant="outline" className="flex-1" onClick={() => setIsEditSheetOpen(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 bg-gradient-primary">
                  Save Changes
                </Button>
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {/* View Role Sheet */}
        <Sheet open={isViewSheetOpen} onOpenChange={setIsViewSheetOpen}>
          <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto flex flex-col p-0">
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                <SheetHeader>
                  <SheetTitle className="text-2xl">Role Details</SheetTitle>
                  <SheetDescription>View role information and permissions</SheetDescription>
                </SheetHeader>
                
                {selectedRole && (
                  <div className="space-y-6 py-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-muted-foreground text-sm">Role Name</Label>
                          <p className="font-medium">{selectedRole.name}</p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-muted-foreground text-sm">Organization</Label>
                          <p className="font-medium">{selectedRole.organization}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-muted-foreground text-sm">Users Assigned</Label>
                          <p className="font-medium">{selectedRole.usersCount}</p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-muted-foreground text-sm">Status</Label>
                          <div>
                            <Badge variant={selectedRole.status === "Active" ? "default" : "secondary"}>
                              {selectedRole.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Permissions (Read-only) */}
                    <div className="space-y-4 border-t pt-4">
                      <h3 className="text-lg font-semibold text-foreground">Permissions</h3>
                      <div className="border border-border/50 rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="hover:bg-transparent bg-muted/30">
                              <TableHead className="font-semibold">Module</TableHead>
                              <TableHead className="font-semibold text-center w-20">View</TableHead>
                              <TableHead className="font-semibold text-center w-20">Edit</TableHead>
                              <TableHead className="font-semibold text-center w-20">Delete</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedRole.permissions.map((permission) => (
                              <TableRow key={permission.module} className="border-border/50">
                                <TableCell className="font-medium">{permission.module}</TableCell>
                                <TableCell className="text-center">
                                  <Checkbox checked={permission.view} disabled />
                                </TableCell>
                                <TableCell className="text-center">
                                  <Checkbox checked={permission.edit} disabled />
                                </TableCell>
                                <TableCell className="text-center">
                                  <Checkbox checked={permission.delete} disabled />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <SheetFooter className="border-t bg-background p-6 mt-auto">
              <div className="flex gap-3 w-full">
                <Button variant="outline" className="flex-1" onClick={() => setIsViewSheetOpen(false)}>
                  Close
                </Button>
                <Button 
                  className="flex-1 bg-gradient-primary" 
                  onClick={() => {
                    setIsViewSheetOpen(false);
                    if (selectedRole) handleEditRole(selectedRole);
                  }}
                >
                  Edit Role
                </Button>
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </DashboardLayout>
  );
};

export default Roles;
