import * as aclStorage from './acl-storage';

// Export all ACL-related functions
export const storage = {
  // ACL management
  getAccessControlLists: aclStorage.getAccessControlLists,
  getAccessControlList: aclStorage.getAccessControlList,
  createAccessControlList: aclStorage.createAccessControlList,
  updateAccessControlList: aclStorage.updateAccessControlList,
  deleteAccessControlList: aclStorage.deleteAccessControlList,
  
  // ACL Rule management
  getAclRules: aclStorage.getAclRules,
  getAclRule: aclStorage.getAclRule,
  createAclRule: aclStorage.createAclRule,
  updateAclRule: aclStorage.updateAclRule,
  deleteAclRule: aclStorage.deleteAclRule,
  
  // ACL Assignment management
  getAclAssignments: aclStorage.getAclAssignments,
  getAclAssignment: aclStorage.getAclAssignment,
  createAclAssignment: aclStorage.createAclAssignment,
  deleteAclAssignment: aclStorage.deleteAclAssignment,
  
  // Permission check functions
  canManageOrganization: aclStorage.canManageOrganization,
  getEffectivePermission: aclStorage.getEffectivePermission,
};
