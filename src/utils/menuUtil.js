// utils/menuUtil.js
export const transformMenuToRoutes = (menuList) => {
  // Convert snake_case to camelCase and build hierarchy
  const transformedMenus = menuList.map(menu => ({
    menuId: menu.menu_id,
    parentId: menu.parent_id,
    name: menu.name,
    url: menu.url,
    perms: menu.perms,
    type: menu.type, // 0: directory, 1: menu, 2: button
    icon: menu.icon,
    orderNum: menu.order_num
  }));

  // Build tree structure
  const menuTree = buildMenuTree(transformedMenus);
  return menuTree;
};

const buildMenuTree = (menus) => {
  const menuMap = {};
  const roots = [];

  // Create map of all menus
  menus.forEach(menu => {
    menu.children = [];
    menuMap[menu.menuId] = menu;
  });

  // Build parent-child relationships
  menus.forEach(menu => {
    if (menu.parentId === 0) {
      roots.push(menu);
    } else {
      const parent = menuMap[menu.parentId];
      if (parent) {
        parent.children.push(menu);
      }
    }
  });

  return roots;
};