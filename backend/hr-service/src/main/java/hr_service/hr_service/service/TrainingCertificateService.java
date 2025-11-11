package hr_service.hr_service.service;

import hr_service.hr_service.model.Employee;
import hr_service.hr_service.model.Training;
import hr_service.hr_service.model.TrainingEnrollment;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Objects;

@Service
public class TrainingCertificateService {
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("MMMM d, yyyy");
    private static final Color PRIMARY = new Color(0x28, 0x00, 0xC8);
    private static final Color PRIMARY_ACCENT = new Color(0x5C, 0x32, 0xFF);
    private static final Color PRIMARY_LIGHT = new Color(0xEF, 0xEB, 0xFF);
    private static final Color PANEL_SHADOW = new Color(0xD9, 0xCF, 0xFF);
    private static final Color TEXT_PRIMARY = new Color(0x1D, 0x24, 0x38);
    private static final Color TEXT_MUTED = new Color(0x54, 0x63, 0x82);
    private static final Color SEAL = new Color(0xF4, 0xB0, 0x13);
    private static final float PAGE_MARGIN = 56f;
    private static final PDFont FONT_TITLE;
    private static final PDFont FONT_SUBTITLE;
    private static final PDFont FONT_NAME;
    private static final PDFont FONT_BODY;
    private static final PDFont FONT_BODY_BOLD;
    private static final PDFont FONT_SMALL_ITALIC;

    static {
        FONT_TITLE = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
        FONT_SUBTITLE = new PDType1Font(Standard14Fonts.FontName.HELVETICA_OBLIQUE);
        FONT_NAME = new PDType1Font(Standard14Fonts.FontName.TIMES_BOLD_ITALIC);
        FONT_BODY = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
        FONT_BODY_BOLD = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
        FONT_SMALL_ITALIC = new PDType1Font(Standard14Fonts.FontName.HELVETICA_OBLIQUE);
    }

    public byte[] generateCertificate(TrainingEnrollment enrollment) {
        try (PDDocument document = new PDDocument()) {
            PDRectangle landscape = new PDRectangle(PDRectangle.LETTER.getHeight(), PDRectangle.LETTER.getWidth());
            PDPage page = new PDPage(landscape);
            document.addPage(page);

            PDRectangle bounds = page.getMediaBox();

            try (PDPageContentStream content = new PDPageContentStream(document, page)) {
                drawBackground(content, bounds);
                drawBrandHeader(content, bounds);
                drawContent(content, bounds, enrollment);
                drawSeal(content, bounds);
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            document.save(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new IllegalStateException("Unable to generate certificate", e);
        }
    }

    private void drawBackground(PDPageContentStream content, PDRectangle page) throws IOException {
        // Soft background
        content.setNonStrokingColor(PRIMARY_LIGHT);
        content.addRect(0, 0, page.getWidth(), page.getHeight());
        content.fill();

        // Shadow behind main panel
        content.setNonStrokingColor(PANEL_SHADOW);
        content.addRect(PAGE_MARGIN + 4, PAGE_MARGIN - 4, page.getWidth() - (PAGE_MARGIN * 2), page.getHeight() - (PAGE_MARGIN * 2));
        content.fill();

        // Main panel
        content.setNonStrokingColor(Color.WHITE);
        content.addRect(PAGE_MARGIN, PAGE_MARGIN, page.getWidth() - (PAGE_MARGIN * 2), page.getHeight() - (PAGE_MARGIN * 2));
        content.fill();

        content.setStrokingColor(PRIMARY);
        content.setLineWidth(3f);
        content.addRect(PAGE_MARGIN, PAGE_MARGIN, page.getWidth() - (PAGE_MARGIN * 2), page.getHeight() - (PAGE_MARGIN * 2));
        content.stroke();

        // Bottom accent
        content.setNonStrokingColor(PRIMARY_ACCENT);
        content.addRect(PAGE_MARGIN, PAGE_MARGIN - 8, page.getWidth() - (PAGE_MARGIN * 2), 6);
        content.fill();
    }

    private void drawBrandHeader(PDPageContentStream content, PDRectangle page) throws IOException {
        float width = page.getWidth() - (PAGE_MARGIN * 2);
        float barHeight = 46f;
        float barY = page.getHeight() - PAGE_MARGIN - barHeight;

        content.setNonStrokingColor(PRIMARY);
        content.addRect(PAGE_MARGIN, barY, width, barHeight);
        content.fill();

        // Brand wordmark
        float brandTitleY = barY + barHeight - 14;
        writeCentered(content, page, FONT_TITLE, 20, brandTitleY, Color.WHITE, "SYNC");
        writeCentered(content, page, FONT_SMALL_ITALIC, 11, barY + 12, Color.WHITE, "Konecta HR Training");
    }

    private void drawContent(PDPageContentStream content, PDRectangle page, TrainingEnrollment enrollment) throws IOException {
        final String employeeName = resolveEmployeeName(enrollment.getEmployee());
        final Training training = enrollment.getTraining();
        final String programTitle = training != null && training.getTitle() != null
                ? training.getTitle()
                : "Training Program";

        LocalDate issuedDate = training != null && training.getEndDate() != null
                ? training.getEndDate()
                : enrollment.getEnrolledAt().toLocalDate();

        float y = page.getHeight() - PAGE_MARGIN - 110;
        writeCentered(content, page, FONT_TITLE, 20, y, PRIMARY, "CERTIFICATE OF COMPLETION");

        y -= 60;
        writeCentered(content, page, FONT_SUBTITLE, 12, y, TEXT_MUTED, "This certificate is presented to");

        y -= 45;
        writeCentered(content, page, FONT_NAME, 34, y, PRIMARY_ACCENT, employeeName);

        y -= 45;
        writeCentered(content, page, FONT_BODY, 12, y, TEXT_PRIMARY, "For successfully completing");

        y -= 32;
        writeCentered(content, page, FONT_BODY_BOLD, 18, y, PRIMARY, "\"" + programTitle + "\"");

        String durationLine = buildDurationLine(training);
        if (!durationLine.isBlank()) {
            y -= 25;
            writeCentered(content, page, FONT_BODY, 11, y, TEXT_MUTED, durationLine);
        }

        y -= 80;
        writeCentered(content, page, FONT_BODY_BOLD, 12, y, TEXT_PRIMARY, "Date: " + DATE_FORMAT.format(issuedDate));

        y -= 50;
        writeCentered(content, page, FONT_SMALL_ITALIC, 10, y, TEXT_MUTED, "Awarded by Konecta HR Training Department");
    }

    private void drawSeal(PDPageContentStream content, PDRectangle page) throws IOException {
        float size = 80;
        float x = (page.getWidth() / 2f) - (size / 2f);
        float y = 120;

        content.setNonStrokingColor(PRIMARY_ACCENT);
        content.addRect(x, y, size, size);
        content.fill();

        content.setNonStrokingColor(Color.WHITE);
        content.addRect(x + 8, y + 8, size - 16, size - 16);
        content.fill();

        content.setStrokingColor(PRIMARY);
        content.setLineWidth(2.5f);
        content.addRect(x + 8, y + 8, size - 16, size - 16);
        content.stroke();

        content.beginText();
        content.setFont(FONT_BODY_BOLD, 18);
        content.setNonStrokingColor(PRIMARY);
        content.newLineAtOffset(page.getWidth() / 2f - 14, y + size / 2f - 6);
        content.showText("SYNC");
        content.endText();
    }

    private void writeCentered(PDPageContentStream content, PDRectangle page, PDFont font, float fontSize, float y, Color color, String text) throws IOException {
        float textWidth = font.getStringWidth(text) / 1000f * fontSize;
        float startX = (page.getWidth() - textWidth) / 2f;
        content.beginText();
        content.setFont(font, fontSize);
        content.setNonStrokingColor(color);
        content.newLineAtOffset(startX, y);
        content.showText(text);
        content.endText();
    }

    private String resolveEmployeeName(Employee employee) {
        if (employee == null) return "Esteemed Participant";
        String first = Objects.toString(employee.getFirstName(), "").trim();
        String last = Objects.toString(employee.getLastName(), "").trim();
        String combined = (first + " " + last).trim();
        if (!combined.isEmpty()) return combined;
        if (employee.getEmail() != null && !employee.getEmail().isBlank()) return employee.getEmail();
        return "Employee #" + employee.getId();
    }

    private String buildDurationLine(Training training) {
        if (training == null) return "";
        LocalDate start = training.getStartDate();
        LocalDate end = training.getEndDate();
        if (start == null && end == null) return "";
        if (start != null && end != null) {
            return "Held between " + DATE_FORMAT.format(start) + " and " + DATE_FORMAT.format(end);
        }
        LocalDate only = start != null ? start : end;
        return "Held on " + DATE_FORMAT.format(only);
    }
}
