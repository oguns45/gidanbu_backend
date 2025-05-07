import { Request } from 'express';
import { IUserDoc } from '../utils/interface.util'; // Adjust the import path as needed

interface AuthenticatedRequest extends Request {
  user?: IUserDoc;
}

export { AuthenticatedRequest };