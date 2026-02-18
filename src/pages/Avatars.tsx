import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Plus, Bot, FileText, Target, Globe, Settings, Eye, Trash2, Search, User, Palette, Brain, Building2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface AvatarData {
  id: number;
  name: string;
  description: string;
  persona: string;
  role: string;
  selectedAvatarIds: string[];
  background: string;
  personality: string;
  strictness: string;
  knowledgeProfile: string;
  allowedTopics: string;
  conversationDifficulty: string;
  responseLength: string;
  organization: string;
  scenarios: number;
  documents: number;
  uses: number;
  status: string;
  color: string;
}

interface AvatarOption {
  id: string;
  name: string;
  image: string;
}

const Avatars = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrg, setSelectedOrg] = useState("all");
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [isViewSheetOpen, setIsViewSheetOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarData | null>(null);
  const [formData, setFormData] = useState<Partial<AvatarData>>({
    selectedAvatarIds: [],
  });

  // Avatar options for selection
  const avatarOptions: AvatarOption[] = [
    { id: "avatar_001", name: "Alex", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face" },
    { id: "avatar_002", name: "Sarah", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face" },
    { id: "avatar_003", name: "Michael", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" },
    { id: "avatar_004", name: "Emily", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face" },
    { id: "avatar_005", name: "David", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face" },
    { id: "avatar_006", name: "Jessica", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face" },
    { id: "avatar_007", name: "Robert", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face" },
    { id: "avatar_008", name: "Amanda", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face" },
  ];

  const organizations = [
    { id: "1", name: "TechCorp Inc." },
    { id: "2", name: "Healthcare Plus" },
    { id: "3", name: "Finance Solutions" },
  ];

  const [avatars, setAvatars] = useState<AvatarData[]>([
    {
      id: 1,
      name: "Sales Consultant Pro",
      description: "Expert sales avatar for B2B product demonstrations",
      persona: "Experienced sales professional with 15 years in enterprise software",
      role: "Sales Representative",
      selectedAvatarIds: ["avatar_001", "avatar_003"],
      background: "Modern Office",
      personality: "Assertive, Persuasive, Goal-oriented",
      strictness: "Medium",
      knowledgeProfile: "Enterprise Software Sales",
      allowedTopics: "Product features, Pricing, Implementation",
      conversationDifficulty: "Intermediate",
      responseLength: "Medium",
      organization: "TechCorp Inc.",
      scenarios: 12,
      documents: 8,
      uses: 245,
      status: "Active",
      color: "from-blue-500 to-cyan-500"
    },
    {
      id: 2,
      name: "Customer Support Specialist",
      description: "Empathetic support avatar for handling customer queries",
      persona: "Friendly customer service expert specializing in technical support",
      role: "Support Agent",
      selectedAvatarIds: ["avatar_002", "avatar_004"],
      background: "Help Desk",
      personality: "Empathetic, Patient, Problem-solver",
      strictness: "Low",
      knowledgeProfile: "Technical Support",
      allowedTopics: "Troubleshooting, Account issues, Product guidance",
      conversationDifficulty: "Beginner",
      responseLength: "Detailed",
      organization: "Healthcare Plus",
      scenarios: 18,
      documents: 15,
      uses: 389,
      status: "Active",
      color: "from-green-500 to-emerald-500"
    },
    {
      id: 3,
      name: "Technical Expert",
      description: "Deep technical knowledge avatar for complex discussions",
      persona: "Senior engineer with expertise in cloud architecture",
      role: "Technical Consultant",
      selectedAvatarIds: ["avatar_005", "avatar_007"],
      background: "Tech Lab",
      personality: "Analytical, Detail-oriented, Professional",
      strictness: "High",
      knowledgeProfile: "Cloud Architecture",
      allowedTopics: "Technical specifications, Architecture design, Best practices",
      conversationDifficulty: "Advanced",
      responseLength: "Comprehensive",
      organization: "TechCorp Inc.",
      scenarios: 10,
      documents: 22,
      uses: 167,
      status: "Active",
      color: "from-purple-500 to-violet-500"
    },
    {
      id: 4,
      name: "Negotiation Specialist",
      description: "Strategic avatar for negotiation training scenarios",
      persona: "Executive negotiator with Fortune 500 experience",
      role: "Negotiator",
      selectedAvatarIds: ["avatar_006", "avatar_008"],
      background: "Boardroom",
      personality: "Strategic, Diplomatic, Confident",
      strictness: "High",
      knowledgeProfile: "Corporate Negotiations",
      allowedTopics: "Deal terms, Contract negotiation, Strategic partnerships",
      conversationDifficulty: "Expert",
      responseLength: "Concise",
      organization: "Finance Solutions",
      scenarios: 8,
      documents: 12,
      uses: 134,
      status: "Draft",
      color: "from-orange-500 to-amber-500"
    },
  ]);

  const backgroundOptions = ["Modern Office", "Help Desk", "Tech Lab", "Boardroom", "Home Office", "Outdoor", "Abstract", "Plain"];
  const strictnessOptions = ["Low", "Medium", "High", "Very High"];
  const difficultyOptions = ["Beginner", "Intermediate", "Advanced", "Expert"];
  const responseLengthOptions = ["Concise", "Medium", "Detailed", "Comprehensive"];

  const toggleAvatarSelection = (avatarId: string) => {
    const currentSelection = formData.selectedAvatarIds || [];
    if (currentSelection.includes(avatarId)) {
      setFormData({ 
        ...formData, 
        selectedAvatarIds: currentSelection.filter(id => id !== avatarId) 
      });
    } else {
      setFormData({ 
        ...formData, 
        selectedAvatarIds: [...currentSelection, avatarId] 
      });
    }
  };

  const filteredAvatars = avatars.filter(avatar => {
    const matchesSearch = avatar.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         avatar.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOrg = selectedOrg === "all" || avatar.organization === organizations.find(o => o.id === selectedOrg)?.name;
    return matchesSearch && matchesOrg;
  });

  const handleCreateAvatar = () => {
    if (!formData.name || !formData.organization) {
      toast.error("Please fill in required fields");
      return;
    }
    const newAvatar: AvatarData = {
      id: avatars.length + 1,
      name: formData.name || "",
      description: formData.description || "",
      persona: formData.persona || "",
      role: formData.role || "",
      selectedAvatarIds: formData.selectedAvatarIds || [],
      background: formData.background || "Modern Office",
      personality: formData.personality || "",
      strictness: formData.strictness || "Medium",
      knowledgeProfile: formData.knowledgeProfile || "",
      allowedTopics: formData.allowedTopics || "",
      conversationDifficulty: formData.conversationDifficulty || "Intermediate",
      responseLength: formData.responseLength || "Medium",
      organization: formData.organization || "",
      scenarios: 0,
      documents: 0,
      uses: 0,
      status: "Draft",
      color: "from-blue-500 to-cyan-500"
    };
    setAvatars([...avatars, newAvatar]);
    setIsCreateSheetOpen(false);
    setFormData({ selectedAvatarIds: [] });
    toast.success("Avatar created successfully");
  };

  const handleEditAvatar = () => {
    if (!selectedAvatar) return;
    setAvatars(avatars.map(a => a.id === selectedAvatar.id ? { ...selectedAvatar, ...formData } as AvatarData : a));
    setIsEditSheetOpen(false);
    setFormData({ selectedAvatarIds: [] });
    toast.success("Avatar updated successfully");
  };

  const handleDeleteAvatar = () => {
    if (!selectedAvatar) return;
    setAvatars(avatars.filter(a => a.id !== selectedAvatar.id));
    setIsDeleteDialogOpen(false);
    setSelectedAvatar(null);
    toast.success("Avatar deleted successfully");
  };

  const openViewSheet = (avatar: AvatarData) => {
    setSelectedAvatar(avatar);
    setIsViewSheetOpen(true);
  };

  const openEditSheet = (avatar: AvatarData) => {
    setSelectedAvatar(avatar);
    setFormData(avatar);
    setIsEditSheetOpen(true);
  };

  const openDeleteDialog = (avatar: AvatarData) => {
    setSelectedAvatar(avatar);
    setIsDeleteDialogOpen(true);
  };

  const AvatarFormContent = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="space-y-6 py-4">
      {/* Organization Selection */}
      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-3">
        <Label className="flex items-center gap-2 text-sm font-semibold">
          <Building2 className="h-4 w-4 text-primary" />
          Organization *
        </Label>
        <Select value={formData.organization} onValueChange={(value) => setFormData({ ...formData, organization: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select organization" />
          </SelectTrigger>
          <SelectContent>
            {organizations.map(org => (
              <SelectItem key={org.id} value={org.name}>{org.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* A. Metadata Section */}
      <div className="rounded-xl border border-border/50 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 px-4 py-3 border-b border-border/50">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-blue-500/20">
              <User className="h-4 w-4 text-blue-500" />
            </div>
            A. Metadata
          </h3>
        </div>
        <div className="p-4 space-y-4 bg-card/50">
          <div className="space-y-2">
            <Label>Avatar Name *</Label>
            <Input 
              placeholder="Enter avatar name" 
              value={formData.name || ""} 
              onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
            />
          </div>
          <div className="space-y-2">
            <Label>Avatar Description</Label>
            <Textarea 
              placeholder="Describe this avatar's purpose" 
              value={formData.description || ""} 
              onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
            />
          </div>
          <div className="space-y-2">
            <Label>Persona</Label>
            <Textarea 
              placeholder="Define the avatar's persona and background" 
              value={formData.persona || ""} 
              onChange={(e) => setFormData({ ...formData, persona: e.target.value })} 
            />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Input 
              placeholder="e.g., Sales Representative, Support Agent" 
              value={formData.role || ""} 
              onChange={(e) => setFormData({ ...formData, role: e.target.value })} 
            />
          </div>
        </div>
      </div>

      {/* B. Appearance Section */}
      <div className="rounded-xl border border-border/50 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 px-4 py-3 border-b border-border/50">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-purple-500/20">
              <Palette className="h-4 w-4 text-purple-500" />
            </div>
            B. Appearance
          </h3>
        </div>
        <div className="p-4 space-y-4 bg-card/50">
          <div className="space-y-2">
            <Label>Select Avatars <span className="text-muted-foreground text-xs">(Multi-select)</span></Label>
            <p className="text-xs text-muted-foreground mb-3">
              {(formData.selectedAvatarIds || []).length} avatar(s) selected
            </p>
            <div className="grid grid-cols-4 gap-3">
              {avatarOptions.map((avatar) => {
                const isSelected = (formData.selectedAvatarIds || []).includes(avatar.id);
                return (
                  <div
                    key={avatar.id}
                    onClick={() => toggleAvatarSelection(avatar.id)}
                    className={`relative cursor-pointer rounded-lg border-2 p-2 transition-all duration-200 hover:shadow-md ${
                      isSelected 
                        ? "border-primary bg-primary/10 shadow-sm" 
                        : "border-border/50 hover:border-primary/50"
                    }`}
                  >
                    <div className="aspect-square rounded-md overflow-hidden mb-2">
                      <img 
                        src={avatar.image} 
                        alt={avatar.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-xs font-medium text-center truncate">{avatar.name}</p>
                    <p className="text-[10px] text-muted-foreground text-center">{avatar.id}</p>
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Background</Label>
            <Select value={formData.background} onValueChange={(value) => setFormData({ ...formData, background: value })}>
              <SelectTrigger><SelectValue placeholder="Select background" /></SelectTrigger>
              <SelectContent>
                {backgroundOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* C. Behavior Section */}
      <div className="rounded-xl border border-border/50 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 px-4 py-3 border-b border-border/50">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-orange-500/20">
              <Brain className="h-4 w-4 text-orange-500" />
            </div>
            C. Behavior
          </h3>
        </div>
        <div className="p-4 space-y-4 bg-card/50">
          <div className="space-y-2">
            <Label>Personality</Label>
            <Input 
              placeholder="e.g., Assertive, Empathetic, Analytical" 
              value={formData.personality || ""} 
              onChange={(e) => setFormData({ ...formData, personality: e.target.value })} 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Strictness</Label>
              <Select value={formData.strictness} onValueChange={(value) => setFormData({ ...formData, strictness: value })}>
                <SelectTrigger><SelectValue placeholder="Select strictness" /></SelectTrigger>
                <SelectContent>
                  {strictnessOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Conversation Difficulty</Label>
              <Select value={formData.conversationDifficulty} onValueChange={(value) => setFormData({ ...formData, conversationDifficulty: value })}>
                <SelectTrigger><SelectValue placeholder="Select difficulty" /></SelectTrigger>
                <SelectContent>
                  {difficultyOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Knowledge Profile</Label>
            <Input 
              placeholder="e.g., Enterprise Software Sales" 
              value={formData.knowledgeProfile || ""} 
              onChange={(e) => setFormData({ ...formData, knowledgeProfile: e.target.value })} 
            />
          </div>
          <div className="space-y-2">
            <Label>Allowed Topics</Label>
            <Textarea 
              placeholder="Topics the avatar can discuss" 
              value={formData.allowedTopics || ""} 
              onChange={(e) => setFormData({ ...formData, allowedTopics: e.target.value })} 
            />
          </div>
          <div className="space-y-2">
            <Label>Response Length</Label>
            <Select value={formData.responseLength} onValueChange={(value) => setFormData({ ...formData, responseLength: value })}>
              <SelectTrigger><SelectValue placeholder="Select response length" /></SelectTrigger>
              <SelectContent>
                {responseLengthOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );

  const AvatarViewContent = ({ avatar }: { avatar: AvatarData }) => (
    <div className="space-y-6 py-4">
      {/* Organization */}
      <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Organization</p>
        <p className="text-sm font-medium text-foreground">{avatar.organization}</p>
      </div>

      <Separator />

      {/* A. Metadata */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <User className="h-4 w-4 text-primary" />
          A. Metadata
        </h3>
        <div className="grid gap-3">
          <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
            <p className="text-xs text-muted-foreground mb-1">Avatar Name</p>
            <p className="text-sm font-medium">{avatar.name}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
            <p className="text-xs text-muted-foreground mb-1">Description</p>
            <p className="text-sm">{avatar.description || "-"}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
            <p className="text-xs text-muted-foreground mb-1">Persona</p>
            <p className="text-sm">{avatar.persona || "-"}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
            <p className="text-xs text-muted-foreground mb-1">Role</p>
            <p className="text-sm">{avatar.role || "-"}</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* B. Appearance */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Palette className="h-4 w-4 text-accent" />
          B. Appearance
        </h3>
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
            <p className="text-xs text-muted-foreground mb-2">Selected Avatars</p>
            <div className="flex flex-wrap gap-2">
              {avatar.selectedAvatarIds.length > 0 ? (
                avatar.selectedAvatarIds.map(id => (
                  <Badge key={id} variant="secondary" className="text-xs">{id}</Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No avatars selected</p>
              )}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
            <p className="text-xs text-muted-foreground mb-1">Background</p>
            <p className="text-sm font-medium">{avatar.background}</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* C. Behavior */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          C. Behavior
        </h3>
        <div className="grid gap-3">
          <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
            <p className="text-xs text-muted-foreground mb-1">Personality</p>
            <p className="text-sm font-medium">{avatar.personality}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
              <p className="text-xs text-muted-foreground mb-1">Strictness</p>
              <p className="text-sm font-medium">{avatar.strictness}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
              <p className="text-xs text-muted-foreground mb-1">Difficulty</p>
              <p className="text-sm font-medium">{avatar.conversationDifficulty}</p>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
            <p className="text-xs text-muted-foreground mb-1">Knowledge Profile</p>
            <p className="text-sm">{avatar.knowledgeProfile || "-"}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
            <p className="text-xs text-muted-foreground mb-1">Allowed Topics</p>
            <p className="text-sm">{avatar.allowedTopics || "-"}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
            <p className="text-xs text-muted-foreground mb-1">Response Length</p>
            <p className="text-sm font-medium">{avatar.responseLength}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground tracking-tight">Avatar Builder</h1>
            <p className="text-muted-foreground mt-2">Create AI-powered roleplay avatars with customizable personalities and behaviors</p>
          </div>
          <Button 
            onClick={() => { setFormData({ selectedAvatarIds: [] }); setIsCreateSheetOpen(true); }}
            className="bg-gradient-primary hover:shadow-glow transition-all duration-300 h-11 px-6"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Avatar
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search avatars..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedOrg} onValueChange={setSelectedOrg}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="All Organizations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Organizations</SelectItem>
              {organizations.map(org => (
                <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Avatars Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredAvatars.map((avatar) => (
            <Card key={avatar.id} className="border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-300 group overflow-hidden">
              <div className={`h-2 bg-gradient-to-r ${avatar.color}`}></div>
              
              <CardHeader className="pb-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16 border-2 border-border/50">
                    <AvatarFallback className={`bg-gradient-to-br ${avatar.color} text-white text-xl font-bold`}>
                      <Bot className="h-8 w-8" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl group-hover:text-primary transition-colors">{avatar.name}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">{avatar.organization}</p>
                        <Badge variant={avatar.status === "Active" ? "default" : "secondary"} className="mt-2">
                          {avatar.status}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-foreground">{avatar.uses}</p>
                        <p className="text-xs text-muted-foreground font-medium">Total Uses</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-5">
                {/* Description */}
                <div className="p-4 rounded-lg bg-muted/20 border border-border/30">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Description</p>
                  <p className="text-sm text-foreground">{avatar.description}</p>
                </div>

                {/* Selected Avatars & Background */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
                    <div className="flex items-center gap-2 mb-1.5">
                      <User className="h-3.5 w-3.5 text-primary" />
                      <p className="text-xs text-muted-foreground font-medium">Avatars</p>
                    </div>
                    <p className="text-sm font-semibold text-foreground">{avatar.selectedAvatarIds.length} selected</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Globe className="h-3.5 w-3.5 text-accent" />
                      <p className="text-xs text-muted-foreground font-medium">Background</p>
                    </div>
                    <p className="text-sm font-semibold text-foreground">{avatar.background}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-border/30">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => openEditSheet(avatar)}
                    className="flex-1 h-9 text-sm border-border/50 hover:border-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    <Settings className="h-3.5 w-3.5 mr-2" />
                    Configure
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => openViewSheet(avatar)}
                    className="flex-1 h-9 text-sm border-border/50 hover:border-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    <Eye className="h-3.5 w-3.5 mr-2" />
                    View Details
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => openDeleteDialog(avatar)}
                    className="h-9 text-sm border-destructive/50 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Create Avatar Sheet */}
      <Sheet open={isCreateSheetOpen} onOpenChange={setIsCreateSheetOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Create New Avatar</SheetTitle>
            <SheetDescription>Configure your AI avatar with metadata, appearance, voice, and behavior settings.</SheetDescription>
          </SheetHeader>
          <AvatarFormContent />
          <SheetFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsCreateSheetOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateAvatar}>Create Avatar</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Edit Avatar Sheet */}
      <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit Avatar</SheetTitle>
            <SheetDescription>Update your AI avatar configuration.</SheetDescription>
          </SheetHeader>
          <AvatarFormContent isEdit />
          <SheetFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsEditSheetOpen(false)}>Cancel</Button>
            <Button onClick={handleEditAvatar}>Save Changes</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* View Avatar Sheet */}
      <Sheet open={isViewSheetOpen} onOpenChange={setIsViewSheetOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Avatar Details</SheetTitle>
            <SheetDescription>View complete avatar configuration.</SheetDescription>
          </SheetHeader>
          {selectedAvatar && <AvatarViewContent avatar={selectedAvatar} />}
          <SheetFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsViewSheetOpen(false)}>Close</Button>
            <Button onClick={() => { setIsViewSheetOpen(false); openEditSheet(selectedAvatar!); }}>Edit Avatar</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Avatar</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedAvatar?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteAvatar}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Avatars;
