import { useState } from 'react';
import { HiHome, HiBookOpen, HiCalendarDays, HiShoppingCart, HiUser } from 'react-icons/hi2';
import Home from './pages/Home';
import Recipes from './pages/Recipes';
import MealPlan from './pages/MealPlan';
import Shopping from './pages/Shopping';
import Profile from './pages/Profile';

const tabs = [
  { name: 'Home', icon: HiHome, component: Home },
  { name: 'Recipes', icon: HiBookOpen, component: Recipes },
  { name: 'Meal Plan', icon: HiCalendarDays, component: MealPlan },
  { name: 'Shopping', icon: HiShoppingCart, component: Shopping },
  { name: 'Profile', icon: HiUser, component: Profile },
];

export default function App() {
  const [activeTab, setActiveTab] = useState(0);
  const ActivePage = tabs[activeTab].component;

  return (
    <div className="flex flex-col h-dvh bg-warm-bg max-w-md mx-auto">
      {/* Header */}
      <header className="flex items-center justify-center h-14 bg-white border-b border-warm-200 shrink-0">
        <h1 className="text-xl font-bold text-primary tracking-tight">Kumara</h1>
      </header>

      {/* Page content */}
      <main className="flex-1 overflow-y-auto">
        <ActivePage />
      </main>

      {/* Bottom navigation */}
      <nav className="flex items-center justify-around bg-white border-t border-warm-200 h-16 shrink-0 pb-[env(safe-area-inset-bottom)]">
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const isActive = activeTab === index;
          return (
            <button
              key={tab.name}
              onClick={() => setActiveTab(index)}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
                isActive ? 'text-primary' : 'text-dark-text/40'
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
