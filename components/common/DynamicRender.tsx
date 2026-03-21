import React from 'react';
import {
  Heading5,
  BodyBase,
  LabelSm,
} from '../ui/Typography';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Switch from '../ui/Switch';
import Badge from '../ui/Badge';
import Avatar from '../ui/Avatar';

// --- Utility: Dynamic Label Generator ---
export const getLabel = (key: string): string => {
  const result = key.replace(/([A-Z])/g, ' $1').trim();
  return result.charAt(0).toUpperCase() + result.slice(1);
};

// --- Component: Dynamic Field Renderer ---
interface DynamicFieldProps {
  fieldKey: string;
  value: any;
  sectionKey: string;
  parentKey: string;
  onInputChange: (parent: string, section: string, field: string, value: any) => void;
  isEditMode?: boolean;
}

export const DynamicField: React.FC<DynamicFieldProps> = ({ fieldKey, value, sectionKey, parentKey, onInputChange, isEditMode = true }) => {
  if (value === null || value === undefined) {
    return null;
  }

  const label = getLabel(fieldKey);

  // Rule: Skip nested objects (like createdBy) — render their fields flat
  if (typeof value === 'object' && !Array.isArray(value)) {
    return (
      <>
        {Object.entries(value).map(([nestedKey, nestedValue]) => (
          <DynamicField
            key={nestedKey}
            fieldKey={nestedKey}
            value={nestedValue}
            sectionKey={sectionKey}
            parentKey={parentKey}
            onInputChange={onInputChange}
            isEditMode={isEditMode}
          />
        ))}
      </>
    );
  }

  // Rule: boolean -> Switch
  if (typeof value === 'boolean') {
    return (
      <div className="flex items-center justify-between py-3 border-b border-grey-100 dark:border-grey-800/50 last:border-0">
        <div>
          <BodyBase className="font-medium text-grey-900 dark:text-white">{label}</BodyBase>
        </div>
        {isEditMode ? (
          <Switch
            checked={value}
            onChange={(checked) => onInputChange(parentKey, sectionKey, fieldKey, checked)}
          />
        ) : (
          <Badge
            variant="soft"
            color={value ? 'success' : 'danger'}
            className="rounded-full px-3"
          >
            {value ? 'Enabled' : 'Disabled'}
          </Badge>
        )}
      </div>
    );
  }

  // Rule: array -> Badge list (always read-only style)
  if (Array.isArray(value)) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-3">
          <LabelSm className="text-grey-900 dark:text-white font-medium">{label}</LabelSm>
        </div>
        <div className="md:col-span-9">
          <div className="flex flex-wrap gap-2">
            {value.map((item: string, idx: number) => (
              <Badge key={idx} variant="outline" className="bg-grey-50 dark:bg-black border-grey-300 dark:border-grey-700">{item}</Badge>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Rule: Profile Photo -> Avatar
  if (fieldKey.toLowerCase().includes('photo') && typeof value === 'string') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-3">
          <LabelSm className="text-grey-900 dark:text-white font-medium">{label}</LabelSm>
        </div>
        <div className="md:col-span-9">
          <div className="flex items-center gap-4">
            <Avatar src={value} alt={label} size="lg" />
            {isEditMode && <Button variant="outline" size="medium">Change</Button>}
          </div>
        </div>
      </div>
    );
  }

  // Rule: string or number -> Input (editable) or plain text (view mode)
  if (!isEditMode) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-3">
          <LabelSm className="text-grey-900 dark:text-white font-medium">{label}</LabelSm>
        </div>
        <div className="md:col-span-9">
          <BodyBase className="text-grey-700 dark:text-grey-300 py-2">{String(value)}</BodyBase>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
      <div className="md:col-span-3">
        <LabelSm className="text-grey-900 dark:text-white font-medium">{label}</LabelSm>
      </div>
      <div className="md:col-span-9">
        <Input
          type={typeof value === 'number' ? 'number' : 'text'}
          value={value}
          onChange={(e) => onInputChange(parentKey, sectionKey, fieldKey, typeof value === 'number' ? Number(e.target.value) : e.target.value)}
          className="bg-grey-50 dark:bg-grey-900/50"
        />
      </div>
    </div>
  );
};

// --- Component: Dynamic Section Renderer ---
interface DynamicSectionProps {
  id: string;
  data: any;
  parentKey: string;
  onInputChange: (parent: string, section: string, field: string, value: any) => void;
  setRef: (el: Element | null) => void;
  isEditMode?: boolean;
}

export const DynamicSection: React.FC<DynamicSectionProps> = ({ id, data, parentKey, onInputChange, setRef, isEditMode = true }) => {
  const title = getLabel(id);

  return (
    <div
      id={id}
      ref={setRef}
      className="scroll-mt-28"
    >
      <div className="bg-white dark:bg-[#151518] rounded-xl border border-grey-200 shadow-sm">
        <div className="px-6 py-4 border-b border-grey-200">
          <Heading5 className="text-grey-900 dark:text-white">{title}</Heading5>
        </div>

        <div className="p-6 space-y-6">
          {Object.entries(data).map(([key, value]) => (
            <DynamicField
              key={key}
              fieldKey={key}
              value={value}
              sectionKey={id}
              parentKey={parentKey}
              onInputChange={onInputChange}
              isEditMode={isEditMode}
            />
          ))}
        </div>

        {isEditMode && (
          <div className="px-6 py-4 border-t border-grey-200 flex justify-end">
            <Button variant="solid" color="primary">Save Changes</Button>
          </div>
        )}
      </div>
    </div>
  );
};
