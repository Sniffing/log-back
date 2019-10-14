export class Utils {
    public static capitaliseFirst(a: string) {
        return a.charAt(0).toUpperCase() + a.slice(1);
    }
    
    public static unixTimeToDate(time: number) {
        var date = new Date(time);        
        return `${('0' + date.getDate()).slice(-2)}-${('0' + date.getMonth()+1).slice(-2)}-${date.getFullYear()}`;
    }
}