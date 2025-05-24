import User from "@/models/User"
import Package from "@/models/Package"
import Course from "@/models/Course"
import Transaction from "@/models/Transaction"
import Enrollment from "@/models/Enrollment"
import Balance from "@/models/Balance"
import BalanceTransaction from "@/models/BalanceTransaction"
import PaymentMethod from "@/models/PaymentMethod"
import KYC from "@/models/KYC"
import Contact from "@/models/Contact"
import Withdrawal from "@/models/Withdrawal"
import PromoCode from "@/models/PromoCode"
import AffiliateEarning from "@/models/AffiliateEarning"

// Export all models for easy access
export {
  User,
  Package,
  Course,
  Transaction,
  Enrollment,
  Balance,
  BalanceTransaction,
  PaymentMethod,
  KYC,
  Contact,
  Withdrawal,
  PromoCode,
  AffiliateEarning,
}

// Function to ensure all models are registered
export function ensureModelsRegistered() {
  const models = {
    User,
    Package,
    Course,
    Transaction,
    Enrollment,
    Balance,
    BalanceTransaction,
    PaymentMethod,
    KYC,
    Contact,
    Withdrawal,
    PromoCode,
    AffiliateEarning,
  }

  console.log("Models registered:", Object.keys(models))
  return models
}
