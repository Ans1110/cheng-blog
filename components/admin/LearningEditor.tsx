"use client";

import { CreateLearning, Learning } from "@/types/learning";
import { createLearningSchema } from "@/utils/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Plus, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ControlledInput } from "../ui/controlled-input";
import { Input } from "../ui/input";

interface LearningEditorProps {
  experience?: Learning;
  onSave: (data: {
    year: number;
    title: string;
    skills: string[];
  }) => Promise<void>;
  isLoading?: boolean;
}

export const LearningEditor = ({
  experience,
  onSave,
  isLoading = false,
}: LearningEditorProps) => {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [skills, setSkills] = useState<string[]>(experience?.skills || []);
  const [skillInput, setSkillInput] = useState<string>("");

  const form = useForm<CreateLearning>({
    resolver: zodResolver(createLearningSchema),
    defaultValues: {
      year: experience?.year || new Date().getFullYear(),
      title: experience?.title || "",
      skills: experience?.skills || [],
    },
  });

  const { handleSubmit, setValue } = form;

  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      const newSkills = [...skills, skillInput.trim()];
      setSkills(newSkills);
      setValue("skills", newSkills);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    const newSkills = skills.filter((s) => s !== skill);
    setSkills(newSkills);
    setValue("skills", newSkills);
  };

  const onSubmit = async (data: CreateLearning) => {
    setIsSaving(true);
    try {
      await onSave({ ...data, skills });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="size-4 animate-spin" />
        <p className="ml-2">Loading...</p>
      </div>
    );
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button
            type="submit"
            disabled={isSaving || isLoading}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Year Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <ControlledInput
                      name="year"
                      type="number"
                      label="Year *"
                      placeholder="Enter year"
                      className="w-full"
                      min={2000}
                      max={2100}
                    />
                  </div>
                  <div className="space-y-2">
                    <ControlledInput
                      name="title"
                      label="Title *"
                      placeholder="Enter title"
                      className="w-full"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Skills Learned</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add skill"
                    className="w-full"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && skillInput.trim()) {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddSkill} size="icon">
                    <Plus className="size-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <div
                      key={skill}
                      className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="hover:text-destructive"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
                {skills.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No skills yet. Add some to track your learning.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};
