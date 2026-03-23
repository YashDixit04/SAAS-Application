import React, { useState } from 'react';
import GenericTablePage from '@/components/common/GenericTablePage';
import { activityLogsTableData, activityLogsColumns } from '@/data/activityLogsData';
import Button from '@/components/ui/Button';
import ViewToggle from '@/components/layout/viewTableLayout';

const ActivityLogsPage: React.FC = () => {
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

    const breadcrumbItems = [
        { label: 'Home', href: '#' },
        { label: 'Activity Logs', href: '#', active: true },
    ];

    
    const actions = (
        <div className="w-full sm:w-auto flex items-center justify-end gap-3">
            {/* Create Tenant Button */}
            <Button variant="solid" color="primary" size="small">
                Account Settings
            </Button>
        </div>
    );

    return (
        <GenericTablePage
            breadcrumbItems={breadcrumbItems}
            data={activityLogsTableData}
            columns={activityLogsColumns}
            itemsPerPage={7}
            actions={actions}
            viewToggle={<ViewToggle viewMode={viewMode} onViewChange={setViewMode} />}
            viewMode={viewMode}
        />
    );
};

export default ActivityLogsPage;
