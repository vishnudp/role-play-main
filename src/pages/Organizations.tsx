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
import { useState } from "react";

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
  const [currentDocument, setCurrentDocument] = useState<Document>({
    id: Date.now().toString(),
    name: "",
    tags: "",
    file: null
  });

  const organizations = [
    {
      id: 1,
      name: "TechCorp Solutions",
      logo: "https://api.dicebear.com/7.x/initials/svg?seed=TC",
      ownerEmail: "john@techcorp.com",
      primaryPhone: "+1 234 567 8900",
      address: "123 Tech Street, San Francisco, CA 94102",
      contactEmail: "contact@techcorp.com",
      contactPhone: "+1 234 567 8901",
      users: 156,
      documents: 34,
      status: "Active"
    },
    {
      id: 2,
      name: "HealthPlus Medical",
      logo: "https://api.dicebear.com/7.x/initials/svg?seed=HP",
      ownerEmail: "sarah@healthplus.com",
      primaryPhone: "+1 234 567 8902",
      address: "456 Medical Ave, Boston, MA 02101",
      contactEmail: "info@healthplus.com",
      contactPhone: "+1 234 567 8903",
      users: 89,
      documents: 28,
      status: "Active"
    },
    {
      id: 3,
      name: "InnovateTech Inc",
      logo: "https://api.dicebear.com/7.x/initials/svg?seed=IT",
      ownerEmail: "michael@innovatetech.com",
      primaryPhone: "+1 234 567 8904",
      address: "789 Innovation Blvd, Austin, TX 78701",
      contactEmail: "support@innovatetech.com",
      contactPhone: "+1 234 567 8905",
      users: 234,
      documents: 52,
      status: "Active"
    },
  ];

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

  const handleEditOrg = (org: any) => {
    setSelectedOrg(org);
    setIsEditSheetOpen(true);
  };

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
                      <Badge variant={org.status === "Active" ? "default" : "secondary"}>
                        {org.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm" className="h-8" onClick={() => handleEditOrg(org)}>
                          <Edit className="h-3.5 w-3.5 mr-1.5" />
                          Edit
                        </Button>
                        
                        <Button variant="outline" size="sm" className="h-8">
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
                        <Label htmlFor="contact-email">Contact Email</Label>
                        <Input id="contact-email" type="email" placeholder="contact@example.com" />
                      </div>
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
                <Button className="flex-1 bg-gradient-primary">
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
                          <Input id="edit-entity-name" defaultValue={selectedOrg.name} required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-entity-address">Entity Address</Label>
                          <Input id="edit-entity-address" defaultValue={selectedOrg.address} />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-description">Description</Label>
                        <Textarea id="edit-description" placeholder="Enter organization description" rows={3} />
                      </div>
                    </div>

                    {/* Organisation Login Credentials */}
                    <div className="space-y-4 border-t pt-4">
                      <h3 className="text-lg font-semibold text-foreground">Organisation Login Credentials</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-login-email">Login Email *</Label>
                          <Input id="edit-login-email" type="email" placeholder="login@example.com" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-login-password">Password</Label>
                          <Input id="edit-login-password" type="password" placeholder="Leave blank to keep current" />
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-4 border-t pt-4">
                      <h3 className="text-lg font-semibold text-foreground">Contact Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-contact-email">Contact Email</Label>
                          <Input id="edit-contact-email" type="email" defaultValue={selectedOrg.contactEmail} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-contact-phone">Contact Phone</Label>
                          <Input id="edit-contact-phone" type="tel" defaultValue={selectedOrg.contactPhone} />
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center justify-between border-t pt-4">
                      <div className="space-y-0.5">
                        <Label htmlFor="edit-active-status">Active</Label>
                        <p className="text-sm text-muted-foreground">Enable this organization</p>
                      </div>
                      <Switch id="edit-active-status" defaultChecked={selectedOrg.status === "Active"} />
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
      </div>
    </DashboardLayout>
  );
};

export default Organizations;
