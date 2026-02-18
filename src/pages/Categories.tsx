import { useState } from "react";
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

interface SubCategory {
  id: string;
  name: string;
  description: string;
  status: "Active" | "Inactive";
}

interface Category {
  id: string;
  name: string;
  description: string;
  status: "Active" | "Inactive";
  subCategories: SubCategory[];
  createdAt: string;
}

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([
    {
      id: "1",
      name: "Sales",
      description: "Sales related roleplay scenarios",
      status: "Active",
      createdAt: "2024-01-15",
      subCategories: [
        { id: "1-1", name: "Enterprise Sales", description: "Large enterprise deals", status: "Active" },
        { id: "1-2", name: "Negotiation", description: "Negotiation techniques", status: "Active" },
        { id: "1-3", name: "Cold Calling", description: "Cold outreach scenarios", status: "Active" },
      ]
    },
    {
      id: "2",
      name: "Customer Support",
      description: "Customer service training scenarios",
      status: "Active",
      createdAt: "2024-01-12",
      subCategories: [
        { id: "2-1", name: "Technical Support", description: "Technical troubleshooting", status: "Active" },
        { id: "2-2", name: "Complaint Handling", description: "Managing customer complaints", status: "Active" },
      ]
    },
    {
      id: "3",
      name: "Healthcare",
      description: "Healthcare communication scenarios",
      status: "Active",
      createdAt: "2024-01-10",
      subCategories: [
        { id: "3-1", name: "Patient Communication", description: "Doctor-patient interactions", status: "Active" },
        { id: "3-2", name: "Emergency Response", description: "Emergency situation handling", status: "Inactive" },
      ]
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  
  // Sheet states
  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false);
  const [isSubCategorySheetOpen, setIsSubCategorySheetOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategory | null>(null);
  const [parentCategoryId, setParentCategoryId] = useState("");

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
  const handleAddCategory = () => {
    if (!categoryForm.name) {
      toast.error("Please enter a category name");
      return;
    }

    const newCategory: Category = {
      id: Date.now().toString(),
      name: categoryForm.name,
      description: categoryForm.description,
      status: categoryForm.status,
      subCategories: [],
      createdAt: new Date().toISOString().split('T')[0]
    };

    setCategories([...categories, newCategory]);
    resetCategoryForm();
    setIsCategorySheetOpen(false);
    toast.success("Category created successfully");
  };

  const handleEditCategory = () => {
    if (!selectedCategory || !categoryForm.name) {
      toast.error("Please enter a category name");
      return;
    }

    setCategories(categories.map(c =>
      c.id === selectedCategory.id
        ? { ...c, name: categoryForm.name, description: categoryForm.description, status: categoryForm.status }
        : c
    ));
    resetCategoryForm();
    setIsCategorySheetOpen(false);
    toast.success("Category updated successfully");
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
      status: category.status,
    });
    setIsEditMode(true);
    setIsCategorySheetOpen(true);
  };

  // SubCategory handlers
  const handleAddSubCategory = () => {
    if (!subCategoryForm.name || !parentCategoryId) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newSubCategory: SubCategory = {
      id: `${parentCategoryId}-${Date.now()}`,
      name: subCategoryForm.name,
      description: subCategoryForm.description,
      status: subCategoryForm.status,
    };

    setCategories(categories.map(c =>
      c.id === parentCategoryId
        ? { ...c, subCategories: [...c.subCategories, newSubCategory] }
        : c
    ));
    
    // Expand the parent category to show the new subcategory
    if (!expandedCategories.includes(parentCategoryId)) {
      setExpandedCategories([...expandedCategories, parentCategoryId]);
    }
    
    resetSubCategoryForm();
    setIsSubCategorySheetOpen(false);
    toast.success("Subcategory created successfully");
  };

  const handleEditSubCategory = () => {
    if (!selectedSubCategory || !subCategoryForm.name || !parentCategoryId) {
      toast.error("Please fill in all required fields");
      return;
    }

    setCategories(categories.map(c =>
      c.id === parentCategoryId
        ? {
            ...c,
            subCategories: c.subCategories.map(sc =>
              sc.id === selectedSubCategory.id
                ? { ...sc, name: subCategoryForm.name, description: subCategoryForm.description, status: subCategoryForm.status }
                : sc
            )
          }
        : c
    ));
    resetSubCategoryForm();
    setIsSubCategorySheetOpen(false);
    toast.success("Subcategory updated successfully");
  };

  const handleDeleteSubCategory = (categoryId: string, subCategoryId: string) => {
    setCategories(categories.map(c =>
      c.id === categoryId
        ? { ...c, subCategories: c.subCategories.filter(sc => sc.id !== subCategoryId) }
        : c
    ));
    toast.success("Subcategory deleted successfully");
  };

  const openEditSubCategorySheet = (category: Category, subCategory: SubCategory) => {
    setParentCategoryId(category.id);
    setSelectedSubCategory(subCategory);
    setSubCategoryForm({
      name: subCategory.name,
      description: subCategory.description,
      status: subCategory.status,
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
    c.subCategories.some(sc => sc.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalSubCategories = categories.reduce((acc, c) => acc + c.subCategories.length, 0);

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
                                {category.subCategories.length} subcategories
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={category.status === "Active" ? "default" : "secondary"}>
                                {category.status}
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
                                      onClick={() => handleDeleteCategory(category.id)}
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
                              {category.subCategories.map((subCategory) => (
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
                                    <Badge variant={subCategory.status === "Active" ? "default" : "secondary"}>
                                      {subCategory.status}
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
                                          onClick={() => handleDeleteSubCategory(category.id, subCategory.id)}
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
    </DashboardLayout>
  );
};

export default Categories;
