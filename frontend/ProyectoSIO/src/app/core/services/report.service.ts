import { Injectable, inject } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ExpenseService } from './expense.service';
import { OrderService } from './order.service';
import { InventoryService } from './inventory.service';
import { ProductService } from './product.service';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: typeof autoTable;
  }
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private readonly expenseService = inject(ExpenseService);
  private readonly orderService = inject(OrderService);
  private readonly inventoryService = inject(InventoryService);
  private readonly productService = inject(ProductService);

  /**
   * Generar reporte financiero completo
   */
  generateFinancialReport(): void {
    const doc = new jsPDF();
    const stats = this.expenseService.financialStats();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    let yPos = 20;

    // Encabezado
    this.addHeader(doc, 'REPORTE FINANCIERO COMPLETO');
    yPos = 35;

    // Información general
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-CO')}`, 15, yPos);
    doc.text(`Período: Últimos 6 meses`, pageWidth - 15, yPos, { align: 'right' });
    yPos += 15;

    // Resumen Ejecutivo
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMEN EJECUTIVO', 15, yPos);
    yPos += 10;

    // Tarjetas de resumen
    const cardHeight = 35;
    const cardWidth = (pageWidth - 40) / 3;
    
    // Tarjeta 1: Ingresos
    doc.setFillColor(102, 126, 234);
    doc.roundedRect(15, yPos, cardWidth, cardHeight, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('INGRESOS TOTALES', 15 + cardWidth / 2, yPos + 10, { align: 'center' });
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(this.formatCurrency(stats.totalRevenue), 15 + cardWidth / 2, yPos + 22, { align: 'center' });
    
    // Tarjeta 2: Gastos
    doc.setFillColor(245, 87, 108);
    doc.roundedRect(15 + cardWidth + 5, yPos, cardWidth, cardHeight, 3, 3, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('GASTOS TOTALES', 15 + cardWidth + 5 + cardWidth / 2, yPos + 10, { align: 'center' });
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(this.formatCurrency(stats.totalExpenses), 15 + cardWidth + 5 + cardWidth / 2, yPos + 22, { align: 'center' });
    
    // Tarjeta 3: Ganancia
    const profitColor = stats.netProfit >= 0 ? [14, 165, 233] : [220, 38, 38];
    doc.setFillColor(profitColor[0], profitColor[1], profitColor[2]);
    doc.roundedRect(15 + (cardWidth + 5) * 2, yPos, cardWidth, cardHeight, 3, 3, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('GANANCIA NETA', 15 + (cardWidth + 5) * 2 + cardWidth / 2, yPos + 10, { align: 'center' });
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(this.formatCurrency(stats.netProfit), 15 + (cardWidth + 5) * 2 + cardWidth / 2, yPos + 22, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Margen: ${stats.profitMargin.toFixed(1)}%`, 15 + (cardWidth + 5) * 2 + cardWidth / 2, yPos + 30, { align: 'center' });
    
    yPos += cardHeight + 15;

    // Alertas
    if (stats.alerts.length > 0) {
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('⚠ ALERTAS Y RECOMENDACIONES', 15, yPos);
      yPos += 8;
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      stats.alerts.forEach(alert => {
        const icon = alert.type === 'danger' ? '⛔' : alert.type === 'warning' ? '⚠️' : 'ℹ️';
        const color = alert.type === 'danger' ? [220, 38, 38] : alert.type === 'warning' ? [245, 158, 11] : [59, 130, 246];
        doc.setTextColor(color[0], color[1], color[2]);
        const lines = doc.splitTextToSize(`${icon} ${alert.message}`, pageWidth - 30);
        doc.text(lines, 15, yPos);
        yPos += lines.length * 5 + 3;
      });
      yPos += 5;
    }

    // Nueva página para detalles
    if (yPos > pageHeight - 60) {
      doc.addPage();
      yPos = 20;
    }

    // Gastos por Categoría
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('GASTOS POR CATEGORÍA', 15, yPos);
    yPos += 8;

    if (stats.expensesByCategory.length > 0) {
      const categoryData = stats.expensesByCategory.map(cat => [
        cat.category,
        this.formatCurrency(cat.amount),
        `${cat.percentage.toFixed(1)}%`
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Categoría', 'Monto', 'Porcentaje']],
        body: categoryData,
        theme: 'grid',
        headStyles: { fillColor: [102, 126, 234], fontSize: 9, fontStyle: 'bold' },
        bodyStyles: { fontSize: 8 },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        margin: { left: 15, right: 15 }
      });

      yPos = (doc as any).lastAutoTable.finalY + 15;
    }

    // Nueva página si es necesario
    if (yPos > pageHeight - 80) {
      doc.addPage();
      yPos = 20;
    }

    // Productos Más Rentables
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('PRODUCTOS MÁS RENTABLES', 15, yPos);
    yPos += 8;

    if (stats.topProfitableProducts.length > 0) {
      const top5 = stats.topProfitableProducts.slice(0, 5);
      const productData = top5.map(p => [
        p.name,
        p.unitsSold.toString(),
        this.formatCurrency(p.revenue),
        this.formatCurrency(p.cost),
        this.formatCurrency(p.profit),
        `${p.margin.toFixed(1)}%`
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Producto', 'Vendidos', 'Ingresos', 'Costos', 'Ganancia', 'Margen']],
        body: productData,
        theme: 'grid',
        headStyles: { fillColor: [102, 126, 234], fontSize: 8, fontStyle: 'bold' },
        bodyStyles: { fontSize: 7 },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        margin: { left: 15, right: 15 },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { halign: 'center', cellWidth: 20 },
          2: { halign: 'right', cellWidth: 25 },
          3: { halign: 'right', cellWidth: 25 },
          4: { halign: 'right', cellWidth: 25 },
          5: { halign: 'center', cellWidth: 20 }
        }
      });

      yPos = (doc as any).lastAutoTable.finalY + 15;
    }

    // Nueva página para tendencias
    if (yPos > pageHeight - 60) {
      doc.addPage();
      yPos = 20;
    }

    // Comparativa Mensual (simulación de gráfico con texto)
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('TENDENCIAS INGRESOS VS GASTOS (Últimos 6 meses)', 15, yPos);
    yPos += 10;

    const maxValue = Math.max(
      ...stats.revenueByPeriod.map(r => r.amount),
      ...stats.expensesByPeriod.map(e => e.amount)
    );

    stats.revenueByPeriod.forEach((period, index) => {
      const expense = stats.expensesByPeriod[index];
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(period.period, 15, yPos);
      
      // Barra de ingresos
      const revenueWidth = maxValue > 0 ? (period.amount / maxValue) * 80 : 0;
      doc.setFillColor(102, 126, 234);
      doc.rect(50, yPos - 3, revenueWidth, 3, 'F');
      doc.setTextColor(102, 126, 234);
      doc.text(this.formatCurrency(period.amount), 135, yPos);
      
      yPos += 5;
      
      // Barra de gastos
      const expenseWidth = maxValue > 0 ? (expense.amount / maxValue) * 80 : 0;
      doc.setFillColor(245, 87, 108);
      doc.rect(50, yPos - 3, expenseWidth, 3, 'F');
      doc.setTextColor(245, 87, 108);
      doc.text(this.formatCurrency(expense.amount), 135, yPos);
      
      yPos += 8;
    });

    // Leyenda
    yPos += 5;
    doc.setFillColor(102, 126, 234);
    doc.rect(15, yPos - 2, 8, 3, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(8);
    doc.text('Ingresos', 25, yPos);

    doc.setFillColor(245, 87, 108);
    doc.rect(55, yPos - 2, 8, 3, 'F');
    doc.text('Gastos', 65, yPos);

    // Pie de página
    this.addFooter(doc);

    // Guardar
    const fileName = `reporte-financiero-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  }

  /**
   * Generar reporte de inventario
   */
  generateInventoryReport(): void {
    const doc = new jsPDF();
    const stats = this.inventoryService.getInventoryStats();
    const products = this.productService.allProducts();
    const alerts = this.inventoryService.activeAlerts();
    const pageWidth = doc.internal.pageSize.width;
    let yPos = 20;

    // Calcular estadísticas de inventario
    const totalProducts = products.length;
    const inStock = products.filter(p => p.inStock).length;
    const outOfStock = products.filter(p => !p.inStock).length;
    const lowStock = alerts.filter(a => a.severity === 'low').length;
    const totalInventoryValue = products.reduce((sum, p) => 
      sum + ((p.cost || p.price) * (p.stockCount || 0)), 0
    );

    // Encabezado
    this.addHeader(doc, 'REPORTE DE INVENTARIO');
    yPos = 35;

    // Información general
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-CO')}`, 15, yPos);
    yPos += 15;

    // Resumen
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMEN DE INVENTARIO', 15, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total de productos: ${totalProducts}`, 15, yPos);
    yPos += 6;
    doc.text(`En stock: ${inStock}`, 15, yPos);
    yPos += 6;
    doc.text(`Agotados: ${outOfStock}`, 15, yPos);
    yPos += 6;
    doc.text(`Stock bajo: ${lowStock}`, 15, yPos);
    yPos += 6;
    doc.text(`Valor total inventario: ${this.formatCurrency(totalInventoryValue)}`, 15, yPos);
    yPos += 15;

    // Alertas críticas
    if (alerts.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(220, 38, 38);
      doc.text('⚠ ALERTAS CRÍTICAS', 15, yPos);
      yPos += 8;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      alerts.slice(0, 5).forEach(alert => {
        const severity = alert.severity === 'out' ? '🔴' : alert.severity === 'low' ? '🟡' : '🔵';
        const product = products.find(p => p.id === alert.productId);
        doc.text(`${severity} ${product?.name || 'Producto'}: ${alert.severity === 'out' ? 'Agotado' : 'Stock bajo'}`, 15, yPos);
        yPos += 5;
      });
      yPos += 10;
    }

    // Tabla de productos
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DETALLE DE PRODUCTOS', 15, yPos);
    yPos += 8;

    const productData = products.map(p => [
      p.name,
      p.category || '-',
      this.formatCurrency(p.price),
      p.cost ? this.formatCurrency(p.cost) : '-',
      p.stockCount?.toString() || '0',
      p.inStock ? '✓' : '✗'
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Producto', 'Categoría', 'Precio', 'Costo', 'Stock', 'Disponible', 'Mín']],
      body: productData,
      theme: 'grid',
      headStyles: { fillColor: [139, 92, 246], fontSize: 8, fontStyle: 'bold' },
      bodyStyles: { fontSize: 7 },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      margin: { left: 15, right: 15 },
      columnStyles: {
        2: { halign: 'right' },
        3: { halign: 'right' },
        4: { halign: 'center' },
        5: { halign: 'center' },
        6: { halign: 'center' }
      }
    });

    // Pie de página
    this.addFooter(doc);

    // Guardar
    const fileName = `reporte-inventario-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  }

  /**
   * Generar reporte de pedidos
   */
  generateOrdersReport(): void {
    const doc = new jsPDF();
    const stats = this.orderService.stats();
    const orders = this.orderService.orders();
    const pageWidth = doc.internal.pageSize.width;
    let yPos = 20;

    // Encabezado
    this.addHeader(doc, 'REPORTE DE PEDIDOS');
    yPos = 35;

    // Información general
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-CO')}`, 15, yPos);
    yPos += 15;

    // Resumen
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMEN DE PEDIDOS', 15, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total de pedidos: ${stats.totalOrders}`, 15, yPos);
    yPos += 6;
    doc.text(`Pendientes: ${stats.pendingOrders}`, 15, yPos);
    yPos += 6;
    doc.text(`Completados: ${stats.completedOrders}`, 15, yPos);
    yPos += 6;
    doc.text(`Ingresos totales: ${this.formatCurrency(stats.totalRevenue)}`, 15, yPos);
    yPos += 6;
    doc.text(`Valor promedio por pedido: ${this.formatCurrency(stats.averageOrderValue)}`, 15, yPos);
    yPos += 6;
    doc.text(`Clientes únicos: ${stats.uniqueCustomers}`, 15, yPos);
    yPos += 15;

    // Productos más vendidos
    if (stats.topProducts.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('PRODUCTOS MÁS VENDIDOS', 15, yPos);
      yPos += 8;

      const topProductsData = stats.topProducts.slice(0, 10).map(p => [
        p.name,
        p.count.toString(),
        this.formatCurrency(p.revenue)
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Producto', 'Cantidad Vendida', 'Ingresos']],
        body: topProductsData,
        theme: 'grid',
        headStyles: { fillColor: [37, 211, 102], fontSize: 9, fontStyle: 'bold' },
        bodyStyles: { fontSize: 8 },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        margin: { left: 15, right: 15 },
        columnStyles: {
          1: { halign: 'center' },
          2: { halign: 'right' }
        }
      });

      yPos = (doc as any).lastAutoTable.finalY + 15;
    }

    // Nueva página para detalle de pedidos
    doc.addPage();
    yPos = 20;

    // Tabla de pedidos recientes
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DETALLE DE PEDIDOS RECIENTES', 15, yPos);
    yPos += 8;

    const recentOrders = orders.slice(0, 20);
    const orderData = recentOrders.map(o => [
      o.id.slice(0, 8),
      new Date(o.date).toLocaleDateString('es-CO'),
      o.customerName || o.phoneNumber,
      o.items.length.toString(),
      this.formatCurrency(o.total),
      this.getStatusLabel(o.status)
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['ID', 'Fecha', 'Cliente', 'Items', 'Total', 'Estado']],
      body: orderData,
      theme: 'grid',
      headStyles: { fillColor: [37, 211, 102], fontSize: 8, fontStyle: 'bold' },
      bodyStyles: { fontSize: 7 },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      margin: { left: 15, right: 15 },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 25 },
        2: { cellWidth: 40 },
        3: { halign: 'center', cellWidth: 15 },
        4: { halign: 'right', cellWidth: 25 },
        5: { halign: 'center', cellWidth: 30 }
      }
    });

    // Pie de página
    this.addFooter(doc);

    // Guardar
    const fileName = `reporte-pedidos-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  }

  /**
   * Generar reporte completo del negocio
   */
  generateCompleteReport(): void {
    const doc = new jsPDF();
    const financialStats = this.expenseService.financialStats();
    const inventoryStats = this.inventoryService.getInventoryStats();
    const orderStats = this.orderService.stats();
    const allProducts = this.productService.allProducts();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    let yPos = 20;

    // Portada
    doc.setFillColor(102, 126, 234);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('REPORTE COMPLETO', pageWidth / 2, pageHeight / 2 - 30, { align: 'center' });
    
    doc.setFontSize(18);
    doc.setFont('helvetica', 'normal');
    doc.text('DEL NEGOCIO', pageWidth / 2, pageHeight / 2 - 15, { align: 'center' });
    
    doc.setFontSize(14);
    const today = new Date().toLocaleDateString('es-CO', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    doc.text(today, pageWidth / 2, pageHeight / 2 + 10, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text('Reporte generado automáticamente', pageWidth / 2, pageHeight - 30, { align: 'center' });

    // Página 1: Resumen Ejecutivo
    doc.addPage();
    yPos = 20;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMEN EJECUTIVO', 15, yPos);
    yPos += 15;

    // Dashboard de métricas clave
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('MÉTRICAS CLAVE DEL NEGOCIO', 15, yPos);
    yPos += 10;

    // Crear cuadrícula de métricas
    const totalProducts = allProducts.length;
    const inStock = allProducts.filter(p => p.inStock).length;
    const outOfStock = allProducts.filter(p => !p.inStock).length;
    const lowStock = inventoryStats.lowStockProducts;
    const totalInventoryValue = allProducts.reduce((sum, p) => 
      sum + ((p.cost || p.price) * (p.stockCount || 0)), 0
    );
    
    const metrics = [
      { label: 'Ingresos Totales', value: this.formatCurrency(financialStats.totalRevenue), color: [102, 126, 234] },
      { label: 'Gastos Totales', value: this.formatCurrency(financialStats.totalExpenses), color: [245, 87, 108] },
      { label: 'Ganancia Neta', value: this.formatCurrency(financialStats.netProfit), color: financialStats.netProfit >= 0 ? [14, 165, 233] : [220, 38, 38] },
      { label: 'Margen de Ganancia', value: `${financialStats.profitMargin.toFixed(1)}%`, color: [139, 92, 246] },
      { label: 'Total Pedidos', value: orderStats.totalOrders.toString(), color: [37, 211, 102] },
      { label: 'Valor Inventario', value: this.formatCurrency(totalInventoryValue), color: [245, 158, 11] }
    ];

    const metricsPerRow = 2;
    const metricWidth = (pageWidth - 40) / metricsPerRow;
    const metricHeight = 25;

    metrics.forEach((metric, index) => {
      const row = Math.floor(index / metricsPerRow);
      const col = index % metricsPerRow;
      const x = 15 + (col * (metricWidth + 10));
      const y = yPos + (row * (metricHeight + 5));

      doc.setFillColor(metric.color[0], metric.color[1], metric.color[2]);
      doc.roundedRect(x, y, metricWidth, metricHeight, 2, 2, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(metric.label, x + metricWidth / 2, y + 10, { align: 'center' });
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(metric.value, x + metricWidth / 2, y + 20, { align: 'center' });
    });

    yPos += Math.ceil(metrics.length / metricsPerRow) * (metricHeight + 5) + 15;

    // Conclusiones y recomendaciones
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('ANÁLISIS Y RECOMENDACIONES', 15, yPos);
    yPos += 10;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    const conclusions = [];
    
    // Análisis financiero
    if (financialStats.netProfit > 0) {
      conclusions.push(`✅ El negocio es rentable con ${this.formatCurrency(financialStats.netProfit)} de ganancia neta.`);
    } else {
      conclusions.push(`⚠️ El negocio está en pérdidas de ${this.formatCurrency(Math.abs(financialStats.netProfit))}.`);
    }

    if (financialStats.profitMargin >= 20) {
      conclusions.push(`✅ Margen de ganancia saludable del ${financialStats.profitMargin.toFixed(1)}%.`);
    } else if (financialStats.profitMargin >= 10) {
      conclusions.push(`⚡ Margen de ganancia moderado del ${financialStats.profitMargin.toFixed(1)}%.`);
    } else {
      conclusions.push(`⚠️ Margen de ganancia bajo del ${financialStats.profitMargin.toFixed(1)}%.`);
    }

    // Análisis de inventario
    if (lowStock > 0) {
      conclusions.push(`⚠️ ${lowStock} productos con stock bajo. Reabastecer pronto.`);
    }
    if (outOfStock > 0) {
      conclusions.push(`🔴 ${outOfStock} productos agotados. Pérdida de ventas potencial.`);
    }

    // Análisis de ventas
    if (orderStats.pendingOrders > 0) {
      conclusions.push(`📋 ${orderStats.pendingOrders} pedidos pendientes de procesar.`);
    }

    conclusions.forEach(conclusion => {
      const lines = doc.splitTextToSize(conclusion, pageWidth - 30);
      doc.text(lines, 15, yPos);
      yPos += lines.length * 5 + 2;
    });

    // Resto de secciones
    doc.addPage();
    yPos = 20;

    // Sección Financiera
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('1. ANÁLISIS FINANCIERO', 15, yPos);
    yPos += 10;

    // Gastos por categoría
    if (financialStats.expensesByCategory.length > 0) {
      doc.setFontSize(11);
      doc.text('Gastos por Categoría', 15, yPos);
      yPos += 8;

      const categoryData = financialStats.expensesByCategory.map(cat => [
        cat.category,
        this.formatCurrency(cat.amount),
        `${cat.percentage.toFixed(1)}%`
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Categoría', 'Monto', '%']],
        body: categoryData,
        theme: 'grid',
        headStyles: { fillColor: [102, 126, 234], fontSize: 9 },
        bodyStyles: { fontSize: 8 },
        margin: { left: 15, right: 15 }
      });

      yPos = (doc as any).lastAutoTable.finalY + 15;
    }

    // Nueva página para sección de inventario
    doc.addPage();
    yPos = 20;

    // Sección Inventario
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('2. ESTADO DEL INVENTARIO', 15, yPos);
    yPos += 10;

    const productData = allProducts.slice(0, 15).map(p => [
      p.name,
      p.category || '-',
      p.stockCount?.toString() || '0',
      p.inStock ? '✓' : '✗'
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Producto', 'Categoría', 'Stock', 'Disponible']],
      body: productData,
      theme: 'grid',
      headStyles: { fillColor: [139, 92, 246], fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      margin: { left: 15, right: 15 }
    });

    // Nueva página para pedidos
    doc.addPage();
    yPos = 20;

    // Sección Pedidos
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('3. ANÁLISIS DE PEDIDOS', 15, yPos);
    yPos += 10;

    if (orderStats.topProducts.length > 0) {
      doc.setFontSize(11);
      doc.text('Productos Más Vendidos', 15, yPos);
      yPos += 8;

      const topProductsData = orderStats.topProducts.slice(0, 10).map(p => [
        p.name,
        p.count.toString(),
        this.formatCurrency(p.revenue)
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Producto', 'Cantidad', 'Ingresos']],
        body: topProductsData,
        theme: 'grid',
        headStyles: { fillColor: [37, 211, 102], fontSize: 9 },
        bodyStyles: { fontSize: 8 },
        margin: { left: 15, right: 15 }
      });
    }

    // Pie de página en todas las páginas
    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      this.addFooter(doc, i, totalPages);
    }

    // Guardar
    const fileName = `reporte-completo-negocio-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  }

  // Métodos auxiliares
  private addHeader(doc: jsPDF, title: string): void {
    const pageWidth = doc.internal.pageSize.width;
    
    // Fondo del header
    doc.setFillColor(102, 126, 234);
    doc.rect(0, 0, pageWidth, 25, 'F');
    
    // Título
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(title, pageWidth / 2, 16, { align: 'center' });
  }

  private addFooter(doc: jsPDF, pageNum?: number, totalPages?: number): void {
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.setFont('helvetica', 'normal');
    
    const footerText = `Generado el ${new Date().toLocaleDateString('es-CO')} a las ${new Date().toLocaleTimeString('es-CO')}`;
    doc.text(footerText, 15, pageHeight - 10);
    
    if (pageNum && totalPages) {
      doc.text(`Página ${pageNum} de ${totalPages}`, pageWidth - 15, pageHeight - 10, { align: 'right' });
    }
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  }

  private getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'pending': 'Pendiente',
      'confirmed': 'Confirmado',
      'completed': 'Completado',
      'cancelled': 'Cancelado',
      'no-response': 'Sin respuesta'
    };
    return labels[status] || status;
  }
}
