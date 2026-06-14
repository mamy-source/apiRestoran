import { create } from 'express-handlebars';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helpers personnalisés pour Handlebars
const helpers = {
  // ✅ Helper eq (COMPARISON)
  eq: (a, b) => {
    return a === b;
  },
  
  // ✅ Helper neq (NOT EQUAL)
  neq: (a, b) => {
    return a !== b;
  },
  
  // ✅ Helper unless (inverse of if)
  unless: (condition, options) => {
    if (!condition) {
      return options.fn(this);
    }
    return options.inverse(this);
  },
  
  // ✅ Helper if (with comparison)
  if: (condition, options) => {
    if (condition) {
      return options.fn(this);
    }
    return options.inverse(this);
  },
  
  // ✅ Helper and (logical AND)
  and: (a, b) => {
    return a && b;
  },
  
  // ✅ Helper or (logical OR)
  or: (a, b) => {
    return a || b;
  },
  
  // ✅ Helper gt (greater than)
  gt: (a, b) => {
    return a > b;
  },
  
  // ✅ Helper lt (less than)
  lt: (a, b) => {
    return a < b;
  },
  
  // ✅ Helper gte (greater than or equal)
  gte: (a, b) => {
    return a >= b;
  },
  
  // ✅ Helper lte (less than or equal)
  lte: (a, b) => {
    return a <= b;
  },
  
  // Formater la date
  formatDate: (date, format = 'DD/MM/YYYY HH:mm') => {
    if (!date) return '';
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    
    if (format === 'DD/MM/YYYY') return `${day}/${month}/${year}`;
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  },
  
  // Formater le prix
  formatPrice: (price) => {
    if (!price) return '0 Ar';
    return new Intl.NumberFormat('fr-MG', { 
      style: 'currency', 
      currency: 'MGA',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price).replace('MGA', 'Ar');
  },
  
  // Multiplier
  multiply: (a, b) => a * b,
  
  // Additionner
  add: (a, b) => a + b,
  
  // Compter le nombre d'items
  countItems: (items) => items?.length || 0,
  
  // Tronquer le texte
  truncate: (text, length) => {
    if (!text) return '';
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
  },
  
  // Nombre en lettres
  numberToWords: (number) => {
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
    
    return convert(Math.floor(number)) + ' Ariary';
  }
};

// Configuration Handlebars
const hbs = create({
  extname: '.hbs',
  defaultLayout: false,
  layoutsDir: path.join(process.cwd(), 'src/templates/layouts'),
  partialsDir: path.join(process.cwd(), 'src/templates/partials'),
  helpers: helpers,  // ✅ Ataovy azo antoka fa io no ampiasaina
});

export default hbs;