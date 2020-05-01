import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { FaBalanceScaleRight } from 'react-icons/fa'
import { FaChartPie } from 'react-icons/fa'
import { FiMenu } from 'react-icons/fi'
import MediaQuery from 'react-responsive';

import './styles.css'

export default function SideMenu() {
    const [showMenu, setShowMenu] = useState(false)

    function handleMenuAppear(e) {
        e.preventDefault()

        setShowMenu(!showMenu)
    }

    return (
        <div>

            <MediaQuery maxWidth={768}>
                <button type="button" className="menu-button" onClick={handleMenuAppear}>
                    <FiMenu size={18} color="#95a5bb" />
                </button>

                <div className="side-menu-container" style={{ display: showMenu ? 'block' : 'none' }}>
                    <ul>
                        <li>
                            <p>Carteira</p>
                        </li>
                        <li>
                            <NavLink to="/stocks" className="menu-item" activeClassName="active">
                                <FaBalanceScaleRight size={15} />
                                <span>Rebalanceamento</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/composition" className="menu-item" activeClassName="active">
                                <FaChartPie size={15} />
                                <span>Composição</span>
                            </NavLink>
                        </li>
                    </ul>
                </div>
            </MediaQuery>

            <div className="side-menu-container">
                <ul>
                    <li>
                        <p>Carteira</p>
                    </li>
                    <li>
                        <NavLink to="/stocks" className="menu-item" activeClassName="active">
                            <FaBalanceScaleRight size={15} />
                            <span>Rebalanceamento</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/composition" className="menu-item" activeClassName="active">
                            <FaChartPie size={15} />
                            <span>Composição</span>
                        </NavLink>
                    </li>
                </ul>
            </div>
        </div>
    )
}
