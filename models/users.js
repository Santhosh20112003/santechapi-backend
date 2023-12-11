import mongoose from 'mongoose';

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true
    },
    tokens: [
      {
        type: String,
        unique: true
      }
    ],
    subscribed: [
      {
        type: String
      }
    ]
  },
  {
    timestamps: true
  }
);

const UserModel = mongoose.model("users", userSchema);

UserModel.createIndexes().catch((error) => {
  console.error("Error creating indexes:", error);
});

export default UserModel;