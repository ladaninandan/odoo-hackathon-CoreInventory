const Category = require('../models/Category');
const Warehouse = require('../models/Warehouse');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// ── Categories ────────────────────────────────────
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    return sendSuccess(res, 200, 'Categories retrieved', { categories });
  } catch (error) {
    next(error);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const category = await Category.create(req.body);
    return sendSuccess(res, 201, 'Category created', { category });
  } catch (error) {
    next(error);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!category) return sendError(res, 404, 'Category not found');
    return sendSuccess(res, 200, 'Category updated', { category });
  } catch (error) {
    next(error);
  }
};

// ── Warehouses ────────────────────────────────────
exports.getWarehouses = async (req, res, next) => {
  try {
    const warehouses = await Warehouse.find().sort({ name: 1 });
    return sendSuccess(res, 200, 'Warehouses retrieved', { warehouses });
  } catch (error) {
    next(error);
  }
};

exports.createWarehouse = async (req, res, next) => {
  try {
    const warehouse = await Warehouse.create(req.body);
    return sendSuccess(res, 201, 'Warehouse created', { warehouse });
  } catch (error) {
    next(error);
  }
};

exports.updateWarehouse = async (req, res, next) => {
  try {
    const warehouse = await Warehouse.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!warehouse) return sendError(res, 404, 'Warehouse not found');
    return sendSuccess(res, 200, 'Warehouse updated', { warehouse });
  } catch (error) {
    next(error);
  }
};

// ── Users (manager only) ──────────────────────────
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password -otpCode -otpExpiry').sort({ createdAt: -1 });
    return sendSuccess(res, 200, 'Users retrieved', { users });
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { name, role, isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, role, isActive },
      { new: true, runValidators: true }
    ).select('-password -otpCode -otpExpiry');

    if (!user) return sendError(res, 404, 'User not found');
    return sendSuccess(res, 200, 'User updated', { user });
  } catch (error) {
    next(error);
  }
};
