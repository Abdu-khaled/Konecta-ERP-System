package finance_service.finance_service.service;

import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvValidationException;
import finance_service.finance_service.dto.response.ImportSummary;
import finance_service.finance_service.model.Expense;
import finance_service.finance_service.model.ExpenseStatus;
import finance_service.finance_service.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ExpenseImportService {

    private final ExpenseRepository expenseRepository;

    public ImportSummary importExpenses(MultipartFile file,
                                        String dateFormat,
                                        ExpenseStatus defaultStatus,
                                        String mode,
                                        Long importerId) throws IOException {
        String name = Optional.ofNullable(file.getOriginalFilename()).orElse("").toLowerCase();
        if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
            try (InputStream in = file.getInputStream()) {
                return importFromExcel(in, dateFormat, defaultStatus, mode, file.getOriginalFilename(), importerId);
            }
        } else if (name.endsWith(".csv")) {
            try (InputStream in = file.getInputStream()) {
                return importFromCsv(in, dateFormat, defaultStatus, mode, file.getOriginalFilename(), importerId);
            }
        } else {
            throw new IOException("Unsupported file type: " + name);
        }
    }

    // Binary-based import (no multipart) – filename used to detect type
    public ImportSummary importExpenses(byte[] bytes,
                                        String originalFilename,
                                        String dateFormat,
                                        ExpenseStatus defaultStatus,
                                        String mode,
                                        Long importerId) throws IOException {
        String name = Optional.ofNullable(originalFilename).orElse("").toLowerCase();
        try (InputStream in = new java.io.ByteArrayInputStream(bytes)) {
            if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
                return importFromExcel(in, dateFormat, defaultStatus, mode, originalFilename, importerId);
            }
        }
        try (InputStream in = new java.io.ByteArrayInputStream(bytes)) {
            if (name.endsWith(".csv") || name.isEmpty()) {
                return importFromCsv(in, dateFormat, defaultStatus, mode, originalFilename, importerId);
            }
        }
        throw new IOException("Unsupported file type: " + name);
    }

    private ImportSummary importFromExcel(InputStream in, String dateFormat, ExpenseStatus defaultStatus, String mode, String fileName, Long importerId) throws IOException {
        ImportSummary summary = new ImportSummary(0,0,0,new ArrayList<>());
        try (Workbook wb = WorkbookFactory.create(in)) {
            Sheet sheet = wb.getNumberOfSheets() > 0 ? wb.getSheetAt(0) : null;
            if (sheet == null) return summary;

            Map<String, Integer> idx = new HashMap<>();
            DataFormatter fmt = new DataFormatter();
            Row header = sheet.getRow(sheet.getFirstRowNum());
            for (Cell c : header) {
                idx.put(fmt.formatCellValue(c).trim().toLowerCase(), c.getColumnIndex());
            }
            int iMonth = firstOf(idx, "month", "date");
            int iDept = firstOf(idx, "department");
            int iType = firstOf(idx, "expense type", "category", "type");
            int iAmount = firstOf(idx, "amount", "value");
            DateTimeFormatter df = DateTimeFormatter.ofPattern(dateFormat);

            for (int r = sheet.getFirstRowNum() + 1; r <= sheet.getLastRowNum(); r++) {
                Row row = sheet.getRow(r);
                if (row == null) continue;
                try {
                    String sMonth = fmt.formatCellValue(row.getCell(iMonth)).trim();
                    String dept = fmt.formatCellValue(row.getCell(iDept)).trim();
                    String cat = fmt.formatCellValue(row.getCell(iType)).trim();
                    String sAmt = fmt.formatCellValue(row.getCell(iAmount)).trim();
                    if (sMonth.isEmpty() || dept.isEmpty() || cat.isEmpty() || sAmt.isEmpty()) { summary.setSkipped(summary.getSkipped()+1); continue; }

                    LocalDate parsed;
                    Cell monthCell = row.getCell(iMonth);
                    if (monthCell != null && DateUtil.isCellDateFormatted(monthCell)) {
                        parsed = monthCell.getLocalDateTimeCellValue().toLocalDate();
                    } else {
                        parsed = parseDateFlexible(sMonth, df);
                    }
                    parsed = parsed.withDayOfMonth(1);
                    double amount = parseAmountFlexible(sAmt);

                    upsertExpense(summary, dept, cat, parsed, amount, defaultStatus, mode, fileName, importerId);
                } catch (Exception ex) {
                    summary.getErrors().add("Row " + (r+1) + ": " + ex.getMessage());
                    summary.setSkipped(summary.getSkipped()+1);
                }
            }
            return summary;
        }
    }

    private ImportSummary importFromCsv(InputStream in, String dateFormat, ExpenseStatus defaultStatus, String mode, String fileName, Long importerId) throws IOException {
        ImportSummary summary = new ImportSummary(0,0,0,new ArrayList<>());
        try (CSVReader reader = new CSVReader(new InputStreamReader(in))) {
            String[] header = reader.readNext();
            if (header == null) return summary;
            Map<String,Integer> idx = new HashMap<>();
            for (int i=0;i<header.length;i++) idx.put(header[i].trim().toLowerCase(), i);
            int iMonth = firstOf(idx, "month", "date");
            int iDept = firstOf(idx, "department");
            int iType = firstOf(idx, "expense type", "category", "type");
            int iAmount = firstOf(idx, "amount", "value");

            DateTimeFormatter df = DateTimeFormatter.ofPattern(dateFormat);
            String[] row;
            int r = 1;
            while ((row = reader.readNext()) != null) {
                r++;
                try {
                    String sMonth = get(row, iMonth);
                    String dept = get(row, iDept);
                    String cat = get(row, iType);
                    String sAmt = get(row, iAmount);
                    if (sMonth.isBlank() || dept.isBlank() || cat.isBlank() || sAmt.isBlank()) { summary.setSkipped(summary.getSkipped()+1); continue; }
                    LocalDate parsed = parseDateFlexible(sMonth, df).withDayOfMonth(1);
                    double amount = parseAmountFlexible(sAmt);
                    upsertExpense(summary, dept, cat, parsed, amount, defaultStatus, mode, fileName, importerId);
                } catch (Exception ex) {
                    summary.getErrors().add("Row " + r + ": " + ex.getMessage());
                    summary.setSkipped(summary.getSkipped()+1);
                }
            }
        } catch (CsvValidationException e) {
            throw new IOException(e);
        }
        return summary;
    }

    private static LocalDate parseDateFlexible(String text, DateTimeFormatter preferred) {
        String s = (text == null ? "" : text.trim());
        if (s.isEmpty()) throw new IllegalArgumentException("Empty date");
        List<DateTimeFormatter> fmts = List.of(
                preferred,
                DateTimeFormatter.ofPattern("d/M/yyyy"),
                DateTimeFormatter.ofPattern("M/d/yyyy"),
                DateTimeFormatter.ofPattern("yyyy-MM-dd"),
                DateTimeFormatter.ofPattern("yyyy/MM/dd"),
                DateTimeFormatter.ofPattern("M/yyyy"),
                DateTimeFormatter.ofPattern("MM/yyyy"),
                DateTimeFormatter.ofPattern("yyyy-MM"),
                DateTimeFormatter.ofPattern("yyyy/MM"),
                DateTimeFormatter.ofPattern("MMM-yyyy"),
                DateTimeFormatter.ofPattern("MMMM yyyy"),
                DateTimeFormatter.ofPattern("MMM yyyy")
        );
        for (DateTimeFormatter f: fmts) {
            try {
                LocalDate d = LocalDate.parse(s, f);
                if (f.toString().contains("M/yyyy") || f.toString().contains("yyyy-MM") || f.toString().contains("MMM")) {
                    return d.withDayOfMonth(1);
                }
                return d;
            } catch (DateTimeParseException ignored) {}
        }
        // Try numeric year-month like 2025-1 or 2025/1
        String norm = s.replace('.', '-').replace('/', '-').replace(' ', '-');
        if (norm.matches("\\d{4}-\\d{1,2}")) {
            String[] parts = norm.split("-");
            int y = Integer.parseInt(parts[0]);
            int m = Integer.parseInt(parts[1]);
            return LocalDate.of(y, m, 1);
        }
        throw new IllegalArgumentException("Cannot parse date: '" + text + "'");
    }

    private static double parseAmountFlexible(String s) {
        String t = (s == null ? "" : s.trim());
        boolean neg = t.contains("(") && t.contains(")");
        t = t.replaceAll("[\\p{Sc}\\s]", ""); // remove currency symbols and spaces
        t = t.replace("(", "").replace(")", "");
        // Handle decimal/thousand separators
        if (t.contains(",") && t.contains(".")) {
            t = t.replace(",", "");
        } else if (t.contains(",") && !t.contains(".")) {
            t = t.replace(",", ".");
        }
        double v = Double.parseDouble(t);
        return neg ? -v : v;
    }

    private void upsertExpense(ImportSummary summary, String dept, String cat, LocalDate date, double amount, ExpenseStatus status, String mode, String fileName, Long importerId) {
        String extRef = String.format("%s|%s|%s", dept, cat, String.format("%d-%02d", date.getYear(), date.getMonthValue()));

        // Prefer idempotency by externalRef, then by (dept, category, date)
        Expense existing = expenseRepository.findByExternalRef(extRef);
        if (existing == null) {
            existing = expenseRepository.findByDepartmentAndCategoryAndExpenseDate(dept, cat, date);
        }
        if (existing == null) {
            Expense e = Expense.builder()
                    .department(dept)
                    .category(cat)
                    .expenseDate(date)
                    .amount(amount)
                    .status(status)
                    .createdAt(LocalDateTime.now())
                    .description("Imported " + (fileName == null ? "" : fileName))
                    .source(finance_service.finance_service.model.ExpenseSource.IMPORT)
                    .externalRef(extRef)
                    .submittedBy(importerId)
                    .build();
            expenseRepository.save(e);
            summary.setInserted(summary.getInserted()+1);
        } else {
            if ("upsert".equalsIgnoreCase(mode)) {
                existing.setAmount(amount);
                existing.setStatus(status);
                existing.setSource(finance_service.finance_service.model.ExpenseSource.IMPORT);
                existing.setExternalRef(extRef);
                if (existing.getSubmittedBy() == null && importerId != null) existing.setSubmittedBy(importerId);
                expenseRepository.save(existing);
                summary.setUpdated(summary.getUpdated()+1);
            } else {
                summary.setSkipped(summary.getSkipped()+1);
            }
        }
    }

    private static int firstOf(Map<String,Integer> idx, String... keys) {
        for (String k: keys) { Integer i = idx.get(k); if (i != null) return i; }
        throw new IllegalArgumentException("Missing required column: " + Arrays.toString(keys));
    }

    private static String get(String[] row, int i) { return i >=0 && i < row.length ? row[i].trim() : ""; }
}
