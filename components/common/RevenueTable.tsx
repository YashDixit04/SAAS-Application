import React from 'react';
import { Table, Column } from './table/table';
import { REVENUE_TABLE_DATA, revenueTableColumns } from '@/data/config/RevenueTableConfig';

interface RevenueTableProps {
  data?: typeof REVENUE_TABLE_DATA;
  columns?: Column<typeof REVENUE_TABLE_DATA[0]>[];
  title?: string;
}

const RevenueTable: React.FC<RevenueTableProps> = ({ 
  data = REVENUE_TABLE_DATA, 
  columns = revenueTableColumns,
  title = "Revenue Overview" 
}) => {
  return (
    <div className="w-full">
      <Table
        title={title}
        data={data}
        columns={columns}
        searchPlaceholder="Search Teams"
        itemsPerPage={5}
      />
    </div>
  );
};

export default RevenueTable;
