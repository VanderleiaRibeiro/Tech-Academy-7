// Habit (Aggregate Root)
export interface Habit {
  id: string;
  userId: string;
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly';
  createdAt: string;
  updatedAt?: string;
}

// Value Objects
export interface HabitName { value: string }
export interface DailyCompletion { date: string; habitId: string; completed: boolean }

// Aggregate example (skeleton)
export class HabitAggregate {
  private habit: Habit;
  private completions: DailyCompletion[] = [];
  constructor(habit: Habit) { this.habit = habit; }
  markAsCompleted(date: string) { this.completions.push({ date, habitId: this.habit.id, completed: true }); }
  getWeeklyProgress() { return this.completions.length; }
}
