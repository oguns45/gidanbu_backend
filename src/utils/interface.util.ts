import { Document, ObjectId, Schema, Types } from 'mongoose'

//models
export interface IRoleDoc extends Document{
     
    name: string,
    description: string,
    slug: string,
    users: Array<ObjectId | any>,
    
    //generics
    createdAt: string,
    updatedAt: string,
    // _id: ObjectId,
    _id: Schema.Types.ObjectId;
    id: ObjectId,
    //functions
    getAll(): Array<IRoleDoc>,
    findByName(name: string): IRoleDoc | null
}
////////////////////////////////////////
// export interface IUserDoc extends Document {

//     avatar: string,
//     username: string,
//     email: string,
//     password: string,
//     slug: string;

//     firstName: string,
//     lastName: string,
//     phoneNumber: string,
//     phoneCode: string,

//     roles: Array<ObjectId | any>

//     createdAt: string,
//     updateAt: string,
//     _id: ObjectId,
//     id: ObjectId,

//     getUsers(): Array<IUserDoc>
//     findById(id: any): IRoleDoc | null,
//     matchPassword(password: string): Promise<boolean>,
//     getAuthToken(): Promise<string>,

// }

//Generics
export interface IResult{
    error: boolean,
    message: string,
    code?: number,
    data: any
}

export interface IPaystackMetadata {
  userId: string;
  products: string; // JSON string containing an array of 
  totalAmount?: number; // Ensure this is always a number
}


export interface IUser {
  _id: string;
  email: string;
  name?: string;
}


export interface IUserDoc extends Document {
    _id: Types.ObjectId;
    name: string;
    email: string;
    password: string;
    cartItems: {
        quantity: number;
        product: Types.ObjectId;
    }[];

    avatarUrl?: string;
    avatarPublicId?: string;
    role: string;
    avatar?: string;
    username: string;
    slug?: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    phoneCode?: string;
    roles: (string | Types.ObjectId)[];
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    comparePassword(password: string): Promise<boolean>;
    generateTokens(userId: string): Promise<{ accessToken: string; refreshToken: string }>;
    //generateTokens(): { accessToken: string; refreshToken: string }; // Generate JWT tokens
    getAuthToken(): Promise<string>; // Generate an authentication token
    createdAt: Date;
    updatedAt: Date;
}


export interface IProduct extends Document {
  _id: ObjectId;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isFeatured: boolean; // Add this
  createdAt?: Date;
  updatedAt?: Date;
}


export interface IMailOptions {
    email: string;
    subject: string;
    message?: string;
  }


  
  export interface CustomBody {
    code: string;
    discountPercentage: number;
    expirationDate: string; // Ensure it's recognized as a string before conversion
  }
  
  import { Request } from 'express';

  export interface CustomRequest extends Request {
    user?: IUserDoc;
    body: CustomBody; // Define body specifically here
  }


  
  export interface CouponRequestBody {
    code: string;
    discountPercentage: number;
    expirationDate: string; // Ensure it's recognized as a string before conversion
  }
  
  // export interface IUser {
  //   _id: Types.ObjectId;
  //   cartItems?: Array<{ id: string; quantity: number }>;
  //   role?: string;
  // }
  
  // export interface CustomRequest extends Request {
  //   user?: IUser;
  // }


  
// export interface IProduct extends Document {
//   _id: string;
//   name: string;
//   description: string;
//   price: number;
//   image: string;
//   quantity: number;
//   category: string;
//   seller: string;      // Optional seller
//   oldPrice: number;    // Optional old price
//   discount: number;    // Optional discount percentage
//   whatsappLink?: string; // Add this line
//   isFeatured?: boolean; // Specify the property as optional if needed
//   createdAt?: Date;
//   updatedAt?: Date;
// }
// The server is busy. Please try again later.

// New chat
