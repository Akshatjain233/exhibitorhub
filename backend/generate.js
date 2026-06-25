const fs = require('fs');
const path = require('path');

const models = [
  { name: 'Exhibitor', route: 'exhibitors', role: 'visitor' },
  { name: 'Product', route: 'products', role: 'visitor' },
  { name: 'Session', route: 'sessions', role: 'visitor' },
  { name: 'Gallery', route: 'gallery', role: 'visitor' },
  { name: 'Document', route: 'documents', role: 'visitor' },
  { name: 'Exhibition', route: 'exhibitions', role: 'exhibition_admin' },
  { name: 'Sponsor', route: 'sponsors', role: 'exhibition_admin' },
  { name: 'Announcement', route: 'announcements', role: 'exhibition_admin' },
  { name: 'Organizer', route: 'organizers', role: 'super_admin' },
  { name: 'PlatformSetting', route: 'platform-settings', role: 'super_admin' }
];

const write = (filepath, content) => fs.writeFileSync(path.join(__dirname, filepath), content);

models.forEach(({ name, route }) => {
  const lowerName = name.toLowerCase();
  
  // Repository
  write(`src/repositories/${lowerName}Repository.js`, `
const ${name} = require('../models/${name}');
class ${name}Repository {
  async findAll(query = {}) { return await ${name}.find(query); }
  async findById(id) { return await ${name}.findById(id); }
  async create(data) { return await ${name}.create(data); }
  async update(id, data) { return await ${name}.findByIdAndUpdate(id, data, { new: true }); }
  async delete(id) { return await ${name}.findByIdAndDelete(id); }
}
module.exports = new ${name}Repository();
  `.trim());

  // Service
  write(`src/services/${lowerName}Service.js`, `
const ${lowerName}Repository = require('../repositories/${lowerName}Repository');
class ${name}Service {
  async getAll(query) { return await ${lowerName}Repository.findAll(query); }
  async getById(id) { return await ${lowerName}Repository.findById(id); }
  async create(data) { return await ${lowerName}Repository.create(data); }
  async update(id, data) { return await ${lowerName}Repository.update(id, data); }
  async delete(id) { return await ${lowerName}Repository.delete(id); }
}
module.exports = new ${name}Service();
  `.trim());

  // Controller
  write(`src/controllers/${lowerName}Controller.js`, `
const ${lowerName}Service = require('../services/${lowerName}Service');
const { successResponse } = require('../utils/response');

exports.getAll = async (req, res, next) => {
  try {
    const data = await ${lowerName}Service.getAll(req.query);
    return successResponse(res, 200, '${name}s retrieved successfully', data);
  } catch (error) { next(error); }
};

exports.getById = async (req, res, next) => {
  try {
    const data = await ${lowerName}Service.getById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    return successResponse(res, 200, '${name} retrieved successfully', data);
  } catch (error) { next(error); }
};

exports.create = async (req, res, next) => {
  try {
    const data = await ${lowerName}Service.create(req.body);
    return successResponse(res, 201, '${name} created successfully', data);
  } catch (error) { next(error); }
};

exports.update = async (req, res, next) => {
  try {
    const data = await ${lowerName}Service.update(req.params.id, req.body);
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    return successResponse(res, 200, '${name} updated successfully', data);
  } catch (error) { next(error); }
};

exports.delete = async (req, res, next) => {
  try {
    const data = await ${lowerName}Service.delete(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    return successResponse(res, 200, '${name} deleted successfully', null);
  } catch (error) { next(error); }
};
  `.trim());

  // Route
  write(`src/routes/${lowerName}Routes.js`, `
const express = require('express');
const router = express.Router();
const controller = require('../controllers/${lowerName}Controller');
// Note: Auth/Role middleware to be injected here later
router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);
module.exports = router;
  `.trim());
});

console.log('Clean Architecture Boilerplate Generated!');
