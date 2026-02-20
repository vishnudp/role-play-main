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
import { useEffect, useState } from "react";
import { fetchOrganizations, fetchRoles } from "../api/apiService";
import { fetchDocuments, fetchMetaData, uploadDocument, deleteDocument, fetchUsers, createRole, updateRoleApi, deleteRoleApi } from "../api/apiService";
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
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
interface Permission {
  module: string;
  [action: string]: boolean | string;
}

interface Role {
  id: number;
  name: string;
  organization: string;
  permissions: Permission[];
  usersCount: number;
  status: string;
}







const Roles = () => {
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [isViewSheetOpen, setIsViewSheetOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [orgFilter, setOrgFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [metaData, setMetaData] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [addDescription, setAddDescription] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [selectedOrgId, setSelectedOrgId] = useState<string>("all");
  

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        await fetchOrganizations()
          .then((orgs) => setOrganizations(Array.isArray(orgs) ? orgs : []))
          .catch(() => setOrganizations([]));
        await fetchRoles()
          .then((roles) => setRoles(Array.isArray(roles) ? roles : []))
          .catch(() => setRoles([]));
        await fetchMetaData()
          .then((meta) => {
            console.log("META RESPONSE:", meta); // 👈 add this
            setMetaData(meta);

            const dynamicPermissions = buildPermissionsFromMeta(meta);
            console.log("BUILT PERMISSIONS:", dynamicPermissions); // 👈 add this

            setPermissions(dynamicPermissions);
          })
          .catch(() => setMetaData(null));

      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const actionToBackendMap: Record<string, string> = {
    view: "READ",
    edit: "UPDATE",
    delete: "DELETE",
    create: "CREATE",
    upload: "UPLOAD", // if you have upload
  };

  const handleDeleteClick = (role: Role) => {
    setRoleToDelete(role);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteRole = async () => {
    if (!roleToDelete) return;

    try {
      await deleteRoleApi(roleToDelete.id); // your API call
      setRoles((prev) => prev.filter((r) => r.id !== roleToDelete.id)); // remove from UI
      setIsDeleteDialogOpen(false);
      setRoleToDelete(null);
      toast.success("Role deleted successfully");

    } catch (error) {
      console.error("Failed to delete role:", error);
      toast.error("Failed to delete role. Please try again.");
      // optionally show toast / alert
    }
  };

  const getViewPermissions = (role: Role | null) => {
    if (!metaData) return [];

    const allPermissions = buildPermissionsFromMeta(metaData, false); // all actions false

    if (!role || !role.permissions || !role.permissions.length) {
      // No permissions for role → return all permissions disabled
      return allPermissions.map((p) => {
        const disabledPerm = { ...p };
        Object.keys(disabledPerm).forEach((key) => {
          if (key !== "module") disabledPerm[key] = false;
        });
        return disabledPerm;
      });
    }

    // Role has some permissions → merge
    const granted = new Set(role.permissions.map((p: any) => p.permission.key));
    return allPermissions.map((p) => {
      const updated = { ...p };
      Object.keys(p).forEach((key) => {
        if (key === "module") return;
        const backendAction = actionToBackendMap[key] || key.toUpperCase();
        const permKey = `${p.module}_${backendAction}`;
        updated[key] = granted.has(permKey);
      });
      return updated;
    });
  };

  const getSelectedPermissionKeys = () => {
    const keys: string[] = [];
    permissions.forEach((p) => {
      Object.keys(p).forEach((action) => {
        if (action !== "module" && p[action]) {
          const backendAction = Object.entries(actionToBackendMap).find(([k]) => k === action)?.[1] || action.toUpperCase();
          keys.push(`${p.module}_${backendAction}`);
        }
      });
    });
    return keys;
  };

  const handleCreateRole = async () => {
    const roleName = (document.getElementById("role-name") as HTMLInputElement)?.value;

    if (!roleName) return toast.error("Role name is required");

    const payload = {
      name: roleName,
      description: addDescription,
      permissions: getSelectedPermissionKeys(),
      parent_id: selectedOrgId === "all" ? null : selectedOrgId, // use state here!
    };

    try {
      const newRole = await createRole(payload); // API call
      setRoles((prev) => [...prev, newRole]);
      setIsAddSheetOpen(false);
      setAddDescription("");
      setSelectedOrgId("all"); // reset
      toast.success("Role created successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create role");
    }
  };

  const handleSaveRole = async () => {
    if (!selectedRole) return;
    const roleName = (document.getElementById("edit-role-name") as HTMLInputElement)?.value;

    if (!roleName) return toast.error("Role name is required");

    const payload = {
      name: roleName,
      description: editDescription,
      permissions: getSelectedPermissionKeys(),
      parent_id: selectedOrgId === "all" ? null : selectedOrgId, // use state here too
    };

    try {
      const updatedRole = await updateRoleApi(selectedRole.id, payload); // API call
      setRoles((prev) => prev.map((r) => (r.id === selectedRole.id ? updatedRole : r)));
      setIsEditSheetOpen(false);
      toast.success("Role updated successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update role");
    }
  };

  const handleEditRole = (role: any) => {
    setSelectedRole(role);
    setEditDescription(role.description || "");
    setSelectedOrgId(
      role.organization === "All Organizations" ? "all" : role.parent_id
    );

    if (!metaData) return;

    // 1️⃣ Get all possible permissions from meta
    const allPermissions = buildPermissionsFromMeta(metaData);

    // 2️⃣ Mark the ones the role actually has
    const granted = new Set(role.permissions.map((p: any) => p.permission.key));// e.g. ["ORG_DOCUMENT_READ", "ORG_DOCUMENT_UPLOAD"]
    const mergedPermissions = allPermissions.map((p) => {
      const updated = { ...p };

      Object.keys(p).forEach((key) => {
        if (key === "module") return;

        const backendAction = actionToBackendMap[key] || key.toUpperCase();
        const permKey = `${p.module}_${backendAction}`; // e.g., USER_READ
        updated[key] = granted.has(permKey);
      });

      return updated;
    });

    setPermissions(mergedPermissions);
    setIsEditSheetOpen(true);
  };

  const handleViewRole = (role: Role) => {
    setSelectedRole(role);
    setIsViewSheetOpen(true);
  };

  const buildPermissionsFromMeta = (meta: any, defaultChecked = false): Permission[] => {
    const permissionsObject =
      meta?.data?.constants?.permissions || meta?.constants?.permissions;

    if (!permissionsObject) return [];

    const grouped: Record<string, Permission> = {};

    Object.keys(permissionsObject).forEach((key) => {
      const parts = key.split("_");
      const actionRaw = parts.pop(); // CREATE, READ, UPDATE, etc.
      const module = parts.join("_");

      if (!grouped[module]) {
        grouped[module] = { module }; // don't preselect anything
      }

      // normalize action name
      let action = actionRaw?.toLowerCase();
      if (action === "read") action = "view";
      if (action === "update") action = "edit";

      grouped[module][action!] = defaultChecked; // use flag
    });

    return Object.values(grouped);
  };
  const handlePermissionChange = (
    moduleIndex: number,
    permissionType: string,
    checked: boolean
  ) => {
    setPermissions((prev) =>
      prev.map((p, i) => {
        if (i === moduleIndex) {
          const updated = { ...p, [permissionType]: checked };

          // If view unchecked → disable everything else
          if (permissionType === "view" && !checked) {
            Object.keys(updated).forEach((key) => {
              if (key !== "module" && key !== "view") {
                updated[key] = false;
              }
            });
          }

          // Only auto-check view if edit is checked
          if (permissionType === "edit" && checked) {
            updated.view = true;
          }

          return updated;
        }
        return p;
      })
    );
  };
const resetPermissions = (mode: "add" | "edit", role?: Role) => {
  if (!metaData) return;

  if (mode === "add") {
    // For Add → reset all to false
    const regenerated = buildPermissionsFromMeta(metaData, false);
    setPermissions(regenerated);
    setAddDescription("");
    setSelectedOrgId("all");
    const roleInput = document.getElementById("role-name") as HTMLInputElement;
    if (roleInput) roleInput.value = "";
  } else if (mode === "edit" && role) {
    // For Edit → load role’s permissions
    const allPermissions = buildPermissionsFromMeta(metaData);
    const granted = new Set(role.permissions.map((p: any) => p.permission.key));
    const mergedPermissions = allPermissions.map((p) => {
      const updated = { ...p };
      Object.keys(p).forEach((key) => {
        if (key === "module") return;
        const backendAction = actionToBackendMap[key] || key.toUpperCase();
        const permKey = `${p.module}_${backendAction}`;
        updated[key] = granted.has(permKey);
      });
      return updated;
    });

    setPermissions(mergedPermissions);
    setEditDescription(role.description || "");
    setSelectedOrgId(role.parent_id?.toString() || "all");
    const roleInput = document.getElementById("edit-role-name") as HTMLInputElement;
    if (roleInput) roleInput.value = role.name;
  }
};

  const handleOpenAddSheet = () => {
    // Reset state
    resetPermissions('add');          // rebuild permissions from meta, all unchecked
    setAddDescription("");       // clear description
    setSelectedOrgId("all");     // reset org to default
    const roleNameInput = document.getElementById("role-name") as HTMLInputElement;
    if (roleNameInput) roleNameInput.value = ""; // clear role name input

    setIsAddSheetOpen(true);
  };
  const formatModuleName = (name?: string) => {
    if (!name) return "-";

    return name
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const normalizeRolePermissions = (rolePermissions: any[]): Permission[] => {
    const grouped: Record<string, Permission> = {};

    const actionMap: Record<string, string> = {
      READ: "view",
      UPDATE: "edit",
      DELETE: "delete",
      CREATE: "create",
      UPLOAD: "upload",
    };

    rolePermissions.forEach((p) => {
      const keyParts = p.permission.key.split("_"); // e.g., "USER_READ"
      const actionRaw = keyParts.pop(); // READ
      const module = keyParts.join("_"); // USER

      const action = actionMap[actionRaw as string] || actionRaw?.toLowerCase();

      if (!grouped[module]) {
        grouped[module] = { module };
      }

      grouped[module][action!] = true;
    });

    return Object.values(grouped);
  };


  const PermissionsTable = () => {
    if (!permissions.length) {
      return (
        <div className="p-6 text-center text-muted-foreground">
          No permissions available
        </div>
      );
    }

    const actionKeys = Array.from(
      new Set(
        permissions.flatMap((p) =>
          Object.keys(p).filter((key) => key !== "module")
        )
      )
    );

    const formatLabel = (label: string) =>
      label.charAt(0).toUpperCase() + label.slice(1);



    return (
      <div className="border border-border/50 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent bg-muted/30">
              <TableHead className="font-semibold">Module</TableHead>
              {actionKeys.map((action) => (
                <TableHead
                  key={action}
                  className="font-semibold text-center w-20"
                >
                  {formatLabel(action)}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {permissions.map((permission, index) => (
              <TableRow key={permission.module}>
                <TableCell className="font-medium">
                  {formatModuleName(permission.module)}
                </TableCell>

                {actionKeys.map((action) => (
                  <TableCell key={action} className="text-center">
                    <Checkbox
                      checked={(permission as any)[action] ?? false}
                      onCheckedChange={(checked) =>
                        handlePermissionChange(
                          index,
                          action as any,
                          checked as boolean
                        )
                      }
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

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
                    const matchesSearch = role.name.toLowerCase().includes(searchQuery?.toLowerCase()) ||
                      getOrganizationName(organizations, role.parent_id).toLowerCase().includes(searchQuery?.toLowerCase());
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
                      <TableCell className="text-sm text-muted-foreground">{getOrganizationName(organizations, role.parent_id)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Users className="h-3.5 w-3.5" />
                          {role.user_count}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={role.is_active ? "default" : "secondary"}>
                          {role.is_active ? "Active" : "Inactive"}
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
                          <Button variant="destructive" size="sm" className="h-8" onClick={() => handleDeleteClick(role)}>
                            Delete
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
                    {/* Description */}
                    <div className="space-y-2">
                      <Label htmlFor="role-description">Description</Label>
                      <Input
                        id="role-description"
                        placeholder="Enter role description"
                        value={addDescription}
                        onChange={(e) => setAddDescription(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="organization">Organization *</Label>
                      <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
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
                      <Button variant="outline" size="sm" onClick={() => resetPermissions("add")}>
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
                <Button className="flex-1 bg-gradient-primary" onClick={handleCreateRole}>
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
                      {/* Description */}
                      <div className="space-y-2">
                        <Label htmlFor="edit-role-description">Description</Label>
                        <Input
                          id="edit-role-description"
                          placeholder="Enter role description"
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-organization">Organization * </Label>
                        <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
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
                        <Button variant="outline" size="sm" onClick={() => resetPermissions("edit", selectedRole!)}>
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
                <Button className="flex-1 bg-gradient-primary" onClick={handleSaveRole}>
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
                          <p className="font-medium">{getOrganizationName(organizations, selectedRole.parent_id)}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-muted-foreground text-sm">Users Assigned</Label>
                          <p className="font-medium">{selectedRole.user_count}</p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-muted-foreground text-sm">Status</Label>
                          <div>
                            <Badge variant={selectedRole.is_active ? "default" : "secondary"}>
                              {selectedRole.is_active ? "Active" : "Inactive"}
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
                              <TableHead className="font-semibold text-center w-20">Create</TableHead>
                              <TableHead className="font-semibold text-center w-20">View</TableHead>
                              <TableHead className="font-semibold text-center w-20">Edit</TableHead>
                              <TableHead className="font-semibold text-center w-20">Delete</TableHead>
                              <TableHead className="font-semibold text-center w-20">Upload</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {getViewPermissions(selectedRole).map((permission) => (
                              <TableRow key={permission.module} className="border-border/50">
                                <TableCell className="font-medium">{formatModuleName(permission.module)}</TableCell>
                                <TableCell className="text-center">
                                  <Checkbox checked={permission.create ?? false} disabled />
                                </TableCell>
                                <TableCell className="text-center">
                                  <Checkbox checked={permission.view ?? false} disabled />
                                </TableCell>
                                <TableCell className="text-center">
                                  <Checkbox checked={permission.edit ?? false} disabled />
                                </TableCell>
                                <TableCell className="text-center">
                                  <Checkbox checked={permission.delete ?? false} disabled />
                                </TableCell>
                                <TableCell className="text-center">
                                  <Checkbox checked={permission.upload ?? false} disabled />
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
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the role "{roleToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteRole}>
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default Roles;
