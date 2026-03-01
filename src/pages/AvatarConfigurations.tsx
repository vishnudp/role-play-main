
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { fetchOrganizations } from "../api/apiService";
import { fetchAvatarConfigurations, uploadAvatarConfiguration, deleteAvatarConfiguration, fetchUsers } from "../api/apiService";
import { getOrganizationName, getUserName, formatToLongDate, formatFileSize, handleView, handleDownload, getLoginUserOrganization } from "../lib/lookupUtils";
import { Plus, Search, FileText, Download, Trash2, MoreHorizontal, Upload, File, Eye } from "lucide-react";
import { API_BASE_URL } from "@/config/apiConfig";
import { PERMISSIONS } from '@/constants/permissions';
import { usePermission } from '@/hooks/usePermission';
import ButtonLoader from "@/components/ui/buttonLoader";


const AvatarConfigurations = () => {
  const { can } = usePermission();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<any>(null);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [avatarConfigurations, setAvatarConfigurations] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);


  const [isUploadSheetOpen, setIsUploadSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrgFilter, setSelectedOrgFilter] = useState<string>("all");
  // Form state
  const [documentName, setDocumentName] = useState("");
  const [selectedOrg, setSelectedOrg] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarId, setAvatarId] = useState("");

  const [isAdding, setIsAdding] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  // For demo purposes, assume super admin
  const isSuperAdmin = true;

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        

        // Fetch avatar configurations
        let configs = [];
        try {
          const apiResponse = await fetchAvatarConfigurations();
          console.log("Full Avatar API response:", apiResponse);

          // Determine if API returns array directly or under data
          if (Array.isArray(apiResponse)) {
            configs = apiResponse;
          } else if (Array.isArray(apiResponse?.data)) {
            configs = apiResponse.data;
          } else {
            configs = [];
          }
        } catch (err) {
          configs = [];
        }
        setAvatarConfigurations(configs);

        // Fetch organizations
        let orgs = [];
        try {
          orgs = await fetchOrganizations();
          orgs = Array.isArray(orgs) ? orgs : getLoginUserOrganization();
        } catch (err) {
          orgs = getLoginUserOrganization();
        }
        setOrganizations(orgs);

        // Fetch users
        let usersList = [];
        try {
          usersList = await fetchUsers();
          usersList = Array.isArray(usersList) ? usersList : [];
        } catch (err) {
          usersList = [];
        }
        setUsers(usersList);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  console.log('avatarConfigurations--', avatarConfigurations)
  const filteredAvatarConfigurations = avatarConfigurations.filter((doc) => {
    const matchesSearch = doc.avatar_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.photo?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const reloadAvatarConfigurations = async () => {
    const docs = await fetchAvatarConfigurations();
    setAvatarConfigurations(Array.isArray(docs) ? docs : []);
  };

  const handleUpload = async () => {

    if (!documentName || !selectedFile || (!isSuperAdmin)) return;

    const formData = new FormData();
    formData.append("avatar_name", documentName); // Avatar name input
    formData.append("avatar_id", avatarId);       // Avatar ID input
    formData.append("status", "ACTIVE");          // Default status
    formData.append("photo", selectedFile);
    try {
      setIsAdding(true);
      await uploadAvatarConfiguration(
        formData);
      toast.success("Avatar configuration uploaded successfully!");
      await reloadAvatarConfigurations();
      resetForm();
      setIsUploadSheetOpen(false);
    } catch (error) {
      toast.error(error?.message || "Failed to upload avatar configuration.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async () => {
    if (!docToDelete) return;
    try {
      setIsDeleting(true);
      await deleteAvatarConfiguration(docToDelete.id);
      toast.success("Avatar deleted successfully!");
      await reloadAvatarConfigurations();
    } catch (error) {
      toast.error(error?.message || "Failed to delete avatar.");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setDocToDelete(null);
    }
  };

  const resetForm = () => {
    setDocumentName("");
    setAvatarId(""); // reset avatar id too
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getFileIcon = (type: string) => {
    return <FileText className="h-4 w-4 text-primary" />;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Avatar Configuration</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Upload and manage avatar configurations.
            </p>
          </div>
          {can(PERMISSIONS.AVATAR_CONFIG_CREATE) && (
            <Button onClick={() => setIsUploadSheetOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Avatar Configuration
            </Button>
          )}
        </div>

        {/* Filters */}
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search avatar configurations..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Documents Table */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium">
              Avatar Configurations ({filteredAvatarConfigurations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-border/50">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary" />
                    <p className="text-sm text-muted-foreground">Loading avatar configurations...</p>
                  </div>
                </div>
              ) :
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="font-medium">Avatar Name</TableHead>
                      <TableHead className="font-medium">Avatar Id</TableHead>
                      <TableHead className="font-medium">Avatar</TableHead>
                      <TableHead className="font-medium text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {

                      filteredAvatarConfigurations.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={isSuperAdmin ? 6 : 5} className="text-center py-12 text-muted-foreground">
                            <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                            <p>No avatar configurations found</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredAvatarConfigurations.map((doc) => (
                          <TableRow key={doc.id} className="group">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                  {getFileIcon(doc.type)}
                                </div>
                                <div>
                                  <p className="font-medium text-foreground">{doc.avatar_name}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{doc.avatar_id}</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="font-normal">
                                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center shrink-0">
                                  {doc?.photo ? (
                                    <a href={`${API_BASE_URL}/${doc.photo}`} target="_blank" rel="noopener noreferrer">
                                      <img
                                        src={`${API_BASE_URL}/${doc.photo}`}
                                        alt={doc.avatar_name}
                                        className="w-full h-full object-cover cursor-pointer"
                                        loading="lazy"
                                        crossOrigin="anonymous"
                                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                                      />
                                    </a>
                                  ) : (
                                    <span className="text-xs font-semibold text-gray-500 leading-none">
                                      {doc?.avatar_name?.charAt(0)?.toUpperCase()}
                                    </span>
                                  )}
                                </div>
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
                                  {can(PERMISSIONS.AVATAR_CONFIG_READ) && (
                                    <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => handleView(doc)}>
                                      <Eye className="h-4 w-4" />
                                      View
                                    </DropdownMenuItem>
                                  )}
                                  {can(PERMISSIONS.AVATAR_CONFIG_DELETE) && (
                                    <DropdownMenuItem
                                      className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                                      onClick={() => { setDocToDelete(doc); setDeleteDialogOpen(true); }}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      Delete
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                  </TableBody>
                </Table>}
            </div>
          </CardContent>
        </Card>
        {/* Delete Confirmation Dialog (now outside map) */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Avatar Configuration</DialogTitle>
            </DialogHeader>
            <p>Are you sure you want to delete <b>{docToDelete?.name}</b>?</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting && <ButtonLoader />}
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Upload Document Sheet */}
      <Sheet open={isUploadSheetOpen} onOpenChange={(open) => {
        setIsUploadSheetOpen(open);
        if (!open) resetForm();
      }}>
        <SheetContent className="sm:max-w-md flex flex-col">
          <SheetHeader>
            <SheetTitle>Add Avatar Configuration</SheetTitle>
            <SheetDescription>
              Upload a new avatar to the system
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto space-y-6 py-6">


            <div className="space-y-2">
              <Label htmlFor="docName">Avatar Name <span className="text-destructive">*</span></Label>
              <Input
                id="docName"
                placeholder="Enter avatar name"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatarId">Avatar Id <span className="text-destructive">*</span></Label>
              <Input
                id="avatarId"
                placeholder="Enter avatar id"
                value={avatarId}
                onChange={(e) => setAvatarId(e.target.value)}
              />
            </div>


            <div className="space-y-2">
              <Label>File <span className="text-destructive">*</span></Label>
              <div
                className="border-2 border-dashed border-border/50 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {selectedFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <File className="h-8 w-8 text-primary" />
                    <div className="text-left">
                      <p className="font-medium text-foreground">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG, JPEG (max 50MB)
                    </p>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".png,.jpg,.jpeg"
                onChange={handleFileChange}
              />
            </div>
          </div>

          <SheetFooter className="border-t pt-4 mt-auto gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => {
              resetForm();
              setIsUploadSheetOpen(false);
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!documentName || !avatarId || !selectedFile || isAdding} // simple check
            >
              {isAdding && <ButtonLoader />}
              {isAdding ? "Uploading..." : "Upload Avatar Configuration"}
            </Button>

          </SheetFooter>
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  );
};

export default AvatarConfigurations;

