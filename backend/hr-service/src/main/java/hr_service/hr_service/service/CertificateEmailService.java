package hr_service.hr_service.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
@ConditionalOnProperty(prefix = "spring.mail", name = "host")
public class CertificateEmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:noreply@konecta.local}")
    private String from;

    public CertificateEmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendCertificate(String to, String subject, String text, byte[] pdfBytes, String filename) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setFrom(from);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(text, false);
            helper.addAttachment(filename != null ? filename : "certificate.pdf",
                    new org.springframework.core.io.ByteArrayResource(pdfBytes) {
                        @Override
                        public String getFilename() { return filename != null ? filename : "certificate.pdf"; }
                    },
                    "application/pdf");
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new IllegalStateException("Failed to send certificate email", e);
        }
    }
}
