class EmailService {
    async sendVerificationEmail(userEmail, uow, request, applicationId) {
        const messageHelper = await request.app.getNewMessageHelper();
        const forgotPassword = await uow.forgotPasswordsRepository.addEntry(userEmail.id, userEmail.userId);
        let tokenUrl = `${request.server.app.config.authWebAppUrl}/passwordManagement/${forgotPassword.id}/create`;
        let encodedNext = encodeURIComponent(request.server.app.config.webAppUrl);
        let emailContent;

        let application = await uow.applicationsRepository.getApplicationById(applicationId);
        if (!application) {
            throw new Error("Application not found");
        }

        switch (application.name) {
            case 'Managed IT Services': // Reperio Managed IT Services
                const appURI = new URL(application.clientUrl);
                encodedNext = encodeURIComponent(appURI.origin + '/login');
                tokenUrl = `${tokenUrl}?next=${encodedNext}&email=${encodeURIComponent(userEmail.email)}`; 
                emailContent = `Thanks for completing our survey, <a href="${tokenUrl}">click here</a> to set your password and go register your first desktop!`
                break;
        
            default:
                tokenUrl = `${tokenUrl}?next=${encodedNext}&email=${encodeURIComponent(userEmail.email)}`; 
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
        const tokenUrl = `${request.server.app.config.authWebAppUrl}/passwordManagement/${forgotPassword.id}/reset?email=${encodeURIComponent(userEmail.email)}`

        const message = {
            to: userEmail.email,
            from: request.server.app.config.email.sender,
            type: 'email',
            subject: 'Reset password',
            contents: `We got a request to reset your password. Please use this <a href="${tokenUrl}">link</a> to reset it.`
        };

        return await messageHelper.processMessage(message);
    }

    async sendNotificationEmail(uow, request, applicationId, addressee, body) {
        const messageHelper = await request.app.getNewMessageHelper();
        let application = await uow.applicationsRepository.getApplicationById(applicationId);
        if (!application) {
            throw new Error("Application not found");
        }

        const message = {
            to: addressee,
            from: request.server.app.config.email.sender,
            type: 'email',
            subject: `This is a notification from application: ${application.name}`,
            contents: body
        };

        return await messageHelper.processMessage(message);
    }
}

const emailService = new EmailService();

module.exports = emailService;