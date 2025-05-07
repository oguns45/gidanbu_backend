import mongoose, { ConnectOptions } from "mongoose"
import { ENVType } from '../utils/enums.utils'
import colors from 'colors'


const options: ConnectOptions = {
    autoIndex: true,
    maxPoolSize: 1000,
    wtimeoutMS: 60000,
    connectTimeoutMS: 60000,
    socketTimeoutMS: 60000,
    serverSelectionTimeoutMS: 60000,
    family: 4,
}

const connectDB = async () => {
    console.log("am here")
    if (process.env.NODE_ENV === ENVType.DEVELOPMENT || process.env.NODE_ENV === ENVType.PRODUCTION) {
        try {
            const dbConn = await mongoose.connect(process.env.MONGODB_URI || '', options);
            console.log(colors.cyan.bold.underline(`Database connected: ${dbConn.connection.host}`));
            
        } catch (error) {
            console.log(colors.cyan.bold.underline(`could not connect to database: ${error}`));
            process.exit(1);
            
        }
    }
}

export default connectDB