const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

counterSchema.index({ _id: 1 });

/**
 * Atomically get and increment the next sequence for a given name.
 * @param {string} name - Counter name (e.g. 'transfer', 'receipt', 'delivery')
 * @returns {Promise<number>} Next sequence value
 */
counterSchema.statics.getNext = async function (name) {
  const result = await this.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return result.seq;
};

module.exports = mongoose.model('Counter', counterSchema);
