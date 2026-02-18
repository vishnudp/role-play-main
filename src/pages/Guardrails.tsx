import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Shield, FileText, Plus, MoreHorizontal, Pencil, Trash2, Search, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchGuardrails, fetchOrganizations, fetchDocuments, fetchUsers, addGuardrail, editGuardrail, deleteGuardrail } from "@/api/apiService";
import { getOrganizationName } from "../lib/lookupUtils";

// Mock organizations
// const organizations = [
//   { id: "1", name: "Acme Healthcare" },
//   { id: "2", name: "Metro Medical Center" },
//   { id: "3", name: "Pacific Health Systems" },
//   { id: "4", name: "TechCorp" },
//   { id: "5", name: "HealthPlus" },
// ];

// // Mock documents from Document Management
// const availableDocuments = [
//   { id: "1", name: "HIPAA Compliance Guide", organization: "Acme Healthcare" },
//   { id: "2", name: "Employee Training Manual", organization: "Acme Healthcare" },
//   { id: "3", name: "Data Protection Policy", organization: "Metro Medical Center" },
//   { id: "4", name: "BAA Agreement", organization: "Metro Medical Center" },
//   { id: "5", name: "Security Protocols", organization: "Pacific Health Systems" },
// ];

interface GuardrailFormProps {
  formData: {
    name: string;
    organizations: string[];
    instructions: string;
    documents: string[];
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    name: string;
    organizations: string[];
    instructions: string;
    documents: string[];
  }>>;
  organizations: any[];
  availableDocuments: any[];
  orgSearchQuery: string;
  setOrgSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  docSearchQuery: string;
  setDocSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  isOrgsPopoverOpen: boolean;
  setIsOrgsPopoverOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isDocsPopoverOpen: boolean;
  setIsDocsPopoverOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggleOrganization: (id: string) => void;
  removeOrganization: (id: string) => void;
  toggleDocument: (id: string) => void;
  removeDocument: (id: string) => void;
  filteredOrganizations: any[];
  filteredDocuments: any[];
  resetForm: () => void;
  setIsAddSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsEditSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onSubmit: () => void;
  submitLabel: string;
}


interface Guardrail {
  id: string;
  name: string;
  organizations: string[];
  instructions: string;
  documents: string[];
  status: "Active" | "Inactive";
  createdAt: string;
}

  const GuardrailForm = ({
  formData,
  setFormData,
  organizations,
  availableDocuments,
  orgSearchQuery,
  setOrgSearchQuery,
  docSearchQuery,
  setDocSearchQuery,
  isOrgsPopoverOpen,
  setIsOrgsPopoverOpen,
  isDocsPopoverOpen,
  setIsDocsPopoverOpen,
  toggleOrganization,
  removeOrganization,
  toggleDocument,
  removeDocument,
  filteredOrganizations,
  filteredDocuments,
  resetForm,
  setIsAddSheetOpen,
  setIsEditSheetOpen,
  onSubmit,
  submitLabel
}: GuardrailFormProps) => (
    <>
      <div className="flex-1 overflow-y-auto space-y-6 py-6">
        <div className="space-y-2">
          <Label htmlFor="name">Guardrail Name *</Label>
          <Input
            id="name"
            placeholder="Enter guardrail name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        {/* Multi-select Organizations */}
        <div className="space-y-2">
          <Label>Select Organizations *</Label>
          <Popover open={isOrgsPopoverOpen} onOpenChange={setIsOrgsPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className={cn(
                  "w-full h-auto min-h-11 justify-between text-left font-normal border-border/50",
                  formData.organizations.length === 0 && "text-muted-foreground"
                )}
              >
                <div className="flex flex-wrap gap-1 flex-1">
                  {formData.organizations.length === 0 ? (
                    <span>Select organizations</span>
                  ) : (
                    formData.organizations.map((orgId) => {
                      const org = organizations.find(o => o.id === orgId);
                      return org ? (
                        <Badge
                          key={orgId}
                          variant="secondary"
                          className="mr-1 mb-1"
                        >
                          {org.name}
                          <button
                            className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                removeOrganization(orgId);
                              }
                            }}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              removeOrganization(orgId);
                            }}
                          >
                            <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                          </button>
                        </Badge>
                      ) : null;
                    })
                  )}
                </div>
                <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-2" align="start">
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search organizations..."
                    className="pl-10 h-9"
                    value={orgSearchQuery}
                    onChange={(e) => setOrgSearchQuery(e.target.value)}
                  />
                </div>
                <div className="max-h-[200px] overflow-y-auto space-y-1">
                  {filteredOrganizations.map((org) => (
                    <div
                      key={org.id}
                      className="flex items-center space-x-2 p-2 hover:bg-muted/50 rounded-md cursor-pointer"
                      onClick={() => toggleOrganization(org.id)}
                    >
                      <Checkbox
                        checked={formData.organizations.includes(org.id)}
                        onCheckedChange={() => toggleOrganization(org.id)}
                      />
                      <span className="text-sm">{org.name}</span>
                    </div>
                  ))}
                  {filteredOrganizations.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-2">No organizations found</p>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="instructions">Instructions *</Label>
          <Textarea
            id="instructions"
            placeholder="Enter guardrail instructions..."
            value={formData.instructions}
            onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
            className="min-h-[150px] resize-y"
          />
          <p className="text-xs text-muted-foreground">
            Define rules and guidelines for conversations
          </p>
        </div>

        {/* Multi-select Documents */}
        <div className="space-y-2">
          <Label>Select Documents (Optional)</Label>
          <Popover open={isDocsPopoverOpen} onOpenChange={setIsDocsPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className={cn(
                  "w-full h-auto min-h-11 justify-between text-left font-normal border-border/50",
                  formData.documents.length === 0 && "text-muted-foreground"
                )}
              >
                <div className="flex flex-wrap gap-1 flex-1">
                  {formData.documents.length === 0 ? (
                    <span>Select documents</span>
                  ) : (
                    formData.documents.map((docId) => {
                      const doc = availableDocuments.find(d => d.id === docId);
                      return doc ? (
                        <Badge
                          key={docId}
                          variant="secondary"
                          className="mr-1 mb-1"
                        >
                          {doc.name}
                          <button
                            className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                removeDocument(docId);
                              }
                            }}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              removeDocument(docId);
                            }}
                          >
                            <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                          </button>
                        </Badge>
                      ) : null;
                    })
                  )}
                </div>
                <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-2" align="start">
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search documents..."
                    className="pl-10 h-9"
                    value={docSearchQuery}
                    onChange={(e) => setDocSearchQuery(e.target.value)}
                  />
                </div>
                <div className="max-h-[200px] overflow-y-auto space-y-1">
                  {filteredDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center space-x-2 p-2 hover:bg-muted/50 rounded-md cursor-pointer"
                      onClick={() => toggleDocument(doc.id)}
                    >
                      <Checkbox
                        checked={formData.documents.includes(doc.id)}
                        onCheckedChange={() => toggleDocument(doc.id)}
                      />
                      <div className="text-sm">
                        <span className="font-medium">{doc.name}</span>
                        <span className="text-muted-foreground ml-1">({getOrganizationName(organizations, doc.organization_id)})</span>
                      </div>
                    </div>
                  ))}
                  {filteredDocuments.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-2">No documents found</p>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <SheetFooter className="border-t pt-4 mt-auto">
        <Button variant="outline" onClick={() => {
          resetForm();
          setIsAddSheetOpen(false);
          setIsEditSheetOpen(false);
        }}>
          Cancel
        </Button>
        <Button onClick={onSubmit}>{submitLabel}</Button>
      </SheetFooter>
    </>
  );

const Guardrails = () => {
  const [guardrails, setGuardrails] = useState<Guardrail[]>([]);
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [selectedGuardrail, setSelectedGuardrail] = useState<Guardrail | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [availableDocuments, setDocuments] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  // Popover states
  const [isOrgsPopoverOpen, setIsOrgsPopoverOpen] = useState(false);
  const [isDocsPopoverOpen, setIsDocsPopoverOpen] = useState(false);
  const [orgSearchQuery, setOrgSearchQuery] = useState("");
  const [docSearchQuery, setDocSearchQuery] = useState("");
  const [guardrailToDelete, setGuardrailToDelete] = useState<Guardrail | null>(null);

  useEffect(() => {
   async function loadData() {
    setLoading(true);
    try {
      const fetchedGuardrails = await fetchGuardrails();
      const normalizedGuardrails = (Array.isArray(fetchedGuardrails) ? fetchedGuardrails : []).map(g => ({
        id: g.id,
        name: g.name,
        instructions: g.instructions,
        status: g.status || "Active",
        createdAt: g.created_at,
        organizations: g.organizations.map((org: any) => org.organization_id), // <-- string array
        documents: g.documents.map((doc: any) => doc.document_id), // <-- string array
      }));
      setGuardrails(normalizedGuardrails);

      const orgs = await fetchOrganizations();
      setOrganizations(Array.isArray(orgs) ? orgs : []);

      const docs = await fetchDocuments();
      setDocuments(Array.isArray(docs) ? docs : []);

      const users = await fetchUsers();
      setUsers(Array.isArray(users) ? users : []);
    } catch (err) {
      console.error(err);
      setGuardrails([]);
      setOrganizations([]);
      setDocuments([]);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }
  loadData();
}, []);
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    organizations: [] as string[],
    instructions: "",
    documents: [] as string[],
  });

  const resetForm = () => {
    setFormData({
      name: "",
      organizations: [],
      instructions: "",
      documents: [],
    });
    setOrgSearchQuery("");
    setDocSearchQuery("");
  };

 const handleAddGuardrail = async () => {
  if (!formData.name || formData.organizations.length === 0 || !formData.instructions) {
    toast.error("Please fill in all required fields");
    return;
  }

  const payload = {
    name: formData.name,
    instructions: formData.instructions,
    organization_ids: formData.organizations, // strings only
    document_ids: formData.documents,
  };

  try {
    await addGuardrail(payload); // call API to create new guardrail

    // Refetch all guardrails to get latest organizations/documents
    const fetchedGuardrails = await fetchGuardrails();
    const normalizedGuardrails = (Array.isArray(fetchedGuardrails) ? fetchedGuardrails : []).map(g => ({
      id: g.id,
      name: g.name,
      instructions: g.instructions,
      status: g.status || "Active",
      createdAt: g.created_at,
      organizations: g.organizations.map((org: any) => org.organization_id),
      documents: g.documents.map((doc: any) => doc.document_id),
    }));
    setGuardrails(normalizedGuardrails);

    resetForm();
    setIsAddSheetOpen(false);
    toast.success("Guardrail created successfully");
  } catch (err) {
    console.error(err);
    toast.error("Failed to add guardrail");
  }
};


const handleEditGuardrail = async () => {
  if (!selectedGuardrail) return;
  if (!formData.name || formData.organizations.length === 0 || !formData.instructions) {
    toast.error("Please fill in all required fields");
    return;
  }

  const payload = {
    name: formData.name,
    instructions: formData.instructions,
    organization_ids: formData.organizations,
    document_ids: formData.documents,
  };

  try {
    await editGuardrail(selectedGuardrail.id, payload); // update API

    // Refetch all guardrails to get latest organizations/documents
    const fetchedGuardrails = await fetchGuardrails();
    const normalizedGuardrails = (Array.isArray(fetchedGuardrails) ? fetchedGuardrails : []).map(g => ({
      id: g.id,
      name: g.name,
      instructions: g.instructions,
      status: g.status || "Active",
      createdAt: g.created_at,
      organizations: g.organizations.map((org: any) => org.organization_id),
      documents: g.documents.map((doc: any) => doc.document_id),
    }));
    setGuardrails(normalizedGuardrails);

    resetForm();
    setSelectedGuardrail(null);
    setIsEditSheetOpen(false);
    toast.success("Guardrail updated successfully");
  } catch (err) {
    console.error(err);
    toast.error("Failed to update guardrail");
  }
};



const confirmDeleteGuardrail = async () => {
  if (!guardrailToDelete) return;

  try {
    await deleteGuardrail(guardrailToDelete.id); // call API
    setGuardrails(prev => prev.filter(g => g.id !== guardrailToDelete.id));
    toast.success("Guardrail deleted successfully");
  } catch (err) {
    console.error(err);
    toast.error("Failed to delete guardrail");
  } finally {
    setGuardrailToDelete(null);
  }
};


  const handleDeleteGuardrail = (id: string) => {
    setGuardrails(guardrails.filter(g => g.id !== id));
    toast.success("Guardrail deleted successfully");
  };

  const openEditSheet = (guardrail: Guardrail & { organizations: any[], documents: any[] }) => {
  setSelectedGuardrail(guardrail);
  setFormData({
    name: guardrail.name,
    organizations: guardrail.organizations?.map((org: any) =>
      typeof org === "string" ? org : org.organization_id
    ),
    instructions: guardrail.instructions,
    documents: guardrail.documents?.map((doc: any) =>
      typeof doc === "string" ? doc : doc.document_id
    ),
  });
  setIsEditSheetOpen(true);
};


 const toggleOrganization = (orgId: string) => {
  setFormData(prev => ({
    ...prev,
    // always store ONLY strings
    organizations: prev.organizations.includes(orgId)
      ? prev.organizations.filter(id => id !== orgId)
      : [...prev.organizations, orgId]
  }));
};

  const removeOrganization = (orgId: string) => {
    setFormData(prev => ({
      ...prev,
      organizations: prev.organizations.filter(id => id !== orgId)
    }));
  };

  const toggleDocument = (docId: string) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.includes(docId)
        ? prev.documents.filter(id => id !== docId)
        : [...prev.documents, docId]
    }));
  };

  const removeDocument = (docId: string) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter(id => id !== docId)
    }));
  };

  const filteredOrganizations = organizations.filter(org =>
    org.name.toLowerCase().includes(orgSearchQuery.toLowerCase())
  );

  const filteredDocuments = availableDocuments.filter(doc =>
    doc.name.toLowerCase().includes(docSearchQuery.toLowerCase())
  );

  const filteredGuardrails = guardrails.filter(g =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );



  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Guardrails & Governance</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Define conversation guidelines and compliance rules
            </p>
          </div>
          <Button onClick={() => setIsAddSheetOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Guardrail
          </Button>
        </div>

        {/* Search */}
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search guardrails..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Guardrails Table */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium">
              Guardrails ({filteredGuardrails.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-border/50">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="font-medium">Name</TableHead>
                    <TableHead className="font-medium">Organizations</TableHead>
                    <TableHead className="font-medium">Documents</TableHead>
                    <TableHead className="font-medium">Status</TableHead>
                    <TableHead className="font-medium text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGuardrails.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                        <Shield className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>No guardrails found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredGuardrails.map((guardrail) => (
                      <TableRow key={guardrail.id} className="group">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Shield className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{guardrail.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Created {guardrail.createdAt}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {guardrail.organizations?.slice(0, 2).map(orgId => {
                              const org = organizations.find(o => o.id === orgId);
                              return org ? (
                                <Badge key={orgId} variant="outline" className="font-normal">
                                  {getOrganizationName(organizations, orgId)}
                                </Badge>
                              ) : null;
                            })}
                            {guardrail.organizations?.length > 2 && (
                              <Badge variant="secondary" className="font-normal">
                                +{guardrail.organizations.length - 2} more
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              {guardrail.documents?.length} document(s)
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={guardrail.status === "Active" ? "default" : "secondary"}>
                            {guardrail.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="gap-2 cursor-pointer"
                                onClick={() => openEditSheet(guardrail)}
                              >
                                <Pencil className="h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                                onClick={() => handleDeleteGuardrail(guardrail.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Guardrail Sheet */}
      <Sheet open={isAddSheetOpen} onOpenChange={(open) => {
        setIsAddSheetOpen(open);
        if (!open) resetForm();
      }}>
        <SheetContent className="sm:max-w-lg flex flex-col">
          <SheetHeader>
            <SheetTitle>Add Guardrail</SheetTitle>
            <SheetDescription>
              Create a new guardrail for organizations
            </SheetDescription>
          </SheetHeader>
          <GuardrailForm
  formData={formData}
  setFormData={setFormData}
  organizations={organizations}
  availableDocuments={availableDocuments}
  orgSearchQuery={orgSearchQuery}
  setOrgSearchQuery={setOrgSearchQuery}
  docSearchQuery={docSearchQuery}
  setDocSearchQuery={setDocSearchQuery}
  isOrgsPopoverOpen={isOrgsPopoverOpen}
  setIsOrgsPopoverOpen={setIsOrgsPopoverOpen}
  isDocsPopoverOpen={isDocsPopoverOpen}
  setIsDocsPopoverOpen={setIsDocsPopoverOpen}
  toggleOrganization={toggleOrganization}
  removeOrganization={removeOrganization}
  toggleDocument={toggleDocument}
  removeDocument={removeDocument}
  filteredOrganizations={filteredOrganizations}
  filteredDocuments={filteredDocuments}
  resetForm={resetForm}
  setIsAddSheetOpen={setIsAddSheetOpen}
  setIsEditSheetOpen={setIsEditSheetOpen}
  onSubmit={handleAddGuardrail}
  submitLabel="Add Guardrail"
/>

        </SheetContent>
      </Sheet>

      {/* Edit Guardrail Sheet */}
      <Sheet open={isEditSheetOpen} onOpenChange={(open) => {
        setIsEditSheetOpen(open);
        if (!open) {
          resetForm();
          setSelectedGuardrail(null);
        }
      }}>
        <SheetContent className="sm:max-w-lg flex flex-col">
          <SheetHeader>
            <SheetTitle>Edit Guardrail</SheetTitle>
            <SheetDescription>
              Update guardrail settings
            </SheetDescription>
          </SheetHeader>
          <GuardrailForm
  formData={formData}
  setFormData={setFormData}
  organizations={organizations}
  availableDocuments={availableDocuments}
  orgSearchQuery={orgSearchQuery}
  setOrgSearchQuery={setOrgSearchQuery}
  docSearchQuery={docSearchQuery}
  setDocSearchQuery={setDocSearchQuery}
  isOrgsPopoverOpen={isOrgsPopoverOpen}
  setIsOrgsPopoverOpen={setIsOrgsPopoverOpen}
  isDocsPopoverOpen={isDocsPopoverOpen}
  setIsDocsPopoverOpen={setIsDocsPopoverOpen}
  toggleOrganization={toggleOrganization}
  removeOrganization={removeOrganization}
  toggleDocument={toggleDocument}
  removeDocument={removeDocument}
  filteredOrganizations={filteredOrganizations}
  filteredDocuments={filteredDocuments}
  resetForm={resetForm}
  setIsAddSheetOpen={setIsAddSheetOpen}
  setIsEditSheetOpen={setIsEditSheetOpen}
  onSubmit={handleEditGuardrail}
  submitLabel="Update Guardrail"
/>

        </SheetContent>
      </Sheet>
      {/* ✅ Confirmation modal for deletion */}
      {guardrailToDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[350px]">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="mb-6">
              Are you sure you want to delete <strong>{guardrailToDelete.name}</strong>?
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setGuardrailToDelete(null)}>Cancel</Button>
              <Button variant="destructive" onClick={confirmDeleteGuardrail}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Guardrails;
