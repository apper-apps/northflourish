import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import { routeArray } from '@/config/routes';

const Layout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const sidebarInitial = { x: '-100%' };
  const sidebarAnimate = { x: 0 };
  const sidebarTransition = { duration: 0.3, ease: 'easeOut' };

  const backdropInitial = { opacity: 0 };
  const backdropAnimate = { opacity: 1 };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Mobile Header */}
      <header className="lg:hidden flex-shrink-0 h-16 bg-white border-b border-surface-200 flex items-center justify-between px-4 z-40">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
            <ApperIcon name="Sparkles" className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-heading font-semibold text-gray-900">Flourish Hub</h1>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-surface-100 transition-colors"
        >
          <ApperIcon name={mobileMenuOpen ? "X" : "Menu"} className="w-6 h-6" />
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 bg-white/80 backdrop-blur-sm border-r border-surface-200 flex-col z-40">
          <div className="p-6 border-b border-surface-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                <ApperIcon name="Sparkles" className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-heading font-bold text-gray-900">Flourish Hub</h1>
                <p className="text-sm text-gray-500">Digital Wellness</p>
              </div>
            </div>
          </div>
          
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {routeArray.map((route) => (
              <NavLink
                key={route.id}
                to={route.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-primary/10 to-secondary/10 text-primary border border-primary/20'
                      : 'text-gray-600 hover:bg-surface-50 hover:text-gray-900'
                  }`
                }
              >
                <ApperIcon name={route.icon} className="w-5 h-5" />
                <span className="font-medium">{route.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="p-4 m-4 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl border border-primary/10">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <ApperIcon name="Heart" className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Sarah Johnson</h3>
                <p className="text-sm text-gray-500">Wellness Coach</p>
              </div>
            </div>
            <div className="text-xs text-gray-600">
              "Your transformation journey starts with a single step."
            </div>
          </div>
        </aside>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={backdropInitial}
              animate={backdropAnimate}
              className="lg:hidden fixed inset-0 bg-black/50 z-50"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={sidebarInitial}
              animate={sidebarAnimate}
              transition={sidebarTransition}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-80 bg-white z-50 flex flex-col"
            >
              <div className="p-6 border-b border-surface-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                      <ApperIcon name="Sparkles" className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-xl font-heading font-bold text-gray-900">Flourish Hub</h1>
                      <p className="text-sm text-gray-500">Digital Wellness</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-lg hover:bg-surface-100"
                  >
                    <ApperIcon name="X" className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                {routeArray.map((route) => (
                  <NavLink
                    key={route.id}
                    to={route.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-primary/10 to-secondary/10 text-primary border border-primary/20'
                          : 'text-gray-600 hover:bg-surface-50 hover:text-gray-900'
                      }`
                    }
                  >
                    <ApperIcon name={route.icon} className="w-5 h-5" />
                    <span className="font-medium">{route.label}</span>
                  </NavLink>
                ))}
              </nav>
            </motion.div>
          </>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-surface-50">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden flex-shrink-0 bg-white border-t border-surface-200 px-4 py-2 z-40">
        <div className="flex justify-around">
          {routeArray.slice(0, 5).map((route) => {
            const isActive = location.pathname === route.path;
            return (
              <NavLink
                key={route.id}
                to={route.path}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                  isActive ? 'text-primary' : 'text-gray-500'
                }`}
              >
                <ApperIcon name={route.icon} className="w-5 h-5" />
                <span className="text-xs mt-1 font-medium">{route.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Layout;