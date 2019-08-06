import Meetup from '../models/Meetup';
import User from '../models/User';
import File from '../models/File';

class OwnerController {
  async index(req, res) {
    const { page = 1 } = req.query;

    // If there is no date especified list just for the current user
    const meetups = await Meetup.findAll({
      where: { user_id: req.UserId },
      order: ['date'],
      attributes: [
        'id',
        'title',
        'description',
        'location',
        'date',
        'cancelable',
      ],
      limit: 10,
      offset: (page - 1) * 10,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name', 'email'],
        },
        {
          model: File,
          as: 'banner',
          attributes: ['path', 'url'],
        },
      ],
    });

    return res.json(meetups);
  }
}

export default new OwnerController();
