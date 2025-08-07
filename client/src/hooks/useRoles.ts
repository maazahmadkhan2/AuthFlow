import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { getUserData } from '../lib/firebase';
import { UserRole, permissions } from '../../../shared/firebase-schema';

export interface UserWithRole {
  user: User;
  userData: {
    role: UserRole;
    permissions: string[];
    isActive: boolean;
    firstName: string;
    lastName: string;
    displayName: string;
    email: string;
    emailVerified: boolean;
    profileImageUrl: string | null;
    createdAt: any;
    updatedAt: any;
  } | null;
  loading: boolean;
}

export function useUserRole(user: User | null): UserWithRole {
  const [userData, setUserData] = useState<UserWithRole['userData']>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setUserData(null);
      setLoading(false);
      return;
    }

    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = await getUserData(user.uid);
      
      if (data) {
        // Ensure user has role and permissions
        const role = data.role || 'student';
        const userPermissions = data.permissions || permissions[role as UserRole] || [];
        
        setUserData({
          role: role as UserRole,
          permissions: userPermissions,
          isActive: data.isActive !== false, // Default to true if not set
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          displayName: data.displayName || `${data.firstName || ''} ${data.lastName || ''}`,
          email: data.email || user.email || '',
          emailVerified: data.emailVerified !== false,
          profileImageUrl: data.profileImageUrl || null,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
      } else {
        setUserData(null);
      }
    } catch (error) {
      console.error('Error loading user role data:', error);
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    user: user!,
    userData,
    loading
  };
}

export function usePermissions(user: User | null) {
  const { userData, loading } = useUserRole(user);
  
  const hasPermission = (permission: string): boolean => {
    if (!userData || !userData.permissions) return false;
    return userData.permissions.includes(permission);
  };

  const hasRole = (role: UserRole): boolean => {
    if (!userData) return false;
    return userData.role === role;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    if (!userData) return false;
    return roles.includes(userData.role);
  };

  const isActive = (): boolean => {
    return userData?.isActive === true;
  };

  return {
    role: userData?.role,
    permissions: userData?.permissions || [],
    hasPermission,
    hasRole,
    hasAnyRole,
    isActive,
    loading
  };
}

// Role hierarchy for access control
export const roleHierarchy: Record<UserRole, number> = {
  admin: 5,
  manager: 4,
  coordinator: 3,
  instructor: 2,
  student: 1
};

export function hasHigherRole(currentRole: UserRole, targetRole: UserRole): boolean {
  return roleHierarchy[currentRole] > roleHierarchy[targetRole];
}

export function canManageRole(managerRole: UserRole, targetRole: UserRole): boolean {
  const managerLevel = roleHierarchy[managerRole];
  const targetLevel = roleHierarchy[targetRole];
  
  // Admin can manage everyone
  if (managerRole === 'admin') return true;
  
  // Manager can manage coordinator, instructor, student
  if (managerRole === 'manager' && ['coordinator', 'instructor', 'student'].includes(targetRole)) return true;
  
  // Coordinator can manage instructor, student
  if (managerRole === 'coordinator' && ['instructor', 'student'].includes(targetRole)) return true;
  
  // Instructor can manage student
  if (managerRole === 'instructor' && targetRole === 'student') return true;
  
  return false;
}