import { Request, Response, NextFunction } from 'express'
import ErrorResponse from '../utils/error.utils';

//declare global namespace
declare global {
    namespace Express{
        interface Request{
            language?: any;
            channel?: any;
        }
    }
}

//create function
export const validateChannels = (req: Request, res: Response, next: NextFunction) => {

    //Checik if the env variable is declared
    if (!process.env.APP_CHANNELS) {
        return next(new ErrorResponse('Error', 500, ['there is an error please contact support']))
    }

    const channelStr: string = process.env.APP_CHANNELS;

    try {
        if (!req.headers.lg && !req.headers.ch) {
            return next(new ErrorResponse('Security violation!', 403, ['language not specified', 'device channel not specified']))
        }
        if (!req.headers.lg) {
            return next(new ErrorResponse('Security violation!', 403, ['language not specified']))
        }
        if (!req.headers.ch) {
            return next(new ErrorResponse('Security violation!', 403, ['device channel not specified']))
        }

        const ch: string = req.headers.ch.toString();
        const lg: string = req.headers.lg.toString();
        const channels = channelStr.split(',');
        
        if (lg.length > 2) {
            return next(new ErrorResponse('Security violation!', 403, ['language not specified']))
        }

        if (!channels.includes(ch)) {
            return next(new ErrorResponse('Security violation!', 403, ['device channel not specified']))
        }

        req.language = lg;
        req.channel = ch;

        next()

    } catch (err) {
        return next(new ErrorResponse('Security violation!', 403, ['language not specified', 'device channel not specified']))
    }
}

// export default validateChannels;