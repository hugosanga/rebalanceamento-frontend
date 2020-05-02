import React, { useState, useEffect } from 'react';
import MaterialTable from 'material-table';

import api from '../../services/api'

function EditableTable() {
    const user_id = localStorage.getItem('user_id')

    const [newInvestment, setNewInvestment] = useState('')

    const [state, setState] = useState({
            columns: [
                { title: 'Ação', field: 'ticker', editable: 'onAdd' },
                { title: 'Tipo', field: 'type', editable: 'never' },
                // { title: 'Categoria', field: 'sector', editable: 'never' },
                { title: 'Nota', field: 'grade', initialEditValue: 0 },
                { title: 'Quantidade', field: 'amount', initialEditValue: 0 },
                { title: 'Preço', field: 'price', editable: 'never', type: 'currency', currencySetting: { locale: 'pt-BR', currencyCode: 'BRL' }, cellStyle: { textAlign: 'left' } },
                { title: 'Total', field: 'total', editable: 'never', type: 'currency', currencySetting: { locale: 'pt-BR', currencyCode: 'BRL' }, cellStyle: { textAlign: 'left' } },
                { title: '% Atual', field: 'actualPercent', editable: 'never', customSort: function(a, b) { return parseFloat(a.actualPercent.replace(',', '.').slice(0, -1)) - parseFloat(b.actualPercent.replace(',', '.').slice(0, -1)) } },
                { title: '% Ideal', field: 'idealPercent', editable: 'never', customSort: function(a, b) { return parseFloat(a.idealPercent.replace(',', '.').slice(0, -1)) - parseFloat(b.idealPercent.replace(',', '.').slice(0, -1)) } },
                { title: 'Comprar', field: 'buyAmount', editable: 'never' },
                { title: 'Total a comprar', field: 'buyPrice', editable: 'never', type: 'currency', currencySetting: { locale: 'pt-BR', currencyCode: 'BRL' }, cellStyle: { textAlign: 'left' } }
            ],
            data: []
        })

    function handleNewInvestment(e) {
        e.preventDefault()

        let tempTotal = 0
        let tempTotalGrade = 0

        const data = state.data
        let investment = parseInt(newInvestment)

        for (let i in data) {
            data[i].total = parseFloat(data[i].price) * data[i].amount

            tempTotal += data[i].total
            tempTotalGrade += parseInt(data[i].grade)
        }

        if (isNaN(investment)) {
            alert('Valor de investimento deve ser um número.')
            return false
        }

        for(let i in data) {
            data[i].actualPercentAfterInvestment = data[i].total / (tempTotal + investment)
            data[i].missingPercent = (data[i].grade / tempTotalGrade) - data[i].actualPercentAfterInvestment
            data[i].missingValue = (data[i].grade / tempTotalGrade) * (tempTotal + investment) - data[i].total
        }

        data.sort((a, b) => (a.missingPercent > b.missingPercent) ? -1 : ((b.missingPercent > a.missingPercent) ? 1 : 0))

        for (let i in data) {
            const buyAmount = parseInt(data[i].missingValue / data[i].price)

            if (buyAmount > 0) {
                if (investment - (buyAmount * data[i].price) > 0) {
                    data[i].buyAmount = buyAmount
                    investment -= buyAmount * data[i].price
                } else {
                    data[i].buyAmount = parseInt(investment / data[i].price)
                    investment -= (data[i].buyAmount * data[i].price)
                }
            } else {
                data[i].buyAmount = 0
            }

            data[i].buyPrice = data[i].buyAmount * data[i].price
        }

        setState({ columns: state.columns, data })
    }

    function stocksDetails(data) {
        data[0].actualPercent = 'NaN'
        while (data[0].actualPercent.includes('NaN')) {
            let tempTotal = 0
            let tempTotalGrade = 0
            
            for (let i in data) {
                data[i].price = parseFloat(data[i].price)
                data[i].total = data[i].price * data[i].amount

                data[i].grade = parseInt(data[i].grade)

                tempTotal += data[i].total
                tempTotalGrade += data[i].grade
            }

            for(let i in data) {
                data[i].actualPercent = `${(data[i].total / tempTotal * 100).toFixed(2)} %`.replace('.', ',')
                data[i].idealPercent = `${(data[i].grade / tempTotalGrade * 100).toFixed(2)} %`.replace('.', ',')
            }
        }

        return data
    }

    async function getData() {
        let data = await api.get('/ticker', { headers: { Authorization: user_id }})
        .then(response => response.data)

        data = await stocksDetails(data)

        localStorage.setItem('stocks', JSON.stringify(data))
        localStorage.setItem('updated_at', Date.now())

        setState({ columns: state.columns, data })
    }

    useEffect(() => {

        if(!localStorage.getItem('stocks') || (Date.now() - localStorage.getItem('updated_at')) > 1000*60*5) {
            getData()
        } else {
            const data = JSON.parse(localStorage.getItem('stocks'))

            setState({ columns: state.columns, data: data })
        }

        const interval = setInterval(async () => {
            getData()

        }, 1000*60*5)

        return() => {
            clearInterval(interval)
        }

    }, [user_id, state.columns])

    async function handleNewData(newData) {
        newData.ticker = newData.ticker.toUpperCase()

        if(state.data) {
            for (let i in state.data) {
                if (newData.ticker === state.data[i].ticker) {
                    alert('Esta ação já está cadastrada.')
                    return false
                }
            }
        }

        const data = {
            ticker: newData.ticker,
            grade: await parseInt(newData.grade),
            amount: await parseInt(newData.amount)
        }

        if (isNaN(data.grade) || isNaN(data.amount)) {
            alert('Nota e quantidade devem ser número inteiros.')
            return false
        }

        try {
            const response = await api.post('/ticker', data, { headers: { Authorization: user_id }})

            if (response.data.error) {
                alert(response.data.error)
                return false
            }

            getData()
            //
            // newData.id = await response.data.id
            // newData.type = await response.data.type
            // newData.sector = await response.data.sector
            // newData.price = await response.data.price

            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve();
                    // setState((prevState) => {
                    //     let data = [...prevState.data];
                    //     // data.push(newData);
                    //     //
                    //     // data = stocksDetails(data)
                    //     // localStorage.setItem('stocks', JSON.stringify(data))
                    //     // localStorage.setItem('updated_at', Date.now())
                    //
                    //     return {
                    //         ...prevState,
                    //         data
                    //     }
                    // })
                }, 600)
            })

        } catch(err) {
            alert('Erro ao cadastrar nova ação.')
            return null
        }
    }

    async function handleUpdateData(newData, oldData) {

        const data = {
            amount: parseInt(newData.amount),
            grade: parseInt(newData.grade)
        }

        await api.put(`/ticker/${newData.id}`, data, { headers: { Authorization: user_id }})

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
                if (oldData) {
                    setState((prevState) => {
                        let data = [...prevState.data];
                        data[data.indexOf(oldData)] = newData;

                        data = stocksDetails(data)
                        localStorage.setItem('stocks', JSON.stringify(data))
                        localStorage.setItem('updated_at', Date.now())

                        return {
                            ...prevState,
                            data
                        }
                    })
                }
            }, 600)
        })
    }

    async function handleDeleteData(oldData) {

        await api.delete(`/ticker/${oldData.id}`, { headers: { Authorization: user_id }})

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
                setState((prevState) => {
                    let data = [...prevState.data];
                    data.splice(data.indexOf(oldData), 1);

                    data = stocksDetails(data)
                    localStorage.setItem('stocks', JSON.stringify(data))
                    localStorage.setItem('updated_at', Date.now())

                    return {
                        ...prevState,
                        data
                    }
                })
            }, 600)
        })
    }

    return (
        <div className="investment-content">
            <form className="investment-form" onSubmit={handleNewInvestment}>
                <div className="fixed-label">
                    <span>R$</span>
                    <input
                        type="numeric"
                        precision="0.01"
                        className="investment-input"
                        placeholder="Investir"
                        value={ newInvestment }
                        onChange={e => {
                            setNewInvestment(e.target.value)
                        }}
                    />
                </div>
                <button type="submit" className="button">Calcular</button>
            </form>
            <MaterialTable
                title=''
                localization={{
                    header: {
                        actions: ''
                    },
                    body: {
                        emptyDataSourceMessage: 'Não há dados para mostrar.',
                        editRow: {
                            deleteText: 'Deseja realmente apagar esta ação?',
                            cancelTooltip: 'Cancelar',
                            saveTooltip: 'Salvar'
                        },
                        deleteTooltip: 'Deletar',
                        editTooltip: 'Editar',
                        addTooltip: 'Adicionar'
                    },
                    pagination: {
                        labelRowsSelect: 'ações'
                    }
                }}
                options={{
                    addRowPosition: 'first'
                }}
                columns={ state.columns }
                data={ state.data }
                editable = {{
                    onRowAdd: handleNewData,
                    onRowUpdate: handleUpdateData,
                    onRowDelete: handleDeleteData
                }}
                icons={{
                    Add: props => {
                        return (
                            <button type="submit" className="button add-button">Adicionar</button>
                        )
                    }
                }}
            />
        </div>
    )
}

export default EditableTable
