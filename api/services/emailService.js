class EmailService {
    async sendVerificationEmail(userId, email, uow, request, applicationId) {
        const messageHelper = await request.app.getNewMessageHelper();
        const forgotPassword = await uow.forgotPasswordsRepository.addEntry(userId);
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
                tokenUrl = `${tokenUrl}?next=${encodedNext}&email=${encodeURIComponent(email)}`; 
                emailContent = `Thanks for completing our survey, <a href="${tokenUrl}">click here</a> to set your password and go register your first desktop!`
                break;
        
            default:
                tokenUrl = `${tokenUrl}?next=${encodedNext}&email=${encodeURIComponent(email)}`; 
                emailContent = `Please <a href="${tokenUrl}">verify</a> your email address.`;
                break;
        }

        const message = {
            to: email,
            from: request.server.app.config.email.sender,
            type: 'email',
            subject: 'Email verification',
            contents: emailContent
        };

        return await messageHelper.processMessage(message);
    }

    async sendInviteEmail(userId, email, uow, request, applicationId, existingUser) {
        const messageHelper = await request.app.getNewMessageHelper();
        const tokenEntry = await uow.forgotPasswordsRepository.addEntry(userId);
        let emailContent;

        let application = await uow.applicationsRepository.getApplicationById(applicationId);
        if (!application) {
            throw new Error("Application not found");
        }
        const appURI = new URL(application.clientUrl);

        if (existingUser) {
            //* login -> MITS invite accept
            encodedNext = encodeURIComponent(`${appURI.origin}/invitation/${userId}?token=${tokenEntry.id}`);
            tokenUrl = `${request.server.app.config.authWebAppUrl}/login?next=${encodedNext}&email=${encodeURIComponent(email)}`
            emailContent = `You have been invited to join an organization! <a href="${tokenUrl}>Click Here</a> to join.`; // TODO: include org name and inviting user
        } else {
            //* create password -> login -> MITS invite accept
            const passwordEntry = await uow.forgotPasswordsRepository.addEntry(userId); // TODO: might need to reverse order of token creation
            encodedNext = encodeURIComponent(`${appURI.origin}/invitation/${userId}?token=${tokenEntry.id}`);
            tokenUrl = `${appURI.origin}/passwordManagement/${passwordEntry.id}/create&next=${encodedNext}&email=${encodeURIComponent(email)}`;
            emailContent = `You have been invited to join an organization! <a href="${tokenUrl}>Click Here</a> to join and create a Reperio user account.`; // TODO: include org name and inviting user
        }

        const message = {
            to: email,
            from: request.server.app.config.email.sender,
            type: 'email',
            subject: 'Invitation to Reperio Organization',
            contents: emailContent
        };

        return await messageHelper.processMessage(message);
    }

    async sendForgotPasswordEmail(userId, email, uow, request) {
        const messageHelper = await request.app.getNewMessageHelper();
        const forgotPassword = await uow.forgotPasswordsRepository.addEntry(userId);
        const tokenUrl = `${request.server.app.config.authWebAppUrl}/passwordManagement/${forgotPassword.id}/reset?email=${encodeURIComponent(email)}`

        const message = {
            to: email,
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