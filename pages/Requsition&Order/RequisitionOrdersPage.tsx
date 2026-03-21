import React, { useState } from 'react';
import GenericTablePage from '@/components/common/GenericTablePage';
import ViewToggle from '@/components/layout/viewTableLayout';
import { requisitionOrdersTableData, requisitionOrdersColumns } from '@/data/requisitionOrdersData';

const RequisitionOrdersPage: React.FC = () => {
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const breadcrumbItems = [
        { label: 'Home', href: '#' },
        { label: 'Users', href: '#' },
        { label: 'User Details', href: '#' },
        { label: 'Requisition & Orders', href: '#', active: true },
    ];

    return (
        <GenericTablePage
            breadcrumbItems={breadcrumbItems}
            data={requisitionOrdersTableData}
            columns={requisitionOrdersColumns}
            createButtonLabel="Create Order"
            itemsPerPage={7}
            viewToggle={<ViewToggle viewMode={viewMode} onViewChange={setViewMode} />}
            viewMode={viewMode}
        />
    );
};

export default RequisitionOrdersPage;
