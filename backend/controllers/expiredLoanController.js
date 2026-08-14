import mongoose from "mongoose";
import Loan from "../models/Loan.js";
import Notification from "../models/Notification.js";
import userModel from "../models/usermodel.js";

// Send email notification helper
const sendEmailNotification = async (to, subject, text) => {
  try {
    // console.log(`[EMAIL] To: ${to}, Subject: ${subject}, Text: ${text}`);
    // Implement your email service here
    return true;
  } catch (error) {
    console.error("Error sending email notification:", error);
    return false;
  }
};

// Send loan default notification
export const sendLoanDefaultNotification = async (userId, loan, daysOverdue) => {
  try {
    const user = await userModel.findById(userId);
    if (!user) return null;

    const notification = new Notification({
      user: userId,
      title: "Loan Defaulted",
      message: `Your loan ${loan.loanId} has been marked as defaulted. It is ${daysOverdue} days overdue. Please pay 
      your loan  to avoid account restrictions.`,
      type: "loan",
      priority: "high",
      status: "unread",
      relatedTo: {
        modelType: "Loan",
        modelId: loan._id
      },
      actions: [
        {
          label: "pay Now",
          url: `/loan-payment`,
          method: "GET",
          style: "primary"
        },
      ],
      icon: "security",
      color: "danger",
     
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });

    await notification.save();

    // Send email
    /*
    
      await sendEmailNotification(
        user.email,
        "Loan Default Notice",
        `Your loan ${loan.loanId} has been marked as defaulted. Amount: ${loan.remainingBalance} ${loan.currency}. Days overdue: ${daysOverdue}.`
      );
    */

    return notification;
  } catch (error) {
    console.error(`Error sending default notification for loan ${loan.loanId}:`, error);
    return null;
  }
};

// Send overdue warning notification
export const sendOverdueWarningNotification = async (userId, loan, daysOverdue) => {
  try {
    const notification = new Notification({
      user: userId,
      title: "Loan Payment Overdue",
      message: `Your loan payment for ${loan.loanId} is ${daysOverdue} days overdue. Please make payment immediately to avoid penalties.`,
      type: "loan",
      priority: "high",
      status: "unread",
      relatedTo: {
        modelType: "Loan",
        modelId: loan._id
      },
      actions: [
        {
          label: "Make Payment",
          url: `/loan-payment`,
          method: "GET",
          style: "primary"
        },
      ],
      icon: "system",
      color: "warning",
   
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error(`Error sending warning notification for loan ${loan.loanId}:`, error);
    return null;
  }
};

// Block user for severe default (9+ days overdue)
export const blockUserForDefaultedLoan = async (userId, loan, daysOverdue) => {
  try {
    // Block the user account
    const blockedUser = await userModel.findByIdAndUpdate(
      userId,
      {
        isBlocked: true,
        loanStatus: "overdue",
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!blockedUser) {
      throw new Error(`User ${userId} not found`);
    }

    // Create notification about account block
    const blockNotification = new Notification({
      user: userId,
      title: "Account Blocked",
      message: `Your account has been blocked due to defaulted loan (${loan.loanId}). The loan is ${daysOverdue} days overdue. Contact support to resolve this issue.`,
      type: "account",
      priority: "urgent",
      status: "unread",
      relatedTo: {
        modelType: "User",
        modelId: userId
      },
      actions: [
        {
         label: "Make Payment",
          url: `/loan-payment`,
          method: "GET",
          style: "primary"
        }
      ],
      icon: "security",
      color: "danger",
   
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
    });

    await blockNotification.save();

    // Send email notification
   /*
    await sendEmailNotification(
      blockedUser.email,
      "Account Blocked Due to Defaulted Loan",
      `Your account has been blocked because loan ${loan.loanId} is ${daysOverdue} days overdue. Please contact our support team immediately.`
    );
   */

    return {
      userId: userId,
      loanId: loan.loanId,
      blockedAt: new Date(),
      daysOverdue: daysOverdue
    };
  } catch (error) {
    console.error(`Error blocking user ${userId} for loan ${loan.loanId}:`, error);
    return null;
  }
};

// Update user's loan status based on their loans
export const updateUserLoanStatus = async (userId) => {
  try {
    const userLoans = await Loan.find({ userId });

    let loanStatus = "no_active_loan";
    let hasOverdue = false;
    let hasActive = false;

    for (const loan of userLoans) {
      if (loan.status === "active" && loan.remainingBalance > 0) {
        hasActive = true;
        if (loan.isOverdue) {
          hasOverdue = true;
        }
      }
    }

    if (hasOverdue) {
      loanStatus = "overdue";
    } else if (hasActive) {
      loanStatus = "active";
    }

    await userModel.findByIdAndUpdate(userId, { loanStatus });
    return loanStatus;
  } catch (error) {
    console.error(`Error updating loan status for user ${userId}:`, error);
    throw error;
  }
};

// Main function to check and update expired loans
export const checkExpiredLoans = async () => {
  try {
    const now = new Date();
    const results = {
      markedDefaulted: [],
      notificationsSent: [],
      usersBlocked: [],
      warningsSent: []
    };

    // Find all loans that are overdue but not yet defaulted

   
    const overdueLoans = await Loan.find({
      status: "approved",
      dueDate: { $lt: now },
      remainingBalance: { $gt: 0 }
    });

    console.log(`Found ${overdueLoans.length} overdue loans to process`);


    if (overdueLoans.length === 0) {
      return {
        message: "No overdue loans found",
        count: 0,
        results
      };
    }

    // Process each overdue loan
    for (const loan of overdueLoans) {
      const daysOverdue = Math.floor((now - loan.dueDate) / (1000 * 60));

      console.log('daysOverdue:', (now - loan.dueDate)/(1000 * 60 * 60 * 24))
      console.log('min :', (now - loan.dueDate)/(1000 * 60));
      console.log(`Processing loan ${loan.loanId}: ${daysOverdue} days overdue`);

      // Mark as defaulted if 3+ days overdue  for i use this feature to test the defaulting process without waiting for 9 days. In production, this threshold would be set to 9 days or more.

    //  daysOverdue >= 3
      if (true) {
        // Mark as defaulted
        const updatedLoan = await Loan.findByIdAndUpdate(
          loan._id,
          {
            status: "defaulted",
            isOverdue: true,
            daysOverdue: daysOverdue,
            updatedAt: now
          },
          { new: true }
        );

        results.markedDefaulted.push(updatedLoan.loanId);

        // Send default notification
        const defaultNotification = await sendLoanDefaultNotification(
          loan.userId,
          loan,
          daysOverdue
        );

        if (defaultNotification && false) {
          results.notificationsSent.push({
            type: "default",
            loanId: loan.loanId,
            userId: loan.userId
          });
        }

        // Block user if 9+ days overdue
        if (daysOverdue >= 9 && false) {
          const blockResult = await blockUserForDefaultedLoan(
            loan.userId,
            loan,
            daysOverdue
          );

          if (blockResult) {
            results.usersBlocked.push({
              userId: loan.userId,
              loanId: loan.loanId,
              daysOverdue: daysOverdue
            });
          }
        }
      }
      // Send warning if 1+ days overdue but less than 3
      else if (daysOverdue >= 1 && daysOverdue < 3) {
        await sendOverdueWarningNotification(loan.userId, loan, daysOverdue);

        results.warningsSent.push({
          loanId: loan.loanId,
          userId: loan.userId,
          daysOverdue: daysOverdue
        });
      }

      // Update overdue status for all overdue loans
      await Loan.findByIdAndUpdate(
        loan._id,
        {
          isOverdue: true,
          daysOverdue: daysOverdue,
          updatedAt: now
        }
      );
    }

    // Update user loan statuses
    const userIds = overdueLoans.map(loan => loan.userId);
    const uniqueUserIds = [...new Set(userIds.map(id => id.toString()))];

    for (const userId of uniqueUserIds) {
      await updateUserLoanStatus(userId);
    }

    return {
      message: `Processed ${overdueLoans.length} overdue loans`,
      count: overdueLoans.length,
      results,
      summary: {
        markedDefaulted: results.markedDefaulted.length,
        notificationsSent: results.notificationsSent.length,
        usersBlocked: results.usersBlocked.length,
        warningsSent: results.warningsSent.length
      }
    };
  } catch (error) {
    console.error("Error checking expired loans:", error);
    throw new Error("Failed to process expired loans");
  }
};

// Update overdue status for all loans (daily update)
export const updateOverdueStatus = async () => {
  try {
    const now = new Date();

    // Update days overdue for active loans past due date
    const result = await Loan.updateMany(
      {
        status: "active",
        dueDate: { $lt: now },
        remainingBalance: { $gt: 0 }
      },
      [
        {
          $set: {
            isOverdue: true,
            daysOverdue: {
              $floor: {
                $divide: [
                  { $subtract: [now, "$dueDate"] },
                  1000 * 60 * 60 * 24
                ]
              }
            },
            updatedAt: now
          }
        }
      ]
    );

    // Mark loans as defaulted if overdue beyond threshold (90 days)
    const defaultedResult = await Loan.updateMany(
      {
        status: "active",
        daysOverdue: { $gte: 9 },
        remainingBalance: { $gt: 0 }
      },
      {
        status: "defaulted",
        updatedAt: now
      }
    );

    return {
      message: "Overdue status updated",
      overdueUpdated: result.modifiedCount,
      defaultedUpdated: defaultedResult.modifiedCount,
      timestamp: now
    };
  } catch (error) {
    console.error("Error updating overdue status:", error);
    throw error;
  }
};

// Get all expired/defaulted loans for admin
export const getExpiredLoans = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      daysOverdueMin,
      daysOverdueMax,
      sortBy = "dueDate",
      sortOrder = "desc"
    } = req.query;

    console.log("Fetching expired loans with params:", req.query);

    const query = { status: "defaulted" };
// 
    if (daysOverdueMin || daysOverdueMax) {
      query.daysOverdue = {};
      if (daysOverdueMin) query.daysOverdue.$gte = parseInt(daysOverdueMin);
      if (daysOverdueMax) query.daysOverdue.$lte = parseInt(daysOverdueMax);
    }

    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const loans = await Loan.find(query)
      .sort(sort)
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
    const total = await Loan.countDocuments(query);
     
    const user = await userModel.findById(loans.userId).select("name email isBlocked loanStatus");
    console.log("Sample user data for first loan:", user);
    const loansWithUser = await Promise.all(loans.map(async (loan) => {
      const user = await userModel.findById(loan.userId).select("name email isBlocked loanStatus");
      return { ...loan.toObject(), user };
    }));


    res.status(200).json({
      success: true,
      data: loansWithUser || [],
   
    
      pagination: {
        total: total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error("Error fetching expired loans:", error);
    res.json({
      success: false,
      message: "Failed to fetch expired loans"
    });
  }
};

// Get statistics for expired/defaulted loans
export const getExpiredLoanStats = async (req, res) => {
  try {
    const stats = await Loan.aggregate([
      {
        $match: { status: "defaulted" }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          totalAmountDefaulted: { $sum: "$remainingBalance" },
          avgDaysOverdue: { $avg: "$daysOverdue" },
          maxDaysOverdue: { $max: "$daysOverdue" },
          minDaysOverdue: { $min: "$daysOverdue" }
        }
      },
      {
        $project: {
          _id: 0,
          count: 1,
          totalAmountDefaulted: 1,
          avgDaysOverdue: { $round: ["$avgDaysOverdue", 1] },
          maxDaysOverdue: 1,
          minDaysOverdue: 1
        }
      }
    ]);

    // Get distribution by days overdue
    const distribution = await Loan.aggregate([
      {
        $match: { status: "defaulted" }
      },
      {
        $bucket: {
          groupBy: "$daysOverdue",
          boundaries: [0, 30, 60, 90, 180, 365],
          default: "365+",
          output: {
            count: { $sum: 1 },
            totalAmount: { $sum: "$remainingBalance" }
          }
        }
      }
    ]);

    // Get blocked users count
    const blockedUsersCount = await userModel.countDocuments({
      isBlocked: true,
      loanStatus: "overdue"
    });

    res.status(200).json({
      success: true,
      data: {
        summary: stats[0] || {
          count: 0,
          totalAmountDefaulted: 0,
          avgDaysOverdue: 0,
          maxDaysOverdue: 0,
          minDaysOverdue: 0
        },
        distribution,
        blockedUsers: blockedUsersCount
      }
    });
  } catch (error) {
    console.error("Error fetching expired loan stats:", error);
    res.json({
      success: false,
      message: "Failed to fetch expired loan statistics"
    });
  }
};

// Unblock user and resolve defaulted loans
export const unblockUserAndResolveDefaults = async (req, res) => {
  try {
    const { userId, resolutionNote } = req.body;

    if (!userId || !resolutionNote) {
      return res.status(400).json({
        success: false,
        message: "User ID and resolution note are required"
      });
    }

    // Unblock user
    const user = await userModel.findByIdAndUpdate(
      userId,
      {
        isBlocked: false,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Update all defaulted loans for this user
    const defaultedLoans = await Loan.updateMany(
      {
        userId: userId,
        status: "defaulted",
        remainingBalance: { $gt: 0 }
      },
      {
        $set: {
          status: "active",
          reviewedBy: req.user._id,
          reviewNote: `Resolved by admin: ${resolutionNote}`,
          updatedAt: new Date()
        }
      }
    );

    // Create resolution notification
    const resolutionNotification = new Notification({
      user: userId,
      title: "Account Unblocked",
      message: `Your account has been unblocked. All defaulted loans have been resolved. Note: ${resolutionNote}`,
      type: "account",
      priority: "medium",
      status: "unread",
      icon: "kyc",
      color: "success",
      actions: [
      ]
    });

    await resolutionNotification.save();

    // Update user loan status
    await updateUserLoanStatus(userId);

    res.status(200).json({
      success: true,
      message: "User unblocked and defaulted loans resolved",
      data: {
        user: {
          id: user._id,
          email: user.email,
          isBlocked: user.isBlocked
        },
        loansUpdated: defaultedLoans.modifiedCount
      }
    });
  } catch (error) {
    console.error("Error unblocking user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to unblock user"
    });
  }
};

// Get expired loans with suggested actions
export const getExpiredLoansWithActions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status = "defaulted",
      includeBlockedUsers = false
    } = req.query;

    const query = { status };

    if (includeBlockedUsers === "true") {
      const blockedUsers = await userModel.find({ isBlocked: true }).select('_id');
      const blockedUserIds = blockedUsers.map(user => user._id);
      query.userId = { $in: blockedUserIds };
    }

    const loans = await Loan.find(query)
      .sort({ dueDate: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .populate("userId", "name email isBlocked loanStatus")
      .populate("reviewedBy", "name email");

    const total = await Loan.countDocuments(query);

    // Add action suggestions for each loan
    const loansWithActions = loans.map(loan => {
      const actions = [];

      if (loan.status === "defaulted") {
        if (loan.daysOverdue >= 90 && !loan.userId.isBlocked) {
          actions.push({
            label: "Block User",
            action: "block_user",
            reason: "Severe default (90+ days overdue)",
            priority: "high"
          });
        }

        actions.push({
          label: "Send Reminder",
          action: "send_reminder",
          reason: "Payment overdue",
          priority: "medium"
        });

        actions.push({
          label: "Contact User",
          action: "contact_user",
          reason: "Resolve default",
          priority: "medium"
        });
      }

      return {
        ...loan.toObject(),
        suggestedActions: actions
      };
    });

    res.status(200).json({
      success: true,
      data: loansWithActions,
      pagination: {
        total: total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error("Error fetching expired loans with actions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch expired loans"
    });
  }
};

// Send final warning before blocking (89 days overdue)
export const sendFinalWarningNotification = async (userId, loan) => {
  try {
    const user = await userModel.findById(userId);
    if (!user) return null;

    const notification = new Notification({
      user: userId,
      title: "FINAL WARNING: Account Block Imminent",
      message: `Your loan ${loan.loanId} is 89 days overdue. Your account will be blocked tomorrow if payment is not received. This is your final warning.`,
      type: "loan",
      priority: "high",
      status: "unread",
      relatedTo: {
        modelType: "Loan",
        modelId: loan._id
      },
      actions: [
        {
          label: "Payment Now",
          url: `/loan-payment`,
          method: "GET",
          style: "primary"
        },
      ],
      icon: "security",
      color: "danger",
      expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days
    });

    await notification.save();

    // Send email
   /*
    await sendEmailNotification(
      user.email,
      "FINAL WARNING: Account Block Imminent",
      `Your loan ${loan.loanId} is 89 days overdue. Your account will be blocked in 24 hours if payment is not received immediately.`
    );
   */

    return notification;
  } catch (error) {
    console.error(`Error sending final warning for loan ${loan.loanId}:`, error);
    return null;
  }
};

// Manual trigger to send reminder for specific loan
export const sendManualReminder = async (req, res) => {
  try {
    const { loanId } = req.params;
    const loan = await Loan.findById(loanId)

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: "Loan not found"
      });
    }

    const daysOverdue = loan.daysOverdue || 0;
    let notification;

    if (daysOverdue >= 9) {
      notification = await sendFinalWarningNotification(loan.userId._id, loan);
    } else if (daysOverdue >= 3) {
      notification = await sendLoanDefaultNotification(loan.userId._id, loan, daysOverdue);
    } else if (daysOverdue >= 1) {
      notification = await sendOverdueWarningNotification(loan.userId._id, loan, daysOverdue);
    } else {
      notification = await sendOverdueWarningNotification(loan.userId._id, loan, daysOverdue);
    }

    res.status(200).json({
      success: true,
      message: "Reminder sent successfully",
      data: {
        notificationId: notification?._id,
        loanId: loan.loanId,
        daysOverdue: daysOverdue
      }
    });
  } catch (error) {
    console.error("Error sending manual reminder:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send reminder"
    });
  }
};

export const manualBlockUser = async (req, res) => {

   try {
    const { userId } = req.params;
    //const loan = await Loan.findById(loanId)

    // Block the user account
    const blockedUser = await userModel.findByIdAndUpdate(
      userId,
      {
        isBlocked: true,
        loanStatus: "overdue",
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!blockedUser) {
      throw new Error(`User ${userId} not found`);
    }

    // Create notification about account block
    const blockNotification = new Notification({
      user: userId,
      title: "Account Blocked",
      message: `Your account has been blocked due to defaulted .`,
      type: "account",
      priority: "urgent",
      status: "unread",
      relatedTo: {
        modelType: "User",
        modelId: userId
      },
      actions: [
        {
         label: "Make Payment",
          url: `/loan-payment`,
          method: "GET",
          style: "primary"
        }
      ],
      icon: "security",
      color: "danger",
   
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
    });

    await blockNotification.save();

    // Send email notification
   /*
    await sendEmailNotification(
      blockedUser.email,
      "Account Blocked Due to Defaulted Loan",
      `Your account has been blocked because loan ${loan.loanId} is ${daysOverdue} days overdue. Please contact our support team immediately.`
    );
   */

    return {
      userId: userId,
      loanId: '',
      blockedAt: new Date(),
      daysOverdue: ''
    };
  } catch (error) {
    console.error(error);
    return null;
  }
};

// Check for loans about to expire (preventive)
export const checkLoansNearingExpiry = async () => {
  try {
    const now = new Date();
    const warningThreshold = 3; // days before due date

    // Find loans that will expire in 3 days
    const nearingExpiryLoans = await Loan.find({
      status: "active",
      dueDate: {
        $gte: now,
        $lte: new Date(now.getTime() + warningThreshold * 24 * 60 * 60 * 1000)
      },
      remainingBalance: { $gt: 0 }
    });

    const results = {
      warningsSent: 0,
      loans: []
    };

    for (const loan of nearingExpiryLoans) {
      const daysUntilDue = Math.ceil((loan.dueDate - now) / (1000 * 60 * 60 * 24));

      // Send upcoming due date notification
      const notification = new Notification({
        user: loan.userId,
        title: "Loan Payment Due Soon",
        message: `Your loan payment for ${loan.loanId} is due in ${daysUntilDue} day(s). Amount due: ${loan.remainingBalance} ${loan.currency}.`,
        type: "loan",
        priority: "medium",
        status: "unread",
        relatedTo: {
          modelType: "Loan",
          modelId: loan._id
        },
        actions: [
          {
            label: "Make Payment",
            url: `/loan-payment`,
            method: "GET",
            style: "primary"
          }
        ],
        icon: "withdrawal",
        color: "info"
      });

      await notification.save();
      results.warningsSent++;
      results.loans.push(loan.loanId);
    }

    return {
      message: `Sent ${results.warningsSent} upcoming due date warnings`,
      results
    };
  } catch (error) {
    console.error("Error checking loans nearing expiry:", error);
    throw error;
  }
};