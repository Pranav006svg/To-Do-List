import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('Warning: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set. Server will not function properly without them.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Middleware: verify JWT (optional - trusts Supabase session)
async function verifyUser(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Missing Authorization header' });
  const token = auth.split(' ')[1];
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) return res.status(401).json({ error: 'Invalid token' });
    req.user = data.user;
    next();
  } catch (e) {
    return res.status(500).json({ error: 'Auth error' });
  }
}

// GET /tasks - list tasks for user
app.get('/tasks', verifyUser, async (req, res) => {
  const userId = req.user.id;
  const { data, error } = await supabase.from('tasks').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST /tasks - create task
app.post('/tasks', verifyUser, async (req, res) => {
  const userId = req.user.id;
  const { title, description } = req.body;
  const { data, error } = await supabase.from('tasks').insert({ title, description, user_id: userId, completed: false }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// PUT /tasks/:id - update task (partial)
app.put('/tasks/:id', verifyUser, async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const updates = req.body;
  // Ensure the task belongs to user
  const { data: existing, error: fetchErr } = await supabase.from('tasks').select('user_id').eq('id', id).single();
  if (fetchErr) return res.status(500).json({ error: fetchErr.message });
  if (existing.user_id !== userId) return res.status(403).json({ error: 'Not authorized' });
  const { data, error } = await supabase.from('tasks').update(updates).eq('id', id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// DELETE /tasks/:id
app.delete('/tasks/:id', verifyUser, async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { data: existing, error: fetchErr } = await supabase.from('tasks').select('user_id').eq('id', id).single();
  if (fetchErr) return res.status(500).json({ error: fetchErr.message });
  if (existing.user_id !== userId) return res.status(403).json({ error: 'Not authorized' });
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.status(204).send();
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
