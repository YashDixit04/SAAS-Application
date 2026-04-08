import React, { useState, useEffect } from 'react';
import DetailsView from '@/components/common/DetailsView';
import Button from '@/components/ui/Button';
import { tenantDetailsData, tenantQuickLinks } from '@/data/tenantDetailsData';
import apiClient from '@/lib/apiClient';

// Fallback logic until router params provide an exact tenantId
const MOCK_TENANT_ID = 'global.platform';

const TenantDetailsView: React.FC<{ onNavigate?: (url: string) => void }> = ({ onNavigate }) => {
    const [isEditMode, setIsEditMode] = useState(false);
    const [details, setDetails] = useState<any>(null);

    useEffect(() => {
        // Fetch Tenant Details Dynamically
        const fetchTenant = async () => {
            try {
                // In actual deployment, parse UUID from URL: const id = useParams().tenantId 
                // Currently fetching the default seed global tenant
                const session = (await import('@/services/authService')).authService.getSession();
                const tenantId = session?.tenantId || 'default-id';
                const data = await apiClient.get<any>(`/tenants/${tenantId}/details`);
                
                // Map the dynamic relations back to the UI structure (DetailsView nested schema)
                const dynamicDetails = {
                    ...tenantDetailsData,
                    basic: {
                        ...tenantDetailsData.basic,
                        tenantInformation: {
                            ...tenantDetailsData.basic.tenantInformation,
                            tenantName: data.tenantInformation.tenantName,
                            tenantCode: data.tenantInformation.tenantCode,
                            website: data.tenantInformation.domain,
                            createdDate: new Date(data.tenantInformation.createdAt).toLocaleDateString()
                        }
                    },
                    advanced: {
                        ...tenantDetailsData.advanced,
                        users: {
                            ...tenantDetailsData.advanced.users,
                            totalUsers: data.usersCount,
                            activeUsers: data.usersCount, 
                        },
                        catalogueAndProducts: {
                            ...tenantDetailsData.advanced.catalogueAndProducts,
                            totalCatalogueProducts: data.catalogsCount,
                        }
                    }
                };

                // Inject accurate quick link relation totals
                tenantQuickLinks[0].total = data.usersCount;     // Sub Users
                tenantQuickLinks[1].total = data.vesselsCount;    // Vessels
                tenantQuickLinks[2].total = data.ordersCount;     // Orders
                tenantQuickLinks[3].total = data.catalogsCount;   // Catalogue

                setDetails(dynamicDetails);

            } catch (err) {
                console.error("Failed to load dynamic details", err);
                setDetails(tenantDetailsData); // Fallback so view doesn't crash
            }
        };

        fetchTenant();
    }, []);

    const breadcrumbItems = [
        { label: 'Home', href: '#' },
        { label: 'Tenants', href: '#' },
        { label: 'Tenant Details', href: '#', active: true }
    ];

    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const session = (await import('@/services/authService')).authService.getSession();
            const tenantId = session?.tenantId || 'default-id';
            
            // Map details back to payload
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

            await apiClient.patch(`/tenants/${tenantId}`, payload);
            setIsEditMode(false);
            // Optionally, show a toast here
        } catch (err) {
            console.error('Failed to save tenant', err);
        } finally {
            setIsSaving(false);
        }
    };

    const actions = (
        <div className="flex gap-3">
            <Button
                variant={isEditMode ? 'outline' : 'solid'}
                color={isEditMode ? 'danger' : 'primary'}
                size="small"
                onClick={() => isEditMode ? setIsEditMode(false) : setIsEditMode(true)}
                className="gap-2"
            >
                {isEditMode ? 'Cancel Edit' : 'Edit Details'}
            </Button>
            {isEditMode && (
                <Button
                    variant="solid"
                    color="primary"
                    size="small"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="gap-2"
                >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
            )}
        </div>
    );

    if (!details) return null; // Simple loading boundary

    return (
        <DetailsView
            data={details}
            breadcrumbItems={breadcrumbItems}
            actions={actions}
            pageTitle={`${details.type} Details`}
            pageSubtitle="Comprehensive overview of tenant information, subscription, and usage"
            isEditMode={isEditMode}
            quickLinks={tenantQuickLinks}
            onQuickLinkClick={onNavigate}
        />
    );
};

export default TenantDetailsView;
