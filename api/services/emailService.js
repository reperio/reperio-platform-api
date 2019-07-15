class EmailService {
    async sendVerificationEmail(userEmail, uow, request, applicationId) {
        const messageHelper = await request.app.getNewMessageHelper();
        const forgotPassword = await uow.forgotPasswordsRepository.addEntry(userEmail.id, userEmail.userId);
        let tokenUrl = `${request.server.app.config.authWebAppUrl}/passwordManagement/${forgotPassword.id}/create`;
        let emailContent;

        let application = await uow.applicationsRepository.getApplicationById(applicationId);
        if (!application) {
            throw new Error("Application not found");
        }

        switch (application.name) {
            case 'Managed IT Services': // Reperio Managed IT Services
                const encodedNext = encodeURIComponent(application.clientUrl + '/login');
                tokenUrl = `${tokenUrl}?next=${encodedNext}`; 
                emailContent = `Thanks for completing our survey, <a href="${tokenUrl}">click here</a> to go register your first desktop`
                break;
        
            default:
                const encodedNext = encodeURIComponent(request.server.app.config.webAppUrl);
                tokenUrl = `${tokenUrl}?next=${encodedNext}`; 
                emailContent = `Please <a href="${tokenUrl}">verify</a> your email address.`;
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
        const tokenUrl = `${request.server.app.config.authWebAppUrl}/passwordManagement/${forgotPassword.id}/reset`

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