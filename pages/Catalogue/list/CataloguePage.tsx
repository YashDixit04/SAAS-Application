import React, { useState, useMemo } from 'react';
import { Calendar, ChevronDown, SlidersHorizontal } from 'lucide-react';
import Button from '@/components/ui/Button';
import Combobox from '@/components/ui/Combobox';
import GenericTablePage from '@/components/common/GenericTablePage';
import { catalogTableData, catalogColumns, catalogVendors, CatalogProduct } from '@/data/catalogData';
import { BreadcrumbLink } from '@/components/common/Breadcrub/dynamicbreadcrub';
import ViewToggle from '@/components/layout/viewTableLayout';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import { Column } from '@/components/common/table/table';
import authService from '@/services/authService';

interface CataloguePageProps {
  onNavigate?: (tab: string) => void;
}

const CataloguePage: React.FC<CataloguePageProps> = ({ onNavigate }) => {
  const session = authService.getSession();
  const isSpecialRole = session?.username === 'captain01' || session?.username === 'purchaser01';

  const [selectedVendor, setSelectedVendor] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [scope, setScope] = useState<'Company' | 'Global'>('Company');
  const [cartItems, setCartItems] = useState<Record<number, number>>({});
  const [selectedCountry, setSelectedCountry] = useState<string>('All');
  const [selectedPort, setSelectedPort] = useState<string>('All');

  const itemsPerPage = 8;

  const breadcrumbItems: BreadcrumbLink[] = [
    { label: 'Home', href: '#' },
    { label: 'Catalogue', href: '#', active: true },
  ];

  // Combobox options for regular users
  const vendorOptions = catalogVendors.map((v) => ({ value: v, label: v }));
  const statusOptions = [
    { value: 'All', label: 'All Statuses' },
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
    { value: 'Draft', label: 'Draft' },
    { value: 'Archive', label: 'Archive' },
  ];

  // Country and Port mocked options for special roles
  const countryOptions = useMemo(() => {
    const countries = new Set(catalogTableData.map(d => d.country).filter(Boolean));
    return [{ value: 'All', label: 'All Countries' }, ...Array.from(countries).map(c => ({ value: c as string, label: c as string }))];
  }, []);

  const portOptions = useMemo(() => {
    const relevantData = selectedCountry !== 'All'
      ? catalogTableData.filter(d => d.country === selectedCountry)
      : catalogTableData;
    const ports = new Set(relevantData.map(d => d.port).filter(Boolean));
    return [{ value: 'All', label: 'All Ports' }, ...Array.from(ports).map(p => ({ value: p as string, label: p as string }))];
  }, [selectedCountry]);

  // Dynamic Columns
  const columns = useMemo(() => {
    if (isSpecialRole) {
      return [
        {
          header: 'Product Name',
          accessorKey: 'productName',
          cell: (row) => (
            <div className="flex items-center gap-3">
              <Avatar src={row.image} alt={row.productName} size='sm' />
              <span className="text-primary font-medium">{row.productName}</span>
            </div>
          ),
        },
        {
          header: 'Category',
          accessorKey: 'category',
          cell: (row) => (
            <Badge variant="soft" color="info" className="rounded-full px-3">
              {row.category}
            </Badge>
          ),
        },
        {
          header: 'Packing Info',
          accessorKey: 'packingInfo',
          showInGrid: false,
        },
        {
          header: 'Reference Code',
          accessorKey: 'referenceCode',
          showInGrid: false,
          cell: (row) => <span className="text-primary font-mono text-xs">{row.referenceCode}</span>,
        },
        {
          header: 'Available Vendors',
          accessorKey: 'vendorName',
          cell: (row) => {
            // Using a mock count generator based on id for demo consistency
            const count = (row.id % 4) + 2;
            return <span className="font-medium text-grey-900 dark:text-white">{count} Vendors</span>;
          },
        },
        {
          header: 'Status',
          cell: (row) => (
            row.isExpiring ? (
              <Badge variant="soft" color="warning" className="rounded-full px-3">
                Expiring Soon
              </Badge>
            ) : (
              <Badge variant="soft" color="success" className="rounded-full px-3">
                Active
              </Badge>
            )
          ),
        },
        {
          header: 'Cart Action',
          className: 'text-right',
          cell: (row) => {
            const qty = cartItems[row.id] || 0;
            return (
              <div className="flex items-center justify-end">
                {qty === 0 ? (
                  <Button variant="outline" color="primary" size="small" onClick={(e) => { e.stopPropagation(); setCartItems(p => ({ ...p, [row.id]: 1 })); }}>
                    Add to Cart
                  </Button>
                ) : (
                  <div className="inline-flex items-center border border-grey-200 dark:border-grey-700 rounded-lg">
                    <button onClick={(e) => { e.stopPropagation(); setCartItems(p => ({ ...p, [row.id]: qty - 1 })); }} className="px-2 py-1 hover:bg-grey-100 dark:hover:bg-grey-800 text-grey-600 dark:text-grey-300">-</button>
                    <span className="px-3 font-medium text-sm text-grey-900 dark:text-white">{qty}</span>
                    <button onClick={(e) => { e.stopPropagation(); setCartItems(p => ({ ...p, [row.id]: qty + 1 })); }} className="px-2 py-1 hover:bg-grey-100 dark:hover:bg-grey-800 text-grey-600 dark:text-grey-300">+</button>
                  </div>
                )}
              </div>
            );
          }
        }
      ] as Column<CatalogProduct>[];
    }
    return catalogColumns;
  }, [isSpecialRole, cartItems]);

  // Filter Data
  const filteredData = useMemo(() => {
    let data = catalogTableData;
    if (isSpecialRole) {
      // Show only active or expiring products
      data = data.filter((row) => row.status === 'Active' || row.isExpiring);
      // Switch between company and global catalogue view
      if (scope === 'Company') {
        data = data.slice(0, Math.ceil(data.length / 2));
      }
      // Apply Country/Port filters
      if (selectedCountry && selectedCountry !== 'All') {
        data = data.filter((row) => row.country === selectedCountry);
      }
      if (selectedPort && selectedPort !== 'All') {
        data = data.filter((row) => row.port === selectedPort);
      }
    } else {
      if (selectedVendor && selectedVendor !== 'All') {
        data = data.filter((row) => row.vendorName === selectedVendor);
      }
      if (selectedStatus && selectedStatus !== 'All') {
        data = data.filter((row) => row.status === selectedStatus);
      }
    }
    return data;
  }, [isSpecialRole, scope, selectedVendor, selectedStatus, selectedCountry, selectedPort]);

  // PageLayout Actions
  const actions = isSpecialRole ? (
    <div className="w-full sm:w-auto flex items-center justify-end gap-3">
      <div className="flex items-center gap-1 bg-grey-50 dark:bg-grey-200 p-1 rounded-lg border border-grey-200 dark:border-grey-100 h-8">
        <button onClick={() => setScope('Company')} className={`px-3 h-full text-xs font-medium rounded-md transition-colors flex items-center ${scope === 'Company' ? 'bg-white dark:bg-grey-100 shadow-sm text-primary' : 'text-grey-500 hover:text-grey-700 dark:hover:text-grey-300'}`}>Company</button>
        <button onClick={() => setScope('Global')} className={`px-3 h-full text-xs font-medium rounded-md transition-colors flex items-center ${scope === 'Global' ? 'bg-white dark:bg-grey-100 shadow-sm text-primary' : 'text-grey-500 hover:text-grey-700 dark:hover:text-grey-300'}`}>Global</button>
      </div>
      <Button variant="solid" color="primary" size="small" onClick={() => { }}>
        Create a Requisition
      </Button>
    </div>
  ) : (
    <div className="w-full sm:w-auto flex items-center justify-end gap-3">
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
  const tableFilters = isSpecialRole ? (
    <div className="flex items-center gap-2">
      <div className="w-32 hidden sm:block">
        <Combobox
          options={countryOptions}
          value={selectedCountry}
          onChange={(val) => {
            setSelectedCountry(val as string);
            setSelectedPort('All'); // Reset port when country changes
          }}
          placeholder="Country"
          size="small"
        />
      </div>
      <div className="w-32 hidden sm:block">
        <Combobox
          options={portOptions}
          value={selectedPort}
          onChange={(val) => setSelectedPort(val as string)}
          placeholder="Port"
          size="small"
        />
      </div>
    </div>
  ) : (
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
      columns={columns}
      itemsPerPage={itemsPerPage}
      actions={actions}
      filters={tableFilters}
      moreActions={tableMoreActions}
      viewToggle={<ViewToggle viewMode={viewMode} onViewChange={setViewMode} />}
      viewMode={viewMode}
      createButtonLabel={isSpecialRole ? undefined : "Add product"}
      onCreateClick={isSpecialRole ? undefined : () => onNavigate && onNavigate('addProduct')}
    />
  );
};

export default CataloguePage;
