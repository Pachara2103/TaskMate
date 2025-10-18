
import { Elysia, t } from 'elysia';
import bcrypt from 'bcryptjs';
import { jwt } from '@elysiajs/jwt';
import db from './db';

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables!");
}
const JWT_SECRET = process.env.JWT_SECRET!;
const loginRoute = new Elysia()

    .use(jwt({ name: 'jwt', secret: JWT_SECRET }))

    .post('/login', async ({ body, jwt, cookie: { token }, set }) => {

        try {
            const { email, password } = body;
            const result = await db`SELECT * FROM users WHERE email = ${email}`;

            if (result.length === 0) {
                set.status = 404;
                return { success: false, message: 'User not found' };
            }

            const user = result[0];
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                set.status = 400
                return { success: false, message: 'Invalid password' };
            }

            const decoded = await jwt.sign({ id: user.userid });

            token.set({
                value: decoded,
                httpOnly: true,// ถ้า attacker inject JS เข้ามาในหน้าเว็บ → จะอ่าน document.cookie ไม่ได้
                sameSite: 'strict',
                secure: false
            });
            // secure: false
            // หมายความว่า cookie จะถูกส่งทั้ง HTTP และ HTTPS
            // ใช้ได้ง่ายใน local development (localhost ใช้ HTTP)
            // แต่ถ้า production → ถ้าไม่มี HTTPS → cookie อาจถูกดักข้อมูลได้

            set.status = 200
            return { success: true, message: 'Login successful' };

        } catch (err) {

            set.status = 400
            return { success: false, message: err }
        }

    }, {
        body: t.Object({
            email: t.String(),
            password: t.String()
        })
    })

    .post('/signup', async ({ body, set }) => {

        const { email, password, username } = body;

        try {

            const user = await db`SELECT * FROM users WHERE email = ${email}`;

            if (user.length === 0) {

                const newpass = await bcrypt.hash(password, 10);
                const inserted = await db`
                insert into users (username, password, email) 
                values(${username},${newpass}, ${email}) 
                returning *`;

                const newuserid = inserted[0].userid;
                set.status = 200;
                return { success: true, message: 'signup success please login', userid: newuserid };

            } else {
                set.status = 400;
                return { success: false, message: 'This email already exists' };
            }

        } catch (error) {
            set.status = 400;
            return { success: false, message: error };
        }


    }, {
        body: t.Object({
            email: t.String(),
            password: t.String(),
            username: t.String()
        })
    })


export default loginRoute;
