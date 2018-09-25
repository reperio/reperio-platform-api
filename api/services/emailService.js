class EmailService {
    async sendEmail(user, uow, request) {
        const messageHelper = await request.app.getNewMessageHelper();
        const userEmail = await uow.usersRepository.insertUserEmail(user.id, user.primaryEmail);
        const emailVerification = await uow.emailVerificationsRepository.addEntry(userEmail.id);
        const tokenUrl = `${request.server.app.config.webAppUrl}/#/emailVerification/${emailVerification.id}`

        const message = {
            to: user.primaryEmail,
            from: request.server.app.config.email.sender,
            type: 'email',
            subject: 'Email verification',
            contents: `Please <a href="${tokenUrl}">verify</a> your email address.`
        };

        await messageHelper.processMessage(message);
    }
}

module.exports = EmailService;
