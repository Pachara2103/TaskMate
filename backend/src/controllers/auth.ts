
import { Elysia, t } from "elysia"
import { jwt } from '@elysiajs/jwt';
import bcrypt from 'bcryptjs';
import db from '../controllers/db';

const authRoute = new Elysia()

    .use(jwt({ name: 'jwt', secret: 'my_secret' }))

    // .get('/protected', () => 'protected', {
    //     beforeHandle({ status, headers }) {
    //         if (!headers.authorizaton)
    //             return status(401)
    //     }
    // })

    .get('/me', async ({ cookie, jwt, set }) => {
        try {

            const token = cookie.token?.value;
            if (!token) {
                set.status = 401
                return { success: false, message: 'You can not access this root' };
            }

            const user = await jwt.verify(token);
            if (!user) {

                set.status = 400
                return { success: false, message: 'Invalid token' };
            }

            set.status = 200
            const result = await db`SELECT * FROM users WHERE userid = ${user.id}`;

            return { success: true, user: result };
        }
        catch (error) {
            set.status = 400
            return { success: false, error: error };
        }

    })

export default authRoute