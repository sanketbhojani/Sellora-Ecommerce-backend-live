import { v2 as cloudinary } from "cloudinary";

/**
 * Extracts the public ID from a Cloudinary URL.
 * @param {string} url - The Cloudinary URL.
 * @returns {string|null} - The public ID or null if extraction fails.
 */
const getPublicIdFromUrl = (url) => {
    try {
        if (!url) return null;
        const parts = url.split("/upload/");
        if (parts.length < 2) return null;
        const afterUpload = parts[1];
        // Remove versioning (e.g., v123456789/)
        const withoutVersion = afterUpload.replace(/^v\d+\//, "");
        // Remove file extension
        return withoutVersion.replace(/\.[^/.]+$/, "");
    } catch (err) {
        console.error("Failed to extract public ID from:", url);
        return null;
    }
};

/**
 * Deletes multiple images from Cloudinary.
 * @param {string[]} images - Array of Cloudinary URLs.
 */
const deleteImagesFromCloudinary = async (images = []) => {
    if (!images || images.length === 0) return;
    try {
        await Promise.all(
            images.map((imageUrl) => {
                const publicId = getPublicIdFromUrl(imageUrl);
                if (!publicId) return Promise.resolve();
                return cloudinary.uploader.destroy(publicId);
            })
        );
    } catch (error) {
        console.error("Error deleting images from Cloudinary:", error);
    }
};

export { getPublicIdFromUrl, deleteImagesFromCloudinary };
