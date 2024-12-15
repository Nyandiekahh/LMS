// src/controllers/authController.js
const User = require('../models/User');
const School = require('../models/School');
const generateToken = require('../utils/generateToken');
const { generateSchoolCode, sanitizeUser } = require('../utils/helpers');

class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const authController = {
  registerTeacher: catchAsync(async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      throw new ApiError(400, 'User already exists');
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: 'teacher',
    });

    const sanitizedUser = sanitizeUser(user);
    res.status(201).json({
      ...sanitizedUser,
      token: generateToken(user._id),
    });
  }),

  registerSchool: catchAsync(async (req, res) => {
    const {
      schoolName,
      address,
      city,
      country,
      phoneNumber,
      numberOfTeachers,
      firstName,
      lastName,
      email,
      password,
    } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      throw new ApiError(400, 'User already exists');
    }

    const admin = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: 'admin',
      isSchoolAdmin: true,
    });

    const schoolCode = await generateSchoolCode();
    const school = await School.create({
      name: schoolName,
      code: schoolCode,
      address,
      city,
      country,
      phoneNumber,
      maxTeachers: numberOfTeachers,
      admin: admin._id,
    });

    admin.school = school._id;
    await admin.save();

    const sanitizedUser = sanitizeUser(admin);
    res.status(201).json({
      user: sanitizedUser,
      school: {
        id: school._id,
        name: school.name,
        code: school.code,
      },
      token: generateToken(admin._id),
    });
  }),

  login: catchAsync(async (req, res) => {
    const { email, password, schoolCode } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      throw new ApiError(401, 'Invalid email or password');
    }

    if (user.school && !schoolCode) {
      throw new ApiError(400, 'School code required');
    }

    if (schoolCode) {
      const school = await School.findOne({ code: schoolCode });
      if (!school || !user.school?.equals(school._id)) {
        throw new ApiError(401, 'Invalid school code');
      }
    }

    const sanitizedUser = sanitizeUser(user);
    res.json({
      ...sanitizedUser,
      token: generateToken(user._id),
    });
  }),

  getMe: catchAsync(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const sanitizedUser = sanitizeUser(user);
    res.json(sanitizedUser);
  }),
};

// Add this to your authController.js
verifySchoolCode: catchAsync(async (req, res) => {
  const { code } = req.body;
  
  const school = await School.findOne({ code });
  if (!school) {
    throw new ApiError(404, 'Invalid school code');
  }

  // Check if school has reached maximum teachers
  const teacherCount = await User.countDocuments({ school: school._id, role: 'teacher' });
  if (teacherCount >= school.maxTeachers) {
    throw new ApiError(400, 'School has reached maximum teacher capacity');
  }

  res.json({
    isValid: true,
    schoolId: school._id,
    schoolName: school.name
  });
}),

module.exports = authController;