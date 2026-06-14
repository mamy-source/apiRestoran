import InvoiceService from "../services/invoice.service.js";
import  { sendSuccess, sendCreated } from "../utils/response.js";
import { asyncHandler } from "../middlewares/error.middleware.js";
import { generateInvoiceSchema } from "../validations/invoice.validators.js";



// Créer une facture avec format
export const createInvoice = asyncHandler(async (req, res) => {
  const validation = generateInvoiceSchema.safeParse(req.query);
  
  const format = validation.success ? validation.data.format : 'A4';
  const action = validation.success ? validation.data.action : 'view';
  
  const result = await InvoiceService.createInvoice(req.params.orderId, format, action);
  
  if (action === 'print') {
    const html = await InvoiceService.getPrintHtml(req.params.orderId, format);
    return res.send(html.html);
  }
  
  if (action === 'download') {
    const { path: pdfPath, filename } = await InvoiceService.downloadPdf(result.invoice.id, format);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.sendFile(pdfPath);
  }
  
  sendCreated(res, result.invoice, 'Facture générée avec succès');
});

// Récupérer une facture par commande avec format
export const getInvoiceByOrderId = asyncHandler(async (req, res) => {
  const validation = generateInvoiceSchema.safeParse(req.query);
  const format = validation.success ? validation.data.format : 'A4';
  const action = validation.success ? validation.data.action : 'view';
  
  const result = await InvoiceService.getInvoiceByOrderId(req.params.orderId, format);
  
  if (action === 'print') {
    const html = await InvoiceService.getPrintHtml(req.params.orderId, format);
    return res.send(html.html);
  }
  
  if (action === 'download') {
    const { path: pdfPath, filename } = await InvoiceService.downloadPdf(result.id, format);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.sendFile(pdfPath);
  }
  
  sendSuccess(res, result, 'Facture récupérée');
});

// Télécharger le PDF avec format
export const downloadPdf = asyncHandler(async (req, res) => {
  const { format } = req.query;
  const { path: pdfPath, filename } = await InvoiceService.downloadPdf(req.params.id, format);
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.sendFile(pdfPath);
});

// Imprimer directement
export const printInvoice = asyncHandler(async (req, res) => {
  const { format = 'POS' } = req.query;
  const { html } = await InvoiceService.getPrintHtml(req.params.orderId, format);
  res.send(html);
});

// Le reste des fonctions...
export const getInvoiceById = asyncHandler(async (req, res) => {
  const invoice = await InvoiceService.getInvoiceById(req.params.id);
  sendSuccess(res, invoice, 'Facture récupérée');
});

export const getInvoiceByNumber = asyncHandler(async (req, res) => {
  const invoice = await InvoiceService.getInvoiceByNumber(req.params.invoiceNumber);
  sendSuccess(res, invoice, 'Facture récupérée');
});

export const getAllInvoices = asyncHandler(async (req, res) => {
  const filters = {
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    orderId: req.query.orderId,
  };
  const invoices = await InvoiceService.getAllInvoices(filters);
  sendSuccess(res, invoices, 'Factures récupérées');
});

export const regenerateInvoice = asyncHandler(async (req, res) => {
  const { format = 'A4' } = req.query;
  const invoice = await InvoiceService.regenerateInvoice(req.params.orderId, format);
  sendSuccess(res, invoice, 'Facture régénérée avec succès');
});

export const deleteInvoice = asyncHandler(async (req, res) => {
  await InvoiceService.deleteInvoice(req.params.id);
  sendSuccess(res, null, 'Facture supprimée avec succès');
});