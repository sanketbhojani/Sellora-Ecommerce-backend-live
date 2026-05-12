import multer from 'multer';
import path from 'path';
import cloudinary from '../config/cloudinary.js';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

const cloudinaryStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "sellora-Ecom",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
    },
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const isValid = allowedTypes.test(
        path.extname(file.originalname).toLowerCase()
    );
    if(isValid){
        cb(null,true);
    }else{
        cb(new Error("Only image files (jpg, jpeg, png, webp) are allowed!"),false);
    }
}


const upload = multer({
    storage:cloudinaryStorage,
    fileFilter:fileFilter,
    limits:{
        fileSize: 5 * 1024 * 1024,
    },
});

export default upload;
