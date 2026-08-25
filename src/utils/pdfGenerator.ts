import { jsPDF } from 'jspdf';
import { Booking } from '../types';

export const generateBookingInvoicePDF = (booking: Booking): void => {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    let y = 14;

    // --- 1. HEADER BRANDING & INVOICE TITLE ---
    // Header Dark Banner
    doc.setFillColor(15, 23, 42); // slate-900
    doc.roundedRect(margin, y, pageWidth - margin * 2, 28, 3, 3, 'F');

    // Business Name
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('SHREE SHYAM TENT HOUSE & EVENT SERVICES', margin + 6, y + 9);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(203, 213, 225); // slate-300
    doc.text('Wedding Mandap | Water-Proof Pandals | Halwai Utensils | Sound & Lighting', margin + 6, y + 15);
    doc.text('Helpline: +91 8418067579, 9876543210 | Village & City Event Delivery Service', margin + 6, y + 21);

    // Invoice badge on right
    doc.setFillColor(16, 185, 129); // emerald-500
    doc.roundedRect(pageWidth - margin - 45, y + 5, 39, 18, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('TAX / RENTAL INVOICE', pageWidth - margin - 43, y + 11);
    doc.setFontSize(10);
    doc.text(booking.bookingNumber, pageWidth - margin - 43, y + 18);

    y += 34;

    // --- 2. INVOICE META & STATUS ---
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.roundedRect(margin, y, pageWidth - margin * 2, 14, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    doc.text(`Invoice Date: ${new Date().toLocaleDateString('en-IN')}`, margin + 5, y + 6);
    doc.text(`Booking Status: ${booking.status.toUpperCase()}`, margin + 65, y + 6);
    doc.text(`Payment: ${booking.paymentStatus.toUpperCase()} (${booking.paymentMethod})`, margin + 125, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Event Type: ${booking.eventType || 'Special Function'}`, margin + 5, y + 11);
    doc.text(`Estimated Guests: ${booking.guestCount || '100+'} Guests`, margin + 65, y + 11);
    doc.text(`Assigned Crew: ${booking.assignedCrew || 'Master Rigging Team 1'}`, margin + 125, y + 11);

    y += 18;

    // --- 3. CUSTOMER & VENUE DETAILS (2 COLUMNS) ---
    const colW = (pageWidth - margin * 2 - 6) / 2;

    // Column 1: Customer Details
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(margin, y, colW, 28, 2, 2, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, y, colW, 28, 2, 2, 'D');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('CUSTOMER / CLIENT DETAILS', margin + 4, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    doc.text(`Name: ${booking.customerName}`, margin + 4, y + 12);
    doc.text(`Phone / Mobile: +91 ${booking.customerPhone}`, margin + 4, y + 17);
    doc.text(`Email: ${booking.customerEmail || 'Not Provided'}`, margin + 4, y + 22);

    // Column 2: Event Venue & Schedule
    const col2X = margin + colW + 6;
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(col2X, y, colW, 28, 2, 2, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(col2X, y, colW, 28, 2, 2, 'D');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('VENUE & DELIVERY SCHEDULE', col2X + 4, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    doc.text(`Dates: ${booking.startDate} to ${booking.endDate} (${booking.totalDays} Days)`, col2X + 4, y + 12);
    doc.text(`Village / City: ${booking.villageOrCity}${booking.district ? `, ${booking.district}` : ''}`, col2X + 4, y + 17);
    const landmarkStr = booking.landmark ? ` (Landmark: ${booking.landmark})` : '';
    const addressStr = `Address: ${booking.deliveryAddress}${landmarkStr}`;
    doc.text(doc.splitTextToSize(addressStr, colW - 8)[0] || addressStr, col2X + 4, y + 22);

    y += 33;

    // --- 4. ITEMIZED INVENTORY & SERVICE TABLE ---
    doc.setFillColor(15, 23, 42);
    doc.rect(margin, y, pageWidth - margin * 2, 7, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text('SR', margin + 3, y + 4.8);
    doc.text('ITEM DESCRIPTION & SPECIFICATION', margin + 12, y + 4.8);
    doc.text('QTY / UNIT', margin + 95, y + 4.8);
    doc.text('RATE / DAY', margin + 125, y + 4.8);
    doc.text('DAYS', margin + 148, y + 4.8);
    doc.text('TOTAL (INR)', pageWidth - margin - 22, y + 4.8);

    y += 7;

    let srNo = 1;

    // Row 1: Main Tent
    doc.setFillColor(255, 255, 255);
    doc.rect(margin, y, pageWidth - margin * 2, 8, 'F');
    doc.setDrawColor(241, 245, 249);
    doc.line(margin, y + 8, pageWidth - margin, y + 8);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(`${srNo++}`, margin + 3, y + 5.5);
    
    // Clean string for PDF to avoid unicode corruption in basic font
    const cleanTentName = booking.tentName.replace(/[^\x00-\x7F]/g, '');
    doc.text(cleanTentName || 'Main Event Tent Package', margin + 12, y + 4);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(`Surface: ${booking.surfaceType} | Peak Height Frame & Side Kanat`, margin + 12, y + 7.2);

    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text('1 Tent Unit', margin + 95, y + 5.5);
    const tentDailyRate = Math.round(booking.baseRentTotal / Math.max(1, booking.totalDays));
    doc.text(`Rs. ${tentDailyRate.toLocaleString('en-IN')}`, margin + 125, y + 5.5);
    doc.text(`${booking.totalDays}`, margin + 150, y + 5.5);
    doc.setFont('helvetica', 'bold');
    doc.text(`Rs. ${booking.baseRentTotal.toLocaleString('en-IN')}`, pageWidth - margin - 22, y + 5.5);

    y += 8.5;

    // Addon Rows
    if (booking.addons && booking.addons.length > 0) {
      booking.addons.forEach(add => {
        // Prevent page overflow
        if (y > pageHeight - 65) {
          doc.addPage();
          y = 15;
        }

        doc.setFillColor(srNo % 2 === 0 ? 250 : 255, srNo % 2 === 0 ? 250 : 255, srNo % 2 === 0 ? 250 : 255);
        doc.rect(margin, y, pageWidth - margin * 2, 7.5, 'F');
        doc.setDrawColor(241, 245, 249);
        doc.line(margin, y + 7.5, pageWidth - margin, y + 7.5);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(15, 23, 42);
        doc.text(`${srNo++}`, margin + 3, y + 5);

        const cleanAddonName = add.name.replace(/[^\x00-\x7F]/g, '');
        doc.text(cleanAddonName || 'Event Equipment Addon', margin + 12, y + 4);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        doc.text(`Category: ${add.category || 'Inventory Item'}`, margin + 12, y + 6.8);

        doc.setFontSize(8);
        doc.setTextColor(51, 65, 85);
        doc.text(`${add.quantity} (${add.unit.replace(/[^\x00-\x7F]/g, '') || 'Unit'})`, margin + 95, y + 5);
        doc.text(`Rs. ${add.pricePerDay.toLocaleString('en-IN')}`, margin + 125, y + 5);
        doc.text(`${booking.totalDays}`, margin + 150, y + 5);
        
        const rowTotal = add.pricePerDay * add.quantity * booking.totalDays;
        doc.setFont('helvetica', 'bold');
        doc.text(`Rs. ${rowTotal.toLocaleString('en-IN')}`, pageWidth - margin - 22, y + 5);

        y += 7.8;
      });
    }

    y += 2;

    // --- 5. FINANCIAL BREAKDOWN & TOTALS (Right-aligned Summary) ---
    const summaryW = 85;
    const summaryX = pageWidth - margin - summaryW;

    doc.setFillColor(248, 250, 252);
    doc.roundedRect(summaryX, y, summaryW, 36, 2, 2, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(summaryX, y, summaryW, 36, 2, 2, 'D');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);

    doc.text('Base Tent Rental:', summaryX + 4, y + 6);
    doc.text(`Rs. ${booking.baseRentTotal.toLocaleString('en-IN')}`, summaryX + summaryW - 4, y + 6, { align: 'right' });

    doc.text('Additional Equipment & Addons:', summaryX + 4, y + 11);
    doc.text(`Rs. ${booking.addonsTotal.toLocaleString('en-IN')}`, summaryX + summaryW - 4, y + 11, { align: 'right' });

    doc.text('Transport & Setup Rigging Fee:', summaryX + 4, y + 16);
    doc.text(`Rs. ${booking.transportSetupFee.toLocaleString('en-IN')}`, summaryX + summaryW - 4, y + 16, { align: 'right' });

    doc.text('Refundable Security Deposit:', summaryX + 4, y + 21);
    doc.text(`Rs. ${booking.securityDeposit.toLocaleString('en-IN')}`, summaryX + summaryW - 4, y + 21, { align: 'right' });

    // Grand Total Bar
    doc.setFillColor(16, 185, 129); // emerald-500
    doc.roundedRect(summaryX + 2, y + 24, summaryW - 4, 9, 1.5, 1.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text('NET GRAND TOTAL:', summaryX + 5, y + 30);
    doc.setFontSize(9.5);
    doc.text(`Rs. ${booking.grandTotal.toLocaleString('en-IN')}`, summaryX + summaryW - 5, y + 30, { align: 'right' });

    // Paid & Balance row in Summary
    const totalPaid = booking.paidAmount ?? (booking.paymentStatus === 'Paid in Full' || booking.paymentStatus === 'Full Paid' ? booking.grandTotal : 0);
    const balanceDue = booking.balanceAmount ?? Math.max(0, booking.grandTotal - totalPaid);

    y += 35;

    // Installments Schedule Table (Village Multi-Stage Payment Ledger)
    if (booking.installments && booking.installments.length > 0) {
      doc.setFillColor(15, 23, 42);
      doc.rect(margin, y, pageWidth - margin * 2, 6, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(255, 255, 255);
      doc.text('VILLAGE PAYMENT SCHEDULE & INSTALLMENT KHATA (2-3 KIST HISAB)', margin + 4, y + 4.2);
      doc.text('SCHEDULED', margin + 95, y + 4.2);
      doc.text('PAID (JAMA)', margin + 125, y + 4.2);
      doc.text('STATUS', margin + 155, y + 4.2);

      y += 6;

      booking.installments.forEach((inst, idx) => {
        doc.setFillColor(idx % 2 === 0 ? 255 : 248, 250, 252);
        doc.rect(margin, y, pageWidth - margin * 2, 6.5, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, y + 6.5, pageWidth - margin, y + 6.5);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(15, 23, 42);
        doc.text(inst.titleHindi || `Installment ${idx + 1}`, margin + 4, y + 4.5);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(51, 65, 85);
        doc.text(`Rs. ${inst.scheduledAmount.toLocaleString('en-IN')}`, margin + 95, y + 4.5);
        
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(inst.paidAmount > 0 ? 16 : 100, inst.paidAmount > 0 ? 185 : 116, inst.paidAmount > 0 ? 129 : 139);
        doc.text(`Rs. ${(inst.paidAmount || 0).toLocaleString('en-IN')}`, margin + 125, y + 4.5);

        const statusLabel = inst.status === 'Paid' ? 'PAID [Chukta]' : (inst.status === 'Partially Paid' ? 'PARTIAL' : 'PENDING [Baqi]');
        doc.setTextColor(inst.status === 'Paid' ? 16 : (inst.status === 'Partially Paid' ? 217 : 220), inst.status === 'Paid' ? 185 : (inst.status === 'Partially Paid' ? 119 : 38), inst.status === 'Paid' ? 129 : 38);
        doc.text(statusLabel, margin + 155, y + 4.5);

        y += 6.5;
      });

      // Ledger Totals
      doc.setFillColor(241, 245, 249);
      doc.rect(margin, y, pageWidth - margin * 2, 7, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text(`Total Paid (Kul Jama): Rs. ${totalPaid.toLocaleString('en-IN')}`, margin + 4, y + 5);
      
      doc.setTextColor(balanceDue > 0 ? 220 : 16, balanceDue > 0 ? 38 : 185, balanceDue > 0 ? 38 : 129);
      doc.text(`Remaining Balance Due (Baqi Udhar): Rs. ${balanceDue.toLocaleString('en-IN')}`, margin + 95, y + 5);

      y += 9;
    } else {
      // Simple Paid / Balance summary
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(margin, y, pageWidth - margin * 2, 7, 1.5, 1.5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text(`Total Paid: Rs. ${totalPaid.toLocaleString('en-IN')}`, margin + 4, y + 4.8);
      doc.setTextColor(balanceDue > 0 ? 220 : 16, balanceDue > 0 ? 38 : 185, balanceDue > 0 ? 38 : 129);
      doc.text(`Remaining Balance Due: Rs. ${balanceDue.toLocaleString('en-IN')}`, margin + 95, y + 4.8);
      y += 9;
    }

    // Left Notes & Terms Box
    doc.setFillColor(254, 252, 232); // amber-50
    doc.roundedRect(margin, y, pageWidth - margin * 2, 16, 2, 2, 'F');
    doc.setDrawColor(254, 240, 138); // amber-200
    doc.roundedRect(margin, y, pageWidth - margin * 2, 16, 2, 2, 'D');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(146, 64, 14); // amber-800
    doc.text('TERMS & VILLAGE DELIVERY GUIDELINES:', margin + 4, y + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(113, 63, 18);
    doc.text('1. Payment is accepted in 2-3 installments: Advance token (Sai), On Tent Setup, & Final count after event.', margin + 4, y + 8.5);
    doc.text('2. Please ensure ground clearance and electricity connection before rigging crew arrives.', margin + 4, y + 12);

    y += 18;

    // --- 6. SIGNATURE FOOTER ---
    doc.setDrawColor(203, 213, 225);
    doc.line(margin + 5, y + 12, margin + 55, y + 12);
    doc.line(pageWidth - margin - 55, y + 12, pageWidth - margin - 5, y + 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Authorized Signature & Seal', margin + 12, y + 16);
    doc.text('(Shree Shyam Tent House)', margin + 14, y + 19.5);

    doc.text('Customer Acknowledgement', pageWidth - margin - 48, y + 16);
    doc.text(`(Sign: ${booking.customerName})`, pageWidth - margin - 44, y + 19.5);

    // Save & Trigger Download
    const fileName = `Invoice_${booking.bookingNumber}_${booking.customerName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    doc.save(fileName);
  } catch (err) {
    console.error('Failed to generate PDF:', err);
    // Fallback: trigger standard browser print dialog
    window.print();
  }
};
