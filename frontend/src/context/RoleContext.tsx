import React, { createContext, useContext, useState, useEffect } from 'react';
import { ClinicalRole, RoleDescriptor } from '../types/lasa';

export const ROLE_CONFIGS: Record<ClinicalRole, RoleDescriptor> = {
  Doctor: {
    id: 'Doctor',
    name: 'Doctor / Prescriber',
    icon: 'Stethoscope',
    badge: 'Prescribing Safety',
    tagline: 'Order Formulation & Indication Match',
    description: 'Screens prescriptions during entry, analyzes dual-drug collisions, checks drug class contraindications.',
    isNaiveMode: false
  },
  Pharmacist: {
    id: 'Pharmacist',
    name: 'Clinical Pharmacist',
    icon: 'Pill',
    badge: 'Dispensing Verification',
    tagline: 'Dispensing & Packaging Inspection',
    description: 'Verifies dispensing accuracy, inspects Tall Man lettering on physical drug boxes, audits risk overrides.',
    isNaiveMode: false
  },
  Assistant: {
    id: 'Assistant',
    name: 'Pharmacy Assistant / Tech',
    icon: 'FileCheck',
    badge: 'Naive User / Guided Mode',
    tagline: 'Simplified Safety & Traffic-Light Alerts',
    description: 'Non-technical plain-English view with Green/Yellow/Red alerts, prescription scanning, and 1-click supervisor sign-off.',
    isNaiveMode: true
  },
  Admin: {
    id: 'Admin',
    name: 'Patient Safety Director',
    icon: 'ShieldAlert',
    badge: 'Surveillance & Governance',
    tagline: 'Hospital Analytics & Big Data Streams',
    description: 'Institutional surveillance, DGIM streaming event counts, Bloom Filter health, and ML retraining.',
    isNaiveMode: false
  }
};

interface RoleContextType {
  currentRole: ClinicalRole;
  currentRoleConfig: RoleDescriptor;
  isNaiveMode: boolean;
  setRole: (role: ClinicalRole) => void;
  availableRoles: RoleDescriptor[];
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

const ROLE_STORAGE_KEY = 'lasaguard_active_role';

export const RoleProvider: React.FC<{ children: React.ReactNode; initialRole?: ClinicalRole }> = ({
  children,
  initialRole = 'Doctor'
}) => {
  const [currentRole, setCurrentRole] = useState<ClinicalRole>(() => {
    const saved = localStorage.getItem(ROLE_STORAGE_KEY) as ClinicalRole;
    if (saved && ROLE_CONFIGS[saved]) return saved;
    return initialRole;
  });

  const setRole = (role: ClinicalRole) => {
    if (ROLE_CONFIGS[role]) {
      setCurrentRole(role);
      localStorage.setItem(ROLE_STORAGE_KEY, role);
    }
  };

  const currentRoleConfig = ROLE_CONFIGS[currentRole] || ROLE_CONFIGS.Doctor;
  const isNaiveMode = currentRole === 'Assistant';
  const availableRoles = Object.values(ROLE_CONFIGS);

  return (
    <RoleContext.Provider
      value={{
        currentRole,
        currentRoleConfig,
        isNaiveMode,
        setRole,
        availableRoles
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = (): RoleContextType => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};
