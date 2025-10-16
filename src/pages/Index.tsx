import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Trash2 } from "lucide-react";
import { TaskForm } from "@/components/TaskForm";
import { TaskCard } from "@/components/TaskCard";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import type { User, Session } from "@supabase/supabase-js";

interface Task {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  created_at: string;
}

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session) {
          navigate("/auth");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchTasks = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load tasks");
    } else {
      setTasks(data || []);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  // Realtime subscription for tasks so UI updates on insert/update/delete
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`tasks:user-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks", filter: `user_id=eq.${user.id}` },
        () => {
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      try {
        // remove by channel name if available
        supabase.removeChannel(channel);
      } catch (e) {
        // ignore
      }
    };
  }, [user, fetchTasks]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to sign out");
    } else {
      toast.success("Signed out successfully");
      navigate("/auth");
    }
  };

  const markAllComplete = async () => {
    if (!user || tasks.length === 0) return;
    const confirmed = window.confirm("Mark all tasks as completed?");
    if (!confirmed) return;

    const { error } = await supabase
      .from("tasks")
      .update({ completed: true })
      .eq("user_id", user.id)
      .neq("completed", true);

    if (error) {
      toast.error("Failed to update tasks");
    } else {
      toast.success("All tasks marked complete");
      fetchTasks();
    }
  };

  const clearCompleted = async () => {
    if (!user) return;
    const confirmed = window.confirm("Delete all completed tasks? This cannot be undone.");
    if (!confirmed) return;

    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("user_id", user.id)
      .eq("completed", true);

    if (error) {
      toast.error("Failed to delete completed tasks");
    } else {
      toast.success("Completed tasks cleared");
      fetchTasks();
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const completedTasks = tasks.filter((t) => t.completed).length;
  const totalTasks = tasks.length;
  const percent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const filteredTasks = tasks.filter((t) => {
    if (filter === "active" && t.completed) return false;
    if (filter === "completed" && !t.completed) return false;
    if (search && !`${t.title} ${t.description ?? ""}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-rose-500 bg-clip-text text-transparent">
              Task Manager
            </h1>
            <p className="mt-2 text-sm text-indigo-600/90">
              {totalTasks === 0
                ? "Start by creating your first task"
                : `${completedTasks} of ${totalTasks} tasks completed`}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </header>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-white shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-500">Total Tasks</div>
                <div className="text-2xl font-bold text-slate-900">{totalTasks}</div>
              </div>
              <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-indigo-50 text-indigo-600">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none"><path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-white shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-500">Active</div>
                <div className="text-2xl font-bold text-amber-600">{totalTasks - completedTasks}</div>
              </div>
              <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-amber-50 text-amber-600">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none"><path d="M12 5v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-white shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-500">Completed</div>
                <div className="text-2xl font-bold text-emerald-600">{completedTasks}</div>
              </div>
              <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-emerald-50 text-emerald-600">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            </div>
          </div>
        </div>
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Input placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)} />
                <div className="flex gap-2">
                  <Button variant={filter === "all" ? "default" : "ghost"} onClick={() => setFilter("all")}>All</Button>
                  <Button variant={filter === "active" ? "default" : "ghost"} onClick={() => setFilter("active")}>Active</Button>
                  <Button variant={filter === "completed" ? "default" : "ghost"} onClick={() => setFilter("completed")}>Completed</Button>
                </div>
              </div>

              <TaskForm onTaskCreated={fetchTasks} />
            </div>
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-slate-900">Your Tasks</h2>
              <div className="flex items-center gap-4">
                <div className="text-sm text-slate-600">{completedTasks} completed</div>
                <div className="w-12 h-12">
                  {/* Progress ring */}
                  <svg viewBox="0 0 36 36" className="w-12 h-12">
                    <path className="text-slate-200" d="M18 2.0845a15.9155 15.9155 0 1 0 0 31.831" fill="none" strokeWidth="3" stroke="#e6edf3"/>
                    <path d="M18 2.0845a15.9155 15.9155 0 1 0 0 31.831" fill="none" strokeWidth="3" strokeLinecap="round" stroke="#6366f1" strokeDasharray={`${percent} ${100 - percent}`} strokeDashoffset="25"/>
                    <text x="18" y="20" className="text-xs" textAnchor="middle" fill="#0f172a">{percent}%</text>
                  </svg>
                </div>
              </div>
            </div>

            {filteredTasks.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <p>No tasks match your filters.</p>
                <p className="mt-3 text-sm">Create a new task to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTasks.map((task) => (
                  <TaskCard key={task.id} task={task} onUpdate={fetchTasks} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
