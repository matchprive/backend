import { generateResumeLink } from './sessionManagement';

/**
 * Send resume link email
 * @param email User's email address
 * @param sessionId Session ID
 * @returns Promise resolving to success status
 */
export async function sendResumeLinkEmail(email: string, sessionId: string): Promise<boolean> {
    try {
        const resumeLink = generateResumeLink(sessionId);
        
        // TODO: Replace with actual email service (SendGrid, AWS SES, etc.)
        console.log(`Sending resume link to ${email}: ${resumeLink}`);
        
        // Mock email sending
        await new Promise(resolve => setTimeout(resolve, 100));
        
        return true;
    } catch (error) {
        console.error('Failed to send resume link email:', error);
        return false;
    }
}

/**
 * Send welcome back email
 * @param email User's email address
 * @param sessionId Session ID
 * @returns Promise resolving to success status
 */
export async function sendWelcomeBackEmail(email: string, sessionId: string): Promise<boolean> {
    try {
        const resumeLink = generateResumeLink(sessionId);
        
        // TODO: Replace with actual email service
        console.log(`Sending welcome back email to ${email}: ${resumeLink}`);
        
        // Mock email sending
        await new Promise(resolve => setTimeout(resolve, 100));
        
        return true;
    } catch (error) {
        console.error('Failed to send welcome back email:', error);
        return false;
    }
} 