export type Locale = 'en' | 'pt' | 'zh';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  pt: 'Português',
  zh: '中文',
};

export const localeFlags: Record<Locale, string> = {
  en: '🇬🇧',
  pt: '🇲🇿',
  zh: '🇨🇳',
};

export const defaultLocale: Locale = 'pt';

export type TranslationKeys = {
  // Common
  'common.home': string;
  'common.shop': string;
  'common.search': string;
  'common.loading': string;
  'common.noResults': string;
  'common.viewAll': string;
  'common.back': string;
  'common.save': string;
  'common.cancel': string;
  'common.delete': string;
  'common.edit': string;
  'common.close': string;
  'common.confirm': string;
  'common.success': string;
  'common.error': string;
  'common.cart': string;

  // Navigation
  'nav.brincos': string;
  'nav.bolsa': string;
  'nav.aneis': string;
  'nav.colares': string;
  'nav.pulseiras': string;
  'nav.relogio': string;
  'nav.earrings': string;
  'nav.bags': string;
  'nav.rings': string;
  'nav.necklaces': string;
  'nav.bracelets': string;
  'nav.watches': string;
  'nav.admin': string;
  'nav.storefront': string;
  'nav.migration': string;

  // Announcement
  'announcement.text': string;

  // Brand
  'brand.tagline': string;

  // Hero
  'hero.subtitle': string;
  'hero.cta': string;

  // Categories
  'categories.title': string;
  'categories.earrings': string;
  'categories.bags': string;
  'categories.rings': string;
  'categories.necklaces': string;
  'categories.bracelets': string;
  'categories.watches': string;

  // Collections
  'collections.newArrivals': string;
  'collections.luxuryFashion': string;
  'collections.silverSterling': string;
  'collections.nails': string;
  'collections.shopNow': string;
  'collections.luxuryDesc': string;
  'collections.silverDesc': string;

  // Products
  'product.addToCart': string;
  'product.buyNow': string;
  'product.soldOut': string;
  'product.sale': string;
  'product.taxIncluded': string;
  'product.types': string;
  'product.options': string;
  'product.description': string;
  'product.quantity': string;
  'product.sku': string;
  'product.inStock': string;
  'product.outOfStock': string;
  'product.compareAt': string;
  'product.items': string;
  'product.allProducts': string;
  'product.filterByType': string;
  'product.productNotFound': string;
  'product.backToStore': string;
  'product.variant': string;

  // Checkout
  'checkout.title': string;
  'checkout.orderSummary': string;
  'checkout.subtotal': string;
  'checkout.shipping': string;
  'checkout.tax': string;
  'checkout.total': string;
  'checkout.paymentMethod': string;
  'checkout.payWithPaypal': string;
  'checkout.payWithCard': string;
  'checkout.customCheckout': string;
  'checkout.cardNumber': string;
  'checkout.expiry': string;
  'checkout.cvv': string;
  'checkout.cardHolder': string;
  'checkout.placeOrder': string;
  'checkout.processing': string;
  'checkout.shippingInfo': string;
  'checkout.firstName': string;
  'checkout.lastName': string;
  'checkout.email': string;
  'checkout.phone': string;
  'checkout.address': string;
  'checkout.city': string;
  'checkout.province': string;
  'checkout.zip': string;
  'checkout.country': string;
  'checkout.orderPlaced': string;
  'checkout.orderFailed': string;
  'checkout.free': string;
  'checkout.contactInfo': string;
  'checkout.shippingAddress': string;
  'checkout.creditDebitCard': string;
  'checkout.visaMastercardAmex': string;
  'checkout.customPayment': string;
  'checkout.bankTransferMpesa': string;
  'checkout.paypalRedirectMsg': string;
  'checkout.paymentInstructions': string;
  'checkout.noPaymentMethods': string;
  'checkout.orderPlacedMsg': string;
  'checkout.continueShopping': string;

  // Footer
  'footer.about': string;
  'footer.aboutDesc': string;
  'footer.quickLinks': string;
  'footer.contactUs': string;
  'footer.rights': string;

  // Admin
  'admin.dashboard': string;
  'admin.products': string;
  'admin.categories': string;
  'admin.customers': string;
  'admin.orders': string;
  'admin.inventory': string;
  'admin.migration': string;
  'admin.currency': string;
  'admin.payment': string;
  'admin.checkout': string;
};

const en: TranslationKeys = {
  'common.home': 'Home',
  'common.shop': 'Shop',
  'common.search': 'Search...',
  'common.loading': 'Loading...',
  'common.noResults': 'No results found',
  'common.viewAll': 'View All',
  'common.back': 'Back',
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'common.delete': 'Delete',
  'common.edit': 'Edit',
  'common.close': 'Close',
  'common.confirm': 'Confirm',
  'common.success': 'Success',
  'common.error': 'Error',
  'common.cart': 'Cart',

  'nav.brincos': 'Brincos',
  'nav.bolsa': 'Bolsa',
  'nav.aneis': 'Anéis',
  'nav.colares': 'Colares',
  'nav.pulseiras': 'Pulseiras',
  'nav.relogio': 'Relógio',
  'nav.earrings': 'Earrings',
  'nav.bags': 'Bags',
  'nav.rings': 'Rings',
  'nav.necklaces': 'Necklaces',
  'nav.bracelets': 'Bracelets',
  'nav.watches': 'Watches',
  'nav.admin': 'Admin',
  'nav.storefront': 'Storefront',
  'nav.migration': 'Migration',

  'announcement.text': 'Free shipping on orders over 1,500 Mt | New arrivals every week',

  'brand.tagline': 'More than an expression of style — an attitude of utmost elegance',

  'hero.subtitle': 'Discover our exclusive collection of jewelry and accessories',
  'hero.cta': 'Shop Now',

  'categories.title': 'Shop by Category',
  'categories.earrings': 'Earrings',
  'categories.bags': 'Bags',
  'categories.rings': 'Rings',
  'categories.necklaces': 'Necklaces',
  'categories.bracelets': 'Bracelets',
  'categories.watches': 'Watches',

  'collections.newArrivals': 'New Arrivals',
  'collections.luxuryFashion': 'Luxury Fashion',
  'collections.silverSterling': 'Sterling Silver',
  'collections.nails': 'Nails',
  'collections.shopNow': 'Shop Now',
  'collections.luxuryDesc': 'More than an expression of style — an attitude of utmost elegance in life',
  'collections.silverDesc': 'Sterling Silver or Gold-plated Sterling Silver',

  'product.addToCart': 'Add to Cart',
  'product.buyNow': 'Buy Now',
  'product.soldOut': 'Sold Out',
  'product.sale': 'Sale',
  'product.taxIncluded': 'Taxes included.',
  'product.types': 'TYPES',
  'product.options': 'Options',
  'product.description': 'Description',
  'product.quantity': 'Quantity',
  'product.sku': 'SKU',
  'product.inStock': 'In Stock',
  'product.outOfStock': 'Out of Stock',
  'product.compareAt': 'Compare at',
  'product.items': 'items',
  'product.allProducts': 'All Products',
  'product.filterByType': 'Filter by type',
  'product.productNotFound': 'Product not found',
  'product.backToStore': 'Back to store',
  'product.variant': 'Variant',

  'checkout.title': 'Checkout',
  'checkout.orderSummary': 'Order Summary',
  'checkout.subtotal': 'Subtotal',
  'checkout.shipping': 'Shipping',
  'checkout.tax': 'Tax',
  'checkout.total': 'Total',
  'checkout.paymentMethod': 'Payment Method',
  'checkout.payWithPaypal': 'Pay with PayPal',
  'checkout.payWithCard': 'Pay with Card',
  'checkout.customCheckout': 'Custom Checkout',
  'checkout.cardNumber': 'Card Number',
  'checkout.expiry': 'MM/YY',
  'checkout.cvv': 'CVV',
  'checkout.cardHolder': 'Card Holder Name',
  'checkout.placeOrder': 'Place Order',
  'checkout.processing': 'Processing...',
  'checkout.shippingInfo': 'Shipping Information',
  'checkout.firstName': 'First Name',
  'checkout.lastName': 'Last Name',
  'checkout.email': 'Email',
  'checkout.phone': 'Phone',
  'checkout.address': 'Address',
  'checkout.city': 'City',
  'checkout.province': 'Province',
  'checkout.zip': 'ZIP Code',
  'checkout.country': 'Country',
  'checkout.orderPlaced': 'Order placed successfully!',
  'checkout.orderFailed': 'Order failed. Please try again.',
  'checkout.free': 'Free',
  'checkout.contactInfo': 'Contact Information',
  'checkout.shippingAddress': 'Shipping Address',
  'checkout.creditDebitCard': 'Credit / Debit Card',
  'checkout.visaMastercardAmex': 'Visa, Mastercard, Amex and more',
  'checkout.customPayment': 'Custom Payment',
  'checkout.bankTransferMpesa': 'Bank transfer, M-Pesa, or other methods',
  'checkout.paypalRedirectMsg': 'You will be redirected to PayPal to complete your payment securely.',
  'checkout.paymentInstructions': 'Payment Instructions',
  'checkout.noPaymentMethods': 'No payment methods available. Please contact the store.',
  'checkout.orderPlacedMsg': 'Thank you for your order! You will receive a confirmation email shortly.',
  'checkout.continueShopping': 'Continue Shopping',

  'footer.about': 'About Us',
  'footer.aboutDesc': 'We want to offer you more than an expression of style, but also an attitude of utmost elegance in life.',
  'footer.quickLinks': 'Quick Links',
  'footer.contactUs': 'Contact Us',
  'footer.rights': 'All rights reserved.',

  'admin.dashboard': 'Dashboard',
  'admin.products': 'Products',
  'admin.categories': 'Categories',
  'admin.customers': 'Customers',
  'admin.orders': 'Orders',
  'admin.inventory': 'Inventory',
  'admin.migration': 'Data Migration',
  'admin.currency': 'Currency Settings',
  'admin.payment': 'Payment Settings',
  'admin.checkout': 'Checkout Settings',
};

const pt: TranslationKeys = {
  'common.home': 'Início',
  'common.shop': 'Loja',
  'common.search': 'Pesquisar...',
  'common.loading': 'Carregando...',
  'common.noResults': 'Nenhum resultado encontrado',
  'common.viewAll': 'Ver Tudo',
  'common.back': 'Voltar',
  'common.save': 'Salvar',
  'common.cancel': 'Cancelar',
  'common.delete': 'Eliminar',
  'common.edit': 'Editar',
  'common.close': 'Fechar',
  'common.confirm': 'Confirmar',
  'common.success': 'Sucesso',
  'common.error': 'Erro',
  'common.cart': 'Carrinho',

  'nav.brincos': 'Brincos',
  'nav.bolsa': 'Bolsa',
  'nav.aneis': 'Anéis',
  'nav.colares': 'Colares',
  'nav.pulseiras': 'Pulseiras',
  'nav.relogio': 'Relógio',
  'nav.earrings': 'Brincos',
  'nav.bags': 'Bolsas',
  'nav.rings': 'Anéis',
  'nav.necklaces': 'Colares',
  'nav.bracelets': 'Pulseiras',
  'nav.watches': 'Relógios',
  'nav.admin': 'Administração',
  'nav.storefront': 'Loja',
  'nav.migration': 'Migração',

  'announcement.text': 'Frete grátis em pedidos acima de 1.500 Mt | Novidades toda semana',

  'brand.tagline': 'Mais do que uma expressão de estilo — uma atitude de máxima elegância',

  'hero.subtitle': 'Descubra a nossa coleção exclusiva de joias e acessórios',
  'hero.cta': 'Comprar Agora',

  'categories.title': 'Comprar por Categoria',
  'categories.earrings': 'Brincos',
  'categories.bags': 'Bolsa',
  'categories.rings': 'Anéis',
  'categories.necklaces': 'Colares',
  'categories.bracelets': 'Pulseiras',
  'categories.watches': 'Relógio',

  'collections.newArrivals': 'Novidades',
  'collections.luxuryFashion': 'Moda e Luxo Leve',
  'collections.silverSterling': 'Prata Esterlina',
  'collections.nails': 'Unhas',
  'collections.shopNow': 'Compre já!',
  'collections.luxuryDesc': 'Queremos oferecer-lhe mais do que uma expressão de estilo, mas também uma atitude de máxima elegância na vida',
  'collections.silverDesc': 'Prata Esterlina ou Prata Esterlina Banhado a ouro',

  'product.addToCart': 'Adicionar ao carrinho',
  'product.buyNow': 'Compre já!',
  'product.soldOut': 'Esgotado',
  'product.sale': 'Saldo',
  'product.taxIncluded': 'Impostos incluídos.',
  'product.types': 'TIPOS',
  'product.options': 'Opções',
  'product.description': 'Descrição',
  'product.quantity': 'Quantidade',
  'product.sku': 'Referência',
  'product.inStock': 'Em estoque',
  'product.outOfStock': 'Esgotado',
  'product.compareAt': 'Preço normal',
  'product.items': 'itens',
  'product.allProducts': 'Produtos',
  'product.filterByType': 'Filtrar por tipo',
  'product.productNotFound': 'Produto não encontrado',
  'product.backToStore': 'Voltar à loja',
  'product.variant': 'Variante',

  'checkout.title': 'Finalizar Compra',
  'checkout.orderSummary': 'Resumo do Pedido',
  'checkout.subtotal': 'Subtotal',
  'checkout.shipping': 'Envio',
  'checkout.tax': 'Imposto',
  'checkout.total': 'Total',
  'checkout.paymentMethod': 'Método de Pagamento',
  'checkout.payWithPaypal': 'Pagar com PayPal',
  'checkout.payWithCard': 'Pagar com Cartão',
  'checkout.customCheckout': 'Pagamento Personalizado',
  'checkout.cardNumber': 'Número do Cartão',
  'checkout.expiry': 'MM/AA',
  'checkout.cvv': 'CVV',
  'checkout.cardHolder': 'Nome no Cartão',
  'checkout.placeOrder': 'Finalizar Pedido',
  'checkout.processing': 'Processando...',
  'checkout.shippingInfo': 'Informações de Envio',
  'checkout.firstName': 'Primeiro Nome',
  'checkout.lastName': 'Sobrenome',
  'checkout.email': 'Email',
  'checkout.phone': 'Telefone',
  'checkout.address': 'Endereço',
  'checkout.city': 'Cidade',
  'checkout.province': 'Província',
  'checkout.zip': 'Código Postal',
  'checkout.country': 'País',
  'checkout.orderPlaced': 'Pedido realizado com sucesso!',
  'checkout.orderFailed': 'Falha no pedido. Por favor, tente novamente.',
  'checkout.free': 'Grátis',
  'checkout.contactInfo': 'Informações de Contato',
  'checkout.shippingAddress': 'Endereço de Envio',
  'checkout.creditDebitCard': 'Cartão de Crédito / Débito',
  'checkout.visaMastercardAmex': 'Visa, Mastercard, Amex e mais',
  'checkout.customPayment': 'Pagamento Personalizado',
  'checkout.bankTransferMpesa': 'Transferência bancária, M-Pesa ou outros métodos',
  'checkout.paypalRedirectMsg': 'Será redirecionado para o PayPal para completar o pagamento com segurança.',
  'checkout.paymentInstructions': 'Instruções de Pagamento',
  'checkout.noPaymentMethods': 'Nenhum método de pagamento disponível. Entre em contato com a loja.',
  'checkout.orderPlacedMsg': 'Obrigado pelo seu pedido! Receberá um email de confirmação em breve.',
  'checkout.continueShopping': 'Continuar Comprando',

  'footer.about': 'Sobre Nós',
  'footer.aboutDesc': 'Queremos oferecer-lhe mais do que uma expressão de estilo, mas também uma atitude de máxima elegância na vida.',
  'footer.quickLinks': 'Links Rápidos',
  'footer.contactUs': 'Contato',
  'footer.rights': 'Todos os direitos reservados.',

  'admin.dashboard': 'Painel',
  'admin.products': 'Produtos',
  'admin.categories': 'Categorias',
  'admin.customers': 'Clientes',
  'admin.orders': 'Pedidos',
  'admin.inventory': 'Estoque',
  'admin.migration': 'Migração de Dados',
  'admin.currency': 'Configurações de Moeda',
  'admin.payment': 'Configurações de Pagamento',
  'admin.checkout': 'Configurações de Checkout',
};

const zh: TranslationKeys = {
  'common.home': '首页',
  'common.shop': '商店',
  'common.search': '搜索...',
  'common.loading': '加载中...',
  'common.noResults': '未找到结果',
  'common.viewAll': '查看全部',
  'common.back': '返回',
  'common.save': '保存',
  'common.cancel': '取消',
  'common.delete': '删除',
  'common.edit': '编辑',
  'common.close': '关闭',
  'common.confirm': '确认',
  'common.success': '成功',
  'common.error': '错误',
  'common.cart': '购物车',

  'nav.brincos': '耳环',
  'nav.bolsa': '包包',
  'nav.aneis': '戒指',
  'nav.colares': '项链',
  'nav.pulseiras': '手链',
  'nav.relogio': '手表',
  'nav.earrings': '耳环',
  'nav.bags': '包包',
  'nav.rings': '戒指',
  'nav.necklaces': '项链',
  'nav.bracelets': '手链',
  'nav.watches': '手表',
  'nav.admin': '管理后台',
  'nav.storefront': '店铺前台',
  'nav.migration': '数据迁移',

  'announcement.text': '订单满1,500 Mt免运费 | 每周上新',

  'brand.tagline': '不仅是风格的表达，更是极致优雅的生活态度',

  'hero.subtitle': '探索我们独家珠宝与配饰系列',
  'hero.cta': '立即选购',

  'categories.title': '按类别选购',
  'categories.earrings': '耳环',
  'categories.bags': '包包',
  'categories.rings': '戒指',
  'categories.necklaces': '项链',
  'categories.bracelets': '手链',
  'categories.watches': '手表',

  'collections.newArrivals': '新品上市',
  'collections.luxuryFashion': '轻奢时尚',
  'collections.silverSterling': '925纯银',
  'collections.nails': '美甲',
  'collections.shopNow': '立即购买',
  'collections.luxuryDesc': '不仅是风格的表达，更是极致优雅的生活态度',
  'collections.silverDesc': '925纯银或镀金925纯银',

  'product.addToCart': '加入购物车',
  'product.buyNow': '立即购买',
  'product.soldOut': '已售罄',
  'product.sale': '促销',
  'product.taxIncluded': '含税。',
  'product.types': '类型',
  'product.options': '选项',
  'product.description': '描述',
  'product.quantity': '数量',
  'product.sku': 'SKU',
  'product.inStock': '有货',
  'product.outOfStock': '缺货',
  'product.compareAt': '原价',
  'product.items': '件商品',
  'product.allProducts': '全部商品',
  'product.filterByType': '按类型筛选',
  'product.productNotFound': '未找到商品',
  'product.backToStore': '返回商店',
  'product.variant': '规格',

  'checkout.title': '结算',
  'checkout.orderSummary': '订单摘要',
  'checkout.subtotal': '小计',
  'checkout.shipping': '运费',
  'checkout.tax': '税费',
  'checkout.total': '合计',
  'checkout.paymentMethod': '支付方式',
  'checkout.payWithPaypal': 'PayPal支付',
  'checkout.payWithCard': '银行卡支付',
  'checkout.customCheckout': '自定义结算',
  'checkout.cardNumber': '卡号',
  'checkout.expiry': '月/年',
  'checkout.cvv': 'CVV',
  'checkout.cardHolder': '持卡人姓名',
  'checkout.placeOrder': '提交订单',
  'checkout.processing': '处理中...',
  'checkout.shippingInfo': '收货信息',
  'checkout.firstName': '名',
  'checkout.lastName': '姓',
  'checkout.email': '邮箱',
  'checkout.phone': '电话',
  'checkout.address': '地址',
  'checkout.city': '城市',
  'checkout.province': '省份',
  'checkout.zip': '邮编',
  'checkout.country': '国家',
  'checkout.orderPlaced': '下单成功！',
  'checkout.orderFailed': '下单失败，请重试。',
  'checkout.free': '免费',
  'checkout.contactInfo': '联系信息',
  'checkout.shippingAddress': '收货地址',
  'checkout.creditDebitCard': '信用卡 / 借记卡',
  'checkout.visaMastercardAmex': 'Visa、Mastercard、Amex等',
  'checkout.customPayment': '自定义支付',
  'checkout.bankTransferMpesa': '银行转账、M-Pesa或其他方式',
  'checkout.paypalRedirectMsg': '您将被重定向到PayPal安全完成支付。',
  'checkout.paymentInstructions': '付款说明',
  'checkout.noPaymentMethods': '暂无可用的支付方式，请联系商店。',
  'checkout.orderPlacedMsg': '感谢您的订单！您将很快收到确认邮件。',
  'checkout.continueShopping': '继续购物',

  'footer.about': '关于我们',
  'footer.aboutDesc': '不仅是风格的表达，更是极致优雅的生活态度。',
  'footer.quickLinks': '快捷链接',
  'footer.contactUs': '联系我们',
  'footer.rights': '版权所有。',

  'admin.dashboard': '仪表盘',
  'admin.products': '商品管理',
  'admin.categories': '分类管理',
  'admin.customers': '客户管理',
  'admin.orders': '订单管理',
  'admin.inventory': '库存管理',
  'admin.migration': '数据迁移',
  'admin.currency': '货币设置',
  'admin.payment': '支付设置',
  'admin.checkout': '结算设置',
};

export const translations: Record<Locale, TranslationKeys> = { en, pt, zh };
