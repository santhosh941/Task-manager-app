const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  taskname: {
    type: String,
    required: [true, "Task name is mandatory"],
  },
  description: {
    type: String,
    required: true,
    trim:true,
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },
  dueDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["Completed", "Incomplete"],
    default: "Incomplete",
}
});


const Task = mongoose.model("Task", taskSchema);
module.exports = Task;