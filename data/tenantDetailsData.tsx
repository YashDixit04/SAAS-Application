// --- Tenant Details Data ---

export interface TenantDetailsProfile {
  type: string;
  basic: {
    tenantInformation: {
      tenantName: string;
      tenantCode: string;
      status: string;
      createdDate: string;
      createdBy: {
        name: string;
        email: string;
        profilePhoto: string;
      };
      contactEmail: string;
      contactPhone: string;
      website: string;
      industry: string;
      country: string;
      timezone: string;
    };
    subscription: {
      planName: string;
      planType: string;
      billingCycle: string;
      purchaseDate: string;
      expiryDate: string;
      daysLeft: number;
      subscriptionStatus: string;
      amountPaid: string;
      currency: string;
      autoRenew: boolean;
    };
  };
  advanced: {
    planFeatures: {
      modulesEnabled: string[];
      maxUsers: number;
      maxSubUsers: number;
      maxStorage: string;
      apiRequestsPerMonth: number;
      multiTenantSupport: boolean;
      advancedAnalytics: boolean;
      customBranding: boolean;
      prioritySupport: boolean;
      auditLogs: boolean;
    };
    users: {
      tenantAdminName: string;
      tenantAdminEmail: string;
      tenantAdminPhone: string;
      tenantAdminProfilePhoto: string;
      tenantAdminLastLogin: string;
      totalUsers: number;
      activeUsers: number;
      inactiveUsers: number;
      pendingInvitations: number;
      userTypes: string[];
      smcUsers: number;
      vendorUsers: number;
      hasVendorUsers: boolean;
    };
    catalogueAndProducts: {
      totalCatalogueProducts: number;
      totalPicturesUploaded: number;
      portsDealing: string[];
    };
    usageAnalytics: {
      storageUsed: string;
      storageLimit: string;
      apiRequestsThisMonth: number;
      activeSessions: number;
      lastActivity: string;
    };
    billing: {
      billingContact: string;
      paymentMethod: string;
      lastPaymentDate: string;
      nextBillingDate: string;
    };
    integrations: {
      connectedSystems: string[];
      apiAccess: boolean;
      apiKey: string;
      webhookStatus: string;
    };
    security: {
      twoFactorAuthentication: boolean;
      ssoEnabled: boolean;
      passwordPolicy: string;
      auditLogsAccess: boolean;
      lastSecurityAudit: string;
    };
  };
}

export const tenantDetailsData: TenantDetailsProfile = {
  type: "Tenant",

  basic: {
    tenantInformation: {
      tenantName: "MSC Falcons",
      tenantCode: "MSC-52134121",
      status: "Active",
      createdDate: "2024-02-15",
      createdBy: {
        name: "Sushma",
        email: "sushma21@shipskart.com",
        profilePhoto: "https://i.pravatar.cc/150?u=12",
      },
      contactEmail: "mscfalcon@gmail.com",
      contactPhone: "+1 987 654 3210",
      website: "https://mscfalcons.com",
      industry: "Logistics",
      country: "United States",
      timezone: "UTC -5",
    },
    subscription: {
      planName: "Enterprise Plan",
      planType: "Annual",
      billingCycle: "Yearly",
      purchaseDate: "2024-02-15",
      expiryDate: "2025-02-15",
      daysLeft: 324,
      subscriptionStatus: "Active",
      amountPaid: "$259.00",
      currency: "USD",
      autoRenew: true,
    },
  },

  advanced: {
    planFeatures: {
      modulesEnabled: [
        "Tenant Management",
        "User Management",
        "Analytics Dashboard",
        "API Access",
        "Integrations",
        "Reports",
      ],
      maxUsers: 200,
      maxSubUsers: 500,
      maxStorage: "500 GB",
      apiRequestsPerMonth: 100000,
      multiTenantSupport: true,
      advancedAnalytics: true,
      customBranding: true,
      prioritySupport: true,
      auditLogs: true,
    },
    users: {
      tenantAdminName: "Jason Tatum",
      tenantAdminEmail: "jason.tatum@keenthemes.com",
      tenantAdminPhone: "+1 (555) 123-4567",
      tenantAdminProfilePhoto: "https://i.pravatar.cc/150?u=3",
      tenantAdminLastLogin: "2024-02-22 09:45 AM",
      totalUsers: 145,
      activeUsers: 132,
      inactiveUsers: 8,
      pendingInvitations: 5,
      userTypes: ["SMC", "Vendor"],
      smcUsers: 98,
      vendorUsers: 47,
      hasVendorUsers: true,
    },
    catalogueAndProducts: {
      totalCatalogueProducts: 12450,
      totalPicturesUploaded: 8320,
      portsDealing: ["Singapore", "Rotterdam", "Shanghai", "Dubai", "Houston", "Mumbai", "Busan", "Antwerp"],
    },
    usageAnalytics: {
      storageUsed: "120 GB",
      storageLimit: "500 GB",
      apiRequestsThisMonth: 45230,
      activeSessions: 22,
      lastActivity: "2024-02-22 10:12 AM",
    },
    billing: {
      billingContact: "billing@mscfalcons.com",
      paymentMethod: "Credit Card",
      lastPaymentDate: "2024-02-15",
      nextBillingDate: "2025-02-15",
    },
    integrations: {
      connectedSystems: ["Slack", "SAP", "Salesforce"],
      apiAccess: true,
      apiKey: "********************",
      webhookStatus: "Active",
    },
    security: {
      twoFactorAuthentication: true,
      ssoEnabled: true,
      passwordPolicy: "Strong",
      auditLogsAccess: true,
      lastSecurityAudit: "2024-01-10",
    },
  },
};

// --- Quick Link Sections ---
export interface QuickLinkSection {
  title: string;
  total: number | null;
  icon: string;
  redirectUrl: string;
}

export const tenantQuickLinks: QuickLinkSection[] = [
  {
    title: "Sub Users",
    total: 145,
    icon: "users",
    redirectUrl: "/tenant/sub-users",
  },
  {
    title: "Vessels",
    total: 32,
    icon: "ship",
    redirectUrl: "/tenant/vessels",
  },
  {
    title: "Requisition & Orders",
    total: 520,
    icon: "shopping-cart",
    redirectUrl: "/tenant/orders",
  },
  {
    title: "Catalogue",
    total: 12450,
    icon: "package",
    redirectUrl: "/tenant/catalogue",
  },
  {
    title: "Documents",
    total: null,
    icon: "file",
    redirectUrl: "/tenant/documents",
  },
  {
    title: "Activity Logs",
    total: null,
    icon: "clock",
    redirectUrl: "/tenant/activity-logs",
  },
];
