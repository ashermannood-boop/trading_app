import express from 'express';
import {
  getAddresses,
  createAddress,
  createBulkAddresses,
  updateAddress,
  getSpecificAddress,
  deleteAddress
} from '../controllers/depositAddressController.js';

const depositAddressRouter = express.Router();

// GET all addresses
depositAddressRouter.get('/addresses', getAddresses);

// POST create new address (coin or network)
depositAddressRouter.post('/addresses', createAddress);

// POST create multiple addresses
depositAddressRouter.post('/addresses/bulk', createBulkAddresses);

// PUT update an existing address
depositAddressRouter.put('/addresses', updateAddress);

// GET specific address by coin and network
depositAddressRouter.get('/addresses/:coin/:network', getSpecificAddress);

// DELETE specific address by coin and network
depositAddressRouter.delete('/addresses/:coin/:network', deleteAddress);

export default depositAddressRouter;