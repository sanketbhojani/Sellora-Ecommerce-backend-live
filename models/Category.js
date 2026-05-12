
import mongoose from "mongoose";

const categorySchema  = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please enter category name"],
        trim:true,
        unique:true,
    },
    slug:{
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    image: {
      type: String,
      default: "",
    },
    isActive:{
        type:Boolean,
        default:true,
    },

},{timestamps:true});

// categorySchema.index(
//     { name: 1 },
//     { unique: true, collation: { locale: "en", strength: 2 } }
// );


categorySchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
  }
  next;
});


export const Category = mongoose.model('Category',categorySchema);