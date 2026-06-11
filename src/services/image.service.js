import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const baseUploadDir = path.join(process.cwd(), 'uploads');

/**
 * Optimiser une image (redimensionner + convertir en webp)
 * @param {string} inputPath - Chemin de l'image originale
 * @param {Object} options - Options
 * @returns {Promise<string>} - URL de l'image optimisée
 */
export const optimizeImage = async (inputPath, options = {}) => {
  const {
    width = null,        // Pas de resize par défaut
    height = null,
    quality = 80,
    format = 'webp',
    fit = 'cover',
  } = options;

  const ext = path.extname(inputPath);
  const baseName = path.basename(inputPath, ext);
  const dirName = path.dirname(inputPath);
  const outputPath = path.join(dirName, `${baseName}.${format}`);

  let sharpInstance = sharp(inputPath);

  // Redimensionner si width ou height sont spécifiés
  if (width || height) {
    sharpInstance = sharpInstance.resize(width, height, {
      fit: fit,
      position: 'center',
    });
  }

  // Convertir et optimiser selon le format
  switch (format.toLowerCase()) {
    case 'jpeg':
    case 'jpg':
      sharpInstance = sharpInstance.jpeg({ quality });
      break;
    case 'png':
      sharpInstance = sharpInstance.png({ quality, compressionLevel: 9 });
      break;
    case 'webp':
      sharpInstance = sharpInstance.webp({ quality });
      break;
    default:
      sharpInstance = sharpInstance.webp({ quality });
  }

  await sharpInstance.toFile(outputPath);

  // Supprimer l'original
  fs.unlinkSync(inputPath);

  // Retourner l'URL relative
  const relativePath = outputPath.replace(process.cwd(), '');
  return relativePath;
};

/**
 * Compresser une image sans redimensionnement
 */
export const compressImage = async (inputPath, quality = 80) => {
  return optimizeImage(inputPath, { quality, format: 'webp' });
};

/**
 * Créer plusieurs tailles d'une image (responsive)
 */
export const generateImageSizes = async (inputPath, sizes = [], subFolder = '') => {
  const results = [];
  const ext = path.extname(inputPath);
  const baseName = path.basename(inputPath, ext);
  const dirName = path.dirname(inputPath);

  const defaultSizes = [
    { width: 50, height: 50, suffix: 'xs' },
    { width: 150, height: 150, suffix: 'sm' },
    { width: 300, height: 300, suffix: 'md' },
    { width: 600, height: 600, suffix: 'lg' },
  ];

  const sizesToGenerate = sizes.length > 0 ? sizes : defaultSizes;

  for (const size of sizesToGenerate) {
    const outputPath = path.join(dirName, `${baseName}_${size.suffix}.webp`);
    
    await sharp(inputPath)
      .resize(size.width, size.height, { fit: 'cover' })
      .webp({ quality: 80 })
      .toFile(outputPath);
    
    const relativePath = outputPath.replace(process.cwd(), '');
    results.push({
      size: size.suffix,
      width: size.width,
      height: size.height,
      url: relativePath,
    });
  }

  return results;
};

/**
 * Valider et traiter une image uploadée
 */
export const processUploadedImage = async (file, options = {}) => {
  if (!file || !file.path) return null;

  const processedPath = await optimizeImage(file.path, options);
  
  return {
    originalName: file.originalname,
    path: processedPath,
    size: file.size,
    mimetype: file.mimetype,
  };
};


export const deleteImage = (imageUrl) => {
    if (!imageUrl) return false;
    
    try {
      // Extraire le chemin relatif
      const relativePath = imageUrl.replace('/uploads/', '');
      const filePath = path.join(baseUploadDir, relativePath);
      
      // Vérifier si le fichier existe
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
};

/**
 * Traiter plusieurs images uploadées
 */
export const processMultipleImages = async (files, options = {}) => {
  if (!files || !Array.isArray(files) || files.length === 0) return [];

  const results = [];
  for (const file of files) {
    const processed = await processUploadedImage(file, options);
    if (processed) {
      results.push(processed);
    }
  }
  return results;
};

export default {
  optimizeImage,
  compressImage,
  generateImageSizes,
  processUploadedImage,
  processMultipleImages,

};