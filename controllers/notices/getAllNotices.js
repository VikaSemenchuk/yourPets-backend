const { Notice } = require("../../models/notices");
const { checkResult } = require("../../helpers");
const { now } = require("mongoose");

const getAllNotices = async (req, res, next) => {
  try {
    const { title, category, sex, date } = req.query;
    let {page = 1, limit = 8} = req.query

    page = +page
    limit = +limit
    const skip = (page - 1) * limit;

    const pipeline = [];
    const $match = {};

    let startDate;
    let endDate;
    let startDate2;
    let endDate2;
    const millisecondsInYear = 1000 * 60 * 60 * 24 * 365.25;

    if (category) {
      $match["category"] = category;
    }

    if (title) {
      const searchRegex = new RegExp([...title].join(".*"), "i");
      $match["$or"] = [
        { title: { $regex: searchRegex } },
        { type: { $regex: searchRegex } },
      ];
    }

    if (sex) {
      $match["sex"] = sex;
    }

    if (date) {
      // const ageFilter = 1; // Значення, яке приходить з фронтенда (1, 2, 3 або 4)

      // let startDate, endDate;

      // Визначення відповідних дат для фільтрації
      if (date === "1") {
        // Фільтруємо тварин, які молодші за 1 рік (менше одного року)
        endDate = new Date();
        startDate = new Date();
        startDate.setFullYear(endDate.getFullYear() - 1);
      } else if (date === "2") {
        // Фільтруємо тварин, які молодші за 2 роки (менше одного року)
        endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() - 1);

        startDate = new Date();
        startDate.setFullYear(endDate.getFullYear() - 2);
      } else if (date === "3") {
        // Фільтруємо тварин, які старші за 2 роки (більше 2 років)
        endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() - 2);
      } else if (date === "4") {
        // Фільтруємо тварин, які молодші за 1 рік і старші за 2 роки
        endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() - 2);
        startDate = new Date();
        startDate.setFullYear(endDate.getFullYear() - 1);
      }

      // Підготовка фільтру для $match
      // const filter = {
      //   date: {},
      // };

      // if (startDate) {
      //   filter.date.$gte = startDate;
      // }

      // if (endDate) {
      //   filter.date.$lt = endDate;
      // }

      // const pipeline = [
      //   {
      // $match["date"] = filter;

      $match["date"] = {
               $gte: startDate,
              $lte: endDate,
            };

      // Виконуємо агрегаційний запит MongoDB з використанням пайплайну
      // db.collection.aggregate(pipeline);

      // switch (date) {
      //   case "1":
      //     // const rightDate = date.split("-").reverse().join("-");

      //     diff = new Date() - millisecondsInYear;
      //     startDate = new Date(diff);
      //     console.log("startDate :>> ", startDate);
      //     endDate = new Date();
      //     console.log("endDate :>> ", endDate);
      //     // return {startDate, endDate}

      //     $match["date"] = {
      //       $gte: startDate,
      //       $lte: endDate,
      //     };
      //     break;
      //   case "2":
      //     diff = new Date() - millisecondsInYear;

      //     // diff2years = new Date() - millisecondsInYear * 2;
      //     // startDate = new Date(diff2years);
      //     // console.log("startDate2 :>> ", startDate);

      //     // diff = startDate + millisecondsInYear
      //     endDate = new Date(diff);

      //     console.log("endDate2 :>> ", endDate);

      //     $match["date"] = {
      //       // $gt: startDate,
      //       $lt: endDate,
      //     };
      //     break;
      //   case "3":
      //     diff = new Date().getTime() - millisecondsInYear * 2;

      //     endDate = new Date(diff);

      //     console.log('new Date().getTime() :>> ', new Date().getTime());

      //     console.log("endDate3 :>> ", endDate);

      //     $match["date"] = {
      //       // $gt: startDate,
      //       $lt: endDate,
      //     };
      //     break;
      //   case "4":

      //     diffTo1Year = new Date().getTime() - millisecondsInYear;
      //     console.log('diffTo1Year :>> ', diffTo1Year);
      //     startDate = new Date(diffTo1Year);
      //     console.log("startDate :>> ", startDate);
      //     endDate = new Date();
      //     console.log("endDate :>> ", endDate);
      //     // return {startDate, endDate}

      //     diffUp2Years = new Date() - millisecondsInYear * 2;

      //     // console.log('diffUp2Years :>> ', diffUp2Years);
      //     endDate2 = new Date(diffUp2Years);
      //     console.log('endDate2 :>> ', endDate2);

      //     $match: {

      //         $or: [
      //           {
      //             date: {
      //               $gt: startDate,
      //               $lt: endDate
      //             }
      //           },
      //           {
      //             date: {
      //               // $gte: startDate2,
      //               $gt: endDate2
      //             }
      //           }
      //         ]

      //     }

      //     // $match["$or"] = [
      //     //   {
      //     //     date: {
      //     //       $gte: startDate,
      //     //       $lte: endDate,
      //     //     },
      //     //     date: {
      //     //       $lt: endDate2,
      //     //     },
      //     //   },
      //     // ];

      //     break;

      //   default:
      //     endDate = new Date();
      //     console.log("endDate5 :>> ", endDate);
      // }
      // return {startDate, endDate}
    }

    const total = await Notice.countDocuments($match);
  if (!total) return { total, noticesList: [] };


    // pipeline.push({ $match });

    pipeline.push(
      {$match},
      { $skip: skip },
      { $limit: limit },
      { $sort: { createdAt: -1 } }
    );

    const noticesList = await Notice.aggregate(pipeline);

    // let { page = 1, limit = 8 } = req.query;
    // page = +page;
    // limit = +limit;
    // const skip = (page - 1) * limit;

    // const total = await Notice.countDocuments({});
    // const noticesList = await Notice.find({}, "-createdAT -updatedAT", {
    //   limit,
    //   skip,
    // }).sort({ createdAt: -1 });

    // checkResult(noticesList)
    // checkResult(total)

    return res.status(200).json({ noticesList, total });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllNotices,
};
