import api from './api'

export const isAuthenticated = () => localStorage.getItem('user_id') !== null

export const login = async (email, password) => {
    try {
        const response = await api.post(`/login`, { email, password })

        if(response.data.error) {
            alert(response.data.error)

            return false

        }

        localStorage.setItem('user_id', response.data.id)
        localStorage.setItem('user_name', response.data.name)

        return true

    } catch(err) {
        alert('Erro ao logar, tente novamente.')

        return false
    }
}
