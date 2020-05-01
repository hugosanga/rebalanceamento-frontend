import React, { useState } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { FiLogIn } from 'react-icons/fi'

import logoImg from '../../assets/logo.png'

import { login } from '../../services/auth'
import './styles.css'

export default function Logon() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const history = useHistory()

    async function handleLogon(e) {
        e.preventDefault()

        const status = await login(email, password)

        if (status) {
            history.push('/stocks')
        }

    }

    return (
        <div className="logon-container">
            <div className="content">
                <div className="logo-box">
                    <img src={logoImg} alt="Wallet" className="logo"/>
                </div>

                <section className="form">
                    <form onSubmit={handleLogon}>
                        <h1>Faça seu logon</h1>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Senha"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />

                        <button className="button" type="submit">Entrar</button>

                        <Link to="/register" className="backlink">
                            <FiLogIn size={16} color="#E02041" />
                            Não tenho cadastro
                        </Link>
                    </form>
                </section>
            </div>
        </div>
    )
}
