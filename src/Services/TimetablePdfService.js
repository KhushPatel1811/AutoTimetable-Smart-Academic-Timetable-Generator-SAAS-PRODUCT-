const escapePdfText = (value = "") =>
    String(value)
        .replace(/\\/g, "\\\\")
        .replace(/\(/g, "\\(")
        .replace(/\)/g, "\\)");

const lineText = (text, x, y, size = 10) =>
    `BT /F1 ${size} Tf ${x} ${y} Td (${escapePdfText(text)}) Tj ET`;

export const generateTimetablePdf = (timetable) => {
    const lines = [];
    lines.push(`${timetable.departmentName || "Department"} Timetable`);
    lines.push(`Semester: ${timetable.semester || "-"} | Version: ${timetable.version || 1}`);
    lines.push(`Generated: ${new Date(timetable.createdAt || Date.now()).toLocaleString()}`);
    lines.push("");

    for (const division of timetable.divisions || []) {
        lines.push(division.divisionName || "Division");

        for (const day of division.schedule || []) {
            const slots = (day.slots || [])
                .map((slot, index) => `${index + 1}. ${slot.subjectName || "Free"} (${slot.subjectType || "Free"})`)
                .join(" | ");
            lines.push(`${day.day}: ${slots}`);
        }

        lines.push("");
    }

    const pageObjects = [];
    const pages = [];
    let objectId = 3;

    for (let i = 0; i < lines.length; i += 36) {
        const pageLines = lines.slice(i, i + 36);
        const content = pageLines
            .map((line, index) => lineText(line.slice(0, 115), 40, 780 - index * 20, index === 0 && i === 0 ? 16 : 9))
            .join("\n");
        const contentObjectId = objectId++;
        const pageObjectId = objectId++;
        pageObjects.push({ id: contentObjectId, body: `<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream` });
        pageObjects.push({
            id: pageObjectId,
            body: `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 1 0 R >> >> /Contents ${contentObjectId} 0 R >>`
        });
        pages.push(`${pageObjectId} 0 R`);
    }

    const objects = [
        { id: 1, body: "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>" },
        { id: 2, body: `<< /Type /Pages /Kids [${pages.join(" ")}] /Count ${pages.length} >>` },
        ...pageObjects,
        { id: objectId, body: "<< /Type /Catalog /Pages 2 0 R >>" }
    ];

    let pdf = "%PDF-1.4\n";
    const offsets = [0];

    for (const object of objects) {
        offsets[object.id] = Buffer.byteLength(pdf);
        pdf += `${object.id} 0 obj\n${object.body}\nendobj\n`;
    }

    const xrefOffset = Buffer.byteLength(pdf);
    pdf += `xref\n0 ${objectId + 1}\n0000000000 65535 f \n`;

    for (let id = 1; id <= objectId; id++) {
        pdf += `${String(offsets[id] || 0).padStart(10, "0")} 00000 n \n`;
    }

    pdf += `trailer\n<< /Size ${objectId + 1} /Root ${objectId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

    return Buffer.from(pdf);
};
