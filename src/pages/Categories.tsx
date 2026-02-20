import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from "sonner";
import {
  FolderTree,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Search,
  ChevronDown,
  ChevronRight,
  Layers
} from "lucide-react";
import { fetchCategories, addCategory, editCategory, deleteCategory, addSubCategory, editSubCategory, deleteSubCategory } from "@/api/apiService";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"; // ShadCN AlertDialog
interface SubCategory {
  id: string;
  name: string;
  description: string;
  is_active: "Active" | "Inactive";
}

interface Category {
  id: string;
  name: string;
  description: string;
  is_active: "Active" | "Inactive";
  children: SubCategory[];
  createdAt: string;
}

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  // Sheet states
  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false);
  const [isSubCategorySheetOpen, setIsSubCategorySheetOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategory | null>(null);
  const [parentCategoryId, setParentCategoryId] = useState("");
  const [loading, setLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "category" | "subCategory"; categoryId: string; subCategoryId?: string; name: string } | null>(null);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const cats = await fetchCategories();
      setCategories(Array.isArray(cats) ? cats : []);
    } catch (err) {
      setCategories([]);
      toast.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories()
  }, []);

  // Form states
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    status: "Active" as "Active" | "Inactive",
  });

  const [subCategoryForm, setSubCategoryForm] = useState({
    name: "",
    description: "",
    status: "Active" as "Active" | "Inactive",
  });

  const resetCategoryForm = () => {
    setCategoryForm({ name: "", description: "", status: "Active" });
    setSelectedCategory(null);
    setIsEditMode(false);
  };

  const resetSubCategoryForm = () => {
    setSubCategoryForm({ name: "", description: "", status: "Active" });
    setSelectedSubCategory(null);
    setParentCategoryId("");
    setIsEditMode(false);
  };

  const toggleExpanded = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Category handlers
  const handleAddCategory = async () => {
    if (!categoryForm.name) return toast.error("Please enter a category name");

    try {
      const newCategory = await addCategory({
        name: categoryForm.name,
        description: categoryForm.description,
      });
      setCategories([...categories, { ...newCategory, children: [], is_active: "Active" }]);
      resetCategoryForm();
      setIsCategorySheetOpen(false);
      toast.success("Category created successfully");
    } catch (err) {
      toast.error("Failed to create category");
    }
  };


  const handleEditCategory = async () => {
    if (!selectedCategory || !categoryForm.name) return toast.error("Please enter a category name");

    try {
      const updated = await editCategory(selectedCategory.id, {
        name: categoryForm.name,
        description: categoryForm.description,
      });
      setCategories(categories.map(c => c.id === selectedCategory.id ? { ...c, ...updated } : c));
      resetCategoryForm();
      setIsCategorySheetOpen(false);
      toast.success("Category updated successfully");
    } catch (err) {
      toast.error("Failed to update category");
    }
  };

  const handleDeleteCategory = (categoryId: string) => {
    setCategories(categories.filter(c => c.id !== categoryId));
    toast.success("Category deleted successfully");
  };

  const openEditCategorySheet = (category: Category) => {
    setSelectedCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description,
      is_active: category.is_active,
    });
    setIsEditMode(true);
    setIsCategorySheetOpen(true);
  };

  // SubCategory handlers
  const handleAddSubCategory = async () => {
    if (!subCategoryForm.name || !parentCategoryId) return toast.error("Please fill in all required fields");

    try {
      const newSub = await addSubCategory({
        name: subCategoryForm.name,
        description: subCategoryForm.description,
        parent_id: parentCategoryId,
      });

      setCategories(categories.map(c =>
        c.id === parentCategoryId
          ? { ...c, children: [...c.children, newSub] }
          : c
      ));

      if (!expandedCategories.includes(parentCategoryId)) setExpandedCategories([...expandedCategories, parentCategoryId]);

      resetSubCategoryForm();
      setIsSubCategorySheetOpen(false);
      toast.success("Subcategory created successfully");
    } catch (err) {
      toast.error("Failed to create subcategory");
    }
  };

  const handleEditSubCategory = async () => {
    if (!selectedSubCategory || !subCategoryForm.name || !parentCategoryId) return toast.error("Please fill in all required fields");

    try {
      const updated = await editSubCategory(selectedSubCategory.id, {
        name: subCategoryForm.name,
        description: subCategoryForm.description,
      });

      setCategories(categories.map(c =>
        c.id === parentCategoryId
          ? {
            ...c,
            children: c.children.map(sc => sc.id === selectedSubCategory.id ? { ...sc, ...updated } : sc)
          }
          : c
      ));

      resetSubCategoryForm();
      setIsSubCategorySheetOpen(false);
      toast.success("Subcategory updated successfully");
    } catch (err) {
      toast.error("Failed to update subcategory");
    }
  };

  const confirmDelete = (type: "category" | "subCategory", categoryId: string, name: string, subCategoryId?: string) => {
    setDeleteTarget({ type, categoryId, subCategoryId, name });
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteSubCategory = (categoryId: string, subCategoryId: string) => {
    setCategories(categories.map(c =>
      c.id === categoryId
        ? { ...c, children: c.children.filter(sc => sc.id !== subCategoryId) }
        : c
    ));
    toast.success("Subcategory deleted successfully");
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleteDialogOpen(false);

    try {
      if (deleteTarget.type === "category") {
        await deleteCategory(deleteTarget.categoryId);

        toast.success(`Category "${deleteTarget.name}" deleted successfully`);
        setTimeout(() => loadCategories(), 200);
        // Remove category and remove it from expanded state
        setCategories(prev => prev.filter(c => c.id !== deleteTarget.categoryId));
        setExpandedCategories(prev => prev.filter(id => id !== deleteTarget.categoryId));


      } else if (deleteTarget.type === "subCategory") {
        await deleteSubCategory(deleteTarget.subCategoryId!);

        toast.success(`Subcategory "${deleteTarget.name}" deleted successfully`);
        setCategories(prev =>
          prev.map(c =>
            c.id === deleteTarget.categoryId
              ? { ...c, children: c.children.filter(sc => sc.id !== deleteTarget.subCategoryId) }
              : c
          )
        );
        setTimeout(() => loadCategories(), 200);

      }
    } catch (err) {
      toast.error("Failed to delete");
    } finally {
      setDeleteTarget(null);
    }
  };





  const openEditSubCategorySheet = (category: Category, subCategory: SubCategory) => {
    setParentCategoryId(category.id);
    setSelectedSubCategory(subCategory);
    setSubCategoryForm({
      name: subCategory.name,
      description: subCategory.description,
      is_active: subCategory.is_active,
    });
    setIsEditMode(true);
    setIsSubCategorySheetOpen(true);
  };

  const openAddSubCategorySheet = (categoryId: string) => {
    setParentCategoryId(categoryId);
    setIsEditMode(false);
    setIsSubCategorySheetOpen(true);
  };

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.children.some(sc => sc.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalSubCategories = categories.reduce((acc, c) => acc + c.children.length, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Category Management</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage categories and subcategories for roleplay sessions
            </p>
          </div>
          <Button onClick={() => { resetCategoryForm(); setIsCategorySheetOpen(true); }} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FolderTree className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{categories.length}</p>
                  <p className="text-sm text-muted-foreground">Total Categories</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Layers className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalSubCategories}</p>
                  <p className="text-sm text-muted-foreground">Total Subcategories</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search categories or subcategories..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Categories List */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium">
              Categories ({filteredCategories.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-border/50">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary" />
                    <p className="text-sm text-muted-foreground">Loading categories...</p>
                  </div>
                </div>
              ) :
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="font-medium w-[40px]"></TableHead>
                      <TableHead className="font-medium">Category</TableHead>
                      <TableHead className="font-medium">Subcategories</TableHead>
                      <TableHead className="font-medium">Status</TableHead>
                      <TableHead className="font-medium text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCategories.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                          <FolderTree className="h-12 w-12 mx-auto mb-3 opacity-20" />
                          <p>No categories found</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCategories.map((category) => (
                        <Collapsible key={category.id} asChild open={expandedCategories.includes(category.id)}>
                          <>
                            <TableRow className="group">
                              <TableCell>
                                <CollapsibleTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => toggleExpanded(category.id)}
                                  >
                                    {expandedCategories.includes(category.id) ? (
                                      <ChevronDown className="h-4 w-4" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4" />
                                    )}
                                  </Button>
                                </CollapsibleTrigger>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <FolderTree className="h-5 w-5 text-primary" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-foreground">{category.name}</p>
                                    <p className="text-sm text-muted-foreground line-clamp-1">
                                      {category.description || "No description"}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="font-normal">
                                  {category.children.length} subcategories
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant={category.is_active ? "default" : "secondary"}>
                                  {category.is_active ? "Active" : "Inactive"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-xs"
                                    onClick={() => openAddSubCategorySheet(category.id)}
                                  >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Add Sub
                                  </Button>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        className="gap-2 cursor-pointer"
                                        onClick={() => openEditCategorySheet(category)}
                                      >
                                        <Pencil className="h-4 w-4" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                                        onClick={() => confirmDelete("category", category.id, category.name)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </TableCell>
                            </TableRow>
                            <CollapsibleContent asChild>
                              <>
                                {category.children.map((subCategory) => (
                                  <TableRow key={subCategory.id} className="bg-muted/10">
                                    <TableCell></TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-3 pl-6">
                                        <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                                          <Layers className="h-4 w-4 text-accent" />
                                        </div>
                                        <div>
                                          <p className="font-medium text-foreground">{subCategory.name}</p>
                                          <p className="text-sm text-muted-foreground line-clamp-1">
                                            {subCategory.description || "No description"}
                                          </p>
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <span className="text-sm text-muted-foreground">—</span>
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant={subCategory.is_active ? "default" : "secondary"}>
                                        {subCategory.is_active ? "Active" : "Inactive"}
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
                                            onClick={() => openEditSubCategorySheet(category, subCategory)}
                                          >
                                            <Pencil className="h-4 w-4" />
                                            Edit
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                                            onClick={() => confirmDelete("subCategory", category.id, subCategory.name, subCategory.id)}
                                          >
                                            <Trash2 className="h-4 w-4" />
                                            Delete
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </>
                            </CollapsibleContent>
                          </>
                        </Collapsible>
                      ))
                    )}
                  </TableBody>
                </Table>
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Category Sheet */}
      <Sheet open={isCategorySheetOpen} onOpenChange={(open) => {
        setIsCategorySheetOpen(open);
        if (!open) resetCategoryForm();
      }}>
        <SheetContent className="sm:max-w-lg flex flex-col">
          <SheetHeader>
            <SheetTitle>{isEditMode ? "Edit Category" : "Add Category"}</SheetTitle>
            <SheetDescription>
              {isEditMode ? "Update category details" : "Create a new category"}
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto space-y-6 py-6">
            <div className="space-y-2">
              <Label htmlFor="categoryName">Category Name *</Label>
              <Input
                id="categoryName"
                placeholder="Enter category name"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoryDescription">Description</Label>
              <Textarea
                id="categoryDescription"
                placeholder="Enter category description"
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                className="min-h-[100px] resize-y"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoryStatus">Status</Label>
              <Select
                value={categoryForm.status}
                onValueChange={(value: "Active" | "Inactive") => setCategoryForm({ ...categoryForm, status: value })}
              >
                <SelectTrigger id="categoryStatus">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <SheetFooter className="border-t pt-4 mt-auto">
            <Button variant="outline" onClick={() => { resetCategoryForm(); setIsCategorySheetOpen(false); }}>
              Cancel
            </Button>
            <Button onClick={isEditMode ? handleEditCategory : handleAddCategory}>
              {isEditMode ? "Update Category" : "Add Category"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Add/Edit SubCategory Sheet */}
      <Sheet open={isSubCategorySheetOpen} onOpenChange={(open) => {
        setIsSubCategorySheetOpen(open);
        if (!open) resetSubCategoryForm();
      }}>
        <SheetContent className="sm:max-w-lg flex flex-col">
          <SheetHeader>
            <SheetTitle>{isEditMode ? "Edit Subcategory" : "Add Subcategory"}</SheetTitle>
            <SheetDescription>
              {isEditMode ? "Update subcategory details" : "Create a new subcategory under the selected category"}
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto space-y-6 py-6">
            {!isEditMode && (
              <div className="space-y-2">
                <Label>Parent Category</Label>
                <Select value={parentCategoryId} onValueChange={setParentCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {isEditMode && (
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">Parent Category</p>
                <p className="font-medium text-foreground">
                  {categories.find(c => c.id === parentCategoryId)?.name}
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="subCategoryName">Subcategory Name *</Label>
              <Input
                id="subCategoryName"
                placeholder="Enter subcategory name"
                value={subCategoryForm.name}
                onChange={(e) => setSubCategoryForm({ ...subCategoryForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subCategoryDescription">Description</Label>
              <Textarea
                id="subCategoryDescription"
                placeholder="Enter subcategory description"
                value={subCategoryForm.description}
                onChange={(e) => setSubCategoryForm({ ...subCategoryForm, description: e.target.value })}
                className="min-h-[100px] resize-y"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subCategoryStatus">Status</Label>
              <Select
                value={subCategoryForm.status}
                onValueChange={(value: "Active" | "Inactive") => setSubCategoryForm({ ...subCategoryForm, status: value })}
              >
                <SelectTrigger id="subCategoryStatus">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <SheetFooter className="border-t pt-4 mt-auto">
            <Button variant="outline" onClick={() => { resetSubCategoryForm(); setIsSubCategorySheetOpen(false); }}>
              Cancel
            </Button>
            <Button onClick={isEditMode ? handleEditSubCategory : handleAddSubCategory}>
              {isEditMode ? "Update Subcategory" : "Add Subcategory"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.type === "category"
                ? `This will permanently delete the category "${deleteTarget.name}" and all its subcategories.`
                : `This will permanently delete the subcategory "${deleteTarget?.name}".`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default Categories;
