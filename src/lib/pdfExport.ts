import { storage } from './storage';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PDFExportOptions {
  includePhotos?: boolean;
  includeVideos?: boolean;
  pageSize?: 'A4' | 'Letter';
}

export async function generateOwnerProfilePDF(
  ownerId: string,
  options: PDFExportOptions = {}
) {
  const {
    includePhotos = true,
    includeVideos = true,
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

  // Create simple HTML for PDF
  const htmlContent = `
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; }
        body { 
          font-family: Arial, sans-serif; 
          line-height: 1.6; 
          color: #333;
          padding: 30px;
          background: #fff;
        }
        h1 { 
          color: #667eea; 
          border-bottom: 3px solid #667eea; 
          padding-bottom: 10px; 
          margin-bottom: 20px;
          font-size: 24px;
        }
        h2 { 
          color: #764ba2; 
          margin-top: 25px;
          margin-bottom: 15px;
          font-size: 18px;
          border-left: 4px solid #764ba2;
          padding-left: 10px;
        }
        .header {
          background: #f9f9f9;
          padding: 20px;
          border-radius: 5px;
          margin-bottom: 20px;
        }
        .header p { margin: 8px 0; }
        .section { page-break-inside: avoid; margin-bottom: 20px; }
        .detail-row { 
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 15px;
        }
        .detail-item {
          padding: 12px;
          background: #f5f5f5;
          border-radius: 4px;
          border-left: 3px solid #667eea;
        }
        .detail-label {
          font-weight: bold;
          color: #667eea;
          font-size: 11px;
          text-transform: uppercase;
          margin-bottom: 5px;
        }
        .detail-value {
          color: #333;
          font-size: 14px;
          word-wrap: break-word;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          text-align: center;
          color: #999;
          font-size: 12px;
        }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th { background: #f0f0f0; padding: 10px; border: 1px solid #ddd; text-align: left; }
        td { padding: 10px; border: 1px solid #ddd; }
      </style>
    </head>
    <body>
      <h1>Land Owner Profile Report</h1>
      
      <div class="header">
        <p><strong>Owner Name:</strong> ${owner.areaName}</p>
        <p><strong>Contact:</strong> ${owner.contactNumber}</p>
        <p><strong>Address:</strong> ${owner.address}</p>
        <p><strong>Age:</strong> ${owner.age}</p>
        ${owner.ownerBackground ? `<p><strong>Background:</strong> ${owner.ownerBackground}</p>` : ''}
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
      </div>

      ${landDetails.length > 0 ? `
      <div class="section">
        <h2>Stage 2: Land Details</h2>
        ${landDetails.map(land => `
          <div style="margin-bottom: 15px; padding: 10px; background: #fafafa;">
            <div class="detail-row">
              <div class="detail-item">
                <div class="detail-label">Area Name</div>
                <div class="detail-value">${land.areaName}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Nature of Land</div>
                <div class="detail-value">${land.natureOfLand}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Rate per Cent (₹)</div>
                <div class="detail-value">${land.ratePerCent}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Rate per Sq.Ft (₹)</div>
                <div class="detail-value">${land.ratePerSqFt}</div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
      ` : ''}

      ${siteVisits.length > 0 ? `
      <div class="section">
        <h2>Stage 3: Site Visit</h2>
        ${siteVisits.map(visit => `
          <div style="margin-bottom: 15px; padding: 10px; background: #fafafa;">
            <div class="detail-row">
              <div class="detail-item">
                <div class="detail-label">Distance (KM)</div>
                <div class="detail-value">${visit.distanceKm}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Visit Date</div>
                <div class="detail-value">${visit.visitDate}</div>
              </div>
            </div>
            ${visit.notes ? `<p><strong>Notes:</strong> ${visit.notes}</p>` : ''}
          </div>
        `).join('')}
      </div>
      ` : ''}

      ${ownerMeetings.length > 0 ? `
      <div class="section">
        <h2>Stage 4: Owner Meeting</h2>
        ${ownerMeetings.map(meeting => `
          <div style="margin-bottom: 15px; padding: 10px; background: #fafafa;">
            <div class="detail-row">
              <div class="detail-item">
                <div class="detail-label">Meeting Date</div>
                <div class="detail-value">${meeting.meetingDate}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Land Rate (₹)</div>
                <div class="detail-value">${meeting.landRate}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Final Price (₹)</div>
                <div class="detail-value">${meeting.finalPrice}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Details</div>
                <div class="detail-value">${meeting.negotiationDetails}</div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
      ` : ''}

      ${mediations.length > 0 ? `
      <div class="section">
        <h2>Stage 5: Mediation</h2>
        ${mediations.map(mediation => `
          <div style="margin-bottom: 15px; padding: 10px; background: #fafafa;">
            <div class="detail-row">
              <div class="detail-item">
                <div class="detail-label">Mediator</div>
                <div class="detail-value">${mediation.mediatorName}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Date</div>
                <div class="detail-value">${mediation.mediationDate}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Outcome</div>
                <div class="detail-value">${mediation.outcome}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Details</div>
                <div class="detail-value">${mediation.mediationDetails}</div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
      ` : ''}

      ${buyerSellerMeetings.length > 0 ? `
      <div class="section">
        <h2>Stage 6: Buyer-Seller Meeting</h2>
        ${buyerSellerMeetings.map(meeting => `
          <div style="margin-bottom: 15px; padding: 10px; background: #fafafa;">
            <div class="detail-row">
              <div class="detail-item">
                <div class="detail-label">Buyer Name</div>
                <div class="detail-value">${meeting.buyerName}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Contact</div>
                <div class="detail-value">${meeting.buyerContact}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Date</div>
                <div class="detail-value">${meeting.meetingDate}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Notes</div>
                <div class="detail-value">${meeting.meetingNotes}</div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
      ` : ''}

      ${meetingPlaces.length > 0 ? `
      <div class="section">
        <h2>Stage 7: Meeting Place</h2>
        ${meetingPlaces.map(place => `
          <div style="margin-bottom: 15px; padding: 10px; background: #fafafa;">
            <div class="detail-row">
              <div class="detail-item">
                <div class="detail-label">Place</div>
                <div class="detail-value">${place.placeName}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Address</div>
                <div class="detail-value">${place.placeAddress}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Date</div>
                <div class="detail-value">${place.meetingDate}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Time</div>
                <div class="detail-value">${place.meetingTime}</div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
      ` : ''}

      ${advanceRegistrations.length > 0 ? `
      <div class="section">
        <h2>Stage 8: Advance & Registration</h2>
        ${advanceRegistrations.map(adv => `
          <div style="margin-bottom: 15px; padding: 10px; background: #fafafa;">
            <div class="detail-row">
              <div class="detail-item">
                <div class="detail-label">Buyer Name</div>
                <div class="detail-value">${adv.buyerName}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Advance Amount (₹)</div>
                <div class="detail-value">${adv.advanceAmount}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Advance Date</div>
                <div class="detail-value">${adv.advanceDate}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Reg. Date</div>
                <div class="detail-value">${adv.registrationDate}</div>
              </div>
            </div>
            ${adv.notes ? `<p><strong>Notes:</strong> ${adv.notes}</p>` : ''}
          </div>
        `).join('')}
      </div>
      ` : ''}

      <div class="footer">
        <p>This report was auto-generated by Lot Lounge Link</p>
        <p>For official records, please refer to original documents</p>
        <p margin-top:10px">© 2026 Lot Lounge Link. All rights reserved.</p>
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
      scale: 2,
      backgroundColor: '#ffffff',
      windowHeight: container.scrollHeight,
      windowWidth: 800
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

    // Save PDF
    pdf.save(`${owner.areaName}_profile_${Date.now()}.pdf`);
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    document.body.removeChild(container);
  }
}
