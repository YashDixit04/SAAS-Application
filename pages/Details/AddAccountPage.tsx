import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { authService, RoleType } from '@/services/authService';
import { User, Mail, Lock, Shield, Plus, X } from 'lucide-react';
import { isAdmin } from '@/utils/rbac';
import PageLayout from '@/components/layout/PageLayout';
import { Heading2, BodyBase } from '@/components/ui/Typography';

const availablePages = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'users', label: 'Tenants' },
    { id: 'platformUsers', label: 'Platform Users' },
    { id: 'security', label: 'Security' },
    { id: 'offers', label: 'Offers' },
    { id: 'finance', label: 'Finance' },
    { id: 'actions', label: 'Actions' },
    { id: 'integrations', label: 'Integrations' },
    { id: 'userDetails', label: 'User Details' },
    { id: 'tenantDetails', label: 'Tenant Details' },
    { id: 'tenantSubUsers', label: 'Tenant Sub Users' },
    { id: 'tenantVessels', label: 'Tenant Vessels' },
    { id: 'tenantOrders', label: 'Tenant Orders' },
    { id: 'tenantCatalogue', label: 'Tenant Catalogue' },
    { id: 'addProduct', label: 'Add Product' },
    { id: 'tenantDocuments', label: 'Tenant Documents' },
    { id: 'tenantActivityLogs', label: 'Activity Logs' },
];

const commonComponentFields = [
    { component: 'tenantTable', fields: ['name', 'email', 'status', 'subscription', 'vessels', 'orders'] },
    { component: 'userTable', fields: ['name', 'email', 'role', 'status'] },
    { component: 'vesselTable', fields: ['name', 'type', 'capacity', 'status'] },
    { component: 'orderTable', fields: ['orderId', 'date', 'status', 'amount'] },
    { component: 'catalogueTable', fields: ['productName', 'category', 'price', 'stock'] },
    { component: 'subUsersTable', fields: ['name', 'email', 'role'] },
    { component: 'dashboard', fields: ['revenue', 'subscriptions', 'tenants', 'activeUsers'] },
];

const AddAccountPage: React.FC<{ onNavigate?: (tab: string) => void }> = ({ onNavigate }) => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        roleType: 'tenantadmin' as RoleType,
    });
    const [selectedPages, setSelectedPages] = useState<string[]>([]);
    const [componentFields, setComponentFields] = useState<{ [key: string]: string[] }>({});
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    // Default breadcrumbs based on previous views might be nice, but we'll use a standard one.
    const breadcrumbItems = [
        { label: 'Home', href: '#' },
        { label: 'Users', href: '#' },
        { label: 'Add a User', active: true }
    ];

    if (!isAdmin()) {
        return (
            <PageLayout breadcrumbItems={breadcrumbItems}>
                <div className="flex-1 flex items-center justify-center p-8">
                    <div className="text-center">
                        <Heading2 className="text-grey-900 dark:text-white mb-2">Access Denied</Heading2>
                        <BodyBase className="text-grey-500">You don't have permission to view this page. Only Admins and Superadmins can create accounts.</BodyBase>
                    </div>
                </div>
            </PageLayout>
        );
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError('');
    };

    const handlePageToggle = (pageId: string) => {
        if (selectedPages.includes(pageId)) {
            setSelectedPages(selectedPages.filter((p) => p !== pageId));
        } else {
            setSelectedPages([...selectedPages, pageId]);
        }
    };

    const handleComponentFieldToggle = (component: string, field: string) => {
        const currentFields = componentFields[component] || [];
        if (currentFields.includes(field)) {
            setComponentFields({
                ...componentFields,
                [component]: currentFields.filter((f) => f !== field),
            });
        } else {
            setComponentFields({
                ...componentFields,
                [component]: [...currentFields, field],
            });
        }
    };

    const handleQuickSetup = (roleType: RoleType) => {
        setFormData({ ...formData, roleType });
        switch (roleType) {
            case 'admin':
                setSelectedPages(['dashboard', 'users', 'platformUsers', 'offers', 'userDetails', 'tenantDetails']);
                setComponentFields({
                    tenantTable: ['name', 'email', 'status', 'subscription', 'vessels', 'orders'],
                    userTable: ['name', 'email', 'role', 'status'],
                    dashboard: ['revenue', 'subscriptions', 'tenants', 'activeUsers'],
                });
                break;
            case 'adminusers':
                setSelectedPages(['dashboard', 'users', 'tenantDetails']);
                setComponentFields({
                    tenantTable: ['name', 'email', 'status', 'vessels'],
                    dashboard: ['tenants', 'activeUsers'],
                });
                break;
            case 'tenantadmin':
                setSelectedPages(['dashboard', 'tenantSubUsers', 'tenantVessels', 'tenantOrders', 'tenantCatalogue', 'tenantDocuments']);
                setComponentFields({
                    vesselTable: ['name', 'type', 'capacity', 'status'],
                    orderTable: ['orderId', 'date', 'status', 'amount'],
                    catalogueTable: ['productName', 'category', 'price', 'stock'],
                    subUsersTable: ['name', 'email', 'role'],
                });
                break;
            case 'tenantadmin_subusers':
                setSelectedPages(['tenantVessels', 'tenantOrders']);
                setComponentFields({
                    vesselTable: ['name', 'type', 'status'],
                    orderTable: ['orderId', 'date', 'status'],
                });
                break;
            default:
                setSelectedPages([]);
                setComponentFields({});
        }
    };

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        if (!formData.username || !formData.email || !formData.password) {
            setError('All fields are required');
            setLoading(false);
            return;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            setLoading(false);
            return;
        }
        if (selectedPages.length === 0) {
            setError('Please select at least one page access');
            setLoading(false);
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address');
            setLoading(false);
            return;
        }

        try {
            const success = await authService.signup({
                username: formData.username,
                email: formData.email,
                password: formData.password,
                roleType: formData.roleType,
                permissions: {
                    pages: selectedPages,
                    fields: componentFields,
                },
            });

            if (success) {
                setSuccess(`Account "${formData.username}" created successfully!`);
                setFormData({
                    username: '',
                    email: '',
                    password: '',
                    roleType: 'tenantadmin',
                });
                setSelectedPages([]);
                setComponentFields({});
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError('Username or email already exists');
            }
        } catch (err) {
            setError('An error occurred while creating. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const actions = (
        <Button
            variant="outline"
            color="grey"
            size="small"
            onClick={() => onNavigate?.(formData.roleType.includes('tenant') ? 'users' : 'platformUsers')}
            className="gap-2"
        >
            <X size={16} /> Cancel
        </Button>
    );

    return (
        <PageLayout breadcrumbItems={breadcrumbItems} actions={actions}>
            <div className="p-6 max-w-5xl mx-auto w-full">
                <div className="mb-8">
                    <Heading2 className="text-grey-900 dark:text-white mb-2">Create Account</Heading2>
                    <BodyBase className="text-grey-500 dark:text-grey-400">
                        Create and configure a new tenant or user with specific role-based permissions.
                    </BodyBase>
                </div>

                {success && (
                    <div className="mb-6 p-4 bg-success-soft border border-success/20 rounded-xl">
                        <p className="text-success font-medium">{success}</p>
                    </div>
                )}
                {error && (
                    <div className="mb-6 p-4 bg-danger-soft border border-danger/20 rounded-xl">
                        <p className="text-danger text-sm">{error}</p>
                    </div>
                )}

                <div className="bg-white dark:bg-[#0A0A0D] rounded-2xl border border-grey-200 dark:border-grey-800 p-8 shadow-sm">
                    <form onSubmit={handleAddUser} className="space-y-8">
                        {/* Basis Information Section - similar flow to details view */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-grey-900 dark:text-white border-b border-grey-100 dark:border-grey-800 pb-2">
                                Basic Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-grey-700 dark:text-grey-300 mb-1.5">
                                        Username
                                    </label>
                                    <Input
                                        name="username"
                                        type="text"
                                        placeholder="Enter username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        leftIcon={<User size={18} />}
                                        size="medium"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-grey-700 dark:text-grey-300 mb-1.5">
                                        Email Address
                                    </label>
                                    <Input
                                        name="email"
                                        type="email"
                                        placeholder="user@example.com"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        leftIcon={<Mail size={18} />}
                                        size="medium"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-grey-700 dark:text-grey-300 mb-1.5">
                                        Password
                                    </label>
                                    <Input
                                        name="password"
                                        type="password"
                                        placeholder="Enter secure password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        leftIcon={<Lock size={18} />}
                                        size="medium"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-grey-700 dark:text-grey-300 mb-1.5">
                                        Role Type
                                    </label>
                                    <div className="relative">
                                        <select
                                            name="roleType"
                                            value={formData.roleType}
                                            onChange={(e) => handleQuickSetup(e.target.value as RoleType)}
                                            className="w-full h-10 px-3 pr-10 bg-white dark:bg-[#0A0A0D] border border-grey-200 dark:border-grey-800 rounded-lg text-grey-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none transition-colors"
                                            required
                                        >
                                            <option value="admin">Admin</option>
                                            <option value="adminusers">Admin User</option>
                                            <option value="tenantadmin">Tenant Admin</option>
                                            <option value="tenantadmin_subusers">Tenant Sub User</option>
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <Shield size={18} className="text-grey-400" />
                                        </div>
                                    </div>
                                    <p className="text-xs text-grey-500 dark:text-grey-400 mt-1.5">
                                        Selecting a role will auto-populate recommended permissions.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Pages Access Section */}
                        <div className="space-y-4 pt-4">
                            <h3 className="text-lg font-semibold text-grey-900 dark:text-white border-b border-grey-100 dark:border-grey-800 pb-2">
                                Page Access Permissions
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {availablePages.map((page) => (
                                    <label
                                        key={page.id}
                                        className={`flex items-center space-x-3 p-3 rounded-xl border transition-all cursor-pointer ${
                                            selectedPages.includes(page.id)
                                                ? 'border-primary bg-primary/5 dark:bg-primary/10'
                                                : 'border-grey-200 dark:border-grey-800 bg-grey-50 dark:bg-grey-900 hover:border-primary/50'
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedPages.includes(page.id)}
                                            onChange={() => handlePageToggle(page.id)}
                                            className="rounded border-grey-300 text-primary focus:ring-primary h-4 w-4"
                                        />
                                        <span className="text-sm font-medium text-grey-700 dark:text-grey-300">
                                            {page.label}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Component Fields Access Section */}
                        <div className="space-y-4 pt-4">
                            <h3 className="text-lg font-semibold text-grey-900 dark:text-white border-b border-grey-100 dark:border-grey-800 pb-2">
                                Component Field Permissions
                            </h3>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {commonComponentFields.map((component) => (
                                    <div
                                        key={component.component}
                                        className="p-4 rounded-xl border border-grey-200 dark:border-grey-800 bg-grey-50/50 dark:bg-grey-900/50"
                                    >
                                        <p className="text-sm font-semibold text-grey-800 dark:text-grey-200 mb-3 capitalize">
                                            {component.component.replace(/([A-Z])/g, ' $1').trim()}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {component.fields.map((field) => {
                                                const isSelected = (componentFields[component.component] || []).includes(field);
                                                return (
                                                    <label
                                                        key={field}
                                                        className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                                                            isSelected
                                                                ? 'border-primary bg-primary/10 text-primary'
                                                                : 'border-grey-200 dark:border-grey-700 bg-white dark:bg-[#0A0A0D] text-grey-600 dark:text-grey-400 hover:border-primary/30'
                                                        }`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => handleComponentFieldToggle(component.component, field)}
                                                            className="sr-only"
                                                        />
                                                        <span className="text-xs font-medium">
                                                            {field}
                                                        </span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 pt-6 border-t border-grey-100 dark:border-grey-800">
                            <Button
                                type="button"
                                variant="outline"
                                color="grey"
                                size="large"
                                onClick={() => onNavigate?.('platformUsers')}
                                className="w-32"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="solid"
                                color="primary"
                                size="large"
                                leftIcon={<Plus size={18} />}
                                disabled={loading}
                                className="w-48"
                            >
                                {loading ? 'Creating...' : 'Create Account'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </PageLayout>
    );
};

export default AddAccountPage;
