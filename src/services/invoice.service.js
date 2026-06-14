import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import InvoiceRepository from '../repository/invoice.repository.js';
import OrderRepository from '../repository/order.repository.js';
import { AppError } from '../middlewares/error.middleware.js';
import logger from '../libs/logger.lib.js';
import Handlebars from 'handlebars';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PDF_DIR = path.join(process.cwd(), 'uploads', 'invoices');
const TEMPLATE_DIR = path.join(process.cwd(), 'src', 'templates');

if (!fs.existsSync(PDF_DIR)) {
  fs.mkdirSync(PDF_DIR, { recursive: true });
}


Handlebars.registerHelper('eq', function(a, b) {
    return a === b;
});

Handlebars.registerHelper('neq', function(a, b) {
    return a !== b;
});

Handlebars.registerHelper('formatDate', function(date, format) {
    if (!date) return '';
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    
    if (format === 'DD/MM/YYYY') return `${day}/${month}/${year}`;
    return `${day}/${month}/${year} ${hours}:${minutes}`;
});

Handlebars.registerHelper('formatPrice', function(price) {
    if (!price) return '0 Ar';
    return new Intl.NumberFormat('fr-MG', { 
        style: 'currency', 
        currency: 'MGA',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price).replace('MGA', 'Ar');
});

Handlebars.registerHelper('truncate', function(text, length) {
    if (!text) return '';
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
});

Handlebars.registerHelper('numberToWords', function(number) {
    const units = ['', 'Un', 'Deux', 'Trois', 'Quatre', 'Cinq', 'Six', 'Sept', 'Huit', 'Neuf', 'Dix', 'Onze', 'Douze', 'Treize', 'Quatorze', 'Quinze', 'Seize', 'Dix-sept', 'Dix-huit', 'Dix-neuf'];
    const tens = ['', 'Dix', 'Vingt', 'Trente', 'Quarante', 'Cinquante', 'Soixante', 'Soixante-dix', 'Quatre-vingt', 'Quatre-vingt-dix'];
    
    const convertHundreds = (n) => {
        if (n === 0) return '';
        if (n < 20) return units[n];
        const ten = Math.floor(n / 10);
        const unit = n % 10;
        if (ten === 7 || ten === 9) {
            return tens[ten - 1] + (unit ? '-' + units[unit + 10] : '');
        }
        return tens[ten] + (unit ? '-' + units[unit] : '');
    };
    
    const convert = (n) => {
        if (n === 0) return 'Zéro';
        let result = '';
        const thousands = Math.floor(n / 1000);
        const remainder = n % 1000;
        
        if (thousands > 0) {
            result += (thousands === 1 ? 'Mille' : convertHundreds(thousands) + ' Mille');
            if (remainder > 0) result += ' ';
        }
        
        if (remainder > 0) {
            result += convertHundreds(remainder);
        }
        
        return result.trim();
    };
    
    return convert(Math.floor(number));
});

// PDF configuration based on format
const getPdfConfig = (format) => {
    const configs = {
        POS: {
            width: '80mm',
            height: '200mm',      
            printBackground: true,
            margin: { top: '5mm', bottom: '5mm', left: '5mm', right: '5mm' },
        },
        THERMAL: {
            width: '58mm',
            height: '200mm',      
            printBackground: true,
            margin: { top: '3mm', bottom: '3mm', left: '3mm', right: '3mm' },
        },
        A4: {
            format: 'A4',
            printBackground: true,
            margin: { top: '20mm', bottom: '20mm', left: '20mm', right: '20mm' },
        },
        A5: {
            format: 'A5',
            printBackground: true,
            margin: { top: '15mm', bottom: '15mm', left: '15mm', right: '15mm' },
        },
    };
    
    return configs[format] || configs.A4;
};

class InvoiceService {
    async generateInvoiceNumber() {
        const lastInvoice = await InvoiceRepository.getLastInvoiceNumber();
        const year = new Date().getFullYear();
        const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
        
        let sequence = 1;
        if (lastInvoice) {
            const match = lastInvoice.match(/FAC-(\d{4})-(\d{2})-(\d+)/);
            if (match && parseInt(match[1]) === year && match[2] === month) {
                sequence = parseInt(match[3]) + 1;
            }
        }
        
        const sequenceStr = sequence.toString().padStart(5, '0');
        return `FAC-${year}-${month}-${sequenceStr}`;
    }

    async generateInvoiceHtml(order, invoiceNumber, format = 'A4') {
        const templatePath = path.join(TEMPLATE_DIR, 'invoice.hbs');
        let template = fs.readFileSync(templatePath, 'utf-8');
        
        const compiled = Handlebars.compile(template);
        
        const html = compiled({
            format,
            invoiceNumber,
            generatedAt: new Date(),
            order: {
                ...order,
                items: order.items || [],
                user: order.user,
                payment: order.payment,
                customerName: order.customerName,
                customerPhone: order.customerPhone,
                deliveryAddress: order.deliveryAddress,
                total: order.total,
                createdAt: order.createdAt,
                id: order.id,
            },
        });
        
        return html;
    }

    async generatePdf(html, invoiceNumber, format = 'A4') {
        let browser = null;
        
        try {
            const pdfConfig = getPdfConfig(format);
            
            
            browser = await puppeteer.launch({
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            });
            
            const page = await browser.newPage();
            await page.setContent(html, { waitUntil: 'networkidle0' });
            
            const pdfPath = path.join(PDF_DIR, `${invoiceNumber}_${format}.pdf`);
            
            const pdfOptions = {
                path: pdfPath,
                printBackground: pdfConfig.printBackground,
                margin: pdfConfig.margin,
            };
            
            // if format has predefined dimensions, use them; otherwise, use the specified width and height
            if (pdfConfig.format) {
                pdfOptions.format = pdfConfig.format;
            } else {
                pdfOptions.width = pdfConfig.width;
                pdfOptions.height = pdfConfig.height;
            }
            
            await page.pdf(pdfOptions);
            
            console.log(' PDF generated successfully:', pdfPath);
            
            return `/uploads/invoices/${invoiceNumber}_${format}.pdf`;
            
        } catch (error) {
            logger.error(' PDF generation error:', error);
            throw new Error('Erreur lors de la génération du PDF');
        } finally {
            if (browser) await browser.close();
        }
    }

    async createInvoice(orderId, format = 'A4', action = 'view') {
        const order = await OrderRepository.findById(orderId);
        if (!order) {
            throw new AppError('Commande non trouvée', 404);
        }
        
        if (order.status !== 'PAID') {
            throw new AppError('Impossible de générer une facture pour une commande non payée', 400);
        }
        
        const existingInvoice = await InvoiceRepository.findByOrderId(orderId);
        const invoiceNumber = existingInvoice?.invoiceNumber || await this.generateInvoiceNumber();
        
        const html = await this.generateInvoiceHtml(order, invoiceNumber, format);
        const pdfUrl = await this.generatePdf(html, invoiceNumber, format);
        
        let invoice;
        if (existingInvoice) {
            invoice = await InvoiceRepository.update(existingInvoice.id, { pdfUrl });
        } else {
            invoice = await InvoiceRepository.create({
                orderId,
                invoiceNumber,
                pdfUrl,
            });
        }
        
        logger.logEvent('INVOICE_CREATED', order.userId || 'guest', {
            orderId,
            invoiceNumber,
            format,
            pdfUrl,
        });
        
        return { invoice, pdfUrl, format, action };
    }

    async getInvoiceByOrderId(orderId) {
        const invoice = await InvoiceRepository.findByOrderId(orderId);
        if (!invoice) {
            throw new AppError('Aucune facture trouvée pour cette commande', 404);
        }
        return invoice;
    }

    async getInvoiceById(id) {
        const invoice = await InvoiceRepository.findById(id);
        if (!invoice) {
            throw new AppError('Facture non trouvée', 404);
        }
        return invoice;
    }

    async downloadPdf(invoiceId) {
        const invoice = await InvoiceRepository.findById(invoiceId);
        if (!invoice || !invoice.pdfUrl) {
            throw new AppError('PDF non trouvé', 404);
        }
        
        const pdfPath = path.join(process.cwd(), invoice.pdfUrl);
        if (!fs.existsSync(pdfPath)) {
            throw new AppError('Fichier PDF introuvable', 404);
        }
        
        return { path: pdfPath, filename: `${invoice.invoiceNumber}.pdf` };
    }
}

export default new InvoiceService();