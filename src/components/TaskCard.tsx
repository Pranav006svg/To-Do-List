import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Task {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  created_at: string;
}

interface TaskCardProps {
  task: Task;
  onUpdate: () => void;
}

export const TaskCard = ({ task, onUpdate }: TaskCardProps) => {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    const { error } = await supabase
      .from("tasks")
      .update({ completed: !task.completed })
      .eq("id", task.id);

    setLoading(false);

    if (error) {
      toast.error("Failed to update task");
    } else {
      onUpdate();
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    const { error } = await supabase.from("tasks").delete().eq("id", task.id);

    setLoading(false);

    if (error) {
      toast.error("Failed to delete task");
    } else {
      toast.success("Task deleted");
      onUpdate();
    }
  };

  return (
    <Card
      className="p-4 transition-all duration-300 hover:shadow-lg animate-fade-in"
      style={{
        background: "var(--gradient-card)",
        opacity: task.completed ? 0.7 : 1,
      }}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={task.completed}
          onCheckedChange={handleToggle}
          disabled={loading}
          className="mt-1"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <h3 className={`font-semibold ${task.completed ? "line-through text-slate-400" : "bg-gradient-to-r from-indigo-600 to-rose-500 bg-clip-text text-transparent"}`}>
              {task.title}
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">{formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}</span>
              {Date.now() - new Date(task.created_at).getTime() < 1000 * 60 * 60 * 24 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">New</span>
              )}
            </div>
          </div>
          {task.description && (
            <p className="text-sm text-slate-600 mt-1">{task.description}</p>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          disabled={loading}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};
