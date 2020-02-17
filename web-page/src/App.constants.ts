
enum Pages {
    WEIGHT = 'weight',
    KEYWORDS = 'keywords',
    CALENDAR = 'calendar',
    MEMORY = 'memory',
}

export interface IGenericObject<T> {
    [key: string]: T;
}

class Constants {

    public static pages = [
        Pages.WEIGHT,
        Pages.KEYWORDS,
        Pages.CALENDAR,
        Pages.MEMORY,
    ]
}

export default Constants