import { hash } from 'better-auth/plugins/two-factor'

const password = 'Blevh4np1@@'
const hashed = await hash(password)
console.log('Hashed password:', hashed)
