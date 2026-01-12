import dayjs from 'dayjs';

// Initial Data
const INITIAL_USERS = [
  {
    userId: 1,
    userName: 'admin',
    password: 'password', // In real app, hash this
    realName: 'Administrator',
    email: 'admin@example.com',
    mobile: '13800138000',
    status: 1,
    roleId: 1, // Simplified: one role per user for demo
    createTime: '2023-01-01 00:00:00',
  },
  {
    userId: 2,
    userName: 'user',
    password: 'password',
    realName: 'Regular User',
    email: 'user@example.com',
    mobile: '13900139000',
    status: 1,
    roleId: 2,
    createTime: '2023-01-02 00:00:00',
  },
];

const INITIAL_ROLES = [
  {
    roleId: 1,
    roleName: 'Admin',
    roleDesc: 'Super Administrator',
    status: 1,
    menuIds: [1, 2, 3, 4, 5], // Access all
    createTime: '2023-01-01 00:00:00',
  },
  {
    roleId: 2,
    roleName: 'Editor',
    roleDesc: 'Content Editor',
    status: 1,
    menuIds: [1], // Only Dashboard
    createTime: '2023-01-02 00:00:00',
  },
];

const INITIAL_MENUS = [
  {
    menuId: 1,
    parentId: 0,
    name: 'Dashboard',
    url: '/dashboard',
    perms: '',
    type: 1, // 0: Catalog, 1: Menu, 2: Button
    icon: 'DashboardOutlined',
    orderNum: 1,
  },
  {
    menuId: 2,
    parentId: 0,
    name: 'System Management',
    url: '/system',
    perms: 'system:list',
    type: 0,
    icon: 'SettingOutlined',
    orderNum: 2,
  },
  {
    menuId: 3,
    parentId: 2,
    name: 'User Management',
    url: '/system/user',
    perms: 'user:list',
    type: 1,
    icon: 'UserOutlined',
    orderNum: 1,
  },
  {
    menuId: 4,
    parentId: 2,
    name: 'Role Management',
    url: '/system/role',
    perms: 'role:list',
    type: 1,
    icon: 'TeamOutlined',
    orderNum: 2,
  },
  {
    menuId: 5,
    parentId: 2,
    name: 'Menu Management',
    url: '/system/menu',
    perms: 'menu:list',
    type: 1,
    icon: 'MenuOutlined',
    orderNum: 3,
  },
];

// Helper to load/save to localStorage
const load = (key, initial) => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : initial;
};

const save = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Database simulation
let db = {
  users: load('sys_users', INITIAL_USERS),
  roles: load('sys_roles', INITIAL_ROLES),
  menus: load('sys_menus', INITIAL_MENUS),
};

const persist = () => {
  save('sys_users', db.users);
  save('sys_roles', db.roles);
  save('sys_menus', db.menus);
};

// Mock API delay
const delayvb = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockApi = {
  login: async (username, password) => {
    await delayvb();
    const user = db.users.find((u) => u.username === username && u.password === password);
    if (user) {
      if (user.status === 0) throw new Error('Account is disabled');
      return { ...user, token: 'mock-token-' + user.userId };
    }
    throw new Error('Invalid username or password');
  },

  getUserInfo: async (token) => {
    await delayvb(200);
    // Extract userId from mock token
    const userId = parseInt(token.split('-')[2]);
    const user = db.users.find((u) => u.userId === userId);
    if (!user) throw new Error('Invalid token');
    
    const role = db.roles.find(r => r.roleId === user.roleId);
    return { ...user, role };
  },

  getMenus: async () => {
    await delayvb(200);
    return [...db.menus];
  },

  // User CRUD
  getUsers: async () => {
    await delayvb();
    return db.users.map(u => ({
      ...u, 
      roleName: db.roles.find(r => r.roleId === u.roleId)?.roleName || 'N/A'
    }));
  },
  saveUser: async (user) => {
    await delayvb();
    if (user.userId) {
      const idx = db.users.findIndex(u => u.userId === user.userId);
      db.users[idx] = { ...db.users[idx], ...user };
    } else {
      const newUser = {
        ...user,
        userId: Date.now(),
        createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        status: 1
      };
      db.users.push(newUser);
    }
    persist();
    return true;
  },
  deleteUser: async (id) => {
    await delayvb();
    db.users = db.users.filter(u => u.userId !== id);
    persist();
    return true;
  },

  // Role CRUD
  getRoles: async () => {
    await delayvb();
    return [...db.roles];
  },
  saveRole: async (role) => {
    await delayvb();
    if (role.roleId) {
      const idx = db.roles.findIndex(r => r.roleId === role.roleId);
      db.roles[idx] = { ...db.roles[idx], ...role };
    } else {
      const newRole = {
        ...role,
        roleId: Date.now(),
        createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        status: 1
      };
      db.roles.push(newRole);
    }
    persist();
    return true;
  },
  deleteRole: async (id) => {
    await delayvb();
    db.roles = db.roles.filter(r => r.roleId !== id);
    persist();
    return true;
  },

  // Menu CRUD
  getMenuTree: async () => {
    await delayvb();
    // Convert flat list to tree
    const buildTree = (items, parentId = 0) => {
      return items
        .filter(item => item.parentId === parentId)
        .map(item => ({
          ...item,
          key: item.menuId,
          title: item.name,
          children: buildTree(items, item.menuId)
        }));
    };
    return buildTree(db.menus);
  },
  saveMenu: async (menu) => {
    await delayvb();
    if (menu.menuId) {
      const idx = db.menus.findIndex(m => m.menuId === menu.menuId);
      db.menus[idx] = { ...db.menus[idx], ...menu };
    } else {
      const newMenu = {
        ...menu,
        menuId: Date.now(),
        orderNum: menu.orderNum || 0
      };
      db.menus.push(newMenu);
    }
    persist();
    return true;
  },
  deleteMenu: async (id) => {
    await delayvb();
    // Simple delete (cascade delete in real app)
    db.menus = db.menus.filter(m => m.menuId !== id && m.parentId !== id);
    persist();
    return true;
  }
};
