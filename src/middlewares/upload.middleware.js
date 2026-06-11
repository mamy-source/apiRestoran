import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { AppError } from './error.middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dossier de base pour les uploads
const baseUploadDir = path.join(process.cwd(), 'uploads');

// Créer les dossiers s'ils n'existent pas
const createDirectoryIfNotExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Configuration dynamique du stockage
const getStorage = (subFolder) => {
  const uploadDir = path.join(baseUploadDir, subFolder);
  createDirectoryIfNotExists(uploadDir);

  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      // Générer un nom unique: entityId-timestamp-random.ext
      const entityId = req.params.id || req.user?.id || 'temp';
      const uniqueSuffix = `${entityId}-${Date.now()}-${Math.round(Math.random() * 1E9)}`;
      const ext = path.extname(file.originalname);
      cb(null, `${uniqueSuffix}${ext}`);
    },
  });
};

// fileFilter 
const fileFilter = (req, file, cb) => {
    const originalname = file.originalname;
    const mimetype = file.mimetype;
    
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.bmp'];
    const ext = path.extname(originalname).toLowerCase();
    const isValidExtension = validExtensions.includes(ext);
    
    //  List  mime types 
    const validMimeTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
      'image/bmp',
      'application/octet-stream', 
      'image/x-png',  
    ];
    const isValidMime = validMimeTypes.includes(mimetype);
    
    
    const isImageFile = /\.(jpg|jpeg|png|webp|gif|svg|bmp)$/i.test(originalname);
    
    if (mimetype === 'application/octet-stream' && isImageFile) {
      return cb(null, true);
    }
    
    if (isValidMime || isValidExtension || isImageFile) {
      cb(null, true);
    } else {
      cb(new Error(`Format non supporté. Utilisez .jpg, .png, .webp. Reçu: ${originalname}`));
    }
};

// Configuration de base
const getMulterConfig = (subFolder, maxSize = 5 * 1024 * 1024) => {
  return {
    storage: getStorage(subFolder),
    limits: {
      fileSize: maxSize,
    },
    fileFilter: fileFilter,
  };
};

// Middleware générique pour un seul fichier
export const uploadSingle = (subFolder, fieldName = 'image') => {
  const config = getMulterConfig(subFolder);
  return multer(config).single(fieldName);
};

// Middleware générique pour plusieurs fichiers
export const uploadMultiple = (subFolder, fieldName = 'images', maxCount = 5) => {
  const config = getMulterConfig(subFolder);
  return multer(config).array(fieldName, maxCount);
};

// Middleware pour champs multiples (ex: image + document)
export const uploadFields = (subFolder, fields) => {
  const config = getMulterConfig(subFolder);
  return multer(config).fields(fields);
};

// Supprimer une image
export const deleteImage = (imageUrl) => {
  if (!imageUrl) return false;
  
  try {
    // Extraire le chemin relatif
    const relativePath = imageUrl.replace('/uploads/', '');
    const filePath = path.join(baseUploadDir, relativePath);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
};

// Supprimer plusieurs images
export const deleteMultipleImages = (imageUrls) => {
  if (!imageUrls || !Array.isArray(imageUrls)) return;
  
  for (const url of imageUrls) {
    deleteImage(url);
  }
};

export default {
  uploadSingle,
  uploadMultiple,
  uploadFields,
  deleteImage,
  deleteMultipleImages,
};