import Mail from '../../lib/Mail';

class SubscriptionMail {
  get key() {
    return 'SubscriptionMail';
  }

  async handle({ data }) {
    const { user, owner, meetup } = data.MailData;

    await Mail.sendMail({
      to: `${owner.name} <${owner.email}>`,
      subject: 'Usuario inscrito ao seu meetup',
      template: 'subscription',
      context: {
        owner: owner.name,
        meetup,
        user: user.name,
        email: user.email,
      },
    });
  }
}

export default new SubscriptionMail();
