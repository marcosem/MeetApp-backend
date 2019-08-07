import * as Yup from 'yup';
import { Op } from 'sequelize';
import { isBefore, parseISO, startOfDay, endOfDay } from 'date-fns';
// import { startOfHour, parseISO, isBefore, format } from 'date-fns';
// import pt from 'date-fns/locale/pt';
import Meetup from '../models/Meetup';
import User from '../models/User';
import File from '../models/File';

class MeetupController {
  async index(req, res) {
    const { page = 1, date } = req.query;
    const where = req.params.id ? { id: `${req.params.id}` } : {};

    if (date) {
      const parsedDate = parseISO(date);

      where.date = {
        [Op.between]: [startOfDay(parsedDate), endOfDay(parsedDate)],
      };
    }

    // If there is no date especified list just for the current user
    const meetups = await Meetup.findAll({
      where,
      order: ['date'],
      attributes: ['id', 'title', 'description', 'location', 'date'],
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

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string().required(),
      location: Yup.string().required(),
      date: Yup.date().required(),
      banner_id: Yup.number().required(),
      // user_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { date, title, description, location, banner_id } = req.body;

    // Compare two dates and verify if first argment is before the second one
    if (isBefore(parseISO(date), new Date())) {
      return res.status(400).json({ error: 'Past dates are not permitted' });
    }

    const meetup = await Meetup.create({
      user_id: req.UserId,
      title,
      description,
      location,
      date,
      banner_id,
    });

    return res.json(meetup);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string(),
      description: Yup.string(),
      location: Yup.string(),
      date: Yup.date(),
      banner_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const meetup = await Meetup.findByPk(req.params.id);

    // Didn't file the meetup id
    if (!meetup) {
      return res.status(400).json({ error: 'Meetup not found' });
    }

    if (meetup.user_id !== req.UserId) {
      return res.status(401).json({ error: 'Permission Denied' });
    }

    // const { title, description, location, date, banner_id } = req.body;
    const { title, description, location, date, banner_id } = req.body;

    // Is the date valid? If so, check it
    if (date) {
      const hourStart = parseISO(date);

      // Compare two dates and verify if first argment is before the second one
      if (isBefore(hourStart, new Date())) {
        return res.status(400).json({ error: 'Past dates are not permitted' });
      }
    }

    // Only update the fields that were in the JSON, otherwise, keep the same
    await meetup.update({
      title: !title ? meetup.title : title,
      description: !description ? meetup.description : description,
      location: !location ? meetup.location : location,
      date: !date ? meetup.date : date,
      banner_id: !banner_id ? meetup.banner_id : banner_id,
    });

    return res.json(meetup);
  }

  async delete(req, res) {
    const meetup = await Meetup.findByPk(req.params.id);

    // Didn't file the meetup id
    if (!meetup) {
      return res.status(400).json({ error: 'Record not found' });
    }

    if (meetup.user_id !== req.UserId) {
      return res.status(401).json({ error: 'Permission Denied' });
    }

    // Compare two dates and verify if first argment is before the second one
    if (isBefore(meetup.date, new Date())) {
      return res.status(400).json({ error: 'Cannot cancel past meetups' });
    }

    await Meetup.destroy({ where: { id: req.params.id } }).then(
      deletedRecord => {
        if (deletedRecord === 1) {
          return res.status(200).json({ message: 'Deleted successfully' });
        }
        return res.status(404).json({ error: 'Record not found' });
      }
    );

    return res.status(200);
  }
}

export default new MeetupController();
