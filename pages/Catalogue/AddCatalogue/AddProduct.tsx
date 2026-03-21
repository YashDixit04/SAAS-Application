import React, { useState } from 'react';
import { BreadcrumbLink } from '@/components/common/Breadcrub/dynamicbreadcrub';
import PageLayout from '@/components/layout/PageLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Combobox from '@/components/ui/Combobox';
import Radio from '@/components/ui/Radio';
import Checkbox from '@/components/ui/Checkbox';
import Switch from '@/components/ui/Switch';
import { DraggableList } from '@/components/ui/DraggableList';
import { Search, Plus, Download, Upload } from 'lucide-react';

import { productStepsData } from '@/data/productFormSteps';
import productFormConfig from '@/data/json/productFormConfig.json';

interface AddProductProps {
  onNavigate?: (tab: string) => void;
}

export default function AddProduct({ onNavigate }: AddProductProps) {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [variants, setVariants] = useState([{ id: '1', type: '' }]);
  const [hasVariants, setHasVariants] = useState<boolean>(true);

  // Add this state at the top with your other states
  const [isVendorProduct, setIsVendorProduct] = useState<boolean | null>(null);
  const [selectedVendor, setSelectedVendor] = useState('');

  // Step 6: Pricing state
  const [pricingRows, setPricingRows] = useState([
    { id: '1', variant: 'N/A', quantity: 0, regularPrice: 0, salePrice: 0, includeTax: false, taxPercent: 0 }
  ]);

  // Step 7: Inventory state
  const [inventoryRows, setInventoryRows] = useState([
    { id: '1', variant: 'N/A', sku: '', barcode: '' }
  ]);
  const [trackQuantity, setTrackQuantity] = useState(false);
  const [continueSellingOutOfStock, setContinueSellingOutOfStock] = useState(false);

  // Step 8: Shipping state
  const [isPhysicalProduct, setIsPhysicalProduct] = useState(false);
  const [shippingCountry, setShippingCountry] = useState('');
  const [hsCode, setHsCode] = useState('');

  // Step 9: Tags state
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const breadcrumbItems: BreadcrumbLink[] = [
    { label: 'Home', href: '#' },
    { label: 'Users', href: '#' },
    { label: 'Tenant Details', href: '#' },
    { label: 'Catalogue', href: '#', onClick: () => onNavigate?.('tenantCatalogue') },
    { label: 'Add Product', href: '#', active: true },
  ];

  const actions = (

    <div className="w-full sm:w-auto flex items-center justify-end gap-3">
      <Button variant="outline" color="primary" size="small" leftIcon={<Plus className="w-4 h-4" />}>
        Bulk Upload
      </Button>
      <Button variant="outline" color="primary" size="small" leftIcon={<Download className="w-4 h-4" />}>
        Import
      </Button>
      <Button variant="solid" color="primary" size="small" leftIcon={<Upload className="w-4 h-4" />}>
        Export
      </Button>
    </div>
  );

  const handleNext = () => setActiveStep((prev) => Math.min(prev + 1, productStepsData.length));
  const handlePrev = () => setActiveStep((prev) => Math.max(prev - 1, 1));

  const addVariant = () => setVariants([...variants, { id: Date.now().toString(), type: '' }]);
  const removeVariant = (id: string) => setVariants(variants.filter((v) => v.id !== id));
  const updateVariantType = (id: string, type: string) =>
    setVariants(variants.map(v => v.id === id ? { ...v, type } : v));

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().replace(/,$/, '');
      if (newTag && !tags.includes(newTag)) setTags([...tags, newTag]);
      setTagInput('');
    }
  };
  const removeTag = (tag: string) => setTags(tags.filter(t => t !== tag));

  const renderStepHeader = (step: typeof productStepsData[0]) => (
    <div
      className="flex items-center gap-4 py-5 cursor-pointer transition-colors hover:text-primary"
      onClick={() => setActiveStep(step.id)}
    >
      <div className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold transition-colors bg-primary text-white">
        {step.id}
      </div>
      <span className="text-base font-bold dark:text-grey-900">{step.title}</span>
    </div>
  );

  const customInputClass = "bg-[#f1f4f9] dark:bg-[#1e2128] border-none text-grey-900 dark:text-grey-100 placeholder:text-grey-500 rounded-md py-2.5 px-4 shadow-none focus:ring-1 focus:ring-primary";
  const customComboboxClass = "bg-[#f1f4f9] dark:bg-[#1e2128] border-none text-grey-900 dark:text-grey-100 shadow-none";

  // Shared dark table styles
  const tableWrapClass = "border border-grey-200 dark:border-grey-300 overflow-visible";
  const tableHeaderClass = "bg-grey-100 dark:bg-grey-100 text-grey-600 dark:text-grey-600 text-sm font-medium";
  const tableRowClass = " bg-grey-50 dark:bg-grey-50 text-grey-800 dark:text-grey-800 border-t border-grey-200 dark:border-grey-300";
  
  return (
    <PageLayout breadcrumbItems={breadcrumbItems} actions={actions}>
      <div className="flex-1 flex flex-col pt-6 pb-20 max-w-full mx-auto w-full bg-white dark:bg-[#0d0d12] overflow-visible">
        <div className="px-10 pb-6 border-b border-grey-100 dark:border-grey-400">
          <h2 className="text-2xl font-bold text-grey-900 dark:text-white">Product listing</h2>
        </div>

        <div className="flex flex-col w-full max-w-4xl mx-auto px-10 mt-6 pb-20 overflow-visible">
          {productStepsData.map((step, index) => (
            <div key={step.id} className={`flex flex-col border-grey-100 dark:border-grey-400 overflow-visible ${index !== 0 ? 'border-t mt-2' : ''}`}>
              {renderStepHeader(step)}

              {activeStep === step.id && (
                <div className="pl-10 pr-4 pb-8 animate-in fade-in slide-in-from-top-2 duration-500 ease-in-out overflow-visible">
                  {/* Step 1: Vital Info */}
                  {step.id === 1 && (
                    <div className="flex flex-col gap-4">
                      <div className="grid grid-cols-[2fr_1fr] gap-4">
                        <Input placeholder="Product ID" size="medium" className={customInputClass} />
                        <Combobox placeholder="Product ID type" value="UPC" options={productFormConfig.productIdTypes} size="medium" className={customComboboxClass} />
                      </div>
                      <p className="text-sm text-grey-500 leading-relaxed py-2">
                        To list your products you require a unique identifier for your product such as UPC, EAN, or GCID. You can request
                        exemptions to list products that do not have standard product IDs for certain categories <a href="#" className="font-semibold text-primary">Learn more</a>
                      </p>
                      {/* Vendor ownership question */}
                      <div className="flex flex-col gap-3 py-2">
                        <span className="text-sm font-semibold text-grey-700 dark:text-grey-300">
                          Is this a vendor product?
                        </span>
                        <div className="flex items-center gap-6">
                          <Radio
                            checked={isVendorProduct === true}
                            onChange={() => setIsVendorProduct(true)}
                            label="Yes, this is a vendor product"
                          />
                          <Radio
                            checked={isVendorProduct === false}
                            onChange={() => setIsVendorProduct(false)}
                            label="No, this is our own product"
                          />
                        </div>

                        {isVendorProduct === true && (
                          <div className="animate-in fade-in slide-in-from-top-2 duration-200 mt-1">
                            <Combobox
                              placeholder="Select a vendor"
                              value={selectedVendor}
                              onChange={(val) => setSelectedVendor(val as string)}
                              options={productFormConfig.vendorOptions}
                              size="medium"
                              className={customComboboxClass}
                            />
                          </div>
                        )}
                      </div>
                      <Input placeholder="Select category" size="small" className={customInputClass} rightIcon={<Search size={16} className="text-grey-400" />} />
                      <Input placeholder="Title" size="medium" className={customInputClass} />
                      <Input placeholder="Brand" size="medium" className={customInputClass} />
                      <Input placeholder="Manufacturer" size="medium" className={customInputClass} />
                      <Input placeholder="MFR part number" size="medium" className={customInputClass} />
                    </div>
                  )}

                  {/* Step 2: Name and description */}
                  {step.id === 2 && (
                    <div className="flex flex-col gap-4">
                      <Input placeholder="Name of product" size="medium" className={customInputClass} />
                      <div className="rounded-lg bg-[#f1f4f9] dark:bg-[#1e2128] overflow-hidden min-h-[200px] flex flex-col">
                        <div className="flex items-center gap-4 p-3 border-b border-grey-200/50 dark:border-[#2a2d35] text-grey-500">
                          <Button variant="ghost" size="icon" className="h-6 w-6 !min-h-0 text-xs opacity-50 cursor-not-allowed">↶</Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6 !min-h-0 text-xs opacity-50 cursor-not-allowed">↷</Button>
                          <div className="w-px h-4 bg-grey-300 dark:bg-[#2a2d35]"></div>
                          <Button variant="ghost" size="icon" className="h-6 w-6 !min-h-0 font-bold">B</Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6 !min-h-0 italic font-serif">I</Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6 !min-h-0 underline font-serif">U</Button>
                          <div className="w-px h-4 bg-grey-300 dark:bg-[#2a2d35]"></div>
                          <Button variant="ghost" size="icon" className="h-6 w-6 !min-h-0">≡</Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6 !min-h-0">≣</Button>
                        </div>
                        <textarea
                          className="flex-1 w-full resize-none p-4 text-sm bg-transparent outline-none text-grey-900 dark:text-grey-100 placeholder:text-grey-400 dark:placeholder:text-grey-600 dark:caret-grey-100"
                          placeholder="Write a description..."
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 3: Product information */}
                  {step.id === 3 && (
                    <div className="flex flex-col gap-6">
                      <div className="flex flex-col gap-4">
                        <span className="text-sm font-semibold text-[#D34053]">Required*</span>
                        {productFormConfig.dimensionTypes.filter(dim => dim.required).map(dim => (
                          <div key={dim.key} className="grid grid-cols-[1fr_3fr_1fr] gap-4 items-center">
                            <div className="px-4 py-2.5 bg-[#e4e8ec] dark:bg-[#1e2128] rounded-md text-sm text-grey-400 select-none">{dim.label}</div>
                            <Input placeholder="Value" size="medium" className={customInputClass} />
                            <Combobox placeholder="Unit" value="Feet" options={productFormConfig.lengthUnits} size="medium" className={customComboboxClass} />
                          </div>
                        ))}
                      </div>
                      <div className="pt-4 flex items-center gap-4 cursor-pointer hover:opacity-80">
                        <span className="text-sm font-medium text-grey-800 dark:text-grey-200">Optional</span>
                        <div className="w-5 h-5 rounded flex items-center justify-center text-grey-700"><Plus size={16} /></div>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Images and videos */}
                  {step.id === 4 && (
                    <div className="flex flex-col gap-4">
                      <div className="rounded-2xl dark:bg-[#1a1d24] p-3">
                        <div
                          className="rounded-xl border-2 border-dashed border-grey-700 min-h-[140px] flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all duration-200 group"
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => e.preventDefault()}
                          onClick={() => document.getElementById('file-upload-input')?.click()}
                        >
                          <input id="file-upload-input" type="file" multiple accept="image/*,video/*" className="hidden" />
                          <div className="flex items-center gap-2 text-grey-400 group-hover:text-grey-300 transition-colors">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
                            </svg>
                            <span className="text-sm">Drag &amp; Drop files here</span>
                            <span className="text-sm text-grey-600">or</span>
                            <span className="text-sm text-primary font-medium hover:underline">browse from device</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-grey-500">Accepted formats: JPG, PNG, GIF, MP4, MOV. Max file size 50MB.</p>
                    </div>
                  )}

                  {/* Step 5: Variations */}
                  {step.id === 5 && (
                    <div className="flex flex-col gap-4">
                      <Radio checked={!hasVariants} onChange={() => setHasVariants(false)} label="This product does not have variants" />
                      <Radio checked={hasVariants} onChange={() => setHasVariants(true)} label="This product has variants, like size or color" />
                      {hasVariants && (
                        <div className="bg-[#fbfeff] dark:bg-[#1a1d24] py-4 px-6 rounded-2xl border border-grey-100 dark:border-[#2a2d35] mt-2 shadow-sm">
                          <DraggableList
                            items={variants}
                            setItems={setVariants}
                            onRemove={removeVariant}
                            renderItem={(item: { id: string; type: string }) => {
                              const index = variants.findIndex(v => v.id === item.id);
                              return (
                                <div className="flex-1 flex flex-col gap-1 py-1 w-full max-w-sm">
                                  <span className="text-sm text-grey-800 dark:text-grey-300 ml-1 mb-1 font-medium">Option {index + 1}</span>
                                  <Combobox placeholder="Select variant" value={item.type} onChange={(val) => updateVariantType(item.id, val as string)} options={productFormConfig.variantOptions} size="medium" className={customComboboxClass} />
                                </div>
                              );
                            }}
                          />
                          <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-grey-800 dark:text-grey-300 cursor-pointer hover:opacity-75 select-none pl-8" onClick={addVariant}>
                            <Plus size={16} /> Add another option
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 6: Pricing and quantity */}
                  {step.id === 6 && (
                    <div className={tableWrapClass}>
                      {/* Header */}
                      <div className={`grid grid-cols-[2fr_1fr_1.5fr_1.5fr_1fr_1fr] px-4 py-3 ${tableHeaderClass}`}>
                        {productFormConfig.pricingColumns.map(col => (
                          <span key={col.key}>{col.label}</span>
                        ))}
                      </div>
                      {/* Rows */}
                      {pricingRows.map(row => (
                        <div key={row.id} className={`grid grid-cols-[2fr_1fr_1.5fr_1.5fr_1fr_1fr] px-4 py-3 items-center gap-2 ${tableRowClass}`}>
                          <span className="text-sm text-grey-400">{row.variant}</span>
                          <Input
                            type="number"
                            defaultValue={0}
                            min={0}
                            size="small"
                            onChange={(e) => setPricingRows(rows => rows.map(r => r.id === row.id ? { ...r, quantity: +e.target.value } : r))}
                          />
                          <Input
                            type="number"
                            defaultValue={0}
                            min={0}
                            size="small"
                            onChange={(e) => setPricingRows(rows => rows.map(r => r.id === row.id ? { ...r, regularPrice: +e.target.value } : r))}
                          />
                          <Input
                            type="number"
                            defaultValue={0}
                            min={0}
                            size="small"
                            onChange={(e) => setPricingRows(rows => rows.map(r => r.id === row.id ? { ...r, salePrice: +e.target.value } : r))}
                          />
                          <Switch
                            checked={row.includeTax}
                            onChange={(checked) => setPricingRows(rows => rows.map(r => r.id === row.id ? { ...r, includeTax: checked } : r))}
                          />
                          <Input
                            type="number"
                            defaultValue={0}
                            min={0}
                            size="small"
                            disabled={!row.includeTax}
                            onChange={(e) => setPricingRows(rows => rows.map(r => r.id === row.id ? { ...r, taxPercent: +e.target.value } : r))}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Step 7: Inventory */}
                  {step.id === 7 && (
                    <div className="flex flex-col gap-5">
                      <div className={tableWrapClass}>
                        {/* Header */}
                        <div className={`grid grid-cols-[1.5fr_2fr_2fr] px-4 py-3 ${tableHeaderClass}`}>
                          {productFormConfig.inventoryColumns.map(col => (
                            <span key={col.key}>{col.label}</span>
                          ))}
                        </div>
                        {/* Rows */}
                        {inventoryRows.map(row => (
                          <div key={row.id} className={`grid grid-cols-[1.5fr_2fr_2fr] px-4 py-3 items-center gap-3 ${tableRowClass}`}>
                            <span className="text-sm text-grey-400">{row.variant}</span>
                            <Input
                              type="text"
                              placeholder="SKU (Stock keeping unit)"
                              size="small"
                              onChange={(e) => setInventoryRows(rows => rows.map(r => r.id === row.id ? { ...r, sku: e.target.value } : r))}
                            />
                            <Input
                              type="text"
                              placeholder="Barcode (ISBN, UPC, GTIN etc)"
                              size="small"
                              onChange={(e) => setInventoryRows(rows => rows.map(r => r.id === row.id ? { ...r, barcode: e.target.value } : r))}
                            />
                          </div>
                        ))}
                      </div>

                      {/* Checkboxes */}
                      <div className="flex flex-col gap-3 pt-2">
                        {productFormConfig.inventoryOptions.map(opt => (
                          <Checkbox
                            key={opt.key}
                            checked={opt.key === 'trackQuantity' ? trackQuantity : continueSellingOutOfStock}
                            onChange={(e) => opt.key === 'trackQuantity' ? setTrackQuantity(e.target.checked) : setContinueSellingOutOfStock(e.target.checked)}
                            label={opt.label}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 8: Shipping */}
                  {step.id === 8 && (
                    <div className="flex flex-col gap-5">
                      {/* Physical product checkbox */}
                      <Checkbox
                        checked={isPhysicalProduct}
                        onChange={(e) => setIsPhysicalProduct(e.target.checked)}
                        label="This is a physical product"
                        className="font-semibold"
                      />

                      <Combobox
                        placeholder="Select country / region"
                        value={shippingCountry}
                        onChange={(val) => setShippingCountry(val as string)}
                        options={productFormConfig.countryRegions}
                        size="medium"
                        className={customComboboxClass}
                      />
                      <Combobox
                        placeholder="Enter a HS code"
                        value={hsCode}
                        onChange={(val) => setHsCode(val as string)}
                        options={productFormConfig.hsCodes}
                        size="medium"
                        className={customComboboxClass}
                      />
                    </div>
                  )}

                  {/* Step 9: Tag */}
                  {step.id === 9 && (
                    <div className="flex flex-col gap-4">
                      {/* Tag input */}
                      <div className="flex flex-wrap items-center gap-2 min-h-[48px] bg-[#f1f4f9] dark:bg-[#1e2128] rounded-lg px-4 py-2.5 focus-within:ring-1 focus-within:ring-primary">
                        {tags.map(tag => (
                          <span key={tag} className="flex items-center gap-1.5 bg-[#e4e8ec] dark:bg-[#2a2d35] text-grey-700 dark:text-grey-300 text-xs font-medium px-3 py-1 rounded-full">
                            {tag}
                            <button type="button" onClick={() => removeTag(tag)} className="text-grey-400 hover:text-grey-600 dark:hover:text-grey-200 leading-none">×</button>
                          </span>
                        ))}
                        <input
                          type="text"
                          value={tagInput}
                          onChange={e => setTagInput(e.target.value)}
                          onKeyDown={handleTagKeyDown}
                          placeholder={tags.length === 0 ? "Type and add tags" : ""}
                          className="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-grey-900 dark:text-grey-100 placeholder:text-grey-400"
                        />
                      </div>
                      <p className="text-xs text-grey-500">Press Enter or comma to add a tag.</p>
                    </div>
                  )}

                  {/* Step Navigation Buttons */}
                  <div className="flex items-center gap-2 mt-8 pt-4">
                    {step.id === productStepsData.length ? (
                      // Last step (Tag) — show Previous + Archive + Publish
                      <>
                        <Button variant="outline" className="border-none text-grey-700 shadow-none font-semibold px-4" onClick={handlePrev}>
                          {'< Previous'}
                        </Button>
                        <div className="flex-1" />
                        <Button variant="outline" className="border border-grey-300 dark:border-[#3a3d45] text-grey-800 dark:text-grey-200 font-semibold px-5 rounded-xl">
                          Archive product
                        </Button>
                        <Button variant="solid" color="primary" className="font-semibold px-5 rounded-xl">
                          Publish product
                        </Button>
                      </>
                    ) : (
                      <>
                        {step.id > 1 && (
                          <Button variant="outline" className="border-none text-grey-700 shadow-none font-semibold px-4" onClick={handlePrev}>
                            {'< Previous'}
                          </Button>
                        )}
                        <Button variant="outline" className="border-none text-grey-800 shadow-none font-semibold px-4" onClick={handleNext}>
                          {'Finish and proceed >'}
                        </Button>
                      </>
                    )}
                  </div>

                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}