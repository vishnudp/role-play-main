import { useEffect, useState } from "react";
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
import { fetchDocuments, fetchOrganizations, uploadDocument, deleteDocument, fetchUsers, fetchPreCallPlans, fetchAvatars, fetchGuardrails, fetchCategories, fetchRolePlays, addRoleplay, editRoleplay, deleteRoleplay } from "../api/apiService";
import { getOrganizationName, getAvatarName, getCategoryName, getSubCategoryName, getUserName, formatToLongDate, formatFileSize, handleView, handleDownload } from "../lib/lookupUtils";
import { add } from "date-fns";

interface Document {
  id: number;
  name: string;
  organization: string;
}

interface RolePlay {
  id: number;
  name: string;
  organization_id: string;
  category_id: string;
  subcategory_id: string;
  avatar_id: string;
  precall_plan_id: string;
  guardrail_id: string;
  document_id: string;
  is_active: boolean;
}

interface RolePlaysFormProps {
  isEdit?: boolean;
  roleplayName: string;
  setRoleplayName: React.Dispatch<React.SetStateAction<string>>;

  selectedOrganization: string;
  setSelectedOrganization: React.Dispatch<React.SetStateAction<string>>;

  selectedCategory: string;
  setSelectedCategory: React.Dispatch<React.SetStateAction<string>>;

  selectedSubcategory: string;
  setSelectedSubcategory: React.Dispatch<React.SetStateAction<string>>;

  selectedPreCallPlans: string;
  setSelectedPreCallPlans: React.Dispatch<React.SetStateAction<string>>;

  selectedAvatars: string;
  setSelectedAvatars: React.Dispatch<React.SetStateAction<string>>;

  selectedGuardrails: string;
  setSelectedGuardrails: React.Dispatch<React.SetStateAction<string>>;

  selectedDocument: string;
  setSelectedDocument: React.Dispatch<React.SetStateAction<string>>;

  isActive: boolean;
  setIsActive: React.Dispatch<React.SetStateAction<boolean>>;

  organizations: any[];
  categories: any[];
  subcategories: any[];
  prePlans: any[];
  avatars: any[];
  guardrails: any[];
  filteredDocuments: any[];
}

const RolePlaysForm = ({
  isEdit = false,
  roleplayName,
  setRoleplayName,
  selectedOrganization,
  setSelectedOrganization,
  selectedCategory,
  setSelectedCategory,
  selectedSubcategory,
  setSelectedSubcategory,
  selectedPreCallPlans,
  setSelectedPreCallPlans,
  selectedAvatars,
  setSelectedAvatars,
  selectedGuardrails,
  setSelectedGuardrails,
  selectedDocument,
  setSelectedDocument,
  isActive,
  setIsActive,
  organizations,
  categories,
  subcategories,
  prePlans,
  avatars,
  guardrails,
  filteredDocuments,
}: RolePlaysFormProps) => (
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
          setSelectedDocument("");
        }}
      >
        <SelectTrigger className="h-11 bg-background border-border/50">
          <SelectValue placeholder="Select organization" />
        </SelectTrigger>
        <SelectContent className="bg-background z-50">
          {organizations.map((org) => (
            <SelectItem key={org?.id} value={org?.id}>
              {org.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    {/* Roleplay Name */}
    <div className="space-y-2">
      <Label htmlFor="roleplayName">
        Roleplay Name <span className="text-destructive">*</span>
      </Label>
      <Input
        id="roleplayName"
        placeholder="Enter roleplay name"
        value={roleplayName}
        onChange={(e) => setRoleplayName(e.target.value)}
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
          {categories.map((cat: any) => (
            <SelectItem key={cat?.id} value={cat?.id}>
              {cat?.name}
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
            <SelectItem key={sub?.id} value={sub?.id}>
              {sub?.name}
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
      <Select value={selectedPreCallPlans}
        onValueChange={(value) => {
          setSelectedPreCallPlans(value);
        }}>
        <SelectTrigger className="h-11 bg-background border-border/50">
          <SelectValue placeholder="Select pre-call plan" />
        </SelectTrigger>
        <SelectContent className="bg-background z-50">
          {prePlans.map((plan) => (
            <SelectItem key={plan?.id} value={plan?.id}>
              {plan?.name}
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
      <Select value={selectedAvatars}
        onValueChange={(value) => {
          setSelectedAvatars(value);
        }}>
        <SelectTrigger className="h-11 bg-background border-border/50">
          <SelectValue placeholder="Select avatar" />
        </SelectTrigger>
        <SelectContent className="bg-background z-50">
          {avatars.map((avatar) => (
            <SelectItem key={avatar?.id} value={avatar?.id}>
              {avatar?.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    {/* Guardrails */}
    <div className="space-y-2">
      <Label htmlFor="guardrails">Guardrails</Label>
      <Select value={selectedGuardrails}
        onValueChange={(value) => {
          setSelectedGuardrails(value);
        }}>
        <SelectTrigger className="h-11 bg-background border-border/50">
          <SelectValue placeholder="Select guardrails" />
        </SelectTrigger>
        <SelectContent className="bg-background z-50">
          {guardrails.map((guardrail) => (
            <SelectItem key={guardrail?.id} value={guardrail?.id}>
              {guardrail?.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    {/* Documents */}
    <div className="space-y-3">
      <Label>
        Document <span className="text-destructive">*</span>
      </Label>

      {!selectedOrganization ? (
        <p className="text-sm text-muted-foreground">
          Select an organization first to see available documents
        </p>
      ) : filteredDocuments?.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No documents available for this organization
        </p>
      ) : (
        <Select
          value={selectedDocument}
          onValueChange={setSelectedDocument}
        >
          <SelectTrigger className="h-11 bg-background border-border/50">
            <SelectValue placeholder="Select document" />
          </SelectTrigger>

          <SelectContent className="bg-background z-50">
            {filteredDocuments.map((doc) => (
              <SelectItem key={doc.id} value={doc.id}>
                {doc.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>

  </div>
);


const RolePlays = () => {
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [selectedRolePlay, setSelectedRolePlay] = useState<RolePlay | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<RolePlay | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");
  const [selectedOrganization, setSelectedOrganization] = useState<string>("");
  const [selectedDocument, setSelectedDocument] = useState<any>("");
  const [selectedAvatars, setSelectedAvatars] = useState<string>("");
  const [selectedPreCallPlans, setSelectedPreCallPlans] = useState<string>("");
  const [selectedGuardrails, setSelectedGuardrails] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [prePlans, setPreCallPlans] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [avatars, setAvatars] = useState<any[]>([]);
  const [guardrails, setGuardrails] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [roleplayName, setRoleplayName] = useState<string>("");

  // Mock documents data
  // const documents: Document[] = [
  //   { id: 1, name: "Sales Playbook 2024.pdf", organization: "TechCorp" },
  //   { id: 2, name: "Product Specifications.docx", organization: "TechCorp" },
  //   { id: 3, name: "Customer Service Guidelines.pdf", organization: "ServiceHub" },
  //   { id: 4, name: "Support Ticket Handling.docx", organization: "ServiceHub" },
  //   { id: 5, name: "Negotiation Tactics Guide.pdf", organization: "DealMakers" },
  //   { id: 6, name: "Contract Templates.docx", organization: "DealMakers" },
  //   { id: 7, name: "Healthcare Compliance.pdf", organization: "HealthFirst" },
  //   { id: 8, name: "Patient Privacy Policy.docx", organization: "HealthFirst" },
  // ];

  const [roleplays, setRolePlay] = useState<RolePlay[]>([

  ]);

  // Mock data for dropdowns
  // const organizations = ["TechCorp", "ServiceHub", "DealMakers", "HealthFirst"];
  // const prePlans = [
  //   "Enterprise Sales Strategy",
  //   "Customer Handling Protocol",
  //   "Technical Assessment",
  //   "Negotiation Framework",
  // ];
  //const avatars = ["Sales Consultant", "Customer Support", "Technical Expert", "Negotiation Specialist"];
  //const guardrails = ["Standard Compliance", "HIPAA Guidelines", "Financial Regulations", "Custom Safety Rules"];

  // Category and subcategory data
  // const categories: { [key: string]: string[] } = {
  //   Sales: ["Enterprise", "Negotiation", "Demo", "Cold Calling"],
  //   Support: ["Customer Service", "Technical Support", "Billing"],
  //   Technical: ["Troubleshooting", "Installation", "Configuration"],
  //   Training: ["Onboarding", "Product Knowledge", "Soft Skills"],
  // };


 useEffect(() => {
  async function loadData() {
    setLoading(true);
    try {
      await loadRolePlays();

      const orgs = await fetchOrganizations();
      setOrganizations(Array.isArray(orgs) ? orgs : []);

      const docs = await fetchDocuments();
      setDocuments(Array.isArray(docs) ? docs : []);

      const users = await fetchUsers();
      setUsers(Array.isArray(users) ? users : []);

      const plans = await fetchPreCallPlans();
      setPreCallPlans(Array.isArray(plans) ? plans : []);

      const avatarsData = await fetchAvatars();
      setAvatars(Array.isArray(avatarsData) ? avatarsData : []);

      const guardrailsData = await fetchGuardrails();
      setGuardrails(Array.isArray(guardrailsData) ? guardrailsData : []);

      const categoriesData = await fetchCategories();
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);

    } finally {
      setLoading(false);
    }
  }

  loadData();
}, []);

const loadRolePlays = async () => {
  try {
    setLoading(true);
    const data = await fetchRolePlays();
    setRolePlay(Array.isArray(data) ? data : []);
  } catch (error) {
    setRolePlay([]);
  } finally {
    setLoading(false);
  }
};

  // Filter documents based on selected organization
  const filteredDocuments = selectedOrganization
    ? documents.filter((doc) => doc.organization_id === selectedOrganization)
    : [];

  const subcategories = selectedCategory ? categories.find((cat) => cat.id === selectedCategory)?.children || [] : [];

  const handleDocumentToggle = (documentId: number) => {
    setSelectedDocument((prev) =>
      prev.includes(documentId) ? prev.filter((id) => id !== documentId) : [...prev, documentId]
    );
  };

  const handleSelectAllDocument = () => {
    if (selectedDocument?.length === filteredDocuments?.length) {
      setSelectedDocument("");
    } else {
      setSelectedDocument(filteredDocuments.map((doc) => doc.id));
    }
  };

  const handleCreateRolePlay = async () => {
    try {
      const payload = {
        name: roleplayName, // ideally bind name to state
        organization_id: selectedOrganization,
        subcategory_id: selectedSubcategory,
        precall_plan_id: selectedPreCallPlans,
        avatar_id: selectedAvatars,
        guardrail_id: selectedGuardrails,
        document_id: selectedDocument, // if multiple allowed keep array
        is_active: isActive,
      };

      await addRoleplay(payload);

      console.log("CREATE PAYLOAD:", payload);

      // await createRolePlay(payload);

      toast.success("Roleplay created successfully");
      setIsCreateSheetOpen(false);
      // Reset form
      setSelectedCategory("");
      setSelectedSubcategory("");
      setSelectedOrganization("");
      setSelectedDocument("");
      setSelectedPreCallPlans("");
      setSelectedAvatars("");
      setSelectedGuardrails("");
      setIsActive(true);
        await loadRolePlays();

      // Reset form


    } catch (error) {
      toast.error("Failed to create roleplay");
    }

  };

 const handleEditRolePlay = (roleplay: RolePlay) => {
  setSelectedRolePlay(roleplay);

  setRoleplayName(roleplay.name);
  setSelectedCategory(roleplay.category_id);
  setSelectedSubcategory(roleplay.subcategory_id);
  setSelectedOrganization(roleplay.organization_id);
  setSelectedDocument(roleplay.document_id);
  setSelectedPreCallPlans(roleplay.precall_plan_id);
  setSelectedAvatars(roleplay.avatar_id);
  setSelectedGuardrails(roleplay.guardrail_id);
  setIsActive(roleplay.is_active);

  setIsEditSheetOpen(true);
};

  const handleUpdateRolePlay = async () => {
    console.log("Update clicked");
  console.log("Selected Roleplay:", selectedRolePlay);

  try {
    if (!selectedRolePlay) {
      console.log("No roleplay selected");
      return;
    }

    const payload = {
      name: roleplayName,
      organization_id: selectedOrganization,
      subcategory_id: selectedSubcategory,
      precall_plan_id: selectedPreCallPlans,
      avatar_id: selectedAvatars,
      guardrail_id: selectedGuardrails,
      document_id: selectedDocument,
      is_active: isActive,
    };

    console.log("Update Payload:", payload);

    await editRoleplay(selectedRolePlay.id, payload);

     setIsEditSheetOpen(false);
    setSelectedRolePlay(null);
    setSelectedCategory("");
    setSelectedSubcategory("");
    setSelectedOrganization("");
    setSelectedDocument("");
    setSelectedPreCallPlans("");
    setSelectedAvatars("");
    setSelectedGuardrails("");
    toast.success("Roleplay updated successfully");
    await loadRolePlays();

    await loadRolePlays();
  } catch (error) {
    console.error("Update error:", error);
    toast.error("Failed to update roleplay");
  }
   
  };

  const handleDeleteClick = (roleplay: RolePlay) => {
    setSessionToDelete(roleplay);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async() => {
    if (sessionToDelete) {
      setRolePlay(roleplays.filter((s) => s.id !== sessionToDelete.id));

       try {
    await deleteRoleplay(sessionToDelete.id);
    toast.success("Roleplay deleted successfully");

    // Refresh list from API
    await loadRolePlays();

  } catch (error) {
    console.error("Delete error:", error);
    toast.error("Failed to delete roleplay");
  } finally {
    setIsDeleteDialogOpen(false);
    setSessionToDelete(null);
  }
    }
    setIsDeleteDialogOpen(false);
    setSessionToDelete(null);
  };



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
                {roleplays.map((roleplay) => (
                  <TableRow key={roleplay.id} className="border-border/50 hover:bg-muted/30">
                    <TableCell>
                      <p className="font-semibold text-foreground">{roleplay.name}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-foreground">{getOrganizationName(organizations, roleplay.organization_id)}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-foreground">
                        {getCategoryName(categories, roleplay.category_id)} / {getSubCategoryName(categories, roleplay.category_id, roleplay.subcategory_id)}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-foreground">{getAvatarName(avatars, roleplay.avatar_id)}</p>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" className="h-8" onClick={() => handleEditRolePlay(roleplay)}>
                          <Edit className="h-3.5 w-3.5 mr-1.5" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteClick(roleplay)}
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
            <RolePlaysForm
              isEdit={false}
              roleplayName={roleplayName}
              setRoleplayName={setRoleplayName}
              selectedOrganization={selectedOrganization}
              setSelectedOrganization={setSelectedOrganization}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedSubcategory={selectedSubcategory}
              setSelectedSubcategory={setSelectedSubcategory}
              selectedPreCallPlans={selectedPreCallPlans}
              setSelectedPreCallPlans={setSelectedPreCallPlans}
              selectedAvatars={selectedAvatars}
              setSelectedAvatars={setSelectedAvatars}
              selectedGuardrails={selectedGuardrails}
              setSelectedGuardrails={setSelectedGuardrails}
              selectedDocument={selectedDocument}
              setSelectedDocument={setSelectedDocument}
              isActive={isActive}
              setIsActive={setIsActive}
              organizations={organizations}
              categories={categories}
              subcategories={subcategories}
              prePlans={prePlans}
              avatars={avatars}
              guardrails={guardrails}
              filteredDocuments={filteredDocuments}
            />

          </div>

          <SheetFooter className="border-t bg-background p-6 mt-auto">
            <div className="flex gap-3 w-full">
              <Button variant="outline" onClick={() => setIsCreateSheetOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleCreateRolePlay} className="flex-1 bg-gradient-primary hover:shadow-glow">
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
            <RolePlaysForm
              isEdit={true}
              roleplayName={roleplayName}
              setRoleplayName={setRoleplayName}
              selectedOrganization={selectedOrganization}
              setSelectedOrganization={setSelectedOrganization}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedSubcategory={selectedSubcategory}
              setSelectedSubcategory={setSelectedSubcategory}
              selectedPreCallPlans={selectedPreCallPlans}
              setSelectedPreCallPlans={setSelectedPreCallPlans}
              selectedAvatars={selectedAvatars}
              setSelectedAvatars={setSelectedAvatars}
              selectedGuardrails={selectedGuardrails}
              setSelectedGuardrails={setSelectedGuardrails}
              selectedDocument={selectedDocument}
              setSelectedDocument={setSelectedDocument}
              isActive={isActive}
              setIsActive={setIsActive}
              organizations={organizations}
              categories={categories}
              subcategories={subcategories}
              prePlans={prePlans}
              avatars={avatars}
              guardrails={guardrails}
              filteredDocuments={filteredDocuments}
            />

          </div>

          <SheetFooter className="border-t bg-background p-6 mt-auto">
            <div className="flex gap-3 w-full">
              <Button variant="outline" onClick={() => setIsEditSheetOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleUpdateRolePlay} className="flex-1 bg-gradient-primary hover:shadow-glow">
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

export default RolePlays;
