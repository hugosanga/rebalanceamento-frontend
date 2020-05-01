import React, { Fragment } from 'react'
import { FaExclamationCircle } from 'react-icons/fa'
import MediaQuery from 'react-responsive';

import EditableTable from './EditableTable'
import SideMenu from '../../components/SideMenu'
import Header from '../../components/Header'

import './styles.css'

export default function Stocks() {
    return (
        <Fragment>
            <div className="stock-container">

                <Header />

                <section>
                    <SideMenu />
                    <div className="table-container">
                        <div className="table">
                        
                            <MediaQuery minWidth={768}>
                                <EditableTable />
                            </MediaQuery>

                            <MediaQuery maxWidth={768}>
                                <div className="error-mobile">
                                    <div>
                                        <FaExclamationCircle size={50} color="#95a5bb" />
                                    </div>
                                    <h1>Ainda não é possível visualizar a tabela de rebalanceamento pelo celular!</h1>
                                </div>
                            </MediaQuery>

                        </div>
                    </div>
                </section>
            </div>
        </Fragment>
    )
}
