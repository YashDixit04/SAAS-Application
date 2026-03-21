import React, { useState, useMemo } from 'react';
import { Calendar, ChevronDown, SlidersHorizontal } from 'lucide-react';
import Button from '@/components/ui/Button';
import Combobox from '@/components/ui/Combobox';
import GenericTablePage from '@/components/common/GenericTablePage';
import { catalogTableData, catalogColumns, catalogVendors } from '@/data/catalogData';
import { BreadcrumbLink } from '@/components/common/Breadcrub/dynamicbreadcrub';
import ViewToggle from '@/components/layout/viewTableLayout';

interface CataloguePageProps {
  onNavigate?: (tab: string) => void;
}

const CataloguePage: React.FC<CataloguePageProps> = ({ onNavigate }) => {
  const [selectedVendor, setSelectedVendor] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const itemsPerPage = 8;

  const breadcrumbItems: BreadcrumbLink[] = [
    { label: 'Home', href: '#' },
    { label: 'Users', href: '#' },
    { label: 'User Details', href: '#' },
    { label: 'Catalogue', href: '#', active: true },
  ];

  // Combobox options
  const vendorOptions = catalogVendors.map((v) => ({ value: v, label: v }));
  const statusOptions = [
    { value: 'All', label: 'All Statuses' },
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
    { value: 'Draft', label: 'Draft' },
    { value: 'Archive', label: 'Archive' },
  ];

  // Filter Data
  const filteredData = useMemo(() => {
    let data = catalogTableData;
    if (selectedVendor && selectedVendor !== 'All') {
      data = data.filter((row) => row.vendorName === selectedVendor);
    }
    if (selectedStatus && selectedStatus !== 'All') {
      data = data.filter((row) => row.status === selectedStatus);
    }
    return data;
  }, [selectedVendor, selectedStatus]);

  // PageLayout Actions
  const actions = (
    <div className="w-full sm:w-auto flex items-center justify-end gap-3">
      {/* Date Picker Trigger */}
      <div className="flex items-center gap-2 px-3 py-1.5 h-8 rounded-lg border border-grey-200 dark:border-grey-700 bg-grey-50 dark:bg-grey-800 cursor-pointer hover:border-primary/50 hover:bg-white dark:hover:bg-grey-800 transition-all group">
        <Calendar size={14} className="text-grey-500 group-hover:text-primary transition-colors" />
        <span className="text-xs font-medium text-grey-700 dark:text-grey-300">September, 2024</span>
        <ChevronDown size={14} className="text-grey-400 group-hover:text-primary transition-colors" />
      </div>

      <Button variant="solid" color="primary" size="small">
        Account Settings
      </Button>
    </div>
  );

  // GenericTablePage Filters Hook
  const tableFilters = (
    <div className="flex items-center gap-2">
      <div className="w-40">
        <Combobox
          options={vendorOptions}
          value={selectedVendor}
          onChange={(val) => { setSelectedVendor(val as string); }}
          placeholder="Select Vendor"
          size="small"
        />
      </div>
      <div className="w-36 hidden sm:block">
        <Combobox
          options={statusOptions}
          value={selectedStatus}
          onChange={(val) => { setSelectedStatus(val as string); }}
          placeholder="Status"
          size="small"
        />
      </div>
    </div>
  );

  // GenericTablePage More Actions Hook
  const tableMoreActions = (
    <Button variant="ghost" color="primary" size="small" className="gap-1.5 whitespace-nowrap hidden sm:flex">
      <SlidersHorizontal size={14} />
      More filters
    </Button>
  );



  return (
    <GenericTablePage
      breadcrumbItems={breadcrumbItems}
      data={filteredData}
      columns={catalogColumns}
      itemsPerPage={itemsPerPage}
      actions={actions}
      filters={tableFilters}
      moreActions={tableMoreActions}
      viewToggle={<ViewToggle viewMode={viewMode} onViewChange={setViewMode} />}
      viewMode={viewMode}
      createButtonLabel="Add product"
      onCreateClick={() => onNavigate && onNavigate('addProduct')}
    />
  );
};

export default CataloguePage;
