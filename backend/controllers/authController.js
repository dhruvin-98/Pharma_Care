const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const generateToken = require("../config/generateToken");
const twilio = require("twilio");
const nodemailer = require("nodemailer");

const EMAIL_USER = process.env.EMAIL_USER || process.env.MAIL_USER;
const EMAIL_PASSWORD_RAW =
  process.env.EMAIL_PASSWORD ||
  process.env.EMAIL_PASS ||
  process.env.MAIL_PASS ||
  "";
const EMAIL_PASSWORD = EMAIL_PASSWORD_RAW.replace(/\s+/g, "");
const HAS_EMAIL_CREDENTIALS = Boolean(EMAIL_USER && EMAIL_PASSWORD);
const EMAIL_HOST = process.env.EMAIL_HOST;
const EMAIL_PORT = Number(process.env.EMAIL_PORT || 0);
const EMAIL_SECURE = String(process.env.EMAIL_SECURE || "").toLowerCase() === "true";
const SMS_COUNTRY_CODE_RAW = process.env.SMS_COUNTRY_CODE || "+91";
const SMS_COUNTRY_CODE = SMS_COUNTRY_CODE_RAW.startsWith("+")
  ? SMS_COUNTRY_CODE_RAW
  : `+${SMS_COUNTRY_CODE_RAW}`;

const HAS_TWILIO_CREDENTIALS = Boolean(
  process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_SERVICE_SID
);

const twilioClient = HAS_TWILIO_CREDENTIALS
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

const emailTransporter = nodemailer.createTransport(
  EMAIL_HOST && EMAIL_PORT
    ? {
        host: EMAIL_HOST,
        port: EMAIL_PORT,
        secure: EMAIL_SECURE,
        auth: {
          user: EMAIL_USER,
          pass: EMAIL_PASSWORD,
        },
      }
    : {
        service: "gmail",
        auth: {
          user: EMAIL_USER,
          pass: EMAIL_PASSWORD,
        },
      }
);

const shouldVerifyEmailTransporter =
  HAS_EMAIL_CREDENTIALS && process.env.NODE_ENV !== "production";

if (shouldVerifyEmailTransporter) {
  emailTransporter.verify((error) => {
    if (error) {
      console.error("❌ Email transporter verification failed:", error.message);
      console.error(
        "ℹ️ Fix: use a valid Gmail App Password in EMAIL_PASSWORD and enable 2-Step Verification on EMAIL_USER"
      );
    } else {
      console.log("✅ Email transporter is ready");
    }
  });
}

const normalizeEmail = (email = "") => email.toLowerCase().trim();
const normalizePhone = (phone = "") => phone.replace(/\D/g, "");
const toSmsDestination = (phone) => `${SMS_COUNTRY_CODE}${phone}`;

const toPublicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  address: user.address,
  city: user.city,
  state: user.state,
  pincode: user.pincode,
  pharmacyName: user.pharmacyName,
  licenseNumber: user.licenseNumber,
  userType: user.userType,
  isVerified: user.isVerified,
});

const sendEmailOtp = async (email, otp) => {
  try {
    if (!HAS_EMAIL_CREDENTIALS) {
      throw new Error(
        "Email OTP service is not configured. Set EMAIL_USER and EMAIL_PASSWORD in backend env."
      );
    }

    const emailResult = await emailTransporter.sendMail({
      from: `"PharmaCare" <${EMAIL_USER}>`,
      to: email,
      subject: "PharmaCare Registration OTP",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
          <h2 style="margin:0 0 12px; color:#1d4ed8;">Verify your PharmaCare account</h2>
          <p style="margin:0 0 16px; color:#374151;">Use this OTP to complete your registration. This code will expire in 10 minutes.</p>
          <div style="font-size: 28px; letter-spacing: 8px; font-weight: 700; color:#111827; background:#eff6ff; border:1px solid #bfdbfe; border-radius:10px; padding: 14px 16px; text-align:center;">${otp}</div>
          <p style="margin:16px 0 0; color:#6b7280; font-size:12px;">If you did not request this code, you can safely ignore this email.</p>
        </div>
      `,
    });

    if (!emailResult.accepted || !emailResult.accepted.length) {
      throw new Error("Email provider did not accept recipient address");
    }

    return true;
  } catch (error) {
    console.error("❌ OTP Email Error:", error.message);
    if (/BadCredentials|Invalid login|Username and Password not accepted/i.test(error.message || "")) {
      console.error(
        "ℹ️ Gmail rejected credentials. Generate a new 16-character App Password and set EMAIL_PASSWORD in backend/.env"
      );
    }
    return false;
  }
};

const applyRegistrationFields = ({ user, payload }) => {
  const {
    name,
    password,
    userType,
    pharmacyName,
    licenseNumber,
    email,
    phone,
    address,
    city,
    state,
    pincode,
  } = payload;

  if (name) user.name = name.trim();
  if (password) user.password = password;
  if (email) user.email = normalizeEmail(email);
  if (phone) user.phone = normalizePhone(phone);
  if (address) user.address = address.trim();
  if (city) user.city = city.trim();
  if (state) user.state = state.trim();
  if (pincode) user.pincode = pincode.trim();

  if (userType) {
    user.userType = userType;
  }

  if (user.userType === "pharmacist" && pharmacyName) {
    user.pharmacyName = pharmacyName.trim();
  }

  if (user.userType === "pharmacist" && licenseNumber) {
    user.licenseNumber = licenseNumber.trim();
  }
};

/* ---------------------------------------------------------
   GET USER PROFILE
--------------------------------------------------------- */
const getUserProfile = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    phone: req.user.phone,
    address: req.user.address,
    city: req.user.city,
    state: req.user.state,
    pincode: req.user.pincode,
    pharmacyName: req.user.pharmacyName,
    userType: req.user.userType,
  });
});

/* ---------------------------------------------------------
   SEND OTP (EMAIL / PHONE)
--------------------------------------------------------- */
const sendOtp = asyncHandler(async (req, res) => {
  const { phone, email, otpChannel } = req.body;

  const cleanEmail = normalizeEmail(email);
  const cleanPhone = normalizePhone(phone);
  const selectedChannel = otpChannel === "phone" ? "phone" : "email";

  if (!cleanEmail) {
    res.status(400);
    throw new Error("Email is required");
  }

  if (cleanPhone && cleanPhone.length !== 10) {
    res.status(400);
    throw new Error("Invalid phone number");
  }

  if (selectedChannel === "phone" && !cleanPhone) {
    res.status(400);
    throw new Error("Phone number is required for mobile OTP");
  }

  let user = await User.findOne({ email: cleanEmail });

  if (!user && cleanPhone) {
    user = await User.findOne({ phone: cleanPhone });
  }

  if (!user) {
    user = await User.create({
      email: cleanEmail,
      phone: cleanPhone || undefined,
      otpChannel: selectedChannel,
      userType: "customer",
    });
  } else {
    user.email = cleanEmail;
    if (cleanPhone) user.phone = cleanPhone;
    user.otpChannel = selectedChannel;
  }

  if (selectedChannel === "phone") {
    if (!HAS_TWILIO_CREDENTIALS || !twilioClient) {
      res.status(500);
      throw new Error(
        "Phone OTP service is not configured. Please use Email OTP instead."
      );
    }

    try {
      await twilioClient.verify.v2
        .services(process.env.TWILIO_SERVICE_SID)
        .verifications.create({
          to: toSmsDestination(cleanPhone),
          channel: "sms",
        });
    } catch (twilioError) {
      console.error("Twilio Error:", twilioError.message);
      res.status(500);
      throw new Error(
        twilioError?.message ||
          "Failed to send SMS OTP. Please use Email OTP instead."
      );
    }

    user.otp = null;
    user.otpExpires = null;
  } else {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    const emailSent = await sendEmailOtp(cleanEmail, otp);
    if (!emailSent) {
      res.status(500);
      throw new Error(
        "Failed to send OTP email. Check EMAIL_USER and EMAIL_PASSWORD (Gmail app password)."
      );
    }

    user.otp = otp;
    user.otpExpires = otpExpires;
  }

  await user.save();

  res.json({
    message: "OTP sent successfully",
    otpChannel: selectedChannel,
  });
});

/* ---------------------------------------------------------
   VERIFY OTP
--------------------------------------------------------- */
const verifyOtp = asyncHandler(async (req, res) => {
  const {
    otp,
    phone,
    email,
    otpChannel,
    password,
    name,
    userType,
    pharmacyName,
    licenseNumber,
    address,
    city,
    state,
    pincode,
  } = req.body;

  if (!otp) {
    res.status(400);
    throw new Error("OTP is required");
  }

  const cleanEmail = normalizeEmail(email);
  const cleanPhone = normalizePhone(phone);
  const selectedChannel = otpChannel === "phone" ? "phone" : "email";

  if (!cleanEmail) {
    res.status(400);
    throw new Error("Email is required");
  }

  if (cleanPhone && cleanPhone.length !== 10) {
    res.status(400);
    throw new Error("Invalid phone number");
  }

  let user = await User.findOne({ email: cleanEmail });

  if (!user && cleanPhone) {
    user = await User.findOne({ phone: cleanPhone });
  }

  if (!user) {
    res.status(400);
    throw new Error("Please request OTP first");
  }

  if (selectedChannel === "phone") {
    if (!cleanPhone) {
      res.status(400);
      throw new Error("Phone number is required for mobile OTP");
    }

    if (!HAS_TWILIO_CREDENTIALS || !twilioClient) {
      res.status(500);
      throw new Error(
        "Phone OTP service is not configured. Please use Email OTP instead."
      );
    }

    try {
      const verificationCheck = await twilioClient.verify.v2
        .services(process.env.TWILIO_SERVICE_SID)
        .verificationChecks.create({
          to: toSmsDestination(cleanPhone),
          code: otp,
        });

      if (verificationCheck.status !== "approved") {
        res.status(400);
        throw new Error("Invalid or expired OTP");
      }
    } catch (error) {
      console.error("Twilio Verification Error:", error.message);

      const isInvalidOtp =
        /invalid|expired|code/i.test(error?.message || "") ||
        error?.code === 20404;

      res.status(isInvalidOtp ? 400 : 500);
      throw new Error(
        isInvalidOtp
          ? "Invalid or expired OTP"
          : "OTP verification service is unavailable. Please try again."
      );
    }
  } else {
    if (!user.otp || !user.otpExpires) {
      res.status(400);
      throw new Error("Please request OTP first");
    }

    if (Date.now() > new Date(user.otpExpires).getTime()) {
      res.status(400);
      throw new Error("OTP expired");
    }

    if (user.otp.toString().trim() !== otp.toString().trim()) {
      res.status(400);
      throw new Error("Incorrect OTP");
    }
  }

  if (!user.password && !password) {
    res.status(400);
    throw new Error("Password is required for first-time registration");
  }

  if (!user.name && !name) {
    res.status(400);
    throw new Error("Name is required for first-time registration");
  }

  if (
    (userType || user.userType) === "pharmacist" &&
    !user.pharmacyName &&
    !pharmacyName
  ) {
    res.status(400);
    throw new Error("Pharmacy name is required for pharmacists");
  }

  if (
    (userType || user.userType) === "pharmacist" &&
    !user.licenseNumber &&
    !licenseNumber
  ) {
    res.status(400);
    throw new Error("License number is required for pharmacists");
  }

  user.isVerified = true;
  user.otp = null;
  user.otpExpires = null;
  user.otpChannel = selectedChannel;

  applyRegistrationFields({
    user,
    payload: {
      name,
      password,
      userType,
      pharmacyName,
      licenseNumber,
      email: cleanEmail,
      phone: cleanPhone,
      address,
      city,
      state,
      pincode,
    },
  });

  await user.save();

  const publicUser = toPublicUser(user);

  return res.json({
    token: generateToken(publicUser._id, publicUser.userType),
    user: publicUser,
  });
});

/* ---------------------------------------------------------
   LOGIN (EMAIL/PHONE + PASSWORD)
--------------------------------------------------------- */
const loginUser = asyncHandler(async (req, res) => {
  const { identifier, email, phone, password, userType } = req.body;

  const cleanIdentifier = (identifier || "").trim();
  const cleanEmail = normalizeEmail(email || "");
  const cleanPhone = normalizePhone(phone || "");

  if (!password || !password.trim()) {
    res.status(400);
    throw new Error("Password is required");
  }

  let user = null;

  if (cleanEmail) {
    user = await User.findOne({ email: cleanEmail });
  }

  if (!user && cleanPhone) {
    user = await User.findOne({ phone: cleanPhone });
  }

  if (!user && cleanIdentifier) {
    if (cleanIdentifier.includes("@")) {
      user = await User.findOne({ email: normalizeEmail(cleanIdentifier) });
    } else {
      user = await User.findOne({ phone: normalizePhone(cleanIdentifier) });
    }
  }

  if (!user || !user.password) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  if (!user.isVerified) {
    res.status(403);
    throw new Error("Please complete OTP verification before login");
  }

  const isPasswordValid = await user.matchPassword(password);

  if (!isPasswordValid) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  if (
    (userType === "customer" || userType === "pharmacist") &&
    user.userType !== userType
  ) {
    res.status(403);
    throw new Error(`Please login as ${user.userType}`);
  }

  const publicUser = toPublicUser(user);

  return res.status(200).json({
    token: generateToken(publicUser._id, publicUser.userType),
    user: publicUser,
  });
});

/* ---------------------------------------------------------
   UPDATE USER PROFILE
--------------------------------------------------------- */
const updateUserProfile = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(404).json({ message: "User not found" });
  }

  const { name, phone, address, city, state, pincode, pharmacyName, licenseNumber } =
    req.body;

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (address) user.address = address;
  if (city) user.city = city;
  if (state) user.state = state;
  if (pincode) user.pincode = pincode;

  if (user.userType === "pharmacist") {
    if (pharmacyName) user.pharmacyName = pharmacyName;
    if (licenseNumber) user.licenseNumber = licenseNumber;
  }

  const updatedUser = await user.save();

  res.status(200).json(updatedUser);
});

module.exports = {
  sendOtp,
  verifyOtp,
  loginUser,
  getUserProfile,
  updateUserProfile,
};
