import { parse, format } from 'date-fns';
import NPJob from "./NPJob";
import EntryService from "../service/EntryService";

export default class TimelineList {
  itemsByDate = {};

  constructor (data) {
    if (data) {
      for (let itemData of data['items']) {
        let itemObj, dateKey;
        if (itemData['jobId']) {
          itemObj = new NPJob(itemData);          
        } else {
          itemObj = EntryService.initEntryObj(itemData);
        }

        dateKey = format(itemObj.updateTime, 'YYYYMMDD');
        if (!this.itemsByDate[dateKey]) {
          this.itemsByDate[dateKey] = [];
        }

        this.itemsByDate[dateKey].push(itemObj)
      }

      for (let dateKey in this.itemsByDate) {
        this.itemsByDate[dateKey].sort(function (a, b) {
          return ((a.updateTime < b.updateTime) ? 1 : ((a.updateTime > b.updateTime) ? -1 : 0));
        });    
      }
    }
  }
}
