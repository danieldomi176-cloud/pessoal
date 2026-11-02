export type Profile = {
  user_id: string;
  display_name: string;
  theme: 'dark' | 'light';
  spiritual_reflection: boolean;
  dashboard_cards: string[];
  daily_reading_minutes: number;
  current_book_id?: string | null;
};
export type Task = {
  id: string;
  title: string;
  pillar: string;
  due_date: string;
  priority: number;
  completed_at: string | null;
  created_at: string;
};
export type Habit = { id: string; title: string; pillar: string; created_at: string };
export type HabitEntry = { id: string; habit_id: string; entry_date: string };
export type Book = {
  id: string;
  title: string;
  author: string;
  total_pages: number;
  current_page: number;
  created_at: string;
};
export type ReadingSession = {
  id: string;
  book_id: string;
  started_at: string;
  ended_at: string | null;
  elapsed_seconds: number;
  pages_read: number;
  reflection: string;
  planned_seconds: number;
};
export type FocusSession = {
  id: string;
  task_id: string | null;
  objective: string;
  blocker: string;
  planned_seconds: number;
  started_at: string;
  ended_at: string | null;
  elapsed_seconds: number;
};
export type Attempt = {
  id: string;
  lesson_id: string;
  curriculum_version: string;
  answers: Record<string, string>;
  correct: number;
  total: number;
  created_at: string;
};
export type Review = {
  id: string;
  word_id: string;
  repetitions: number;
  interval_days: number;
  due_date: string;
};
export type Workspace = {
  profile: Profile;
  tasks: Task[];
  habits: Habit[];
  entries: HabitEntry[];
  books: Book[];
  reading: ReadingSession[];
  focus: FocusSession[];
  attempts: Attempt[];
  reviews: Review[];
  email: string;
};
export type ActionResult = {
  ok: boolean;
  message: string;
  feedback?: { prompt: string; answer: string; correct: boolean; explanation: string }[];
};
