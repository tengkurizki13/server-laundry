const { Request,User,Track } = require("../models");
const { Op } = require('sequelize');
const { format } = require("date-fns");
const {isConnected,fileSock} = require("../wa_confic")
const { sequelize } = require('../models'); 

class RequestController {
  static async requests(req, res, next) {
    try {
      let option = {
        include: [
          {
            model: User,
            attributes: {
              exclude: ["password"],
            },
          },
        ],
        order: [["id", "DESC"]],
      };
  
      if (req.query.filter) {
        option.where = {
          status: req.query.filter
        };
      }
  

      if (req.query.search) {
        let idNum = Number(req.query.search)
        console.log(idNum);
        option.where = {
          id: {
            [Op.eq]: idNum
          }
        };
      }

  
     // Menambahkan filter waktu jika disediakan
if (req.query.startDate && req.query.endDate) {
  option.where = option.where || {}; // Pastikan option.where sudah didefinisikan
  option.where.createdAt = {
    [Op.between]: [
      format(new Date(req.query.startDate), 'yyyy-MM-dd'),
      format(new Date(req.query.endDate), 'yyyy-MM-dd 23:59:59'),
    ]
  };
}

  
      let requests = await Request.findAll(option);
  
      res.status(200).json({
        message: "all request",
        data: requests,
      });
    } catch (error) {
      console.error(error);
      next(error);
    }
  }

  static async requestById(req, res, next) {
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
        ],
      };
      let request = await Request.findByPk(id, option);

      if (!request) throw { name: "notFound" };

      res.status(200).json({
        message: "detail request",
        data: request,
      });
    } catch (error) {
      next(error);
    }
  }

  static async requestAdd(req, res, next) {
    const t = await sequelize.transaction(); // Mulai transaksi

    try {
        const {
            scale,
            price,
            userId
        } = req.body;

        let newRequest = await Request.create({
            scale,
            price,
            userId
        }, { transaction: t }); // Gunakan transaksi

        let idRequest = Number(newRequest.id);
        let idPelanggan = Number(userId);

        await Track.create({
            userId: idPelanggan,
            requestId: idRequest,
            status: "proses"
        }, { transaction: t }); // Gunakan transaksi

        let request = await Request.findByPk(idRequest, { transaction: t });

        await t.commit(); // Komit transaksi jika berhasil

        res.status(201).json({
            message: "Request has been created successfully",
            data: request,
        });
    } catch (error) {
        await t.rollback(); // Rollback transaksi jika terjadi kesalahan
        console.log(error);
        next(error);
    }
}

  static async requestDelete(req, res, next) {
    try {
      const { id } = req.params;

      let request = await Request.findByPk(id);

      if (!request) throw { name: "notFound" };

      await request.destroy({ where: { id } });

      res.status(200).json(
        {
          massage: `request with id ${request.id} success to delete`,
        },
      );
    } catch (error) {
      next(error);
    }
  }

  static async requestUpdate(req, res, next) {
    try {
      const { id } = req.params;

      const {
        scale,
        price,
        status,
        userId,
      } = req.body;

      let request = await Request.findByPk(id);

      if (!request) throw { name: "notFound" };

      let option = {
            where: { id }
      };

      await Request.update({
        scale,
        price,
        status,
        userId
      },option);

      res.status(200).json({
        massage: `request success to update`,
      });
    } catch (error) {
      next(error);
    }
  }

static async requestStatusUpdate(req, res, next) {
  let transaction;
  try {
      if (isConnected) {
          const { id } = req.params;
          const { status } = req.body;

          let option = {
              include: [
                  {
                      model: User,
                      attributes: {
                          exclude: ["password"],
                      },
                  },
              ],
          };

          let request = await Request.findByPk(id, option);

          if (!request) throw { name: "notFound" };

          let numberWA = "08973730107";
          let currentTime = format(new Date(), "dd/MM/yyyy HH:mm:ss");
          let pesan = `Halo ${request.User.username},

Kami ingin memberitahu Anda bahwa pesanan Anda dengan id pesanan ${request.id} telah mengalami perubahan status menjadi ${status} pada ${currentTime}.

Terima kasih atas kepercayaan Anda kepada kami!

Salam hangat,
Tim laundry citra jaya`;

          numberWA = '62' + numberWA.substring(1) + "@s.whatsapp.net";
          const exists = await fileSock().onWhatsApp(numberWA);

          if (exists?.jid || (exists && exists[0]?.jid)) {
              transaction = await sequelize.transaction(); // Mulai transaksi basis data

              // Update status dan buat entri Track dalam transaksi
              await Request.update({
                  status,
              }, {
                  where: { id },
                  transaction,
              });

              await Track.create({
                  userId: request.User.id,
                  requestId: request.id,
                  status
              }, {
                  transaction,
              });

              // Kirim pesan dan tunggu responsenya
              await fileSock().sendMessage(exists.jid || exists[0].jid, { text: pesan });

              // Commit transaksi jika semua operasi berhasil
              await transaction.commit();

              res.status(200).json({
                  message: `request status successfully updated`,
              });
          } else {
              throw { name: "notListed" };
          }
      } else {
          throw { name: "notConnected" };
      }
  } catch (error) {
      if (transaction) await transaction.rollback(); 
      console.error("Error updating request status:", error);
      next(error);
  }
}


}

module.exports = RequestController;
