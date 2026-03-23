/**
 * Authentication Service
 * Handles user authentication, session management, and caching
 * Designed to be easily migrated from JSON file storage to MongoDB + Backend APIs
 */

export interface UserPermissions {
  pages: string[];
  fields: {
    [componentName: string]: string[];
  };
}

export type RoleType = 'superadmin' | 'admin' | 'adminusers' | 'tenantadmin' | 'tenantadmin_subusers';

export interface User {
  username: string;
  email: string;
  password: string;
  roleType: RoleType;
  permissions: UserPermissions;
}

export interface UserSession {
  username: string;
  email: string;
  roleType: RoleType;
  permissions: UserPermissions;
  loginTimestamp: number;
}

// Storage key for session data
const SESSION_STORAGE_KEY = 'b2b_user_session';

/**
 * Authentication Service Class
 * Centralizes all authentication and session management logic
 */
class AuthService {
  /**
   * Authenticates a user with username/email and password
   * @param usernameOrEmail - Username or email address
   * @param password - User password
   * @returns User session if successful, null otherwise
   */
  async login(usernameOrEmail: string, password: string): Promise<UserSession | null> {
    try {
      // Fetch users from JSON file (will be replaced with API call)
      const users = await this.fetchUsers();

      // Find user by username or email
      const user = users.find(
        (u: User) =>
          (u.username === usernameOrEmail || u.email === usernameOrEmail) &&
          u.password === password
      );

      if (!user) {
        return null;
      }

      // Create session object
      const session: UserSession = {
        username: user.username,
        email: user.email,
        roleType: user.roleType,
        permissions: user.permissions,
        loginTimestamp: Date.now(),
      };

      // Store session in cache
      this.setSession(session);

      return session;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  }

  /**
   * Registers a new user (admin/superadmin only)
   * @param user - User data to register
   * @returns Success status
   */
  async signup(user: Omit<User, 'password'> & { password: string }): Promise<boolean> {
    try {
      // Fetch existing users
      const users = await this.fetchUsers();

      // Check if user already exists
      const existingUser = users.find(
        (u: User) => u.username === user.username || u.email === user.email
      );

      if (existingUser) {
        return false;
      }

      // Add new user to list
      users.push(user);

      // Save updated users list (will be replaced with API call)
      await this.saveUsers(users);

      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  }

  /**
   * Logs out the current user and clears session cache
   */
  logout(): void {
    this.clearSession();
  }

  /**
   * Gets the current user session from cache
   * @returns User session or null if not authenticated
   */
  getSession(): UserSession | null {
    try {
      const sessionData = localStorage.getItem(SESSION_STORAGE_KEY);

      if (!sessionData) {
        return null;
      }

      const session: UserSession = JSON.parse(sessionData);

      // Validate session has required fields
      if (!session.username || !session.roleType || !session.permissions) {
        this.clearSession();
        return null;
      }

      return session;
    } catch (error) {
      console.error('Error retrieving session:', error);
      this.clearSession();
      return null;
    }
  }

  /**
   * Sets the user session in cache
   * @param session - User session data to store
   */
  setSession(session: UserSession): void {
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    } catch (error) {
      console.error('Error storing session:', error);
    }
  }

  /**
   * Clears the user session from cache
   */
  clearSession(): void {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  }

  /**
   * Updates permissions for the current session
   * Used when permissions change during an active session
   * @param permissions - Updated permissions object
   */
  updatePermissions(permissions: UserPermissions): void {
    const session = this.getSession();

    if (session) {
      session.permissions = permissions;
      this.setSession(session);
    }
  }

  /**
   * Checks if user is authenticated
   * @returns True if user has valid session
   */
  isAuthenticated(): boolean {
    return this.getSession() !== null;
  }

  /**
   * Checks if current user has access to a specific page
   * @param pageName - Name of the page to check
   * @returns True if user has access
   */
  hasPageAccess(pageName: string): boolean {
    const session = this.getSession();

    if (!session) {
      return false;
    }

    // Superadmin has access to all pages
    if (session.roleType === 'superadmin') {
      return true;
    }

    // Check if page is in user's permissions
    return session.permissions.pages.includes(pageName);
  }

  /**
   * Checks if current user has access to a specific field in a component
   * @param componentName - Name of the component
   * @param fieldName - Name of the field
   * @returns True if user has access
   */
  hasFieldAccess(componentName: string, fieldName: string): boolean {
    const session = this.getSession();

    if (!session) {
      return false;
    }

    // Superadmin has access to all fields
    if (session.roleType === 'superadmin') {
      return true;
    }

    // Check if field is in user's permissions
    const componentFields = session.permissions.fields[componentName];

    if (!componentFields) {
      return false;
    }

    return componentFields.includes(fieldName);
  }

  /**
   * Gets all accessible pages for the current user
   * @returns Array of page names
   */
  getAccessiblePages(): string[] {
    const session = this.getSession();

    if (!session) {
      return [];
    }

    // Superadmin has access to all pages
    if (session.roleType === 'superadmin') {
      return ['dashboard', 'users', 'platformUsers', 'security', 'offers', 'finance', 'actions', 'integrations', 'userDetails', 'tenantDetails', 'help', 'tenantSubUsers', 'tenantVessels', 'tenantOrders', 'tenantCatalogue', 'addProduct', 'tenantDocuments', 'tenantActivityLogs', 'addAccount'];
    }

    return session.permissions.pages;
  }

  /**
   * Fetches users from JSON file
   * TODO: Replace with API call when backend is ready
   * @returns Array of users
   */
  private async fetchUsers(): Promise<User[]> {
    try {
      const data = await import('../data/usersManagement.json');
      return (data.users as unknown as User[]) || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  /**
   * Saves users to JSON file
   * TODO: Replace with API call when backend is ready
   * @param users - Array of users to save
   */
  private async saveUsers(users: User[]): Promise<void> {
    // This is a placeholder for the actual implementation
    // In a real application, this would make an API call to save the users
    // For now, we'll log a warning as direct file writing from browser is not possible
    console.warn('Cannot directly write to users.json from browser. Use API endpoint when available.');

    // Store in localStorage as temporary solution until backend is ready
    localStorage.setItem('b2b_users_pending', JSON.stringify({ users }));
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
