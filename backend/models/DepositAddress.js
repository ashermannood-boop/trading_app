import mongoose from 'mongoose';

// Dynamic schema that allows flexible structure for coins and networks
const depositAddressSchema = new mongoose.Schema({
  // Using Mixed type to allow dynamic nested structure
  addresses: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  strict: false // Allow dynamic fields
});

// Ensure only one document exists
depositAddressSchema.statics.getSingleton = async function() {
  const singleton = await this.findOne();
  if (singleton) {
    return singleton;
  }
  // Create default document if none exists
  return this.create({ addresses: {} });
};

// Method to update or create address
depositAddressSchema.methods.updateAddress = async function(coin, network, address) {
  if (!this.addresses) {
    this.addresses = {};
  }
  
  // Initialize coin object if it doesn't exist
  if (!this.addresses[coin]) {
    this.addresses[coin] = {};
  }
  
  // Update or create the network address
  this.addresses[coin][network] = address;
  
  return this.save();
};

const DepositAddress = mongoose.model('DepositAddress', depositAddressSchema);

export default DepositAddress;