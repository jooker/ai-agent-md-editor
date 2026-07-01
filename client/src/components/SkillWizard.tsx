import React, { useState } from "react";
import { 
  Sparkles, 
  ChevronRight, 
  FolderGit2, 
  Check, 
  X, 
  FileCode2,
  ListTodo
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SkillWizardProps {
  open: boolean;
  onClose: () => void;
  onOpenWorkspace: (dirPath: string) => void;
  onOpenFile: (filePath: string) => void;
}

export function SkillWizard({ open, onClose, onOpenWorkspace, onOpenFile }: SkillWizardProps) {
  const [step, setStep] = useState(1);
  
  // Form states
  const [skillId, setSkillId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [version, setVersion] = useState("1.0.0");
  const [trigger, setTrigger] = useState("");
  
  // Custom folder structure options
  const [createFolders, setCreateFolders] = useState({
    scripts: true,
    references: true,
    assets: true,
    themes: false
  });

  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setStep(1);
    setSkillId("");
    setName("");
    setDescription("");
    setVersion("1.0.0");
    setTrigger("");
    setCreateFolders({
      scripts: true,
      references: true,
      assets: true,
      themes: false
    });
  };

  const handleNext = () => {
    if (step === 1) {
      if (!skillId.trim()) {
        toast.error("Please enter a unique Skill ID/Folder Name");
        return;
      }
      // Sanitize ID
      const safeId = skillId.trim().toLowerCase().replace(/[^a-z0-9-_]/g, "-");
      setSkillId(safeId);
      
      if (!name.trim()) {
        toast.error("Please enter a Display Name for your skill");
        return;
      }
      setStep(2);
    }
  };

  const handleCreate = async () => {
    if (!description.trim() || !trigger.trim()) {
      toast.error("Please enter a description and trigger condition");
      return;
    }

    setLoading(true);
    try {
      // 1. Fetch library path to find where to create
      const libRes = await fetch("/api/library");
      const libData = await libRes.json();
      if (!libRes.ok || !libData.success) {
        throw new Error("Could not find library directory: " + libData.error);
      }

      const libraryRoot = libData.path;
      const destinationParent = `${libraryRoot}/Skills`;
      const skillFolderPath = `${destinationParent}/${skillId}`;

      // 2. Create parent skill directory
      const createFolderRes = await fetch("/api/workspace/file/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentPath: destinationParent,
          name: skillId,
          isDir: true
        })
      });
      const folderData = await createFolderRes.json();
      if (!folderData.success) {
        throw new Error("Failed to create skill directory: " + folderData.error);
      }

      // 3. Create subfolders
      const subfolders = Object.entries(createFolders)
        .filter(([_, value]) => value)
        .map(([key]) => key);

      for (const sub of subfolders) {
        await fetch("/api/workspace/file/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            parentPath: skillFolderPath,
            name: sub,
            isDir: true
          })
        });
      }

      // 4. Create SKILL.md file
      const createFileRes = await fetch("/api/workspace/file/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentPath: skillFolderPath,
          name: "SKILL.md",
          isDir: false
        })
      });
      const fileData = await createFileRes.json();
      if (!fileData.success) {
        throw new Error("Failed to create SKILL.md: " + fileData.error);
      }

      // 5. Write content to SKILL.md
      const skillTemplate = `---
name: "${name}"
description: "${description.replace(/"/g, '\\"')}"
version: "${version}"
trigger: "${trigger.replace(/"/g, '\\"')}"
---
# ${name}

## Role
You are an expert agent equipped with the ${name} skill.

## Trigger Conditions
Use this skill when:
- ${trigger}

## Core Guidelines
1. Detail standard operating procedures here.
2. Outline safety thresholds, guidelines, and parameter checks.
3. Reference executable scripts in the \`scripts/\` directory when automation is needed.

## Workflow Execution Steps
1. **Analyze Input**: Evaluate the task parameters against guidelines.
2. **Execute Automation**: Run corresponding scripts in the \`scripts/\` directory if required.
3. **Verify Output**: Check results for compliance and correctness.

## References & Documentation
- Refer to detailed schemas or logs inside the \`references/\` directory.
`;

      const writeFileRes = await fetch("/api/workspace/file/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filePath: fileData.path,
          content: skillTemplate
        })
      });

      if (!writeFileRes.ok) {
        throw new Error("Failed to write template content to SKILL.md");
      }

      toast.success(`Skill package "${name}" scaffolded successfully!`);
      
      // Close modal and reset
      onClose();
      resetForm();

      // Open new directory in workspace tree
      onOpenWorkspace(skillFolderPath);
      
      // Open SKILL.md in active editor tabs
      onOpenFile(fileData.path);

    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred during scaffolding");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { onClose(); resetForm(); } }}>
      <DialogContent className="max-w-md bg-background border border-border/80 p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-border/50 bg-muted/10 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500 fill-amber-500/10" />
            <DialogTitle className="text-base font-bold text-foreground">
              New Skill Package Workspace Wizard
            </DialogTitle>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Scaffold an open standard agent skill package (agentskills.io)
          </div>
        </DialogHeader>

        {/* Wizard Form */}
        <div className="p-6 space-y-4">
          {step === 1 ? (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Skill ID / Folder Name</span>
                  <span className="text-[10px] text-muted-foreground font-normal">Safe system name (lowercase, no spaces)</span>
                </label>
                <Input
                  placeholder="e.g. git-sprint-helper"
                  value={skillId}
                  onChange={e => setSkillId(e.target.value)}
                  className="h-9"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Display Name</label>
                <Input
                  placeholder="e.g. Git Sprint Helper"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="h-9"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">SemVer Version</label>
                <Input
                  placeholder="e.g. 1.0.0"
                  value={version}
                  onChange={e => setVersion(e.target.value)}
                  className="h-9 font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground block mb-1">Scaffold Directories</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(createFolders).map((f) => {
                    const key = f as keyof typeof createFolders;
                    return (
                      <Button
                        key={key}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setCreateFolders(p => ({ ...p, [key]: !p[key] }))}
                        className={`h-8 justify-start text-[11px] font-mono border-border/80 ${createFolders[key] ? "bg-amber-500/10 border-amber-500/40 text-amber-600 dark:text-amber-400 font-medium" : "text-muted-foreground"}`}
                      >
                        {createFolders[key] ? <Check className="h-3.5 w-3.5 mr-1.5 text-amber-500" /> : <X className="h-3.5 w-3.5 mr-1.5" />}
                        {key}/
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button 
                  onClick={handleNext}
                  className="text-xs h-8 bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                >
                  Next Details <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Skill Description</label>
                <Textarea
                  placeholder="Describe the specialized knowledge this skill package exposes to the AI Agent..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="min-h-20 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Trigger Condition (When to invoke)</span>
                  <span className="text-[10px] text-muted-foreground font-normal">Instruction trigger</span>
                </label>
                <Textarea
                  placeholder="e.g. When the user asks to clean commits, prepare sprints, or generate pull request write-ups."
                  value={trigger}
                  onChange={e => setTrigger(e.target.value)}
                  className="min-h-20 text-xs"
                />
              </div>

              <div className="bg-amber-500/5 dark:bg-amber-500/5 border border-amber-500/20 rounded-md p-3 text-[11px] leading-normal text-muted-foreground flex gap-2">
                <FolderGit2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  Creating this skill will generate files in your Library directory: <strong className="text-foreground font-mono">{skillId}/SKILL.md</strong> along with selected folders.
                </div>
              </div>

              <div className="pt-2 flex justify-between">
                <Button variant="ghost" onClick={() => setStep(1)} className="text-xs h-8">
                  Back
                </Button>
                <Button 
                  onClick={handleCreate}
                  disabled={loading}
                  className="text-xs h-8 bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                >
                  {loading ? (
                    <>
                      <div className="h-3.5 w-3.5 border-2 border-black border-t-transparent animate-spin rounded-full mr-1.5"></div>
                      Scaffolding...
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5 mr-1" /> Create Skill Workspace
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
