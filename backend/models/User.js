const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: function() {
        return this.isVerified;
      },
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    userType: {
      type: String,
      required: true,
      enum: ['customer', 'pharmacist', 'admin'],
      default: 'customer',
    },
    pharmacyName: {
      type: String,
      required: function() {
        return this.userType === 'pharmacist' && this.isVerified;
      },
    },
    otp: {
      type: String,
    },
    otpExpires: {
      type: Date,
    },
    otpChannel: {
      type: String,
      enum: ['email', 'phone'],
      default: 'email',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    address: {
      type: String,
      default: ''
    },
    city: {
      type: String,
      default: '',
    },
    state: {
      type: String,
      default: '',
    },
    pincode: {
      type: String,
      default: '',
    },
    licenseNumber: {
      type: String,
      default: ''
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  if (this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;