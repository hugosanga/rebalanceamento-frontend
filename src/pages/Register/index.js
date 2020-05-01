import React, { useState, Fragment } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import MediaQuery from 'react-responsive';

import './styles.css'
import api from '../../services/api'
import passwordHash from '../../services/passwordHash'

export default function Register() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [passwordConfirm, setPasswordConfirm] = useState('')
    const [passwordValidation, setPasswordValidation] = useState('')

    const history = useHistory()

    const passwordAlert = {
        length: 'A senha deve ter no mínimo 8 caracteres.',
        match: 'As senhas digitadas devem ser iguais'
    }

    function PasswordMatchFail(props) {
        const problem = props.status
        if(problem) {
            return <p>* {passwordAlert[problem]}</p>
        } else {
            return false
        }
    }

    async function handleRegister(e) {
        e.preventDefault()

        if (password.length < 8) {
            setPasswordValidation('length')
            return false
        } else {
            if (password !== passwordConfirm) {
                setPasswordValidation('match')
                return false
            } else {
                setPasswordValidation('')
            }
        }

        const { hasedPassword, salt } = passwordHash({ password })

        const data = {
            name,
            email,
            password: hasedPassword,
            salt
        }

        try {
            const check = await api.get(`/profile/${email}`)

            if(check.data.id) {
                alert(`Este email já está cadastrado.`)
                return false
            }

            const response = await api.post('/users', data)

            alert(`${response.data.name} seu cadastro foi realizado com sucesso.`)

            history.push('/')
        } catch(err) {
            alert('Erro ao registrar, tente novamente.')
            console.log(err)
        }
    }

    return (
        <Fragment>
            <div className="register-container">
                <div className="content">
                    <section>

                        <h1>Cadastro</h1>
                        <p>Faça seu cadastro para manter sua vida financeira organizada.</p>

                        <MediaQuery minWidth={768}>
                            <Link to="/" className="backlink">
                                <FiArrowLeft size={16} color="#E02041" />
                                Voltar para o logon
                            </Link>
                        </MediaQuery>

                        <MediaQuery maxWidth={768}>
                            <Link to="/" className="backlink">
                                <FiArrowLeft size={30} color="#E02041" />
                            </Link>
                        </MediaQuery>
                    </section>

                    <form onSubmit={handleRegister}>
                        <input
                            type="text"
                            placeholder="Nome"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <input
                            type="password"
                            placeholder="Senha"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Confirmar senha"
                            value={passwordConfirm}
                            onChange={(e) => setPasswordConfirm(e.target.value)}
                            required
                        />

                        <PasswordMatchFail status={passwordValidation} />

                        <button className="button" type="submit">Cadastrar</button>
                    </form>
                </div>
            </div>
        </Fragment>
    )
}
