import React from 'react';
import { Home, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

interface SidebarProps {
  menuItems: MenuItem[];
  activeView: string;
  setActiveView: (view: string) => void;
}

function Sidebar({ menuItems, activeView, setActiveView }: SidebarProps) {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div className={`w-64 p-4 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r`}>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Home className={`w-6 h-6 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
          <span className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>PaymanAI</span>
        </div>
        
        <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-opacity-10 hover:bg-gray-500">
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-yellow-300" />
          ) : (
            <Moon className="w-5 h-5 text-gray-500" />
          )}
        </button>
      </div>
      
      <nav>
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg mb-2 ${
                activeView === item.id
                  ? theme === 'dark' 
                    ? 'bg-gray-700 text-blue-400' 
                    : 'bg-blue-50 text-blue-600'
                  : theme === 'dark'
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export default Sidebar;