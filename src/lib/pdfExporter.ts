import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ProjectSite, MaterialItem, WorkerProfile, SiteUpdateLog, SafetyIncident, BudgetExpense } from '../types';

export function exportExecutiveProjectPDF(
  project: ProjectSite,
  materials: MaterialItem[],
  workers: WorkerProfile[],
  updates: SiteUpdateLog[],
  incidents: SafetyIncident[],
  expenses: BudgetExpense[]
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header Banner
  doc.setFillColor(26, 35, 126); // Deep Navy
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('BUILDPULSE PRO : STAKEHOLDER EXECUTIVE REPORT', 14, 13);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on: ${new Date().toLocaleString('en-IN')} | Project Code: ${project.code}`, 14, 21);

  // Project Overview Section
  let y = 36;
  doc.setTextColor(26, 35, 126);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(`Project: ${project.name}`, 14, y);

  y += 6;
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Client: ${project.client}`, 14, y);
  doc.text(`Location: ${project.location}`, 110, y);

  y += 5;
  doc.text(`Site Supervisor: ${project.supervisorName} (${project.supervisorPhone})`, 14, y);
  doc.text(`Timeline: ${project.startDate} to ${project.targetEndDate}`, 110, y);

  // KPI Stat Boxes
  y += 8;
  doc.setDrawColor(220, 224, 230);
  doc.setFillColor(245, 247, 250);
  
  // Box 1: Progress
  doc.roundedRect(14, y, 42, 18, 2, 2, 'FD');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('Overall Progress', 18, y + 6);
  doc.setFontSize(12);
  doc.setTextColor(16, 114, 212);
  doc.setFont('helvetica', 'bold');
  doc.text(`${project.progressPercentage}%`, 18, y + 14);

  // Box 2: Budget
  doc.setFont('helvetica', 'normal');
  doc.roundedRect(60, y, 42, 18, 2, 2, 'FD');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('Budget Expended', 64, y + 6);
  doc.setFontSize(11);
  doc.setTextColor(34, 139, 34);
  doc.setFont('helvetica', 'bold');
  doc.text(`₹${(project.spentBudget / 10000000).toFixed(2)} Cr`, 64, y + 14);

  // Box 3: Active Labor
  doc.setFont('helvetica', 'normal');
  doc.roundedRect(106, y, 42, 18, 2, 2, 'FD');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('On-Site Labor', 110, y + 6);
  doc.setFontSize(12);
  doc.setTextColor(230, 81, 0);
  doc.setFont('helvetica', 'bold');
  doc.text(`${workers.filter((w) => w.status === 'Active On-Site').length} Active`, 110, y + 14);

  // Box 4: Safety Incidents
  doc.setFont('helvetica', 'normal');
  doc.roundedRect(152, y, 44, 18, 2, 2, 'FD');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('Safety Status', 156, y + 6);
  doc.setFontSize(11);
  const openInc = incidents.filter((i) => i.status !== 'Resolved').length;
  doc.setTextColor(openInc > 0 ? 211 : 34, openInc > 0 ? 47 : 139, openInc > 0 ? 47 : 34);
  doc.setFont('helvetica', 'bold');
  doc.text(openInc === 0 ? 'Zero Open' : `${openInc} Open Flags`, 156, y + 14);

  // Table 1: Material Inventory & Low Stock
  y += 26;
  doc.setTextColor(26, 35, 126);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Material Inventory & Supply Chain Status', 14, y);

  const materialRows = materials.map((m) => [
    m.name,
    m.category,
    `${m.quantity} ${m.unit}`,
    `${m.minThreshold} ${m.unit}`,
    m.status,
    `Rs. ${m.costPerUnit.toLocaleString('en-IN')}`,
    `Rs. ${m.totalValue.toLocaleString('en-IN')}`,
  ]);

  autoTable(doc, {
    startY: y + 3,
    head: [['Item Name', 'Category', 'Stock Qty', 'Min Thresh', 'Status', 'Unit Rate', 'Total Value']],
    body: materialRows,
    theme: 'striped',
    headStyles: { fillColor: [40, 53, 147], textColor: 255, fontSize: 8 },
    bodyStyles: { fontSize: 7.5 },
    margin: { left: 14, right: 14 },
  });

  // Table 2: Budget & Cost Code Spend
  let currentY = (doc as any).lastAutoTable.finalY + 8;
  if (currentY > 230) {
    doc.addPage();
    currentY = 20;
  }

  doc.setTextColor(26, 35, 126);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('2. Budget Cost Codes & Expenditure Variance', 14, currentY);

  const expenseRows = expenses.map((e) => [
    e.costCode,
    e.title,
    e.category,
    `Rs. ${e.plannedAmount.toLocaleString('en-IN')}`,
    `Rs. ${e.actualAmount.toLocaleString('en-IN')}`,
    `Rs. ${e.variance.toLocaleString('en-IN')}`,
    e.status,
  ]);

  autoTable(doc, {
    startY: currentY + 3,
    head: [['Cost Code', 'Description', 'Category', 'Planned (Rs.)', 'Actual (Rs.)', 'Variance (Rs.)', 'Approval']],
    body: expenseRows,
    theme: 'striped',
    headStyles: { fillColor: [46, 125, 50], textColor: 255, fontSize: 8 },
    bodyStyles: { fontSize: 7.5 },
    margin: { left: 14, right: 14 },
  });

  // Table 3: Safety Audit & Incidents
  currentY = (doc as any).lastAutoTable.finalY + 8;
  if (currentY > 230) {
    doc.addPage();
    currentY = 20;
  }

  doc.setTextColor(26, 35, 126);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('3. Safety Compliance & Hazard Logs (OSHA / IS Codes)', 14, currentY);

  const incidentRows = incidents.map((i) => [
    i.title,
    i.type,
    i.severity,
    i.locationOnSite,
    i.status,
    i.reportedBy,
    i.correctiveAction || 'Action in progress',
  ]);

  autoTable(doc, {
    startY: currentY + 3,
    head: [['Hazard / Incident', 'Type', 'Severity', 'Site Location', 'Status', 'Reporter', 'Corrective Action']],
    body: incidentRows,
    theme: 'striped',
    headStyles: { fillColor: [198, 40, 40], textColor: 255, fontSize: 8 },
    bodyStyles: { fontSize: 7.5 },
    margin: { left: 14, right: 14 },
  });

  // Table 4: Recent Site Diary Updates
  currentY = (doc as any).lastAutoTable.finalY + 8;
  if (currentY > 220) {
    doc.addPage();
    currentY = 20;
  }

  doc.setTextColor(26, 35, 126);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('4. Recent Daily Site Progress Diary Entries', 14, currentY);

  const updateRows = updates.slice(0, 5).map((u) => [
    new Date(u.timestamp).toLocaleDateString('en-IN'),
    u.title,
    u.stage,
    `${u.progressPercentage}%`,
    `${u.laborCount} Workers`,
    u.supervisorName,
  ]);

  autoTable(doc, {
    startY: currentY + 3,
    head: [['Date', 'Work Log Title', 'Stage', 'Progress', 'Crew Count', 'Supervisor']],
    body: updateRows,
    theme: 'striped',
    headStyles: { fillColor: [69, 90, 100], textColor: 255, fontSize: 8 },
    bodyStyles: { fontSize: 7.5 },
    margin: { left: 14, right: 14 },
  });

  // Footer / Sign-off stamp
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(140, 140, 140);
    doc.text(
      `BuildPulse Pro Enterprise Construction Cloud | Confidential Stakeholder Document | Page ${i} of ${pageCount}`,
      14,
      doc.internal.pageSize.getHeight() - 8
    );
  }

  doc.save(`${project.code}_Stakeholder_Progress_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
}
