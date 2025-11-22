const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidSalary = (salary) => !isNaN(parseFloat(salary)) && parseFloat(salary) > 0;

const validateRequired = (fields, data) => {
  const errors = [];
  for (const f of fields) if (!data[f] || (typeof data[f] === 'string' && data[f].trim() === '')) errors.push(`${f} is required`);
  return errors;
};

const validateJob = (data) => {
  const errors = validateRequired(['title', 'department', 'location'], data);
  if (data.salary && !isValidSalary(data.salary)) errors.push('Salary must be a positive number');
  return errors;
};

const createValidationMiddleware = (validator) => (req, res, next) => {
  const errors = validator(req.body);
  if (errors.length) return res.status(400).json({ success: false, error: 'Validation failed', details: errors });
  next();
};

module.exports = { isValidEmail, isValidSalary, validateRequired, validateJob, createValidationMiddleware };



