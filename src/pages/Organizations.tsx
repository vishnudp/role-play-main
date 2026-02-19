import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Mail, Phone, MapPin, FileText, X, Upload, Tag, Edit } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { fetchDocuments, uploadDocument, deleteDocument, fetchUsers, fetchOrganizations, addOrganizations, editOrganizations, deleteOrganizations } from "../api/apiService";
import { getOrganizationName, getUserName, formatToLongDate, formatFileSize, handleView, handleDownload } from "../lib/lookupUtils";
import { toast } from "sonner";
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
interface Document {
  id: string;
  name: string;
  tags: string;
  file: File | null;
}

const Organizations = () => {
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<any>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [orgToDelete, setOrgToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isViewSheetOpen, setIsViewSheetOpen] = useState(false);
  
  const [currentDocument, setCurrentDocument] = useState<Document>({
    id: Date.now().toString(),
    name: "",
    tags: "",
    file: null
  });

  const [formData, setFormData] = useState<any>({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    description: "",
    contact_person_name: "",
    contact_person_phone: "",
    contact_person_email: "",
    is_active: true,
  });

  const handleInputChange = (key: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [key]: value,
    }));
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
        await fetchUsers()
          .then((users) => setUsers(Array.isArray(users) ? users : []))
          .catch(() => setUsers([]));
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // const organizations = [
  //   {
  //     id: 1,
  //     name: "TechCorp Solutions",
  //     logo: "https://api.dicebear.com/7.x/initials/svg?seed=TC",
  //     ownerEmail: "john@techcorp.com",
  //     primaryPhone: "+1 234 567 8900",
  //     address: "123 Tech Street, San Francisco, CA 94102",
  //     contactEmail: "contact@techcorp.com",
  //     contactPhone: "+1 234 567 8901",
  //     users: 156,
  //     documents: 34,
  //     status: "Active"
  //   },
  //   {
  //     id: 2,
  //     name: "HealthPlus Medical",
  //     logo: "https://api.dicebear.com/7.x/initials/svg?seed=HP",
  //     ownerEmail: "sarah@healthplus.com",
  //     primaryPhone: "+1 234 567 8902",
  //     address: "456 Medical Ave, Boston, MA 02101",
  //     contactEmail: "info@healthplus.com",
  //     contactPhone: "+1 234 567 8903",
  //     users: 89,
  //     documents: 28,
  //     status: "Active"
  //   },
  //   {
  //     id: 3,
  //     name: "InnovateTech Inc",
  //     logo: "https://api.dicebear.com/7.x/initials/svg?seed=IT",
  //     ownerEmail: "michael@innovatetech.com",
  //     primaryPhone: "+1 234 567 8904",
  //     address: "789 Innovation Blvd, Austin, TX 78701",
  //     contactEmail: "support@innovatetech.com",
  //     contactPhone: "+1 234 567 8905",
  //     users: 234,
  //     documents: 52,
  //     status: "Active"
  //   },
  // ];

  const handleCreateOrganization = async () => {
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        address: formData.address,
        description: formData.description,
        contact_person_name: formData.contact_person_name,
        contact_person_phone: formData.contact_person_phone,
        contact_person_email: formData.contact_person_email,
        is_active: formData.is_active,
      };

      const res = await addOrganizations(payload);

      setOrganizations((prev) => [...prev, res.data]);

      setIsAddSheetOpen(false);

      const updatedOrgs = await fetchOrganizations();
      setOrganizations(Array.isArray(updatedOrgs) ? updatedOrgs : []);

      // Reset form
      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        address: "",
        description: "",
        contact_person_name: "",
        contact_person_phone: "",
        contact_person_email: "",
        is_active: true,
      });
      toast.success("Organization created successfully!");
    } catch (error) {
      console.error("Create org failed:", error);
      toast.error("Failed to create organization.");
    }
  };

  const handleEditOrg = (org: any) => {
    setSelectedOrg(org);

    setFormData({
  name: org.name || "",
  email: org.email || "",
  password: "",
  phone: org.phone || "",
  address: org.organization?.address || "",
  description: org.organization?.description || "",
  contact_person_name: org.organization?.contact_person_name || "",
  contact_person_phone: org.organization?.contact_person_phone || "",
  contact_person_email: org.organization?.contact_person_email || "",
  is_active: org.is_active ?? true,
});

    setIsEditSheetOpen(true);
  };

  const handleDeleteOrganization = async () => {
    if (!orgToDelete) return;

    try {
      setIsDeleting(true);

      await deleteOrganizations(orgToDelete.id);

      setOrganizations((prev) =>
        prev.filter((org) => org.id !== orgToDelete.id)
      );

      setOrgToDelete(null);
      toast.success("Organization deleted successfully!");
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete organization.");
    } finally {
      setIsDeleting(false);
    }
  };



  const handleUpdateOrganization = async () => {
    if (!selectedOrg) return;

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        description: formData.description,
        contact_person_name: formData.contact_person_name,
        contact_person_phone: formData.contact_person_phone,
        contact_person_email: formData.contact_person_email,
        is_active: formData.is_active,
      };

      // Only send password if filled
      if (formData.password) {
        payload["password"] = formData.password;
      }

      await editOrganizations(selectedOrg.id, payload);

      const updatedOrgs = await fetchOrganizations();
      setOrganizations(Array.isArray(updatedOrgs) ? updatedOrgs : []);

      setOrganizations((prev) =>
        prev.map((org) =>
          org.id === selectedOrg.id ? { ...org, ...payload } : org
        )
      );

      setIsEditSheetOpen(false);
      setSelectedOrg(null);
      toast.success("Organization updated successfully!");
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Failed to update organization.");
    }
  };

  const handleViewOrg = (org: any) => {
  setSelectedOrg(org);

  setFormData({
  name: org.name || "",
  email: org.email || "",
  password: "",
  phone: org.phone || "",
  address: org.organization?.address || "",
  description: org.organization?.description || "",
  contact_person_name: org.organization?.contact_person_name || "",
  contact_person_phone: org.organization?.contact_person_phone || "",
  contact_person_email: org.organization?.contact_person_email || "",
  is_active: org.is_active ?? true,
});

  setIsViewSheetOpen(true);
};


  const handleAddDocument = () => {
    if (currentDocument.name.trim()) {
      setDocuments([...documents, currentDocument]);
      setCurrentDocument({
        id: Date.now().toString(),
        name: "",
        tags: "",
        file: null
      });
    }
  };

  const handleAddWithoutFile = () => {
    if (currentDocument.name.trim()) {
      setDocuments([...documents, { ...currentDocument, file: null }]);
      setCurrentDocument({
        id: Date.now().toString(),
        name: "",
        tags: "",
        file: null
      });
    }
  };

  const handleRemoveDocument = (id: string) => {
    setDocuments(documents.filter(doc => doc.id !== id));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCurrentDocument({ ...currentDocument, file: e.target.files[0] });
    }
  };

  // const handleEditOrg = (org: any) => {
  //   setSelectedOrg(org);
  //   setIsEditSheetOpen(true);
  // };

  return (
    <DashboardLayout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground tracking-tight">Organizations</h1>
            <p className="text-muted-foreground mt-2">Manage multi-tenant organizations and their isolated data spaces</p>
          </div>
          <Button
            onClick={() => setIsAddSheetOpen(true)}
            className="bg-gradient-primary hover:shadow-glow transition-all duration-300 h-11 px-6"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Organization
          </Button>
        </div>

        {/* Search */}
        <Card className="border-border/50 shadow-sm">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search organizations by name, email, or phone..." className="pl-10 h-11 bg-background border-border/50" />
            </div>
          </CardContent>
        </Card>

        {/* Organizations List */}
        <Card className="border-border/50 shadow-sm">
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/50">
                  <TableHead className="font-semibold">Organization</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {organizations.map((org) => (
                  <TableRow key={org.id} className="border-border/50 hover:bg-muted/30">
                    <TableCell>
                      <p className="font-semibold text-foreground">{org.name}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={org.is_active ? "default" : "secondary"}>
                        {org.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm" className="h-8" onClick={() => handleEditOrg(org)}>
                          <Edit className="h-3.5 w-3.5 mr-1.5" />
                          Edit
                        </Button>

                        <Button variant="outline" size="sm" className="h-8" onClick={() => handleViewOrg(org)}>
                          View
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="h-8"
                              onClick={() => setOrgToDelete(org)}
                            >
                              Delete
                            </Button>
                          </AlertDialogTrigger>

                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete Organization
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete{" "}
                                <strong>{org.name}</strong>?
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>

                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setOrgToDelete(null)}>
                                Cancel
                              </AlertDialogCancel>

                              <AlertDialogAction
                                onClick={handleDeleteOrganization}
                                disabled={isDeleting}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                {isDeleting ? "Deleting..." : "Delete"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Add Organization Sheet */}
        <Sheet open={isAddSheetOpen} onOpenChange={setIsAddSheetOpen}>
          <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto flex flex-col p-0">
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                <SheetHeader>
                  <SheetTitle className="text-2xl">Add Organization</SheetTitle>
                  <SheetDescription>Create a new organization with isolated data space</SheetDescription>
                </SheetHeader>

                <div className="space-y-6 py-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="entity-name">Entity Name *</Label>
                        <Input id="entity-name" placeholder="Enter entity name" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="entity-address">Entity Address</Label>
                        <Input id="entity-address" placeholder="Enter address" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea id="description" placeholder="Enter organization description" rows={3} />
                    </div>
                  </div>

                  {/* Organisation Login Credentials */}
                  <div className="space-y-4 border-t pt-4">
                    <h3 className="text-lg font-semibold text-foreground">Organisation Login Credentials</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-email">Login Email *</Label>
                        <Input id="login-email" type="email" placeholder="login@example.com" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="login-password">Password *</Label>
                        <Input id="login-password" type="password" placeholder="Enter password" required />
                      </div>
                    </div>
                  </div>



                  {/* Contact Information */}
                  <div className="space-y-4 border-t pt-4">
                    <h3 className="text-lg font-semibold text-foreground">Contact Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contact-name">Contact Name</Label>
                        <Input id="contact-name" type="text" placeholder="Enter contact name" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact-email">Contact Email</Label>
                        <Input id="contact-email" type="email" placeholder="contact@example.com" />
                      </div>
                      
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                     
                      <div className="space-y-2">
                        <Label htmlFor="contact-phone">Contact Phone</Label>
                        <Input id="contact-phone" type="tel" placeholder="+1 234 567 8900" />
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-between border-t pt-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="active-status">Active</Label>
                      <p className="text-sm text-muted-foreground">Enable this organization</p>
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
                <Button className="flex-1 bg-gradient-primary" onClick={handleCreateOrganization}>
                  Create Organization
                </Button>
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {/* Edit Organization Sheet */}
        <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
          <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto flex flex-col p-0">
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                <SheetHeader>
                  <SheetTitle className="text-2xl">Edit Organization</SheetTitle>
                  <SheetDescription>Update organization details and settings</SheetDescription>
                </SheetHeader>

                {selectedOrg && (
                  <div className="space-y-6 py-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-entity-name">Entity Name *</Label>
                          <Input id="edit-entity-name" value={formData.name}
onChange={(e) => handleInputChange("name", e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-entity-address">Entity Address</Label>
                          <Input id="edit-entity-address" value={formData.address}
onChange={(e) => handleInputChange("address", e.target.value)} />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-description">Description</Label>
                        <Textarea id="edit-description" placeholder="Enter Description" value={formData.description} onChange={(e) => handleInputChange("description", e.target.value)} rows={3} />
                      </div>
                    </div>

                    {/* Organisation Login Credentials */}
                    <div className="space-y-4 border-t pt-4">
                      <h3 className="text-lg font-semibold text-foreground">Organisation Login Credentials</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-login-email">Login Email *</Label>
                          <Input id="edit-login-email" type="email" placeholder="login@example.com" value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-login-password">Password</Label>
                          <Input id="edit-login-password" type="password" placeholder="Leave blank to keep current" 
                           value={formData.password}
  onChange={(e) => handleInputChange("password", e.target.value)}
  />
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-4 border-t pt-4">
                      <h3 className="text-lg font-semibold text-foreground">Contact Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-contact-name">Contact Name</Label>
                          <Input id="edit-contact-name" type="text" value={formData.contact_person_name}
  onChange={(e) => handleInputChange("contact_person_name", e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-contact-email">Contact Email</Label>
                          <Input id="edit-contact-email" type="email" value={formData.contact_person_email}
  onChange={(e) => handleInputChange("contact_person_email", e.target.value)} />
                        </div>
                      </div>
                       <div className="grid grid-cols-2 gap-4">
                        
                        <div className="space-y-2">
                          <Label htmlFor="edit-contact-phone">Contact Phone</Label>
                          <Input id="edit-contact-phone" type="tel" value={formData.contact_person_phone} onChange={(e) => handleInputChange("contact_person_phone", e.target.value)} />
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center justify-between border-t pt-4">
                      <div className="space-y-0.5">
                        <Label htmlFor="edit-active-status">Active</Label>
                        <p className="text-sm text-muted-foreground">Enable this organization</p>
                      </div>
                      <Switch id="edit-active-status" checked={formData.is_active}
  onCheckedChange={(val) => handleInputChange("is_active", val)} />
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
                <Button className="flex-1 bg-gradient-primary" onClick={handleUpdateOrganization}>
                  Save Changes
                </Button>
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {/* View Organization Sheet */}
<Sheet open={isViewSheetOpen} onOpenChange={setIsViewSheetOpen}>
  <SheetContent side="right" className="w-full sm:max-w-2xl">
    <div className="p-6 space-y-6">
      <SheetHeader>
        <SheetTitle>View Organization</SheetTitle>
        <SheetDescription>Read-only organization details</SheetDescription>
      </SheetHeader>

      {selectedOrg && (
        <div className="space-y-4">

          <div>
            <Label>Entity Name</Label>
            <Input value={formData.name} disabled />
          </div>

          <div>
            <Label>Email</Label>
            <Input value={formData.email} disabled />
          </div>

          <div>
            <Label>Phone</Label>
            <Input value={formData.phone} disabled />
          </div>

          <div>
            <Label>Address</Label>
            <Input value={formData.address} disabled />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea value={formData.description} disabled />
          </div>

          <div>
            <Label>Contact Person Name</Label>
            <Input value={formData.contact_person_name} disabled />
          </div>

          <div>
            <Label>Contact Person Phone</Label>
            <Input value={formData.contact_person_phone} disabled />
          </div>

          <div>
            <Label>Contact Person Email</Label>
            <Input value={formData.contact_person_email} disabled />
          </div>

          <div className="flex items-center justify-between">
            <Label>Active</Label>
            <Switch checked={formData.is_active} disabled />
          </div>

        </div>
      )}

      <SheetFooter>
        <Button onClick={() => setIsViewSheetOpen(false)}>
          Close
        </Button>
      </SheetFooter>
    </div>
  </SheetContent>
</Sheet>

      </div>
    </DashboardLayout>
  );
};

export default Organizations;
