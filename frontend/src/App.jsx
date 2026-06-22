import { useState } from 'react';
import { House, BookOpen, CalendarDays, ShoppingBasket, User } from 'lucide-react';
import Home from './pages/Home';
import Recipes from './pages/Recipes';
import MealPlan from './pages/MealPlan';
import Shopping from './pages/Shopping';
import Profile from './pages/Profile';
import { KumaraMark } from './ui';

const tabs = [
  { name: 'Home', icon: House, component: Home },
  { name: 'Recipes', icon: BookOpen, component: Recipes },
  { name: 'Meal Plan', icon: CalendarDays, component: MealPlan },
  { name: 'Shopping', icon: ShoppingBasket, component: Shopping },
  { name: 'Profile', icon: User, component: Profile },
];

export default function App({ session }) {
  const [activeTab, setActiveTab] = useState(0);
  const ActivePage = tabs[activeTab].component;

  return (
    <div className="flex flex-col h-dvh bg-sand-50 max-w-md mx-auto">
      {/* Header */}
      <header className="grad-header-wash flex items-center justify-center gap-2 h-14 border-b border-stone-200 shrink-0">
        <span className="text-plum-700">
          <KumaraMark className="w-7 h-7" />
        </span>
        <h1 className="font-display text-2xl text-ink-900 leading-none">Kūmara</h1>
      </header>

      {/* Page content */}
      <main className="flex-1 overflow-y-auto">
        <ActivePage onNavigate={setActiveTab} session={session} />
      </main>

      {/* Bottom navigation */}
      <nav className="flex items-center justify-around bg-sand-100 border-t border-stone-200 h-16 shrink-0 pb-[env(safe-area-inset-bottom)]">
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const isActive = activeTab === index;
          return (
            <button
              key={tab.name}
              onClick={() => setActiveTab(index)}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
                isActive ? 'text-plum-500' : 'text-ink-900/60'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-[10px] font-medium">{tab.name}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
