import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Plus, Edit, Trash2, Upload } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface Certification {
  id: number;
  name: string;
  organization: string;
  roleplays: string[];
  minimumScore: number;
  badgeUrl: string | null;
}

const Certifications = () => {
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [selectedCertification, setSelectedCertification] = useState<Certification | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [certToDelete, setCertToDelete] = useState<Certification | null>(null);

  // Mock data
  const organizations = [
    { id: 1, name: "TechCorp" },
    { id: 2, name: "ServiceHub" },
    { id: 3, name: "DealMakers" },
  ];

  const allRoleplays = [
    { id: 1, name: "Sales Consultation - Q1 2024", organization: "TechCorp" },
    { id: 2, name: "Customer Support Training", organization: "ServiceHub" },
    { id: 3, name: "Technical Troubleshooting", organization: "TechCorp" },
    { id: 4, name: "Negotiation Practice", organization: "DealMakers" },
    { id: 5, name: "Product Demo Training", organization: "TechCorp" },
  ];

  const [certifications, setCertifications] = useState<Certification[]>([
    {
      id: 1,
      name: "Sales Mastery Certificate",
      organization: "TechCorp",
      roleplays: ["Sales Consultation - Q1 2024", "Product Demo Training"],
      minimumScore: 7,
      badgeUrl: null,
    },
    {
      id: 2,
      name: "Customer Service Excellence",
      organization: "ServiceHub",
      roleplays: ["Customer Support Training"],
      minimumScore: 8,
      badgeUrl: null,
    },
  ]);

  const [formData, setFormData] = useState({
    name: "",
    organizationId: "",
    roleplayIds: [] as string[],
    minimumScore: [5],
    badgeFile: null as File | null,
    badgePreview: null as string | null,
  });

  const getSelectedOrgName = () => {
    if (!formData.organizationId) return "";
    const org = organizations.find(o => o.id === parseInt(formData.organizationId));
    return org?.name || "";
  };

  const getFilteredRoleplays = () => {
    const orgName = getSelectedOrgName();
    if (!orgName) return [];
    return allRoleplays.filter(r => r.organization === orgName);
  };

  const handleRoleplayToggle = (roleplayId: string) => {
    if (formData.roleplayIds.includes(roleplayId)) {
      setFormData({ ...formData, roleplayIds: formData.roleplayIds.filter(id => id !== roleplayId) });
    } else {
      setFormData({ ...formData, roleplayIds: [...formData.roleplayIds, roleplayId] });
    }
  };

  const handleBadgeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);
      setFormData({ ...formData, badgeFile: file, badgePreview: previewUrl });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      organizationId: "",
      roleplayIds: [],
      minimumScore: [5],
      badgeFile: null,
      badgePreview: null,
    });
  };

  const handleCreate = () => {
    if (!formData.name || !formData.organizationId) {
      toast.error("Please fill in all required fields");
      return;
    }

    const orgName = getSelectedOrgName();
    const roleplayNames = formData.roleplayIds.map(id =>
      allRoleplays.find(r => r.id === parseInt(id))?.name || ""
    ).filter(Boolean);

    const newCert: Certification = {
      id: Date.now(),
      name: formData.name,
      organization: orgName,
      roleplays: roleplayNames,
      minimumScore: formData.minimumScore[0],
      badgeUrl: formData.badgePreview,
    };

    setCertifications([...certifications, newCert]);
    setIsCreateSheetOpen(false);
    resetForm();
    toast.success("Certification created successfully");
  };

  const handleEditClick = (cert: Certification) => {
    setSelectedCertification(cert);
    const orgId = organizations.find(o => o.name === cert.organization)?.id?.toString() || "";
    const roleplayIds = cert.roleplays.map(name =>
      allRoleplays.find(r => r.name === name)?.id?.toString() || ""
    ).filter(Boolean);

    setFormData({
      name: cert.name,
      organizationId: orgId,
      roleplayIds,
      minimumScore: [cert.minimumScore],
      badgeFile: null,
      badgePreview: cert.badgeUrl,
    });
    setIsEditSheetOpen(true);
  };

  const handleUpdate = () => {
    if (!selectedCertification) return;

    const orgName = getSelectedOrgName();
    const roleplayNames = formData.roleplayIds.map(id =>
      allRoleplays.find(r => r.id === parseInt(id))?.name || ""
    ).filter(Boolean);

    const updated: Certification = {
      ...selectedCertification,
      name: formData.name,
      organization: orgName,
      roleplays: roleplayNames,
      minimumScore: formData.minimumScore[0],
      badgeUrl: formData.badgePreview || selectedCertification.badgeUrl,
    };

    setCertifications(certifications.map(c => c.id === selectedCertification.id ? updated : c));
    setIsEditSheetOpen(false);
    setSelectedCertification(null);
    resetForm();
    toast.success("Certification updated successfully");
  };

  const handleDeleteClick = (cert: Certification) => {
    setCertToDelete(cert);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (certToDelete) {
      setCertifications(certifications.filter(c => c.id !== certToDelete.id));
      toast.success("Certification deleted successfully");
    }
    setIsDeleteDialogOpen(false);
    setCertToDelete(null);
  };

  const CertificationForm = ({ isEdit = false }: { isEdit?: boolean }) => {
    const filteredRoleplays = getFilteredRoleplays();

    return (
      <div className="space-y-6 py-6">
        {/* Organization */}
        <div className="space-y-2">
          <Label>Organization <span className="text-destructive">*</span></Label>
          <Select
            value={formData.organizationId}
            onValueChange={(value) => setFormData({ ...formData, organizationId: value, roleplayIds: [] })}
          >
            <SelectTrigger className="h-11 bg-background border-border/50">
              <SelectValue placeholder="Select organization" />
            </SelectTrigger>
            <SelectContent className="bg-background z-50">
              {organizations.map((org) => (
                <SelectItem key={org.id} value={org.id.toString()}>
                  {org.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Certificate Name */}
        <div className="space-y-2">
          <Label htmlFor="certName">Certificate Name <span className="text-destructive">*</span></Label>
          <Input
            id="certName"
            placeholder="Enter certificate name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="h-11 bg-background border-border/50"
          />
        </div>

        {/* Roleplays Multi-select */}
        <div className="space-y-2">
          <Label>Roleplays</Label>
          {!formData.organizationId ? (
            <p className="text-sm text-muted-foreground p-4 bg-muted/30 rounded-lg">
              Please select an organization first
            </p>
          ) : filteredRoleplays.length === 0 ? (
            <p className="text-sm text-muted-foreground p-4 bg-muted/30 rounded-lg">
              No roleplays available for this organization
            </p>
          ) : (
            <div className="border border-border/50 rounded-lg max-h-48 overflow-y-auto">
              {filteredRoleplays.map((rp) => (
                <div
                  key={rp.id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 border-b border-border/30 last:border-b-0 cursor-pointer"
                  onClick={() => handleRoleplayToggle(rp.id.toString())}
                >
                  <Checkbox
                    checked={formData.roleplayIds.includes(rp.id.toString())}
                    onCheckedChange={() => handleRoleplayToggle(rp.id.toString())}
                  />
                  <span className="text-sm">{rp.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Minimum Score Slider */}
        <div className="space-y-4">
          <Label>Minimum Score Needed</Label>
          <div className="px-2">
            <Slider
              value={formData.minimumScore}
              onValueChange={(value) => setFormData({ ...formData, minimumScore: value })}
              max={10}
              min={0}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between mt-2">
              <span className="text-xs text-muted-foreground">0</span>
              <span className="text-sm font-medium text-primary">{formData.minimumScore[0]}</span>
              <span className="text-xs text-muted-foreground">10</span>
            </div>
          </div>
        </div>

        {/* Upload Badge */}
        <div className="space-y-2">
          <Label>Upload Badge</Label>
          <div className="border-2 border-dashed border-border/50 rounded-lg p-6 text-center">
            {formData.badgePreview ? (
              <div className="flex flex-col items-center gap-3">
                <img
                  src={formData.badgePreview}
                  alt="Badge preview"
                  className="w-16 h-16 object-contain rounded-lg"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData({ ...formData, badgeFile: null, badgePreview: null })}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <label className="cursor-pointer flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Click to upload badge icon</span>
                <span className="text-xs text-muted-foreground">PNG, JPG, SVG (max 2MB)</span>
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg,.svg"
                  className="hidden"
                  onChange={handleBadgeUpload}
                />
              </label>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground tracking-tight">Certifications</h1>
            <p className="text-muted-foreground mt-2">Manage certifications and their requirements</p>
          </div>
          <Button
            onClick={() => { resetForm(); setIsCreateSheetOpen(true); }}
            className="bg-gradient-primary hover:shadow-glow transition-all duration-300 h-11 px-6"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Certifications
          </Button>
        </div>

        {/* Search */}
        <Card className="border-border/50 shadow-sm">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search certifications..." className="pl-10 h-11 bg-background border-border/50" />
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="border-border/50 shadow-sm">
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/50">
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Organization</TableHead>
                  <TableHead className="font-semibold">Roleplays</TableHead>
                  <TableHead className="font-semibold">Min Score</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {certifications.map((cert) => (
                  <TableRow key={cert.id} className="border-border/50 hover:bg-muted/30">
                    <TableCell className="font-medium">{cert.name}</TableCell>
                    <TableCell>{cert.organization}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {cert.roleplays.map((rp, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">{rp}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{cert.minimumScore}/10</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm" className="h-8" onClick={() => handleEditClick(cert)}>
                          <Edit className="h-3.5 w-3.5 mr-1.5" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 text-destructive hover:text-destructive" onClick={() => handleDeleteClick(cert)}>
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

        {/* Add Sheet */}
        <Sheet open={isCreateSheetOpen} onOpenChange={setIsCreateSheetOpen}>
          <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto flex flex-col p-0">
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                <SheetHeader>
                  <SheetTitle className="text-2xl">Add Certification</SheetTitle>
                  <SheetDescription>Create a new certification with requirements</SheetDescription>
                </SheetHeader>
                <CertificationForm />
              </div>
            </div>
            <SheetFooter className="border-t bg-background p-6 mt-auto">
              <div className="flex gap-3 w-full">
                <Button variant="outline" className="flex-1" onClick={() => setIsCreateSheetOpen(false)}>Cancel</Button>
                <Button className="flex-1 bg-gradient-primary" onClick={handleCreate}>Create Certification</Button>
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {/* Edit Sheet */}
        <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
          <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto flex flex-col p-0">
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                <SheetHeader>
                  <SheetTitle className="text-2xl">Edit Certification</SheetTitle>
                  <SheetDescription>Update certification details</SheetDescription>
                </SheetHeader>
                <CertificationForm isEdit />
              </div>
            </div>
            <SheetFooter className="border-t bg-background p-6 mt-auto">
              <div className="flex gap-3 w-full">
                <Button variant="outline" className="flex-1" onClick={() => setIsEditSheetOpen(false)}>Cancel</Button>
                <Button className="flex-1 bg-gradient-primary" onClick={handleUpdate}>Update Certification</Button>
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {/* Delete Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Certification</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{certToDelete?.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default Certifications;
