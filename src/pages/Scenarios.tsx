import { useState } from "react";
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

const Scenarios = () => {
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState<Assignment | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    sessionId: "",
    dueDate: "",
    dueTime: "",
    assignedUsers: [] as string[]
  });

  // Mock sessions data
  const sessions: Session[] = [
    { id: 1, name: "Sales Consultation - Q1 2024", organization: "TechCorp" },
    { id: 2, name: "Customer Support Training", organization: "ServiceHub" },
    { id: 3, name: "Technical Troubleshooting", organization: "TechCorp" },
    { id: 4, name: "Negotiation Practice", organization: "DealMakers" },
    { id: 5, name: "Product Demo Training", organization: "TechCorp" },
  ];

  // Mock users data
  const allUsers: User[] = [
    { id: "1", name: "Sarah Johnson", organization: "TechCorp" },
    { id: "2", name: "Mike Chen", organization: "ServiceHub" },
    { id: "3", name: "Emma Wilson", organization: "TechCorp" },
    { id: "4", name: "James Brown", organization: "DealMakers" },
    { id: "5", name: "Lisa Anderson", organization: "TechCorp" },
    { id: "6", name: "David Lee", organization: "ServiceHub" },
    { id: "7", name: "Anna Martinez", organization: "DealMakers" },
  ];

  const [assignments, setAssignments] = useState<Assignment[]>([
    {
      id: 1,
      name: "Q1 Sales Assessment",
      sessionId: 1,
      sessionName: "Sales Consultation - Q1 2024",
      dueDate: "2024-03-15",
      dueTime: "14:00",
      status: "Pending",
      assignedUsers: ["Sarah Johnson", "Emma Wilson", "Lisa Anderson"],
      organization: "TechCorp"
    },
    {
      id: 2,
      name: "Support Team Certification",
      sessionId: 2,
      sessionName: "Customer Support Training",
      dueDate: "2024-03-20",
      dueTime: "10:00",
      status: "In Progress",
      assignedUsers: ["Mike Chen", "David Lee"],
      organization: "ServiceHub"
    },
    {
      id: 3,
      name: "Deal Closing Skills",
      sessionId: 4,
      sessionName: "Negotiation Practice",
      dueDate: "2024-03-10",
      dueTime: "09:00",
      status: "Completed",
      assignedUsers: ["James Brown", "Anna Martinez"],
      organization: "DealMakers"
    },
    {
      id: 4,
      name: "Technical Review",
      sessionId: 3,
      sessionName: "Technical Troubleshooting",
      dueDate: "2024-03-08",
      dueTime: "16:00",
      status: "Overdue",
      assignedUsers: ["Sarah Johnson", "Emma Wilson"],
      organization: "TechCorp"
    },
  ]);

  // Get selected session's organization
  const getSelectedSessionOrg = () => {
    if (!formData.sessionId) return "";
    const session = sessions.find(s => s.id === parseInt(formData.sessionId));
    return session?.organization || "";
  };

  // Filter users based on selected session's organization
  const getFilteredUsers = () => {
    const org = getSelectedSessionOrg();
    if (!org) return [];
    return allUsers.filter(u => u.organization === org);
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
      sessionId: "",
      dueDate: "",
      dueTime: "",
      assignedUsers: []
    });
  };

  const handleCreateAssignment = () => {
    if (!formData.name || !formData.sessionId || !formData.dueDate || !formData.dueTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    const session = sessions.find(s => s.id === parseInt(formData.sessionId));
    const assignedUserNames = formData.assignedUsers.map(id => 
      allUsers.find(u => u.id === id)?.name || ""
    ).filter(Boolean);

    const newAssignment: Assignment = {
      id: Date.now(),
      name: formData.name,
      sessionId: parseInt(formData.sessionId),
      sessionName: session?.name || "",
      dueDate: formData.dueDate,
      dueTime: formData.dueTime,
      status: "Pending",
      assignedUsers: assignedUserNames,
      organization: session?.organization || ""
    };

    setAssignments([...assignments, newAssignment]);
    setIsCreateSheetOpen(false);
    resetForm();
    toast.success("Assignment created successfully");
  };

  const handleEditAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    const userIds = assignment.assignedUsers.map(name => 
      allUsers.find(u => u.name === name)?.id || ""
    ).filter(Boolean);
    
    setFormData({
      name: assignment.name,
      sessionId: assignment.sessionId.toString(),
      dueDate: assignment.dueDate,
      dueTime: assignment.dueTime,
      assignedUsers: userIds
    });
    setIsEditSheetOpen(true);
  };

  const handleUpdateAssignment = () => {
    if (!selectedAssignment) return;

    const session = sessions.find(s => s.id === parseInt(formData.sessionId));
    const assignedUserNames = formData.assignedUsers.map(id => 
      allUsers.find(u => u.id === id)?.name || ""
    ).filter(Boolean);

    setAssignments(assignments.map(a => 
      a.id === selectedAssignment.id 
        ? {
            ...a,
            name: formData.name,
            sessionId: parseInt(formData.sessionId),
            sessionName: session?.name || "",
            dueDate: formData.dueDate,
            dueTime: formData.dueTime,
            assignedUsers: assignedUserNames,
            organization: session?.organization || ""
          }
        : a
    ));
    setIsEditSheetOpen(false);
    setSelectedAssignment(null);
    resetForm();
    toast.success("Assignment updated successfully");
  };

  const handleDeleteClick = (assignment: Assignment) => {
    setAssignmentToDelete(assignment);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (assignmentToDelete) {
      setAssignments(assignments.filter(a => a.id !== assignmentToDelete.id));
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

  const formatDateTime = (date: string, time: string) => {
    const dateObj = new Date(`${date}T${time}`);
    return dateObj.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const AssignmentForm = ({ isEdit = false }: { isEdit?: boolean }) => {
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

        {/* Roleplay Selection */}
        <div className="space-y-2">
          <Label htmlFor="session">Roleplay <span className="text-destructive">*</span></Label>
          <Select 
            value={formData.sessionId} 
            onValueChange={(value) => setFormData({ ...formData, sessionId: value, assignedUsers: [] })}
          >
            <SelectTrigger className="h-11 bg-background border-border/50">
              <SelectValue placeholder="Select roleplay" />
            </SelectTrigger>
            <SelectContent className="bg-background z-50">
              {sessions.map((session) => (
                <SelectItem key={session.id} value={session.id.toString()}>
                  {session.name} ({session.organization})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
                  <TableHead className="font-semibold">Roleplay</TableHead>
                  <TableHead className="font-semibold">Due Date & Time</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((assignment) => (
                  <TableRow key={assignment.id} className="border-border/50 hover:bg-muted/30">
                    <TableCell>
                      <p className="font-semibold text-foreground">{assignment.name}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-foreground">{assignment.sessionName}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-foreground">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{formatDateTime(assignment.dueDate, assignment.dueTime)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(assignment.status)}>
                        {assignment.status}
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
            <AssignmentForm />
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
            <AssignmentForm isEdit />
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

export default Scenarios;