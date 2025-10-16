import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const taskSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  description: z.string().trim().max(1000, "Description must be less than 1000 characters").optional(),
});

interface TaskFormProps {
  onTaskCreated: () => void;
}

export const TaskForm = ({ onTaskCreated }: TaskFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      taskSchema.parse({ title, description });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      }
      return;
    }

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("You must be logged in to create tasks");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("tasks").insert({
      title: title.trim(),
      description: description.trim() || null,
      user_id: user.id,
      completed: false,
    });

    setLoading(false);

    if (error) {
      toast.error("Failed to create task");
    } else {
      toast.success("Task created!");
      setTitle("");
      setDescription("");
      onTaskCreated();
    }
  };

  return (
    <Card className="animate-scale-in" style={{ background: "var(--gradient-card)" }}>
      <CardHeader>
        <CardTitle className="text-xl bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
          Create New Task
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              required
              maxLength={200}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details..."
              rows={3}
              maxLength={1000}
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
            style={{ background: "var(--gradient-primary)" }}
          >
            {loading ? "Creating..." : "Create Task"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
