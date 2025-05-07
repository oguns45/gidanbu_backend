import { seedRoles } from './role.seed'
import { seedUsers } from './user.seed'

const seedData = async () => {

        //seed all roles
    await seedRoles()

    //see all users
    await seedUsers();

}

export default seedData;