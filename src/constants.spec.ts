import { reverseDate, unixTimeToDate } from './constants';

describe('Test date to string', () => {
  test('converts date to correct string', () => {
    const date = new Date(2010, 9, 30);
    const dateString = unixTimeToDate(date.valueOf());
    const month = date.toLocaleString('default', { month: 'long' });

    expect(month).toEqual('October');
    expect(dateString).toEqual('30-10-2010');
  });

  test('converts unix time stamp to correct string', () => {
    const unixTime = 1288470633000;
    const dateString = unixTimeToDate(unixTime);
    expect(dateString).toEqual('30-10-2010');
  });

  test('converts single digit unit time stamp to correct string', () => {
    const unixTime = 1273028583000;
    const dateString = unixTimeToDate(unixTime);

    expect(dateString).toEqual('05-05-2010');
  });

  test('reverses date to correct string', () => {
    const unixTime = 1273028583000;
    const dateString = unixTimeToDate(unixTime);
    const reversed = reverseDate(dateString);

    expect(reversed).toEqual('2010-05-05');
  });

  test('reverses date to correct string', () => {
    const unixTime = 1288470633000;
    const dateString = unixTimeToDate(unixTime);
    const reversed = reverseDate(dateString);

    expect(reversed).toEqual('2010-10-30');
  });
});
