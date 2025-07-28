import React, { useState } from 'react';
import {
  Menu as MuiMenu,
  MenuItem as MuiMenuItem,
  IconButton,
  Snackbar,
  Alert as MuiAlert
} from '@mui/material';
import { FiMoreVertical } from 'react-icons/fi'; // Other icons like FiEdit, FiTrash2 etc. are used in action.icon, keep them if ActionConfig is defined elsewhere or used directly.
import { usePermissions } from '../../hooks/usePermissions';

interface ActionConfig {
  id: string;
  label: string;
  icon: React.ReactElement;
  onClick: () => void;
  permission: {
    resourceType: string;
    action: string;
  };
}

interface RoleBasedMenuProps {
  actions: ActionConfig[];
  entityName?: string;
  // variant and colorScheme removed as MUI IconButton styling is different
  // They can be added back using sx prop if needed
}

/**
 * A role-based menu that only displays actions the user has permission to perform
 * 
 * @example
 * const actions = [
 *   {
 *     id: 'view',
 *     label: 'View Details',
 *     icon: <FiEye />,
 *     onClick: () => handleViewDetails(item),
 *     permission: { resourceType: 'rfq', action: 'read' }
 *   },
 *   {
 *     id: 'edit',
 *     label: 'Edit',
 *     icon: <FiEdit />,
 *     onClick: () => handleEdit(item),
 *     permission: { resourceType: 'rfq', action: 'update' }
 *   }
 * ];
 * 
 * <RoleBasedMenu actions={actions} entityName="RFQ" />
 */
const RoleBasedMenu: React.FC<RoleBasedMenuProps> = ({
  actions,
  entityName = 'Item',
}) => {
  const { hasPermission } = usePermissions();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  // const [snackbarMessage, setSnackbarMessage] = useState(''); // Removed as message is static now

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSnackbarClose = (reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  // Filter actions based on user permissions
  const authorizedActions = actions.filter(action => 
    hasPermission(action.permission.resourceType, action.permission.action)
  );
  
  // If no authorized actions, don't render the menu
  if (authorizedActions.length === 0) {
    // Optionally, you could show a disabled button or nothing
    return null;
  }
  
  return (
    <>
      <IconButton
        aria-label={`${entityName} options`}
        aria-controls={open ? 'role-based-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        size="small"
      >
        <FiMoreVertical />
      </IconButton>
      <MuiMenu
        id="role-based-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {authorizedActions.map((action) => (
          <MuiMenuItem 
            key={action.id}
            onClick={() => {
              action.onClick();
              handleClose(); // Close menu after action
            }}
          >
            {action.icon && <span style={{ marginRight: 8 }}>{action.icon}</span>} 
            {action.label}
          </MuiMenuItem>
        ))}
      </MuiMenu>
      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleSnackbarClose}>
        <MuiAlert onClose={handleSnackbarClose} severity="warning" sx={{ width: '100%' }}>
          You don't have the required permissions to perform this action.
        </MuiAlert>
      </Snackbar>
    </>
  );
};

export default RoleBasedMenu;
