import { menuConfig } from '@/config/menu'

export function filterMenuByRole(menuList, userRole) {
  if (!menuList || menuList.length === 0) {
    return []
  }
  
  return menuList
    .filter(item => {
      if (item.hidden) {
        return false
      }
      
      if (!item.roles || item.roles.length === 0) {
        return true
      }
      
      return item.roles.includes(userRole)
    })
    .map(item => {
      if (item.children && item.children.length > 0) {
        const filteredChildren = filterMenuByRole(item.children, userRole)
        return {
          ...item,
          children: filteredChildren
        }
      }
      return item
    })
    .filter(item => {
      if (item.children && item.children.length === 0) {
        return false
      }
      return true
    })
}

export function filterMenuByPermission(menuList, permissions, isSuperAdmin = false) {
  if (!menuList || menuList.length === 0) {
    return []
  }
  
  if (isSuperAdmin) {
    return menuList
  }
  
  return menuList
    .filter(item => {
      if (item.hidden) {
        return false
      }
      
      if (!item.permissions || item.permissions.length === 0) {
        return true
      }
      
      return item.permissions.some(perm => permissions.includes(perm))
    })
    .map(item => {
      if (item.children && item.children.length > 0) {
        const filteredChildren = filterMenuByPermission(item.children, permissions, isSuperAdmin)
        return {
          ...item,
          children: filteredChildren
        }
      }
      return item
    })
    .filter(item => {
      if (item.children && item.children.length === 0) {
        return false
      }
      return true
    })
}

export function filterMenu(menuList, userRole, permissions, isSuperAdmin = false) {
  let result = filterMenuByRole(menuList, userRole)
  result = filterMenuByPermission(result, permissions, isSuperAdmin)
  return result
}

export function getFilteredMenu(userRole, permissions, isSuperAdmin = false) {
  return filterMenu(menuConfig, userRole, permissions, isSuperAdmin)
}

export function generateBreadcrumbs(route, fullRouteConfig = []) {
  const breadcrumbs = []
  
  const pathSegments = route.path.split('/').filter(segment => segment)
  
  let currentPath = ''
  const menuConfigList = fullRouteConfig.length > 0 ? fullRouteConfig : menuConfig
  
  breadcrumbs.push({
    path: '/',
    title: '首页/仪表盘',
    icon: 'HomeFilled'
  })
  
  if (route.path === '/') {
    return breadcrumbs
  }
  
  const findMenuItem = (menus, path) => {
    for (const menu of menus) {
      if (menu.path === path) {
        return menu
      }
      if (menu.children && menu.children.length > 0) {
        const found = findMenuItem(menu.children, path)
        if (found) {
          return found
        }
      }
    }
    return null
  }
  
  for (let i = 0; i < pathSegments.length; i++) {
    currentPath += '/' + pathSegments[i]
    
    const menuItem = findMenuItem(menuConfigList, currentPath)
    
    if (menuItem) {
      breadcrumbs.push({
        path: menuItem.path,
        title: menuItem.title,
        icon: menuItem.icon
      })
    } else if (route.meta && route.meta.title) {
      const isParamRoute = currentPath.includes(':')
      if (!isParamRoute) {
        breadcrumbs.push({
          path: currentPath,
          title: route.meta.title,
          icon: route.meta.icon
        })
      }
    }
  }
  
  if (route.meta && route.meta.title && breadcrumbs.length > 0) {
    const lastCrumb = breadcrumbs[breadcrumbs.length - 1]
    if (lastCrumb.title !== route.meta.title) {
      breadcrumbs.push({
        path: route.path,
        title: route.meta.title,
        icon: route.meta.icon
      })
    }
  }
  
  return breadcrumbs
}

export function flattenMenu(menuList) {
  const result = []
  
  const flatten = (menus) => {
    for (const menu of menus) {
      result.push(menu)
      if (menu.children && menu.children.length > 0) {
        flatten(menu.children)
      }
    }
  }
  
  flatten(menuList)
  return result
}

export function findMenuByPath(path, menuList = menuConfig) {
  for (const menu of menuList) {
    if (menu.path === path) {
      return menu
    }
    if (menu.children && menu.children.length > 0) {
      const found = findMenuByPath(path, menu.children)
      if (found) {
        return found
      }
    }
  }
  return null
}

export function getParentMenus(path, menuList = menuConfig, parents = []) {
  for (const menu of menuList) {
    if (menu.path === path) {
      return parents
    }
    if (menu.children && menu.children.length > 0) {
      const found = getParentMenus(path, menu.children, [...parents, menu])
      if (found) {
        return found
      }
    }
  }
  return null
}

export function getDefaultActiveIndex(route, menuList) {
  const path = route.path
  const flattened = flattenMenu(menuList)
  
  for (const item of flattened) {
    if (item.path === path) {
      return item.path
    }
  }
  
  for (const item of flattened) {
    if (path.startsWith(item.path) && item.path !== '/') {
      return item.path
    }
  }
  
  return '/'
}

export function getOpenedMenus(route, menuList) {
  const parents = getParentMenus(route.path, menuList)
  if (parents) {
    return parents.map(p => p.path)
  }
  
  const pathSegments = route.path.split('/').filter(s => s)
  if (pathSegments.length > 0) {
    const firstLevelPath = '/' + pathSegments[0]
    const menuItem = findMenuByPath(firstLevelPath, menuList)
    if (menuItem && menuItem.children && menuItem.children.length > 0) {
      return [firstLevelPath]
    }
  }
  
  return []
}

export default {
  filterMenuByRole,
  filterMenuByPermission,
  filterMenu,
  getFilteredMenu,
  generateBreadcrumbs,
  flattenMenu,
  findMenuByPath,
  getParentMenus,
  getDefaultActiveIndex,
  getOpenedMenus
}
