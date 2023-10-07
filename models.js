const mongoose = require('mongoose');
const { Schema } = mongoose;

const ReplySchema = new Schema(
  {
    thread_id: { type: Schema.Types.ObjectId },
    text: { type: String },
    delete_password: { type: String },
    reported: { type: Boolean, default: false }
  },
  {
    timestamps: {
      createdAt: 'created_on', // Use `created_on` to store the created date
      updatedAt: 'bumped_on' // and `bumped_on` to store the last updated date
    }
  }
);
const ReplyModel = mongoose.model('Reply', ReplySchema);

const ThreadSchema = new Schema({
  board_id: { type: Schema.Types.ObjectId },
  text: { type: String },
  delete_password: { type: String },
  reported: { type: Boolean, default: false },
  replies: [{ type: Schema.Types.ObjectId, ref: 'Reply' }],
  bumped_on: { type: Date, default: new Date() },
  created_on: { type: Date, default: new Date() }
});
const ThreadModel = mongoose.model('Thread', ThreadSchema);

const BoardSchema = new Schema({
  name: { type: String },
  threads: [{ type: Schema.Types.ObjectId, ref: 'Thread' }]
});
const BoardModel = mongoose.model('Board', BoardSchema);

exports.BoardModel = BoardModel;
exports.ThreadModel = ThreadModel;
exports.ReplyModel = ReplyModel;
