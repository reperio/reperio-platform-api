class EmailService {
    async sendVerificationEmail(userEmail, uow, request, applicationId) {
        const messageHelper = await request.app.getNewMessageHelper();
        const emailVerification = await uow.emailVerificationsRepository.addEntry(userEmail.id, userEmail.userId);
        const tokenUrl = `${request.server.app.config.webAppUrl}/emailVerification/${emailVerification.id}`;
        let emailContent = `Please <a href="${tokenUrl}">verify</a> your email address.`

        switch (applicationId) {
            case '2ce36838-27ae-4c00-b754-e2db7b61c577': // Reperio Managed IT Services
                emailContent = `Thanks for completing our survey, <a href="${tokenUrl}">click here</a> to go register your first desktop`
                break;
        
            default:
                break;
        }

        const message = {
            to: userEmail.email,
            from: request.server.app.config.email.sender,
            type: 'email',
            subject: 'Email verification',
            contents: emailContent
        };

        return await messageHelper.processMessage(message);
    }

    async sendForgotPasswordEmail(userEmail, uow, request) {
        const messageHelper = await request.app.getNewMessageHelper();
        const forgotPassword = await uow.forgotPasswordsRepository.addEntry(userEmail.id, userEmail.userId);
        const tokenUrl = `${request.server.app.config.webAppUrl}/resetPassword/${forgotPassword.id}`

        const message = {
            to: userEmail.email,
            from: request.server.app.config.email.sender,
            type: 'email',
            subject: 'Reset password',
            contents: `We got a request to reset your password. Please use this <a href="${tokenUrl}">link</a> to reset it.`
        };

        return await messageHelper.processMessage(message);
    }
}

const emailService = new EmailService();

module.exports = emailService;