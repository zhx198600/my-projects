import React from 'react';
import type { Role } from '../types';
import { ROLE_DISPLAY_NAMES } from '../types';
import { useApproval } from '../contexts/ApprovalContext';

const RoleSwitcher: React.FC = () => {
  const { currentRole, switchRole } = useApproval();

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as Role;
    switchRole(newRole);
  };

  const allRoles: Role[] = ['employee', 'department_manager', 'finance', 'general_manager'];

  return (
    <select
      value={currentRole}
      onChange={handleRoleChange}
      className="ml-3 block w-32 rounded-md border-gray-300 py-1.5 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 bg-white shadow-sm"
    >
      {allRoles.map(role => (
        <option key={role} value={role}>{ROLE_DISPLAY_NAMES[role]}</option>
      ))}
    </select>
  );
};

export default RoleSwitcher;
