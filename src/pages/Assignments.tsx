import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit, Trash2, Calendar, Clock, Check, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { fetchDocuments, uploadDocument, deleteDocument, fetchUsers, fetchOrganizations, fetchAssignment, fetchCertificate, createAssignment, updateAssignmentApi, deleteAssignment, fetchRolePlays } from "../api/apiService";
import { getOrganizationName, getUserName, formatToLongDate, formatFileSize, handleView, handleDownload } from "../lib/lookupUtils";

interface Assignment {
  id: number;
  name: string;
  sessionId: number;
  sessionName: string;
  dueDate: string;
  dueTime: string;
  status: "Pending" | "In Progress" | "Completed" | "Overdue";
  assignedUsers: string[];
  organization: string;
}

interface Session {
  id: number;
  name: string;
  organization: string;
}

interface User {
  id: string;
  name: string;
  organization: string;
}

interface AssignmentFormProps {
  isEdit?: boolean;
  formData: typeof formData;
  setFormData: React.Dispatch<React.SetStateAction<typeof formData>>;
  assignmentType: "ROLE_PLAY" | "CERTIFICATE";
  setAssignmentType: React.Dispatch<React.SetStateAction<"ROLE_PLAY" | "CERTIFICATE">>;
  selectedOrganization: string;
  setSelectedOrganization: React.Dispatch<React.SetStateAction<string>>;
  users: User[];
  rolePlays: any[];
  certificates: any[];
  filteredRolePlays: any[];      // <-- ADD
  filteredCertificates: any[];
  organizations: any[];  // <-- ADD THIS
  getFilteredUsers: () => User[];
}

const AssignmentForm = ({
  isEdit = false,
  formData,
  setFormData,
  assignmentType,
  setAssignmentType,
  selectedOrganization,
  setSelectedOrganization,
  users,
  rolePlays,
  certificates,
  filteredRolePlays,
  filteredCertificates,
  organizations,
  getFilteredUsers
}: AssignmentFormProps) => {
  // copy all the JSX here
  // replace all references to `formData`, `setFormData`, `assignmentType`, etc. with the props
  const filteredUsers = getFilteredUsers();
  const allSelected = filteredUsers.length > 0 && formData.assignedUsers.length === filteredUsers.length;

  return (
    <div className="space-y-6 py-6">
      {/* Assignment Name */}
      <div className="space-y-2">
        <Label htmlFor="assignmentName">Assignment Name <span className="text-destructive">*</span></Label>
        <Input
          id="assignmentName"
          placeholder="Enter assignment name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="h-11 bg-background border-border/50"
        />
      </div>

      {/* Organization */}
      <div className="space-y-2">
        <Label>Organization <span className="text-destructive">*</span></Label>
        <Select
          value={selectedOrganization}
          onValueChange={(value) => setSelectedOrganization(value)}
        >
          <SelectTrigger className="h-11 bg-background border-border/50">
            <SelectValue placeholder="Select organization" />
          </SelectTrigger>
          <SelectContent className="bg-background z-50">
            {organizations.map(org => (
              <SelectItem key={org.id} value={org.id}>
                {org.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Toggle Roleplay / Certificate */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={assignmentType === "ROLE_PLAY" ? "default" : "outline"}
          onClick={() => setAssignmentType("ROLE_PLAY")}
          className="flex-1"
        >
          Roleplay
        </Button>
        <Button
          size="sm"
          variant={assignmentType === "CERTIFICATE" ? "default" : "outline"}
          onClick={() => setAssignmentType("CERTIFICATE")}
          className="flex-1"
        >
          Certificate
        </Button>
      </div>
      {/* Conditional dropdown */}
      {assignmentType === "ROLE_PLAY" ? (
        <div className="space-y-2">
          <Label>Roleplay <span className="text-destructive">*</span></Label>
          <Select
            value={Array.isArray(formData.rolePlayIds) ? formData.rolePlayIds : [formData.rolePlayIds]}
            onValueChange={(value: string | string[]) => {
              // Radix Select passes string if single select, array if multi-select (rare)
              setFormData({
                ...formData,
                rolePlayIds: Array.isArray(value) ? value : [value],
                assignedUsers: []
              });
            }}
            multiple
          >
            <SelectTrigger>
              {formData.rolePlayIds?.length > 0
                ? `${formData.rolePlayIds?.length} selected`
                : "Select roleplays"}
            </SelectTrigger>

            <SelectContent>
              {filteredRolePlays.map(rp => (
                <SelectItem
                  key={rp.id}
                  value={rp.id.toString()}
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      rolePlayIds: prev.rolePlayIds.includes(rp.id.toString())
                        ? prev.rolePlayIds.filter(id => id !== rp.id.toString())
                        : [...prev.rolePlayIds, rp.id.toString()],
                      assignedUsers: [],
                    }));
                  }}
                >
                  {rp.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className="space-y-2">
          <Label>Certificate <span className="text-destructive">*</span></Label>
          <Select
            value={formData.certificateId || ""}
            onValueChange={(value) => setFormData({ ...formData, certificateId: value, assignedUsers: [] })}
          >
            <SelectTrigger className="h-11 bg-background border-border/50">
              <SelectValue placeholder="Select certificate" />
            </SelectTrigger>
            <SelectContent className="bg-background z-50">
              {filteredCertificates.map(cert => (
                <SelectItem key={cert.id} value={cert.id.toString()}>
                  {cert.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Due Date */}
      <div className="space-y-2">
        <Label htmlFor="dueDate">Due Date <span className="text-destructive">*</span></Label>
        <Input
          id="dueDate"
          type="date"
          value={formData.dueDate}
          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          className="h-11 bg-background border-border/50"
        />
      </div>

      {/* Due Time */}
      <div className="space-y-2">
        <Label htmlFor="dueTime">Due Time <span className="text-destructive">*</span></Label>
        <Input
          id="dueTime"
          type="time"
          value={formData.dueTime}
          onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
          className="h-11 bg-background border-border/50"
        />
      </div>

      {/* User Assignment */}
      <div className="space-y-2">
        <Label>Assign Users {formData.sessionId && `(${getSelectedSessionOrg()})`}</Label>
        {!formData.sessionId ? (
          <p className="text-sm text-muted-foreground p-4 bg-muted/30 rounded-lg">
            Please select a roleplay first to see available users
          </p>
        ) : filteredUsers.length === 0 ? (
          <p className="text-sm text-muted-foreground p-4 bg-muted/30 rounded-lg">
            No users available for this organization
          </p>
        ) : (
          <div className="border border-border/50 rounded-lg overflow-hidden">
            {/* Select All */}
            <div className="flex items-center gap-3 p-3 bg-muted/30 border-b border-border/50">
              <Checkbox
                id="selectAll"
                checked={allSelected}
                onCheckedChange={handleSelectAllUsers}
              />
              <Label htmlFor="selectAll" className="text-sm font-medium cursor-pointer">
                Select All ({filteredUsers.length} users)
              </Label>
            </div>

            {/* User List */}
            <div className="max-h-48 overflow-y-auto">
              {filteredUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-3 p-3 border-b border-border/30 last:border-b-0 hover:bg-muted/20">
                  <Checkbox
                    id={`user-${user.id}`}
                    checked={formData.assignedUsers.includes(user.id)}
                    onCheckedChange={() => handleUserToggle(user.id)}
                  />
                  <Label htmlFor={`user-${user.id}`} className="text-sm cursor-pointer flex-1">
                    {user.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}
        {formData.assignedUsers.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {formData.assignedUsers.length} user(s) selected
          </p>
        )}
      </div>
    </div>
  );
};



const Assignments = () => {
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [rolePlays, setRolePlays] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrganization, setSelectedOrganization] = useState<string>("");
  const [certificates, setCertificates] = useState<any[]>([]);
  const [assignmentType, setAssignmentType] = useState<"ROLE_PLAY" | "CERTIFICATE">("ROLE_PLAY");
  const filteredRolePlays = rolePlays.filter(rp => rp.organization === selectedOrganization);
const filteredCertificates = certificates.filter(c => c.organization === selectedOrganization);
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    rolePlayIds: [] as string[],  // multi-select for ROLE_PLAY
    certificateId: "",            // single-select for CERTIFICATE
    dueDate: "",
    dueTime: "",
    assignedUsers: [] as string[],
  });



  // Mock users data
  const allUsers: User[] = users;

  const [assignments, setAssignments] = useState<Assignment[]>([

  ]);

  const buildAssignmentPayload = () => {
    const dueAt = new Date(`${formData.dueDate}T${formData.dueTime}`).toISOString();

    const payload: any = {
      name: formData.name,
      assignment_type: assignmentType, // ROLE_PLAY or CERTIFICATE
      due_at: dueAt,
      user_ids: formData.assignedUsers
    };

    if (assignmentType === "ROLE_PLAY") {
      payload.role_play_ids = Array.isArray(formData.rolePlayIds)
        ? formData.rolePlayIds
        : [formData.rolePlayIds]; // wrap string into array if needed
    } else if (assignmentType === "CERTIFICATE") {
      payload.certificate_id = formData.certificateId; // single
    }

    return payload;
  };


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
        await fetchRolePlays()
          .then((rolePlays) => setRolePlays(Array.isArray(rolePlays) ? rolePlays : []))
          .catch(() => setRolePlays([]));
        await fetchUsers()
          .then((users) => setUsers(Array.isArray(users) ? users : []))
          .catch(() => setUsers([]));
        await fetchCertificate()
          .then((certificates) => setCertificates(Array.isArray(certificates) ? certificates : []))
          .catch(() => setCertificates([]));
        await fetchAssignment()
          .then((assignments) => setAssignments(Array.isArray(assignments) ? assignments : []))
          .catch(() => setAssignments([]));
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);


  // Get selected session's organization
  const getSelectedSessionOrg = () => {
    if (!formData.sessionId) return "";
    const session = rolePlays.find(s => s.id === parseInt(formData.sessionId));
    return session?.organization || "";
  };

 const getSelectedOrganization = () => {
  if (assignmentType === "ROLE_PLAY") {
    if (!formData.rolePlayIds || formData.rolePlayIds.length === 0) return "";
    const firstRP = rolePlays.find(rp => rp.id === parseInt(formData.rolePlayIds[0]));
    return firstRP?.organization || "";
  } else if (assignmentType === "CERTIFICATE") {
    if (!formData.certificateId) return "";
    const cert = certificates.find(c => c.id === parseInt(formData.certificateId));
    return cert?.organization || "";
  }
  return "";
};

  // Filter users based on selected session's organization
 const getFilteredUsers = () => {
  if (!selectedOrganization) return [];
  return allUsers.filter(u => u.parent?.parent_id?.toString() === selectedOrganization.toString());
};

  const handleSelectAllUsers = (checked: boolean) => {
  if (checked) {
    const filteredUsers = getFilteredUsers();
    setFormData({ ...formData, assignedUsers: filteredUsers.map(u => u.id) });
  } else {
    setFormData({ ...formData, assignedUsers: [] });
  }
};

  const handleUserToggle = (userId: string) => {
    if (formData.assignedUsers.includes(userId)) {
      setFormData({
        ...formData,
        assignedUsers: formData.assignedUsers.filter(id => id !== userId)
      });
    } else {
      setFormData({
        ...formData,
        assignedUsers: [...formData.assignedUsers, userId]
      });
    }
  };

 const resetForm = () => {
  setFormData({
    name: "",
    rolePlayIds: [],
    certificateId: "",
    dueDate: "",
    dueTime: "",
    assignedUsers: []
  });
  setSelectedOrganization("");
};

  const handleCreateAssignment = async () => {
    if (!formData.name || !formData.dueDate || !formData.dueTime ||
      (assignmentType === "ROLE_PLAY" && formData.rolePlayIds.length === 0) ||
      (assignmentType === "CERTIFICATE" && !formData.certificateId)
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    const payload = buildAssignmentPayload();

    try {
      await createAssignment(payload); // API call
      toast.success("Assignment created successfully");
      setIsCreateSheetOpen(false);
      resetForm();
      // Optionally refresh assignments
    } catch (error) {
      toast.error("Failed to create assignment");
    }
  };

  const handleEditAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    const userIds = assignment.users.map(name =>
      allUsers.find(u => u.name === name)?.id || ""
    ).filter(Boolean);

    setFormData({
      name: assignment.name,
      role_play_id: assignment.rolePlays[0]?.role_play_id?.toString(),
      dueDate: assignment.dueDate,
      dueTime: assignment.dueTime,
      assignedUsers: userIds
    });
    setIsEditSheetOpen(true);
  };

  const handleUpdateAssignment = async () => {
    if (!selectedAssignment) return;

    if (!formData.name || !formData.dueDate || !formData.dueTime ||
      (assignmentType === "ROLE_PLAY" && !formData.sessionId) ||
      (assignmentType === "CERTIFICATE" && !formData.certificateId)) {
      toast.error("Please fill in all required fields");
      return;
    }

    const payload = buildAssignmentPayload();

    try {
      await updateAssignmentApi(selectedAssignment.id, payload); // API call
      toast.success("Assignment updated successfully");
      setIsEditSheetOpen(false);
      setSelectedAssignment(null);
      resetForm();
      // Optionally refresh assignments
    } catch (error) {
      toast.error("Failed to update assignment");
    }
  };

  const handleDeleteClick = (assignment: Assignment) => {
    setAssignmentToDelete(assignment);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (assignmentToDelete) {
      setAssignments(assignments.filter(a => a.id !== assignmentToDelete.id));
      await deleteAssignment(assignmentToDelete.id);
      toast.success("Assignment deleted successfully");
    }
    setIsDeleteDialogOpen(false);
    setAssignmentToDelete(null);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Completed": return "default";
      case "In Progress": return "secondary";
      case "Overdue": return "destructive";
      default: return "outline";
    }
  };



  const filteredAssignments = assignments.filter(a => {
    const roleplayName = a.rolePlays?.[0]?.rolePlay.name || "";
    const certificateName = a.certificate?.name || "";
    const query = searchQuery.toLowerCase();

    return (
      a.name.toLowerCase().includes(query) ||
      roleplayName.toLowerCase().includes(query) ||
      certificateName.toLowerCase().includes(query)
    );
  });



  return (
    <DashboardLayout>
      <div className="p-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground tracking-tight">Assignment</h1>
            <p className="text-muted-foreground mt-2">Assign roleplays to users with due dates and track progress</p>
          </div>
          <Button
            className="bg-gradient-primary hover:shadow-glow transition-all duration-300 h-11 px-6"
            onClick={() => {
              handleCreateAssignment();
              resetForm();
              setIsCreateSheetOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Assignment
          </Button>
        </div>

        {/* Search */}
        <Card className="border-border/50 shadow-sm">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search assignments by name or roleplay..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 bg-background border-border/50 focus:border-primary transition-colors"
              />
            </div>
          </CardContent>
        </Card>

        {/* Scenarios Table */}
        <Card className="border-border/50 shadow-sm">
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/50">
                  <TableHead className="font-semibold">Assignment Name</TableHead>
                  <TableHead className="font-semibold">Roleplay / Certificate</TableHead>
                  <TableHead className="font-semibold">Due Date & Time</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssignments.map((assignment) => (
                  <TableRow key={assignment.id} className="border-border/50 hover:bg-muted/30">
                    <TableCell>
                      <p className="font-semibold text-foreground">{assignment.name}</p>
                    </TableCell>
                    <TableCell>
                      {assignment.assignment_type === "ROLE_PLAY" && assignment.rolePlays.length > 0 ? (
                        <Badge className="bg-orange-500 text-white px-3 py-1 rounded-full">
                          {assignment.rolePlays[0].rolePlay.name} <span className="ml-1 text-xs">(Roleplay)</span>
                        </Badge>
                      ) : assignment.assignment_type === "CERTIFICATE" && assignment.certificate ? (
                        <Badge className="bg-cyan-500 text-white px-3 py-1 rounded-full">
                          {assignment.certificate.name} <span className="ml-1 text-xs">(Certificate)</span>
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="px-3 py-1 rounded-full">N/A</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-foreground">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{formatToLongDate(assignment.updated_at)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(assignment.is_active ? "In Progress" : "Completed")} className="px-3 py-1 rounded-full" >
                        {assignment.is_active ? "In Progress" : "Completed"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8"
                          onClick={() => handleEditAssignment(assignment)}
                        >
                          <Edit className="h-3.5 w-3.5 mr-1.5" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteClick(assignment)}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1.5" />
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
      </div>

      {/* Create Assignment Sheet */}
      <Sheet open={isCreateSheetOpen} onOpenChange={setIsCreateSheetOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto flex flex-col p-0">
          <div className="flex-1 overflow-y-auto p-6">
            <SheetHeader>
              <SheetTitle className="text-xl font-semibold">Add Assignment</SheetTitle>
              <SheetDescription>
                Create a new assignment by assigning a roleplay with due date and users.
              </SheetDescription>
            </SheetHeader>
            <AssignmentForm
  isEdit={false}
  formData={formData}
  setFormData={setFormData}
  assignmentType={assignmentType}
  setAssignmentType={setAssignmentType}
  selectedOrganization={selectedOrganization}
  setSelectedOrganization={setSelectedOrganization}
  users={users}
  rolePlays={rolePlays}
  certificates={certificates}
  organizations={organizations}
  getFilteredUsers={getFilteredUsers}
  filteredRolePlays={rolePlays.filter(rp => rp.organization === selectedOrganization)}  // <-- ADD THIS
  filteredCertificates={certificates.filter(c => c.organization === selectedOrganization)} // optional for certificates dropdown
/>
          </div>

          <SheetFooter className="border-t bg-background p-6 mt-auto">
            <div className="flex gap-3 w-full">
              <Button
                variant="outline"
                onClick={() => setIsCreateSheetOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateAssignment}
                className="flex-1 bg-gradient-primary hover:shadow-glow"
              >
                Add Assignment
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Edit Assignment Sheet */}
      <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto flex flex-col p-0">
          <div className="flex-1 overflow-y-auto p-6">
            <SheetHeader>
              <SheetTitle className="text-xl font-semibold">Edit Assignment</SheetTitle>
              <SheetDescription>
                Update assignment configuration and user assignments.
              </SheetDescription>
            </SheetHeader>
            <AssignmentForm
  isEdit={true}
  formData={formData}
  setFormData={setFormData}
  assignmentType={assignmentType}
  setAssignmentType={setAssignmentType}
  selectedOrganization={selectedOrganization}
  setSelectedOrganization={setSelectedOrganization}
  users={users}
  rolePlays={rolePlays}
  certificates={certificates}
  organizations={organizations}
  getFilteredUsers={getFilteredUsers}
  filteredRolePlays={rolePlays.filter(rp => rp.organization === selectedOrganization)}  // <-- ADD THIS
  filteredCertificates={certificates.filter(c => c.organization === selectedOrganization)} // optional for certificates dropdown
/>
          </div>

          <SheetFooter className="border-t bg-background p-6 mt-auto">
            <div className="flex gap-3 w-full">
              <Button
                variant="outline"
                onClick={() => setIsEditSheetOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateAssignment}
                className="flex-1 bg-gradient-primary hover:shadow-glow"
              >
                Update Assignment
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Assignment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{assignmentToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default Assignments;