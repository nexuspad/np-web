import EventService from '../../src/core/service/EventService';
import NPEvent from '../../src/core/datamodel/NPEvent';

let mockEvent;

beforeAll(function () {
  mockEvent = new NPEvent();
  mockEvent.entryId = 'mCQXq';
});

describe('Calendar testing', function () {
  it('should parse event object with proper time', function (done) {
    EventService.get(mockEvent)
      .then(function (event) {
        console.log(event.timeInfo);
        console.log(event.startDateObj);
        console.log(event.endDateObj);
        mockEvent = event;
        done();
      })
      .catch(function (error) {
        console.log(error);
        done();
      });
  });

  xit('should create a new event', function (done) {
    mockEvent = new NPEvent();
    mockEvent.title = '#1 - this is a test event';
    mockEvent.localStartDate = '20180202';
    mockEvent.localStartTime = '1000';
    mockEvent.localEndDate = '20180202';
    mockEvent.localEndTime = '1100';

    EventService.save(mockEvent)
      .then(function (entry) {
        // console.log(entry);
        done();
      })
      .catch(function (error) {
        console.log(error);
        done();
      });
  });

  xit('should update event time', function (done) {
    mockEvent.localStartDate = '20180203';
    mockEvent.localStartTime = '1000';
    mockEvent.localEndDate = '20180203';
    mockEvent.localEndTime = '1300';

    EventService.save(mockEvent)
      .then(function (entry) {
        // console.log(entry);
        done();
      })
      .catch(function (error) {
        console.log(error);
        done();
      });
  });

  it('should update recurring event', function (done) {
    mockEvent.localStartDate = '20180203';
    mockEvent.localStartTime = '1000';
    mockEvent.localEndDate = '20180203';
    mockEvent.localEndTime = '1300';

    mockEvent.recurrence = {
      'pattern': 'DAILY',
      'interval': 1,
      'recurrenceTimes': 8,
      'repeatForever': false,
      'monthlyRepeatType': 'DAY_OF_MONTH'};

    EventService.save(mockEvent)
      .then(function (result) {   // The result can be an entry object or an entry list object
        console.log(result);
        done();
      })
      .catch(function (error) {
        console.log(error);
        done();
      });
  });
});
