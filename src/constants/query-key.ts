export const QueryKey = {
  // Auth API
  login: 'login',
  logout: 'logout',
  refreshToken: 'refreshToken',

  // Account API
  getMe: 'getMe',
  updateMe: 'updateMe',
  changePassword: 'changePassword',
  getEmployees: 'getEmployees',
  addEmployee: 'addEmployee',
  getEmployee: 'getEmployee',
  updateEmployee: 'updateEmployee',
  deleteEmployee: 'deleteEmployee',

  // Media API
  uploadImage: 'uploadImage',
} as const
