

import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';
import { IUserDoc } from './interface.util';


export interface IProduct extends Document {
  _id: ObjectId;
  name: string;
  description: string;
  price: number;
  image: string;
  quantity?: number;
  category: string;
  isFeatured: boolean; // Add this
  createdAt?: Date;
  updatedAt?: Date;
}

 
export interface CustomBody {
    products: IProduct[];
    couponCode?: string;
    totalAmount: number;
  }

  import { Request } from 'express';

export interface CustomRequest extends Request {
    user?: IUserDoc;
    body: CustomBody; // Define body specifically here
  }

