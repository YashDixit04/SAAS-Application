import React, { useState } from 'react';
import DetailsView from '@/components/common/DetailsView';
import Button from '@/components/ui/Button';
import { tenantDetailsData } from '@/data/tenantDetailsData';
import apiClient from '@/lib/apiClient';

const emptyTenantData = {
    ...tenantDetailsData,
    basic: {
        ...tenantDetailsData.basic,
        tenantInformation: {
            ...tenantDetailsData.basic.tenantInformation,
            tenantName: '',
            tenantCode: '',
            status: 'Active',
            createdDate: new Date().toLocaleDateString(),
            contactEmail: '',
            contactPhone: '',
            website: '',
            industry: '',
            country: '',
            timezone: 'UTC',
        },
        subscription: {
            ...tenantDetailsData.basic.subscription,
            planName: 'Enterprise Plan',
            planType: 'Annual',
            amountPaid: '$0.00',
        }
    },
    advanced: {
        ...tenantDetailsData.advanced,
    }
};

const AddTenantPage: React.FC<{ onNavigate?: (url: string) => void }> = ({ onNavigate }) => {
    const [details, setDetails] = useState<any>(emptyTenantData);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const payload = {
                name: details.basic.tenantInformation.tenantName,
                domain: details.basic.tenantInformation.website,
                status: details.basic.tenantInformation.status,
                tenantCode: details.basic.tenantInformation.tenantCode,
                contactEmail: details.basic.tenantInformation.contactEmail,
                contactPhone: details.basic.tenantInformation.contactPhone,
                website: details.basic.tenantInformation.website,
                industry: details.basic.tenantInformation.industry,
                country: details.basic.tenantInformation.country,
                timezone: details.basic.tenantInformation.timezone,
                planName: details.basic.subscription?.planName,
                planType: details.basic.subscription?.planType,
                amountPaid: details.basic.subscription?.amountPaid,
            };

            await apiClient.post(`/tenants`, payload);
            if (onNavigate) onNavigate('users');
        } catch (err) {
            console.error('Failed to create tenant', err);
        } finally {
            setIsSaving(false);
        }
    };

    const breadcrumbItems = [
        { label: 'Home', href: '#' },
        { label: 'Tenants', href: '#' },
        { label: 'Add Tenant', active: true }
    ];

    const actions = (
        <div className="flex gap-3">
            <Button
                variant="outline"
                color="grey"
                size="small"
                onClick={() => onNavigate?.('users')}
                className="gap-2"
            >
                Cancel
            </Button>
            <Button
                variant="solid"
                color="primary"
                size="small"
                onClick={handleSave}
                disabled={isSaving}
                className="gap-2"
            >
                {isSaving ? 'Creating...' : 'Create Tenant'}
            </Button>
        </div>
    );

    return (
        <DetailsView
            data={details}
            breadcrumbItems={breadcrumbItems}
            actions={actions}
            pageTitle="Create New Tenant"
            pageSubtitle="Fill in the comprehensive details to onboard a new tenant."
            isEditMode={true}
        />
    );
};

export default AddTenantPage;
