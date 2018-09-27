class EmailService {
    async sendVerificationEmail(userEmail, uow, request) {
        const messageHelper = await request.app.getNewMessageHelper();
        const emailVerification = await uow.emailVerificationsRepository.addEntry(userEmail.id, userEmail.userId);
        const tokenUrl = `${request.server.app.config.webAppUrl}/#/emailVerification/${emailVerification.id}`

        const message = {
            to: userEmail.email,
            from: request.server.app.config.email.sender,
            type: 'email',
            subject: 'Email verification',
            contents: `Please <a href="${tokenUrl}">verify</a> your email address.`
        };

        await messageHelper.processMessage(message);
    }
}

module.exports = EmailService;