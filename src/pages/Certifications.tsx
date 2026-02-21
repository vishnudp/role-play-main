import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Shield, FileText, Plus, MoreHorizontal, Edit, Pencil, Trash2, Search, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchAvatarConfigurations, fetchCertificate, fetchOrganizations, fetchRolePlays } from "../api/apiService";
import { fetchDocuments, uploadDocument, deleteDocument, fetchUsers, createCertificate, updateCertificateApi, deleteCertificate } from "../api/apiService";
import { getOrganizationName, getUserName, formatToLongDate, formatFileSize, handleView, handleDownload } from "../lib/lookupUtils";
import { API_BASE_URL } from '../config/apiConfig';
interface Certification {
  id: string;
  name: string;
  organizations: any[];
  rolePlays: any[];
  min_score: number;
  icons?: any[];
}

interface CertificationFormProps {
  formData: typeof FormData;
  setFormData: React.Dispatch<React.SetStateAction<typeof FormData>>;
  organizations: { id: number; name: string }[];
  allRoleplays: { id: number; name: string; organization: string }[];
  icons: { id: number; name: string }[]; // <-- add this
}

const CertificationForm = ({ formData, setFormData, organizations, allRoleplays, icons }: CertificationFormProps) => {

  const [isOrgPopoverOpen, setIsOrgPopoverOpen] = useState(false);
  const [isRolePlayPopoverOpen, setIsRolePlayPopoverOpen] = useState(false);
  const [isIconPopoverOpen, setIsIconPopoverOpen] = useState(false);

  // Search queries
  const [orgSearchQuery, setOrgSearchQuery] = useState("");
  const [rolePlaySearchQuery, setRolePlaySearchQuery] = useState("");
  const [iconSearchQuery, setIconSearchQuery] = useState("");

  const toggleOrganization = (id: number) => {
    const idStr = id.toString();
    if (formData.organization_ids.includes(idStr)) {
      setFormData({
        ...formData,
        organization_ids: formData.organization_ids.filter((orgId: string) => orgId !== idStr),
      });
    } else {
      setFormData({
        ...formData,
        organization_ids: [...formData.organization_ids, idStr],
      });
    }
  };

  const toggleRolePlay = (id: number) => {
    const idStr = id.toString();
    if (formData.role_play_ids.includes(idStr)) {
      setFormData({
        ...formData,
        role_play_ids: formData.role_play_ids.filter((rpId: string) => rpId !== idStr),
      });
    } else {
      setFormData({
        ...formData,
        role_play_ids: [...formData.role_play_ids, idStr],
      });
    }
  };

  const toggleIcon = (id: number) => {
    const idStr = id.toString();
    const current = formData.icon_ids || [];
    if (current.includes(idStr)) {
      setFormData({
        ...formData,
        icon_ids: current.filter((iconId) => iconId !== idStr),
      });
    } else {
      setFormData({
        ...formData,
        icon_ids: [...current, idStr],
      });
    }
  };

  const removeOrganization = (id: string) => {
    setFormData({
      ...formData,
      organization_ids: formData.organization_ids.filter((orgId: string) => orgId !== id),
    });
  };

  const removeRolePlay = (id: string) => {
    setFormData({
      ...formData,
      role_play_ids: formData.role_play_ids.filter((rpId: string) => rpId !== id),
    });
  };

  const removeIcon = (id: string) => {
    setFormData({
      ...formData,
      icon_ids: formData.icon_ids.filter((iconId: string) => iconId !== id),
    });
  };

  const filteredOrganizations = organizations.filter((org) =>
    org.name.toLowerCase().includes(orgSearchQuery.toLowerCase())
  );

  const filteredRolePlays = allRoleplays.filter((rp) =>
    rp.name.toLowerCase().includes(rolePlaySearchQuery.toLowerCase())
  );

  const filteredIcons = icons.filter((icon) =>
    icon.avatar_name.toLowerCase().includes(iconSearchQuery.toLowerCase())
  );

  // const getFilteredRoleplays = () => {
  //   if (!formData.organizationId) return [];
  //   return allRoleplays.filter(rp => rp.organization === formData.organizationId);
  // };

  // const filteredRoleplays = getFilteredRoleplays();

  const handleRoleplayToggle = (roleplayId: string) => {
    if (formData.role_play_ids.includes(roleplayId)) {
      setFormData({ ...formData, role_play_ids: formData.role_play_ids.filter(id => id !== roleplayId) });
    } else {
      setFormData({ ...formData, role_play_ids: [...formData.role_play_ids, roleplayId] });
    }
  };




  return (
    <div className="space-y-6 py-6">
      {/* Organization */}
      <div className="space-y-2">
        <Label>Organizations</Label>
        <Popover open={isOrgPopoverOpen} onOpenChange={setIsOrgPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className={cn(
                "w-full h-auto min-h-11 justify-between text-left font-normal border-border/50",
                formData.organization_ids.length === 0 && "text-muted-foreground"
              )}
            >
              <div className="flex flex-wrap gap-1 flex-1">
                {formData.organization_ids.length === 0 ? (
                  <span>Select organizations</span>
                ) : (
                  formData.organization_ids.map((orgId) => {
                    const org = organizations.find((o) => o.id.toString() === orgId);
                    return (
                      org && (
                        <Badge
                          key={orgId}
                          variant="secondary"
                          className="mr-1 mb-1"
                        >
                          {org.name}
                          <button
                            className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              removeOrganization(orgId);
                            }}
                          >
                            <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                          </button>
                        </Badge>
                      )
                    );
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
                      checked={formData.organization_ids.includes(org.id.toString())}
                      onCheckedChange={() => toggleOrganization(org.id)}
                    />
                    <div className="text-sm">{org.name}</div>
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

      <div className="space-y-2">
        <Label htmlFor="instructions">Instructions Name <span className="text-destructive">*</span></Label>
        <Input
          id="instructions"
          placeholder="Enter certification instructions"
          value={formData.instructions}
          onChange={(e) =>
            setFormData({ ...formData, instructions: e.target.value })
          }
          className="h-11 bg-background border-border/50"
        />
      </div>

      {/* Roleplays Multi-select */}
      <div className="space-y-2">
        <Label>Roleplays</Label>
        <Popover open={isRolePlayPopoverOpen} onOpenChange={setIsRolePlayPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className={cn(
                "w-full h-auto min-h-11 justify-between text-left font-normal border-border/50",
                formData.role_play_ids.length === 0 && "text-muted-foreground"
              )}
            >
              <div className="flex flex-wrap gap-1 flex-1">
                {formData.role_play_ids.length === 0 ? (
                  <span>Select Role Plays</span>
                ) : (
                  formData.role_play_ids.map((roleplayid) => {
                    const roleplay = allRoleplays.find((o) => o.id.toString() === roleplayid);
                    return (
                      roleplay && (
                        <Badge
                          key={roleplayid}
                          variant="secondary"
                          className="mr-1 mb-1"
                        >
                          {roleplay.name}
                          <button
                            className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              removeRolePlay(roleplayid);
                            }}
                          >
                            <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                          </button>
                        </Badge>
                      )
                    );
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
                  placeholder="Search role plays..."
                  className="pl-10 h-9"
                  value={rolePlaySearchQuery}
                  onChange={(e) => setRolePlaySearchQuery(e.target.value)}
                />
              </div>
              <div className="max-h-[200px] overflow-y-auto space-y-1">
                {filteredRolePlays.map((roleplay) => (
                  <div
                    key={roleplay.id}
                    className="flex items-center space-x-2 p-2 hover:bg-muted/50 rounded-md cursor-pointer"
                    onClick={() => toggleRolePlay(roleplay.id)}
                  >
                    <Checkbox
                      checked={formData.role_play_ids.includes(roleplay.id.toString())}
                      onCheckedChange={() => toggleRolePlay(roleplay.id)}
                    />
                    <div className="text-sm">{roleplay.name}</div>
                  </div>
                ))}
                {filteredRolePlays.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-2">No role plays found</p>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
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
        <Label>Icons</Label>
        <Popover open={isIconPopoverOpen} onOpenChange={setIsIconPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className={cn(
                "w-full h-auto min-h-11 justify-between text-left font-normal border-border/50",
                formData.icon_ids?.length === 0 && "text-muted-foreground"
              )}
            >
              <div className="flex flex-wrap gap-1 flex-1">
                {formData.icon_ids?.length === 0 ? (
                  <span>Select Icons</span>
                ) : (
                  formData.icon_ids?.map((iconid) => {
                    const icon = icons.find((o) => o.id.toString() === iconid);
                    return (
                      icons && (
                        <Badge
                          key={iconid}
                          variant="secondary"
                          className="mr-1 mb-1"
                        >
                          <div className="w-6 h-6 min-w-[24px] min-h-[24px] max-w-[24px] max-h-[24px] rounded-full shrink-0 overflow-hidden bg-gray-200 flex items-center justify-center">
                            {icon?.photo ? (
                              <img
                                src={`${API_BASE_URL}/${icon.photo}`}
                                alt={icon?.avatar_name}
                                className="w-full h-full object-cover"
                                crossOrigin="anonymous"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              <span className="text-[10px] text-gray-500 font-medium leading-none">
                                {icon?.avatar_name?.charAt(0)?.toUpperCase()}
                              </span>
                            )}
                          </div>{icon?.avatar_name}
                          <button
                            className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              removeIcon(iconid);
                            }}
                          >
                            <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                          </button>
                        </Badge>
                      )
                    );
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
                  placeholder="Search icons..."
                  className="pl-10 h-9"
                  value={rolePlaySearchQuery}
                  onChange={(e) => setRolePlaySearchQuery(e.target.value)}
                />
              </div>
              <div className="max-h-[200px] overflow-y-auto space-y-1">
                {filteredIcons?.map((icon) => (
                  <div
                    key={icon.id}
                    className="flex items-center space-x-2 p-2 hover:bg-muted/50 rounded-md cursor-pointer"
                    onClick={() => toggleIcon(icon.id)}
                  >
                    <Checkbox
                      checked={formData.icon_ids?.includes(icon.id)}
                      onCheckedChange={() => toggleIcon(icon.id)}
                    />

                    {/* ✅ Image + Name in single row */}
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-6 h-6 min-w-[24px] min-h-[24px] max-w-[24px] max-h-[24px] rounded-full shrink-0 overflow-hidden bg-gray-200 flex items-center justify-center">
                        {icon?.photo ? (
                          <img
                            src={`${API_BASE_URL}/${icon.photo}`}
                            alt={icon?.avatar_name}
                            className="w-full h-full object-cover"
                            crossOrigin="anonymous"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <span className="text-[10px] text-gray-500 font-medium leading-none">
                            {icon?.avatar_name?.charAt(0)?.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <span className="whitespace-nowrap">
                        {icon.avatar_name}
                      </span>
                    </div>
                  </div>
                ))}
                {filteredIcons?.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-2">No icons found</p>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

const Certifications = () => {
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [selectedCertification, setSelectedCertification] = useState<Certification | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [certToDelete, setCertToDelete] = useState<Certification | null>(null);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [allRoleplays, setAllRolePlays] = useState<any[]>([]);
  const [icons, setIcons] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        await fetchCertificate()
          .then((certs) => setCertifications(Array.isArray(certs) ? certs : []))
          .catch(() => setCertifications([]));
        await fetchOrganizations()
          .then((orgs) => setOrganizations(Array.isArray(orgs) ? orgs : []))
          .catch(() => setOrganizations([]));
        await fetchDocuments()
          .then((docs) => setDocuments(Array.isArray(docs) ? docs : []))
          .catch(() => setDocuments([]));
        await fetchRolePlays()
          .then((rolePlays) => setAllRolePlays(Array.isArray(rolePlays) ? rolePlays : []))
          .catch(() => setAllRolePlays([]));
        await fetchUsers()
          .then((users) => setUsers(Array.isArray(users) ? users : []))
          .catch(() => setUsers([]));
        await fetchAvatarConfigurations()
          .then((icons) => setIcons(Array.isArray(icons) ? icons : []))
          .catch(() => setIcons([]));
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Mock data
  // const organizations = [
  //   { id: 1, name: "TechCorp" },
  //   { id: 2, name: "ServiceHub" },
  //   { id: 3, name: "DealMakers" },
  // ];

  // const icons = [
  //   { id: 1, name: "TechCorp" },
  //   { id: 2, name: "ServiceHub" },
  //   { id: 3, name: "DealMakers" },
  // ];

  // const allRoleplays = [
  //   { id: 1, name: "Sales Consultation - Q1 2024", organization: "TechCorp" },
  //   { id: 2, name: "Customer Support Training", organization: "ServiceHub" },
  //   { id: 3, name: "Technical Troubleshooting", organization: "TechCorp" },
  //   { id: 4, name: "Negotiation Practice", organization: "DealMakers" },
  //   { id: 5, name: "Product Demo Training", organization: "TechCorp" },
  // ];

  const [certifications, setCertifications] = useState<Certification[]>([

  ]);

  const [formData, setFormData] = useState({
    name: "",
    instructions: "",
    organization_ids: [] as string[], // changed to array
    role_play_ids: [] as string[],
    icon_ids: [] as string[], // changed to array
    minimumScore: [5],
    badgeFile: null as File | null,
    badgePreview: null as string | null,
  });

  const handleMultiSelectToggle = (field: "organization_ids" | "role_play_ids" | "icon_ids", id: string) => {
    const values = formData[field];
    if (values.includes(id)) {
      setFormData({ ...formData, [field]: values.filter(v => v !== id) });
    } else {
      setFormData({ ...formData, [field]: [...values, id] });
    }
  };

  const getSelectedOrgName = () => {
    if (!formData.organization_ids.length) return "";
    const org = organizations.find(o => o.id === parseInt(formData.organization_ids[0]));
    return org?.name || "";
  };

  const getFilteredRoleplays = () => {
    const orgName = getSelectedOrgName();
    if (!orgName) return [];
    return allRoleplays.filter(r => r.organization === orgName);
  };

  const handleRoleplayToggle = (roleplayId: string) => {
    if (formData.role_play_ids.includes(roleplayId)) {
      setFormData({ ...formData, role_play_ids: formData.role_play_ids.filter(id => id !== roleplayId) });
    } else {
      setFormData({ ...formData, role_play_ids: [...formData.role_play_ids, roleplayId] });
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
      instructions: "",
      organization_ids: [],
      role_play_ids: [],
      icon_ids: [], // <-- add this
      minimumScore: [5],
      badgeFile: null,
      badgePreview: null,
    });
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.organization_ids.length) {
      toast.error("Please fill in required fields");
      return;
    }

    const payload = {
      name: formData.name,
      instructions: formData.instructions,
      organization_ids: formData.organization_ids,
      role_play_ids: formData.role_play_ids,
      icon_ids: formData.icon_ids,
      min_score: formData.minimumScore[0],
    };

    try {
      const res = await createCertificate(payload); // <-- your API
      toast.success("Certification created");

      setCertifications(prev => [...prev, res.data]);

      setIsCreateSheetOpen(false);
      resetForm();
    } catch (err) {
      toast.error("Failed to create certification");
    }
  };

  const handleEditClick = (cert: any) => {
    setSelectedCertification(cert);

    setFormData({
      name: cert.name || "",
      instructions: cert.instructions || "",

      organization_ids:
        cert.organizations?.map(
          (org: any) => org.organization?.id
        ) || [],

      role_play_ids:
        cert.rolePlays?.map(
          (rp: any) => rp.rolePlay?.id
        ) || [],

      icon_ids:
        cert.icons?.map(
          (ic: any) => ic.icon?.id
        ) || [],

      minimumScore: [cert.min_score ?? 0],

      badgeFile: null,
      badgePreview: null,
    });

    setIsEditSheetOpen(true);
  };
  const handleUpdate = async () => {
    if (!selectedCertification) return;

    const payload = {
      name: formData.name,
      instructions: formData.instructions,
      organization_ids: formData.organization_ids,
      role_play_ids: formData.role_play_ids,
      icon_ids: formData.icon_ids,
      min_score: formData.minimumScore[0],
    };

    try {
      const res = await updateCertificateApi(selectedCertification.id, payload);

      setCertifications(prev =>
        prev.map(c => c.id === selectedCertification.id ? res.data : c)
      );

      toast.success("Certification updated");
      setIsEditSheetOpen(false);
      resetForm();
    } catch {
      toast.error("Update failed");
    }
  };

  const handleDeleteClick = (cert: Certification) => {
    setCertToDelete(cert);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!certToDelete) return;

    try {
      await deleteCertificate(certToDelete.id);

      setCertifications(prev =>
        prev.filter(c => c.id !== certToDelete.id)
      );

      toast.success("Deleted successfully");
    } catch {
      toast.error("Delete failed");
    }

    setIsDeleteDialogOpen(false);
    setCertToDelete(null);
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
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-4">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary" />
                  <p className="text-sm text-muted-foreground">Loading certifications...</p>
                </div>
              </div>
            ) :
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
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {cert.organizations.map((org, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">{org?.organization?.name}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {cert.rolePlays.map((rp, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">{rp?.rolePlay?.name}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{cert.min_score}/10</Badge>
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
            }
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
                <CertificationForm formData={formData}
                  setFormData={setFormData}
                  organizations={organizations}
                  allRoleplays={allRoleplays}
                  icons={icons} />
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
                <CertificationForm isEdit formData={formData} setFormData={setFormData} organizations={organizations} allRoleplays={allRoleplays} icons={icons} />
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
