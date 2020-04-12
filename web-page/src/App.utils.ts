export class Utils {
    public static unixTimeToDate(time: number) {
        var date = new Date(time);        
        return `${('0' + date.getDate()).slice(-2)}-${('0' + date.getMonth()+1).slice(-2)}-${date.getFullYear()}`;
    }
}