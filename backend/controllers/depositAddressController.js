import DepositAddress from '../models/DepositAddress.js';

// @desc    Get all deposit addresses
// @route   GET /api/addresses
// @access  Public
export const getAddresses = async (req, res) => {
  try {
    const depositAddress = await DepositAddress.getSingleton();
    
    res.status(200).json({
      success: true,
      data: depositAddress.addresses || {}
    });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error: Unable to fetch deposit addresses'
    });
  }
};

// @desc    Create a new coin or network
// @route   POST /api/addresses
// @access  Public
export const createAddress = async (req, res) => {
  try {
    const { coin, network, address } = req.body;

    // Validate required fields
    if (!coin || !network || !address) {
      return res.status(400).json({
        success: false,
        error: 'Please provide coin, network, and address'
      });
    }

    // Validate address is a string
    if (typeof address !== 'string' || address.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Address must be a non-empty string'
      });
    }

    // Get or create singleton document
    const depositAddress = await DepositAddress.getSingleton();
    
    // Format coin and network (capitalize first letter)
    const formattedCoin = coin.charAt(0).toUpperCase() + coin.slice(1).toLowerCase();
    const formattedNetwork = network.charAt(0).toUpperCase() + network.slice(1).toLowerCase();
    
    // Check if coin exists
    if (!depositAddress.addresses[formattedCoin]) {
      // Create new coin with network
      depositAddress.addresses[formattedCoin] = {
        [formattedNetwork]: address
      };
      
      await depositAddress.save();
      
      return res.status(201).json({
        success: true,
        message: `New coin '${formattedCoin}' created with network '${formattedNetwork}'`,
        data: {
          [formattedCoin]: {
            [formattedNetwork]: address
          }
        }
      });
    }
    
    // Check if network exists within existing coin
    if (depositAddress.addresses[formattedCoin][formattedNetwork]) {
      return res.status(409).json({
        success: false,
        error: `Network '${formattedNetwork}' already exists for coin '${formattedCoin}'. Use PUT to update.`
      });
    }
    
    // Create new network for existing coin
    depositAddress.addresses[formattedCoin][formattedNetwork] = address;
    await depositAddress.save();
    
    res.status(201).json({
      success: true,
      message: `New network '${formattedNetwork}' created for coin '${formattedCoin}'`,
      data: {
        [formattedCoin]: {
          [formattedNetwork]: address
        }
      }
    });

  } catch (error) {
    console.error('Error creating address:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error: Unable to create deposit address'
    });
  }
};

// @desc    Create multiple addresses in one request
// @route   POST /api/addresses/bulk
// @access  Public
export const createBulkAddresses = async (req, res) => {
  try {
    const { addresses } = req.body;

    if (!addresses || typeof addresses !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Please provide an addresses object'
      });
    }

    // Get or create singleton document
    const depositAddress = await DepositAddress.getSingleton();
    
    const created = [];
    const skipped = [];

    // Process each coin
    for (const [coin, networks] of Object.entries(addresses)) {
      const formattedCoin = coin.charAt(0).toUpperCase() + coin.slice(1).toLowerCase();
      
      // Initialize coin if it doesn't exist
      if (!depositAddress.addresses[formattedCoin]) {
        depositAddress.addresses[formattedCoin] = {};
      }
      
      // Process each network for this coin
      for (const [network, address] of Object.entries(networks)) {
        const formattedNetwork = network.charAt(0).toUpperCase() + network.slice(1).toLowerCase();
        
        // Only create if network doesn't exist
        if (!depositAddress.addresses[formattedCoin][formattedNetwork]) {
          depositAddress.addresses[formattedCoin][formattedNetwork] = address;
          created.push({ coin: formattedCoin, network: formattedNetwork });
        } else {
          skipped.push({ coin: formattedCoin, network: formattedNetwork });
        }
      }
    }
    
    await depositAddress.save();
    
    res.status(201).json({
      success: true,
      message: `Created ${created.length} new addresses, skipped ${skipped.length} existing ones`,
      data: {
        created,
        skipped,
        addresses: depositAddress.addresses
      }
    });

  } catch (error) {
    console.error('Error creating bulk addresses:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error: Unable to create bulk addresses'
    });
  }
};

// @desc    Update a single address
// @route   PUT /api/addresses
// @access  Public
export const updateAddress = async (req, res) => {
  try {
    const { coin, network, address } = req.body;

    // Validate required fields
    if (!coin || !network || !address) {
      return res.status(400).json({
        success: false,
        error: 'Please provide coin, network, and address'
      });
    }

    // Validate address is a string
    if (typeof address !== 'string' || address.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Address must be a non-empty string'
      });
    }

    // Get or create singleton document
    const depositAddress = await DepositAddress.getSingleton();
    
    // Format coin and network (capitalize first letter)
    const formattedCoin = coin.charAt(0).toUpperCase() + coin.slice(1).toLowerCase();
    const formattedNetwork = network.charAt(0).toUpperCase() + network.slice(1).toLowerCase();
    
    // Check if coin exists
    if (!depositAddress.addresses[formattedCoin]) {
      return res.status(404).json({
        success: false,
        error: `Coin '${formattedCoin}' not found. Use POST to create it first.`
      });
    }
    
    // Check if network exists
    if (!depositAddress.addresses[formattedCoin][formattedNetwork]) {
      return res.status(404).json({
        success: false,
        error: `Network '${formattedNetwork}' not found for coin '${formattedCoin}'. Use POST to create it first.`
      });
    }
    
    // Update the existing address
    depositAddress.addresses[formattedCoin][formattedNetwork] = address;
    await depositAddress.save();

    res.status(200).json({
      success: true,
      message: `Address updated successfully for ${formattedCoin} - ${formattedNetwork}`,
      data: {
        [formattedCoin]: {
          [formattedNetwork]: address
        }
      }
    });

  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error: Unable to update deposit address'
    });
  }
};

// @desc    Get specific address by coin and network
// @route   GET /api/addresses/:coin/:network
// @access  Public
export const getSpecificAddress = async (req, res) => {
  try {
    const { coin, network } = req.params;
    
    if (!coin || !network) {
      return res.status(400).json({
        success: false,
        error: 'Please provide both coin and network'
      });
    }

    const depositAddress = await DepositAddress.getSingleton();
    
    const formattedCoin = coin.charAt(0).toUpperCase() + coin.slice(1).toLowerCase();
    const formattedNetwork = network.charAt(0).toUpperCase() + network.slice(1).toLowerCase();
    
    const address = depositAddress.addresses?.[formattedCoin]?.[formattedNetwork];

    if (!address) {
      return res.status(404).json({
        success: false,
        error: `Address not found for ${formattedCoin} - ${formattedNetwork}`
      });
    }

    res.status(200).json({
      success: true,
      data: {
        [formattedCoin]: {
          [formattedNetwork]: address
        }
      }
    });

  } catch (error) {
    console.error('Error fetching specific address:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error: Unable to fetch deposit address'
    });
  }
};

// @desc    Delete a specific address
// @route   DELETE /api/addresses/:coin/:network
// @access  Public
export const deleteAddress = async (req, res) => {
  try {
    const { coin, network } = req.params;
    
    if (!coin || !network) {
      return res.status(400).json({
        success: false,
        error: 'Please provide both coin and network'
      });
    }

    const depositAddress = await DepositAddress.getSingleton();
    
    const formattedCoin = coin.charAt(0).toUpperCase() + coin.slice(1).toLowerCase();
    const formattedNetwork = network.charAt(0).toUpperCase() + network.slice(1).toLowerCase();
    
    // Check if coin exists
    if (!depositAddress.addresses[formattedCoin]) {
      return res.status(404).json({
        success: false,
        error: `Coin '${formattedCoin}' not found`
      });
    }
    
    // Check if network exists
    if (!depositAddress.addresses[formattedCoin][formattedNetwork]) {
      return res.status(404).json({
        success: false,
        error: `Network '${formattedNetwork}' not found for coin '${formattedCoin}'`
      });
    }
    
    // Delete the network
    delete depositAddress.addresses[formattedCoin][formattedNetwork];
    
    // If coin has no more networks, delete the coin
    if (Object.keys(depositAddress.addresses[formattedCoin]).length === 0) {
      delete depositAddress.addresses[formattedCoin];
    }
    
    await depositAddress.save();

    res.status(200).json({
      success: true,
      message: `Address deleted successfully for ${formattedCoin} - ${formattedNetwork}`
    });

  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error: Unable to delete deposit address'
    });
  }
};