import { Request, Response, NextFunction } from 'express'
import ENV from '../utils/env.utils';
import ErrorResponse from '../utils/error.utils';
import logger from '../utils/logger.utils'

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {

    let message: string = '';
    let errors: Array<any> = [];
    let error = { ...err };

    //process errors array
    if (err.errors) {
        errors = Object.values(err.errors).map((item: any)=>{
            let result: any;
            if(item.properties){
                result = item.properties.message;
            } else{
                result = item;
            }
            return result;
        })
    }

    //log error to the console
    if (ENV.isDev() || ENV.isStaging()) {
        // console.log('ERR:', err);
        logger.log({data: err, label: 'ERR', })
        
    }

    //Mongoose bad ObjectID
    if (err.name === 'CastError') {
        message = 'Resource not found - id cannot be casted';
        error = new ErrorResponse(message, 500, errors);
    }

    //Mongoose duplicate key
    if (err.code === 11000) {
        message = 'Duplicate field value entered';
        error = new ErrorResponse(message, 500, errors);
    }

    //Mongoose validation error
    if (err.code === 'ValidationError') {
        message = 'An error occurred';
        error = new ErrorResponse(message, 500, errors);
    }

    //Mongoose reference error
    if (err.code === 'ReferenceError') {
        message = 'Something is not right - check reference';
        error = new ErrorResponse(message, 500, errors);
    }

    res.status(error.statusCode || 500).json({
        error: true,
        errors: error.errors ? error.errors : [],
        data: error.data ? error.data : {},
        message: error.message ? error.message : 'Server Error',
        status: error.statusCode ? error.statusCode : 500
    })

}

export default errorHandler;