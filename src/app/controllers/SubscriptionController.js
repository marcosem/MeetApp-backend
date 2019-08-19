import { Op } from 'sequelize';
import Meetup from '../models/Meetup';
import User from '../models/User';
import Subscription from '../models/Subscrition';
import SubscriptionMail from '../jobs/SubscriptionMail';
import File from '../models/File';
import Queue from '../../lib/Queue';

class SubscriptionController {
  async index(req, res) {
    /*
    const subscriptions = await Subscription.findAll({
      where: {
        user_id: req.UserId,
      },
      include: [
        {
          model: Meetup,
          where: {
            date: {
              [Op.gt]: new Date(), // only dates before now
            },
          },
          attributes: ['title', 'description', 'location', 'date'],
          required: true,
        },
      ],
      order: [[Meetup, 'date']],
    });
*/
    // If there is no date especified list just for the current user
    const subscriptions = await Subscription.findAll({
      where: {
        user_id: req.UserId,
      },
      include: [
        {
          model: Meetup,
          where: {
            date: {
              [Op.gt]: new Date(), // only dates before now
            },
          },
          attributes: ['id', 'title', 'description', 'location', 'date'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['name', 'email'],
            },
            {
              model: File,
              as: 'banner',
              attributes: ['id', 'path', 'url'],
            },
          ],
          required: true,
        },
      ],
      order: [[Meetup, 'date']],
    });

    return res.json(subscriptions);
  }

  async store(req, res) {
    const meetup = await Meetup.findByPk(req.params.id);

    if (!meetup) {
      return res.status(400).json({ error: 'Meetup not found' });
    }

    if (req.UserId === meetup.user_id) {
      return res
        .status(400)
        .json({ error: 'You cannot subscribe to your own meetups' });
    }

    if (meetup.past) {
      return res
        .status(400)
        .json({ error: 'You cannot subscribe to past meetups' });
    }

    const verifyDuplicatedDate = await Subscription.findOne({
      where: {
        user_id: req.UserId,
      },
      include: [
        {
          model: Meetup,
          required: true,
          where: {
            date: meetup.date,
          },
        },
      ],
    });

    if (verifyDuplicatedDate) {
      // Already subscribed
      if (verifyDuplicatedDate.meetup_id === Number(req.params.id)) {
        return res.status(400).json({
          error: 'You are already subscribed to this meetup',
        });
      }

      // Two meetups at the same time
      return res.status(400).json({
        error: 'You already subscribed to another meetup at the same date/time',
      });
    }

    const subscription = await Subscription.create({
      user_id: req.UserId,
      meetup_id: meetup.id,
    });

    const user = await User.findByPk(req.UserId, {
      attributes: ['name', 'email'],
    });
    const owner = await User.findByPk(meetup.user_id, {
      attributes: ['name', 'email'],
    });

    const MailData = {
      user,
      owner,
      meetup: meetup.title,
    };

    await Queue.add(SubscriptionMail.key, {
      MailData,
    });

    return res.json(subscription);
  }
}

export default new SubscriptionController();
