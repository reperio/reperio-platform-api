class EmailService {
    async sendEmail(userId, userEmailAddress, uow, request) {
        const messageHelper = await request.app.getNewMessageHelper();
        let userEmail = await uow.userEmailsRepository.getUserEmail(userId, userEmailAddress);
        if (!userEmail) {
            userEmail = await uow.userEmailsRepository.createUserEmail(userId, userEmailAddress);
        }
        const emailVerification = await uow.emailVerificationsRepository.addEntry(userEmail.id);
        const tokenUrl = `${request.server.app.config.webAppUrl}/#/emailVerification/${emailVerification.id}`

        const message = {
            to: userEmailAddress,
            from: request.server.app.config.email.sender,
            type: 'email',
            subject: 'Email verification',
            contents: `Please <a href="${tokenUrl}">verify</a> your email address.`
        };

        await messageHelper.processMessage(message);
    }
}

module.exports = EmailService;
