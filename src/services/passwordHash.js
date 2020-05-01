import crypto from 'crypto'

const genRandomString = (length) => {
    return crypto.randomBytes(Math.ceil(length/2))
                    .toString('HEX')
                    .slice(0, length)
}

const sha512 = (password, salt) => {
    const hash = crypto.createHash('sha512', salt)
    hash.update(password)

    const value = hash.digest('HEX')

    return value
}

const newPassword = (userPassword) => {
    const salt = genRandomString(16)
    const hasedPassword = sha512(userPassword, salt)

    return { hasedPassword, salt }
}

const saltHashPassword = (userPassword, salt) => {
    const hasedPassword = sha512(userPassword, salt)

    return { hasedPassword }
}

export default function passwordHash({ password: user_password, salt }) {
    if(salt) {
        const { hasedPassword } = saltHashPassword(user_password, salt)
        return { hasedPassword }
    } else {
        const { hasedPassword, salt } = newPassword(user_password)
        return { hasedPassword, salt }
    }

}
