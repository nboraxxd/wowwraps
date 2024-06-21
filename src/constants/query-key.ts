export const QueryKey = {
  // Auth API
  login: 'login',
  logout: 'logout',
  refreshToken: 'refreshToken',

  // Media API
  uploadImage: 'uploadImage',

  // Account API
  getMe: 'getMe',
  updateMe: 'updateMe',
  changePassword: 'changePassword',
  getEmployees: 'getEmployees',
  addEmployee: 'addEmployee',
  getEmployee: 'getEmployee',
  updateEmployee: 'updateEmployee',
  deleteEmployee: 'deleteEmployee',

  // Dish API
  getDishes: 'getDishes',
  getDish: 'getDish',
  addDish: 'addDish',
  updateDish: 'updateDish',
  deleteDish: 'deleteDish',

  // Table API
  getTables: 'getTables',
  getTable: 'getTable',
  addTable: 'addTable',
  updateTable: 'updateTable',
  deleteTable: 'deleteTable',
} as const
