class EmailService {
    async sendVerificationEmail(userEmail, uow, request) {
        const messageHelper = await request.app.getNewMessageHelper();
        const emailVerification = await uow.emailVerificationsRepository.addEntry(userEmail.id, userEmail.userId);
        const tokenUrl = `${request.server.app.config.webAppUrl}/emailVerification/${emailVerification.id}`

        const message = {
            to: userEmail.email,
            from: request.server.app.config.email.sender,
            type: 'email',
            subject: 'Email verification',
            contents: `Please <a href="${tokenUrl}">verify</a> your email address.`
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

module.exports = EmailService;