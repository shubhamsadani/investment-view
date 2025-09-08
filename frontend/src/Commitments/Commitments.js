import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "react-router";
import styled from "styled-components";
import { Loader } from "../Loader/Loader";
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const colorPalette = [
    '#42A5F5', // Blue
    '#66BB6A', // Green
    '#FFA726', // Orange
    '#EF5350', // Red
    '#AB47BC', // Purple
    '#7E57C2', // Deep Purple
    '#26A69A', // Teal
    '#FFD54F', // Amber
    '#BDBDBD', // Grey
    '#78909C', // Blue Grey
];

const generateColors = (numColors) => {
    const colors = [];
    for (let i = 0; i < numColors; i++) {
        colors.push(colorPalette[i % colorPalette.length]);
    }
    return colors;
};

const URL = process.env.REACT_APP_API_URL;

const columnNames = ['ID', 'Asset Class', 'Currency', 'Amount'];

const Commitments = () => {
    const { investorId } = useParams();
    const [commitments, setCommitments] = useState([]);
    const [visibleComments, setVisibleCommitments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [assetClasses, setAssetClasses] = useState([]);
    const [selectedAssetClass, setSelectedAssetClass] = useState('All');

    const getCommitments = useCallback(async () => {
        setLoading(true);
        const response = await fetch(`${URL}investor/${investorId}`);
        const data = await response.json();
        setCommitments(data.commitments);
        setVisibleCommitments(data.commitments);
        setLoading(false);
    }, [investorId]);

    const formatter = new Intl.NumberFormat('en-US', {
        notation: 'compact',
        compactDisplay: 'short',
        maximumFractionDigits: 2,
    });

    useEffect(() => {
        getCommitments();
    }, [getCommitments]);

    useEffect(() => {
        if (commitments.length > 0) {
            const assetClassMap = {};
            commitments.forEach(commitment => {
                const assetClass = commitment.asset_class;
                if (!assetClassMap[assetClass]) {
                    assetClassMap[assetClass] = 0;
                }
                assetClassMap[assetClass] += commitment.amount;
            });
            const assetClassArray = Object.keys(assetClassMap).map(key => ({
                name: key,
                totalAmount: assetClassMap[key]
            }));
            setAssetClasses(assetClassArray);
        }
    }, [commitments]);

    const totalCommitmentAmount = commitments.reduce((acc, curr) => acc + curr.amount, 0);

    const thresholdPercentage = 0.01; // 1% threshold

    const assetClassesForChart = useMemo(() => {
        const newAssetClasses = [];
        let otherAmount = 0;

        const sortedAssetClasses = [...assetClasses].sort((a, b) => b.totalAmount - a.totalAmount);

        sortedAssetClasses.forEach(ac => {
            if (ac.totalAmount / totalCommitmentAmount < thresholdPercentage && totalCommitmentAmount > 0) {
                otherAmount += ac.totalAmount;
            } else {
                newAssetClasses.push(ac);
            }
        });

        if (otherAmount > 0) {
            newAssetClasses.push({ name: 'Other', totalAmount: otherAmount });
        }

        return newAssetClasses;
    }, [assetClasses, totalCommitmentAmount]);

    const currentChartData = useMemo(() => {
        if (selectedAssetClass === 'All') {
            return assetClassesForChart;
        } else {
            const selected = assetClassesForChart.find(ac => ac.name === selectedAssetClass);
            return selected ? [selected] : [];
        }
    }, [selectedAssetClass, assetClassesForChart]);

    const chartData = {
        labels: currentChartData.map(ac => ac.name),
        datasets: [
            {
                data: currentChartData.map(ac => ac.totalAmount),
                backgroundColor: generateColors(currentChartData.length),
                hoverBackgroundColor: generateColors(currentChartData.length),
            },
        ],
    };

    const currentChartTotalAmount = currentChartData.reduce((acc, curr) => acc + curr.totalAmount, 0);

    useEffect(() => {
        if (selectedAssetClass === 'All') {
            setVisibleCommitments(commitments);
        } else {
            setVisibleCommitments(commitments.filter(commitment => commitment.asset_class.toLowerCase() === selectedAssetClass.toLowerCase()));
        }
    }, [selectedAssetClass, commitments]);

    const handleAssetClassClick = (assetClass) => {
        setSelectedAssetClass(assetClass);
    }

    if (loading) {
        return (
            <LoaderWrapper>
                <Loader data-testid="loader" />
            </LoaderWrapper>
        )
    }

    return (
        <CommimentsContainer>
            <Header>Commitments</Header>
            <AssetClassButtons>
                <AssetClassButton
                    onClick={() => handleAssetClassClick('All')}
                    isSelected={'All' === selectedAssetClass}
                >
                    All ({formatter.format(commitments.reduce((acc, curr) => acc + curr.amount, 0))})
                </AssetClassButton>
                {assetClasses.map(assetClass => (
                    <AssetClassButton
                        key={assetClass.name}
                        onClick={() => handleAssetClassClick(assetClass.name)}
                        isSelected={assetClass.name === selectedAssetClass}
                    >
                        {assetClass.name} ({formatter.format(assetClass.totalAmount)})
                    </AssetClassButton>
                ))}
            </AssetClassButtons>
            <ChartContainer>
                <Doughnut 
                    data={chartData}
                    options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'right',
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        let label = context.label || '';
                                        if (label) {
                                            label += ': ';
                                        }
                                        if (context.parsed !== null) {
                                            label += formatter.format(context.parsed) + ' (' + (context.parsed / currentChartTotalAmount * 100).toFixed(2) + '%)';
                                        }
                                        return label;
                                    }
                                }
                            }
                        },
                    }}
                />
            </ChartContainer>
            <Table>
                <TableRow isHeading>{columnNames.map(item => <TableHeading>{item}</TableHeading>)}</TableRow>
                {
                    visibleComments.map(commitment => (
                        <TableRow>
                            <TableDetails>{commitment.id}</TableDetails>
                            <TableDetails>{commitment.asset_class}</TableDetails>
                            <TableDetails>{commitment.currency}</TableDetails>
                            <TableDetails>{formatter.format(commitment.amount)}</TableDetails>
                        </TableRow>
                    ))
                }
            </Table>
        </CommimentsContainer>
    );
};

export default Commitments;

const CommimentsContainer = styled.div`
    display: flex;
    width: 100%;
    max-width: 1200px;
    flex-direction: column;
    font-family: 'Fira Sans';
`;

const LoaderWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
`;

const Header = styled.div`
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 2rem;
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1rem;
`;
        
const TableRow = styled.tr`
    &:hover{
        background-color: ${({ isHeading }) => isHeading ? 'none' : '#EDF5FF'};    
        cursor: ${({ isHeading }) => isHeading ? 'default' : 'pointer'};
    }
`;

const TableHeading = styled.th`
    font-weight: 600;
    text-align: center;
    padding: 8px;
    border-bottom: 1px solid #DDD;
`;
    
const TableDetails = styled.td`
    font-weight: 400;
    text-align: center;
    padding: 8px;
    border-bottom: 1px solid #DDD;
`;

const AssetClassButtons = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 20px;
`;

const AssetClassButton = styled.button`
    padding: 10px 15px;
    border: 1px solid #CCC;
    border-radius: 5px;
    background-color: ${({ isSelected }) => (isSelected ? '#007bff' : '#f8f8f8')};
    color: ${({ isSelected }) => (isSelected ? 'white' : 'black')};
    cursor: pointer;
    &:hover {
        background-color: ${({ isSelected }) => (isSelected ? '#0056b3' : '#e0e0e0')};
    }
`;

const ChartContainer = styled.div`
    width: 60%;
    min-width: 400px;
    height: 400px;
    margin: 20px auto;
`;