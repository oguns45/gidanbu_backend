// import { ObjectId } from "mongoose"

// export interface RegisterDTO{
//   email: string,
//   password: string
// }

// export interface MappedRegisteredUserDTO{
//   _id: ObjectId,
//   id: ObjectId,
//   username: string,
//   email: string,
//   firstName: string,
//   lastName: string,
//   roles: Array<ObjectId | any>,
//   createdAt: string,
//   updatedAt: string
// }

import { Types } from 'mongoose';
import { ObjectId } from "mongoose";

/**
 * Data Transfer Object for User Registration
 */
export interface RegisterDTO {
  email: string; // The user's email address
  password: string; // The user's password
  username: string;
  firstName: string;
  lastName: string;
  // roles: Array<ObjectId | any>, 
  

}

/**
 * Data Transfer Object for User Login
 */
export interface LoginDTO {
  email: string; // The user's email address
  password: string; // The user's password
}

/**
 * Data Transfer Object for Mapping a Registered User
 */
export interface MappedRegisteredUserDTO {
  _id: Types.ObjectId; // The unique identifier for the user in MongoDB
  id: string; // Another reference to the user ID
  username: string; // The username of the user
  email: string; // The user's email address
  firstName: string; // The user's first name
  lastName: string; // The user's last name
  roles: (string | Types.ObjectId)[];// Array of role IDs or role names associated with the user
  createdAt: Date; // Timestamp of when the user was created
  updatedAt: Date; // Timestamp of when the user was last updated
}



/**
 * Data Transfer Object for Forgot Password Request
 */
export interface ForgotPasswordDTO {
  email: string;
}

/**
 * Data Transfer Object for Reset Password
 */
export interface ResetPasswordDTO {
  token: string;
  newPassword: string;
}



/**
 * Data Transfer Object for User Authentication Response
 */
export interface AuthResponseDTO {
  user: MappedRegisteredUserDTO;
  accessToken: string;
  refreshToken?: string;
}

/**
 * Data Transfer Object for User Role Management
 */
export interface AssignRoleDTO {
  userId: ObjectId;
  roleId: ObjectId | string;
}

/**
 * Data Transfer Object for Refreshing Access Token
 */
export interface RefreshTokenDTO {
  refreshToken: string;
}