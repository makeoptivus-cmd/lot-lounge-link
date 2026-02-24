import { storage } from './storage';
import { indexedDBStorage } from './indexedDBStorage';
import { MediaValue, isMediaRef } from './mediaTypes';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PDFExportOptions {
  includePhotos?: boolean;
  pageSize?: 'A4' | 'Letter';
  // Section includes
  includeOwner?: boolean;
  includeLandDetails?: boolean;
  includeSiteVisit?: boolean;
  includeOwnerMeeting?: boolean;
  includeMediation?: boolean;
  includeBuyerSellerMeeting?: boolean;
  includeMeetingPlace?: boolean;
  includeAdvanceRegistration?: boolean;
}

// Store generated PDF data for preview/download
let cachedPDFData: { htmlContent: string; fileName: string } | null = null;

export function getCachedPDFData() {
  return cachedPDFData;
}

export function clearCachedPDFData() {
  cachedPDFData = null;
}

// Generate HTML content for PDF preview & download
export async function generatePDFPreview(
  ownerId: string,
  options: PDFExportOptions = {}
): Promise<string> {
  // This will reuse most of the PDF generation logic but just return HTML
  // For now, we'll create a simplified implementation
  // In practice, the actual HTML generation happens within generateOwnerProfilePDF
  // We'll need to refactor to extract it, but for MVP we'll make this work

  const {
    includePhotos = true,
    includeOwner = true,
    includeLandDetails = true,
    includeSiteVisit = true,
    includeOwnerMeeting = true,
    includeMediation = true,
    includeBuyerSellerMeeting = true,
    includeMeetingPlace = true,
    includeAdvanceRegistration = true,
  } = options;

  // Get owner data
  const owner = storage.getLandOwners().find(o => o.id === ownerId);
  if (!owner) {
    throw new Error('Owner not found');
  }

  const landDetails = storage.getLandDetails().filter(d => d.ownerId === ownerId);
  const siteVisits = storage.getSiteVisits().filter(d => d.ownerId === ownerId);
  const ownerMeetings = storage.getOwnerMeetings().filter(d => d.ownerId === ownerId);
  const mediations = storage.getMediations().filter(d => d.ownerId === ownerId);
  const buyerSellerMeetings = storage.getBuyerSellerMeetings().filter(d => d.ownerId === ownerId);
  const meetingPlaces = storage.getMeetingPlaces().filter(d => d.ownerId === ownerId);
  const advanceRegistrations = storage.getAdvanceRegistrations().filter(d => d.ownerId === ownerId);

  const resolveMediaUrls = async (media: MediaValue[] | undefined) => {
    if (!media || media.length === 0) return [] as string[];
    const resolved = await Promise.all(
      media.map(async (item) => {
        if (!isMediaRef(item)) return item;
        if (item.type !== 'photo') return null;
        const stored = await indexedDBStorage.getMediaFile(item.id);
        if (!stored) return null;
        return indexedDBStorage.blobToDataUrl(stored.data);
      })
    );
    return resolved.filter((value): value is string => typeof value === 'string');
  };

  const landDetailsWithPhotos = await Promise.all(
    landDetails.map(async (land) => ({
      ...land,
      resolvedPhotos: await resolveMediaUrls(land.photos),
    }))
  );

  const siteVisitsWithPhotos = await Promise.all(
    siteVisits.map(async (visit) => ({
      ...visit,
      resolvedPhotos: await resolveMediaUrls(visit.photos),
    }))
  );

  const ownerMeetingsWithPhotos = await Promise.all(
    ownerMeetings.map(async (meeting) => ({
      ...meeting,
      resolvedPhotos: await resolveMediaUrls(meeting.photos),
    }))
  );

  const mediationsWithPhotos = await Promise.all(
    mediations.map(async (mediation) => ({
      ...mediation,
      resolvedPhotos: await resolveMediaUrls(mediation.photos),
    }))
  );

  const buyerMeetingsWithPhotos = await Promise.all(
    buyerSellerMeetings.map(async (meeting) => ({
      ...meeting,
      resolvedPhotos: await resolveMediaUrls(meeting.photos),
    }))
  );

  const meetingPlacesWithPhotos = await Promise.all(
    meetingPlaces.map(async (place) => ({
      ...place,
      resolvedPhotos: await resolveMediaUrls(place.photos),
    }))
  );

  const advanceRegistrationsWithPhotos = await Promise.all(
    advanceRegistrations.map(async (adv) => ({
      ...adv,
      resolvedPhotos: await resolveMediaUrls(adv.photos),
    }))
  );

  const formatTime12h = (timeValue?: string) => {
    if (!timeValue) return "N/A";
    const [rawHours, rawMinutes] = timeValue.split(":");
    const hours = Number(rawHours);
    const minutes = Number(rawMinutes ?? "0");
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return timeValue;
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, "0");
    return `${displayHours}:${displayMinutes} ${period}`;
  };

  // Return the HTML content without rendering
  // The actual htmlContent template will be in the generateOwnerProfilePDF function
  // For now, return a minimal version
  return `<html><body><h1>PDF Preview for ${owner.areaName}</h1><p>Loading preview...</p></body></html>`;
}

export async function generateOwnerProfilePDF(
  ownerId: string,
  options: PDFExportOptions = {}
) {
  const {
    includePhotos = true,
    includeOwner = true,
    includeLandDetails = true,
    includeSiteVisit = true,
    includeOwnerMeeting = true,
    includeMediation = true,
    includeBuyerSellerMeeting = true,
    includeMeetingPlace = true,
    includeAdvanceRegistration = true,
  } = options;

  // Get owner data
  const owner = storage.getLandOwners().find(o => o.id === ownerId);
  if (!owner) {
    throw new Error('Owner not found');
  }

  const landDetails = storage.getLandDetails().filter(d => d.ownerId === ownerId);
  const siteVisits = storage.getSiteVisits().filter(d => d.ownerId === ownerId);
  const ownerMeetings = storage.getOwnerMeetings().filter(d => d.ownerId === ownerId);
  const mediations = storage.getMediations().filter(d => d.ownerId === ownerId);
  const buyerSellerMeetings = storage.getBuyerSellerMeetings().filter(d => d.ownerId === ownerId);
  const meetingPlaces = storage.getMeetingPlaces().filter(d => d.ownerId === ownerId);
  const advanceRegistrations = storage.getAdvanceRegistrations().filter(d => d.ownerId === ownerId);

  const resolveMediaUrls = async (media: MediaValue[] | undefined) => {
    if (!media || media.length === 0) return [] as string[];
    const resolved = await Promise.all(
      media.map(async (item) => {
        if (!isMediaRef(item)) return item;
        if (item.type !== 'photo') return null;
        const stored = await indexedDBStorage.getMediaFile(item.id);
        if (!stored) return null;
        return indexedDBStorage.blobToDataUrl(stored.data);
      })
    );
    return resolved.filter((value): value is string => typeof value === 'string');
  };

  const landDetailsWithPhotos = await Promise.all(
    landDetails.map(async (land) => ({
      ...land,
      resolvedPhotos: await resolveMediaUrls(land.photos),
    }))
  );
  const siteVisitsWithPhotos = await Promise.all(
    siteVisits.map(async (visit) => ({
      ...visit,
      resolvedPhotos: await resolveMediaUrls(visit.photos),
    }))
  );
  const ownerMeetingsWithPhotos = await Promise.all(
    ownerMeetings.map(async (meeting) => ({
      ...meeting,
      resolvedPhotos: await resolveMediaUrls(meeting.photos),
    }))
  );
  const mediationsWithPhotos = await Promise.all(
    mediations.map(async (mediation) => ({
      ...mediation,
      resolvedPhotos: await resolveMediaUrls(mediation.photos),
    }))
  );
  const buyerMeetingsWithPhotos = await Promise.all(
    buyerSellerMeetings.map(async (meeting) => ({
      ...meeting,
      resolvedPhotos: await resolveMediaUrls(meeting.photos),
    }))
  );
  const meetingPlacesWithPhotos = await Promise.all(
    meetingPlaces.map(async (place) => ({
      ...place,
      resolvedPhotos: await resolveMediaUrls(place.photos),
    }))
  );
  const advanceRegistrationsWithPhotos = await Promise.all(
    advanceRegistrations.map(async (adv) => ({
      ...adv,
      resolvedPhotos: await resolveMediaUrls(adv.photos),
    }))
  );

  const formatTime12h = (timeValue?: string) => {
    if (!timeValue) return "N/A";
    const [rawHours, rawMinutes] = timeValue.split(":");
    const hours = Number(rawHours);
    const minutes = Number(rawMinutes ?? "0");
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return timeValue;
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, "0");
    return `${displayHours}:${displayMinutes} ${period}`;
  };

  // Helper function to render text with highlights as HTML
  const renderHighlightedText = (text: string | undefined, highlights?: any[]): string => {
    if (!text) return "N/A";
    if (!highlights || highlights.length === 0) return text;

    // Color map for highlights
    const colorMap: Record<string, string> = {
      yellow: "#FFEB3B",
      orange: "#FFB74D",
      red: "#EF5350",
      blue: "#42A5F5",
      green: "#66BB6A",
    };

    // Sort highlights by start position
    const sortedHighlights = [...highlights].sort((a, b) => a.start - b.start);

    // Build HTML with spans for highlights
    let html = "";
    let lastEnd = 0;

    for (const highlight of sortedHighlights) {
      if (lastEnd < highlight.start) {
        html += text.slice(lastEnd, highlight.start);
      }
      const highlightedText = text.slice(highlight.start, highlight.end);
      const bgColor = colorMap[highlight.color] || "#FFEB3B";
      html += `<span style="background-color: ${bgColor}; padding: 2px 4px; border-radius: 2px;">${highlightedText}</span>`;
      lastEnd = highlight.end;
    }

    if (lastEnd < text.length) {
      html += text.slice(lastEnd);
    }

    return html;
  };

  // Create clean HTML for PDF with simple A4 layout
  const htmlContent = `
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        @page {
          size: A4;
          margin: 10mm;
        }
        
        * { 
          margin: 0; 
          padding: 0; 
          box-sizing: border-box; 
        }
        
        body { 
          font-family: Arial, sans-serif; 
          line-height: 1.4; 
          color: #000;
          background: #fff;
          padding: 10mm;
        }
        
        .pdf-container {
          max-width: 190mm;
          margin: 0 auto;
        }
        
        .title-page {
          text-align: center;
          padding-bottom: 10mm;
          margin-bottom: 10mm;
          border-bottom: 1px solid #000;
          page-break-after: always;
        }
        
        .title-page h1 {
          font-size: 18pt;
          margin-bottom: 5mm;
          font-weight: bold;
        }
        
        .title-page p {
          font-size: 9pt;
          margin: 2mm 0;
        }
        
        .header {
          margin-bottom: 8mm;
          border-bottom: 1px solid #000;
          padding-bottom: 5mm;
        }
        
        .header h3 {
          font-size: 10pt;
          font-weight: bold;
          margin-bottom: 5mm;
        }
        
        .header-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8mm;
          font-size: 9pt;
        }
        
        .header-item {
          margin-bottom: 3mm;
        }
        
        .header-label {
          font-weight: bold;
          font-size: 8pt;
          margin-bottom: 1mm;
        }
        
        .header-value {
          font-size: 9pt;
        }
        
        h2 { 
          font-size: 11pt;
          font-weight: bold;
          margin-top: 10mm;
          margin-bottom: 5mm;
          border-bottom: 1px solid #000;
          padding-bottom: 3mm;
          page-break-after: avoid;
        }
        
        .section { 
          margin-bottom: 8mm;
          page-break-inside: avoid;
        }
        
        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8mm;
          margin-bottom: 8mm;
        }
        
        .detail-item {
          padding: 5mm;
          border: 1px solid #ddd;
          font-size: 9pt;
          page-break-inside: avoid;
        }
        
        .detail-label {
          font-weight: bold;
          font-size: 8pt;
          margin-bottom: 2mm;
        }
        
        .detail-value {
          font-size: 9pt;
          line-height: 1.3;
        }
        
        .land-detail-section {
          padding: 8mm;
          border: 1px solid #ddd;
          margin-bottom: 8mm;
          page-break-inside: avoid;
        }
        
        .land-detail-section .land-title {
          font-size: 10pt;
          font-weight: bold;
          margin-bottom: 5mm;
          border-bottom: 1px solid #ddd;
          padding-bottom: 3mm;
        }
        
        .nature-container {
          margin-top: 8mm;
          padding: 8mm;
          border: 1px solid #ddd;
        }

        .nature-header {
          font-weight: bold;
          font-size: 8pt;
          margin-bottom: 5mm;
          border-bottom: 1px solid #ddd;
          padding-bottom: 3mm;
        }

        .nature-list {
          display: grid;
          grid-template-columns: 1fr;
          gap: 4mm;
        }

        .nature-entry {
          padding: 5mm;
          border-left: 2px solid #999;
          font-size: 9pt;
          page-break-inside: avoid;
        }

        .nature-entry-type {
          font-weight: bold;
          font-size: 9pt;
          margin-bottom: 2mm;
        }

        .nature-entry-details {
          font-size: 8pt;
          line-height: 1.3;
          padding-left: 5mm;
          margin-top: 2mm;
        }
        
        .photo-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8mm;
          margin: 8mm 0;
          page-break-inside: avoid;
        }
        
        .photo-item {
          page-break-inside: avoid;
        }
        
        .photo-item img {
          width: 100%;
          height: auto;
          max-height: 150px;
          object-fit: cover;
          border: 1px solid #ddd;
          display: block;
        }
        
        .photo-label {
          font-weight: bold;
          margin-bottom: 5mm;
          font-size: 8pt;
          border-bottom: 1px solid #ddd;
          padding-bottom: 3mm;
        }
        
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 8mm 0;
          font-size: 8pt;
        }
        
        th { 
          background: #f0f0f0;
          color: #000;
          padding: 5mm; 
          border: 1px solid #ddd;
          text-align: left;
          font-weight: bold;
        }
        
        td { 
          padding: 5mm; 
          border: 1px solid #ddd;
          font-size: 8pt;
        }
        
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        
        .footer {
          margin-top: 15mm;
          padding-top: 5mm;
          border-top: 1px solid #000;
          text-align: center;
          color: #666;
          font-size: 8pt;
        }
        
        .footer p {
          margin: 2mm 0;
          line-height: 1.3;
        }
      </style>
    </head>
    <body>
      <div class="pdf-container">
        <div class="title-page">
          <h1>Land Owner Profile Report</h1>
          <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        </div>

        ${includeOwner ? `
        <div class="header">
          <h3>Owner Information</h3>
          <div class="header-grid">
            <div class="header-item">
              <div class="header-label">Name</div>
              <div class="header-value">${renderHighlightedText(owner.areaName, owner.fieldHighlights?.areaName)}</div>
            </div>
            <div class="header-item">
              <div class="header-label">Contact</div>
              <div class="header-value">${renderHighlightedText(owner.contactNumber, owner.fieldHighlights?.contactNumber)}</div>
            </div>
            <div class="header-item">
              <div class="header-label">Address</div>
              <div class="header-value">${renderHighlightedText(owner.address, owner.fieldHighlights?.address)}</div>
            </div>
            <div class="header-item">
              <div class="header-label">Age</div>
              <div class="header-value">${renderHighlightedText(owner.age || 'N/A', owner.fieldHighlights?.age)}</div>
            </div>
          </div>
          ${owner.ownerBackground ? `
            <div style="margin-top: 5mm; padding-top: 5mm; border-top: 1px solid #ddd;">
              <div class="header-label">Background</div>
              <div class="header-value">${renderHighlightedText(owner.ownerBackground, owner.fieldHighlights?.ownerBackground)}</div>
            </div>
          ` : ''}
        </div>
        ` : ''}

        ${includeLandDetails && landDetailsWithPhotos.length > 0 ? `
        <div class="section">
          <h2>Land Details</h2>
          ${landDetailsWithPhotos.map(land => `
            <div class="land-detail-section">
              <div class="land-title">${land.areaName}</div>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="detail-label">Patta No</span>
                  <span class="detail-value">${renderHighlightedText(land.pattaNo, land.fieldHighlights?.pattaNo)}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Subdivision No</span>
                  <span class="detail-value">${renderHighlightedText(land.subdivisionNo, land.fieldHighlights?.subdivisionNo)}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Patta Person</span>
                  <span class="detail-value">${renderHighlightedText(land.pattaPersonNames, land.fieldHighlights?.pattaPersonNames)}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Acre/Cent</span>
                  <span class="detail-value">${renderHighlightedText(land.acreOrCent, land.fieldHighlights?.acreOrCent)}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">FM Sketch</span>
                  <span class="detail-value">${renderHighlightedText(land.fmSketch, land.fieldHighlights?.fmSketch)}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Site Sketch</span>
                  <span class="detail-value">${renderHighlightedText(land.siteSketch, land.fieldHighlights?.siteSketch)}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Rate/Cent (₹)</span>
                  <span class="detail-value">${renderHighlightedText(land.ratePerCent, land.fieldHighlights?.ratePerCent)}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Rate/Sq.Ft (₹)</span>
                  <span class="detail-value">${renderHighlightedText(land.ratePerSqFt, land.fieldHighlights?.ratePerSqFt)}</span>
                </div>
              </div>
              
              ${land.natureOfLand && Array.isArray(land.natureOfLand) && land.natureOfLand.length > 0 ? `
                <div class="nature-container">
                  <div class="nature-header">Nature of Land</div>
                  <div class="nature-list">
                    ${land.natureOfLand.map((n: any, idx: number) => `
                      <div class="nature-entry">
                        <div class="nature-entry-type">Type ${idx + 1}: ${typeof n === 'object' ? (n.name || 'N/A') : (n || 'N/A')}</div>
                        ${typeof n === 'object' && n.details ? `<div class="nature-entry-details">${n.details}</div>` : ''}
                      </div>
                    `).join('')}
                  </div>
                </div>
              ` : ''}
              
              ${land.resolvedPhotos && land.resolvedPhotos.length > 0 ? `
                <div style="margin-top: 8mm;">
                  <div class="photo-label">Photos (${land.resolvedPhotos.length})</div>
                  <div class="photo-grid">
                    ${land.resolvedPhotos.map((photo, idx) => `
                      <div class="photo-item">
                        <img src="${photo}" alt="Photo ${idx + 1}" />
                      </div>
                    `).join('')}
                  </div>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
        ` : ''}

        ${includeSiteVisit && siteVisitsWithPhotos.length > 0 ? `
        <div class="section">
          <h2>Site Visit</h2>
          ${siteVisitsWithPhotos.map((visit, idx) => `
            <div style="padding: 8mm; border: 1px solid #ddd; margin-bottom: 8mm;">
              <p style="font-size: 9pt; font-weight: bold; margin-bottom: 5mm;">Visit ${idx + 1}</p>
              <div class="detail-grid">
                <div class="detail-item">
                  <div class="detail-label">Distance (KM)</div>
                  <div class="detail-value">${renderHighlightedText(visit.distanceKm, visit.fieldHighlights?.distanceKm)}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Visit Date</div>
                  <div class="detail-value">${renderHighlightedText(visit.visitDate, visit.fieldHighlights?.visitDate)}</div>
                </div>
              </div>
              ${visit.notes ? `
                <div style="padding: 5mm; border: 1px solid #ddd; margin-top: 5mm; font-size: 9pt;">
                  <div style="font-weight: bold; font-size: 8pt; margin-bottom: 2mm;">Notes</div>
                  ${renderHighlightedText(visit.notes, visit.fieldHighlights?.notes)}
                </div>
              ` : ''}
              ${visit.resolvedPhotos && visit.resolvedPhotos.length > 0 ? `
                <div style="margin-top: 8mm;">
                  <div class="photo-label">Photos (${visit.resolvedPhotos.length})</div>
                  <div class="photo-grid">
                    ${visit.resolvedPhotos.map((photo, photoIdx) => `
                      <div class="photo-item"><img src="${photo}" alt="Photo ${photoIdx + 1}" /></div>
                    `).join('')}
                  </div>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
        ` : ''}

        ${includeOwnerMeeting && ownerMeetingsWithPhotos.length > 0 ? `
        <div class="section">
          <h2>Owner Meeting</h2>
          ${ownerMeetingsWithPhotos.map((meeting, idx) => `
            <div style="padding: 8mm; border: 1px solid #ddd; margin-bottom: 8mm;">
              <p style="font-size: 9pt; font-weight: bold; margin-bottom: 5mm;">Meeting ${idx + 1}</p>
              <div class="detail-grid">
                <div class="detail-item"><div class="detail-label">Date</div><div class="detail-value">${renderHighlightedText(meeting.meetingDate, meeting.fieldHighlights?.meetingDate)}</div></div>
                <div class="detail-item"><div class="detail-label">Land Rate (₹)</div><div class="detail-value">${renderHighlightedText(meeting.landRate, meeting.fieldHighlights?.landRate)}</div></div>
                <div class="detail-item"><div class="detail-label">Final Price (₹)</div><div class="detail-value">${renderHighlightedText(meeting.finalPrice, meeting.fieldHighlights?.finalPrice)}</div></div>
                <div class="detail-item"><div class="detail-label">Details</div><div class="detail-value">${renderHighlightedText(meeting.negotiationDetails, meeting.fieldHighlights?.negotiationDetails)}</div></div>
              </div>
              ${meeting.resolvedPhotos && meeting.resolvedPhotos.length > 0 ? `
                <div style="margin-top: 8mm;"><div class="photo-label">Photos (${meeting.resolvedPhotos.length})</div><div class="photo-grid">${meeting.resolvedPhotos.map((photo, photoIdx) => `<div class="photo-item"><img src="${photo}" alt="Photo ${photoIdx + 1}" /></div>`).join('')}</div></div>
              ` : ''}
            </div>
          `).join('')}
        </div>
        ` : ''}

        ${includeMediation && mediationsWithPhotos.length > 0 ? `
        <div class="section">
          <h2>Mediation</h2>
          ${mediationsWithPhotos.map((mediation, idx) => `
            <div style="padding: 8mm; border: 1px solid #ddd; margin-bottom: 8mm;">
              <p style="font-size: 9pt; font-weight: bold; margin-bottom: 5mm;">Record ${idx + 1}</p>
              <div class="detail-grid">
                <div class="detail-item"><div class="detail-label">Mediator</div><div class="detail-value">${renderHighlightedText(mediation.mediatorName, mediation.fieldHighlights?.mediatorName)}</div></div>
                <div class="detail-item"><div class="detail-label">Date</div><div class="detail-value">${renderHighlightedText(mediation.mediationDate, mediation.fieldHighlights?.mediationDate)}</div></div>
                <div class="detail-item"><div class="detail-label">Outcome</div><div class="detail-value">${renderHighlightedText(mediation.outcome, mediation.fieldHighlights?.outcome)}</div></div>
                <div class="detail-item"><div class="detail-label">Details</div><div class="detail-value">${renderHighlightedText(mediation.mediationDetails, mediation.fieldHighlights?.mediationDetails)}</div></div>
              </div>
              ${mediation.resolvedPhotos && mediation.resolvedPhotos.length > 0 ? `
                <div style="margin-top: 8mm;"><div class="photo-label">Photos (${mediation.resolvedPhotos.length})</div><div class="photo-grid">${mediation.resolvedPhotos.map((photo, photoIdx) => `<div class="photo-item"><img src="${photo}" alt="Photo ${photoIdx + 1}" /></div>`).join('')}</div></div>
              ` : ''}
            </div>
          `).join('')}
        </div>
        ` : ''}

        ${includeBuyerSellerMeeting && buyerMeetingsWithPhotos.length > 0 ? `
        <div class="section">
          <h2>Buyer-Seller Meeting</h2>
          ${buyerMeetingsWithPhotos.map((meeting, idx) => `
            <div style="padding: 8mm; border: 1px solid #ddd; margin-bottom: 8mm;">
              <p style="font-size: 9pt; font-weight: bold; margin-bottom: 5mm;">Meeting ${idx + 1}</p>
              <div class="detail-grid">
                <div class="detail-item"><div class="detail-label">Buyer</div><div class="detail-value">${renderHighlightedText(meeting.buyerName, meeting.fieldHighlights?.buyerName)}</div></div>
                <div class="detail-item"><div class="detail-label">Contact</div><div class="detail-value">${renderHighlightedText(meeting.buyerContact, meeting.fieldHighlights?.buyerContact)}</div></div>
                <div class="detail-item"><div class="detail-label">Address</div><div class="detail-value">${renderHighlightedText(meeting.buyerAddress || 'N/A', meeting.fieldHighlights?.buyerAddress)}</div></div>
                <div class="detail-item"><div class="detail-label">Date</div><div class="detail-value">${renderHighlightedText(meeting.meetingDate, meeting.fieldHighlights?.meetingDate)}</div></div>
              </div>
              ${meeting.meetingNotes ? `<div style="padding: 5mm; border: 1px solid #ddd; margin-top: 5mm; font-size: 9pt;"><div style="font-weight: bold; font-size: 8pt; margin-bottom: 2mm;">Notes</div>${renderHighlightedText(meeting.meetingNotes, meeting.fieldHighlights?.meetingNotes)}</div>` : ''}
              ${meeting.resolvedPhotos && meeting.resolvedPhotos.length > 0 ? `<div style="margin-top: 8mm;"><div class="photo-label">Photos (${meeting.resolvedPhotos.length})</div><div class="photo-grid">${meeting.resolvedPhotos.map((photo, photoIdx) => `<div class="photo-item"><img src="${photo}" alt="Photo ${photoIdx + 1}" /></div>`).join('')}</div></div>` : ''}
            </div>
          `).join('')}
        </div>
        ` : ''}

        ${includeMeetingPlace && meetingPlacesWithPhotos.length > 0 ? `
        <div class="section">
          <h2>Meeting Place</h2>
          ${meetingPlacesWithPhotos.map((place, idx) => `
            <div style="padding: 8mm; border: 1px solid #ddd; margin-bottom: 8mm;">
              <p style="font-size: 9pt; font-weight: bold; margin-bottom: 5mm;">Meeting ${idx + 1}</p>
              <div class="detail-grid">
                <div class="detail-item"><div class="detail-label">Place</div><div class="detail-value">${renderHighlightedText(place.placeName, place.fieldHighlights?.placeName)}</div></div>
                <div class="detail-item"><div class="detail-label">Address</div><div class="detail-value">${renderHighlightedText(place.placeAddress, place.fieldHighlights?.placeAddress)}</div></div>
                <div class="detail-item"><div class="detail-label">Date</div><div class="detail-value">${renderHighlightedText(place.meetingDate, place.fieldHighlights?.meetingDate)}</div></div>
                <div class="detail-item"><div class="detail-label">Time</div><div class="detail-value">${formatTime12h(place.meetingTime)}</div></div>
                <div class="detail-item"><div class="detail-label">Start</div><div class="detail-value">${formatTime12h(place.meetingStartTime)}</div></div>
                <div class="detail-item"><div class="detail-label">End</div><div class="detail-value">${formatTime12h(place.meetingEndTime)}</div></div>
              </div>
              ${place.resolvedPhotos && place.resolvedPhotos.length > 0 ? `<div style="margin-top: 8mm;"><div class="photo-label">Photos (${place.resolvedPhotos.length})</div><div class="photo-grid">${place.resolvedPhotos.map((photo, photoIdx) => `<div class="photo-item"><img src="${photo}" alt="Photo ${photoIdx + 1}" /></div>`).join('')}</div></div>` : ''}
            </div>
          `).join('')}
        </div>
        ` : ''}

        ${includeAdvanceRegistration && advanceRegistrationsWithPhotos.length > 0 ? `
        <div class="section">
          <h2>Advance & Registration</h2>
          ${advanceRegistrationsWithPhotos.map((adv, idx) => `
            <div style="padding: 8mm; border: 1px solid #ddd; margin-bottom: 8mm;">
              <p style="font-size: 9pt; font-weight: bold; margin-bottom: 5mm;">Record ${idx + 1}</p>
              <div class="detail-grid">
                <div class="detail-item"><div class="detail-label">Buyer</div><div class="detail-value">${renderHighlightedText(adv.buyerName, adv.fieldHighlights?.buyerName)}</div></div>
                <div class="detail-item"><div class="detail-label">Advance (₹)</div><div class="detail-value">${renderHighlightedText(adv.advanceAmount || 'N/A', adv.fieldHighlights?.advanceAmount)}</div></div>
                <div class="detail-item"><div class="detail-label">Registration (₹)</div><div class="detail-value">${renderHighlightedText(adv.registrationAmount || 'N/A', adv.fieldHighlights?.registrationAmount)}</div></div>
                <div class="detail-item"><div class="detail-label">Second (₹)</div><div class="detail-value">${renderHighlightedText(adv.secondAmount || 'N/A', adv.fieldHighlights?.secondAmount)}</div></div>
                <div class="detail-item"><div class="detail-label">Final (₹)</div><div class="detail-value">${renderHighlightedText(adv.finalAmount || 'N/A', adv.fieldHighlights?.finalAmount)}</div></div>
                <div class="detail-item"><div class="detail-label">Total (₹)</div><div class="detail-value">${renderHighlightedText(adv.totalAmount || 'N/A', adv.fieldHighlights?.totalAmount)}</div></div>
                <div class="detail-item"><div class="detail-label">Advance Date</div><div class="detail-value">${renderHighlightedText(adv.advanceDate, adv.fieldHighlights?.advanceDate)}</div></div>
                <div class="detail-item"><div class="detail-label">Reg. Date</div><div class="detail-value">${renderHighlightedText(adv.registrationDate, adv.fieldHighlights?.registrationDate)}</div></div>
              </div>
              ${adv.notes ? `<div style="padding: 5mm; border: 1px solid #ddd; margin-top: 5mm; font-size: 9pt;"><div style="font-weight: bold; font-size: 8pt; margin-bottom: 2mm;">Notes</div>${renderHighlightedText(adv.notes, adv.fieldHighlights?.notes)}</div>` : ''}
              ${adv.resolvedPhotos && adv.resolvedPhotos.length > 0 ? `<div style="margin-top: 8mm;"><div class="photo-label">Photos (${adv.resolvedPhotos.length})</div><div class="photo-grid">${adv.resolvedPhotos.map((photo, photoIdx) => `<div class="photo-item"><img src="${photo}" alt="Photo ${photoIdx + 1}" /></div>`).join('')}</div></div>` : ''}
            </div>
          `).join('')}
        </div>
        ` : ''}

        <div class="footer">
          <p>Lot Lounge Link - Land Ownership System</p>
          <p>Report Generated: ${new Date().toLocaleString()}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Create container and convert to canvas
  const container = document.createElement('div');
  container.innerHTML = htmlContent;
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '-9999px';
  container.style.width = '210mm';
  container.style.height = 'auto';
  container.style.backgroundColor = '#fff';
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      useCORS: true,
      allowTaint: true,
      logging: false,
      scale: 4,
      backgroundColor: '#ffffff',
      windowHeight: container.scrollHeight,
      windowWidth: 800,
      imageTimeout: 30000,
    });

    if (!canvas) {
      throw new Error('Failed to render canvas');
    }

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');

    const imgWidth = 190; // A4 width minus margins
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let position = 10;

    // First page
    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);

    // Additional pages if needed
    let heightLeft = imgHeight - (297 - 20); // A4 height minus margins
    while (heightLeft > 0) {
      position = heightLeft - imgHeight + 10;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= 277; // A4 height minus margins
    }

    // Add borders to every page
    const totalPages = pdf.internal.pages.length - 1; // Subtract 1 because pages array has null at index 0
    pdf.setLineWidth(0.5);
    pdf.setDrawColor(0, 0, 0);
    
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      // Top border
      pdf.line(10, 10, 200, 10);
      // Bottom border
      pdf.line(10, 287, 200, 287);
    }

    // Save PDF
    pdf.save(`${owner.areaName}_profile_${Date.now()}.pdf`);
    
    // Cache the data for preview
    cachedPDFData = {
      htmlContent: htmlContent,
      fileName: `${owner.areaName}_profile_${Date.now()}.pdf`
    };
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    document.body.removeChild(container);
  }
}

// Generate PDF preview HTML (without saving to file)
export async function generateOwnerProfilePDFPreview(
  ownerId: string,
  options: PDFExportOptions = {}
): Promise<{ html: string; fileName: string }> {
  const {
    includePhotos = true,
    includeOwner = true,
    includeLandDetails = true,
    includeSiteVisit = true,
    includeOwnerMeeting = true,
    includeMediation = true,
    includeBuyerSellerMeeting = true,
    includeMeetingPlace = true,
    includeAdvanceRegistration = true,
  } = options;

  // Get owner data
  const owner = storage.getLandOwners().find(o => o.id === ownerId);
  if (!owner) {
    throw new Error('Owner not found');
  }

  const landDetails = storage.getLandDetails().filter(d => d.ownerId === ownerId);
  const siteVisits = storage.getSiteVisits().filter(d => d.ownerId === ownerId);
  const ownerMeetings = storage.getOwnerMeetings().filter(d => d.ownerId === ownerId);
  const mediations = storage.getMediations().filter(d => d.ownerId === ownerId);
  const buyerSellerMeetings = storage.getBuyerSellerMeetings().filter(d => d.ownerId === ownerId);
  const meetingPlaces = storage.getMeetingPlaces().filter(d => d.ownerId === ownerId);
  const advanceRegistrations = storage.getAdvanceRegistrations().filter(d => d.ownerId === ownerId);

  const resolveMediaUrls = async (media: MediaValue[] | undefined) => {
    if (!media || media.length === 0) return [] as string[];
    const resolved = await Promise.all(
      media.map(async (item) => {
        if (!isMediaRef(item)) return item;
        if (item.type !== 'photo') return null;
        const stored = await indexedDBStorage.getMediaFile(item.id);
        if (!stored) return null;
        return indexedDBStorage.blobToDataUrl(stored.data);
      })
    );
    return resolved.filter((value): value is string => typeof value === 'string');
  };

  const landDetailsWithPhotos = await Promise.all(
    landDetails.map(async (land) => ({
      ...land,
      resolvedPhotos: await resolveMediaUrls(land.photos),
    }))
  );

  const siteVisitsWithPhotos = await Promise.all(
    siteVisits.map(async (visit) => ({
      ...visit,
      resolvedPhotos: await resolveMediaUrls(visit.photos),
    }))
  );

  const ownerMeetingsWithPhotos = await Promise.all(
    ownerMeetings.map(async (meeting) => ({
      ...meeting,
      resolvedPhotos: await resolveMediaUrls(meeting.photos),
    }))
  );

  const mediationsWithPhotos = await Promise.all(
    mediations.map(async (mediation) => ({
      ...mediation,
      resolvedPhotos: await resolveMediaUrls(mediation.photos),
    }))
  );

  const buyerMeetingsWithPhotos = await Promise.all(
    buyerSellerMeetings.map(async (meeting) => ({
      ...meeting,
      resolvedPhotos: await resolveMediaUrls(meeting.photos),
    }))
  );

  const meetingPlacesWithPhotos = await Promise.all(
    meetingPlaces.map(async (place) => ({
      ...place,
      resolvedPhotos: await resolveMediaUrls(place.photos),
    }))
  );

  const advanceRegistrationsWithPhotos = await Promise.all(
    advanceRegistrations.map(async (adv) => ({
      ...adv,
      resolvedPhotos: await resolveMediaUrls(adv.photos),
    }))
  );



  const formatTime12h = (timeValue?: string) => {
    if (!timeValue) return "N/A";
    const [rawHours, rawMinutes] = timeValue.split(":");
    const hours = Number(rawHours);
    const minutes = Number(rawMinutes ?? "0");
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return timeValue;
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, "0");
    return `${displayHours}:${displayMinutes} ${period}`;
  };

  const renderHighlightedTextForPreview = (text: string | undefined, highlights?: any[]): string => {
    if (!text) return "N/A";
    if (!highlights || highlights.length === 0) return text;

    const colorMap: Record<string, string> = {
      yellow: "#FFEB3B",
      orange: "#FFB74D",
      red: "#EF5350",
      blue: "#42A5F5",
      green: "#66BB6A",
    };

    const sortedHighlights = [...highlights].sort((a, b) => a.start - b.start);
    let html = "";
    let lastEnd = 0;

    for (const highlight of sortedHighlights) {
      if (lastEnd < highlight.start) {
        html += text.slice(lastEnd, highlight.start);
      }
      const highlightedText = text.slice(highlight.start, highlight.end);
      const bgColor = colorMap[highlight.color] || "#FFEB3B";
      html += `<span style="background-color: ${bgColor}; padding: 2px 4px; border-radius: 2px;">${highlightedText}</span>`;
      lastEnd = highlight.end;
    }

    if (lastEnd < text.length) {
      html += text.slice(lastEnd);
    }

    return html;
  };

  // Generate clean HTML for preview (same as PDF)
  const htmlContent = `
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        @page {
          size: A4;
          margin: 10mm;
        }
        
        * { 
          margin: 0; 
          padding: 0; 
          box-sizing: border-box; 
        }
        
        body { 
          font-family: Arial, sans-serif; 
          line-height: 1.4; 
          color: #000;
          background: #fff;
          padding: 10mm;
        }
        
        .pdf-container {
          max-width: 190mm;
          margin: 0 auto;
        }
        
        .title-page {
          text-align: center;
          padding-bottom: 10mm;
          margin-bottom: 10mm;
          border-bottom: 1px solid #000;
          page-break-after: always;
        }
        
        .title-page h1 {
          font-size: 18pt;
          margin-bottom: 5mm;
          font-weight: bold;
        }
        
        .title-page p {
          font-size: 9pt;
          margin: 2mm 0;
        }
        
        .header {
          margin-bottom: 8mm;
          border-bottom: 1px solid #000;
          padding-bottom: 5mm;
        }
        
        .header h3 {
          font-size: 10pt;
          font-weight: bold;
          margin-bottom: 5mm;
        }
        
        .header-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8mm;
          font-size: 9pt;
        }
        
        .header-item {
          margin-bottom: 3mm;
        }
        
        .header-label {
          font-weight: bold;
          font-size: 8pt;
          margin-bottom: 1mm;
        }
        
        .header-value {
          font-size: 9pt;
        }
        
        h2 { 
          font-size: 11pt;
          font-weight: bold;
          margin-top: 10mm;
          margin-bottom: 5mm;
          border-bottom: 1px solid #000;
          padding-bottom: 3mm;
          page-break-after: avoid;
        }
        
        .section { 
          margin-bottom: 8mm;
          page-break-inside: avoid;
        }
        
        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8mm;
          margin-bottom: 8mm;
        }
        
        .detail-item {
          padding: 5mm;
          border: 1px solid #ddd;
          font-size: 9pt;
          page-break-inside: avoid;
        }
        
        .detail-label {
          font-weight: bold;
          font-size: 8pt;
          margin-bottom: 2mm;
        }
        
        .detail-value {
          font-size: 9pt;
          line-height: 1.3;
        }
        
        .land-detail-section {
          padding: 8mm;
          border: 1px solid #ddd;
          margin-bottom: 8mm;
          page-break-inside: avoid;
        }
        
        .land-detail-section .land-title {
          font-size: 10pt;
          font-weight: bold;
          margin-bottom: 5mm;
          border-bottom: 1px solid #ddd;
          padding-bottom: 3mm;
        }
        
        .nature-container {
          margin-top: 8mm;
          padding: 8mm;
          border: 1px solid #ddd;
        }

        .nature-header {
          font-weight: bold;
          font-size: 8pt;
          margin-bottom: 5mm;
          border-bottom: 1px solid #ddd;
          padding-bottom: 3mm;
        }

        .nature-list {
          display: grid;
          grid-template-columns: 1fr;
          gap: 4mm;
        }

        .nature-entry {
          padding: 5mm;
          border-left: 2px solid #999;
          font-size: 9pt;
          page-break-inside: avoid;
        }

        .nature-entry-type {
          font-weight: bold;
          font-size: 9pt;
          margin-bottom: 2mm;
        }

        .nature-entry-details {
          font-size: 8pt;
          line-height: 1.3;
          padding-left: 5mm;
          margin-top: 2mm;
        }
        
        .photo-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8mm;
          margin: 8mm 0;
          page-break-inside: avoid;
        }
        
        .photo-item {
          page-break-inside: avoid;
        }
        
        .photo-item img {
          width: 100%;
          height: auto;
          max-height: 150px;
          object-fit: cover;
          border: 1px solid #ddd;
          display: block;
        }
        
        .photo-label {
          font-weight: bold;
          margin-bottom: 5mm;
          font-size: 8pt;
          border-bottom: 1px solid #ddd;
          padding-bottom: 3mm;
        }
        
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 8mm 0;
          font-size: 8pt;
        }
        
        th { 
          background: #f0f0f0;
          color: #000;
          padding: 5mm; 
          border: 1px solid #ddd;
          text-align: left;
          font-weight: bold;
        }
        
        td { 
          padding: 5mm; 
          border: 1px solid #ddd;
          font-size: 8pt;
        }
        
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        
        .footer {
          margin-top: 15mm;
          padding-top: 5mm;
          border-top: 1px solid #000;
          text-align: center;
          color: #666;
          font-size: 8pt;
        }
        
        .footer p {
          margin: 2mm 0;
          line-height: 1.3;
        }
      </style>
    </head>
    <body>
      <div class="pdf-container">
        <div class="title-page">
          <h1>Land Owner Profile Report</h1>
          <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        </div>

        ${includeOwner ? `
        <div class="header">
          <h3>Owner Information</h3>
          <div class="header-grid">
            <div class="header-item">
              <div class="header-label">Name</div>
              <div class="header-value">${renderHighlightedTextForPreview(owner.areaName, owner.fieldHighlights?.areaName)}</div>
            </div>
            <div class="header-item">
              <div class="header-label">Contact</div>
              <div class="header-value">${renderHighlightedTextForPreview(owner.contactNumber, owner.fieldHighlights?.contactNumber)}</div>
            </div>
            <div class="header-item">
              <div class="header-label">Address</div>
              <div class="header-value">${renderHighlightedTextForPreview(owner.address, owner.fieldHighlights?.address)}</div>
            </div>
            <div class="header-item">
              <div class="header-label">Age</div>
              <div class="header-value">${renderHighlightedTextForPreview(owner.age || 'N/A', owner.fieldHighlights?.age)}</div>
            </div>
          </div>
          ${owner.ownerBackground ? `
            <div style="margin-top: 5mm; padding-top: 5mm; border-top: 1px solid #ddd;">
              <div class="header-label">Background</div>
              <div class="header-value">${renderHighlightedTextForPreview(owner.ownerBackground, owner.fieldHighlights?.ownerBackground)}</div>
            </div>
          ` : ''}
        </div>
        ` : ''}

        ${includeLandDetails && landDetailsWithPhotos.length > 0 ? `
        <div class="section">
          <h2>Land Details</h2>
          ${landDetailsWithPhotos.map(land => `
            <div class="land-detail-section">
              <div class="land-title">${land.areaName}</div>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="detail-label">Patta No</span>
                  <span class="detail-value">${renderHighlightedTextForPreview(land.pattaNo, land.fieldHighlights?.pattaNo)}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Subdivision No</span>
                  <span class="detail-value">${renderHighlightedTextForPreview(land.subdivisionNo, land.fieldHighlights?.subdivisionNo)}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Patta Person</span>
                  <span class="detail-value">${renderHighlightedTextForPreview(land.pattaPersonNames, land.fieldHighlights?.pattaPersonNames)}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Acre/Cent</span>
                  <span class="detail-value">${renderHighlightedTextForPreview(land.acreOrCent, land.fieldHighlights?.acreOrCent)}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">FM Sketch</span>
                  <span class="detail-value">${renderHighlightedTextForPreview(land.fmSketch, land.fieldHighlights?.fmSketch)}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Site Sketch</span>
                  <span class="detail-value">${renderHighlightedTextForPreview(land.siteSketch, land.fieldHighlights?.siteSketch)}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Rate/Cent (₹)</span>
                  <span class="detail-value">${renderHighlightedTextForPreview(land.ratePerCent, land.fieldHighlights?.ratePerCent)}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Rate/Sq.Ft (₹)</span>
                  <span class="detail-value">${renderHighlightedTextForPreview(land.ratePerSqFt, land.fieldHighlights?.ratePerSqFt)}</span>
                </div>
              </div>
              
              ${land.natureOfLand && Array.isArray(land.natureOfLand) && land.natureOfLand.length > 0 ? `
                <div class="nature-container">
                  <div class="nature-header">Nature of Land</div>
                  <div class="nature-list">
                    ${land.natureOfLand.map((n: any, idx: number) => `
                      <div class="nature-entry">
                        <div class="nature-entry-type">Type ${idx + 1}: ${typeof n === 'object' ? (n.name || 'N/A') : (n || 'N/A')}</div>
                        ${typeof n === 'object' && n.details ? `<div class="nature-entry-details">${n.details}</div>` : ''}
                      </div>
                    `).join('')}
                  </div>
                </div>
              ` : ''}
              
              ${land.resolvedPhotos && land.resolvedPhotos.length > 0 ? `
                <div style="margin-top: 8mm;">
                  <div class="photo-label">Photos (${land.resolvedPhotos.length})</div>
                  <div class="photo-grid">
                    ${land.resolvedPhotos.map((photo, idx) => `
                      <div class="photo-item">
                        <img src="${photo}" alt="Photo ${idx + 1}" />
                      </div>
                    `).join('')}
                  </div>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
        ` : ''}

        ${includeSiteVisit && siteVisitsWithPhotos.length > 0 ? `
        <div class="section">
          <h2>Site Visit</h2>
          ${siteVisitsWithPhotos.map((visit, idx) => `
            <div style="padding: 8mm; border: 1px solid #ddd; margin-bottom: 8mm;">
              <p style="font-size: 9pt; font-weight: bold; margin-bottom: 5mm;">Visit ${idx + 1}</p>
              <div class="detail-grid">
                <div class="detail-item">
                  <div class="detail-label">Distance (KM)</div>
                  <div class="detail-value">${renderHighlightedTextForPreview(visit.distanceKm, visit.fieldHighlights?.distanceKm)}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Visit Date</div>
                  <div class="detail-value">${renderHighlightedTextForPreview(visit.visitDate, visit.fieldHighlights?.visitDate)}</div>
                </div>
              </div>
              ${visit.notes ? `
                <div style="padding: 5mm; border: 1px solid #ddd; margin-top: 5mm; font-size: 9pt;">
                  <div style="font-weight: bold; font-size: 8pt; margin-bottom: 2mm;">Notes</div>
                  ${renderHighlightedTextForPreview(visit.notes, visit.fieldHighlights?.notes)}
                </div>
              ` : ''}
              ${visit.resolvedPhotos && visit.resolvedPhotos.length > 0 ? `
                <div style="margin-top: 8mm;">
                  <div class="photo-label">Photos (${visit.resolvedPhotos.length})</div>
                  <div class="photo-grid">
                    ${visit.resolvedPhotos.map((photo, photoIdx) => `
                      <div class="photo-item"><img src="${photo}" alt="Photo ${photoIdx + 1}" /></div>
                    `).join('')}
                  </div>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
        ` : ''}

        ${includeOwnerMeeting && ownerMeetingsWithPhotos.length > 0 ? `
        <div class="section">
          <h2>Owner Meeting</h2>
          ${ownerMeetingsWithPhotos.map((meeting, idx) => `
            <div style="padding: 8mm; border: 1px solid #ddd; margin-bottom: 8mm;">
              <p style="font-size: 9pt; font-weight: bold; margin-bottom: 5mm;">Meeting ${idx + 1}</p>
              <div class="detail-grid">
                <div class="detail-item"><div class="detail-label">Date</div><div class="detail-value">${renderHighlightedTextForPreview(meeting.meetingDate, meeting.fieldHighlights?.meetingDate)}</div></div>
                <div class="detail-item"><div class="detail-label">Land Rate (₹)</div><div class="detail-value">${renderHighlightedTextForPreview(meeting.landRate, meeting.fieldHighlights?.landRate)}</div></div>
                <div class="detail-item"><div class="detail-label">Final Price (₹)</div><div class="detail-value">${renderHighlightedTextForPreview(meeting.finalPrice, meeting.fieldHighlights?.finalPrice)}</div></div>
                <div class="detail-item"><div class="detail-label">Details</div><div class="detail-value">${renderHighlightedTextForPreview(meeting.negotiationDetails, meeting.fieldHighlights?.negotiationDetails)}</div></div>
              </div>
              ${meeting.resolvedPhotos && meeting.resolvedPhotos.length > 0 ? `
                <div style="margin-top: 8mm;"><div class="photo-label">Photos (${meeting.resolvedPhotos.length})</div><div class="photo-grid">${meeting.resolvedPhotos.map((photo, photoIdx) => `<div class="photo-item"><img src="${photo}" alt="Photo ${photoIdx + 1}" /></div>`).join('')}</div></div>
              ` : ''}
            </div>
          `).join('')}
        </div>
        ` : ''}

        ${includeMediation && mediationsWithPhotos.length > 0 ? `
        <div class="section">
          <h2>Mediation</h2>
          ${mediationsWithPhotos.map((mediation, idx) => `
            <div style="padding: 8mm; border: 1px solid #ddd; margin-bottom: 8mm;">
              <p style="font-size: 9pt; font-weight: bold; margin-bottom: 5mm;">Record ${idx + 1}</p>
              <div class="detail-grid">
                <div class="detail-item"><div class="detail-label">Mediator</div><div class="detail-value">${renderHighlightedTextForPreview(mediation.mediatorName, mediation.fieldHighlights?.mediatorName)}</div></div>
                <div class="detail-item"><div class="detail-label">Date</div><div class="detail-value">${renderHighlightedTextForPreview(mediation.mediationDate, mediation.fieldHighlights?.mediationDate)}</div></div>
                <div class="detail-item"><div class="detail-label">Outcome</div><div class="detail-value">${renderHighlightedTextForPreview(mediation.outcome, mediation.fieldHighlights?.outcome)}</div></div>
                <div class="detail-item"><div class="detail-label">Details</div><div class="detail-value">${renderHighlightedTextForPreview(mediation.mediationDetails, mediation.fieldHighlights?.mediationDetails)}</div></div>
              </div>
              ${mediation.resolvedPhotos && mediation.resolvedPhotos.length > 0 ? `
                <div style="margin-top: 8mm;"><div class="photo-label">Photos (${mediation.resolvedPhotos.length})</div><div class="photo-grid">${mediation.resolvedPhotos.map((photo, photoIdx) => `<div class="photo-item"><img src="${photo}" alt="Photo ${photoIdx + 1}" /></div>`).join('')}</div></div>
              ` : ''}
            </div>
          `).join('')}
        </div>
        ` : ''}

        ${includeBuyerSellerMeeting && buyerMeetingsWithPhotos.length > 0 ? `
        <div class="section">
          <h2>Buyer-Seller Meeting</h2>
          ${buyerMeetingsWithPhotos.map((meeting, idx) => `
            <div style="padding: 8mm; border: 1px solid #ddd; margin-bottom: 8mm;">
              <p style="font-size: 9pt; font-weight: bold; margin-bottom: 5mm;">Meeting ${idx + 1}</p>
              <div class="detail-grid">
                <div class="detail-item"><div class="detail-label">Buyer</div><div class="detail-value">${renderHighlightedTextForPreview(meeting.buyerName, meeting.fieldHighlights?.buyerName)}</div></div>
                <div class="detail-item"><div class="detail-label">Contact</div><div class="detail-value">${renderHighlightedTextForPreview(meeting.buyerContact, meeting.fieldHighlights?.buyerContact)}</div></div>
                <div class="detail-item"><div class="detail-label">Address</div><div class="detail-value">${renderHighlightedTextForPreview(meeting.buyerAddress || 'N/A', meeting.fieldHighlights?.buyerAddress)}</div></div>
                <div class="detail-item"><div class="detail-label">Date</div><div class="detail-value">${renderHighlightedTextForPreview(meeting.meetingDate, meeting.fieldHighlights?.meetingDate)}</div></div>
              </div>
              ${meeting.meetingNotes ? `<div style="padding: 5mm; border: 1px solid #ddd; margin-top: 5mm; font-size: 9pt;"><div style="font-weight: bold; font-size: 8pt; margin-bottom: 2mm;">Notes</div>${renderHighlightedTextForPreview(meeting.meetingNotes, meeting.fieldHighlights?.meetingNotes)}</div>` : ''}
              ${meeting.resolvedPhotos && meeting.resolvedPhotos.length > 0 ? `<div style="margin-top: 8mm;"><div class="photo-label">Photos (${meeting.resolvedPhotos.length})</div><div class="photo-grid">${meeting.resolvedPhotos.map((photo, photoIdx) => `<div class="photo-item"><img src="${photo}" alt="Photo ${photoIdx + 1}" /></div>`).join('')}</div></div>` : ''}
            </div>
          `).join('')}
        </div>
        ` : ''}

        ${includeMeetingPlace && meetingPlacesWithPhotos.length > 0 ? `
        <div class="section">
          <h2>Meeting Place</h2>
          ${meetingPlacesWithPhotos.map((place, idx) => `
            <div style="padding: 8mm; border: 1px solid #ddd; margin-bottom: 8mm;">
              <p style="font-size: 9pt; font-weight: bold; margin-bottom: 5mm;">Meeting ${idx + 1}</p>
              <div class="detail-grid">
                <div class="detail-item"><div class="detail-label">Place</div><div class="detail-value">${renderHighlightedTextForPreview(place.placeName, place.fieldHighlights?.placeName)}</div></div>
                <div class="detail-item"><div class="detail-label">Address</div><div class="detail-value">${renderHighlightedTextForPreview(place.placeAddress, place.fieldHighlights?.placeAddress)}</div></div>
                <div class="detail-item"><div class="detail-label">Date</div><div class="detail-value">${renderHighlightedTextForPreview(place.meetingDate, place.fieldHighlights?.meetingDate)}</div></div>
                <div class="detail-item"><div class="detail-label">Time</div><div class="detail-value">${formatTime12h(place.meetingTime)}</div></div>
                <div class="detail-item"><div class="detail-label">Start</div><div class="detail-value">${formatTime12h(place.meetingStartTime)}</div></div>
                <div class="detail-item"><div class="detail-label">End</div><div class="detail-value">${formatTime12h(place.meetingEndTime)}</div></div>
              </div>
              ${place.resolvedPhotos && place.resolvedPhotos.length > 0 ? `<div style="margin-top: 8mm;"><div class="photo-label">Photos (${place.resolvedPhotos.length})</div><div class="photo-grid">${place.resolvedPhotos.map((photo, photoIdx) => `<div class="photo-item"><img src="${photo}" alt="Photo ${photoIdx + 1}" /></div>`).join('')}</div></div>` : ''}
            </div>
          `).join('')}
        </div>
        ` : ''}

        ${includeAdvanceRegistration && advanceRegistrationsWithPhotos.length > 0 ? `
        <div class="section">
          <h2>Advance & Registration</h2>
          ${advanceRegistrationsWithPhotos.map((adv, idx) => `
            <div style="padding: 8mm; border: 1px solid #ddd; margin-bottom: 8mm;">
              <p style="font-size: 9pt; font-weight: bold; margin-bottom: 5mm;">Record ${idx + 1}</p>
              <div class="detail-grid">
                <div class="detail-item"><div class="detail-label">Buyer</div><div class="detail-value">${renderHighlightedTextForPreview(adv.buyerName, adv.fieldHighlights?.buyerName)}</div></div>
                <div class="detail-item"><div class="detail-label">Advance (₹)</div><div class="detail-value">${renderHighlightedTextForPreview(adv.advanceAmount || 'N/A', adv.fieldHighlights?.advanceAmount)}</div></div>
                <div class="detail-item"><div class="detail-label">Registration (₹)</div><div class="detail-value">${renderHighlightedTextForPreview(adv.registrationAmount || 'N/A', adv.fieldHighlights?.registrationAmount)}</div></div>
                <div class="detail-item"><div class="detail-label">Second (₹)</div><div class="detail-value">${renderHighlightedTextForPreview(adv.secondAmount || 'N/A', adv.fieldHighlights?.secondAmount)}</div></div>
                <div class="detail-item"><div class="detail-label">Final (₹)</div><div class="detail-value">${renderHighlightedTextForPreview(adv.finalAmount || 'N/A', adv.fieldHighlights?.finalAmount)}</div></div>
                <div class="detail-item"><div class="detail-label">Total (₹)</div><div class="detail-value">${renderHighlightedTextForPreview(adv.totalAmount || 'N/A', adv.fieldHighlights?.totalAmount)}</div></div>
                <div class="detail-item"><div class="detail-label">Advance Date</div><div class="detail-value">${renderHighlightedTextForPreview(adv.advanceDate, adv.fieldHighlights?.advanceDate)}</div></div>
                <div class="detail-item"><div class="detail-label">Reg. Date</div><div class="detail-value">${renderHighlightedTextForPreview(adv.registrationDate, adv.fieldHighlights?.registrationDate)}</div></div>
              </div>
              ${adv.notes ? `<div style="padding: 5mm; border: 1px solid #ddd; margin-top: 5mm; font-size: 9pt;"><div style="font-weight: bold; font-size: 8pt; margin-bottom: 2mm;">Notes</div>${renderHighlightedTextForPreview(adv.notes, adv.fieldHighlights?.notes)}</div>` : ''}
              ${adv.resolvedPhotos && adv.resolvedPhotos.length > 0 ? `<div style="margin-top: 8mm;"><div class="photo-label">Photos (${adv.resolvedPhotos.length})</div><div class="photo-grid">${adv.resolvedPhotos.map((photo, photoIdx) => `<div class="photo-item"><img src="${photo}" alt="Photo ${photoIdx + 1}" /></div>`).join('')}</div></div>` : ''}
            </div>
          `).join('')}
        </div>
        ` : ''}

        <div class="footer">
          <p>Lot Lounge Link - Land Ownership System</p>
          <p>Report Generated: ${new Date().toLocaleString()}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const fileName = `${owner.areaName}_profile_${Date.now()}.pdf`;
  
  // Cache the data
  cachedPDFData = {
    htmlContent: htmlContent,
    fileName: fileName
  };

  return { html: htmlContent, fileName };
}

// Download cached PDF
export async function downloadCachedPDF() {
  if (!cachedPDFData) {
    throw new Error('No PDF data cached. Please generate a preview first.');
  }

  const { htmlContent } = cachedPDFData;
  const fileName = cachedPDFData.fileName;

  // Create container and convert to canvas
  const container = document.createElement('div');
  container.innerHTML = htmlContent;
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '-9999px';
  container.style.width = '210mm';
  container.style.height = 'auto';
  container.style.backgroundColor = '#fff';
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      useCORS: true,
      allowTaint: true,
      logging: false,
      scale: 4,
      backgroundColor: '#ffffff',
      windowHeight: container.scrollHeight,
      windowWidth: 800,
      imageTimeout: 30000,
    });

    if (!canvas) {
      throw new Error('Failed to render canvas');
    }

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');

    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let position = 10;

    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);

    let heightLeft = imgHeight - (297 - 20);
    while (heightLeft > 0) {
      position = heightLeft - imgHeight + 10;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= 277;
    }

    // Add borders to every page
    const totalPages = pdf.internal.pages.length - 1; // Subtract 1 because pages array has null at index 0
    pdf.setLineWidth(0.5);
    pdf.setDrawColor(0, 0, 0);
    
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      // Top border
      pdf.line(10, 10, 200, 10);
      // Bottom border
      pdf.line(10, 287, 200, 287);
    }

    pdf.save(fileName);
  } catch (error) {
    console.error('PDF download error:', error);
    throw new Error(`PDF download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    document.body.removeChild(container);
  }
}
