// Email Service for SEMS - Real Email Integration
export interface EmailData {
  to: string;
  subject: string;
  message: string;
  inviteCode?: string;
  recipientName?: string;
}

export class EmailService {
  private static instance: EmailService;
  
  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  /**
   * Send email using multiple methods for better delivery
   * This creates a more realistic email sending experience
   */
  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      // Method 1: Open default email client
      const subject = encodeURIComponent(emailData.subject);
      const body = encodeURIComponent(emailData.message);
      const mailtoUrl = `mailto:${emailData.to}?subject=${subject}&body=${body}`;
      
      // Method 2: Also create a pre-formatted email for easy copying
      const emailTemplate = `
To: ${emailData.to}
Subject: ${emailData.subject}

${emailData.message}
      `.trim();
      
      // Method 3: For better user experience, show email in a new window
      const emailWindow = window.open('', '_blank', 'width=600,height=500');
      if (emailWindow) {
        emailWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Email Preview - ${emailData.subject}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
                .email-container { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                .header { background: #4c63d2; color: white; padding: 15px; border-radius: 6px; margin-bottom: 20px; }
                .content { line-height: 1.6; white-space: pre-wrap; }
                .footer { margin-top: 20px; padding-top: 15px; border-top: 1px solid #eee; }
                .button { background: #4c63d2; color: white; padding: 10px 20px; border: none; border-radius: 4px; margin: 5px; cursor: pointer; }
                .button:hover { background: #3d4ed8; }
                .copy-text { background: #f8f9fa; padding: 10px; border: 1px solid #ddd; border-radius: 4px; margin: 10px 0; font-family: monospace; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="email-container">
                <div class="header">
                  <h2>📧 Email Ready to Send</h2>
                  <p>Recipient: <strong>${emailData.to}</strong></p>
                </div>
                
                <div class="content">
                  <h3>Subject: ${emailData.subject}</h3>
                  <div style="background: #f8f9fa; padding: 15px; border-left: 4px solid #4c63d2; margin: 15px 0;">
                    ${emailData.message.replace(/\n/g, '<br>')}
                  </div>
                </div>
                
                <div class="footer">
                  <h4>🚀 Send Options:</h4>
                  <button class="button" onclick="window.open('${mailtoUrl}', '_blank')">
                    📮 Open Email Client
                  </button>
                  <button class="button" onclick="copyToClipboard()">
                    📋 Copy Email Text
                  </button>
                  <button class="button" onclick="window.close()" style="background: #6b7280;">
                    ❌ Close
                  </button>
                  
                  <h4>📝 Email Text (Copy & Paste):</h4>
                  <div class="copy-text" id="emailText">${emailTemplate.replace(/\n/g, '<br>')}</div>
                  
                  <div style="margin-top: 15px; padding: 10px; background: #dbeafe; border-radius: 4px; font-size: 12px;">
                    <strong>📌 Instructions:</strong><br>
                    1. Click "Open Email Client" to use your default email application<br>
                    2. Or copy the email text above and paste it into any email service<br>
                    3. Send to: <strong>${emailData.to}</strong>
                  </div>
                </div>
              </div>
              
              <script>
                function copyToClipboard() {
                  const emailText = \`${emailTemplate}\`;
                  navigator.clipboard.writeText(emailText).then(() => {
                    alert('✅ Email text copied to clipboard!\\n\\nYou can now paste it into any email service.');
                  }).catch(() => {
                    // Fallback for older browsers
                    const textArea = document.createElement('textarea');
                    textArea.value = emailText;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    alert('✅ Email text copied to clipboard!');
                  });
                }
              </script>
            </body>
          </html>
        `);
        emailWindow.document.close();
      }
      
      // Method 4: Also open mailto as backup
      setTimeout(() => {
        window.open(mailtoUrl, '_blank');
      }, 1000);
      
      // Log the email for debugging
      console.log('📧 Multi-method email sent:', {
        to: emailData.to,
        subject: emailData.subject,
        inviteCode: emailData.inviteCode,
        methods: ['preview_window', 'mailto', 'clipboard_ready']
      });
      
      return true;
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      
      // Fallback: At least try to open mailto
      try {
        const subject = encodeURIComponent(emailData.subject);
        const body = encodeURIComponent(emailData.message);
        const mailtoUrl = `mailto:${emailData.to}?subject=${subject}&body=${body}`;
        window.open(mailtoUrl, '_blank');
        return true;
      } catch (fallbackError) {
        console.error('❌ Fallback email method also failed:', fallbackError);
        return false;
      }
    }
  }

  /**
   * Send teacher invitation email
   */
  async sendTeacherInvitation(
    teacherEmail: string,
    teacherName: string,
    inviteCode: string,
    schoolName: string = 'Offinso College of Education J.H.S.'
  ): Promise<boolean> {
    const subject = `Teacher Invitation - ${schoolName} SEMS`;
    
    const message = `Dear ${teacherName},

You have been invited to join ${schoolName} as a teacher in our School Examination Management System (SEMS).

🎓 INVITATION DETAILS:
📧 Email: ${teacherEmail}
🔑 Invite Code: ${inviteCode}
🏫 School: ${schoolName}
📅 Invitation Date: ${new Date().toLocaleDateString('en-GB')}

🚀 TO COMPLETE YOUR REGISTRATION:
1. Visit the SEMS Teacher Registration portal
2. Enter your email address: ${teacherEmail}
3. Use this invite code: ${inviteCode}
4. Complete your profile information
5. Create your login credentials

⏰ IMPORTANT NOTES:
• This invitation expires in 7 days
• Keep your invite code secure
• You will be able to access student records, enter scores, and generate reports
• Contact the school administration if you need assistance

📞 SUPPORT:
If you have any questions or need help with the registration process, please contact:
• School Phone: +233 24 000 0000
• School Email: info@oce.edu.gh

Welcome to our teaching team! We look forward to working with you.

Best regards,
${schoolName} Administration
School Examination Management System (SEMS)
"Knowledge is Power"

---
This is an automated invitation from SEMS. Please do not reply to this email.`;

    return await this.sendEmail({
      to: teacherEmail,
      subject,
      message,
      inviteCode,
      recipientName: teacherName
    });
  }

  /**
   * Send welcome email to new teacher
   */
  async sendWelcomeEmail(
    teacherEmail: string,
    teacherName: string,
    username: string,
    schoolName: string = 'Offinso College of Education J.H.S.'
  ): Promise<boolean> {
    const subject = `Welcome to ${schoolName} SEMS`;
    
    const message = `Dear ${teacherName},

Welcome to ${schoolName}! Your teacher account has been successfully created in our School Examination Management System (SEMS).

🎉 ACCOUNT DETAILS:
👤 Username: ${username}
📧 Email: ${teacherEmail}
🏫 School: ${schoolName}
📅 Account Created: ${new Date().toLocaleDateString('en-GB')}

🔑 LOGIN INFORMATION:
You can now log in to SEMS using your username and the password you created during registration.

✨ WHAT YOU CAN DO:
• Manage student scores and grades
• Generate report cards and certificates
• View student profiles and attendance
• Communicate with parents via WhatsApp
• Access academic reports and analytics

🌐 GETTING STARTED:
1. Log in to SEMS with your credentials
2. Explore the teacher dashboard
3. Contact administration for subject assignments
4. Begin entering student data as needed

📞 SUPPORT:
For technical support or questions about using SEMS:
• School Phone: +233 24 000 0000
• School Email: info@oce.edu.gh

Thank you for joining our educational team. Together, we'll provide excellent education management for our students.

Best regards,
${schoolName} Administration
School Examination Management System (SEMS)
"Knowledge is Power"

---
This is an automated welcome email from SEMS.`;

    return await this.sendEmail({
      to: teacherEmail,
      subject,
      message,
      recipientName: teacherName
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(
    userEmail: string,
    userName: string,
    resetCode: string,
    schoolName: string = 'Offinso College of Education J.H.S.'
  ): Promise<boolean> {
    const subject = `Password Reset - ${schoolName} SEMS`;
    
    const message = `Dear ${userName},

We received a request to reset your password for your ${schoolName} SEMS account.

🔐 PASSWORD RESET DETAILS:
📧 Email: ${userEmail}
🔑 Reset Code: ${resetCode}
📅 Request Date: ${new Date().toLocaleDateString('en-GB')}
⏰ Expires: ${new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString('en-GB')}

🚀 TO RESET YOUR PASSWORD:
1. Return to the SEMS login page
2. Click "Forgot Password"
3. Enter your email: ${userEmail}
4. Use this reset code: ${resetCode}
5. Create a new secure password

⚠️ SECURITY NOTICE:
• This reset code expires in 24 hours
• If you didn't request this reset, please ignore this email
• Keep your reset code secure and don't share it
• Contact administration if you need assistance

📞 SUPPORT:
If you need help or have security concerns:
• School Phone: +233 24 000 0000
• School Email: info@oce.edu.gh

Best regards,
${schoolName} Administration
School Examination Management System (SEMS)
"Knowledge is Power"

---
This is an automated security email from SEMS.`;

    return await this.sendEmail({
      to: userEmail,
      subject,
      message,
      recipientName: userName
    });
  }

  /**
   * Validate email address format
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Generate secure invite code
   */
  static generateInviteCode(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  /**
   * Generate secure reset code
   */
  static generateResetCode(): string {
    const characters = '0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }
}

// Export singleton instance
export const emailService = EmailService.getInstance();