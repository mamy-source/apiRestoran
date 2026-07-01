import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';
import OrderRepository from '../repository/order.repository.js';
import MenuRepository from '../repository/menu.repository.js';
import UserRepository from '../repository/user.repository.js';
import { AppError } from '../middlewares/error.middleware.js';
import logger from '../libs/logger.lib.js';

const EXPORT_DIR = path.join(process.cwd(), 'uploads', 'exports');

// Créer le dossier s'il n'existe pas
if (!fs.existsSync(EXPORT_DIR)) {
  fs.mkdirSync(EXPORT_DIR, { recursive: true });
}

class ExportService {
  
  async createOrdersExport(filters = {}) {
    const orders = await OrderRepository.findAll(filters);

    if (!orders || orders.length === 0) {
      throw new AppError('Aucune commande à exporter', 404);
    }

    // Créer le workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Restaurant API';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Commandes', {
      properties: { tabColor: { argb: 'FF00E599' } },
    });

    // Définir les colonnes
    worksheet.columns = [
      { header: 'ID Commande', key: 'id', width: 40 },
      { header: 'Table', key: 'table', width: 12 },
      { header: 'Client', key: 'client', width: 25 },
      { header: 'Téléphone', key: 'phone', width: 15 },
      { header: 'Total (Ar)', key: 'total', width: 15 },
      { header: 'Statut', key: 'status', width: 15 },
      { header: 'Source', key: 'source', width: 15 },
      { header: 'Articles', key: 'items', width: 10 },
      { header: 'Date', key: 'date', width: 22 },
    ];

    // Style de l'en-tête
    const headerRow = worksheet.getRow(1);
    headerRow.font = { 
      name: 'Arial', 
      size: 11, 
      bold: true, 
      color: { argb: 'FFFFFFFF' } 
    };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1a1a2e' },
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 30;
    headerRow.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    // Ajouter les données
    orders.forEach((order, index) => {
      const row = worksheet.addRow({
        id: order.id,
        table: order.table?.number || 'N/A',
        client: order.user?.fullName || order.customerName || 'N/A',
        phone: order.user?.phoneNumber || order.customerPhone || 'N/A',
        total: order.total,
        status: order.status,
        source: order.source === 'ONLINE' ? 'En ligne' : 'Restaurant',
        items: order.items?.length || 0,
        date: new Date(order.createdAt).toLocaleString('fr-FR'),
      });

      // Style des lignes
      const rowNumber = index + 2;
      const currentRow = worksheet.getRow(rowNumber);
      currentRow.alignment = { vertical: 'middle' };
      currentRow.height = 25;
      
      // Alternance des couleurs
      if (index % 2 === 0) {
        currentRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF8F9FA' },
        };
      }

      // Couleur selon le statut
      const statusCell = currentRow.getCell('status');
      const statusColors = {
        'PENDING': { argb: 'FFFFD93D' },
        'PREPARING': { argb: 'FF60A5FA' },
        'READY': { argb: 'FF34D399' },
        'SERVED': { argb: 'FF22B573' },
        'PAID': { argb: 'FF00E599' },
        'CANCELLED': { argb: 'FFF87171' },
      };
      if (statusColors[order.status]) {
        statusCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: statusColors[order.status],
        };
        statusCell.font = { bold: true };
      }

      // Format monétaire pour le total
      const totalCell = currentRow.getCell('total');
      totalCell.numFmt = '#,##0.00 "Ar"';
    });

    // Ajouter une ligne de total
    worksheet.addRow({
      id: '',
      table: '',
      client: 'TOTAL',
      phone: '',
      total: orders.reduce((sum, o) => sum + o.total, 0),
      status: '',
      source: '',
      items: orders.reduce((sum, o) => sum + (o.items?.length || 0), 0),
      date: '',
    });
    const lastRowNum = worksheet.rowCount;
    const lastRow = worksheet.getRow(lastRowNum);
    lastRow.font = { bold: true, size: 12 };
    lastRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE5E7EB' },
    };
    lastRow.height = 30;

    // Ajouter des bordures à toutes les cellules
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          right: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        };
      });
    });

    // Freeze le header
    worksheet.views = [
      { state: 'frozen', ySplit: 1 },
    ];

    // Générer le nom du fichier
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `commandes_${timestamp}.xlsx`;
    const filepath = path.join(EXPORT_DIR, filename);

    // Sauvegarder
    await workbook.xlsx.writeFile(filepath);

    logger.info(`Export Excel créé: ${filename}`);

    return {
      filename,
      filepath,
      url: `/api/exports/download/${filename}`,
      count: orders.length,
      size: fs.statSync(filepath).size,
      sizeFormatted: `${(fs.statSync(filepath).size / 1024).toFixed(2)} KB`,
      createdAt: new Date(),
    };
  }

 
  async createProductsExport(filters = {}) {
    const products = await MenuRepository.findAll(filters);

    if (!products || products.length === 0) {
      throw new AppError('Aucun produit à exporter', 404);
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Restaurant API';

    const worksheet = workbook.addWorksheet('Produits', {
      properties: { tabColor: { argb: 'FF60A5FA' } },
    });

    // Définir les colonnes
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 40 },
      { header: 'Nom', key: 'name', width: 30 },
      { header: 'Description', key: 'description', width: 30 },
      { header: 'Prix (Ar)', key: 'price', width: 15 },
      { header: 'Catégorie', key: 'category', width: 20 },
      { header: 'Disponible', key: 'available', width: 12 },
      { header: 'En ligne', key: 'online', width: 12 },
      { header: 'Créé le', key: 'createdAt', width: 22 },
    ];

    // Style de l'en-tête
    const headerRow = worksheet.getRow(1);
    headerRow.font = { 
      name: 'Arial', 
      size: 11, 
      bold: true, 
      color: { argb: 'FFFFFFFF' } 
    };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E3A5F' },
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 30;

    // Ajouter les données
    products.forEach((product, index) => {
      const row = worksheet.addRow({
        id: product.id,
        name: product.name,
        description: product.description || 'N/A',
        price: product.price,
        category: product.category?.name || 'N/A',
        available: product.available ? 'Oui' : 'Non',
        online: product.availableOnline ? 'Oui' : 'Non',
        createdAt: new Date(product.createdAt).toLocaleString('fr-FR'),
      });

      const rowNumber = index + 2;
      const currentRow = worksheet.getRow(rowNumber);
      currentRow.alignment = { vertical: 'middle' };
      currentRow.height = 25;

      if (index % 2 === 0) {
        currentRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF8F9FA' },
        };
      }

      // Couleur selon la disponibilité
      const availableCell = currentRow.getCell('available');
      if (product.available) {
        availableCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFD4EDDA' },
        };
        availableCell.font = { color: { argb: 'FF155724' } };
      } else {
        availableCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF8D7DA' },
        };
        availableCell.font = { color: { argb: 'FF721C24' } };
      }

      // Format monétaire
      const priceCell = currentRow.getCell('price');
      priceCell.numFmt = '#,##0.00 "Ar"';
    });

    // Ajouter une ligne de total
    worksheet.addRow({
      id: '',
      name: 'TOTAL',
      description: '',
      price: products.reduce((sum, p) => sum + p.price, 0),
      category: '',
      available: '',
      online: '',
      createdAt: '',
    });
    const lastRowNum = worksheet.rowCount;
    const lastRow = worksheet.getRow(lastRowNum);
    lastRow.font = { bold: true, size: 12 };
    lastRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE5E7EB' },
    };
    lastRow.height = 30;

    // Ajouter des bordures
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          right: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        };
      });
    });

    worksheet.views = [{ state: 'frozen', ySplit: 1 }];

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `produits_${timestamp}.xlsx`;
    const filepath = path.join(EXPORT_DIR, filename);

    await workbook.xlsx.writeFile(filepath);

    logger.info(`Export Excel créé: ${filename}`);

    return {
      filename,
      filepath,
      url: `/api/exports/download/${filename}`,
      count: products.length,
      size: fs.statSync(filepath).size,
      sizeFormatted: `${(fs.statSync(filepath).size / 1024).toFixed(2)} KB`,
      createdAt: new Date(),
    };
  }


  async createUsersExport(filters = {}) {
    const users = await UserRepository.findAll(filters);

    if (!users || users.length === 0) {
      throw new AppError('Aucun utilisateur à exporter', 404);
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Restaurant API';

    const worksheet = workbook.addWorksheet('Utilisateurs', {
      properties: { tabColor: { argb: 'FFA78BFA' } },
    });

    // Définir les colonnes
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 40 },
      { header: 'Nom complet', key: 'fullName', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Téléphone', key: 'phone', width: 15 },
      { header: 'Rôle', key: 'role', width: 15 },
      { header: 'Points', key: 'points', width: 12 },
      { header: 'Total dépensé', key: 'spent', width: 15 },
      { header: 'Commandes', key: 'orders', width: 12 },
      { header: 'Inscrit le', key: 'createdAt', width: 22 },
    ];

    // Style de l'en-tête
    const headerRow = worksheet.getRow(1);
    headerRow.font = { 
      name: 'Arial', 
      size: 11, 
      bold: true, 
      color: { argb: 'FFFFFFFF' } 
    };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4C2882' },
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 30;

    // Ajouter les données
    users.forEach((user, index) => {
      const row = worksheet.addRow({
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phoneNumber || 'N/A',
        role: user.role,
        points: user.loyaltyPoints || 0,
        spent: user.totalSpent || 0,
        orders: user.orderCount || 0,
        createdAt: new Date(user.createdAt).toLocaleString('fr-FR'),
      });

      const rowNumber = index + 2;
      const currentRow = worksheet.getRow(rowNumber);
      currentRow.alignment = { vertical: 'middle' };
      currentRow.height = 25;

      if (index % 2 === 0) {
        currentRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF8F9FA' },
        };
      }

      // Couleur selon le rôle
      const roleCell = currentRow.getCell('role');
      const roleColors = {
        'ADMIN': { argb: 'FFF87171' },
        'MANAGER': { argb: 'FFFBBF24' },
        'WAITER': { argb: 'FF60A5FA' },
        'CHEF': { argb: 'FF34D399' },
        'CASHIER': { argb: 'FFA78BFA' },
        'CLIENT': { argb: 'FF00E599' },
        'GUEST': { argb: 'FF9CA3AF' },
      };
      if (roleColors[user.role]) {
        roleCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: roleColors[user.role],
        };
        roleCell.font = { bold: true };
      }

      // Format monétaire
      const spentCell = currentRow.getCell('spent');
      spentCell.numFmt = '#,##0.00 "Ar"';
    });

    // Ajouter une ligne de total
    worksheet.addRow({
      id: '',
      fullName: 'TOTAL',
      email: '',
      phone: '',
      role: '',
      points: users.reduce((sum, u) => sum + (u.loyaltyPoints || 0), 0),
      spent: users.reduce((sum, u) => sum + (u.totalSpent || 0), 0),
      orders: users.reduce((sum, u) => sum + (u.orderCount || 0), 0),
      createdAt: '',
    });
    const lastRowNum = worksheet.rowCount;
    const lastRow = worksheet.getRow(lastRowNum);
    lastRow.font = { bold: true, size: 12 };
    lastRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE5E7EB' },
    };
    lastRow.height = 30;

    // Ajouter des bordures
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          right: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        };
      });
    });

    worksheet.views = [{ state: 'frozen', ySplit: 1 }];

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `utilisateurs_${timestamp}.xlsx`;
    const filepath = path.join(EXPORT_DIR, filename);

    await workbook.xlsx.writeFile(filepath);

    logger.info(`Export Excel créé: ${filename}`);

    return {
      filename,
      filepath,
      url: `/api/exports/download/${filename}`,
      count: users.length,
      size: fs.statSync(filepath).size,
      sizeFormatted: `${(fs.statSync(filepath).size / 1024).toFixed(2)} KB`,
      createdAt: new Date(),
    };
  }


  async listExports() {
    const files = fs.readdirSync(EXPORT_DIR);
    return files
      .filter(file => file.endsWith('.xlsx'))
      .map(file => {
        const stats = fs.statSync(path.join(EXPORT_DIR, file));
        return {
          filename: file,
          url: `/api/exports/download/${file}`,
          size: stats.size,
          sizeFormatted: `${(stats.size / 1024).toFixed(2)} KB`,
          created: stats.mtime,
          createdFormatted: stats.mtime.toLocaleString('fr-FR'),
        };
      })
      .sort((a, b) => b.created - a.created);
  }


  async downloadExport(filename) {
    // Sécurité: vérifier que le fichier est bien un .xlsx
    if (!filename.endsWith('.xlsx')) {
      throw new AppError('Format de fichier non autorisé', 400);
    }

    // Sécurité: empêcher les attaques path traversal
    const safeFilename = path.basename(filename);
    const filepath = path.join(EXPORT_DIR, safeFilename);

    if (!fs.existsSync(filepath)) {
      throw new AppError('Fichier non trouvé', 404);
    }

    return {
      filepath,
      filename: safeFilename,
    };
  }


  async deleteExport(filename) {
    const safeFilename = path.basename(filename);
    const filepath = path.join(EXPORT_DIR, safeFilename);

    if (!fs.existsSync(filepath)) {
      throw new AppError('Fichier non trouvé', 404);
    }

    fs.unlinkSync(filepath);
    logger.info(`Export supprimé: ${filename}`);
    return { deleted: true, filename };
  }
}

export default new ExportService();