import { ENVType } from "./enums.utils";

class AppEnv {
    constructor(){}

    /**
     * @name isProduction
     * @description Determines if app is in production
     * @returns { boolean } - boolean
     */
    public isProduction(): boolean {
        let result: boolean = false;

        if (process.env.APP_ENV === ENVType.PRODUCTION) {
            result = true;
        }
        return result;
    }

     /**
     * @name isStaging
     * @description Determines if app is in staging
     * @returns { boolean } - boolean
     */
    public isStaging(): boolean {
        let result: boolean = false;

        if (process.env.APP_ENV === ENVType.STAGING) {
            result = true;
        }
        return result;
    }

     /**
     * @name isDev
     * @description Determines if app is in development
     * @returns { boolean } - boolean
     */
    public isDev(): boolean {
        let result: boolean = false;

        if (process.env.APP_ENV === ENVType.DEVELOPMENT) {
            result = true;
        }
        return result;
    }    
}


export default new AppEnv();