import React from 'react'

import SideMenu from '../../components/SideMenu'
import Header from '../../components/Header'

import CompositionDashboard from './CompositionDashboard'

import './styles.css'

export default function Stocks() {

    return (
        <div className="page-container">

            <Header />

            <section>
                <SideMenu />
                <div className="composition-container">
                    <div className="composition-content">
                        <CompositionDashboard />
                    </div>
                </div>
            </section>
        </div>
    )
}
