// Define user roles
export enum UserRole {
  ADMIN = "ADMIN",
  CELL_LEADER = "CELL_LEADER",
  VILLAGE_LEADER = "VILLAGE_LEADER",
  ISIBO_LEADER = "ISIBO_LEADER",
  HOUSE_REPRESENTATIVE = "HOUSE_REPRESENTATIVE",
  CITIZEN = "CITIZEN",
}

// Define permissions
export enum Permission {
  // Global permissions
  VIEW_NOTIFICATIONS = "VIEW_NOTIFICATIONS",

  // Admin permissions
  ASSIGN_CELL_LEADERS = "ASSIGN_CELL_LEADERS",
  DEASSIGN_CELL_LEADERS = "DEASSIGN_CELL_LEADERS",
  CREATE_CELL_LEADER = "CREATE_CELL_LEADER",
  CREATE_CELL = "CREATE_CELL",
  UPDATE_CELL = "UPDATE_CELL",
  DELETE_CELL = "DELETE_CELL",
  VIEW_ALL_CELLS = "VIEW_ALL_CELLS",

  // Cell leader permissions
  VIEW_CELL = "VIEW_CELL",
  ASSIGN_VILLAGE_LEADERS = "ASSIGN_VILLAGE_LEADERS",
  DEASSIGN_VILLAGE_LEADERS = "DEASSIGN_VILLAGE_LEADERS",
  VIEW_CELL_ANALYTICS = "VIEW_CELL_ANALYTICS",
  CREATE_VILLAGE_LEADER = "CREATE_VILLAGE_LEADER",
  VIEW_CELL_ACTIVITY = "VIEW_CELL_ACTIVITY",
  CREATE_VILLAGE = "CREATE_VILLAGE",
  UPDATE_VILLAGE = "UPDATE_VILLAGE",
  DELETE_VILLAGE = "DELETE_VILLAGE",
  VIEW_ALL_VILLAGES = "VIEW_ALL_VILLAGES",

  // Village leader permissions
  VIEW_VILLAGE = "VIEW_VILLAGE",
  ASSIGN_ISIBO_LEADERS = "ASSIGN_ISIBO_LEADERS",
  DEASSIGN_ISIBO_LEADERS = "DEASSIGN_ISIBO_LEADERS",
  VIEW_VILLAGE_ANALYTICS = "VIEW_VILLAGE_ANALYTICS",
  CREATE_ISIBO = "CREATE_ISIBO",
  UPDATE_ISIBO = "UPDATE_ISIBO",
  DELETE_ISIBO = "DELETE_ISIBO",
  CREATE_ISIBO_LEADER = "CREATE_ISIBO_LEADER",
  CREATE_ACTIVITY = "CREATE_ACTIVITY",
  UPDATE_ACTIVITY = "UPDATE_ACTIVITY",
  ADD_ACTIVITY_REPORT = "ADD_ACTIVITY_REPORT",

  // Isibo leader permissions
  VIEW_ISIBO = "VIEW_ISIBO",
  ASSIGN_HOUSE_REPRESENTATIVES = "ASSIGN_HOUSE_REPRESENTATIVES",
  DEASSIGN_HOUSE_REPRESENTATIVES = "DEASSIGN_HOUSE_REPRESENTATIVES",
  VIEW_ISIBO_ANALYTICS = "VIEW_ISIBO_ANALYTICS",
  CREATE_HOUSE = "CREATE_HOUSE",
  UPDATE_HOUSE = "UPDATE_HOUSE",
  DELETE_HOUSE = "DELETE_HOUSE",
  ADD_CITIZENS = "ADD_CITIZENS",
  ASSIGN_CITIZENS_TO_HOUSE = "ASSIGN_CITIZENS_TO_HOUSE",
  VIEW_VILLAGE_ACTIVITY = "VIEW_VILLAGE_ACTIVITY",
  ADD_TASK_REPORT = "ADD_TASK_REPORT",
  TAKE_ATTENDANCE = "TAKE_ATTENDANCE",

  // House representative permissions
  VIEW_HOUSE = "VIEW_HOUSE",

  // Citizen permissions
  VIEW_PROFILE = "VIEW_PROFILE",
}

// Define permission mapping for each role
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    // Admin can do everything
    ...Object.values(Permission),
  ],

  [UserRole.CELL_LEADER]: [
    // Global permissions
    Permission.VIEW_NOTIFICATIONS,
    Permission.VIEW_PROFILE,

    // Cell leader specific permissions
    Permission.VIEW_CELL,
    Permission.ASSIGN_VILLAGE_LEADERS,
    Permission.DEASSIGN_VILLAGE_LEADERS,
    Permission.VIEW_CELL_ANALYTICS,
    Permission.CREATE_VILLAGE_LEADER,
    Permission.VIEW_CELL_ACTIVITY,
    Permission.CREATE_VILLAGE,
    Permission.UPDATE_VILLAGE,
    Permission.DELETE_VILLAGE,
    Permission.VIEW_ALL_VILLAGES,
  ],

  [UserRole.VILLAGE_LEADER]: [
    // Global permissions
    Permission.VIEW_NOTIFICATIONS,
    Permission.VIEW_PROFILE,

    // Village leader specific permissions
    Permission.VIEW_VILLAGE,
    Permission.ASSIGN_ISIBO_LEADERS,
    Permission.DEASSIGN_ISIBO_LEADERS,
    Permission.VIEW_VILLAGE_ANALYTICS,
    Permission.CREATE_ISIBO,
    Permission.UPDATE_ISIBO,
    Permission.DELETE_ISIBO,
    Permission.CREATE_ISIBO_LEADER,
    Permission.CREATE_ACTIVITY,
    Permission.UPDATE_ACTIVITY,
    Permission.ADD_ACTIVITY_REPORT,
  ],

  [UserRole.ISIBO_LEADER]: [
    // Global permissions
    Permission.VIEW_NOTIFICATIONS,
    Permission.VIEW_PROFILE,

    // Isibo leader specific permissions
    Permission.VIEW_ISIBO,
    Permission.ASSIGN_HOUSE_REPRESENTATIVES,
    Permission.DEASSIGN_HOUSE_REPRESENTATIVES,
    Permission.VIEW_ISIBO_ANALYTICS,
    Permission.CREATE_HOUSE,
    Permission.UPDATE_HOUSE,
    Permission.DELETE_HOUSE,
    Permission.ADD_CITIZENS,
    Permission.ASSIGN_CITIZENS_TO_HOUSE,
    Permission.VIEW_VILLAGE_ACTIVITY,
    Permission.ADD_TASK_REPORT,
    Permission.TAKE_ATTENDANCE,
  ],

  [UserRole.HOUSE_REPRESENTATIVE]: [
    // Global permissions
    Permission.VIEW_NOTIFICATIONS,
    Permission.VIEW_PROFILE,

    // House representative specific permissions
    Permission.VIEW_HOUSE,
  ],

  [UserRole.CITIZEN]: [
    // Global permissions
    Permission.VIEW_NOTIFICATIONS,
    Permission.VIEW_PROFILE,
  ],
};

// Helper function to check if a role has a specific permission
export function hasPermission(role: string, permission: Permission): boolean {
  const userRole = role.toUpperCase() as UserRole;

  if (!ROLE_PERMISSIONS[userRole]) {
    return false;
  }

  return ROLE_PERMISSIONS[userRole].includes(permission);
}

// Helper function to get all permissions for a role
export function getPermissionsForRole(role: string): Permission[] {
  const userRole = role.toUpperCase() as UserRole;

  if (!ROLE_PERMISSIONS[userRole]) {
    return [];
  }

  return ROLE_PERMISSIONS[userRole];
}
