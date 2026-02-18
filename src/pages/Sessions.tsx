import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Plus, Edit, Trash2, FileText, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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

interface Document {
  id: number;
  name: string;
  organization: string;
}

interface Session {
  id: number;
  name: string;
  organization: string;
  avatar: string;
  preCallPlan: string;
  category: string;
  subcategory: string;
  guardrail: string;
  documents: number[];
}

const Sessions = () => {
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<Session | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");
  const [selectedOrganization, setSelectedOrganization] = useState<string>("");
  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([]);

  // Mock documents data
  const documents: Document[] = [
    { id: 1, name: "Sales Playbook 2024.pdf", organization: "TechCorp" },
    { id: 2, name: "Product Specifications.docx", organization: "TechCorp" },
    { id: 3, name: "Customer Service Guidelines.pdf", organization: "ServiceHub" },
    { id: 4, name: "Support Ticket Handling.docx", organization: "ServiceHub" },
    { id: 5, name: "Negotiation Tactics Guide.pdf", organization: "DealMakers" },
    { id: 6, name: "Contract Templates.docx", organization: "DealMakers" },
    { id: 7, name: "Healthcare Compliance.pdf", organization: "HealthFirst" },
    { id: 8, name: "Patient Privacy Policy.docx", organization: "HealthFirst" },
  ];

  const [sessions, setSessions] = useState<Session[]>([
    {
      id: 1,
      name: "Sales Consultation - Q1 2024",
      organization: "TechCorp",
      avatar: "Sales Consultant",
      preCallPlan: "Enterprise Sales Strategy",
      category: "Sales",
      subcategory: "Enterprise",
      guardrail: "Standard Compliance",
      documents: [1, 2],
    },
    {
      id: 2,
      name: "Customer Support Training",
      organization: "ServiceHub",
      avatar: "Customer Support",
      preCallPlan: "Customer Handling Protocol",
      category: "Support",
      subcategory: "Customer Service",
      guardrail: "HIPAA Guidelines",
      documents: [3, 4],
    },
    {
      id: 3,
      name: "Technical Troubleshooting",
      organization: "TechCorp",
      avatar: "Technical Expert",
      preCallPlan: "Technical Assessment",
      category: "Technical",
      subcategory: "Troubleshooting",
      guardrail: "Standard Compliance",
      documents: [1],
    },
    {
      id: 4,
      name: "Negotiation Practice",
      organization: "DealMakers",
      avatar: "Negotiation Specialist",
      preCallPlan: "Negotiation Framework",
      category: "Sales",
      subcategory: "Negotiation",
      guardrail: "Financial Regulations",
      documents: [5, 6],
    },
    {
      id: 5,
      name: "Product Demo Training",
      organization: "TechCorp",
      avatar: "Sales Consultant",
      preCallPlan: "Enterprise Sales Strategy",
      category: "Sales",
      subcategory: "Demo",
      guardrail: "Standard Compliance",
      documents: [],
    },
  ]);

  // Mock data for dropdowns
  const organizations = ["TechCorp", "ServiceHub", "DealMakers", "HealthFirst"];
  const prePlans = [
    "Enterprise Sales Strategy",
    "Customer Handling Protocol",
    "Technical Assessment",
    "Negotiation Framework",
  ];
  const avatars = ["Sales Consultant", "Customer Support", "Technical Expert", "Negotiation Specialist"];
  const guardrails = ["Standard Compliance", "HIPAA Guidelines", "Financial Regulations", "Custom Safety Rules"];

  // Category and subcategory data
  const categories: { [key: string]: string[] } = {
    Sales: ["Enterprise", "Negotiation", "Demo", "Cold Calling"],
    Support: ["Customer Service", "Technical Support", "Billing"],
    Technical: ["Troubleshooting", "Installation", "Configuration"],
    Training: ["Onboarding", "Product Knowledge", "Soft Skills"],
  };

  const subcategories = selectedCategory ? categories[selectedCategory] || [] : [];

  // Filter documents based on selected organization
  const filteredDocuments = selectedOrganization
    ? documents.filter((doc) => doc.organization === selectedOrganization)
    : [];

  const handleDocumentToggle = (documentId: number) => {
    setSelectedDocuments((prev) =>
      prev.includes(documentId) ? prev.filter((id) => id !== documentId) : [...prev, documentId]
    );
  };

  const handleSelectAllDocuments = () => {
    if (selectedDocuments.length === filteredDocuments.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(filteredDocuments.map((doc) => doc.id));
    }
  };

  const handleCreateSession = () => {
    setIsCreateSheetOpen(false);
    // Reset form
    setSelectedCategory("");
    setSelectedSubcategory("");
    setSelectedOrganization("");
    setSelectedDocuments([]);
    setIsActive(true);
  };

  const handleEditSession = (session: Session) => {
    setSelectedSession(session);
    setSelectedCategory(session.category);
    setSelectedSubcategory(session.subcategory);
    setSelectedOrganization(session.organization);
    setSelectedDocuments(session.documents || []);
    setIsActive(true);
    setIsEditSheetOpen(true);
  };

  const handleUpdateSession = () => {
    setIsEditSheetOpen(false);
    setSelectedSession(null);
    setSelectedCategory("");
    setSelectedSubcategory("");
    setSelectedOrganization("");
    setSelectedDocuments([]);
    toast.success("Roleplay updated successfully");
  };

  const handleDeleteClick = (session: Session) => {
    setSessionToDelete(session);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (sessionToDelete) {
      setSessions(sessions.filter((s) => s.id !== sessionToDelete.id));
      toast.success("Roleplay deleted successfully");
    }
    setIsDeleteDialogOpen(false);
    setSessionToDelete(null);
  };

  const SessionForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="space-y-6 py-6">
      {/* Organization */}
      <div className="space-y-2">
        <Label htmlFor="organization">
          Organization <span className="text-destructive">*</span>
        </Label>
        <Select
          value={selectedOrganization}
          onValueChange={(value) => {
            setSelectedOrganization(value);
            setSelectedDocuments([]);
          }}
        >
          <SelectTrigger className="h-11 bg-background border-border/50">
            <SelectValue placeholder="Select organization" />
          </SelectTrigger>
          <SelectContent className="bg-background z-50">
            {organizations.map((org) => (
              <SelectItem key={org} value={org}>
                {org}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Roleplay Name */}
      <div className="space-y-2">
        <Label htmlFor="sessionName">
          Roleplay Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="sessionName"
          placeholder="Enter roleplay name"
          defaultValue={isEdit && selectedSession ? selectedSession.name : ""}
          className="h-11 bg-background border-border/50"
        />
      </div>

      {/* Active Status */}
      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
        <div className="space-y-0.5">
          <Label htmlFor="active-status" className="text-sm font-medium">
            Status
          </Label>
          <p className="text-xs text-muted-foreground">{isActive ? "Roleplay is active" : "Roleplay is inactive"}</p>
        </div>
        <Switch id="active-status" checked={isActive} onCheckedChange={setIsActive} />
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="category">
          Category <span className="text-destructive">*</span>
        </Label>
        <Select
          value={selectedCategory}
          onValueChange={(value) => {
            setSelectedCategory(value);
            setSelectedSubcategory("");
          }}
        >
          <SelectTrigger className="h-11 bg-background border-border/50">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent className="bg-background z-50">
            {Object.keys(categories).map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Subcategory */}
      <div className="space-y-2">
        <Label htmlFor="subcategory">
          Subcategory <span className="text-destructive">*</span>
        </Label>
        <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory} disabled={!selectedCategory}>
          <SelectTrigger className="h-11 bg-background border-border/50">
            <SelectValue placeholder={selectedCategory ? "Select subcategory" : "Select category first"} />
          </SelectTrigger>
          <SelectContent className="bg-background z-50">
            {subcategories.map((sub) => (
              <SelectItem key={sub} value={sub}>
                {sub}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Pre-Call Plan */}
      <div className="space-y-2">
        <Label htmlFor="prePlan">
          Pre-Call Plan <span className="text-destructive">*</span>
        </Label>
        <Select defaultValue={isEdit && selectedSession ? selectedSession.preCallPlan : undefined}>
          <SelectTrigger className="h-11 bg-background border-border/50">
            <SelectValue placeholder="Select pre-call plan" />
          </SelectTrigger>
          <SelectContent className="bg-background z-50">
            {prePlans.map((plan) => (
              <SelectItem key={plan} value={plan}>
                {plan}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Avatar */}
      <div className="space-y-2">
        <Label htmlFor="avatar">
          Avatar <span className="text-destructive">*</span>
        </Label>
        <Select defaultValue={isEdit && selectedSession ? selectedSession.avatar : undefined}>
          <SelectTrigger className="h-11 bg-background border-border/50">
            <SelectValue placeholder="Select avatar" />
          </SelectTrigger>
          <SelectContent className="bg-background z-50">
            {avatars.map((avatar) => (
              <SelectItem key={avatar} value={avatar}>
                {avatar}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Guardrails */}
      <div className="space-y-2">
        <Label htmlFor="guardrails">Guardrails</Label>
        <Select defaultValue={isEdit && selectedSession ? selectedSession.guardrail : undefined}>
          <SelectTrigger className="h-11 bg-background border-border/50">
            <SelectValue placeholder="Select guardrails" />
          </SelectTrigger>
          <SelectContent className="bg-background z-50">
            {guardrails.map((guardrail) => (
              <SelectItem key={guardrail} value={guardrail}>
                {guardrail}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Documents */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Documents</Label>
          {filteredDocuments.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={handleSelectAllDocuments}
            >
              {selectedDocuments.length === filteredDocuments.length ? "Deselect All" : "Select All"}
            </Button>
          )}
        </div>

        {!selectedOrganization ? (
          <p className="text-sm text-muted-foreground">Select an organization first to see available documents</p>
        ) : filteredDocuments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No documents available for this organization</p>
        ) : (
          <div className="space-y-2">
            {/* Selected Documents Display */}
            {selectedDocuments.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedDocuments.map((docId) => {
                  const doc = documents.find((d) => d.id === docId);
                  return doc ? (
                    <div
                      key={docId}
                      className="flex items-center gap-1.5 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm"
                    >
                      <FileText className="h-3 w-3" />
                      <span className="max-w-[150px] truncate">{doc.name}</span>
                      <button
                        type="button"
                        onClick={() => handleDocumentToggle(docId)}
                        className="hover:bg-primary/20 rounded p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : null;
                })}
              </div>
            )}

            {/* Document List */}
            <div className="border border-border/50 rounded-lg max-h-48 overflow-y-auto">
              {filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-3 p-3 hover:bg-muted/30 cursor-pointer border-b border-border/30 last:border-b-0"
                  onClick={() => handleDocumentToggle(doc.id)}
                >
                  <Checkbox
                    checked={selectedDocuments.includes(doc.id)}
                    onCheckedChange={() => handleDocumentToggle(doc.id)}
                  />
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{doc.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="p-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground tracking-tight">Roleplays</h1>
            <p className="text-muted-foreground mt-2">Manage ECHO-RolePlay configurations</p>
          </div>
          <Button
            className="bg-gradient-primary hover:shadow-glow transition-all duration-300 h-11 px-6"
            onClick={() => setIsCreateSheetOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Roleplay
          </Button>
        </div>

        {/* Search */}
        <Card className="border-border/50 shadow-sm">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search roleplays by name or organization..."
                className="pl-10 h-11 bg-background border-border/50 focus:border-primary transition-colors"
              />
            </div>
          </CardContent>
        </Card>

        {/* Sessions Table */}
        <Card className="border-border/50 shadow-sm">
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/50">
                  <TableHead className="font-semibold">Roleplay Name</TableHead>
                  <TableHead className="font-semibold">Organization</TableHead>
                  <TableHead className="font-semibold">Category</TableHead>
                  <TableHead className="font-semibold">Avatar</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.id} className="border-border/50 hover:bg-muted/30">
                    <TableCell>
                      <p className="font-semibold text-foreground">{session.name}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-foreground">{session.organization}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-foreground">
                        {session.category} / {session.subcategory}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-foreground">{session.avatar}</p>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" className="h-8" onClick={() => handleEditSession(session)}>
                          <Edit className="h-3.5 w-3.5 mr-1.5" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteClick(session)}
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

      {/* Create Session Sheet */}
      <Sheet open={isCreateSheetOpen} onOpenChange={setIsCreateSheetOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto flex flex-col p-0">
          <div className="flex-1 overflow-y-auto p-6">
            <SheetHeader>
              <SheetTitle className="text-xl font-semibold">Add Roleplay</SheetTitle>
              <SheetDescription>Configure a new roleplay with all required parameters.</SheetDescription>
            </SheetHeader>
            <SessionForm />
          </div>

          <SheetFooter className="border-t bg-background p-6 mt-auto">
            <div className="flex gap-3 w-full">
              <Button variant="outline" onClick={() => setIsCreateSheetOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleCreateSession} className="flex-1 bg-gradient-primary hover:shadow-glow">
                Add Roleplay
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Edit Session Sheet */}
      <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto flex flex-col p-0">
          <div className="flex-1 overflow-y-auto p-6">
            <SheetHeader>
              <SheetTitle className="text-xl font-semibold">Edit Roleplay</SheetTitle>
              <SheetDescription>Update roleplay configuration and parameters.</SheetDescription>
            </SheetHeader>
            <SessionForm isEdit />
          </div>

          <SheetFooter className="border-t bg-background p-6 mt-auto">
            <div className="flex gap-3 w-full">
              <Button variant="outline" onClick={() => setIsEditSheetOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleUpdateSession} className="flex-1 bg-gradient-primary hover:shadow-glow">
                Update Roleplay
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Roleplay</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{sessionToDelete?.name}"? This action cannot be undone.
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

export default Sessions;
