import express from "express";

import multer from "multer";
import * as XLSX from "xlsx";

/* load 'fs' for readFile and writeFile support */
import * as fs from "fs";
XLSX.set_fs(fs);

/* load 'stream' for stream support */
import { Readable } from "stream";
XLSX.stream.set_readable(Readable);

/* load the codepage support library for extended support with older formats  */
import * as cpexcel from "xlsx/dist/cpexcel.full.mjs";
import { DailyMenu, GroupedMenu, Result } from "../types/result";
import Menu from "../models/menuModel";
XLSX.set_cptable(cpexcel);

var upload = multer({ dest: "uploads/" });

const uploadRouter = express.Router();

function isDayOfWeek(str) {
  const daysOfWeek = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  return daysOfWeek.includes(str.trim().toLowerCase());
}

function isDate(str) {
  const dateRegex = /^\d{2}\.\d{2}\.\d{4}$/;
  return dateRegex.test(str);
}

function getDayOfMonth(str) {
  const dateRegex = /^\d{2}\.\d{2}\.\d{4}$/;
  if (dateRegex.test(str)) {
    const date = str.split(".");
    return parseInt(date[0]);
  }
  return -1;
}

function changeDateFormat(str) {
  // Convert dd.mm.yyyy to yyyy-mm-dd
  const dateRegex = /^\d{2}\.\d{2}\.\d{4}$/;
  if (dateRegex.test(str)) {
    const date = str.split(".");
    return `${date[2]}-${date[1]}-${date[0]}`;
  }
  return "";
}

function performConversion(nonVegData, hostel, mess) {
  let groupedNonVegMenu: GroupedMenu = new Map();

  let i = 0;

  // Increment i until we find the first day of week
  for (; i < nonVegData.length; i++) {
    let key = Object.keys(nonVegData[i])[0];
    if (isDayOfWeek(nonVegData[i][key])) {
      break;
    }
  }

  for (; i < nonVegData.length; i++) {
    let key = Object.keys(nonVegData[i])[0];
    if (isDayOfWeek(nonVegData[i][key])) {
      let dates = [];
      let menu = [
        { type: 1, menu: nonVegData[i]["__EMPTY"] || "" },
        { type: 2, menu: nonVegData[i]["__EMPTY_1"] || "" },
        { type: 3, menu: nonVegData[i]["__EMPTY_2"] || "" },
        { type: 4, menu: nonVegData[i]["__EMPTY_3"] || "" },
      ];
      let j = i + 1;
      while (
        j < nonVegData.length &&
        (isDate(nonVegData[j][key]) || nonVegData[j][key] == undefined)
      ) {
        if (nonVegData[j][key]) {
          dates.push(nonVegData[j][key]);
        }
        menu[0].menu += " " + (nonVegData[j]["__EMPTY"] || "");
        menu[1].menu += " " + (nonVegData[j]["__EMPTY_1"] || "");
        menu[2].menu += " " + (nonVegData[j]["__EMPTY_2"] || "");
        menu[3].menu += " " + (nonVegData[j]["__EMPTY_3"] || "");
        j++;
      }
      groupedNonVegMenu.set(dates, menu);
      i = j - 1;
    }
  }

  const dailyNonVegMenu: DailyMenu = [];

  groupedNonVegMenu.forEach((value, key) => {
    for (let i = 0; i < key.length; i++) {
      dailyNonVegMenu[getDayOfMonth(key[i]) - 1] = {
        date: changeDateFormat(key[i]),
        menu: value,
      };
    }
  });

  const nonVegResult: Result = {
    hostel: hostel,
    mess: mess,
    menu: dailyNonVegMenu,
  };

  return nonVegResult;
}

uploadRouter.post("/", upload.single("file"), async (req, res) => {
  try {
    if (req.file?.filename == null) {
      res.status(400).json("No File uploaded");
    } else if (!("hostel" in req.body)) {
      res.status(400).json("Hostel not specified");
    } else {
      const workbook = XLSX.readFile(req.file?.path);
      const sheet_name_list = workbook.SheetNames;

      let nonVegSheetName, vegSheetName, specialSheetName;

      sheet_name_list.forEach((sheetName) => {
        if (sheetName.trim().toLowerCase()[0] == "n") {
          nonVegSheetName = sheetName;
        } else if (sheetName.trim().toLowerCase()[0] == "v") {
          vegSheetName = sheetName;
        } else if (sheetName.trim().toLowerCase()[0] == "s") {
          specialSheetName = sheetName;
        }
      });

      // Get hostel from request body
      const hostel = req.body.hostel;

      const nonVegWorksheet = workbook.Sheets[nonVegSheetName],
        vegWorksheet = workbook.Sheets[vegSheetName],
        specialWorksheet = workbook.Sheets[specialSheetName];

      const nonVegData = XLSX.utils.sheet_to_json(nonVegWorksheet);
      const vegData = XLSX.utils.sheet_to_json(vegWorksheet);
      const specialData = XLSX.utils.sheet_to_json(specialWorksheet);

      const nonVegResult = performConversion(nonVegData, hostel, 1);
      const vegResult = performConversion(vegData, hostel, 2);
      const specialResult = performConversion(specialData, hostel, 3);

      const month = nonVegResult.menu[0].date.split("-")[1];
      const year = nonVegResult.menu[0].date.split("-")[0];

      // Save to db
      const menu = new Menu({
        hostel: 2,
        month: month,
        year: year,
        menus: {
          nonVegMenu: nonVegResult,
          vegMenu: vegResult,
          specialMenu: specialResult,
        },
      });

      let savedMenu;
      try {
        savedMenu = await menu.save();
      } catch (err) {
        return res.status(500).json({ message: "Failed to save menu", err });
      }

      return res.status(200).json(savedMenu);
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error });
  }
});

export default uploadRouter;
