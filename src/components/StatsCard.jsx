import React from 'react';
import { cn } from '../lib/utils';

const StatsCard = ({ title, value, icon: Icon, color = 'blue', isLoading = false }) => {
  // Color variations
  const colorVariants = {
    blue: 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400',
    red: 'bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400',
    yellow: 'bg-yellow-50 dark:bg-yellow-950 text-yellow-600 dark:text-yellow-400',
    purple: 'bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400',
    indigo: 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400',
  };

  // Get the appropriate color variant
  const colorClasses = colorVariants[color] || colorVariants.blue;

  return (
    <div className="bg-card border rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-muted-foreground font-medium text-sm mb-1">{title}</h3>
          {isLoading ? (
            <div className="h-8 w-16 animate-pulse bg-muted rounded-md"></div>
          ) : (
            <p className="text-2xl font-bold">{value}</p>
          )}
        </div>
        
        {Icon && (
          <div className={cn('p-3 rounded-full', colorClasses)}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;