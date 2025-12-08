require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['technician', 'manager', 'admin'], default: 'technician' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const email = process.argv[2] || 'admin@hazardinspect.com';
    const password = process.argv[3] || 'admin123';
    const name = process.argv[4] || 'Admin User';

    // Check if admin exists
    const existing = await User.findOne({ email });
    if (existing) {
      console.log('Admin user already exists. Updating password...');
      const salt = await bcrypt.genSalt(10);
      existing.password = await bcrypt.hash(password, salt);
      existing.role = 'admin';
      existing.isActive = true;
      await existing.save();
      console.log('✓ Admin user updated successfully');
      console.log(`Email: ${email}`);
      console.log(`Password: ${password}`);
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      const admin = await User.create({
        email,
        password: hashedPassword,
        name,
        role: 'admin',
        isActive: true,
      });

      console.log('✓ Admin user created successfully');
      console.log(`Email: ${email}`);
      console.log(`Password: ${password}`);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createAdmin();

