


import { RegisterDTO, LoginDTO } from "../dtos/auth.dto";
import { IResult } from "../utils/interface.util";
import UserService from "./user.service";

class AuthService {
  constructor() {}

  /**
   * @name validateRegister
   * @param data 
   * @returns { IResult } - see IResult
   */
  // public async validateRegister(data: RegisterDTO): Promise<IResult> {
  //   let result: IResult = { error: false, message: "", code: 200, data: {} };

  //   const { email, password } = data;

  //   if (!email) {
  //     result.error = true;
  //     result.message = "Email is required";
  //     result.code = 400;
  //   } else if (!password) {
  //     result.error = true;
  //     result.message = "Password is required";
  //     result.code = 400;
  //   } else if (!UserService.checkEmail(email)) {
  //     result.error = true;
  //     result.message = "Invalid email supplied";
  //     result.code = 400;
  //   } else if (!UserService.checkPassword(password)) {
  //     result.error = true;
  //     result.message =
  //       "Password length must be greater or equal to 8 and must contain 1 uppercase letter, 1 lowercase letter, 1 special character, and 1 number";
  //     result.code = 400;
  //   } else {
  //     result.error = false;
  //     result.message = "";
  //     result.code = 200;
  //   }

  //   return result;
  // }

  public async validateRegister(data: RegisterDTO): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };
  
    const { email, password, firstName, lastName } = data;
  
    if (!email) {
      result.error = true;
      result.message = "Email is required";
      result.code = 400;
    } else if (!password) {
      result.error = true;
      result.message = "Password is required";
      result.code = 400;
    } else if (!firstName) {
      result.error = true;
      result.message = "First name is required";
      result.code = 400;
    } else if (!lastName) {
      result.error = true;
      result.message = "Last name is required";
      result.code = 400;
    } else if (!UserService.checkEmail(email)) {
      result.error = true;
      result.message = "Invalid email supplied";
      result.code = 400;
    } else if (!UserService.checkPassword(password)) {
      result.error = true;
      result.message =
        "Password length must be greater or equal to 8 and must contain 1 uppercase letter, 1 lowercase letter, 1 special character, and 1 number";
      result.code = 400;
    } else {
      result.error = false;
      result.message = "";
      result.code = 200;
    }
  
    return result;
  }

  /**
   * @name validateLogin
   * @param data 
   * @returns { IResult } - see IResult
   */
  public async validateLogin(data: LoginDTO): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const { email, password } = data;

    if (!email) {
      result.error = true;
      result.message = "Email is required";
      result.code = 400;
    } else if (!password) {
      result.error = true;
      result.message = "Password is required";
      result.code = 400;
    } else if (!UserService.checkEmail(email)) {
      result.error = true;
      result.message = "Invalid email supplied";
      result.code = 400;
    } else {
      result.error = false;
      result.message = "";
      result.code = 200;
    }

    return result;
  }
}

export default new AuthService();
