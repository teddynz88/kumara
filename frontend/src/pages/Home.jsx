import { BookOpen, CalendarDays } from 'lucide-react';
import { KumaraMark, btnPrimary, btnSecondary } from '../ui';

// Tab indices in App.jsx
const TAB_RECIPES = 1;
const TAB_MEAL_PLAN = 2;

export default function Home({ onNavigate }) {
  return (
    <div className="grad-hero flex min-h-full flex-col items-center justify-center p-8 text-center">
      <span className="text-plum-700 mb-6">
        <KumaraMark className="w-16 h-16" />
      </span>
      <h2 className="type-display text-ink-900 mb-3">Welcome</h2>
      <p className="text-ink-600 max-w-xs leading-relaxed">
        Your recipes, your week, your table.
      </p>
      <div className="mt-10 flex flex-col gap-3 w-full max-w-xs">
        <button className={btnPrimary} onClick={() => onNavigate?.(TAB_RECIPES)}>
          <BookOpen className="w-4 h-4" /> Recipe library
        </button>
        <button className={btnSecondary} onClick={() => onNavigate?.(TAB_MEAL_PLAN)}>
          <CalendarDays className="w-4 h-4" /> Plan the week
        </button>
      </div>
    </div>
  );
}
