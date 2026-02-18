
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
import { fetchDocuments, uploadDocument, deleteDocument, fetchUsers } from "../api/apiService";
import { getOrganizationName, getUserName , formatToLongDate, formatFileSize, handleView, handleDownload} from "../lib/lookupUtils";
import { Plus, Search, FileText, Download, Trash2, MoreHorizontal, Upload, File, Eye } from "lucide-react";


const Documents = () => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<any>(null);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
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
  // For demo purposes, assume super admin
  const isSuperAdmin = true;

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

  console.log('documents--',documents)
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.fileName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOrg = selectedOrgFilter === "all" || doc.organization_id === selectedOrgFilter || doc.orgId === selectedOrgFilter;
    return matchesSearch && matchesOrg;
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const reloadDocuments = async () => {
    const docs = await fetchDocuments();
    setDocuments(Array.isArray(docs) ? docs : []);
  };

  const handleUpload = async () => {
    if (!documentName || !selectedFile || (isSuperAdmin && !selectedOrg)) return;
    const isFile = selectedFile && typeof selectedFile === 'object' && typeof selectedFile.name === 'string' && typeof selectedFile.size === 'number';
    console.log('Uploading file:', selectedFile, isFile, selectedFile && selectedFile.name);
    try {
      await uploadDocument({
        name: documentName,
        organization_id: isSuperAdmin ? selectedOrg : undefined,
        file: selectedFile,
      });
      toast.success("Document uploaded successfully!");
      await reloadDocuments();
      resetForm();
      setIsUploadSheetOpen(false);
    } catch (e) {
      toast.error("Failed to upload document.");
    }
  };

  const handleDelete = async () => {
    if (!docToDelete) return;
    try {
      await deleteDocument(docToDelete.id);
      toast.success("Document deleted successfully!");
      await reloadDocuments();
    } catch (e) {
      toast.error("Failed to delete document.");
    } finally {
      setDeleteDialogOpen(false);
      setDocToDelete(null);
    }
  };

  const resetForm = () => {
    setDocumentName("");
    setSelectedOrg("");
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
            <h1 className="text-2xl font-semibold text-foreground">Document Management</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Upload and manage organizational documents
            </p>
          </div>
          <Button onClick={() => setIsUploadSheetOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Upload Document
          </Button>
        </div>

        {/* Filters */}
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search documents..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {isSuperAdmin && (
                <Select value={selectedOrgFilter} onValueChange={setSelectedOrgFilter}>
                  <SelectTrigger className="w-full sm:w-[250px]">
                    <SelectValue placeholder="Filter by Organization" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Organizations</SelectItem>
                    {organizations.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Documents Table */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium">
              Documents ({filteredDocuments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-border/50">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="font-medium">Document</TableHead>
                    {isSuperAdmin && <TableHead className="font-medium">Organization</TableHead>}
                    <TableHead className="font-medium">Uploaded By</TableHead>
                    <TableHead className="font-medium">Date</TableHead>
                    <TableHead className="font-medium">Size</TableHead>
                    <TableHead className="font-medium text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={isSuperAdmin ? 6 : 5} className="text-center py-12 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>No documents found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDocuments.map((doc) => (
                      <TableRow key={doc.id} className="group">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              {getFileIcon(doc.type)}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{doc.name}</p>
                              <p className="text-sm text-muted-foreground">{doc.fileName}</p>
                            </div>
                          </div>
                        </TableCell>
                        {isSuperAdmin && (
                          <TableCell>
                            <Badge variant="outline" className="font-normal">
                              {getOrganizationName(organizations, doc.organization_id || doc.orgId)}
                            </Badge>
                          </TableCell>
                        )}
                        <TableCell className="text-muted-foreground">{getUserName(users, doc.created_by)}</TableCell>
                        <TableCell className="text-muted-foreground">{formatToLongDate(doc.updated_at)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-normal">
                            {formatFileSize(doc.size)}
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
                              <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => handleView(doc)}>
                                <Eye className="h-4 w-4" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => handleDownload(doc)}>
                                <Download className="h-4 w-4" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                                onClick={() => { setDocToDelete(doc); setDeleteDialogOpen(true); }}
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
      {/* Delete Confirmation Dialog (now outside map) */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete <b>{docToDelete?.name}</b>?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
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
            <SheetTitle>Upload Document</SheetTitle>
            <SheetDescription>
              Upload a new document to the system
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto space-y-6 py-6">
            {isSuperAdmin && (
              <div className="space-y-2">
                <Label htmlFor="organization">Organization <span className="text-destructive">*</span></Label>
                <Select value={selectedOrg} onValueChange={setSelectedOrg}>
                  <SelectTrigger id="organization">
                    <SelectValue placeholder="Select organization" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizations.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="docName">Document Name <span className="text-destructive">*</span></Label>
              <Input
                id="docName"
                placeholder="Enter document name"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
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
                      PDF, DOCX, PPTX, TXT, CSV (max 50MB)
                    </p>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.pptx,.txt,.csv"
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
              disabled={!documentName || !selectedFile || (isSuperAdmin && !selectedOrg)}
            >
              Upload Document
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  );
};

export default Documents;

