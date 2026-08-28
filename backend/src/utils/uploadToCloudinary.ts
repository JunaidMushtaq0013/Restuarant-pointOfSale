import cloudinary from "../config/cloudinary.js";

export const uploadToCloudinary = (
  file: Express.Multer.File,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "warisoft-pos/menu",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result) {
          reject(new Error("Cloudinary upload failed."));
          return;
        }

        resolve(result.secure_url);
      },
    );

    uploadStream.end(file.buffer);
  });
};

export const uploadLogoToCloudinary = (
  file: Express.Multer.File,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "warisoft-pos/settings",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result) {
          reject(new Error("Cloudinary upload failed."));
          return;
        }

        resolve(result.secure_url);
      },
    );

    uploadStream.end(file.buffer);
  });
};