import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, FileText, HelpCircle, Building2, Trash2, Eye, Lightbulb, ListChecks } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
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
import { fetchOrganizations, fetchPreCallPlans, addPreCallPlans, editPreCallPlans, deletePreCallPlans, addPreCallPlansQuestions, editPreCallPlansQuestions, deletePreCallPlansQuestions } from "@/api/apiService";
import { getOrganizationName, formatToLongDate } from "@/lib/lookupUtils";
import { toast } from "sonner";

interface Question {
  id: number;
  question: string;
  answer: string;
  hint: string;
  question_type: string;
}

interface PrecallPlan {
  id: number;
  name: string;
  organization: string;
  organization_id: string;
  questions: Question[];
  is_active: boolean;
  updated_at: string;
}

const questionTypes = [
  "Open_ended",
  "Yes_No",
  "Multiple_Choice",
  "Rating_Scale",
  "Situational",
  "Behavioral",
];

const PrecallPlans = () => {
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [isViewSheetOpen, setIsViewSheetOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [isQuestionsSheetOpen, setIsQuestionsSheetOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PrecallPlan | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [orgFilter, setOrgFilter] = useState<string>("all");
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isDeleteQuestionDialogOpen, setIsDeleteQuestionDialogOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null);

  // Add state for Add/Edit inputs
  const [addPlanName, setAddPlanName] = useState("");
  const [addOrgId, setAddOrgId] = useState("");
  const [addIsActive, setAddIsActive] = useState(true);

  const [editPlanName, setEditPlanName] = useState("");
  const [editOrgId, setEditOrgId] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState<Omit<Question, "id">>({
    question: "",
    answer: "",
    hint: "",
    question_type: "Open_ended",
  });

  const isSuperAdmin = true; // This would come from auth context

  // const organizations = [
  //   { id: 1, name: "TechCorp Solutions" },
  //   { id: 2, name: "HealthPlus Medical" },
  //   { id: 3, name: "InnovateTech Inc" },
  // ];

  const [plans, setPlans] = useState<PrecallPlan[]>([

  ]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);

      try {
        await fetchOrganizations()
          .then((orgs) => setOrganizations(Array.isArray(orgs) ? orgs : []))
          .catch(() => setOrganizations([]));

        await fetchPreCallPlans()
          .then((res) => {
            if (Array.isArray(res)) {
              setPlans(res);
            } else {
              setPlans([]);
            }
          })
          .catch(() => setPlans([]));
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCreatePlan = async () => {


    if (!addPlanName || !addOrgId) return;
    try {
      await addPreCallPlans({
        name: addPlanName,
        organization_id: addOrgId,
        is_active: addIsActive,
      });
      toast.success("Plan created successfully!");
      setIsAddSheetOpen(false);
      // await loadPlans(); // refetch from API
    } catch (err) {
      toast.error("Failed to create plan.");
    }
  };




  const handleEditPlan = (plan: any) => {
    setSelectedPlan(plan);
    setEditPlanName(plan.name);
    setEditIsActive(plan.is_active); // your status field

    if (organizations.length > 0) {
      const org = organizations.find((o) => o.id === plan.organization_id);
      setEditOrgId(org ? org.id.toString() : "");
    }

    setIsEditSheetOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedPlan || !editPlanName || !editOrgId) return;

    try {
      await editPreCallPlans(selectedPlan.id, {
        name: editPlanName,
        organization_id: editOrgId, // your API probably expects ID
        is_active: editIsActive,    // boolean
      });

      // Update local state


      toast.success("Plan updated successfully!");
      setIsEditSheetOpen(false);
      setSelectedPlan(null);
    } catch (err) {
      toast.error("Failed to update plan.");
    }
  };



  const handleViewPlan = (plan: PrecallPlan) => {
    setSelectedPlan(plan);
    setIsViewSheetOpen(true);
  };

  const handleManageQuestions = (plan: PrecallPlan) => {
    setSelectedPlan(plan);
    setQuestions([...plan.questions]);
    setNewQuestion({ question: "", answer: "", hint: "", question_type: "Open-ended" });
    setIsQuestionsSheetOpen(true);
  };

  const handleDeletePlan = (plan: PrecallPlan) => {
    setSelectedPlan(plan);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedPlan) {
      setPlans(plans.filter(p => p.id !== selectedPlan.id));
      setIsDeleteDialogOpen(false);
      setSelectedPlan(null);
    }
  };

  const handleAddQuestion = () => {
    if (!newQuestion.question.trim() || !newQuestion.answer.trim()) return;

    const localQuestion = {
      ...newQuestion,
      id: Date.now(), // temporary ID for local-only questions
      isNew: true,    // mark it as newly added
    };

    setQuestions([...questions, localQuestion]);

    // Reset form
    setNewQuestion({ question: "", answer: "", hint: "", question_type: "Open-ended" });
  };





  const handleRemoveQuestion = async (question: Question) => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    try {
      // Call API only if question exists
      if (!question.isNew && selectedPlan) {
        await deletePreCallPlans(selectedPlan.id, question.id);
      }

      // Updated questions array
      const updatedQuestions = questions.filter((q) => q.id !== question.id);

      // Update local questions state
      setQuestions(updatedQuestions);

      // Update selectedPlan state
      setSelectedPlan((prev) =>
        prev ? { ...prev, questions: [...updatedQuestions] } : prev
      );

      // Update plans array immutably
      setPlans((prevPlans) =>
        prevPlans.map((plan) =>
          plan.id === selectedPlan?.id
            ? { ...plan, questions: [...updatedQuestions] } // new array reference
            : plan
        )
      );
      // Refresh plans list
      const refreshedPlans = await fetchPreCallPlans();
      setPlans(Array.isArray(refreshedPlans) ? refreshedPlans : []);

      toast.success("Question deleted successfully!");
    } catch {
      toast.error("Failed to delete question.");
    }
  };




  const handleSaveQuestions = async () => {
    if (!selectedPlan) return;

    try {
      // Loop through all questions and call API
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];

        const payload = {
          question_number: i + 1,
          question: q.question,
          question_type: q.question_type.replace(/\s/g, "_"), // e.g., "Open-ended" → "Open_ended"
          answer: q.answer,
          hint: q.hint || "",
        };

        // Decide whether to add or edit based on ID (temporary IDs are > 1e12)
        if (q.id < 1_000_000_000_000) {
          await editPreCallPlansQuestions(payload, selectedPlan.id, q.id);
        } else {
          await addPreCallPlansQuestions(payload, selectedPlan.id);
        }
      }

      // Refresh plans list
      const refreshedPlans = await fetchPreCallPlans();
      setPlans(Array.isArray(refreshedPlans) ? refreshedPlans : []);

      setIsQuestionsSheetOpen(false);
      setSelectedPlan(null);
      toast.success("All questions saved successfully!");
    } catch {
      toast.error("Failed to save questions.");
    }
  };


  const handleOpenAddSheet = () => {
    setIsAddSheetOpen(true);
  };

  const filteredPlans = plans.filter((plan) => {
    const orgName = getOrganizationName(organizations, plan.organization_id);

    const matchesSearch =
      plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      orgName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesOrg = orgFilter === "all" || orgName === orgFilter;

    return matchesSearch && matchesOrg;
  });


  return (
    <DashboardLayout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground tracking-tight">Pre-Call Plan Builder</h1>
            <p className="text-muted-foreground mt-2">Create and manage pre-call plans with structured questions</p>
          </div>
          <Button
            onClick={handleOpenAddSheet}
            className="bg-gradient-primary hover:shadow-glow transition-all duration-300 h-11 px-6"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Plan
          </Button>
        </div>

        {/* Search & Filters */}
        <Card className="border-border/50 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search plans by name..."
                  className="pl-10 h-11 bg-background border-border/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={orgFilter} onValueChange={setOrgFilter}>
                <SelectTrigger className="w-full md:w-[200px] h-11">
                  <SelectValue placeholder="Filter by organization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Organizations</SelectItem>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.name}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Plans List */}
        <Card className="border-border/50 shadow-sm">
          <CardContent className="pt-6">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-4">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary" />
                  <p className="text-sm text-muted-foreground">Loading pre-call plans...</p>
                </div>
              </div>
            ) :
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableHead className="font-semibold">Plan Name</TableHead>
                    <TableHead className="font-semibold">Organization</TableHead>
                    <TableHead className="font-semibold">Questions</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPlans.map((plan: any) => (
                    <TableRow key={plan.id} className="border-border/50 hover:bg-muted/30">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          <p className="font-semibold text-foreground">{plan.name}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{getOrganizationName(organizations, plan.organization_id)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <HelpCircle className="h-3.5 w-3.5" />
                          {plan.questions.length}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={plan.is_active === "Active" ? "default" : "secondary"}>
                          {plan.is_active === "Active" ? "default" : "secondary"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end flex-wrap">
                          <Button variant="outline" size="sm" className="h-8" onClick={() => handleViewPlan(plan)}>
                            <Eye className="h-3.5 w-3.5 mr-1.5" />
                            View
                          </Button>
                          <Button variant="outline" size="sm" className="h-8" onClick={() => handleManageQuestions(plan)}>
                            <ListChecks className="h-3.5 w-3.5 mr-1.5" />
                            Questions
                          </Button>
                          <Button variant="outline" size="sm" className="h-8" onClick={() => handleEditPlan(plan)}>
                            <Edit className="h-3.5 w-3.5 mr-1.5" />
                            Edit
                          </Button>
                          {isSuperAdmin && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleDeletePlan(plan)}
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                              Delete
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            }
          </CardContent>
        </Card>

        {/* Add Plan Sheet */}
        <Sheet open={isAddSheetOpen} onOpenChange={setIsAddSheetOpen}>
          <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto flex flex-col p-0">
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                <SheetHeader>
                  <SheetTitle className="text-2xl">Create Pre-Call Plan</SheetTitle>
                  <SheetDescription>Define a new pre-call plan. You can add questions after creation.</SheetDescription>
                </SheetHeader>

                <div className="space-y-6 py-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="plan-name">Plan Name *</Label>
                      <Input id="plan-name" placeholder="Enter plan name" required value={addPlanName}               // <-- bind to state
                        onChange={(e) => setAddPlanName(e.target.value)} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="organization">Organization *</Label>
                      <Select
                        value={addOrgId}                  // <-- bind to state
                        onValueChange={(value) => setAddOrgId(value)} // <-- update state
                      >
                        <SelectTrigger id="organization">
                          <SelectValue placeholder="Select organization" />
                        </SelectTrigger>
                        <SelectContent>
                          {organizations.map((org) => (
                            <SelectItem key={org.id} value={org.id.toString()}>
                              {org.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <div className="space-y-0.5">
                        <Label htmlFor="active-status">Active</Label>
                        <p className="text-sm text-muted-foreground">Enable this pre-call plan</p>
                      </div>
                      <Switch
                        id="active-status"
                        checked={addIsActive}             // <-- bind to state
                        onCheckedChange={(checked) => setAddIsActive(checked)} // <-- update state
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <SheetFooter className="border-t bg-background p-6 mt-auto">
              <div className="flex gap-3 w-full">
                <Button variant="outline" className="flex-1" onClick={() => setIsAddSheetOpen(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 bg-gradient-primary" onClick={() => handleCreatePlan()}>
                  Create Plan
                </Button>
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {/* Edit Plan Sheet */}
        <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
          <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto flex flex-col p-0">
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                <SheetHeader>
                  <SheetTitle className="text-2xl">Edit Pre-Call Plan</SheetTitle>
                  <SheetDescription>Update the pre-call plan details</SheetDescription>
                </SheetHeader>

                <div className="space-y-6 py-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-plan-name">Plan Name *</Label>
                      <Input
                        id="edit-plan-name"
                        placeholder="Enter plan name"
                        value={editPlanName} // bind to state
                        onChange={(e) => setEditPlanName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-organization">Organization *</Label>
                      <Select value={editOrgId} onValueChange={setEditOrgId}>
                        <SelectTrigger id="edit-organization">
                          <SelectValue placeholder="Select organization" />
                        </SelectTrigger>
                        <SelectContent>
                          {organizations.map((org) => (
                            <SelectItem key={org.id} value={org.id.toString()}>
                              {org.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <div className="space-y-0.5">
                        <Label htmlFor="edit-active-status">Active</Label>
                        <p className="text-sm text-muted-foreground">Enable this pre-call plan</p>
                      </div>
                      <Switch
                        id="edit-active-status"
                        checked={editIsActive} // bind to state
                        onCheckedChange={(checked) => setEditIsActive(checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <SheetFooter className="border-t bg-background p-6 mt-auto">
              <div className="flex gap-3 w-full">
                <Button variant="outline" className="flex-1" onClick={() => setIsEditSheetOpen(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 bg-gradient-primary" onClick={handleSaveEdit}>
                  Save Changes
                </Button>
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {/* Manage Questions Sheet */}
        <Sheet open={isQuestionsSheetOpen} onOpenChange={setIsQuestionsSheetOpen}>
          <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto flex flex-col p-0">
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                <SheetHeader>
                  <SheetTitle className="text-2xl">Manage Questions</SheetTitle>
                  <SheetDescription>
                    Add, edit, or remove questions for "{selectedPlan?.name}"
                  </SheetDescription>
                </SheetHeader>

                <div className="space-y-6 py-6">
                  {/* Existing Questions */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Questions ({questions.length})</h3>

                    {questions.length === 0 ? (
                      <div className="text-center py-8 border border-dashed border-border rounded-lg">
                        <HelpCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">No questions yet. Add your first question below.</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[300px] overflow-y-auto">
                        {questions.map((q, index) => (
                          <div key={q.id} className="border border-border/50 rounded-lg p-4 bg-muted/20">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-primary">Q{index + 1}.</span>
                                  <Badge variant="outline" className="text-xs">{q.question_type}</Badge>
                                </div>
                                <p className="font-medium text-foreground">{q.question}</p>
                                <div className="space-y-1 text-sm">
                                  <p className="text-muted-foreground">
                                    <span className="font-medium text-foreground">Answer:</span> {q.answer}
                                  </p>
                                  {q.hint && (
                                    <p className="text-muted-foreground flex items-center gap-1">
                                      <Lightbulb className="h-3 w-3 text-amber-500" />
                                      <span className="font-medium text-foreground">Hint:</span> {q.hint}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-primary hover:text-accent"
                                onClick={() => setEditingQuestion(q)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => { setQuestionToDelete(q); setIsDeleteQuestionDialogOpen(true); }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Add New Question Form */}
                  <div className="border-t pt-4">
                    <div className="border border-dashed border-border rounded-lg p-4 space-y-4">
                      <p className="text-sm font-medium text-muted-foreground">Add New Question</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 space-y-2">
                          <Label>Question *</Label>
                          <Input
                            placeholder="Enter your question"
                            value={newQuestion.question}
                            onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Question Type</Label>
                          <Select
                            value={newQuestion.question_type}
                            onValueChange={(value) => setNewQuestion({ ...newQuestion, question_type: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {questionTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-2 space-y-2">
                          <Label>Answer / Expected Response *</Label>
                          <Textarea
                            placeholder="Enter the expected answer or response guidelines"
                            value={newQuestion.answer}
                            onChange={(e) => setNewQuestion({ ...newQuestion, answer: e.target.value })}
                            rows={2}
                          />
                        </div>
                        <div className="col-span-2 space-y-2">
                          <Label className="flex items-center gap-1">
                            <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                            Hint / Suggestion
                          </Label>
                          <Input
                            placeholder="Enter a hint or suggestion for this question"
                            value={newQuestion.hint}
                            onChange={(e) => setNewQuestion({ ...newQuestion, hint: e.target.value })}
                          />
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleAddQuestion}
                        disabled={!newQuestion.question.trim() || !newQuestion.answer.trim()}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Question
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <SheetFooter className="border-t bg-background p-6 mt-auto">
              <div className="flex gap-3 w-full">
                <Button variant="outline" className="flex-1" onClick={() => setIsQuestionsSheetOpen(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 bg-gradient-primary" onClick={handleSaveQuestions}>
                  Save Questions
                </Button>
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {/* Edit Question Sheet */}
        {/* Edit Question Sheet */}
        {editingQuestion && (
          <Sheet
            open={!!editingQuestion}
            onOpenChange={() => setEditingQuestion(null)}
          >
            <SheetContent side="right" className="w-full sm:max-w-md p-6 flex flex-col">
              <SheetHeader>
                <SheetTitle>Edit Question</SheetTitle>
              </SheetHeader>

              {/* Question Form */}
              <div className="space-y-4">
                <Input
                  placeholder="Question"
                  value={editingQuestion.question}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, question: e.target.value })
                  }
                />
                <Select
                  value={editingQuestion.question_type}
                  onValueChange={(value) =>
                    setEditingQuestion({ ...editingQuestion, question_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {questionTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Textarea
                  placeholder="Answer"
                  value={editingQuestion.answer}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, answer: e.target.value })
                  }
                />
                <Input
                  placeholder="Hint"
                  value={editingQuestion.hint}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, hint: e.target.value })
                  }
                />
              </div>

              {/* Save / Cancel buttons */}
              <SheetFooter className="mt-auto flex gap-2">
                <Button variant="outline" onClick={() => setEditingQuestion(null)}>
                  Cancel
                </Button>

                {/* <-- THIS IS WHERE YOUR BUTTON HANDLER GOES --> */}
                <Button
                  onClick={async () => {
                    if (!selectedPlan || !editingQuestion) return;

                    const payload = {
                      question_number: questions.findIndex(q => q.id === editingQuestion.id) + 1,
                      question: editingQuestion.question,
                      question_type: editingQuestion.question_type.replace(/\s/g, "_"),
                      answer: editingQuestion.answer,
                      hint: editingQuestion.hint || "",
                    };

                    try {
                      // Call API only if question exists in backend
                      if (!editingQuestion.isNew) {
                        await editPreCallPlans(selectedPlan.id, payload);
                      }

                      // Update local state regardless
                      setQuestions(
                        questions.map((q) =>
                          q.id === editingQuestion.id ? { ...editingQuestion, isNew: q.isNew } : q
                        )
                      );

                      setEditingQuestion(null);
                      toast.success("Question updated successfully!");
                    } catch {
                      toast.error("Failed to update question.");
                    }
                  }}
                >
                  Save
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        )}


        {/* Delete Question Confirmation Dialog */}
        <AlertDialog
          open={isDeleteQuestionDialogOpen}
          onOpenChange={setIsDeleteQuestionDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Question</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this question? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={async () => {
                  if (!selectedPlan || !questionToDelete) return;
                  try {
                    await deletePreCallPlansQuestions(selectedPlan.id, questionToDelete.id);
                    setQuestions(questions.filter((q) => q.id !== questionToDelete.id));
                    setIsDeleteQuestionDialogOpen(false);
                    const refreshedPlans = await fetchPreCallPlans();
                    setPlans(Array.isArray(refreshedPlans) ? refreshedPlans : []);
                    toast.success("Question deleted successfully!");
                  } catch {
                    toast.error("Failed to delete question.");
                  }
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>



        {/* View Plan Sheet */}
        <Sheet open={isViewSheetOpen} onOpenChange={setIsViewSheetOpen}>
          <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto flex flex-col p-0">
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                <SheetHeader>
                  <SheetTitle className="text-2xl">View Pre-Call Plan</SheetTitle>
                  <SheetDescription>Pre-call plan details and questions</SheetDescription>
                </SheetHeader>

                {selectedPlan && (
                  <div className="space-y-6 py-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Plan Name</p>
                          <p className="font-medium text-foreground">{selectedPlan.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Organization</p>
                          <p className="font-medium text-foreground">{getOrganizationName(organizations, selectedPlan.organization_id)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Status</p>
                          <Badge variant={selectedPlan.is_active ? "default" : "secondary"}>
                            {selectedPlan.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Created</p>
                          <p className="font-medium text-foreground">{formatToLongDate(selectedPlan.updated_at)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Questions */}
                    <div className="border-t pt-4">
                      <h3 className="text-lg font-semibold text-foreground mb-4">
                        Questions ({selectedPlan.questions.length})
                      </h3>
                      {selectedPlan.questions.length === 0 ? (
                        <div className="text-center py-8 border border-dashed border-border rounded-lg">
                          <HelpCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-muted-foreground">No questions added yet.</p>
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-[400px] overflow-y-auto">
                          {selectedPlan.questions.map((q, index) => (
                            <div key={q.id} className="border border-border/50 rounded-lg p-4 bg-muted/20">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-primary">Q{index + 1}.</span>
                                  <Badge variant="outline" className="text-xs">{q.question_type}</Badge>
                                </div>
                                <p className="font-medium text-foreground">{q.question}</p>
                                <div className="space-y-1 text-sm">
                                  <p className="text-muted-foreground">
                                    <span className="font-medium text-foreground">Answer:</span> {q.answer}
                                  </p>
                                  {q.hint && (
                                    <p className="text-muted-foreground flex items-center gap-1">
                                      <Lightbulb className="h-3 w-3 text-amber-500" />
                                      <span className="font-medium text-foreground">Hint:</span> {q.hint}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <SheetFooter className="border-t bg-background p-6 mt-auto">
              <Button variant="outline" className="w-full" onClick={() => setIsViewSheetOpen(false)}>
                Close
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Pre-Call Plan</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{selectedPlan?.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default PrecallPlans;
