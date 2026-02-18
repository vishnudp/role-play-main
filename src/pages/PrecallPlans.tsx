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
import { useState } from "react";
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

interface Question {
  id: number;
  question: string;
  answer: string;
  hint: string;
  type: string;
}

interface PrecallPlan {
  id: number;
  name: string;
  organization: string;
  questions: Question[];
  status: string;
  createdAt: string;
}

const questionTypes = [
  "Open-ended",
  "Yes/No",
  "Multiple Choice",
  "Rating Scale",
  "Situational",
  "Behavioral",
];

const PrecallPlans = () => {
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [isViewSheetOpen, setIsViewSheetOpen] = useState(false);
  const [isQuestionsSheetOpen, setIsQuestionsSheetOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PrecallPlan | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [orgFilter, setOrgFilter] = useState<string>("all");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState<Omit<Question, "id">>({
    question: "",
    answer: "",
    hint: "",
    type: "Open-ended",
  });

  const isSuperAdmin = true; // This would come from auth context

  const organizations = [
    { id: 1, name: "TechCorp Solutions" },
    { id: 2, name: "HealthPlus Medical" },
    { id: 3, name: "InnovateTech Inc" },
  ];

  const [plans, setPlans] = useState<PrecallPlan[]>([
    {
      id: 1,
      name: "Sales Discovery Call",
      organization: "TechCorp Solutions",
      questions: [
        { id: 1, question: "What challenges are you currently facing?", answer: "Focus on pain points related to their industry", hint: "Listen for budget and timeline concerns", type: "Open-ended" },
        { id: 2, question: "What is your current solution?", answer: "Document competitor information", hint: "Ask follow-up about satisfaction level", type: "Open-ended" },
        { id: 3, question: "Who is involved in the decision-making process?", answer: "Identify stakeholders and their roles", hint: "Map out the buying committee", type: "Open-ended" },
      ],
      status: "Active",
      createdAt: "2024-01-15",
    },
    {
      id: 2,
      name: "Patient Intake Assessment",
      organization: "HealthPlus Medical",
      questions: [
        { id: 1, question: "Are you experiencing any pain?", answer: "Rate on scale 1-10 and note location", hint: "Ask about duration and triggers", type: "Yes/No" },
        { id: 2, question: "Have you taken any medications today?", answer: "List all medications with dosages", hint: "Check for interactions", type: "Yes/No" },
      ],
      status: "Active",
      createdAt: "2024-02-20",
    },
    {
      id: 3,
      name: "Technical Support Triage",
      organization: "InnovateTech Inc",
      questions: [
        { id: 1, question: "When did the issue first occur?", answer: "Document exact date/time if possible", hint: "Correlate with any system changes", type: "Open-ended" },
        { id: 2, question: "Have you tried restarting the application?", answer: "If yes, note any changes observed", hint: "Basic troubleshooting step", type: "Yes/No" },
        { id: 3, question: "Rate the severity of this issue", answer: "1=Minor, 5=Critical", hint: "Helps prioritize support queue", type: "Rating Scale" },
        { id: 4, question: "What is your preferred contact method?", answer: "Email, Phone, or Chat", hint: "Set response expectations", type: "Multiple Choice" },
      ],
      status: "Active",
      createdAt: "2024-03-10",
    },
  ]);

  const handleEditPlan = (plan: PrecallPlan) => {
    setSelectedPlan(plan);
    setIsEditSheetOpen(true);
  };

  const handleViewPlan = (plan: PrecallPlan) => {
    setSelectedPlan(plan);
    setIsViewSheetOpen(true);
  };

  const handleManageQuestions = (plan: PrecallPlan) => {
    setSelectedPlan(plan);
    setQuestions([...plan.questions]);
    setNewQuestion({ question: "", answer: "", hint: "", type: "Open-ended" });
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
    if (newQuestion.question.trim() && newQuestion.answer.trim()) {
      setQuestions([...questions, { ...newQuestion, id: Date.now() }]);
      setNewQuestion({ question: "", answer: "", hint: "", type: "Open-ended" });
    }
  };

  const handleRemoveQuestion = (id: number) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleSaveQuestions = () => {
    if (selectedPlan) {
      setPlans(plans.map(p => 
        p.id === selectedPlan.id ? { ...p, questions } : p
      ));
      setIsQuestionsSheetOpen(false);
      setSelectedPlan(null);
    }
  };

  const handleOpenAddSheet = () => {
    setIsAddSheetOpen(true);
  };

  const filteredPlans = plans.filter((plan) => {
    const matchesSearch = plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.organization.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOrg = orgFilter === "all" || plan.organization === orgFilter;
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
                {filteredPlans.map((plan) => (
                  <TableRow key={plan.id} className="border-border/50 hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <p className="font-semibold text-foreground">{plan.name}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{plan.organization}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <HelpCircle className="h-3.5 w-3.5" />
                        {plan.questions.length}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={plan.status === "Active" ? "default" : "secondary"}>
                        {plan.status}
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
                      <Input id="plan-name" placeholder="Enter plan name" required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="organization">Organization *</Label>
                      <Select>
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
                      <Switch id="active-status" defaultChecked />
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
                <Button className="flex-1 bg-gradient-primary">
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
                        defaultValue={selectedPlan?.name}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-organization">Organization *</Label>
                      <Select defaultValue={organizations.find(o => o.name === selectedPlan?.organization)?.id.toString()}>
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
                      <Switch id="edit-active-status" defaultChecked={selectedPlan?.status === "Active"} />
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
                <Button className="flex-1 bg-gradient-primary">
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
                                  <Badge variant="outline" className="text-xs">{q.type}</Badge>
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
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => handleRemoveQuestion(q.id)}
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
                            value={newQuestion.type}
                            onValueChange={(value) => setNewQuestion({ ...newQuestion, type: value })}
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
                          <p className="font-medium text-foreground">{selectedPlan.organization}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Status</p>
                          <Badge variant={selectedPlan.status === "Active" ? "default" : "secondary"}>
                            {selectedPlan.status}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Created</p>
                          <p className="font-medium text-foreground">{selectedPlan.createdAt}</p>
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
                                  <Badge variant="outline" className="text-xs">{q.type}</Badge>
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
