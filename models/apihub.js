import mongoose from 'mongoose';

const { Schema } = mongoose;

const apihubSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },
    description: {
        type: String,
		required: true,
      },
	link: {
        type: String,
		required: true,
      },
	image: {
        type: String,
		required: true,
      },
  },
  {
    timestamps: true
  }
);

const apihubModel = mongoose.model("apihubs", apihubSchema);

apihubModel.createIndexes().catch((error) => {
  console.error("Error creating indexes:", error);
});

export default apihubModel;