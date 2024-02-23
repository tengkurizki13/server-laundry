const { Request,User,Track } = require("../models");

class TrackController {
  static async getTracks(req, res, next) {
    try {
      const { id } = req.params;
      let option = {
        include: [
          {
            model: User,
            attributes: {
              exclude: ["password"],
            },
          },
          {
            model: Request,
          },
        ],
        where: {requestId : id},
        order: [["id", "ASC"]],
      };


      let tracks = await Track.findAll(option);


      res.status(200).json({
        message: "all track",
        data: tracks,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
}

module.exports = TrackController;
