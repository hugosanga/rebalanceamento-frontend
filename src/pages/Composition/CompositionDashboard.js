import React, { useState, useEffect, Fragment } from 'react';
import { useHistory } from 'react-router-dom'
import { Pie, HorizontalBar } from 'react-chartjs-2';
import MediaQuery from 'react-responsive';

import api from '../../services/api'
import { backgroundBarColor, backgroundPieColor } from '../../services/chartsColor'

export default function CompositionDashboard() {
    const user_id = localStorage.getItem('user_id')

    const history = useHistory()

    const [total, setTotal] = useState(0)
    const [totalStocks, setTotalStocks] = useState(0)
    const [totalETF, setTotalETF] = useState(0)
    const [totalFII, setTotalFII] = useState(0)

    const [sectorPercents, setSectorPercents] = useState([])
    const [sectorLabels, setSectorLabels] = useState([])

    const [stocksPercents, setStocksPercents] = useState([])
    const [stocksLabels, setStocksLabels] = useState([])

    const [FIISubSectorLabels, setFIISubSectorLabels] = useState([])
    const [FIISubSectorPercents, setFIISubSectorPercents] = useState([])

    const [ETFSubSectorLabels, setETFSubSectorLabels] = useState([])
    const [ETFSubSectorPercents, setETFSubSectorPercents] = useState([])

    async function stocksDetails(data) {

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

        return data
    }

    function calculatePercentDiscrepance(data) {
        const missingPercent = {}

        for (let i in data) {
            missingPercent[data[i].ticker] = parseFloat(data[i].actualPercent.replace(',', '.').slice(0, -1)) - parseFloat(data[i].idealPercent.replace(',', '.').slice(0, -1))
        }

        setStocksLabels(
            Object.keys(missingPercent)
            .sort(function(a, b) {
                return missingPercent[a] > missingPercent[b] ?
                    -1 :
                    ( missingPercent[a] < missingPercent[b] ? 1 : 0)
            })
        )
        setStocksPercents(
            Object.values(missingPercent)
            .sort(function(a, b) {
                return a > b ? -1 : ( a < b ? 1 : 0)
            })
        )
    }

    function calculatePercentPerSector(data) {
        const percentPerSector = {}

        for (let i in data) {
            if(!percentPerSector[data[i].sector]) {
                percentPerSector[data[i].sector] = parseFloat(data[i].actualPercent.replace(',', '.').slice(0, -1))
            } else {
                percentPerSector[data[i].sector] += parseFloat(data[i].actualPercent.replace(',', '.').slice(0, -1))
            }
        }

        setSectorLabels(
            Object.keys(percentPerSector)
            .sort(function(a, b) {
                return percentPerSector[a] > percentPerSector[b] ?
                    -1 :
                    ( percentPerSector[a] < percentPerSector[b] ? 1 : 0)
            }).map(label => label.length > 20 ? label.slice(0, 20) + '...' : label)
        )
        setSectorPercents(
            Object.values(percentPerSector)
            .sort(function(a, b) {
                return a > b ? -1 : ( a < b ? 1 : 0)
            })
        )
    }

    function calculateTotalInvested(data) {
        let tempTotal = 0
        let tempTotalStocks = 0
        let tempTotalETF = 0
        let tempTotalFII = 0

        for (let i in data) {
            if (data[i].type === 'ETF') {
                tempTotalETF += data[i].total
            } else if (data[i].type === 'FII') {
                tempTotalFII += data[i].total
            } else if (data[i].type === 'Ação') {
                tempTotalStocks+= data[i].total
            }

            tempTotal += data[i].total
        }

        setTotal(tempTotal)
        setTotalStocks(tempTotalStocks)
        setTotalETF(tempTotalETF)
        setTotalFII(tempTotalFII)
    }

    function calculatePercentFII(data) {
        const totalPercentFII = {}

        let totalFII = 0

        for(let i in data) {
            if(data[i].type === 'FII') {
                totalFII += data[i].total
            }
        }

        for (let i in data) {
            if(data[i].type === 'FII') {
                if(!totalPercentFII[data[i].subSector]) {
                    totalPercentFII[data[i].subSector] = data[i].total / totalFII * 100
                } else {
                    totalPercentFII[data[i].subSector] += data[i].total / totalFII * 100
                }
            }
        }

        setFIISubSectorLabels(
            Object.keys(totalPercentFII)
            .sort(function(a, b) {
                return totalPercentFII[a] > totalPercentFII[b] ?
                    -1 :
                    ( totalPercentFII[a] < totalPercentFII[b] ? 1 : 0)
            }).map(label => label.length > 20 ? label.slice(0, 20) + '...' : label)
        )
        setFIISubSectorPercents(
            Object.values(totalPercentFII)
            .sort(function(a, b) {
                return a > b ? -1 : ( a < b ? 1 : 0)
            })
        )
    }

    function calculatePercentETF(data) {
        const totalPercentETF = {}

        let totalETF = 0

        for(let i in data) {
            if(data[i].type === 'ETF') {
                totalETF += data[i].total
            }
        }

        for (let i in data) {
            if(data[i].type === 'ETF') {
                if(!totalPercentETF[data[i].subSector]) {
                    totalPercentETF[data[i].subSector] = data[i].total / totalETF * 100
                } else {
                    totalPercentETF[data[i].subSector] += data[i].total / totalETF * 100
                }
            }
        }

        setETFSubSectorLabels(
            Object.keys(totalPercentETF)
            .sort(function(a, b) {
                return totalPercentETF[a] > totalPercentETF[b] ?
                    -1 :
                    ( totalPercentETF[a] < totalPercentETF[b] ? 1 : 0)
            }).map(label => label.length > 20 ? label.slice(0, 20) + '...' : label)
        )
        setETFSubSectorPercents(
            Object.values(totalPercentETF)
            .sort(function(a, b) {
                return a > b ? -1 : ( a < b ? 1 : 0)
            })
        )
    }

    useEffect(() => {

        async function getData() {
            let data = await api.get('/ticker', { headers: { Authorization: user_id }})
                .then(response => response.data)

            data = await stocksDetails(data)

            localStorage.setItem('stocks', JSON.stringify(data))
            localStorage.setItem('updated_at', Date.now())

            calculatePercentPerSector(data)
            calculatePercentDiscrepance(data)
            calculateTotalInvested(data)
            calculatePercentFII(data)
            calculatePercentETF(data)
        }

        if(!localStorage.getItem('stocks') || (Date.now() - localStorage.getItem('updated_at')) > 1000*60*5) {
            getData()
        } else {
            const data = JSON.parse(localStorage.getItem('stocks'))

            calculatePercentPerSector(data)
            calculatePercentDiscrepance(data)
            calculateTotalInvested(data)
            calculatePercentFII(data)
            calculatePercentETF(data)
        }

        const interval = setInterval(async () => {
            getData()

        }, 1000*60*5)

        return() => {
            clearInterval(interval)
        }

    }, [user_id, history])

    return (
        <Fragment>
            <div className="dashboard">
                <ul>
                    <li className="number-information rowspan-3">
                        <h1>Total Investido</h1>
                        <p>{ Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total) }</p>
                    </li>
                    <li className="number-information p-size-26">
                    <h1>Ações</h1>
                    <p>{ Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalStocks) }</p>
                    </li>
                    <MediaQuery minWidth={768}>
                        <li className="colspan-2 rowspan-3">
                            <Pie
                                data={{
                                    labels: sectorLabels,
                                    datasets: [{
                                        label: 'Porcentagem Atual',
                                        data: sectorPercents,
                                        backgroundColor: backgroundPieColor.filter((color, index) => index % parseInt(backgroundPieColor.length / sectorLabels.length) === 0)
                                    }]
                                }}
                                options = {{
                                    title: {
                                        display: true,
                                        text: 'Porcentagem Atual por Setor',
                                        fontSize: 22,
                                        fontFamily: 'Roboto, sans-serif',
                                        fontColor: '#95a5bb',
                                        fontStyle: '400',
                                        padding: 20
                                    },
                                    legend: {
                                        display: true,
                                        position: 'left'
                                    },
                                    tooltips: {
                                        callbacks: {
                                            label: (tooltipItem, data) => {
                                                const value = data.datasets[0].data[tooltipItem.index]
                                                return `${value.toFixed(2)} %`.replace('.', ',')
                                            },
                                            title: (tooltipItem, data) => {
                                                return data.labels[tooltipItem[0].index]
                                            }
                                        }
                                    }
                                }}
                            />
                        </li>
                        <li className="number-information p-size-26">
                            <h1>ETF</h1>
                            <p>{ Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalETF) }</p>
                        </li>
                        <li className="number-information p-size-26">
                            <h1>FII</h1>
                            <p>{ Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalFII) }</p>
                        </li>
                        <li className="colspan-2 rowspan-3">
                            <Pie
                                data={{
                                    labels: FIISubSectorLabels,
                                    datasets: [{
                                        label: 'Porcentagem Atual',
                                        data: FIISubSectorPercents,
                                        backgroundColor: backgroundPieColor.filter((color, index) => index % parseInt(backgroundPieColor.length / FIISubSectorLabels.length) === 0)
                                    }]
                                }}
                                options = {{
                                    title: {
                                        display: true,
                                        text: 'Porcentagem por Setor de FII',
                                        fontSize: 22,
                                        fontFamily: 'Roboto, sans-serif',
                                        fontColor: '#95a5bb',
                                        fontStyle: '400',
                                        padding: 20
                                    },
                                    legend: {
                                        display: true,
                                        position: 'left'
                                    },
                                    tooltips: {
                                        callbacks: {
                                            label: (tooltipItem, data) => {
                                                const value = data.datasets[0].data[tooltipItem.index]
                                                return `${value.toFixed(2)} %`.replace('.', ',')
                                            },
                                            title: (tooltipItem, data) => {
                                                return data.labels[tooltipItem[0].index]
                                            }
                                        }
                                    }
                                }}
                            />
                        </li>
                        <li className="colspan-2 rowspan-3">
                            <Pie
                                data={{
                                    labels: ETFSubSectorLabels,
                                    datasets: [{
                                        label: 'Porcentagem Atual',
                                        data: ETFSubSectorPercents,
                                        backgroundColor: backgroundPieColor.filter((color, index) => index % parseInt(backgroundPieColor.length / ETFSubSectorLabels.length) === 0)
                                    }]
                                }}
                                options = {{
                                    title: {
                                        display: true,
                                        text: 'Porcentagem por Setor de ETF',
                                        fontSize: 22,
                                        fontFamily: 'Roboto, sans-serif',
                                        fontColor: '#95a5bb',
                                        fontStyle: '400',
                                        padding: 20
                                    },
                                    legend: {
                                        display: true,
                                        position: 'left'
                                    },
                                    tooltips: {
                                        callbacks: {
                                            label: (tooltipItem, data) => {
                                                const value = data.datasets[0].data[tooltipItem.index]
                                                return `${value.toFixed(2)} %`.replace('.', ',')
                                            },
                                            title: (tooltipItem, data) => {
                                                return data.labels[tooltipItem[0].index]
                                            }
                                        }
                                    }
                                }}
                            />
                        </li>
                        <li className="colspan-4">
                            <HorizontalBar
                                data={{
                                    labels: stocksLabels,
                                    datasets: [{
                                        label: 'Porcentagem Atual',
                                        data: stocksPercents,
                                        backgroundColor: backgroundBarColor.filter((color, index) => index % parseInt(backgroundBarColor.length / stocksLabels.length) === 0)
                                    }]
                                }}
                                options = {{
                                    title: {
                                        display: true,
                                        text: 'Discrepância entre Porcentagem Atual e Ideal',
                                        fontSize: 22,
                                        fontFamily: 'Roboto, sans-serif',
                                        fontColor: '#95a5bb',
                                        fontStyle: '400',
                                        padding: 20
                                    },
                                    legend: {
                                        display: false
                                    },
                                    tooltips: {
                                        callbacks: {
                                            label: (tooltipItem, data) => {
                                                const value = data.datasets[0].data[tooltipItem.index]
                                                return `${value.toFixed(2)} %`.replace('.', ',')
                                            },
                                            title: (tooltipItem, data) => {
                                                return data.labels[tooltipItem[0].index]
                                            }
                                        }
                                    }
                                }}
                            />
                        </li>
                    </MediaQuery>
                    <MediaQuery maxWidth={768}>
                        <li className="number-information p-size-26">
                            <h1>ETF</h1>
                            <p>{ Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalETF) }</p>
                        </li>
                        <li className="number-information p-size-26">
                            <h1>FII</h1>
                            <p>{ Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalFII) }</p>
                        </li>
                        <li className="colspan-2 rowspan-3">
                            <Pie
                                width={170}
                                data={{
                                    labels: sectorLabels,
                                    datasets: [{
                                        label: 'Porcentagem Atual',
                                        data: sectorPercents,
                                        backgroundColor: backgroundPieColor.filter((color, index) => index % parseInt(backgroundPieColor.length / sectorLabels.length) === 0)
                                    }]
                                }}
                                options = {{
                                    title: {
                                        display: true,
                                        text: 'Porcentagem Atual por Setor',
                                        fontSize: 22,
                                        fontFamily: 'Roboto, sans-serif',
                                        fontColor: '#95a5bb',
                                        fontStyle: '400',
                                        padding: 20
                                    },
                                    legend: {
                                        display: false
                                    },
                                    tooltips: {
                                        callbacks: {
                                            label: (tooltipItem, data) => {
                                                const value = data.datasets[0].data[tooltipItem.index]
                                                return `${value.toFixed(2)} %`.replace('.', ',')
                                            },
                                            title: (tooltipItem, data) => {
                                                return data.labels[tooltipItem[0].index]
                                            }
                                        }
                                    }
                                }}
                            />
                        </li>
                        <li className="colspan-2 rowspan-3">
                            <Pie
                                width={170}
                                data={{
                                    labels: FIISubSectorLabels,
                                    datasets: [{
                                        label: 'Porcentagem Atual',
                                        data: FIISubSectorPercents,
                                        backgroundColor: backgroundPieColor.filter((color, index) => index % parseInt(backgroundPieColor.length / FIISubSectorLabels.length) === 0)
                                    }]
                                }}
                                options = {{
                                    title: {
                                        display: true,
                                        text: 'Porcentagem por Setor de FII',
                                        fontSize: 22,
                                        fontFamily: 'Roboto, sans-serif',
                                        fontColor: '#95a5bb',
                                        fontStyle: '400',
                                        padding: 20
                                    },
                                    legend: {
                                        display: false
                                    },
                                    tooltips: {
                                        callbacks: {
                                            label: (tooltipItem, data) => {
                                                const value = data.datasets[0].data[tooltipItem.index]
                                                return `${value.toFixed(2)} %`.replace('.', ',')
                                            },
                                            title: (tooltipItem, data) => {
                                                return data.labels[tooltipItem[0].index]
                                            }
                                        }
                                    }
                                }}
                            />
                        </li>
                        <li className="colspan-2 rowspan-3">
                            <Pie
                                width={170}
                                data={{
                                    labels: ETFSubSectorLabels,
                                    datasets: [{
                                        label: 'Porcentagem Atual',
                                        data: ETFSubSectorPercents,
                                        backgroundColor: backgroundPieColor.filter((color, index) => index % parseInt(backgroundPieColor.length / ETFSubSectorLabels.length) === 0)
                                    }]
                                }}
                                options = {{
                                    title: {
                                        display: true,
                                        text: 'Porcentagem por Setor de ETF',
                                        fontSize: 22,
                                        fontFamily: 'Roboto, sans-serif',
                                        fontColor: '#95a5bb',
                                        fontStyle: '400',
                                        padding: 20
                                    },
                                    legend: {
                                        display: false
                                    },
                                    tooltips: {
                                        callbacks: {
                                            label: (tooltipItem, data) => {
                                                const value = data.datasets[0].data[tooltipItem.index]
                                                return `${value.toFixed(2)} %`.replace('.', ',')
                                            },
                                            title: (tooltipItem, data) => {
                                                return data.labels[tooltipItem[0].index]
                                            }
                                        }
                                    }
                                }}
                            />
                        </li>
                        <li className="colspan-4">
                            <HorizontalBar
                                height={280}
                                data={{
                                    labels: stocksLabels,
                                    datasets: [{
                                        label: 'Porcentagem Atual',
                                        data: stocksPercents,
                                        backgroundColor: backgroundBarColor.filter((color, index) => index % parseInt(backgroundBarColor.length / stocksLabels.length) === 0)
                                    }]
                                }}
                                options = {{
                                    title: {
                                        display: true,
                                        text: 'Discrepância entre Porcentagem Atual e Ideal',
                                        fontSize: 22,
                                        fontFamily: 'Roboto, sans-serif',
                                        fontColor: '#95a5bb',
                                        fontStyle: '400',
                                        padding: 20
                                    },
                                    legend: {
                                        display: false
                                    },
                                    tooltips: {
                                        callbacks: {
                                            label: (tooltipItem, data) => {
                                                const value = data.datasets[0].data[tooltipItem.index]
                                                return `${value.toFixed(2)} %`.replace('.', ',')
                                            },
                                            title: (tooltipItem, data) => {
                                                return data.labels[tooltipItem[0].index]
                                            }
                                        }
                                    }
                                }}
                            />
                        </li>
                    </MediaQuery>
                </ul>
            </div>
        </Fragment>
    )
}
