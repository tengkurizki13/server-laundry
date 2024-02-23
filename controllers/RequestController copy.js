const { Request,User,Track } = require("../models");
const { Op } = require('sequelize');
const { format } = require("date-fns");
const qrcode = require("qrcode-terminal")


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
        option.include[0].where = {
          username: {
            [Op.like]: `%${req.query.search}%`
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
      });

      let idRequest = Number(newRequest.id)
      let idPelanggan = Number(userId)

      await Track.create({
        userId : idPelanggan,
        requestId : idRequest,
        status: "proses"
      });


         let request = await Request.findByPk(idRequest);
      
         res.status(201).json(
           {
             message: "Request has been created successfully",
             data: request,
           },
         );
    } catch (error) {
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


  // static async requestStatusUpdate(req, res, next) {
  //   try {
  //     const sendStatusUpdate = async () => {
  //       console.log("Mengirim pesan...");
  //       const { id } = req.params;
  //       const { status } = req.body;
    
  //       let option = {
  //         include: [
  //           {
  //             model: User,
  //             attributes: {
  //               exclude: ["password"],
  //             },
  //           },
  //         ],
  //       };
    
  //       let request = await Request.findByPk(id, option);
    
  //       // Fungsi untuk mengirim pesan setelah koneksi teretabil
  //       let nomer = "628973730107@c.us"
  //       let pesan = status
    
  //       await client.sendMessage(nomer, pesan);
    
  //       console.log("Pesan terkirim.");
    
  //       if (!request) throw { name: "notFound" };
    
  //       let option2 = {
  //         where: { id }
  //       };
    
  //       await Request.update({
  //         status,
  //       }, option2);
    
  //       await Track.create({
  //         userId: request.User.id,
  //         requestId: request.id,
  //         status
  //       }, option);
    
  //       res.status(200).json({
  //         message: `request status success to update`,
  //         status: "reading",
  //       });
  //     };
    

  //     // client.kill();
  //     let qrScanned = false;

  //     console.log("masuk");

  //     client.on('qr', (qr) => {
  //         qrScanned = true;
  //         // qrcode.generate(qr, { small: true });
  //         res.status(200).json({
  //             status: "scanning",
  //             data: qr,
  //         });
  //     });

  //     client.on('ready', () => {
  //         if (!qrScanned) {
  //             console.log('QR code scanned but connection terminated before ready.');
  //             sendStatusUpdate()
  //           } else{
  //             console.log("ready");
  //           }
  //     });

  //     await client.initialize();

  //   // console.log(client);

  //   // if (client.pupPage === null || client.pupBrowser === null) {
  //   //   // console.log("klien belum ready");
  //   // //   client.on('qr', (qr) => {
  //   // //     // qrcode.generate(qr, { small: true });
  //   // //     res.status(200).json({
  //   // //         status: "scanning",
  //   // //         data: qr,
  //   // //     });
  //   // // });
  //   //     client.on('ready', sendStatusUpdate);
  //   //     await client.initialize();
  //   // }else {
  //   //   // Jika client sudah siap, langsung kirim pesan
  //   //   console.log("Klien sudah siap, langsung kirim pesan.");
  //   //   sendStatusUpdate();
  //   // }
   
  //   } catch (error) {
  //     console.log(error);
  //     next(error);
  //   }
  // }
  


//   static async getQRCODE(req, res, next) {
//     try {
//         let qrScanned = false;

//         console.log("masuk");

//         client.on('qr', (qr) => {
//             qrScanned = true;
//             // qrcode.generate(qr, { small: true });
//             res.status(200).json({
//                 status: "scanning",
//                 data: qr,
//             });
//         });

//         client.on('ready', () => {
//             if (!qrScanned) {
//                 console.log('QR code scanned but connection terminated before ready.');
//                 // Handle the case when connection terminated before 'ready' event
//                 // For example, you can send an appropriate response here.
//                 res.status(200).json({
//                   status: "reading",
//               });
//               } else{
//                 console.log("ready");
//               }
//         });

//         await client.initialize();
//     } catch (error) {
//         console.error(error,"ini erorr");
//         next(error);
//     }
// }

}

module.exports = RequestController;
