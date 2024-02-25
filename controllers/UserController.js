const { User } = require("../models");
const {isConnected,fileSock} = require("../wa_confic")
const { format } = require("date-fns");
const { Op } = require('sequelize');
const { sequelize } = require('../models'); 

class UserController {
  static async users(req, res, next) {
    try {

      let option = {
        order: [["id", "DESC"]],
        where: {
          role : 'customer',
          username: {
            [Op.iLike]: `%${req.query.search}%`
          }
        },
        attributes: {
            exclude: ["password"],
          },
      };

      let users = await User.findAll(option);


      res.status(200).json({
        message: "all users",
        data: users,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  static async userById(req, res, next) {
    try {
      const { id } = req.params;
      let option = {
        attributes: {
          exclude: ["password"],
        },
      };
      let user = await User.findByPk(id, option);

      if (!user) throw { name: "notFound" };

      res.status(200).json({
        message: "detail user",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  static async userAdd(req, res, next) {
    let transaction;
    try {
      if (isConnected) {
          const {
            username,
            phoneNumber,
          } = req.body;


          let numberWA = phoneNumber;
          let currentTime = format(new Date(), "dd/MM/yyyy HH:mm:ss");
          let pesan = `Halo ${username},

Kami telah membuat akun mu di laundry kami dengan nomer wa ${phoneNumber}, pada waktu ${currentTime}

Salam hangat,
Tim laundry citra jaya`;

          numberWA = '62' + numberWA.substring(1) + "@s.whatsapp.net";
          const exists = await fileSock().onWhatsApp(numberWA);

          if (exists?.jid || (exists && exists[0]?.jid)) {
              transaction = await sequelize.transaction(); // Mulai transaksi basis data


              let newUser =  await User.create({
                username,
                phoneNumber,
              }, {
                  transaction,
              });

              // Kirim pesan dan tunggu responsenya
              await fileSock().sendMessage(exists.jid || exists[0].jid, { text: pesan });

            
              // Commit transaksi jika semua operasi berhasil
              await transaction.commit();


              res.status(201).json(
                {
                  message: "User has been created successfully",
                },
              );

          } else {
              throw { name: "notListed" };
          }
      } else {
          throw { name: "notConnected" };
      }
  } catch (error) {
      if (transaction) await transaction.rollback(); 
      console.error("Error updating user status:", error);
      next(error);
  }
  }

  // static async userAdd(req, res, next) {
  //   try {
  //     const {
  //       username,
  //       phoneNumber,
  //     } = req.body;
      

  //     let newUser = await User.create({
  //       username,
  //       phoneNumber,
  //     });

  //     let option = {
  //       attributes: {
  //         exclude: ["password"],
  //       },
  //     };

  //     let user = await User.findByPk(newUser.id,option);
  
  //     res.status(201).json(
  //       {
  //         message: "User has been created successfully",
  //         data: user,
  //       },
  //     );
  //   } catch (error) {
  //     console.log(error);
  //     next(error);
  //   }
  // }

  static async userDelete(req, res, next) {
    try {
      const { id } = req.params;

      if (Number(id) === 1 || Number(id) === 2) throw { name: "forbidden" };

      let user = await User.findByPk(id);

      if (!user) throw { name: "notFound" };

      await user.destroy({ where: { id } });

      res.status(200).json(
        {
          massage: `user with id ${user.id} success to delete`,
        },
      );
    } catch (error) {
      next(error);
    }
  }

  static async userUpdate(req, res, next) {
    let transaction;
    try {
      if (isConnected) {
      const { id } = req.params;

      if (Number(id) === 1 || Number(id) === 2) throw { name: "forbidden" };

      const {
        username,
        phoneNumber,
      } = req.body;

      let user = await User.findByPk(id);

      if (!user) throw { name: "notFound" };

      let option = {
            where: { id }
      };


      let numberWA = phoneNumber;
      let currentTime = format(new Date(), "dd/MM/yyyy HH:mm:ss");
      let pesan = `Halo ${username},

Kami telah membuat akun mu di laundry kami dengan nomer wa ${phoneNumber}, pada waktu ${currentTime}

Salam hangat,
Tim laundry citra jaya`;

numberWA = '62' + numberWA.substring(1) + "@s.whatsapp.net";
const exists = await fileSock().onWhatsApp(numberWA);

if (exists?.jid || (exists && exists[0]?.jid)) {
    transaction = await sequelize.transaction();
  

      await user.update({
        username,
        phoneNumber,
      },option,{
        transaction,
    });


        // Kirim pesan dan tunggu responsenya
        await fileSock().sendMessage(exists.jid || exists[0].jid, { text: pesan });

        await transaction.commit();


        res.status(200).json({
          massage: `user success to update`,
        });

  
      } else {
        throw { name: "notListed" };
    }
  }else{
    throw { name: "notConnected" };
  }
      
    } catch (error) {
      next(error);
    }
  }


}

module.exports = UserController;
