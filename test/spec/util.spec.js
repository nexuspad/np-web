import CommonUtils from '../../src/core/util/CommonUtils';
import StorageUtils from '../../src/core/util/StorageUtils';

describe('CommonUtils', function () {
  it('should parse the strings', function () {
    let result = CommonUtils.sprintf('/a/b/%s/%s', 'c', 'd');
    expect(result).toEqual('/a/b/c/d');
  });

  it('should convert timestamp', function () {
    let ymd = CommonUtils.timestampToNPDateStr(1515695154000);
    expect(ymd).toEqual(CommonUtils.timestampToNPDateStr(1515695154));
  });
});

describe('Storage tests', function () {
  /**
   * Disabled since window object is not available in unit testing.
   */
  it('should handle get/add/remove', function (done) {
    StorageUtils.saveToSession('test', 'test123');
    let value = StorageUtils.get('test');
    expect(value).toEqual('test123');
  });
});
