const mongoose = require('mongoose');
const User = require('../models/userModel');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ status: 'success', data: { users } });
  } catch (err) {
    res.status(404).json({ status: 'fail', message: err });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.status(200).json({ status: 'success', data: { user } });
  } catch (err) {
    res.status(404).json({ status: 'fail', message: err });
  }
};
exports.createUser = async (req, res) => {
  try {
    const users = await User.create(req.body);
    res.status(201).json({ status: 'success', data: { users } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err });
  }
};
exports.updateUser = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      runValidators: true,
      new: true,
    });
    res.status(200).json({ status: 'success', data: { updatedUser } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err });
  }
};
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err });
  }
};
