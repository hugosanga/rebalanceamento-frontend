import React, { useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { FiPower } from 'react-icons/fi'

import './styles.css'

export default function Header() {
    const user_name = localStorage.getItem('user_name')

    const history = useHistory()

    useEffect(() => {
        const user_id = localStorage.getItem('user_id')

        if(!user_id) {
            history.push('/')
        }

    }, [history])

    function handleLogout() {
        localStorage.clear()

        history.push('/')
    }

    return (
        <header>
            <span className="user-name">{ user_name }</span>

            <button type="button" onClick={handleLogout}>
                <FiPower size={18} color="#e02041" />
            </button>
        </header>
    )
}
