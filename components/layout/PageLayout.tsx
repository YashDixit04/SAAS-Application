import React, { forwardRef } from 'react';
import DynamicBreadcrumb, { BreadcrumbLink } from '../common/Breadcrub/dynamicbreadcrub';

interface PageLayoutProps {
  children: React.ReactNode;
  breadcrumbItems: BreadcrumbLink[];
  actions?: React.ReactNode;
}

const PageLayout = forwardRef<HTMLElement, PageLayoutProps>(({ children, breadcrumbItems, actions }, ref) => {
  return (
    <main 
      ref={ref}
      className="flex-1 mr-2 rounded-xl border border-[#DBDFE9] dark:border-grey-200 bg-white dark:bg-grey-100 overflow-y-auto shadow-sm flex flex-col transition-all duration-300 relative"
    >
      <div className="flex flex-col sm:flex-row items-center justify-between p-3 pl-6 pr-5 bg-white dark:bg-grey-100">
        {/* Breadcrumbs */}
        <div className="w-full sm:w-auto flex justify-start mb-3 sm:mb-0">
          <DynamicBreadcrumb items={breadcrumbItems} />
        </div>

        {/* Actions Toolbar */}
        {actions && (
          <div className="w-full sm:w-auto flex items-center justify-end gap-3">
            {actions}
          </div>
        )}
      </div>

      {/* Main Content */}
      {children}
    </main>
  );
});

PageLayout.displayName = 'PageLayout';

export default PageLayout;
