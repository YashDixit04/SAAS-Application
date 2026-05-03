import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, ChevronDown, Download, SlidersHorizontal, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Combobox from '@/components/ui/Combobox';
import GenericTablePage from '@/components/common/GenericTablePage';
import { CatalogProduct } from '@/data/catalogData';
import catalogService from '@/services/catalogService';
import { BreadcrumbLink } from '@/components/common/Breadcrub/dynamicbreadcrub';
import ViewToggle from '@/components/layout/viewTableLayout';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import { Column } from '@/components/common/table/table';
import authService from '@/services/authService';
import GenericModal, { ModalConfig, ModalTab } from '@/components/ui/GenericModal';
import { Flag } from 'lucide-react';

import agentService from '@/services/agentService';
import Loader from '@/components/common/Loader';
import Snackbar from '@/components/ui/Snackbar';
import { useCart } from '@/context/CartContext';
import tenantService from '@/services/tenantService';
import { ApiException } from '@/lib/apiClient';
import * as XLSX from 'xlsx';

type TenantCatalogueMode = 'vendor-only' | 'both' | 'smc-only' | 'unknown';

const resolveTenantCatalogueMode = (selection: string | undefined): TenantCatalogueMode => {
  if (typeof selection !== 'string') {
    return 'unknown';
  }

  const normalized = selection.trim().toLowerCase();
  if (!normalized) {
    return 'unknown';
  }

  if (normalized.includes('both')) {
    return 'both';
  }

  if (normalized.includes('vendor') && !normalized.includes('smc')) {
    return 'vendor-only';
  }

  if (normalized.includes('smc') && !normalized.includes('vendor')) {
    return 'smc-only';
  }

  if (normalized.includes('smc') && normalized.includes('vendor')) {
    return 'both';
  }

  return 'unknown';
};

const formatPublishedOn = (value: string | undefined): string => {
  if (!value) {
    return 'N/A';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: '2-digit',
  });
};

const buildReferenceCode = (catalogName: string, offeringId: string): string => {
  const catalogCode = catalogName
    .replace(/[^a-z0-9]/gi, '')
    .slice(0, 4)
    .toUpperCase() || 'CAT';

  const offeringCode = offeringId.replace(/[^a-z0-9]/gi, '').slice(0, 6).toUpperCase() || 'ITEM';
  return `${catalogCode}-${offeringCode}`;
};

const formatInventoryForExport = (inventory: Array<Record<string, unknown>> | undefined): string => {
  if (!Array.isArray(inventory) || inventory.length === 0) {
    return '';
  }

  return inventory
    .map((item) => {
      const variant = typeof item.variant === 'string' ? item.variant.trim() : '';
      const sku = typeof item.sku === 'string' ? item.sku.trim() : '';
      const barcode = typeof item.barcode === 'string' ? item.barcode.trim() : '';
      const quantity = typeof item.quantity === 'number' ? item.quantity : Number(item.quantity ?? 0);

      const segments = [
        variant ? `Variant: ${variant}` : '',
        sku ? `SKU: ${sku}` : '',
        barcode ? `Barcode: ${barcode}` : '',
        Number.isFinite(quantity) && quantity > 0 ? `Qty: ${quantity}` : '',
      ].filter((segment) => segment.length > 0);

      if (segments.length === 0) {
        return '';
      }

      return segments.join(', ');
    })
    .filter((value) => value.length > 0)
    .join(' | ');
};

interface CataloguePageProps {
  onNavigate?: (tab: string) => void;
  tenantId?: string;
}

const CataloguePage: React.FC<CataloguePageProps> = ({ onNavigate, tenantId: tenantIdFromRoute }) => {
  const session = authService.getSession();
  const tenantId = tenantIdFromRoute || session?.tenantId;
  const isSpecialRole = session?.roleType === 'tenantadmin_subusers';

  const [selectedVendor, setSelectedVendor] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [scope, setScope] = useState<'Company' | 'Global'>('Company');
  const [selectedCountry, setSelectedCountry] = useState<string>('All');
  const [selectedPort, setSelectedPort] = useState<string>('All');

  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [vendors, setVendors] = useState<string[]>([]);
  const [tenantCatalogueMode, setTenantCatalogueMode] = useState<TenantCatalogueMode>('unknown');
  const [tenantVendorNames, setTenantVendorNames] = useState<string[]>([]);
  const [catalogueNotice, setCatalogueNotice] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [deletingOfferingId, setDeletingOfferingId] = useState<string | null>(null);

  // New Modal States
  const [isRequisitionModalOpen, setIsRequisitionModalOpen] = useState(false);
  const [reqModalConfigData, setReqModalConfigData] = useState<any>(null);

  // Focus Mode / Requisition States
  const [isRequisitionCreated, setIsRequisitionCreated] = useState<boolean>(false);
  const [currentRequisitionInfo, setCurrentRequisitionInfo] = useState<{ id: string; name: string } | null>(null);

  // Cart Context & Snackbar
  const { cartItems, updateQuantity } = useCart();
  const [isSnackbarOpen, setIsSnackbarOpen] = useState<boolean>(false);

  const handleExportProducts = () => {
    if (filteredData.length === 0) {
      return;
    }

    const exportRows = filteredData.map((product, index) => {
      const images = Array.isArray(product.images) ? product.images.join(', ') : '';
      const videos = Array.isArray(product.videos) ? product.videos.join(', ') : '';
      const variations = Array.isArray(product.variations) ? product.variations.join(', ') : '';
      const resolvedPort = Array.isArray(product.ports) && product.ports.length > 0
        ? product.ports.join(', ')
        : (product.port ?? '');

      return {
        'S.No': index + 1,
        'Product ID': product.productId || product.referenceCode || String(product.id),
        'Product ID Type': product.productIdType || '',
        'Product Name': product.productName,
        Category: product.category,
        'Packing Info': product.packingInfo,
        'Reference Code': product.referenceCode,
        Vendor: product.vendorName,
        Status: product.status,
        'Published On': product.publishedOn,
        Images: images,
        Videos: videos,
        Variations: variations,
        Inventory: formatInventoryForExport(product.inventory),
        Port: resolvedPort,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const keys = Object.keys(exportRows[0]);
    worksheet['!cols'] = keys.map((key) => {
      const maxCellLength = Math.max(
        key.length,
        ...exportRows.map((row) => String(row[key as keyof typeof row] ?? '').length),
      );

      return { wch: Math.min(Math.max(maxCellLength + 2, 14), 60) };
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Product Listing');

    const dateStamp = new Date().toISOString().slice(0, 10);
    const tenantLabel = tenantId ? `tenant-${tenantId.slice(0, 8)}` : 'global';
    XLSX.writeFile(workbook, `catalogue-product-list-${tenantLabel}-${dateStamp}.xlsx`);
  };

  const handleAddToCart = (productId: number, qty: number) => {
    const currentQty = cartItems[productId] || 0;
    updateQuantity(productId, qty);
    
    // Auto-trigger correct snackbar response when successfully added
    if (qty > currentQty) {
      setIsSnackbarOpen(true);
    }
  };

  const handleDeleteProduct = async (product: CatalogProduct) => {
    if (!tenantId) {
      setCatalogueNotice('Delete is available only within a tenant catalogue.');
      return;
    }

    if (!product.catalogId || !product.offeringId) {
      setCatalogueNotice('Unable to delete this product mapping.');
      return;
    }

    const confirmed = window.confirm(
      'Delete this product from this tenant catalogue? This removes mapping for this tenant only.',
    );

    if (!confirmed) {
      return;
    }

    setDeletingOfferingId(product.offeringId);

    try {
      await tenantService.deleteOffering(tenantId, product.catalogId, product.offeringId);

      setProducts((prevProducts) => {
        const nextProducts = prevProducts.filter((item) => item.offeringId !== product.offeringId);
        setVendors(Array.from(new Set(nextProducts.map((item) => item.vendorName))).filter(Boolean));
        return nextProducts;
      });

      setCatalogueNotice('Product mapping deleted for this tenant.');
    } catch (error) {
      if (error instanceof ApiException) {
        setCatalogueNotice(error.errorMessage || 'Failed to delete tenant product mapping.');
      } else {
        setCatalogueNotice('Failed to delete tenant product mapping.');
      }
    } finally {
      setDeletingOfferingId(null);
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadCatalogue = async () => {
      setIsLoading(true);

      try {
        const reqConfig = await catalogService.getRequisitionModalConfig();
        if (!mounted) {
          return;
        }
        setReqModalConfigData(reqConfig);

        if (tenantId) {
          try {
            const tenantDetails = await tenantService.getTenantDetails(tenantId);
            const [tenantVendors, tenantCatalogs] = await Promise.all([
              tenantService.getVendors(tenantId),
              tenantService.getCatalogs(tenantId),
            ]);

            if (!mounted) {
              return;
            }

            const mode = resolveTenantCatalogueMode(
              tenantDetails?.userConfigurations?.userTypeSelection,
            );

            const resolvedTenantVendorNames = Array.isArray(tenantVendors)
              ? tenantVendors
                .map((vendor) => vendor.basicInfo.companyName)
                .filter((name): name is string => typeof name === 'string' && name.trim().length > 0)
              : [];

            let nextProductId = 1;
            const tenantProducts = (tenantCatalogs || []).flatMap((catalog) => {
              const offerings = Array.isArray(catalog.offerings) ? catalog.offerings : [];
              return offerings.map((offering) => ({
                id: nextProductId++,
                catalogId: catalog.id,
                offeringId: offering.id,
                productName: offering.name,
                packingInfo: catalog.description || 'Standard Packing',
                referenceCode: buildReferenceCode(catalog.name, offering.id),
                vendorName: offering.vendor?.name || 'SMC Catalogue',
                status: 'Active' as const,
                category: catalog.name,
                publishedOn: formatPublishedOn(offering.createdAt),
                image: `https://picsum.photos/seed/${offering.id}/200/200`,
                productId: offering.productId,
                productIdType: offering.productIdType,
                ports: Array.isArray(offering.ports) ? offering.ports : [],
                port: Array.isArray(offering.ports) && offering.ports.length > 0
                  ? offering.ports[0]
                  : undefined,
                images: Array.isArray(offering.images) ? offering.images : [],
                videos: Array.isArray(offering.videos) ? offering.videos : [],
                variations: Array.isArray(offering.variations) ? offering.variations : [],
                inventory: Array.isArray(offering.inventory) ? offering.inventory : [],
                isVendorProduct: offering.isVendorProduct ?? Boolean(offering.vendorId),
              }));
            });

            let scopedProducts = tenantProducts;
            let notice = 'Showing tenant catalogue.';

            if (mode === 'vendor-only') {
              const vendorProducts = tenantProducts.filter((product) => product.isVendorProduct);
              const normalizedVendorNames = new Set(
                resolvedTenantVendorNames
                  .map((name) => name.trim().toLowerCase())
                  .filter((name) => name.length > 0),
              );

              if (vendorProducts.length === 0) {
                scopedProducts = tenantProducts;
                notice = 'Vendor-only tenant: no vendor products found; showing all offerings.';
              } else if (normalizedVendorNames.size === 0) {
                scopedProducts = vendorProducts;
                notice = 'Vendor-only tenant: vendor names missing; showing all vendor products.';
              } else {
                const nameMatched = vendorProducts.filter((product) => {
                  const vendorName = typeof product.vendorName === 'string'
                    ? product.vendorName.trim().toLowerCase()
                    : '';
                  return normalizedVendorNames.has(vendorName);
                });

                if (nameMatched.length > 0) {
                  scopedProducts = nameMatched;
                  notice = 'Vendor-only tenant: showing vendor-mapped products.';
                } else {
                  scopedProducts = vendorProducts;
                  notice = 'Vendor-only tenant: no vendor-name match; showing all vendor products.';
                }
              }
            } else if (mode === 'smc-only') {
              const smcProducts = tenantProducts.filter((product) => !product.isVendorProduct);
              if (smcProducts.length > 0) {
                scopedProducts = smcProducts;
                notice = 'SMC-only tenant: showing SMC products (port-wise).';
              } else {
                scopedProducts = tenantProducts;
                notice = 'SMC-only tenant: no SMC products found; showing all offerings.';
              }
            } else if (mode === 'both') {
              notice = 'SMC + Vendor tenant: showing both vendor and SMC products.';
            }

            setTenantCatalogueMode(mode);
            setTenantVendorNames(resolvedTenantVendorNames);
            setProducts(scopedProducts);
            setVendors(Array.from(new Set(scopedProducts.map((item) => item.vendorName))).filter(Boolean));

            setCatalogueNotice(notice);

            return;
          } catch (tenantLoadError) {
            if (!mounted) {
              return;
            }

            if (tenantLoadError instanceof ApiException && tenantLoadError.statusCode === 404) {
              setTenantCatalogueMode('unknown');
              setTenantVendorNames([]);
              setProducts([]);
              setVendors([]);
              setCatalogueNotice('Selected tenant was not found. Open catalogue from a valid tenant details page.');
              return;
            }

            console.error('Failed to load tenant-scoped catalogue:', tenantLoadError);
            setTenantCatalogueMode('unknown');
            setTenantVendorNames([]);
            setProducts([]);
            setVendors([]);
            setCatalogueNotice('Unable to load tenant catalogue right now.');
            return;
          }
        }

        const [productsData, vendorsData] = await Promise.all([
          catalogService.getProducts(),
          catalogService.getVendors(),
        ]);

        if (!mounted) {
          return;
        }

        setTenantCatalogueMode('unknown');
        setTenantVendorNames([]);
        setProducts(productsData);
        setVendors(vendorsData);
        setCatalogueNotice('Using default catalogue dataset.');
      } catch (error) {
        console.error('Failed to load catalogue page data:', error);
        if (!mounted) {
          return;
        }

        setProducts([]);
        setVendors([]);
        setCatalogueNotice('Failed to load catalogue data.');
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    void loadCatalogue();

    return () => { mounted = false; };
  }, [tenantId]);

  const itemsPerPage = 8;

  const breadcrumbItems: BreadcrumbLink[] = [
    { label: 'Home', href: '#' },
    { label: 'Catalogue', href: '#', active: true },
  ];

  // Combobox options for regular users
  const vendorOptions = [
    { value: 'All', label: 'All Vendors' },
    ...vendors.map((v) => ({ value: v, label: v })),
  ];
  const statusOptions = [
    { value: 'All', label: 'All Statuses' },
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
    { value: 'Draft', label: 'Draft' },
    { value: 'Archive', label: 'Archive' },
  ];

  // Country and Port mocked options for special roles
  const countryOptions = useMemo(() => {
    const countries = new Set(products.map(d => d.country).filter(Boolean));
    return [{ value: 'All', label: 'All Countries' }, ...Array.from(countries).map(c => ({ value: c as string, label: c as string }))];
  }, [products]);

  const portOptions = useMemo(() => {
    const relevantData = selectedCountry !== 'All'
      ? products.filter(d => d.country === selectedCountry)
      : products;
    const ports = new Set(relevantData.map(d => d.port).filter(Boolean));
    return [{ value: 'All', label: 'All Ports' }, ...Array.from(ports).map(p => ({ value: p as string, label: p as string }))];
  }, [products, selectedCountry]);

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
          header: 'Catalog ID',
          accessorKey: 'catalogId',
          cell: (row) => (
            <Badge variant="soft" color="info" className="rounded-full px-3 font-mono text-xs">
              {row.catalogId || 'N/A'}
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
            const disabled = isSpecialRole && !isRequisitionCreated;
            return (
              <div className="flex items-center justify-end">
                {qty === 0 ? (
                  <Button disabled={disabled} variant="outline" color="primary" size="small" onClick={(e) => { e.stopPropagation(); handleAddToCart(row.id, 1); }}>
                    Add to Cart
                  </Button>
                ) : (
                  <div className={`inline-flex items-center border border-grey-200 dark:border-grey-700 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
                    <button disabled={disabled} onClick={(e) => { e.stopPropagation(); handleAddToCart(row.id, qty - 1); }} className="px-2 py-1 hover:bg-grey-100 dark:hover:bg-grey-800 text-grey-600 dark:text-grey-300 ">-</button>
                    <span className="px-3 font-medium text-sm text-grey-900 dark:text-white">{qty}</span>
                    <button disabled={disabled} onClick={(e) => { e.stopPropagation(); handleAddToCart(row.id, qty + 1); }} className="px-2 py-1 hover:bg-grey-100 dark:hover:bg-grey-800 text-grey-600 dark:text-grey-300">+</button>
                  </div>
                )}
              </div>
            );
          }
        }
      ] as Column<CatalogProduct>[];
    }
    const allBaseColumns = catalogService.getColumnsConfig();

    // For SMC-only tenants, remove the Vendor column entirely
    const baseColumns = tenantCatalogueMode === 'smc-only'
      ? allBaseColumns.filter((col) => col.header !== 'Vendor')
      : allBaseColumns;

    if (!tenantId) {
      return baseColumns;
    }

    return baseColumns.map((column) => {
      if (column.header !== 'Action') {
        return column;
      }

      return {
        ...column,
        className: 'text-right',
        cell: (row: CatalogProduct) => {
          const isDeleting = deletingOfferingId === row.offeringId;

          return (
            <div className="flex items-center justify-end">
              <Button
                variant="ghost"
                color="danger"
                size="small"
                leftIcon={<Trash2 size={14} />}
                onClick={(event) => {
                  event.stopPropagation();
                  void handleDeleteProduct(row);
                }}
                disabled={!row.catalogId || !row.offeringId || isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          );
        },
      } as Column<CatalogProduct>;
    });
  }, [
    isSpecialRole,
    cartItems,
    isRequisitionCreated,
    tenantId,
    deletingOfferingId,
    tenantCatalogueMode,
  ]);

  // Filter Data
  const filteredData = useMemo(() => {
    let data = products;

    if (isSpecialRole) {
      // Show only active or expiring products
      data = data.filter((row) => row.status === 'Active' || row.isExpiring);
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
  }, [
    products,
    isSpecialRole,
    selectedVendor,
    selectedStatus,
    selectedCountry,
    selectedPort,
    tenantCatalogueMode,
  ]);

  // PageLayout Actions
  const actions = isSpecialRole ? (
    <div className="w-full sm:w-auto flex items-center justify-end gap-3">
      <div className="flex items-center gap-1 bg-grey-50 dark:bg-grey-200 p-1 rounded-lg border border-grey-200 dark:border-grey-100 h-8">
        <button onClick={() => setScope('Company')} className={`px-3 h-full text-xs font-medium rounded-md transition-colors flex items-center ${scope === 'Company' ? 'bg-white dark:bg-grey-100 shadow-sm text-primary' : 'text-grey-500 hover:text-grey-700 dark:hover:text-grey-300'}`}>Company</button>
        <button onClick={() => setScope('Global')} className={`px-3 h-full text-xs font-medium rounded-md transition-colors flex items-center ${scope === 'Global' ? 'bg-white dark:bg-grey-100 shadow-sm text-primary' : 'text-grey-500 hover:text-grey-700 dark:hover:text-grey-300'}`}>Global</button>
      </div>
      <Button variant="solid" color="primary" size="small" onClick={() => setIsRequisitionModalOpen(true)}>
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
      {tenantCatalogueMode !== 'smc-only' && (
        <div className="w-40">
          <Combobox
            options={vendorOptions}
            value={selectedVendor}
            onChange={(val) => { setSelectedVendor(val as string); }}
            placeholder="Select Vendor"
            size="small"
          />
        </div>
      )}
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
    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        color="primary"
        size="small"
        className="gap-1.5 whitespace-nowrap"
        onClick={handleExportProducts}
        disabled={filteredData.length === 0}
      >
        <Download size={14} />
        Export Excel
      </Button>
      <Button variant="ghost" color="primary" size="small" className="gap-1.5 whitespace-nowrap hidden sm:flex">
        <SlidersHorizontal size={14} />
        More filters
      </Button>
      {isSpecialRole && isRequisitionCreated && currentRequisitionInfo && (
        <div className="w-48 ml-2">
          <Combobox
            options={[{ value: currentRequisitionInfo.id, label: currentRequisitionInfo.name }]}
            value={currentRequisitionInfo.id}
            onChange={() => { }}
            placeholder="Select Requisition"
            size="small"
          />
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <Loader text="Loading Catalogue..." />
    );
  }

  // --- Dynamic Modal Configuration Builder ---
  let finalReqModalConfig: ModalConfig | null = null;
  if (isSpecialRole && reqModalConfigData) {
    const finalTabs: ModalTab[] = reqModalConfigData.tabs.map((tab: any) => {
      // Inject Custom React nodes into User Details tab for Fresh/Dry badges
      if (tab.id === 'user_details') {
        return {
          ...tab,
          fields: tab.fields.map((f: any) => {
            if (f.id === 'freshDateRange') return { ...f, CustomComponent: <Badge variant="soft" color="success">Fresh</Badge> };
            if (f.id === 'dryDateRange') return { ...f, CustomComponent: <Badge variant="soft" color="dark">Dry</Badge> };
            return f;
          })
        };
      }
      // No budget details custom injected anymore, Agent Details comes directly from the modified JSON config.
      return tab;
    });

    finalReqModalConfig = {
      ...reqModalConfigData,
      isOpen: isRequisitionModalOpen,
      icon: <Flag className="h-6 w-6" />,
      onClose: () => setIsRequisitionModalOpen(false),
      tabs: finalTabs,
      actions: [
        {
          id: "back",
          label: "Back",
          variant: "outline",
          color: "grey",
          onClick: () => setIsRequisitionModalOpen(false),
        },
        {
          id: "continue",
          label: "Continue",
          variant: "solid",
          color: "primary",
          onClick: async (data) => {
            console.log('JSON Controlled Modal Output Payload:', data);

            if (data.agentName || data.agentEmail || data.agentPhone) {
              await agentService.saveAgentDetails({
                agentName: data.agentName,
                agentEmail: data.agentEmail,
                agentPhone: data.agentPhone
              });
            }

            // Immediately display combobox
            setIsRequisitionCreated(true);
            setCurrentRequisitionInfo({
              id: 'REQ-' + Math.floor(1000 + Math.random() * 9000),
              name: data.requisitionName || 'New Requisition'
            });

            setIsRequisitionModalOpen(false);
          },
          closeAfter: false
        }
      ]
    };
  }

  return (
    <>
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
        onCreateClick={isSpecialRole
          ? undefined
          : () => onNavigate && onNavigate(tenantId ? `addProduct_${tenantId}` : 'addProduct')}
        customContent={
          catalogueNotice ? (
            <div className="rounded-lg border border-info/30 bg-info-soft px-4 py-2 text-sm text-info">
              {catalogueNotice}
            </div>
          ) : undefined
        }
      />

      {finalReqModalConfig && (
        <GenericModal config={finalReqModalConfig} />
      )}

      <Snackbar
        isOpen={isSnackbarOpen}
        onClose={() => setIsSnackbarOpen(false)}
        content="Product added into cart"
        variant="success"
      />
    </>
  );
};

export default CataloguePage;
