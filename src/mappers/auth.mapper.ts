import { MappedRegisteredUserDTO } from "../dtos/auth.dto";
import { IUserDoc } from "../utils/interface.util"; // Adjust the import path as needed

class AuthMapper {
    constructor() {}

    /**
     * @name mapRegisteredUser
     * @param user 
     * @returns result
     */
    public async mapRegisteredUser(user: IUserDoc): Promise<MappedRegisteredUserDTO> {
        const result: MappedRegisteredUserDTO = {
            _id: user._id,
            id: user._id.toString(),
            username: user.username || '',
            email: user.email,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            roles: user.roles || [],
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };

        return result;
    }
}

export default new AuthMapper();