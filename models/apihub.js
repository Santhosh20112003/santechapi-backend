const mongoose = require('mongoose') ;

const Schema = mongoose.Schema;

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

module.exports = apihubModel;