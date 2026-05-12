import mongoose from "mongoose";

const subcategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please enter subcategory name"],
            trim: true,
        },
        slug: {
            type: String,
            lowercase: true,
            trim: true,
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: [true, "Please select a parent category"],
        },
        image: {
            type: String,
            default: "",
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

// ✅ Compound unique index with case-insensitive collation
subcategorySchema.index(
    { name: 1, category: 1 },
    { unique: true, collation: { locale: "en", strength: 2 } }
);

// ✅ Auto-generate slug on save
subcategorySchema.pre("save", function (next) {
    if (this.isModified("name")) {
        this.name = this.name.trim();
        this.slug = this.name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-");
    }
    next;
});

// ✅ Auto-update slug on findByIdAndUpdate
subcategorySchema.pre("findOneAndUpdate", function (next) {
    const update = this.getUpdate();
    if (update.$set?.name || update.name) {
        const name = update.$set?.name || update.name;
        const slug = name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-");

        if (update.$set) {
            update.$set.slug = slug;
        } else {
            update.slug = slug;
        }
    }
    next;
});

export const Subcategory = mongoose.model("Subcategory", subcategorySchema);