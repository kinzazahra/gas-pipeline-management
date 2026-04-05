const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['admin', 'employee', 'manager'], 
    default: 'employee' 
  },
  // --- STATUS FIELD GOES HERE (Inside the Schema) ---
  status: { 
    type: String, 
    enum: ['Active', 'On Leave', 'Inactive'], 
    default: 'Active' 
  },
  department: { type: String },
  contactNumber: { type: String }
}, { timestamps: true });

// Hash password before saving (Middleware stays separate)
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);