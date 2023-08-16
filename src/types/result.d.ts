export type GroupedMenu = Map<
  Array<String>,
  Array<{ type: Number; menu: String }>
>;
export type DailyMenu = Array<{
  date: String;
  menu: Array<{
    type: Number;
    menu: String;
  }>;
}>;

export type Result = {
  hostel: Number;
  mess: Number;
  menu: DailyMenu;
};
